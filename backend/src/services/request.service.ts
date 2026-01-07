import { RequestRepository } from '../repositories/request.repository';
import { UserRepository } from '../repositories/user.repository';
import { Errors } from '../utils/errors';
import { getMinutesBetween } from '../utils/time';
import { CreateRequestInput } from '../validators/request';
import { prisma } from '../config/prisma';

/**
 * 申请服务
 */
export class RequestService {
  private requestRepo: RequestRepository;
  private userRepo: UserRepository;

  constructor() {
    this.requestRepo = new RequestRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * 创建申请
   */
  async createRequest(userId: number, orgId: number, input: CreateRequestInput) {
    const startAt = new Date(input.startAt);
    const endAt = input.endAt ? new Date(input.endAt) : new Date(input.startAt);

    // 验证时间
    if (startAt >= endAt) {
      throw Errors.INVALID_PUNCH_TIME();
    }

    // 检查时间冲突
    const conflict = await this.requestRepo.checkTimeConflict(
      userId,
      orgId,
      startAt,
      endAt
    );

    if (conflict) {
      throw Errors.REQUEST_CONFLICT();
    }

    // 计算时长
    const durationMinutes = getMinutesBetween(startAt, endAt);

    // 生成标题
    let title: string | undefined;
    if (input.requestType === 'LEAVE') {
      title = `${input.leaveCategory || '请假'}-${Math.round(durationMinutes / 60 / 8)}天`;
    } else if (input.requestType === 'TRIP') {
      title = `出差-${input.destination || '未知地点'}`;
    } else if (input.requestType === 'FIX_PUNCH') {
      // 补卡标题：根据时间范围判断是补上班还是下班
      // 如果开始时间在早上（9点前），通常是补上班；如果结束时间在晚上（18点后），通常是补下班
      const startHour = startAt.getHours();
      const endHour = endAt.getHours();
      if (startHour < 9) {
        title = '补上班卡';
      } else if (endHour >= 18) {
        title = '补下班卡';
      } else {
        title = `补卡-${Math.round(durationMinutes / 60)}小时`;
      }
    } else if (input.requestType === 'OVERTIME') {
      title = `加班-${Math.round(durationMinutes / 60)}小时`;
    }

    // 创建申请
    const request = await this.requestRepo.create({
      orgId,
      requesterId: userId,
      requestType: input.requestType,
      startAt,
      endAt,
      durationMinutes,
      title,
      reason: input.reason,
      leaveCategory: input.leaveCategory,
      destination: input.destination,
      // fixPunchDate 和 fixPunchType 已废弃，保留以兼容旧数据
      fixPunchDate: input.fixPunchDate ? new Date(input.fixPunchDate) : undefined,
      fixPunchType: input.fixPunchType,
    });

    // 自动生成审批人
    await this.createApprovalFlow(Number(request.id), userId, orgId);

    return {
      id: Number(request.id),
      requestType: request.requestType,
      title: request.title,
      status: request.status,
      startAt: request.startAt,
      endAt: request.endAt,
    };
  }

  /**
   * 创建审批流程
   */
  private async createApprovalFlow(requestId: number, userId: number, orgId: number) {
    // 查找用户的主管
    const userManager = await prisma.userManager.findUnique({
      where: { employeeId: BigInt(userId) },
      include: {
        manager: true,
      },
    });

    let approverId: bigint;

    if (userManager && userManager.manager.status === 'ACTIVE') {
      // 有主管，使用主管
      approverId = userManager.managerId;
    } else {
      // 没有主管，查找 HR
      const hrRole = await prisma.role.findUnique({
        where: { code: 'HR' },
      });

      if (!hrRole) {
        throw new Error('系统中未找到 HR 角色');
      }

      const hrUser = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          status: 'ACTIVE',
          roles: {
            some: {
              roleId: hrRole.id,
            },
          },
        },
      });

      if (!hrUser) {
        throw new Error('系统中未找到 HR 用户');
      }

      approverId = hrUser.id;
    }

    // 创建审批记录
    await prisma.requestApproval.create({
      data: {
        requestId: BigInt(requestId),
        stepNo: 1,
        approverId,
        decision: 'PENDING',
      },
    });
  }

  /**
   * 获取申请列表
   */
  async getRequests(userId: number, orgId: number, page: number = 1, pageSize: number = 20) {
    const { list, total } = await this.requestRepo.findByUser(userId, orgId, page, pageSize);

    return {
      list: list.map(r => {
        // 如果 durationMinutes 为 null，根据 startAt 和 endAt 计算
        let durationMinutes = r.durationMinutes;
        if (durationMinutes === null || durationMinutes === undefined) {
          const startAt = r.startAt instanceof Date ? r.startAt : new Date(r.startAt);
          const endAt = r.endAt instanceof Date ? r.endAt : new Date(r.endAt);
          durationMinutes = getMinutesBetween(startAt, endAt);
        }

        return {
          id: Number(r.id),
          requestType: r.requestType,
          title: r.title,
          status: r.status,
          startAt: r.startAt instanceof Date ? r.startAt.toISOString() : r.startAt,
          endAt: r.endAt instanceof Date ? r.endAt.toISOString() : r.endAt,
          durationMinutes,
          approvedDurationMinutes: (r as any).approvedDurationMinutes ?? null, // 审批后实际批准的时长
          createdAt: r.createdAt ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt) : new Date().toISOString(),
          approvals: r.approvals.map(a => ({
            stepNo: a.stepNo,
            approver: {
              id: Number(a.approver.id),
              fullName: a.approver.fullName,
            },
            decision: a.decision,
          })),
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取申请详情
   */
  async getRequestById(id: number, userId: number, orgId: number, userRoles?: string[]) {
    const request = await this.requestRepo.findById(id, orgId);

    if (!request) {
      throw Errors.REQUEST_NOT_FOUND();
    }

    // 检查权限：只能查看自己的申请，或审批人/HR/Admin
    const isAdmin = userRoles?.some(role => ['ADMIN', 'HR', 'MANAGER'].includes(role));
    const isRequester = Number(request.requesterId) === userId;
    
    if (!isRequester && !isAdmin) {
      throw Errors.FORBIDDEN();
    }

    return {
      id: Number(request.id),
      requestType: request.requestType,
      title: request.title,
      status: request.status,
      startAt: request.startAt instanceof Date ? request.startAt.toISOString() : request.startAt,
      endAt: request.endAt instanceof Date ? request.endAt.toISOString() : request.endAt,
      durationMinutes: request.durationMinutes,
      approvedDurationMinutes: (request as any).approvedDurationMinutes, // 审批后实际批准的时长
      reason: request.reason,
      leaveCategory: request.leaveCategory,
      destination: request.destination,
      fixPunchDate: request.fixPunchDate instanceof Date ? request.fixPunchDate.toISOString() : request.fixPunchDate,
      fixPunchType: request.fixPunchType,
      requester: {
        id: Number(request.requester.id),
        fullName: request.requester.fullName,
        employeeNo: request.requester.employeeNo,
        department: request.requester.department ? {
          id: Number(request.requester.department.id),
          name: request.requester.department.name,
        } : null,
      },
      approvals: request.approvals.map(a => ({
        id: Number(a.id),
        stepNo: a.stepNo,
        approver: {
          id: Number(a.approver.id),
          fullName: a.approver.fullName,
        },
        decision: a.decision,
        comment: a.comment,
        decidedAt: a.decidedAt instanceof Date ? a.decidedAt.toISOString() : a.decidedAt,
      })),
      attachments: request.attachments.map(att => ({
        id: Number(att.id),
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        mimeType: att.mimeType,
        fileSizeBytes: att.fileSizeBytes ? Number(att.fileSizeBytes) : null,
      })),
      createdAt: request.createdAt ? (request.createdAt instanceof Date ? request.createdAt.toISOString() : request.createdAt) : new Date().toISOString(),
      updatedAt: request.updatedAt ? (request.updatedAt instanceof Date ? request.updatedAt.toISOString() : request.updatedAt) : new Date().toISOString(),
    };
  }

  /**
   * 取消申请
   */
  async cancelRequest(id: number, userId: number, orgId: number) {
    const request = await this.requestRepo.findById(id, orgId);
    
    if (!request) {
      throw Errors.REQUEST_NOT_FOUND();
    }

    if (request.requesterId !== BigInt(userId)) {
      throw Errors.FORBIDDEN();
    }

    if (request.status !== 'PENDING') {
      throw new Error('只能取消待审批的申请');
    }

    const result = await this.requestRepo.cancel(id, userId, orgId);

    if (result.count === 0) {
      throw new Error('取消失败');
    }

    return { success: true };
  }

  /**
   * 添加附件
   */
  async addAttachment(
    requestId: number,
    userId: number,
    orgId: number,
    data: {
      fileName: string;
      fileUrl: string;
      mimeType?: string;
      fileSizeBytes?: number;
    }
  ) {
    const request = await this.requestRepo.findById(requestId, orgId);
    
    if (!request) {
      throw Errors.REQUEST_NOT_FOUND();
    }

    if (request.requesterId !== BigInt(userId)) {
      throw Errors.FORBIDDEN();
    }

    const attachment = await this.requestRepo.addAttachment({
      requestId,
      ...data,
      uploadedBy: userId,
    });

    return {
      id: Number(attachment.id),
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
    };
  }
}




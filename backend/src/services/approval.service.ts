import { RequestRepository } from '../repositories/request.repository';
import { prisma } from '../config/prisma';
import { Errors } from '../utils/errors';

/**
 * 审批服务
 */
export class ApprovalService {
  private requestRepo: RequestRepository;

  constructor() {
    this.requestRepo = new RequestRepository();
  }

  /**
   * 获取待我审批的申请列表
   */
  async getPendingApprovals(approverId: number, orgId: number, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    // 查找待当前用户审批的申请
    const [approvals, total] = await Promise.all([
      prisma.requestApproval.findMany({
        where: {
          approverId: BigInt(approverId),
          decision: 'PENDING',
          request: {
            orgId: BigInt(orgId),
            status: 'PENDING',
          },
        },
        include: {
          request: {
            include: {
              requester: {
                include: {
                  department: true,
                },
              },
              approvals: {
                include: {
                  approver: true,
                },
                orderBy: {
                  stepNo: 'asc',
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.requestApproval.count({
        where: {
          approverId: BigInt(approverId),
          decision: 'PENDING',
          request: {
            orgId: BigInt(orgId),
            status: 'PENDING',
          },
        },
      }),
    ]);

    // 序列化数据
    const list = approvals.map(approval => {
      const request = approval.request;
      return {
        id: Number(request.id),
        requestType: request.requestType,
        title: request.title,
        status: request.status,
        startAt: request.startAt instanceof Date ? request.startAt.toISOString() : request.startAt,
        endAt: request.endAt instanceof Date ? request.endAt.toISOString() : request.endAt,
        reason: request.reason,
        leaveCategory: request.leaveCategory,
        destination: request.destination,
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
        createdAt: request.createdAt ? (request.createdAt instanceof Date ? request.createdAt.toISOString() : request.createdAt) : new Date().toISOString(),
      };
    });

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 审批决策
   */
  async makeDecision(
    requestId: number,
    approverId: number,
    orgId: number,
    decision: 'APPROVED' | 'REJECTED' | 'TRANSFERRED',
    comment?: string,
    transferredTo?: number,
    approvedDurationMinutes?: number // 审批后实际批准的时长（分钟），如果提供则覆盖申请时的时长
  ) {
    // 查找审批记录
    const approval = await prisma.requestApproval.findFirst({
      where: {
        requestId: BigInt(requestId),
        approverId: BigInt(approverId),
        decision: 'PENDING',
      },
      include: {
        request: true,
      },
    });

    if (!approval) {
      throw Errors.APPROVAL_NOT_PENDING();
    }

    // 验证权限
    if (approval.request.orgId !== BigInt(orgId)) {
      throw Errors.ORG_ACCESS_DENIED();
    }

    // 如果是驳回，必须填写原因
    if (decision === 'REJECTED' && !comment) {
      throw Errors.REJECT_REASON_REQUIRED();
    }

    // 更新审批记录
    await prisma.requestApproval.update({
      where: {
        id: approval.id,
      },
      data: {
        decision: decision as any,
        comment: comment || null,
        decidedAt: new Date(),
      },
    });

    // 如果通过，检查是否还有其他待审批的步骤
    if (decision === 'APPROVED') {
      // 如果管理者修改了时长，更新申请的批准时长
      const updateData: any = {};
      if (approvedDurationMinutes !== undefined && approvedDurationMinutes !== null) {
        updateData.approvedDurationMinutes = approvedDurationMinutes;
      }

      const remainingApprovals = await prisma.requestApproval.count({
        where: {
          requestId: BigInt(requestId),
          decision: 'PENDING',
        },
      });

      // 如果没有待审批的步骤了，更新申请状态为已通过
      if (remainingApprovals === 0) {
        updateData.status = 'APPROVED';
        await prisma.request.update({
          where: {
            id: BigInt(requestId),
          },
          data: updateData,
        });
      } else if (Object.keys(updateData).length > 0) {
        // 如果还有待审批的步骤，只更新时长
        await prisma.request.update({
          where: {
            id: BigInt(requestId),
          },
          data: updateData,
        });
      }
    } else if (decision === 'REJECTED') {
      // 如果驳回，更新申请状态为已驳回
      await prisma.request.update({
        where: {
          id: BigInt(requestId),
        },
        data: {
          status: 'REJECTED',
        },
      });
    }

    return { success: true };
  }
}


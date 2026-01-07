import { prisma } from '../config/prisma';
import { RequestStatus, RequestType } from '@prisma/client';

/**
 * 申请数据访问层
 */
export class RequestRepository {
  /**
   * 创建申请
   */
  async create(data: {
    orgId: number;
    requesterId: number;
    requestType: RequestType;
    startAt: Date;
    endAt: Date;
    durationMinutes?: number;
    title?: string;
    reason?: string;
    leaveCategory?: string;
    destination?: string;
    fixPunchDate?: Date;
    fixPunchType?: 'IN' | 'OUT';
  }) {
    return prisma.request.create({
      data: {
        orgId: BigInt(data.orgId),
        requesterId: BigInt(data.requesterId),
        requestType: data.requestType,
        startAt: data.startAt,
        endAt: data.endAt,
        durationMinutes: data.durationMinutes,
        title: data.title,
        reason: data.reason,
        leaveCategory: data.leaveCategory,
        destination: data.destination,
        fixPunchDate: data.fixPunchDate,
        fixPunchType: data.fixPunchType,
        status: 'PENDING',
      },
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
        attachments: true,
      },
    });
  }

  /**
   * 根据 ID 查找申请
   */
  async findById(id: number, orgId?: number) {
    return prisma.request.findFirst({
      where: {
        id: BigInt(id),
        ...(orgId && { orgId: BigInt(orgId) }),
      },
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
        attachments: true,
      },
    });
  }

  /**
   * 获取用户的申请列表
   */
  async findByUser(userId: number, orgId: number, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      prisma.request.findMany({
        where: {
          orgId: BigInt(orgId),
          requesterId: BigInt(userId),
        },
        include: {
          requester: true,
          approvals: {
            include: {
              approver: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.request.count({
        where: {
          orgId: BigInt(orgId),
          requesterId: BigInt(userId),
        },
      }),
    ]);

    return { list, total };
  }

  /**
   * 检查时间冲突
   */
  async checkTimeConflict(
    userId: number,
    orgId: number,
    startAt: Date,
    endAt: Date,
    excludeRequestId?: number
  ) {
    return prisma.request.findFirst({
      where: {
        orgId: BigInt(orgId),
        requesterId: BigInt(userId),
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        id: excludeRequestId ? { not: BigInt(excludeRequestId) } : undefined,
        OR: [
          {
            startAt: { lte: endAt },
            endAt: { gte: startAt },
          },
        ],
      },
    });
  }

  /**
   * 取消申请
   */
  async cancel(id: number, userId: number, orgId: number) {
    return prisma.request.updateMany({
      where: {
        id: BigInt(id),
        orgId: BigInt(orgId),
        requesterId: BigInt(userId),
        status: 'PENDING',
      },
      data: {
        status: 'CANCELED',
      },
    });
  }

  /**
   * 添加附件
   */
  async addAttachment(data: {
    requestId: number;
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    fileSizeBytes?: number;
    uploadedBy: number;
  }) {
    return prisma.requestAttachment.create({
      data: {
        requestId: BigInt(data.requestId),
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes ? BigInt(data.fileSizeBytes) : null,
        uploadedBy: BigInt(data.uploadedBy),
      },
    });
  }
}




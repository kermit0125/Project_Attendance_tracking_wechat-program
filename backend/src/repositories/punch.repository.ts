import { prisma } from '../config/prisma';
import { AttendancePunch, PunchType } from '@prisma/client';
import { getBeijingStartOfDay, getBeijingEndOfDay } from '../utils/timezone';

/**
 * 打卡数据访问层
 */
export class PunchRepository {
  /**
   * 创建打卡记录
   */
  async create(data: {
    orgId: number;
    userId: number;
    punchType: PunchType;
    punchedAt: Date;
    lat?: number;
    lng?: number;
    accuracyM?: number;
    geoFenceId?: number;
    distanceToFenceM?: number;
    inFence?: boolean;
    verifyMethod: string;
    verifyStatus: string;
    evidenceUrl?: string;
    deviceInfo?: string;
    ipAddress?: string;
    scheduleId?: number;
  }) {
    return prisma.attendancePunch.create({
      data: {
        orgId: BigInt(data.orgId),
        userId: BigInt(data.userId),
        punchType: data.punchType,
        punchedAt: data.punchedAt,
        lat: data.lat,
        lng: data.lng,
        accuracyM: data.accuracyM,
        geoFenceId: data.geoFenceId ? BigInt(data.geoFenceId) : null,
        distanceToFenceM: data.distanceToFenceM,
        inFence: data.inFence,
        verifyMethod: data.verifyMethod as any,
        verifyStatus: data.verifyStatus as any,
        evidenceUrl: data.evidenceUrl,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress,
        scheduleId: data.scheduleId ? BigInt(data.scheduleId) : null,
      },
      include: {
        geoFence: true,
        schedule: true,
      },
    });
  }

  /**
   * 获取用户某天的打卡记录（使用北京时间）
   */
  async findByUserAndDate(userId: number, date: Date) {
    const startOfDay = getBeijingStartOfDay(date);
    const endOfDay = getBeijingEndOfDay(date);

    return prisma.attendancePunch.findMany({
      where: {
        userId: BigInt(userId),
        punchedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        geoFence: true,
        schedule: true,
      },
      orderBy: {
        punchedAt: 'asc',
      },
    });
  }

  /**
   * 检查用户今天是否已打过指定类型的卡（使用北京时间）
   */
  async hasPunchedToday(userId: number, punchType: PunchType, date: Date = new Date()) {
    const startOfDay = getBeijingStartOfDay(date);
    const endOfDay = getBeijingEndOfDay(date);

    const count = await prisma.attendancePunch.count({
      where: {
        userId: BigInt(userId),
        punchType,
        punchedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return count > 0;
  }

  /**
   * 获取用户打卡历史
   */
  async getHistory(userId: number, from: Date, to: Date, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    console.log(`查询打卡历史 - 用户ID: ${userId}, 开始: ${from.toISOString()}, 结束: ${to.toISOString()}`);

    const [list, total] = await Promise.all([
      prisma.attendancePunch.findMany({
        where: {
          userId: BigInt(userId),
          punchedAt: {
            gte: from,
            lte: to,
          },
        },
        include: {
          geoFence: true,
          schedule: true,
        },
        orderBy: {
          punchedAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      prisma.attendancePunch.count({
        where: {
          userId: BigInt(userId),
          punchedAt: {
            gte: from,
            lte: to,
          },
        },
      }),
    ]);

    console.log(`查询结果 - 总数: ${total}, 当前页: ${list.length} 条`);
    if (list.length > 0) {
      console.log('记录时间范围:', list.map(p => ({
        id: Number(p.id),
        type: p.punchType,
        time: p.punchedAt.toISOString(),
      })));
    }

    return { list, total };
  }
}

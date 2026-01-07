import { prisma } from '../config/prisma';

/**
 * 工作班次数据访问层
 */
export class WorkScheduleRepository {
  /**
   * 获取组织的默认班次（简化：取第一个）
   */
  async findDefaultByOrg(orgId: number) {
    return prisma.workSchedule.findFirst({
      where: {
        orgId: BigInt(orgId),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * 根据 ID 查找班次
   */
  async findById(id: number, orgId?: number) {
    return prisma.workSchedule.findFirst({
      where: {
        id: BigInt(id),
        ...(orgId && { orgId: BigInt(orgId) }),
      },
    });
  }
}




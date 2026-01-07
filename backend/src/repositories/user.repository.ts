import { prisma } from '../config/prisma';
import { User } from '@prisma/client';

/**
 * 用户数据访问层
 */
export class UserRepository {
  /**
   * 根据邮箱查找用户（包含角色）
   */
  async findByEmailWithRoles(orgId: number, email: string) {
    return prisma.user.findFirst({
      where: {
        orgId: BigInt(orgId),
        email,
        status: 'ACTIVE',
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        department: true,
      },
    });
  }

  /**
   * 根据 ID 查找用户（包含角色）
   */
  async findByIdWithRoles(id: number, orgId?: number) {
    return prisma.user.findFirst({
      where: {
        id: BigInt(id),
        ...(orgId && { orgId: BigInt(orgId) }),
        status: 'ACTIVE',
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        department: true,
        org: true,
      },
    });
  }

  /**
   * 根据 ID 查找用户（简单查询）
   */
  async findById(id: number, orgId?: number): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id: BigInt(id),
        ...(orgId && { orgId: BigInt(orgId) }),
        status: 'ACTIVE',
      },
    });
  }
}




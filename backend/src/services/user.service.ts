import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';

/**
 * 用户管理服务
 */
export class UserService {
  /**
   * 获取用户列表（分页）
   */
  async getUsers(orgId: number, page: number = 1, pageSize: number = 20, keyword?: string) {
    const skip = (page - 1) * pageSize;

    const where: any = {
      orgId: BigInt(orgId),
    };

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { fullName: { contains: keyword } },
        { email: { contains: keyword } },
        { employeeNo: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          department: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    // 格式化数据
    const formattedUsers = users.map((user) => ({
      id: Number(user.id),
      orgId: Number(user.orgId),
      email: user.email,
      phone: user.phone,
      employeeNo: user.employeeNo,
      fullName: user.fullName,
      status: user.status,
      department: user.department ? {
        id: Number(user.department.id),
        name: user.department.name,
      } : null,
      roles: user.roles.map((ur) => ({
        code: ur.role.code,
        name: ur.role.name,
      })),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return {
      list: formattedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取用户详情
   */
  async getUserById(userId: number, orgId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: BigInt(userId),
        orgId: BigInt(orgId),
      },
      include: {
        department: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    return {
      id: Number(user.id),
      orgId: Number(user.orgId),
      email: user.email,
      phone: user.phone,
      employeeNo: user.employeeNo,
      fullName: user.fullName,
      status: user.status,
      department: user.department ? {
        id: Number(user.department.id),
        name: user.department.name,
      } : null,
      roles: user.roles.map((ur) => ({
        code: ur.role.code,
        name: ur.role.name,
      })),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * 创建用户
   */
  async createUser(
    orgId: number,
    data: {
      email: string;
      phone?: string;
      password: string;
      employeeNo?: string;
      fullName: string;
      departmentId?: number;
      roles: string[]; // 角色代码数组，如 ['EMPLOYEE', 'MANAGER']
      status?: 'ACTIVE' | 'INACTIVE';
    }
  ) {
    // 检查邮箱是否已存在
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          email: data.email,
        },
      });

      if (existingUser) {
        throw new ConflictError('该邮箱已被使用');
      }
    }

    // 检查工号是否已存在
    if (data.employeeNo) {
      const existingUser = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          employeeNo: data.employeeNo,
        },
      });

      if (existingUser) {
        throw new ConflictError('该工号已被使用');
      }
    }

    // 检查手机号是否已存在
    if (data.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          phone: data.phone,
        },
      });

      if (existingUser) {
        throw new ConflictError('该手机号已被使用');
      }
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 获取角色ID
    const roles = await prisma.role.findMany({
      where: {
        code: {
          in: data.roles,
        },
      },
    });

    if (roles.length !== data.roles.length) {
      throw new BadRequestError('部分角色不存在');
    }

    // 创建用户
    const user = await prisma.user.create({
      data: {
        orgId: BigInt(orgId),
        email: data.email,
        phone: data.phone,
        passwordHash,
        employeeNo: data.employeeNo,
        fullName: data.fullName,
        departmentId: data.departmentId ? BigInt(data.departmentId) : null,
        status: data.status || 'ACTIVE',
        roles: {
          create: roles.map((role) => ({
            roleId: role.id,
          })),
        },
      },
      include: {
        department: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: Number(user.id),
      orgId: Number(user.orgId),
      email: user.email,
      phone: user.phone,
      employeeNo: user.employeeNo,
      fullName: user.fullName,
      status: user.status,
      department: user.department ? {
        id: Number(user.department.id),
        name: user.department.name,
      } : null,
      roles: user.roles.map((ur) => ({
        code: ur.role.code,
        name: ur.role.name,
      })),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * 更新用户
   */
  async updateUser(
    userId: number,
    orgId: number,
    data: {
      email?: string;
      phone?: string;
      password?: string;
      employeeNo?: string;
      fullName?: string;
      departmentId?: number | null;
      roles?: string[];
      status?: 'ACTIVE' | 'INACTIVE' | 'LEFT';
    }
  ) {
    // 检查用户是否存在
    const existingUser = await prisma.user.findFirst({
      where: {
        id: BigInt(userId),
        orgId: BigInt(orgId),
      },
    });

    if (!existingUser) {
      throw new NotFoundError('用户不存在');
    }

    // 检查邮箱是否被其他用户使用
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          email: data.email,
          id: { not: BigInt(userId) },
        },
      });

      if (emailExists) {
        throw new ConflictError('该邮箱已被使用');
      }
    }

    // 检查工号是否被其他用户使用
    if (data.employeeNo && data.employeeNo !== existingUser.employeeNo) {
      const empNoExists = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          employeeNo: data.employeeNo,
          id: { not: BigInt(userId) },
        },
      });

      if (empNoExists) {
        throw new ConflictError('该工号已被使用');
      }
    }

    // 检查手机号是否被其他用户使用
    if (data.phone && data.phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findFirst({
        where: {
          orgId: BigInt(orgId),
          phone: data.phone,
          id: { not: BigInt(userId) },
        },
      });

      if (phoneExists) {
        throw new ConflictError('该手机号已被使用');
      }
    }

    // 准备更新数据
    const updateData: any = {
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.employeeNo !== undefined && { employeeNo: data.employeeNo }),
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.status !== undefined && { status: data.status }),
    };

    // 处理部门ID（允许设置为null）
    if (data.departmentId !== undefined) {
      updateData.departmentId = data.departmentId ? BigInt(data.departmentId) : null;
    }

    // 如果有密码，加密后更新
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // 更新角色
    if (data.roles) {
      const roles = await prisma.role.findMany({
        where: {
          code: {
            in: data.roles,
          },
        },
      });

      if (roles.length !== data.roles.length) {
        throw new BadRequestError('部分角色不存在');
      }

      // 删除旧角色，添加新角色
      await prisma.userRole.deleteMany({
        where: {
          userId: BigInt(userId),
        },
      });

      await prisma.userRole.createMany({
        data: roles.map((role) => ({
          userId: BigInt(userId),
          roleId: role.id,
        })),
      });
    }

    // 更新用户
    const user = await prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: updateData,
      include: {
        department: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: Number(user.id),
      orgId: Number(user.orgId),
      email: user.email,
      phone: user.phone,
      employeeNo: user.employeeNo,
      fullName: user.fullName,
      status: user.status,
      department: user.department ? {
        id: Number(user.department.id),
        name: user.department.name,
      } : null,
      roles: user.roles.map((ur) => ({
        code: ur.role.code,
        name: ur.role.name,
      })),
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * 删除用户（软删除，设置状态为 LEFT）
   */
  async deleteUser(userId: number, orgId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: BigInt(userId),
        orgId: BigInt(orgId),
      },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    await prisma.user.update({
      where: {
        id: BigInt(userId),
      },
      data: {
        status: 'LEFT',
      },
    });

    return { message: '用户已删除' };
  }

  /**
   * 获取所有部门列表
   */
  async getDepartments(orgId: number) {
    const departments = await prisma.department.findMany({
      where: {
        orgId: BigInt(orgId),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return departments.map((dept) => ({
      id: Number(dept.id),
      name: dept.name,
      parentId: dept.parentId ? Number(dept.parentId) : null,
    }));
  }

  /**
   * 获取所有角色列表
   */
  async getRoles() {
    const roles = await prisma.role.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return roles.map((role) => ({
      id: Number(role.id),
      code: role.code,
      name: role.name,
    }));
  }
}


import * as bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { UserRepository } from '../repositories/user.repository';
import { Errors } from '../utils/errors';
import { JWTPayload } from '../middlewares/auth';

/**
 * 认证服务
 */
export class AuthService {
  private userRepo: UserRepository;

  constructor(private fastify: FastifyInstance) {
    this.userRepo = new UserRepository();
  }

  /**
   * 用户登录
   */
  async login(email: string, password: string, orgId: number) {
    // 查找用户
    const user = await this.userRepo.findByEmailWithRoles(orgId, email);
    
    if (!user || !user.passwordHash) {
      throw Errors.INVALID_CREDENTIALS();
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw Errors.INVALID_CREDENTIALS();
    }

    // 获取用户角色
    const roles = user.roles.map(ur => ur.role.code);

    // 生成 JWT
    const payload: JWTPayload = {
      userId: Number(user.id),
      orgId: Number(user.orgId),
      roles,
    };

    const token = this.fastify.jwt.sign(payload);

    // 序列化用户数据 - 确保所有 BigInt 都转换为 Number
    const userData = {
      id: Number(user.id),
      email: user.email || null,
      fullName: user.fullName,
      employeeNo: user.employeeNo || null,
      department: user.department ? user.department.name : null,
      status: user.status,
      roles,
    };

    console.log('登录成功，返回用户数据:', JSON.stringify(userData, null, 2));

    return {
      token,
      user: userData,
    };
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: number, orgId: number) {
    const user = await this.userRepo.findByIdWithRoles(userId, orgId);
    
    if (!user) {
      throw Errors.USER_NOT_FOUND();
    }

    const roles = user.roles.map(ur => ur.role.code);

    return {
      id: Number(user.id),
      orgId: Number(user.orgId),
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      employeeNo: user.employeeNo,
      status: user.status,
      department: user.department ? {
        id: Number(user.department.id),
        name: user.department.name,
      } : null,
      org: {
        id: Number(user.org.id),
        name: user.org.name,
      },
      roles,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    };
  }
}

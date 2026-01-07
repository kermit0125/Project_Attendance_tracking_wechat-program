import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';

const userService = new UserService();

/**
 * 用户管理控制器
 */
export class UserController {
  /**
   * 获取用户列表
   */
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { page = 1, pageSize = 20, keyword } = request.query as any;

    const result = await userService.getUsers(
      orgId,
      Number(page),
      Number(pageSize),
      keyword
    );

    return reply.send({
      code: 'SUCCESS',
      message: '获取用户列表成功',
      data: result,
    });
  }

  /**
   * 获取用户详情
   */
  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { id } = request.params as any;

    const user = await userService.getUserById(Number(id), orgId);

    return reply.send({
      code: 'SUCCESS',
      message: '获取用户详情成功',
      data: user,
    });
  }

  /**
   * 创建用户
   */
  static async createUser(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const data = request.body as any;

    const user = await userService.createUser(orgId, data);

    return reply.code(201).send({
      code: 'SUCCESS',
      message: '创建用户成功',
      data: user,
    });
  }

  /**
   * 更新用户
   */
  static async updateUser(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { id } = request.params as any;
    const data = request.body as any;

    const user = await userService.updateUser(Number(id), orgId, data);

    return reply.send({
      code: 'SUCCESS',
      message: '更新用户成功',
      data: user,
    });
  }

  /**
   * 删除用户
   */
  static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { id } = request.params as any;

    const result = await userService.deleteUser(Number(id), orgId);

    return reply.send({
      code: 'SUCCESS',
      message: result.message,
      data: null,
    });
  }

  /**
   * 获取部门列表
   */
  static async getDepartments(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;

    const departments = await userService.getDepartments(orgId);

    return reply.send({
      code: 'SUCCESS',
      message: '获取部门列表成功',
      data: departments,
    });
  }

  /**
   * 获取角色列表
   */
  static async getRoles(request: FastifyRequest, reply: FastifyReply) {
    const roles = await userService.getRoles();

    return reply.send({
      code: 'SUCCESS',
      message: '获取角色列表成功',
      data: roles,
    });
  }
}


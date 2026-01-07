import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { loginSchema } from '../validators/auth';
import { getCurrentUser } from '../middlewares/auth';
import { FastifyInstance } from 'fastify';

/**
 * 认证控制器
 */
export class AuthController {
  private authService: AuthService;

  constructor(private fastify: FastifyInstance) {
    this.authService = new AuthService(fastify);
  }

  /**
   * 用户登录
   */
  async login(request: FastifyRequest<{
    Body: { email: string; password: string };
  }>, reply: FastifyReply) {
    // 验证参数
    const body = loginSchema.parse(request.body);

    // 尝试查找组织（简化：先假设所有用户在同一组织，或从邮箱域名推断）
    // 实际项目中可能需要先选择组织，这里简化处理
    // TODO: 根据业务需求调整组织查找逻辑
    const orgId = 1; // 临时硬编码，实际应从请求中获取或数据库查询

    const result = await this.authService.login(body.email, body.password, orgId);

    console.log('控制器收到的登录结果:', JSON.stringify(result, null, 2));

    const response = {
      code: 'SUCCESS',
      message: '登录成功',
      data: result,
    };

    console.log('控制器返回的登录响应:', JSON.stringify(response, null, 2));

    return reply.send(response);
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const user = getCurrentUser(request);
    const result = await this.authService.getCurrentUser(user.userId, user.orgId);

    console.log('控制器收到的用户数据:', JSON.stringify(result, null, 2));

    const response = {
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    };

    console.log('控制器返回的响应:', JSON.stringify(response, null, 2));

    return reply.send(response);
  }
}




import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './error-handler';

/**
 * JWT 载荷接口
 */
export interface JWTPayload {
  userId: number;
  orgId: number;
  roles: string[];
}

/**
 * 扩展请求接口，包含用户信息
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: JWTPayload;
}

/**
 * JWT 鉴权中间件
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // jwtVerify 默认从 Authorization header 读取 Bearer token
    await request.jwtVerify();
  } catch (err: any) {
    // 记录详细错误信息以便调试
    if (err.message) {
      console.error('JWT 验证失败:', err.message);
    }
    throw new AppError('UNAUTHORIZED', '未授权，请先登录', 401);
  }
}

/**
 * 从请求中获取当前用户信息
 */
export function getCurrentUser(request: FastifyRequest): JWTPayload {
  const user = (request as AuthenticatedRequest).user;
  if (!user) {
    throw new AppError('UNAUTHORIZED', '未授权，请先登录', 401);
  }
  return user;
}




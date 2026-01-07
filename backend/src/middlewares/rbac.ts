import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './error-handler';
import { getCurrentUser, AuthenticatedRequest } from './auth';

/**
 * 角色类型
 */
export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';

/**
 * RBAC 权限检查中间件
 * @param allowedRoles 允许访问的角色列表
 */
export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getCurrentUser(request);
    
    // 检查用户是否拥有允许的角色
    const hasRole = user.roles.some(role => allowedRoles.includes(role as Role));
    
    if (!hasRole) {
      throw new AppError(
        'FORBIDDEN',
        '无权限访问该资源',
        403
      );
    }
  };
}

/**
 * 检查用户是否是管理员或 HR
 */
export function requireAdminOrHR() {
  return requireRole('ADMIN', 'HR');
}

/**
 * 检查用户是否是主管、HR 或管理员
 */
export function requireManagerOrAbove() {
  return requireRole('MANAGER', 'HR', 'ADMIN');
}

/**
 * 检查数据隔离：确保用户只能访问自己组织的数据
 */
export function checkOrgAccess(userOrgId: number, resourceOrgId: number | bigint) {
  if (userOrgId !== Number(resourceOrgId)) {
    throw new AppError(
      'FORBIDDEN',
      '无权限访问该资源（组织隔离）',
      403
    );
  }
}

/**
 * 从请求中获取组织 ID（用于数据隔离）
 */
export function getOrgId(request: FastifyRequest): number {
  const user = getCurrentUser(request);
  return user.orgId;
}




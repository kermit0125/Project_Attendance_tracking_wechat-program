import { AppError } from '../middlewares/error-handler';

/**
 * 便捷错误类
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super('NOT_FOUND', message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super('BAD_REQUEST', message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super('CONFLICT', message, 409);
  }
}

/**
 * 常用错误定义
 */
export const Errors = {
  // 认证相关
  UNAUTHORIZED: () => new AppError('UNAUTHORIZED', '未授权，请先登录', 401),
  INVALID_CREDENTIALS: () => new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401),
  
  // 权限相关
  FORBIDDEN: () => new AppError('FORBIDDEN', '无权限访问该资源', 403),
  ORG_ACCESS_DENIED: () => new AppError('ORG_ACCESS_DENIED', '无权限访问该资源（组织隔离）', 403),
  
  // 资源不存在
  USER_NOT_FOUND: () => new AppError('USER_NOT_FOUND', '用户不存在', 404),
  REQUEST_NOT_FOUND: () => new AppError('REQUEST_NOT_FOUND', '申请不存在', 404),
  PUNCH_NOT_FOUND: () => new AppError('PUNCH_NOT_FOUND', '打卡记录不存在', 404),
  GEO_FENCE_NOT_FOUND: () => new AppError('GEO_FENCE_NOT_FOUND', '地理围栏不存在', 404),
  
  // 业务逻辑错误
  ALREADY_PUNCHED: (type: 'IN' | 'OUT') => 
    new AppError('ALREADY_PUNCHED', `今天已经打过${type === 'IN' ? '上班' : '下班'}卡了`, 409),
  REQUEST_CONFLICT: () => 
    new AppError('REQUEST_CONFLICT', '申请时间与其他申请冲突', 409),
  INVALID_PUNCH_TIME: () => 
    new AppError('INVALID_PUNCH_TIME', '打卡时间不合法', 400),
  OUTSIDE_FENCE: () => 
    new AppError('OUTSIDE_FENCE', '不在允许的打卡范围内', 400),
  LOCATION_DENIED: () => 
    new AppError('LOCATION_DENIED', '未授权定位权限', 400),
  
  // 审批相关
  APPROVAL_NOT_PENDING: () => 
    new AppError('APPROVAL_NOT_PENDING', '该申请已处理，无法重复审批', 400),
  CANNOT_APPROVE_OWN_REQUEST: () => 
    new AppError('CANNOT_APPROVE_OWN_REQUEST', '不能审批自己的申请', 400),
  REJECT_REASON_REQUIRED: () => 
    new AppError('REJECT_REASON_REQUIRED', '驳回时必须填写原因', 400),
};




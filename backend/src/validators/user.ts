import { z } from 'zod';

/**
 * 创建用户验证
 */
export const createUserSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().optional(),
  password: z.string().min(6, '密码至少6位'),
  employeeNo: z.string().optional(),
  fullName: z.string().min(1, '姓名不能为空'),
  departmentId: z.number().optional(),
  roles: z.array(z.string()).min(1, '至少选择一个角色'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

/**
 * 更新用户验证
 */
export const updateUserSchema = z.object({
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(),
  password: z.string().min(6, '密码至少6位').optional(),
  employeeNo: z.string().optional(),
  fullName: z.string().min(1, '姓名不能为空').optional(),
  departmentId: z.number().nullable().optional(),
  roles: z.array(z.string()).min(1, '至少选择一个角色').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEFT']).optional(),
});


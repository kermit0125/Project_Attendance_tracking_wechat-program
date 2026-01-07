import { z } from 'zod';

/**
 * 登录请求验证
 */
export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
});

export type LoginInput = z.infer<typeof loginSchema>;




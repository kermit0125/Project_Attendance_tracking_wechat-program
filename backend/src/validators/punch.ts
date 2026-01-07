import { z } from 'zod';

/**
 * 打卡请求验证
 */
export const punchSchema = z.object({
  punchType: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: '打卡类型必须是 IN 或 OUT' }),
  }),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  accuracyM: z.number().int().positive().optional(),
  verifyMethod: z.enum(['NONE', 'PHOTO', 'FACE', 'LIVENESS']).default('PHOTO'),
  evidenceUrl: z.string().url().optional(),
  deviceInfo: z.string().optional(),
});

export type PunchInput = z.infer<typeof punchSchema>;




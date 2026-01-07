import { z } from 'zod';

/**
 * 创建申请请求验证
 */
export const createRequestSchema = z.object({
  requestType: z.enum(['LEAVE', 'TRIP', 'FIX_PUNCH', 'OVERTIME'], {
    errorMap: () => ({ message: '申请类型必须是 LEAVE、TRIP、FIX_PUNCH 或 OVERTIME' }),
  }),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(), // 所有类型都需要结束时间
  reason: z.string().optional(),
  leaveCategory: z.string().optional(), // 年假/病假/事假等
  destination: z.string().optional(), // 出差地点
  fixPunchDate: z.string().date().optional(), // 补卡日期（已废弃，保留以兼容旧数据）
  fixPunchType: z.enum(['IN', 'OUT']).optional(), // 补上班/补下班（已废弃，保留以兼容旧数据）
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;




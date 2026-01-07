import { FastifyRequest, FastifyReply } from 'fastify';
import { StatsService } from '../services/stats.service';
import { getCurrentUser } from '../middlewares/auth';

/**
 * 统计控制器
 */
export class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  /**
   * 获取月度统计
   */
  async getMonthStats(
    request: FastifyRequest<{
      Querystring: {
        month?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    
    // 如果没有提供月份，使用当前月份
    let month = request.query.month;
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // 验证月份格式
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: '月份格式错误，应为 YYYY-MM',
      });
    }

    const result = await this.statsService.getMonthStats(
      user.userId,
      user.orgId,
      month
    );

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    });
  }
}




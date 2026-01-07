import { FastifyRequest, FastifyReply } from 'fastify';
import { PunchService } from '../services/punch.service';
import { punchSchema } from '../validators/punch';
import { getCurrentUser } from '../middlewares/auth';

/**
 * 打卡控制器
 */
export class PunchController {
  private punchService: PunchService;

  constructor() {
    this.punchService = new PunchService();
  }

  /**
   * 创建打卡记录
   */
  async createPunch(
    request: FastifyRequest<{
      Body: {
        punchType: 'IN' | 'OUT';
        lat?: number;
        lng?: number;
        accuracyM?: number;
        verifyMethod?: string;
        evidenceUrl?: string;
        deviceInfo?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const body = punchSchema.parse(request.body);
    const ipAddress = request.ip || (request.headers['x-forwarded-for'] as string) || '';

    const result = await this.punchService.createPunch(
      user.userId,
      user.orgId,
      body,
      ipAddress
    );

    return reply.send({
      code: 'SUCCESS',
      message: '打卡成功',
      data: result,
    });
  }

  /**
   * 获取今天的打卡记录
   */
  async getToday(request: FastifyRequest, reply: FastifyReply) {
    const user = getCurrentUser(request);
    const result = await this.punchService.getTodayPunches(user.userId);

    console.log('控制器收到的数据:', JSON.stringify(result, null, 2));

    const response = {
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    };

    console.log('控制器返回的响应:', JSON.stringify(response, null, 2));

    return reply.send(response);
  }

  /**
   * 获取打卡历史
   */
  async getHistory(
    request: FastifyRequest<{
      Querystring: {
        from: string;
        to: string;
        page?: string;
        pageSize?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const { from, to, page = '1', pageSize = '20' } = request.query;

    console.log(`控制器收到查询参数 - from: ${from}, to: ${to}, page: ${page}, pageSize: ${pageSize}`);

    if (!from || !to) {
      return reply.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'from 和 to 参数必填',
      });
    }

    const result = await this.punchService.getHistory(
      user.userId,
      from,
      to,
      parseInt(page, 10),
      parseInt(pageSize, 10)
    );

    console.log('控制器返回的打卡历史结果:', JSON.stringify(result, null, 2));

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    });
  }

  /**
   * 获取当前班次信息
   */
  async getCurrentSchedule(request: FastifyRequest, reply: FastifyReply) {
    const user = getCurrentUser(request);
    const result = await this.punchService.getCurrentSchedule(user.orgId);

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    });
  }
}

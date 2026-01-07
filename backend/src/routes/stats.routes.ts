import { FastifyInstance } from 'fastify';
import { authenticate } from '../middlewares/auth';
import { StatsController } from '../controllers/stats.controller';

/**
 * 统计路由
 */
export async function statsRoutes(fastify: FastifyInstance) {
  const controller = new StatsController();

  // 月度统计
  fastify.get('/stats/month', {
    preHandler: [authenticate],
    schema: {
      description: '获取月度统计',
      tags: ['统计'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          month: { type: 'string', pattern: '^\\d{4}-\\d{2}$', description: '月份 YYYY-MM' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    return controller.getMonthStats(request, reply);
  });

  // 管理端月度报表
  fastify.get('/admin/reports/month', {
    preHandler: [authenticate],
    schema: {
      description: '获取管理端月度报表',
      tags: ['统计'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现报表逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: { list: [], total: 0 },
    });
  });

  // 异常列表
  fastify.get('/admin/anomalies', {
    preHandler: [authenticate],
    schema: {
      description: '获取异常列表',
      tags: ['统计'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现异常列表逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: { list: [], total: 0 },
    });
  });

  // 处理异常
  fastify.post('/admin/anomalies/:id/resolve', {
    preHandler: [authenticate],
    schema: {
      description: '处理异常',
      tags: ['统计'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现异常处理逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '处理成功',
      data: {},
    });
  });
}




import { FastifyInstance } from 'fastify';
import { PunchController } from '../controllers/punch.controller';
import { authenticate } from '../middlewares/auth';

/**
 * 打卡路由
 */
export async function punchRoutes(fastify: FastifyInstance) {
  const controller = new PunchController();

  // 创建打卡记录
  fastify.post('/punch', {
    preHandler: [authenticate],
    schema: {
      description: '创建打卡记录',
      tags: ['打卡'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['punchType'],
        properties: {
          punchType: { type: 'string', enum: ['IN', 'OUT'], description: '打卡类型：IN=上班，OUT=下班' },
          lat: { type: 'number', description: '纬度' },
          lng: { type: 'number', description: '经度' },
          accuracyM: { type: 'number', description: '定位精度（米）' },
          verifyMethod: { type: 'string', enum: ['NONE', 'PHOTO', 'FACE', 'LIVENESS'], description: '校验方式' },
          evidenceUrl: { type: 'string', format: 'uri', description: '证据 URL（照片/视频）' },
          deviceInfo: { type: 'string', description: '设备信息' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            // 注意：必须允许 additionalProperties，否则 fast-json-stringify 会把 data 序列化成 {}
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    return controller.createPunch(request, reply);
  });

  // 获取今天的打卡记录
  fastify.get('/punch/today', {
    preHandler: [authenticate],
    schema: {
      description: '获取今天的打卡记录',
      tags: ['打卡'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            // 注意：必须允许 additionalProperties，否则 fast-json-stringify 会把 data 序列化成 {}
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    return controller.getToday(request, reply);
  });

  // 获取打卡历史
  fastify.get('/punch/history', {
    preHandler: [authenticate],
    schema: {
      description: '获取打卡历史',
      tags: ['打卡'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        required: ['from', 'to'],
        properties: {
          from: { type: 'string', format: 'date', description: '开始日期 YYYY-MM-DD' },
          to: { type: 'string', format: 'date', description: '结束日期 YYYY-MM-DD' },
          page: { type: 'integer', minimum: 1, default: 1, description: '页码' },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20, description: '每页数量' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            // 注意：必须允许 additionalProperties，否则 fast-json-stringify 会把 data 序列化成 {}
            data: { type: 'object', additionalProperties: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    return controller.getHistory(request, reply);
  });

  // 获取当前班次信息
  fastify.get('/punch/schedule', {
    preHandler: [authenticate],
    schema: {
      description: '获取当前班次信息（上下班时间、宽限期等）',
      tags: ['打卡'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: { type: ['object', 'null'], additionalProperties: true },
          },
        },
      },
    },
  }, async (request, reply) => {
    return controller.getCurrentSchedule(request, reply);
  });
}




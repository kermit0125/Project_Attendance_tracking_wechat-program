import { FastifyInstance } from 'fastify';
import { RequestController } from '../controllers/request.controller';
import { authenticate } from '../middlewares/auth';

/**
 * 申请路由
 */
export async function requestRoutes(fastify: FastifyInstance) {
  const controller = new RequestController();

  // 创建申请
  fastify.post('/requests', {
    preHandler: [authenticate],
    schema: {
      description: '创建申请',
      tags: ['申请'],
      security: [{ bearerAuth: [] }],
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
      body: {
        type: 'object',
        required: ['requestType', 'startAt', 'endAt'],
        properties: {
          requestType: {
            type: 'string',
            enum: ['LEAVE', 'TRIP', 'FIX_PUNCH', 'OVERTIME'],
            description: '申请类型：LEAVE=请假，TRIP=出差，FIX_PUNCH=补卡，OVERTIME=加班',
          },
          startAt: { type: 'string', format: 'date-time', description: '开始时间' },
          endAt: { type: 'string', format: 'date-time', description: '结束时间' },
          reason: { type: 'string', description: '申请原因' },
          leaveCategory: { type: 'string', description: '请假类型（年假/病假/事假等）' },
          destination: { type: 'string', description: '出差地点' },
          fixPunchDate: { type: 'string', format: 'date', description: '补卡日期（仅补卡申请）' },
          fixPunchType: { type: 'string', enum: ['IN', 'OUT'], description: '补卡类型（仅补卡申请）' },
        },
      },
    },
  }, async (request, reply) => {
    return controller.createRequest(request as any, reply);
  });

  // 获取申请详情 - 必须在 /requests 之前注册，否则会被 /requests 匹配
  fastify.get('/requests/:id', {
    preHandler: [authenticate],
    schema: {
      description: '获取申请详情',
      tags: ['申请'],
      security: [{ bearerAuth: [] }],
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
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    return controller.getRequestById(request as any, reply);
  });

  // 获取申请列表 - 必须在 /requests/:id 之后注册
  fastify.get('/requests', {
    preHandler: [authenticate],
    schema: {
      description: '获取申请列表',
      tags: ['申请'],
      security: [{ bearerAuth: [] }],
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
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    return controller.getRequests(request as any, reply);
  });

  // 取消申请
  fastify.post('/requests/:id/cancel', {
    preHandler: [authenticate],
    schema: {
      description: '取消申请',
      tags: ['申请'],
      security: [{ bearerAuth: [] }],
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
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    return controller.cancelRequest(request as any, reply);
  });

  // 添加附件
  fastify.post('/requests/:id/attachments', {
    preHandler: [authenticate],
    schema: {
      description: '添加附件',
      tags: ['申请'],
      security: [{ bearerAuth: [] }],
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
      params: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
        },
      },
      body: {
        type: 'object',
        required: ['fileName', 'fileUrl'],
        properties: {
          fileName: { type: 'string' },
          fileUrl: { type: 'string', format: 'uri' },
          mimeType: { type: 'string' },
          fileSizeBytes: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    return controller.addAttachment(request as any, reply);
  });
}




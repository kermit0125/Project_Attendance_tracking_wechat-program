import { FastifyInstance } from 'fastify';
import { authenticate, getCurrentUser } from '../middlewares/auth';
import { requireManagerOrAbove } from '../middlewares/rbac';
import { ApprovalController } from '../controllers/approval.controller';

/**
 * 审批路由
 */
export async function approvalRoutes(fastify: FastifyInstance) {
  const controller = new ApprovalController();

  // 待我审批列表
  fastify.get('/admin/approvals', {
    preHandler: [authenticate, requireManagerOrAbove()],
    schema: {
      description: '获取待我审批列表',
      tags: ['审批'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
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
    return controller.getPendingApprovals(request as any, reply);
  });

  // 审批详情
  fastify.get('/admin/approvals/:requestId', {
    preHandler: [authenticate, requireManagerOrAbove()],
    schema: {
      description: '获取审批详情',
      tags: ['审批'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'integer' },
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
    const { requestId } = request.params as { requestId: string };
    const { RequestController } = await import('../controllers/request.controller');
    const controller = new RequestController();
    // 创建一个新的 request 对象，包含原始 request 的所有信息，但修改 params.id
    const modifiedRequest = {
      ...request,
      params: { id: requestId },
    } as any;
    return controller.getRequestById(modifiedRequest, reply);
  });

  // 审批决策
  fastify.post('/admin/approvals/:requestId/decision', {
    preHandler: [authenticate, requireManagerOrAbove()],
    schema: {
      description: '审批决策',
      tags: ['审批'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'integer' },
        },
      },
      body: {
        type: 'object',
        required: ['decision'],
        properties: {
          decision: { type: 'string', enum: ['APPROVED', 'REJECTED', 'TRANSFERRED'] },
          comment: { type: 'string' },
          transferredTo: { type: 'integer' },
          approvedDurationMinutes: { type: 'integer', minimum: 0, description: '审批后实际批准的时长（分钟），如果提供则覆盖申请时的时长' },
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
    return controller.makeDecision(request as any, reply);
  });
}




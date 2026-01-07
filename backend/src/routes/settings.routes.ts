import { FastifyInstance } from 'fastify';
import { authenticate } from '../middlewares/auth';
import { requireAdminOrHR } from '../middlewares/rbac';

/**
 * 配置路由（简化版）
 */
export async function settingsRoutes(fastify: FastifyInstance) {
  // 班次管理 CRUD
  fastify.get('/admin/settings/schedules', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '获取班次列表',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现班次列表逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: { list: [], total: 0 },
    });
  });

  // 围栏管理 CRUD
  fastify.get('/admin/settings/geofences', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '获取围栏列表',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    return geoFenceController.list(request, reply);
  });

  fastify.post('/admin/settings/geofences', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '创建围栏',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'lat', 'lng', 'radiusM'],
        properties: {
          name: { type: 'string', description: '围栏名称' },
          lat: { type: 'number', description: '纬度' },
          lng: { type: 'number', description: '经度' },
          radiusM: { type: 'number', description: '半径（米）' },
          description: { type: 'string', description: '描述' },
        },
      },
    },
  }, async (request, reply) => {
    return geoFenceController.create(request, reply);
  });

  fastify.put('/admin/settings/geofences/:id', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '更新围栏',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          radiusM: { type: 'number' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    return geoFenceController.update(request, reply);
  });

  fastify.delete('/admin/settings/geofences/:id', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '删除围栏',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    return geoFenceController.delete(request, reply);
  });

  // 节假日管理 CRUD
  fastify.get('/admin/settings/holidays', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '获取节假日列表',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现节假日列表逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: { list: [], total: 0 },
    });
  });

  // 审计日志
  fastify.get('/admin/audit-logs', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '获取审计日志',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现审计日志逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: { list: [], total: 0 },
    });
  });
}




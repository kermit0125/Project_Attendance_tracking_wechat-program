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

  // 围栏管理 CRUD (TODO: 实现围栏管理逻辑)
  fastify.get('/admin/settings/geofences', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '获取围栏列表',
      tags: ['配置'],
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    // TODO: 实现围栏列表逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: { list: [], total: 0 },
    });
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
          address: { type: 'string', description: '地址' },
        },
      },
    },
  }, async (request, reply) => {
    // TODO: 实现创建围栏逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '创建成功',
      data: {},
    });
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
          address: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    // TODO: 实现更新围栏逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '更新成功',
      data: {},
    });
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
    // TODO: 实现删除围栏逻辑
    return reply.send({
      code: 'SUCCESS',
      message: '删除成功',
      data: {},
    });
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

  // 初始化种子数据（仅管理员，仅在生产环境可用）
  fastify.post('/admin/system/seed', {
    preHandler: [authenticate, requireAdminOrHR()],
    schema: {
      description: '初始化种子数据（仅首次部署时使用）',
      tags: ['系统管理'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          confirm: { 
            type: 'boolean', 
            description: '确认操作（必须为 true）' 
          },
        },
        required: ['confirm'],
      },
    },
  }, async (request: any, reply) => {
    const { confirm } = request.body as { confirm?: boolean };
    
    if (!confirm) {
      return reply.status(400).send({
        code: 'BAD_REQUEST',
        message: '必须确认操作（设置 confirm: true）',
      });
    }

    try {
      // 检查是否已有数据
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const roleCount = await prisma.role.count();
      const orgCount = await prisma.org.count();
      
      if (roleCount > 0 || orgCount > 0) {
        await prisma.$disconnect();
        return reply.status(400).send({
          code: 'BAD_REQUEST',
          message: '数据库已有数据，无法重新初始化。如需重置，请手动清空数据库。',
          data: { roleCount, orgCount },
        });
      }

      // 运行 seed
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const backendDir = require('path').resolve(__dirname, '../..');
      const { stdout, stderr } = await execAsync('npx tsx prisma/seed.ts', { 
        cwd: backendDir,
        env: process.env,
      });
      
      await prisma.$disconnect();
      
      return reply.send({
        code: 'SUCCESS',
        message: '种子数据初始化成功',
        data: { 
          output: stdout,
          warnings: stderr || undefined,
        },
      });
    } catch (error: any) {
      return reply.status(500).send({
        code: 'INTERNAL_ERROR',
        message: '种子数据初始化失败',
        error: error.message,
      });
    }
  });
}




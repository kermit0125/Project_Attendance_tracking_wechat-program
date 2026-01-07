import { FastifyInstance } from 'fastify';
import { ScheduleController } from '../controllers/schedule.controller';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';

export default async function scheduleRoutes(fastify: FastifyInstance) {
  // 所有路由都需要认证
  fastify.addHook('onRequest', authenticate);

  // 获取班次列表（所有用户都可以查看）
  fastify.get('/schedules', {
    schema: {
      description: '获取班次列表',
      tags: ['班次管理'],
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: true,
              },
            },
          },
        },
      },
    },
  }, ScheduleController.getSchedules);

  // 获取班次详情
  fastify.get('/schedules/:id', {
    schema: {
      description: '获取班次详情',
      tags: ['班次管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    },
  }, ScheduleController.getScheduleById);

  // 创建班次（需要 ADMIN/HR 权限）
  fastify.post('/schedules', {
    preHandler: requireRole('ADMIN', 'HR'),
    schema: {
      description: '创建班次',
      tags: ['班次管理'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          endTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          breakStart: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          breakEnd: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          lateGraceMinutes: { type: 'number', minimum: 0 },
          earlyLeaveGraceMinutes: { type: 'number', minimum: 0 },
          minWorkMinutes: { type: 'number', minimum: 0 },
          crossDay: { type: 'boolean' },
        },
        required: ['name', 'startTime', 'endTime'],
      },
      response: {
        201: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    },
  }, ScheduleController.createSchedule);

  // 更新班次（需要 ADMIN/HR 权限）
  fastify.put('/schedules/:id', {
    preHandler: requireRole('ADMIN', 'HR'),
    schema: {
      description: '更新班次',
      tags: ['班次管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          endTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          breakStart: { type: ['string', 'null'], pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          breakEnd: { type: ['string', 'null'], pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
          lateGraceMinutes: { type: 'number', minimum: 0 },
          earlyLeaveGraceMinutes: { type: 'number', minimum: 0 },
          minWorkMinutes: { type: ['number', 'null'], minimum: 0 },
          crossDay: { type: 'boolean' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
      },
    },
  }, ScheduleController.updateSchedule);

  // 删除班次（需要 ADMIN/HR 权限）
  fastify.delete('/schedules/:id', {
    preHandler: requireRole('ADMIN', 'HR'),
    schema: {
      description: '删除班次',
      tags: ['班次管理'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'number' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'null' },
          },
        },
      },
    },
  }, ScheduleController.deleteSchedule);
}


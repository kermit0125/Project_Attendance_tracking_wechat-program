import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { createUserSchema, updateUserSchema } from '../validators/user';

export default async function userRoutes(fastify: FastifyInstance) {
  // 所有路由都需要认证和 ADMIN/HR 权限
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireRole('ADMIN', 'HR'));

  // 获取用户列表
  fastify.get('/users', {
    schema: {
      description: '获取用户列表',
      tags: ['用户管理'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 20 },
          keyword: { type: 'string' },
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
  }, UserController.getUsers);

  // 获取用户详情
  fastify.get('/users/:id', {
    schema: {
      description: '获取用户详情',
      tags: ['用户管理'],
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
  }, UserController.getUserById);

  // 创建用户
  fastify.post('/users', {
    schema: {
      description: '创建用户',
      tags: ['用户管理'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          phone: { type: 'string' },
          password: { type: 'string' },
          employeeNo: { type: 'string' },
          fullName: { type: 'string' },
          departmentId: { type: 'number' },
          roles: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
        required: ['email', 'password', 'fullName', 'roles'],
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
    preValidation: async (request) => {
      const result = createUserSchema.safeParse(request.body);
      if (!result.success) {
        throw new Error(result.error.errors[0].message);
      }
    },
  }, UserController.createUser);

  // 更新用户
  fastify.put('/users/:id', {
    schema: {
      description: '更新用户',
      tags: ['用户管理'],
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
          email: { type: 'string' },
          phone: { type: 'string' },
          password: { type: 'string' },
          employeeNo: { type: 'string' },
          fullName: { type: 'string' },
          departmentId: { type: ['number', 'null'] },
          roles: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'LEFT'] },
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
    preValidation: async (request) => {
      const result = updateUserSchema.safeParse(request.body);
      if (!result.success) {
        throw new Error(result.error.errors[0].message);
      }
    },
  }, UserController.updateUser);

  // 删除用户
  fastify.delete('/users/:id', {
    schema: {
      description: '删除用户',
      tags: ['用户管理'],
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
  }, UserController.deleteUser);

  // 获取部门列表
  fastify.get('/departments', {
    schema: {
      description: '获取部门列表',
      tags: ['用户管理'],
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
  }, UserController.getDepartments);

  // 获取角色列表
  fastify.get('/roles', {
    schema: {
      description: '获取角色列表',
      tags: ['用户管理'],
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
  }, UserController.getRoles);
}


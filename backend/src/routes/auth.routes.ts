import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

/**
 * 认证路由
 */
export async function authRoutes(fastify: FastifyInstance) {
  const controller = new AuthController(fastify);

  // 登录（无需鉴权）
  fastify.post('/auth/login', {
    schema: {
      description: '用户登录',
      tags: ['认证'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', description: '邮箱' },
          password: { type: 'string', minLength: 6, description: '密码' },
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
              properties: {
                token: { type: 'string', description: 'JWT Token' },
                // 注意：必须允许 additionalProperties，否则 fast-json-stringify 会把 user 序列化成 {}
                user: { type: 'object', description: '用户信息', additionalProperties: true },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    return controller.login(request, reply);
  });

  // 获取当前用户信息（需要鉴权）
  fastify.get('/auth/me', {
    preHandler: [authenticate],
    schema: {
      description: '获取当前用户信息',
      tags: ['认证'],
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
    return controller.getCurrentUser(request, reply);
  });
}




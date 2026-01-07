import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { authRoutes } from './routes/auth.routes';
import { punchRoutes } from './routes/punch.routes';
import { requestRoutes } from './routes/request.routes';
import { approvalRoutes } from './routes/approval.routes';
import { statsRoutes } from './routes/stats.routes';
import { settingsRoutes } from './routes/settings.routes';
import userRoutes from './routes/user.routes';
import scheduleRoutes from './routes/schedule.routes';

/**
 * 创建 Fastify 应用实例
 */
async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.logLevel,
      transport: config.nodeEnv === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
  });

  // 注册插件
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(jwt, {
    secret: config.jwtSecret,
    // 确保从 Authorization header 读取 Bearer token
    // 默认行为已经支持，这里明确配置以确保兼容性
  });

  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
  });

  // Swagger 文档
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: '企业考勤系统 API',
        description: '企业考勤系统后端 API 文档',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: '开发环境',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT 认证，格式：Bearer {token}',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  // 注册路由
  await fastify.register(authRoutes);
  await fastify.register(punchRoutes);
  await fastify.register(requestRoutes);
  await fastify.register(approvalRoutes);
  await fastify.register(statsRoutes);
  await fastify.register(settingsRoutes);
  await fastify.register(userRoutes, { prefix: '/admin' });
  await fastify.register(scheduleRoutes, { prefix: '/admin' });

  // 健康检查
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // 错误处理
  fastify.setErrorHandler(errorHandler);

  // 注意：不再使用全局序列化钩子
  // 因为 Fastify 的 onSend hook 处理字符串 payload 时可能会有问题
  // 所有数据应该在服务层或控制器层正确序列化
  // 如果需要处理遗漏的 BigInt/Date，可以使用自定义序列化器

  return fastify;
}

/**
 * 启动服务器
 */
async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log(`
🚀 服务器启动成功！

📝 API 文档: http://localhost:${config.port}/docs
🏥 健康检查: http://localhost:${config.port}/health
📊 环境: ${config.nodeEnv}
    `);
  } catch (err) {
    console.error('服务器启动失败:', err);
    process.exit(1);
  }
}

// 运行服务器
if (require.main === module) {
  start();
}

export { buildApp };




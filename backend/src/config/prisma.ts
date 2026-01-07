import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端单例
 * 使用中间件自动设置 createdAt 字段（因为 MySQL 不支持 DATETIME 默认值）
 */
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 使用中间件自动设置 createdAt（如果未提供）
basePrisma.$use(async (params, next) => {
  // 对于 create 操作，自动设置 createdAt
  if (params.action === 'create') {
    if (params.args.data && !params.args.data.createdAt) {
      params.args.data.createdAt = new Date();
    }
  }
  
  // 对于 createMany 操作
  if (params.action === 'createMany') {
    if (params.args.data) {
      const dataArray = Array.isArray(params.args.data) ? params.args.data : [params.args.data];
      dataArray.forEach((item: any) => {
        if (item && typeof item === 'object' && !item.createdAt) {
          item.createdAt = new Date();
        }
      });
    }
  }
  
  // 对于 upsert 操作
  if (params.action === 'upsert') {
    if (params.args.create && !params.args.create.createdAt) {
      params.args.create.createdAt = new Date();
    }
  }
  
  return next(params);
});

export const prisma = basePrisma;

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});




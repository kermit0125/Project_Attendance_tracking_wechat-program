import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端单例
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});




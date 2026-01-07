import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 设置 SQL 模式，允许 DATETIME 使用 CURRENT_TIMESTAMP
    await prisma.$executeRawUnsafe(`SET GLOBAL sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'`);
    await prisma.$executeRawUnsafe(`SET SESSION sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'`);
    console.log('✅ SQL 模式已设置');
    
    // 验证设置
    const sqlMode = await prisma.$queryRawUnsafe(`SELECT @@sql_mode as sql_mode`) as Array<{ sql_mode: string }>;
    console.log('当前 SQL 模式:', sqlMode[0]?.sql_mode);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();


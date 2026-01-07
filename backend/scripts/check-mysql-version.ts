import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 检查 MySQL 版本
    const versionResult = await prisma.$queryRawUnsafe(`SELECT VERSION() as version`);
    const version = (versionResult as any)[0]?.version;
    console.log('MySQL 版本:', version || '未知');

    // 检查 SQL 模式
    const sqlModeResult = await prisma.$queryRawUnsafe(`SELECT @@sql_mode as sql_mode`);
    const sqlMode = (sqlModeResult as any)[0]?.sql_mode;
    console.log('SQL 模式:', sqlMode || '未知');

    // 检查表是否存在
    const tablesResult = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    const tables = tablesResult as Array<{ TABLE_NAME: string }>;
    console.log('\n已存在的表:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
  } catch (error: any) {
    console.error('错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();


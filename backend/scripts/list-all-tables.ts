import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `) as Array<{ TABLE_NAME: string }>;
    
    console.log('所有表:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    
    if (tables.length > 1) {
      console.log('\n⚠️  发现已有表，可能需要先删除后再执行 db push');
    }
  } catch (error: any) {
    console.error('错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();



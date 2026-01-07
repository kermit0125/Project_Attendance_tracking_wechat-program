import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('⚠️  警告：这将删除所有表（除了 _prisma_migrations）');
    
    // 获取所有表（除了 _prisma_migrations）
    const tables = await prisma.$queryRawUnsafe(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME != '_prisma_migrations'
      ORDER BY TABLE_NAME
    `) as Array<{ TABLE_NAME: string }>;
    
    if (tables.length === 0) {
      console.log('✅ 没有需要删除的表');
      return;
    }
    
    console.log('\n将删除以下表:');
    tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    
    // 禁用外键检查
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
    
    // 删除所有表
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``);
      console.log(`✅ 已删除表: ${table.TABLE_NAME}`);
    }
    
    // 重新启用外键检查
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ 所有表已删除，现在可以运行 `npm run prisma:push`');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();



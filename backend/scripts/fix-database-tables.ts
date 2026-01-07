import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 检查并创建缺失的数据库表
 * 这是一个临时解决方案，用于修复迁移文件不完整的问题
 */
async function fixDatabase() {
  console.log('🔍 检查数据库表...');
  
  try {
    // 尝试查询 users 表，如果不存在会抛出错误
    await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`;
    console.log('✅ users 表已存在');
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    if (errorMessage.includes('does not exist') || errorMessage.includes("doesn't exist")) {
      console.error('❌ users 表不存在');
      console.log('\n📋 解决方案：');
      console.log('请运行以下命令之一来创建表：');
      console.log('\n选项 1（推荐）：使用 Prisma db push');
      console.log('   npx prisma db push');
      console.log('\n选项 2：重置并重新应用迁移');
      console.log('   npx prisma migrate reset');
      console.log('   npx prisma migrate deploy');
      console.log('\n选项 3：手动创建迁移');
      console.log('   npx prisma migrate dev --name init');
      console.log('   然后在生产环境运行: npx prisma migrate deploy');
      process.exit(1);
    } else {
      throw error;
    }
  }
  
  console.log('\n✅ 数据库表检查完成');
}

fixDatabase()
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


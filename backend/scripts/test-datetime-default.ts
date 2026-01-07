import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 尝试直接创建表，测试 DATETIME 默认值
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS test_datetime (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 表创建成功');

    // 插入测试数据
    await prisma.$executeRawUnsafe(`
      INSERT INTO test_datetime (name) VALUES ('test')
    `);
    console.log('✅ 数据插入成功');

    // 查询数据
    const result = await prisma.$queryRawUnsafe(`
      SELECT * FROM test_datetime
    `);
    console.log('✅ 查询结果:', result);

    // 删除测试表
    await prisma.$executeRawUnsafe(`
      DROP TABLE IF EXISTS test_datetime
    `);
    console.log('✅ 测试表已删除');
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    console.error('完整错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();



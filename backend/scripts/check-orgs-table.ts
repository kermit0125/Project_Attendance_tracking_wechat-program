import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRawUnsafe(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        COLUMN_DEFAULT,
        IS_NULLABLE,
        EXTRA
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'orgs'
      ORDER BY ORDINAL_POSITION
    `) as Array<{
      COLUMN_NAME: string;
      COLUMN_TYPE: string;
      COLUMN_DEFAULT: string | null;
      IS_NULLABLE: string;
      EXTRA: string;
    }>;
    
    console.log('orgs 表结构:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('列名\t\t\t类型\t\t\t默认值\t\t\t可空\t\t额外');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME}\t\t${col.COLUMN_TYPE}\t\t${col.COLUMN_DEFAULT || 'NULL'}\t\t${col.IS_NULLABLE}\t\t${col.EXTRA}`);
    });
  } catch (error: any) {
    console.error('错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();


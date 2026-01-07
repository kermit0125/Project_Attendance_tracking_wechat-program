import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 更新 anomaly_type 枚举，添加 LATE 和 EARLY_LEAVE
    await prisma.$executeRawUnsafe(`
      ALTER TABLE attendance_anomalies 
      MODIFY COLUMN anomaly_type 
      ENUM('MISSING_IN', 'MISSING_OUT', 'OUT_OF_FENCE', 'VERIFY_FAIL', 'LOCATION_DENIED', 'LATE', 'EARLY_LEAVE', 'OTHER') 
      NOT NULL
    `);
    console.log('✅ 成功更新 anomaly_type 枚举，添加了 LATE 和 EARLY_LEAVE');
  } catch (error: any) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();


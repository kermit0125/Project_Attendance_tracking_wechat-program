// 加载环境变量
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// 尝试加载 .env 文件
dotenvConfig({ path: resolve(process.cwd(), '.env') });

/**
 * 环境变量配置
 */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  databaseUrl: process.env.DATABASE_URL || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10),
  },
  // CORS 配置：支持多个来源，用逗号分隔
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : undefined, // undefined 表示允许所有来源（开发环境默认行为）
};

// 验证必需的环境变量
if (!config.databaseUrl && config.nodeEnv !== 'test') {
  console.error('❌ DATABASE_URL 环境变量未设置');
  console.error('请确保 .env 文件存在并包含正确的配置');
  throw new Error('DATABASE_URL 环境变量未设置');
}

if (!config.jwtSecret || config.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
  console.warn('⚠️  警告: 使用了默认 JWT 密钥，生产环境请务必修改！');
}


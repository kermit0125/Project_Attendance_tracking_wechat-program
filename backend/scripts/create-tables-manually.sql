-- 手动创建表的 SQL 脚本
-- 如果 Prisma db push 失败，可以使用此脚本手动创建表
-- 注意：此脚本不包含默认值，需要在应用层处理时间字段

-- 创建组织表
CREATE TABLE IF NOT EXISTS `orgs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 注意：其他表需要根据 schema.prisma 生成
-- 建议使用 Prisma db push 或 migrate，此文件仅作为参考


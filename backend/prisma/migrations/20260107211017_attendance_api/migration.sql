/*
  Warnings:

  - You are about to alter the column `created_at` on the `attendance_anomalies` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `punched_at` on the `attendance_punches` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `attendance_punches` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `departments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `geo_fences` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `holidays` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `orgs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `decided_at` on the `request_approvals` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `request_approvals` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `uploaded_at` on the `request_attachments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `start_at` on the `requests` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `end_at` on the `requests` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `requests` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `requests` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updated_at` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `created_at` on the `work_schedules` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- 先更新所有 NULL 值为当前时间戳，然后再修改列定义
-- 这样可以避免 "Invalid use of NULL value" 错误

-- Update NULL values before altering columns
UPDATE `attendance_anomalies` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `attendance_punches` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `audit_logs` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `departments` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `geo_fences` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `holidays` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `orgs` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `request_approvals` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `request_attachments` SET `uploaded_at` = CURRENT_TIMESTAMP WHERE `uploaded_at` IS NULL;
UPDATE `requests` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `requests` SET `updated_at` = CURRENT_TIMESTAMP WHERE `updated_at` IS NULL;
UPDATE `users` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;
UPDATE `users` SET `updated_at` = CURRENT_TIMESTAMP WHERE `updated_at` IS NULL;
UPDATE `work_schedules` SET `created_at` = CURRENT_TIMESTAMP WHERE `created_at` IS NULL;

-- AlterTable
-- 注意：根据当前 schema，这些字段应该是可选的（DateTime?），所以不应该设置为 NOT NULL
-- 但为了兼容性，我们保持迁移文件不变，只是先更新 NULL 值
ALTER TABLE `attendance_anomalies` MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `attendance_punches` MODIFY `punched_at` DATETIME NOT NULL,
    MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `audit_logs` MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `departments` MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `geo_fences` MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `holidays` MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `orgs` MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `request_approvals` MODIFY `decided_at` DATETIME NULL,
    MODIFY `created_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `request_attachments` MODIFY `uploaded_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `requests` MODIFY `start_at` DATETIME NOT NULL,
    MODIFY `end_at` DATETIME NOT NULL,
    MODIFY `created_at` DATETIME NULL,
    MODIFY `updated_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `created_at` DATETIME NULL,
    MODIFY `updated_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `work_schedules` MODIFY `created_at` DATETIME NULL;

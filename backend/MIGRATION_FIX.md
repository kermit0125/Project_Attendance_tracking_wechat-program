# 迁移文件修复说明

## 问题原因

Prisma 5.22.0 在生成迁移文件时，即使 schema.prisma 中使用 `@default(now())`，仍然会生成 `CURRENT_TIMESTAMP(3)`。

**MySQL 的 `DATETIME` 类型不支持精度参数**，只能使用 `CURRENT_TIMESTAMP`，不能使用 `CURRENT_TIMESTAMP(3)`。

这会导致错误：
```
Database error code: 1067
Database error: Invalid default value for 'created_at'
```

## 自动修复

启动脚本 `scripts/start-with-migration.ts` 会在应用启动前自动修复所有迁移文件。

## 手动修复

如果自动修复失败，可以手动运行：

```bash
npm run prisma:fix-migrations
```

## 修复内容

脚本会自动：
1. 将所有 `CURRENT_TIMESTAMP(3)` 改为 `CURRENT_TIMESTAMP`
2. 为 `updated_at` 字段添加 `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

## 验证修复

修复后，迁移文件应该：
- ✅ 使用 `DEFAULT CURRENT_TIMESTAMP`（不是 `CURRENT_TIMESTAMP(3)`）
- ✅ `updated_at` 字段有 `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

## 部署到 Render

在 Render 上部署时，启动脚本会自动：
1. 生成 Prisma Client
2. **自动修复所有迁移文件**
3. 应用数据库迁移
4. 启动应用

无需手动操作。


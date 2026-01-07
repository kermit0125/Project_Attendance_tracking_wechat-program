# 数据库迁移问题修复指南

## 问题描述

部署后出现错误：`The table 'users' does not exist in the current database`

这表明数据库是全新的，但迁移文件可能不完整（只包含 ALTER TABLE 语句，缺少 CREATE TABLE 语句）。

## 快速修复方案

### 方案 1：使用 db push（推荐，快速修复）

1. 登录 Render 控制台
2. 进入你的 Web Service
3. 点击右上角的 "Shell" 按钮
4. 运行以下命令：

```bash
cd backend
npx prisma db push
npx tsx prisma/seed.ts
```

这将直接根据 Prisma schema 创建所有表结构，并填充初始数据。

### 方案 2：自动修复（临时方案）

在 Render 环境变量中添加：
- `AUTO_FIX_DB` = `true`

然后重新部署。启动脚本会自动检测表不存在的问题，并使用 `db push` 创建表。

**注意**：此方案不记录迁移历史，仅用于快速修复。修复后建议执行方案 3。

### 方案 3：重新创建迁移（推荐，长期方案）

1. 在 Render Shell 中运行：

```bash
cd backend
npx prisma migrate reset  # 这会清空数据库，仅适用于开发环境
npx prisma migrate dev --name init  # 创建完整的初始迁移
```

2. 提交新的迁移文件到 Git
3. 在 Render Shell 中运行：

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## 验证修复

修复后，可以通过以下方式验证：

1. 访问健康检查端点：`/health`
2. 尝试登录：使用 `admin@test.com` / `123456`
3. 检查 Render 日志，确认没有数据库错误

## 预防措施

为避免将来出现类似问题：

1. **确保迁移文件完整**：首次迁移应该包含所有 CREATE TABLE 语句
2. **在部署前测试迁移**：在本地或测试环境先运行 `prisma migrate deploy`
3. **使用迁移而不是 db push**：生产环境应该使用 `migrate deploy`，而不是 `db push`

## 常见问题

### Q: db push 和 migrate deploy 有什么区别？

- **db push**：直接同步 schema 到数据库，不记录迁移历史。适合快速原型开发。
- **migrate deploy**：应用迁移文件，记录迁移历史。适合生产环境。

### Q: 修复后需要做什么？

1. 验证应用正常运行
2. 如果使用方案 1 或 2，考虑后续创建正确的迁移文件
3. 更新部署文档，确保新环境使用正确的迁移流程


# 部署问题排查指南

## 问题：表不存在，seed 未运行

### 症状
- 日志显示 `The table 'users' does not exist`
- 没有看到启动脚本的输出（如 "🚀 开始启动应用..."）
- 应用直接启动，没有执行迁移和 seed

### 可能原因

1. **启动脚本未执行**
   - `tsx` 在生产环境不可用
   - 启动命令配置错误

2. **迁移失败但应用继续启动**
   - 迁移脚本出错但没有退出
   - 数据库连接失败

3. **数据库表未创建**
   - 迁移文件不完整（只有 ALTER TABLE，没有 CREATE TABLE）
   - 迁移未执行

### 解决方案

#### 方案 1：设置 AUTO_FIX_DB 环境变量（快速修复）

在 Render 环境变量中添加：
```
AUTO_FIX_DB=true
```

然后重新部署。启动脚本会自动检测表不存在的问题，并使用 `prisma db push` 创建表。

#### 方案 2：检查启动脚本是否执行

查看 Render 日志，应该看到：
```
🚀 开始启动应用...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 工作目录: /opt/render/project/src/backend
🌍 环境: production

1️⃣ 生成 Prisma Client...
```

如果没有看到这些日志，说明启动脚本未执行。

**检查点**：
1. 确认 `render.yaml` 中的 `startCommand` 是 `npm run start:migrate`
2. 确认 Render 服务配置中的 Start Command 是 `npm run start:migrate`
3. 检查 `package.json` 中是否有 `start:migrate` 脚本

#### 方案 3：手动运行迁移和 seed（如果可以使用 Shell）

如果 Render Shell 可用：

```bash
cd backend
npx prisma db push
npx tsx prisma/seed.ts
```

#### 方案 4：使用 API 端点（需要先创建表）

如果表已创建但 seed 未运行，可以使用 API 端点：

```bash
POST /admin/system/seed
Authorization: Bearer {admin_token}
{
  "confirm": true
}
```

但首先需要确保表已创建。

### 验证步骤

1. **检查启动脚本日志**
   - 应该看到 "🚀 开始启动应用..."
   - 应该看到 "✅ 数据库迁移完成"
   - 应该看到 "✅ 种子数据初始化完成"

2. **检查数据库表**
   - 使用数据库客户端连接
   - 检查 `users` 表是否存在
   - 检查 `roles` 表是否有 4 条记录

3. **测试登录**
   - 使用 `admin@test.com` / `123456` 登录
   - 如果成功，说明 seed 已完成

### 常见错误

#### 错误 1：tsx 命令未找到

**症状**：日志显示 `tsx: command not found`

**解决**：确保 `tsx` 在 `dependencies` 中（不是 `devDependencies`）

#### 错误 2：启动脚本执行但立即退出

**症状**：看到启动脚本日志，但应用未启动

**解决**：检查启动脚本的错误处理，确保所有错误都被捕获

#### 错误 3：迁移成功但 seed 未运行

**症状**：看到 "✅ 数据库迁移完成"，但没有 seed 日志

**解决**：
1. 检查数据库是否为空（seed 只在数据库为空时自动运行）
2. 设置 `RUN_SEED=true` 强制运行
3. 使用 API 端点手动触发

### 调试技巧

1. **查看完整日志**
   - Render 日志页面
   - 查看 "Build Logs" 和 "Runtime Logs"

2. **添加调试输出**
   - 在启动脚本中添加 `console.log`
   - 检查环境变量是否正确设置

3. **测试本地**
   - 在本地使用相同的环境变量测试
   - 确认迁移和 seed 能正常运行

### 预防措施

1. **确保 tsx 在生产环境可用**
   - 将 `tsx` 放在 `dependencies` 中

2. **完整的迁移文件**
   - 确保首次迁移包含所有 CREATE TABLE 语句

3. **错误处理**
   - 确保迁移失败时应用不会启动
   - 确保所有错误都被正确记录

4. **环境变量检查**
   - 启动脚本检查必需的环境变量
   - 提供清晰的错误信息


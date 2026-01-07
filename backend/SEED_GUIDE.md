# 种子数据初始化指南

## 概述

种子数据（seed）用于初始化数据库的基础数据，包括：
- 角色（EMPLOYEE, MANAGER, HR, ADMIN）
- 测试组织
- 测试用户（admin@test.com, manager@test.com, employee@test.com）
- 工作班次
- 地理围栏

## 初始化方式

### 方式 1：自动检测（推荐，无需配置）

**✅ 默认行为**：启动脚本会自动检测数据库是否为空，如果为空则自动运行 seed。

**优点**：
- 无需任何配置
- 首次部署时自动初始化
- 不会重复运行（如果数据库已有数据）

**工作原理**：
- 检查 `roles` 表和 `orgs` 表的记录数
- 如果两个表都为空，自动运行 seed
- 如果已有数据，跳过 seed

### 方式 2：环境变量强制运行

在 Render 环境变量中添加：

```
RUN_SEED=true
```

或

```
AUTO_SEED=true
```

**使用场景**：
- 需要重新初始化数据
- 自动检测失败时手动触发

**注意**：即使数据库已有数据，设置此环境变量也会强制运行 seed（seed 脚本使用 `upsert`，不会重复创建）。

### 方式 3：API 端点（需要管理员权限）

部署后，使用管理员账号调用 API：

```bash
POST /admin/system/seed
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "confirm": true
}
```

**使用场景**：
- Render 免费计划无法使用 Shell
- 需要手动触发 seed
- 调试和测试

**安全**：
- 需要管理员或 HR 权限
- 如果数据库已有数据，会拒绝执行（防止误操作）

**示例（使用 curl）**：

```bash
curl -X POST https://your-api-url.onrender.com/admin/system/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

### 方式 4：本地运行

在本地连接到生产数据库运行 seed：

1. 在 `backend` 目录创建 `.env` 文件
2. 添加生产数据库连接：

```env
DATABASE_URL=mysql://user:password@host:port/database?sslmode=REQUIRED
```

3. 运行：

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:seed
```

## 测试账号

seed 完成后，可以使用以下账号登录：

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin@test.com | 123456 | 拥有所有权限 |
| 主管 | manager@test.com | 123456 | 可以审批申请 |
| 员工 | employee@test.com | 123456 | 普通员工 |

## 验证 seed 是否成功

### 方法 1：检查日志

查看 Render 部署日志，应该看到：

```
✅ 种子数据初始化完成
```

或

```
数据库已有数据（X 个角色，Y 个组织），跳过种子数据
```

### 方法 2：尝试登录

使用 `admin@test.com` / `123456` 尝试登录，如果成功说明 seed 已完成。

### 方法 3：检查数据库

如果可以使用数据库客户端，检查以下表是否有数据：
- `roles` 表应该有 4 条记录
- `orgs` 表应该有 1 条记录
- `users` 表应该有 3 条记录

## 常见问题

### Q: 为什么 seed 没有自动运行？

**可能原因**：
1. 数据库已有数据（seed 不会重复运行）
2. 迁移失败，表未创建
3. 数据库连接失败

**解决方案**：
1. 检查 Render 日志，查看具体错误
2. 设置 `RUN_SEED=true` 强制运行
3. 使用 API 端点手动触发

### Q: seed 会重复创建数据吗？

**不会**。seed 脚本使用 `upsert` 操作：
- 如果数据已存在，会更新（不会重复创建）
- 如果数据不存在，会创建

### Q: 如何重置数据库？

**注意**：重置会清空所有数据！

1. 在 Render Shell 中运行（如果可用）：
   ```bash
   npx prisma migrate reset
   ```

2. 或手动清空数据库后，重新部署（会自动运行 seed）

### Q: Render 免费计划无法使用 Shell 怎么办？

**解决方案**：
1. **推荐**：使用自动检测（默认行为，无需配置）
2. 使用 API 端点手动触发（需要先有一个管理员账号）
3. 在本地连接到生产数据库运行 seed

## 最佳实践

1. **首次部署**：使用自动检测（默认），无需任何配置
2. **重新初始化**：使用 API 端点或环境变量
3. **生产环境**：seed 完成后，建议移除 `RUN_SEED=true` 环境变量
4. **安全**：seed 完成后，修改默认密码（123456）


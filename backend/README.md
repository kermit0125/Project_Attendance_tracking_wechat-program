# 企业考勤系统 - 后端 API

企业考勤系统后端 API，使用 Node.js + TypeScript + Fastify + MySQL + Prisma 构建。提供员工打卡、请假申请、审批流程、统计报表等完整的考勤管理功能。

## 📋 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 接口列表](#api-接口列表)
- [测试账号](#测试账号)
- [使用 Postman 测试](#使用-postman-测试)
- [数据库设计](#数据库设计)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

## 🛠 技术栈

- **运行时**: Node.js ≥ 20
- **框架**: Fastify
- **语言**: TypeScript
- **数据库**: MySQL 8.x
- **ORM**: Prisma
- **参数校验**: Zod
- **鉴权**: JWT
- **密码加密**: bcrypt
- **日志**: pino (Fastify 默认)
- **安全**: cors、helmet、rate-limit

## 📁 项目结构

```
backend/
├── src/
│   ├── app.ts                 # 应用入口
│   ├── config/                # 配置
│   │   ├── env.ts            # 环境变量
│   │   └── prisma.ts         # Prisma 客户端
│   ├── routes/                # 路由层
│   │   ├── auth.routes.ts    # 认证路由
│   │   ├── punch.routes.ts   # 打卡路由
│   │   ├── request.routes.ts # 申请路由
│   │   ├── approval.routes.ts # 审批路由
│   │   ├── stats.routes.ts   # 统计路由
│   │   └── settings.routes.ts # 配置路由
│   ├── controllers/           # 控制器层
│   │   ├── auth.controller.ts
│   │   ├── punch.controller.ts
│   │   ├── request.controller.ts
│   │   ├── approval.controller.ts
│   │   └── stats.controller.ts
│   ├── services/              # 业务逻辑层
│   │   ├── auth.service.ts
│   │   ├── punch.service.ts
│   │   ├── request.service.ts
│   │   ├── approval.service.ts
│   │   └── stats.service.ts
│   ├── repositories/          # 数据访问层
│   │   ├── user.repository.ts
│   │   ├── punch.repository.ts
│   │   ├── request.repository.ts
│   │   └── work-schedule.repository.ts
│   ├── middlewares/           # 中间件
│   │   ├── auth.ts           # JWT 鉴权
│   │   ├── rbac.ts           # 权限控制
│   │   └── error-handler.ts  # 错误处理
│   ├── validators/            # 参数校验
│   │   ├── auth.ts
│   │   ├── punch.ts
│   │   └── request.ts
│   └── utils/                 # 工具函数
│       ├── errors.ts
│       ├── time.ts
│       ├── timezone.ts
│       └── distance.ts
├── prisma/
│   ├── schema.prisma         # Prisma Schema
│   └── seed.ts               # 种子数据
├── postman_collection.json   # Postman 测试集合
├── postman_environment.json  # Postman 环境配置
├── package.json
├── tsconfig.json
└── README.md                 # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="mysql://root:your_password@localhost:3306/attendance_app?charset=utf8mb4&connection_limit=10"

# JWT 密钥（生产环境请务必修改）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# 服务器配置
PORT=3000
NODE_ENV=development

# 日志级别
LOG_LEVEL=info

# 速率限制
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 初始化种子数据（创建测试账号和基础数据）
npm run prisma:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 5. 访问 API 文档

打开浏览器访问：`http://localhost:3000/docs`

## 📡 API 接口列表

### 认证模块

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/auth/login` | 用户登录 | ❌ |
| GET | `/auth/me` | 获取当前用户信息 | ✅ |

### 打卡模块

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/punch` | 创建打卡记录 | ✅ |
| GET | `/punch/today` | 获取今天的打卡记录 | ✅ |
| GET | `/punch/history` | 获取打卡历史 | ✅ |

### 申请模块

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| POST | `/requests` | 创建申请 | ✅ |
| GET | `/requests` | 获取申请列表 | ✅ |
| GET | `/requests/:id` | 获取申请详情 | ✅ |
| POST | `/requests/:id/cancel` | 取消申请 | ✅ |

### 审批模块（管理端）

| 方法 | 路径 | 说明 | 需要认证 | 需要权限 |
|------|------|------|----------|----------|
| GET | `/admin/approvals` | 获取待我审批列表 | ✅ | MANAGER/HR/ADMIN |
| GET | `/admin/approvals/:requestId` | 获取审批详情 | ✅ | MANAGER/HR/ADMIN |
| POST | `/admin/approvals/:requestId/decision` | 审批决策 | ✅ | MANAGER/HR/ADMIN |

### 统计模块

| 方法 | 路径 | 说明 | 需要认证 |
|------|------|------|----------|
| GET | `/stats/month` | 获取月度统计 | ✅ |

### 用户管理模块（HR/Admin）

| 方法 | 路径 | 说明 | 需要认证 | 需要权限 |
|------|------|------|----------|----------|
| GET | `/admin/users` | 获取用户列表 | ✅ | HR/ADMIN |
| GET | `/admin/users/:id` | 获取用户详情 | ✅ | HR/ADMIN |
| POST | `/admin/users` | 创建用户 | ✅ | HR/ADMIN |
| PUT | `/admin/users/:id` | 更新用户 | ✅ | HR/ADMIN |
| DELETE | `/admin/users/:id` | 删除用户 | ✅ | HR/ADMIN |
| GET | `/admin/departments` | 获取部门列表 | ✅ | HR/ADMIN |
| GET | `/admin/roles` | 获取角色列表 | ✅ | HR/ADMIN |

### 配置模块（HR/Admin）

| 方法 | 路径 | 说明 | 需要认证 | 需要权限 |
|------|------|------|----------|----------|
| GET | `/admin/settings/schedules` | 获取班次列表 | ✅ | HR/ADMIN |
| GET | `/admin/settings/geofences` | 获取围栏列表 | ✅ | HR/ADMIN |

## 👥 测试账号

运行 `npm run prisma:seed` 后会创建以下测试账号：

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | `admin@test.com` | `123456` | 拥有所有权限 |
| 主管 | `manager@test.com` | `123456` | 可以审批下属申请 |
| 员工 | `employee@test.com` | `123456` | 普通员工权限 |

## 🧪 使用 Postman 测试

### 快速导入（推荐）

项目已提供预配置的 Postman Collection 和环境文件：

1. **导入环境文件**
   - 打开 Postman
   - 点击 "Environments"
   - 点击 "Import"
   - 选择 `postman_environment.json`
   - 选择导入的环境

2. **导入 Collection**
   - 点击 "Collections"
   - 点击 "Import"
   - 选择 `postman_collection.json`

3. **开始测试**
   - 首先运行 "登录" 请求
   - Token 会自动保存到环境变量
   - 然后可以测试其他接口

### API 调用示例

#### 1. 用户登录

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "employee@test.com",
  "password": "123456"
}
```

#### 2. 上班打卡

```bash
POST /punch
Authorization: Bearer {token}
Content-Type: application/json

{
  "punchType": "IN",
  "lat": 39.9042,
  "lng": 116.4074,
  "accuracyM": 10,
  "verifyMethod": "PHOTO",
  "evidenceUrl": "https://example.com/photos/punch-in.jpg",
  "deviceInfo": "iPhone 15 Pro / iOS 17.0"
}
```

#### 3. 创建请假申请

```bash
POST /requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "requestType": "LEAVE",
  "startAt": "2024-01-20T09:00:00Z",
  "endAt": "2024-01-20T18:00:00Z",
  "leaveCategory": "年假",
  "reason": "个人事务"
}
```

#### 4. 审批申请

```bash
POST /admin/approvals/{requestId}/decision
Authorization: Bearer {token}
Content-Type: application/json

{
  "decision": "APPROVED",
  "comment": "同意",
  "approvedDurationMinutes": 480
}
```

## 🗄 数据库设计

### 核心表

- **User** - 用户表
- **Department** - 部门表
- **Organization** - 组织表
- **Punch** - 打卡记录表
- **Request** - 申请表（请假、出差、补卡、加班）
- **WorkSchedule** - 班次表
- **GeoFence** - 地理围栏表
- **Holiday** - 节假日表

### 关键字段说明

#### Request 表
- `requestType`: 申请类型（LEAVE/TRIP/FIX_PUNCH/OVERTIME）
- `status`: 状态（PENDING/APPROVED/REJECTED/CANCELLED）
- `durationMinutes`: 申请时长（分钟）
- `approvedDurationMinutes`: 审批后实际批准的时长（分钟）
- `startAt`: 开始时间
- `endAt`: 结束时间

#### Punch 表
- `punchType`: 打卡类型（IN/OUT）
- `punchedAt`: 打卡时间
- `lat/lng`: 地理位置
- `status`: 状态（NORMAL/LATE/EARLY/MISSING）

## 🔐 角色与权限

| 角色 | 权限说明 |
|------|----------|
| **EMPLOYEE** | 普通员工，可以打卡、申请、查看个人统计 |
| **MANAGER** | 主管，可以审批下属申请、查看团队统计 |
| **HR** | 人力资源，可以查看全员统计、配置规则 |
| **ADMIN** | 系统管理员，拥有所有权限 |

## 🛠 开发指南

### 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 数据库可视化
npm run prisma:studio

# 生成 Prisma Client
npm run prisma:generate

# 创建数据库迁移
npm run prisma:migrate

# 重置数据库
npm run prisma:reset
```

### 代码结构说明

#### 1. 路由层 (routes/)
- 定义 API 端点
- 配置请求验证（Zod schema）
- 配置响应格式（JSON Schema）

#### 2. 控制器层 (controllers/)
- 处理 HTTP 请求
- 调用服务层方法
- 返回 HTTP 响应

#### 3. 服务层 (services/)
- 业务逻辑处理
- 调用数据访问层
- 数据转换和验证

#### 4. 数据访问层 (repositories/)
- 数据库操作
- Prisma 查询封装

#### 5. 中间件 (middlewares/)
- JWT 认证
- 角色权限检查
- 错误处理

### 添加新功能

1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npm run prisma:migrate` 创建迁移
3. 在 `repositories/` 中创建数据访问方法
4. 在 `services/` 中实现业务逻辑
5. 在 `controllers/` 中创建控制器
6. 在 `routes/` 中定义路由
7. 在 `validators/` 中定义参数验证

## ❓ 常见问题

### 1. 数据库连接失败

**问题**：服务器启动失败，提示数据库连接错误

**解决方法**：
- 确认 MySQL 服务正在运行
- 检查 `.env` 文件中的 `DATABASE_URL` 配置
- 测试数据库连接：`mysql -u root -p`
- 确认数据库已创建：`CREATE DATABASE attendance_app;`

### 2. Token 过期或无效

**问题**：请求返回 401 未授权错误

**解决方法**：
- 重新登录获取新的 token
- 确保 Authorization header 格式正确：`Bearer {token}`
- 检查 JWT_SECRET 配置

### 3. 权限不足

**问题**：请求返回 403 禁止访问错误

**解决方法**：
- 检查当前账号的角色权限
- 使用具有相应权限的账号登录
- 参考角色权限表

### 4. 端口被占用

**问题**：服务器启动失败，提示端口 3000 被占用

**解决方法**：
- 修改 `.env` 文件中的 `PORT` 值
- 或关闭占用端口的进程

### 5. Prisma Client 未生成

**问题**：导入 Prisma Client 时报错

**解决方法**：
```bash
npm run prisma:generate
```

### 6. 时区问题

**问题**：时间显示不正确

**说明**：
- 系统使用北京时间（UTC+8）
- 数据库存储 UTC 时间
- API 返回时自动转换为北京时间

## 🚢 部署

### 推荐部署方案：Render Free Web Service

本项目推荐使用 Render 免费计划部署后端，支持自动 HTTPS、GitHub 自动部署等功能。

#### 1. 准备数据库（Aiven）

参考项目根目录 `README.md` 的"第一步：部署 MySQL 数据库（Aiven）"部分。

#### 2. 创建 render.yaml（可选但推荐）

在 `backend` 目录创建 `render.yaml`：

```yaml
services:
  - type: web
    name: attendance-api
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run prisma:generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: LOG_LEVEL
        value: info
      - key: RATE_LIMIT_MAX
        value: 100
      - key: RATE_LIMIT_TIME_WINDOW
        value: 60000
```

#### 3. 在 Render 创建 Web Service

1. 登录 https://dashboard.render.com/
2. 点击 **"New +"** → **"Web Service"**
3. 连接 GitHub 仓库
4. 配置服务：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

#### 4. 配置环境变量

在 Render 服务设置中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `PORT` | `10000` | Render 免费计划使用 10000 端口 |
| `DATABASE_URL` | `mysql://...` | Aiven 数据库连接字符串（需包含 `sslmode=REQUIRED`） |
| `JWT_SECRET` | `至少32位强密钥` | JWT 密钥 |
| `LOG_LEVEL` | `info` | 日志级别 |
| `RATE_LIMIT_MAX` | `100` | 速率限制 |
| `RATE_LIMIT_TIME_WINDOW` | `60000` | 速率限制时间窗口（毫秒） |

#### 5. 初始化数据库

在 Render Shell 中运行：

```bash
npm run prisma:migrate deploy
npm run prisma:seed
```

#### 6. 获取后端 URL

部署完成后，Render 会提供 URL，例如：
```
https://attendance-api.onrender.com
```

**⚠️ 重要提示**：
- Render 免费计划会在 15 分钟无活动后休眠，首次访问需要约 30 秒唤醒
- 使用 Uptime Robot 定期访问健康检查端点可保持服务活跃

### 其他部署方案

#### 使用 PM2 部署（VPS/服务器）

1. **设置环境变量**
```env
NODE_ENV=production
DATABASE_URL="mysql://user:password@host:3306/attendance_app"
JWT_SECRET=your-production-secret-key
PORT=3000
LOG_LEVEL=warn
```

2. **构建项目**
```bash
npm run build
```

3. **启动服务**
```bash
npm install -g pm2
pm2 start dist/app.js --name attendance-api
pm2 save
pm2 startup
```

#### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 注意事项

1. **生产环境**：务必修改 `JWT_SECRET` 和数据库密码
2. **数据库**：确保 MySQL 8.x 已安装并运行
3. **组织隔离**：所有业务数据按 `org_id` 隔离
4. **权限控制**：所有接口需要 JWT 认证（除登录外）
5. **Token 安全**：不要在代码或文档中硬编码 token
6. **日志记录**：生产环境建议配置日志文件
7. **备份策略**：定期备份数据库

## 📄 许可证

MIT

---

**最后更新**: 2025-01-07  
**版本**: 1.0.0  
**API 文档**: http://localhost:3000/docs

# 企业考勤管理系统

一个功能完整的企业考勤管理系统，支持打卡、请假、出差、补卡、加班申请及审批流程，提供统计报表等功能。

## 📋 项目简介

本系统采用前后端分离架构，为企业提供完整的考勤管理解决方案：

- **前端**：Vue 3 + TypeScript + Element Plus，提供现代化的用户界面
- **后端**：Node.js + Fastify + Prisma + MySQL，提供高性能的 RESTful API

## ✨ 核心功能

### 员工端功能
- ✅ **打卡管理**：上班/下班打卡，支持地理位置验证
- 📝 **申请管理**：请假、出差、补卡、加班申请
- 📊 **统计查询**：个人打卡历史、月度统计、工时汇总
- 👤 **个人中心**：查看个人信息和部门信息

### 管理端功能
- ✅ **审批管理**：审批员工申请，支持修改申请时长
- 👥 **用户管理**：创建、编辑、删除用户账号，分配角色和部门
- 📈 **团队统计**：查看团队考勤数据和异常情况
- ⚙️ **系统配置**：班次管理、地理围栏、节假日配置
- 📋 **审计日志**：查看系统操作记录

## 🛠 技术栈

### 前端技术
- **框架**：Vue 3 (Composition API)
- **语言**：TypeScript
- **构建工具**：Vite
- **UI 组件库**：Element Plus
- **路由**：Vue Router
- **状态管理**：Pinia
- **HTTP 客户端**：Axios

### 后端技术
- **运行时**：Node.js ≥ 20
- **框架**：Fastify
- **语言**：TypeScript
- **数据库**：MySQL 8.x
- **ORM**：Prisma
- **参数校验**：Zod
- **鉴权**：JWT
- **密码加密**：bcrypt

## 📁 项目结构

```
.
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # 状态管理
│   │   ├── utils/        # 工具函数
│   │   └── config/       # 配置文件
│   ├── package.json
│   └── README.md         # 前端详细文档
│
├── backend/              # 后端项目
│   ├── src/
│   │   ├── routes/       # 路由层
│   │   ├── controllers/  # 控制器
│   │   ├── services/     # 业务逻辑
│   │   ├── repositories/ # 数据访问
│   │   ├── middlewares/  # 中间件
│   │   ├── validators/   # 参数校验
│   │   └── utils/        # 工具函数
│   ├── prisma/
│   │   ├── schema.prisma # 数据库模型
│   │   └── seed.ts       # 种子数据
│   ├── package.json
│   └── README.md         # 后端详细文档
│
└── README.md             # 项目总览（本文件）
```

## 🚀 快速开始

### 环境要求

- Node.js ≥ 20
- MySQL ≥ 8.0
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd Project_Attendance_tracking_wechat-program
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 复制 .env.example 为 .env 并修改配置
cp .env.example .env

# 初始化数据库
npm run prisma:generate
npm run prisma:push  # 开发环境：直接同步 schema
npm run prisma:seed

# 启动后端服务
npm run dev
```

后端服务将在 `http://localhost:3000` 启动

### 3. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端服务
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

### 4. 访问系统

打开浏览器访问 `http://localhost:5173`，使用以下测试账号登录：

| 角色 | 邮箱 | 密码 | 权限 |
|------|------|------|------|
| 管理员 | `admin@test.com` | `123456` | 所有权限 |
| 主管 | `manager@test.com` | `123456` | 审批权限 |
| 员工 | `employee@test.com` | `123456` | 基本权限 |

## 📚 详细文档

- [前端文档](./frontend/README.md) - 前端架构、组件说明、开发指南
- [后端文档](./backend/README.md) - API 接口、数据库设计、部署指南
- [部署指南](#部署指南) - 完整的部署流程（Vercel + Render + Aiven）
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 部署步骤检查清单
- [用户管理指南](./USER_MANAGEMENT_GUIDE.md) - 用户管理功能使用说明

## 🔐 角色权限

| 角色 | 权限说明 |
|------|----------|
| **EMPLOYEE** | 普通员工，可以打卡、申请、查看个人统计 |
| **MANAGER** | 主管，可以审批下属申请、查看团队统计 |
| **HR** | 人力资源，可以查看全员统计、配置规则 |
| **ADMIN** | 系统管理员，拥有所有权限 |

## 📊 主要功能模块

### 1. 打卡模块
- 上班/下班打卡
- 地理位置验证
- 打卡历史查询
- 异常打卡提醒

### 2. 申请模块
- **请假申请**：支持多种请假类型，记录请假天数
- **出差申请**：记录出差时间和地点，计入工时
- **补卡申请**：补录遗漏的打卡记录，计入工时
- **加班申请**：记录加班时间，计入工时

### 3. 审批模块
- 待审批列表
- 审批详情查看
- 审批通过/驳回
- 修改申请时长
- 审批意见填写

### 4. 统计模块
- 月度考勤统计
- 工时汇总（基础工时 + 加班 + 补卡 + 出差）
- 请假天数统计
- 异常记录查询

### 5. 用户管理模块（Admin/HR）
- 用户列表查询（支持关键词搜索）
- 创建用户账号
- 编辑用户信息（姓名、邮箱、工号、部门、角色、状态）
- 删除用户（软删除）
- 部门管理
- 角色分配

## 🔧 开发指南

### 后端开发

```bash
cd backend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 数据库可视化
npm run prisma:studio

# 生成 Prisma Client
npm run prisma:generate
```

### 前端开发

```bash
cd frontend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check
```

## 🧪 测试

### 使用 Postman 测试 API

项目提供了完整的 Postman 配置文件：

1. 导入 `backend/postman_collection.json`
2. 导入 `backend/postman_environment.json`
3. 选择环境并开始测试

详细说明请参考 [后端文档](./backend/README.md)

## 📝 环境变量配置

### 后端环境变量 (.env)

```env
# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/attendance_app"

# JWT 密钥（生产环境务必修改）
JWT_SECRET=your-super-secret-jwt-key

# 服务器配置
PORT=3000
NODE_ENV=development

# 日志级别
LOG_LEVEL=info
```

### 前端环境变量 (.env.development)

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:3000
```

## 🚢 部署指南

本项目的推荐部署方案：

- **前端**：Vercel（免费，自动 HTTPS，全球 CDN）
- **后端**：Render Free Web Service（免费，自动 HTTPS）
- **数据库**：Aiven Free MySQL（免费 MySQL 数据库）

### 📋 部署前准备

1. **GitHub 账号**（用于连接 Vercel 和 Render）
2. **Aiven 账号**（注册地址：https://aiven.io/）
3. **Vercel 账号**（注册地址：https://vercel.com/）
4. **Render 账号**（注册地址：https://render.com/）

---

## 第一步：部署 MySQL 数据库（Aiven）

### 1.1 创建 Aiven 账号

1. 访问 https://aiven.io/ 注册账号
2. 完成邮箱验证

### 1.2 创建 MySQL 服务

1. 登录 Aiven 控制台
2. 点击 **"Create service"** 或 **"Create new service"**
3. 选择服务类型：
   - **Service type**: MySQL
   - **Cloud provider**: 选择离你最近的区域（如 AWS 的 `us-east-1`）
   - **Plan**: 选择 **Hobbyist**（免费计划）
   - **Service name**: `attendance-mysql`（或自定义）
4. 点击 **"Create service"**
5. 等待服务创建完成（约 2-5 分钟）

### 1.3 获取数据库连接信息

1. 在服务详情页面，找到 **"Connection information"** 部分
2. 记录以下信息：
   - **Host**: 数据库主机地址
   - **Port**: 端口号（通常是 3306）
   - **Database name**: 默认数据库名
   - **Username**: 数据库用户名
   - **Password**: 数据库密码

### 1.4 创建数据库

1. 点击 **"Databases"** 标签
2. 点击 **"Create database"**
3. 输入数据库名：`attendance_app`
4. 点击 **"Create"**

### 1.5 构建数据库连接字符串

根据获取的信息，构建连接字符串：

```
mysql://用户名:密码@主机:端口/attendance_app?sslmode=REQUIRED
```

例如：
```
mysql://avnadmin:your_password@attendance-mysql-xxx.a.aivencloud.com:3306/attendance_app?sslmode=REQUIRED
```

**⚠️ 重要**：Aiven 要求使用 SSL 连接，所以必须在连接字符串中添加 `sslmode=REQUIRED`

### 1.6 测试数据库连接（可选）

使用本地工具（如 MySQL Workbench、DBeaver）或命令行测试连接：

```bashd
mysql -h <主机地址> -P <端口> -u <用户名> -p<密码> attendance_app
```

---

## 第二步：部署后端（Render）

### 2.1 准备后端代码

确保 `backend` 目录包含以下文件：

```
backend/
├── src/
├── prisma/
├── package.json
├── tsconfig.json
└── render.yaml (可选，用于自动配置)
```

### 2.2 创建 render.yaml（可选但推荐）

在 `backend` 目录创建 `render.yaml` 文件：

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

### 2.3 将代码推送到 GitHub

```bash
git add .
git commit -m "准备部署到 Render"
git push origin main
```

### 2.4 在 Render 创建 Web Service

1. 登录 Render 控制台：https://dashboard.render.com/
2. 点击 **"New +"** → **"Web Service"**
3. 连接 GitHub 仓库：
   - 如果首次使用，点击 **"Connect GitHub"** 授权
   - 选择包含本项目的仓库
   - 选择仓库分支（通常是 `main` 或 `master`）
4. 配置服务：
   - **Name**: `attendance-api`（或自定义）
   - **Region**: 选择离你最近的区域（推荐 Singapore 或 US East）
   - **Branch**: `main`（或你的主分支）
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm run start:migrate`
   - **Plan**: `Free`（免费计划）

### 2.5 配置环境变量

在 Render 服务设置页面的 **"Environment"** 部分，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `PORT` | `10000` | Render 免费计划使用 10000 端口 |
| `DATABASE_URL` | `mysql://...` | Aiven 数据库连接字符串（步骤 1.5） |
| `JWT_SECRET` | `your-super-secret-jwt-key-至少32位` | JWT 密钥（生产环境务必使用强密钥） |
| `LOG_LEVEL` | `info` | 日志级别 |
| `RATE_LIMIT_MAX` | `100` | 速率限制最大值 |
| `RATE_LIMIT_TIME_WINDOW` | `60000` | 速率限制时间窗口（毫秒） |

**⚠️ 重要提示**：
- `JWT_SECRET` 建议使用随机生成的强密钥（至少 32 位）
- `DATABASE_URL` 必须包含 `sslmode=REQUIRED`

### 2.6 数据库初始化

**✅ 自动初始化**：应用启动时会自动执行数据库迁移和种子数据初始化，无需手动操作。

启动脚本（`scripts/start-with-migration.ts`）会在应用启动前：
1. 生成 Prisma Client
2. 自动应用所有未应用的数据库迁移（`prisma migrate deploy`）
3. **自动检测并运行种子数据**：
   - 如果数据库为空（没有角色和组织），**自动运行 seed**
   - 或者设置环境变量 `RUN_SEED=true` 或 `AUTO_SEED=true` 强制运行

**种子数据初始化方式**（按优先级）：

1. **自动检测（推荐）**：如果数据库为空，启动脚本会自动运行 seed，无需任何配置
2. **环境变量**：在 Render 环境变量中添加 `RUN_SEED=true` 或 `AUTO_SEED=true`
3. **API 端点**：部署后，使用管理员账号调用 `POST /admin/system/seed`（需要管理员权限）
4. **本地运行**：在 `backend` 目录创建 `.env` 文件，添加 `DATABASE_URL`，然后运行 `npm run prisma:seed`

**备选方案：本地初始化数据库**（如果自动迁移失败）

如果自动迁移失败，可以在本地连接到 Aiven 数据库执行迁移：

1. 在 `backend` 目录创建 `.env` 文件
2. 添加 Aiven 的 `DATABASE_URL` 环境变量
3. 运行：

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:deploy  # 应用迁移
npm run prisma:seed            # 运行种子数据（可选）
```

### 2.7 获取后端 URL

部署完成后，Render 会提供一个 URL，例如：
```
https://attendance-api.onrender.com
```

记录这个 URL，下一步部署前端时需要用到。

### 2.8 验证后端部署

访问以下地址验证部署是否成功：

- 健康检查：`https://your-api-url.onrender.com/health`
- API 文档：`https://your-api-url.onrender.com/docs`

---

## 第三步：部署前端（Vercel）

### 3.1 准备前端代码

确保 `frontend` 目录包含以下文件：

```
frontend/
├── src/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── vercel.json (可选，用于配置)
```

### 3.2 创建 vercel.json（可选）

在 `frontend` 目录创建 `vercel.json` 文件：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3.3 创建生产环境配置文件

在 `frontend` 目录创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-api-url.onrender.com
```

**⚠️ 注意**：将 `your-api-url.onrender.com` 替换为你的 Render 后端 URL

### 3.4 将代码推送到 GitHub

```bash
git add .
git commit -m "准备部署前端到 Vercel"
git push origin main
```

### 3.5 在 Vercel 创建项目

1. 登录 Vercel 控制台：https://vercel.com/
2. 点击 **"Add New..."** → **"Project"**
3. 连接 GitHub 仓库：
   - 如果首次使用，点击 **"Import Git Repository"** 并授权
   - 搜索并选择包含本项目的仓库
4. 配置项目：
   - **Project Name**: `attendance-frontend`（或自定义）
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`（通常会自动检测）
   - **Output Directory**: `dist`（通常会自动检测）
   - **Install Command**: `npm install`（通常会自动检测）

### 3.6 配置环境变量

在 Vercel 项目设置页面的 **"Environment Variables"** 部分，添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://your-api-url.onrender.com` | Production, Preview |

**⚠️ 注意**：将 `your-api-url.onrender.com` 替换为你的 Render 后端 URL

### 3.7 部署

1. 点击 **"Deploy"**
2. 等待构建完成（约 1-2 分钟）
3. Vercel 会自动提供一个 URL，例如：
   ```
   https://attendance-frontend.vercel.app
   ```

### 3.8 验证前端部署

1. 访问 Vercel 提供的 URL
2. 尝试登录系统
3. 检查浏览器控制台是否有错误

---

## 第四步：配置 CORS（重要）

### 4.1 更新后端 CORS 配置

**✅ 代码已自动支持 CORS 环境变量配置**

在 Render 服务的环境变量中，添加前端域名到 CORS 白名单：

**推荐方式：使用环境变量配置**

在 Render 环境变量中添加：
```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

如果需要允许多个域名，用逗号分隔：
```
CORS_ORIGIN=http://localhost:5173,https://your-frontend-url.vercel.app
```

**说明**：
- 如果设置了 `CORS_ORIGIN`，后端只会允许列表中的域名访问
- 如果没有设置 `CORS_ORIGIN`，后端会允许所有来源（开发环境默认行为）
- 代码已自动从 `backend/src/config/env.ts` 读取配置，并在 `backend/src/app.ts` 中使用

### 4.2 更新前端 API 地址

确保 `frontend/.env.production` 中的 API 地址正确指向 Render 后端。

---

## 第五步：最终测试

### 5.1 测试前端

1. 访问 Vercel 前端 URL
2. 使用测试账号登录：
   - 邮箱：`admin@test.com`
   - 密码：`123456`
3. 测试各个功能模块

### 5.2 测试后端

1. 访问 `https://your-api-url.onrender.com/docs` 查看 API 文档
2. 测试登录接口
3. 检查数据库连接

---

## 🔧 部署后维护

### 数据库迁移

如果更新了数据库模型：

1. **开发环境**：在本地运行 `npm run prisma:push` 直接同步 schema
2. **生产环境**：
   - 在本地运行 `npm run prisma:migrate` 创建迁移文件
   - 推送到 GitHub
   - 在 Render Shell 中运行 `npm run prisma:migrate:deploy` 应用迁移

### 更新代码

1. 本地修改代码
2. 提交到 GitHub
3. Vercel 和 Render 会自动重新部署（如果已连接 GitHub）

### 查看日志

- **Render 日志**：在 Render 服务页面点击 **"Logs"** 标签
- **Vercel 日志**：在 Vercel 项目页面点击 **"Deployments"** → 选择部署 → 查看日志

---

## ⚠️ 免费计划限制

### Render Free 限制

- **服务休眠**：15 分钟无活动后自动休眠，首次访问需要约 30 秒唤醒
- **带宽限制**：每月 100GB
- **运行时间**：750 小时/月

**解决方案**：
- 使用 Uptime Robot（免费）定期访问健康检查端点保持服务活跃
- 升级到付费计划

### Vercel Free 限制

- **构建时间**：每月 6000 分钟
- **带宽**：每月 100GB
- **服务器函数执行时间**：10 秒（本项目不使用）

### Aiven Free 限制

- **存储空间**：有限
- **连接数**：有限
- **备份保留**：7 天

---

## 🐛 常见部署问题

### 问题 1：Render 服务启动失败

**检查清单**：
- ✅ 环境变量是否正确配置
- ✅ `DATABASE_URL` 是否包含 `sslmode=REQUIRED`
- ✅ `PORT` 是否设置为 `10000`
- ✅ `buildCommand` 和 `startCommand` 是否正确
- ✅ 查看 Render 日志确认具体错误

### 问题 2：数据库连接失败

**可能原因**：
- Aiven 数据库服务未启动
- 连接字符串格式错误
- SSL 模式未启用（必须使用 `sslmode=REQUIRED`）
- 防火墙阻止连接

**解决方案**：
- 检查 Aiven 服务状态
- 验证连接字符串格式
- 确保连接字符串包含 `sslmode=REQUIRED`

### 问题 3：前端无法连接后端（CORS 错误）

**解决方案**：
1. 检查后端 CORS 配置是否包含前端域名
2. 确认前端 `VITE_API_BASE_URL` 环境变量正确
3. 清除浏览器缓存后重试

### 问题 4：Vercel 构建失败

**检查清单**：
- ✅ Node.js 版本是否正确（Vercel 默认使用 18.x，可能需要指定 20.x）
- ✅ 依赖是否正确安装
- ✅ 构建命令是否正确

**指定 Node.js 版本**：
在 `frontend/package.json` 中添加：

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

或在 Vercel 项目设置中指定 Node.js 版本。

### 问题 5：Render 服务休眠

**症状**：首次访问需要等待 30 秒左右

**解决方案**：
- 使用 Uptime Robot（https://uptimerobot.com/）设置每分钟 ping 一次健康检查端点
- 或升级到付费计划

---

## 📚 相关资源

- [Aiven 文档](https://docs.aiven.io/)
- [Render 文档](https://render.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)

---

## 🔒 安全建议

1. **JWT_SECRET**：使用强随机密钥（至少 32 位字符）
2. **数据库密码**：Aiven 会自动生成强密码，请妥善保存
3. **HTTPS**：Vercel 和 Render 自动提供 HTTPS，无需额外配置
4. **环境变量**：不要在代码中硬编码敏感信息
5. **定期备份**：Aiven 提供自动备份，但建议定期导出数据

---

**部署完成后，你的应用将拥有：**
- ✅ 全球 CDN 加速的前端（Vercel）
- ✅ 自动 HTTPS 加密
- ✅ 生产级数据库（Aiven）
- ✅ 自动部署和回滚（GitHub 集成）

## ⚠️ 注意事项

1. **生产环境**：务必修改 `JWT_SECRET` 和数据库密码
2. **数据库**：确保 MySQL 8.x 已安装并运行
3. **组织隔离**：所有业务数据按 `org_id` 隔离
4. **权限控制**：所有接口需要 JWT 认证（除登录外）
5. **Token 安全**：不要在代码或文档中硬编码 token

## 🐛 常见问题

### 后端启动失败

1. 检查 MySQL 服务是否运行
2. 检查 `.env` 文件配置是否正确
3. 确认数据库已创建：`CREATE DATABASE attendance_app;`
4. 运行数据库迁移：`npm run prisma:generate`

### 前端无法连接后端

1. 检查后端服务是否启动
2. 检查前端 `.env.development` 中的 API 地址
3. 检查浏览器控制台的网络请求

### 登录失败

1. 确认已运行种子数据：`npm run prisma:seed`
2. 检查数据库中是否有用户数据
3. 查看后端日志确认错误信息

## 📄 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**: 2025-01-07  
**版本**: 1.0.0


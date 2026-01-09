# 企业考勤管理系统

一个功能完整的企业考勤管理系统，支持打卡、请假、出差、补卡、加班申请及审批流程，提供统计报表等功能。

> **📝 授权声明**：本项目经 **上海润岚过滤设备有限公司** 明确授权和批准后公开发布。所有代码和文档均用于教育和作品集展示目的。

> **🌐 语言**: [English](README.md) | [中文](README.zh.md)

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
└── README.md             # 项目总览（英文版）
└── README.zh.md          # 项目总览（中文版）
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

### 推荐部署方案

- **前端**：Vercel（免费，自动 HTTPS，全球 CDN）
- **后端**：Render Free Web Service（免费，自动 HTTPS）
- **数据库**：Aiven Free MySQL（免费 MySQL 数据库）

### 部署步骤

1. **部署 MySQL 数据库（Aiven）**
   - 在 https://aiven.io/ 创建账号
   - 创建 MySQL 服务（Hobbyist 计划）
   - 创建数据库 `attendance_app`
   - 获取连接字符串（需包含 SSL）：`mysql://user:pass@host:port/attendance_app?sslmode=REQUIRED`

2. **部署后端（Render）**
   - 连接 GitHub 仓库
   - 设置 Root Directory: `backend`
   - Build Command: `npm install && npm run prisma:generate && npm run build`
   - Start Command: `npm run start:migrate`
   - 配置环境变量（DATABASE_URL, JWT_SECRET 等）

3. **部署前端（Vercel）**
   - 连接 GitHub 仓库
   - 设置 Root Directory: `frontend`
   - Framework Preset: `Vite`
   - 配置环境变量：`VITE_API_BASE_URL`

4. **配置 CORS**
   - 在后端 CORS 配置中添加前端域名

详细部署说明请参考 [后端文档](./backend/README.md) 中的部署部分。

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

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

本项目为 **上海润岚过滤设备有限公司** 开发，经授权后公开发布，用于教育和作品集展示目的。

---

**最后更新**: 2025-01-07  
**版本**: 1.0.0


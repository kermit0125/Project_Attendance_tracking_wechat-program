# 部署检查清单

使用本清单确保部署过程顺利进行。

## 📋 部署前准备

### 1. 账号准备
- [ ] GitHub 账号已注册
- [ ] Aiven 账号已注册（https://aiven.io/）
- [ ] Render 账号已注册（https://render.com/）
- [ ] Vercel 账号已注册（https://vercel.com/）

### 2. 代码准备
- [ ] 代码已推送到 GitHub 仓库
- [ ] `backend/render.yaml` 已创建（可选）
- [ ] `frontend/vercel.json` 已创建（可选）
- [ ] `frontend/.env.production` 已创建（待填写后端 URL）

---

## 🗄️ 第一步：数据库（Aiven）

### 创建 MySQL 服务
- [ ] 已创建 MySQL 服务（Hobbyist 免费计划）
- [ ] 记录服务信息：
  - [ ] Host（主机地址）
  - [ ] Port（端口，通常是 3306）
  - [ ] Username（用户名）
  - [ ] Password（密码）
- [ ] 已创建数据库：`attendance_app`
- [ ] 已构建连接字符串（包含 `sslmode=REQUIRED`）

### 测试数据库连接
- [ ] 使用 MySQL 客户端测试连接成功
- [ ] 确认 SSL 连接正常

---

## 🚀 第二步：后端（Render）

### 创建 Web Service
- [ ] 已连接 GitHub 仓库
- [ ] Root Directory 设置为 `backend`
- [ ] Build Command 设置为 `npm install && npm run prisma:generate && npm run build`
- [ ] Start Command 设置为 `npm start`
- [ ] Plan 选择为 `Free`

### 配置环境变量
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `DATABASE_URL` = `mysql://...`（包含 `sslmode=REQUIRED`）
- [ ] `JWT_SECRET` = `至少32位强密钥`（建议使用 Render 自动生成）
- [ ] `LOG_LEVEL` = `info`
- [ ] `RATE_LIMIT_MAX` = `100`
- [ ] `RATE_LIMIT_TIME_WINDOW` = `60000`

### 部署后操作
- [ ] 服务已成功部署
- [ ] 记录后端 URL（例如：`https://attendance-api.onrender.com`）
- [ ] 访问健康检查端点：`/health` 返回正常
- [ ] 在 Render Shell 中运行数据库迁移：
  ```bash
  npm run prisma:migrate deploy
  npm run prisma:seed
  ```
- [ ] 访问 API 文档：`/docs` 可以正常打开

### 测试后端
- [ ] 测试登录接口：`POST /auth/login`
- [ ] 测试获取用户信息：`GET /auth/me`（需要 token）

---

## 🌐 第三步：前端（Vercel）

### 准备前端配置
- [ ] `frontend/vercel.json` 已创建
- [ ] `frontend/.env.production` 已创建
- [ ] `.env.production` 中已设置后端 URL：`VITE_API_BASE_URL=https://your-api-url.onrender.com`

### 创建 Vercel 项目
- [ ] 已连接 GitHub 仓库
- [ ] Framework Preset 选择为 `Vite`
- [ ] Root Directory 设置为 `frontend`
- [ ] Build Command 自动检测为 `npm run build`
- [ ] Output Directory 自动检测为 `dist`

### 配置环境变量
- [ ] `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com`
- [ ] 环境设置为 `Production` 和 `Preview`

### 部署后操作
- [ ] 前端已成功部署
- [ ] 记录前端 URL（例如：`https://attendance-frontend.vercel.app`）
- [ ] 前端页面可以正常访问

---

## 🔧 第四步：配置 CORS

### 后端 CORS 配置
- [ ] 检查后端 CORS 配置包含前端域名
- [ ] 如果使用环境变量，确保 `CORS_ORIGIN` 已设置

### 前端 API 地址
- [ ] 确认 `.env.production` 中的后端 URL 正确
- [ ] 确认 Vercel 环境变量已更新

---

## ✅ 第五步：最终测试

### 前端功能测试
- [ ] 访问前端 URL，页面正常加载
- [ ] 尝试登录：
  - 邮箱：`admin@test.com`
  - 密码：`123456`
- [ ] 登录成功后，可以访问各个页面
- [ ] 测试打卡功能
- [ ] 测试申请创建功能
- [ ] 测试统计功能

### 后端功能测试
- [ ] API 文档可以访问：`https://your-api-url.onrender.com/docs`
- [ ] 测试各个 API 接口
- [ ] 检查数据库连接是否正常
- [ ] 检查日志是否有错误

### 浏览器控制台
- [ ] 打开浏览器开发者工具
- [ ] 检查 Console 是否有错误
- [ ] 检查 Network 标签，API 请求是否正常
- [ ] 确认没有 CORS 错误

---

## 🔒 安全检查

### 环境变量
- [ ] `JWT_SECRET` 使用强密钥（至少 32 位）
- [ ] 数据库密码未泄露
- [ ] 所有敏感信息都通过环境变量配置

### HTTPS
- [ ] 前端使用 HTTPS（Vercel 自动提供）
- [ ] 后端使用 HTTPS（Render 自动提供）
- [ ] 数据库使用 SSL 连接（Aiven 要求）

---

## 📊 性能优化（可选）

### Render 服务休眠问题
- [ ] 了解 Render 免费计划会在 15 分钟无活动后休眠
- [ ] 如需保持服务活跃，考虑使用 Uptime Robot
- [ ] 或接受首次访问需要约 30 秒唤醒时间

### 前端性能
- [ ] 检查 Vercel 构建日志，确认构建成功
- [ ] 检查页面加载速度
- [ ] 确认静态资源已正确缓存

---

## 🐛 常见问题处理

### 后端启动失败
- [ ] 检查 Render 日志
- [ ] 确认环境变量配置正确
- [ ] 确认 `DATABASE_URL` 包含 `sslmode=REQUIRED`
- [ ] 确认 `PORT` 设置为 `10000`

### 数据库连接失败
- [ ] 检查 Aiven 服务状态
- [ ] 确认连接字符串格式正确
- [ ] 确认 SSL 模式已启用
- [ ] 测试数据库连接

### CORS 错误
- [ ] 确认后端 CORS 配置包含前端域名
- [ ] 确认前端 API 地址正确
- [ ] 清除浏览器缓存

### 前端构建失败
- [ ] 检查 Vercel 构建日志
- [ ] 确认 Node.js 版本（建议 20.x）
- [ ] 确认依赖正确安装

---

## 📝 记录信息

完成部署后，请记录以下信息：

### 后端信息
- **Render URL**: `https://____________________.onrender.com`
- **健康检查**: `https://____________________.onrender.com/health`
- **API 文档**: `https://____________________.onrender.com/docs`

### 前端信息
- **Vercel URL**: `https://____________________.vercel.app`
- **生产环境 API 地址**: `https://____________________.onrender.com`

### 数据库信息
- **Aiven 服务名**: `____________________`
- **数据库名**: `attendance_app`
- **连接字符串**: `mysql://...`（请妥善保管）

---

## 🎉 部署完成

恭喜！部署完成后，您的应用已经可以使用了。

**下一步建议**：
- 定期检查服务日志
- 监控服务状态
- 定期备份数据库
- 考虑升级到付费计划以获得更好的性能

---

**部署日期**: _______________
**部署人员**: _______________


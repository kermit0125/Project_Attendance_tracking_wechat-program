# 部署指南

## 快速部署

### 方式 1: 部署所有更改（推荐）

```powershell
.\deploy.ps1
```

或指定提交信息：

```powershell
.\deploy.ps1 -CommitMessage "修复数据库迁移问题"
```

### 方式 2: 仅部署后端

```powershell
.\deploy-backend.ps1
```

或指定提交信息：

```powershell
.\deploy-backend.ps1 -CommitMessage "更新后端配置"
```

### 方式 3: 仅部署前端

```powershell
.\deploy-frontend.ps1
```

或指定提交信息：

```powershell
.\deploy-frontend.ps1 -CommitMessage "修复前端类型错误"
```

## 手动部署步骤

如果脚本无法使用，可以手动执行以下命令：

```powershell
# 1. 检查状态
git status

# 2. 添加更改
git add .

# 3. 提交更改
git commit -m "你的提交信息"

# 4. 推送到 GitHub
git push origin main
```

## 部署后检查

部署完成后，检查以下内容：

### 后端（Render）
1. 访问 Render 控制台：https://dashboard.render.com/
2. 查看部署日志，确认：
   - ✅ 构建成功
   - ✅ 数据库迁移成功
   - ✅ 应用启动成功
3. 测试健康检查端点：`https://your-api-url.onrender.com/health`

### 前端（Vercel）
1. 访问 Vercel 控制台：https://vercel.com/dashboard
2. 查看部署日志，确认：
   - ✅ 构建成功
   - ✅ 没有 TypeScript 错误
3. 访问前端 URL，测试功能

## 常见问题

### Q: 脚本执行失败怎么办？

**A:** 检查以下几点：
1. 确保在项目根目录运行脚本
2. 确保 Git 已正确配置
3. 确保有推送权限

### Q: 如何查看部署进度？

**A:** 
- Render: 在 Render 控制台查看 "Events" 标签
- Vercel: 在 Vercel 控制台查看部署历史

### Q: 部署失败怎么办？

**A:**
1. 查看部署日志中的错误信息
2. 检查环境变量是否正确设置
3. 检查代码是否有语法错误
4. 参考 `DEPLOYMENT_CHECKLIST.md` 进行排查

## 环境变量检查清单

部署前确保以下环境变量已设置：

### Render（后端）
- [ ] `DATABASE_URL` - 数据库连接字符串
- [ ] `JWT_SECRET` - JWT 密钥
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `AUTO_FIX_DB` = `true`（如果需要自动修复数据库）

### Vercel（前端）
- [ ] `VITE_API_BASE_URL` - 后端 API 地址

## 提示

- 部署通常需要 2-5 分钟
- Render 免费计划在 15 分钟无活动后会休眠，首次访问可能需要 30 秒唤醒
- 建议在部署后立即测试，确保服务正常运行


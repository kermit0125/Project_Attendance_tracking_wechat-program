# 企业考勤系统部署脚本
# 使用方法: .\deploy.ps1 [commit-message]

param(
    [string]$CommitMessage = "部署更新"
)

Write-Host "🚀 开始部署流程..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 检查是否在 Git 仓库中
if (-not (Test-Path .git)) {
    Write-Host "❌ 错误: 当前目录不是 Git 仓库" -ForegroundColor Red
    exit 1
}

# 1. 检查 Git 状态
Write-Host "`n1️⃣ 检查 Git 状态..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "   发现以下更改:" -ForegroundColor Green
    git status --short
} else {
    Write-Host "   ✅ 没有未提交的更改" -ForegroundColor Green
    Write-Host "`n   是否继续部署？(Y/N): " -NoNewline -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        Write-Host "   部署已取消" -ForegroundColor Yellow
        exit 0
    }
}

# 2. 添加所有更改
Write-Host "`n2️⃣ 添加所有更改到 Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Git add 失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ 更改已添加" -ForegroundColor Green

# 3. 提交更改
Write-Host "`n3️⃣ 提交更改..." -ForegroundColor Yellow
Write-Host "   提交信息: $CommitMessage" -ForegroundColor Gray
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  提交失败或没有更改需要提交" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ 更改已提交" -ForegroundColor Green
}

# 4. 推送到 GitHub
Write-Host "`n4️⃣ 推送到 GitHub..." -ForegroundColor Yellow
Write-Host "   正在推送到 main 分支..." -ForegroundColor Gray
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ 推送失败" -ForegroundColor Red
    Write-Host "   请检查网络连接和 Git 配置" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ 代码已推送到 GitHub" -ForegroundColor Green

# 5. 显示部署信息
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "`n📋 下一步:" -ForegroundColor Cyan
Write-Host "   1. Render 会自动检测到代码更新并开始部署后端" -ForegroundColor White
Write-Host "   2. Vercel 会自动检测到代码更新并开始部署前端" -ForegroundColor White
Write-Host "   3. 查看部署状态:" -ForegroundColor White
Write-Host "      - Render: https://dashboard.render.com/" -ForegroundColor Gray
Write-Host "      - Vercel: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "`n💡 提示: 部署通常需要 2-5 分钟完成" -ForegroundColor Yellow


# 前端部署脚本
# 仅部署前端代码到 GitHub

param(
    [string]$CommitMessage = "更新前端代码"
)

Write-Host "🚀 开始部署前端..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 检查是否在项目根目录
if (-not (Test-Path "frontend")) {
    Write-Host "❌ 错误: 未找到 frontend 目录，请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Git 状态
Write-Host "`n1️⃣ 检查 Git 状态..." -ForegroundColor Yellow
$frontendChanges = git status --porcelain frontend/
if ($frontendChanges) {
    Write-Host "   发现前端更改:" -ForegroundColor Green
    git status --short frontend/
} else {
    Write-Host "   ⚠️  没有前端更改" -ForegroundColor Yellow
    Write-Host "   是否继续？(Y/N): " -NoNewline -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 0
    }
}

# 添加前端更改
Write-Host "`n2️⃣ 添加前端更改..." -ForegroundColor Yellow
git add frontend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Git add 失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ 更改已添加" -ForegroundColor Green

# 提交
Write-Host "`n3️⃣ 提交更改..." -ForegroundColor Yellow
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  提交失败或没有更改需要提交" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ 更改已提交" -ForegroundColor Green
}

# 推送
Write-Host "`n4️⃣ 推送到 GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ 推送失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ 代码已推送到 GitHub" -ForegroundColor Green

Write-Host "`n✅ 前端部署完成！Vercel 会自动开始部署..." -ForegroundColor Green


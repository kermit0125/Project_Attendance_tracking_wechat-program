# 企业考勤系统环境配置脚本
# 使用方法：在 PowerShell 中运行 .\setup-env.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "企业考勤系统环境配置向导" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 .env 文件是否已存在
if (Test-Path ".env") {
    Write-Host "⚠️  .env 文件已存在" -ForegroundColor Yellow
    $overwrite = Read-Host "是否覆盖? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "已取消" -ForegroundColor Red
        exit
    }
}

# 创建 .env 文件内容
$envContent = @"
# 数据库配置
DATABASE_URL="mysql://root:Wygg13636534617.@localhost:3306/attendance_app?charset=utf8mb4&connection_limit=10"

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
"@

# 写入 .env 文件
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host "✅ .env 文件创建成功！" -ForegroundColor Green
Write-Host ""

# 显示配置信息
Write-Host "当前配置：" -ForegroundColor Cyan
Write-Host "  数据库: attendance_app" -ForegroundColor White
Write-Host "  用户名: root" -ForegroundColor White
Write-Host "  端口: 3000" -ForegroundColor White
Write-Host ""

# 询问是否立即测试数据库连接
Write-Host "是否测试数据库连接? (y/n): " -ForegroundColor Yellow -NoNewline
$testDb = Read-Host

if ($testDb -eq "y") {
    Write-Host "正在测试数据库连接..." -ForegroundColor Cyan
    
    # 尝试连接数据库（需要 mysql 命令行工具）
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
    
    if ($mysqlPath) {
        Write-Host "请输入数据库密码: " -NoNewline
        $password = Read-Host -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
        $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        $testResult = mysql -u root -p$plainPassword -h localhost -P 3306 -e "USE attendance_app; SELECT 'Connection OK' as status;" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 数据库连接成功！" -ForegroundColor Green
        } else {
            Write-Host "❌ 数据库连接失败，请检查配置" -ForegroundColor Red
            Write-Host $testResult -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  未找到 mysql 命令行工具，跳过测试" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. 生成 Prisma Client:" -ForegroundColor White
Write-Host "   npm run prisma:generate" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 初始化种子数据（可选）:" -ForegroundColor White
Write-Host "   npm run prisma:seed" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 启动开发服务器:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 访问 API 文档:" -ForegroundColor White
Write-Host "   http://localhost:3000/docs" -ForegroundColor Gray
Write-Host ""


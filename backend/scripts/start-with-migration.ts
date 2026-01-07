import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

async function runCommand(command: string, cwd: string = process.cwd()) {
  console.log(`\n📋 执行命令: ${command}`);
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return { success: true, stdout, stderr };
  } catch (error: any) {
    console.error(`❌ 命令执行失败: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return { success: false, error };
  }
}

async function main() {
  const backendDir = path.resolve(__dirname, '..');
  
  console.log('🚀 开始启动应用...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. 生成 Prisma Client（如果还没有）
  console.log('\n1️⃣ 生成 Prisma Client...');
  await runCommand('npx prisma generate', backendDir);
  
  // 1.5. 修复迁移文件（如果存在 CURRENT_TIMESTAMP(3) 问题）
  // 这是 Prisma 5.22.0 的已知 bug，会自动修复
  console.log('\n1️⃣.5️⃣ 检查并修复迁移文件（修复 Prisma 5.22.0 的 CURRENT_TIMESTAMP(3) bug）...');
  const fixResult = await runCommand('npm run prisma:fix-migrations', backendDir);
  if (fixResult && fixResult.success !== false) {
    console.log('✅ 迁移文件检查完成');
  }
  
  // 2. 应用数据库迁移
  console.log('\n2️⃣ 应用数据库迁移...');
  try {
    const migrateResult = await runCommand('npx prisma migrate deploy', backendDir);
    
    if (!migrateResult.success) {
      console.warn('\n⚠️  数据库迁移失败，但继续启动应用...');
      console.warn('   这可能是正常的（迁移已应用），或者请检查数据库连接');
      console.warn('   如果是首次部署，请确保 DATABASE_URL 环境变量已正确设置');
    } else {
      console.log('✅ 数据库迁移完成');
    }
  } catch (error: any) {
    console.warn('\n⚠️  迁移过程中出现错误，但继续启动应用...');
    console.warn('   错误:', error.message);
  }
  
  // 3. 运行种子数据（可选，只在开发环境或首次部署时）
  const shouldSeed = process.env.RUN_SEED === 'true';
  if (shouldSeed) {
    console.log('\n3️⃣ 运行种子数据...');
    await runCommand('npx tsx prisma/seed.ts', backendDir);
  } else {
    console.log('\n3️⃣ 跳过种子数据（设置 RUN_SEED=true 以启用）');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 初始化完成，启动应用...\n');
  
  // 4. 启动应用
  const { spawn } = require('child_process');
  const app = spawn('node', ['dist/app.js'], {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  });
  
  app.on('error', (error: Error) => {
    console.error('❌ 应用启动失败:', error);
    process.exit(1);
  });
  
  app.on('exit', (code: number) => {
    console.log(`\n应用退出，代码: ${code}`);
    process.exit(code || 0);
  });
  
  // 处理进程终止信号
  process.on('SIGTERM', () => {
    console.log('\n收到 SIGTERM 信号，正在关闭应用...');
    app.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('\n收到 SIGINT 信号，正在关闭应用...');
    app.kill('SIGINT');
  });
}

main().catch((error) => {
  console.error('❌ 启动脚本执行失败:', error);
  process.exit(1);
});


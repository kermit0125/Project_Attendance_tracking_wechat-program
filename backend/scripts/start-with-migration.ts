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
  // 确保错误能被看到
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的 Promise 拒绝:', reason);
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    process.exit(1);
  });

  // 计算 backend 目录
  // 脚本可能的位置：
  // 1. dist/scripts/start-with-migration.js (生产环境，编译后)
  // 2. scripts/start-with-migration.ts (开发环境)
  const scriptDir = __dirname;
  console.log(`🔍 脚本目录: ${scriptDir}`);
  
  let backendDir: string;
  if (scriptDir.includes(path.join('dist', 'scripts')) || scriptDir.includes('dist\\scripts')) {
    // 编译后的路径：dist/scripts -> 回到 backend 根目录
    // __dirname = /path/to/backend/dist/scripts
    // 需要回到 /path/to/backend
    backendDir = path.resolve(scriptDir, '../..');
  } else {
    // 开发环境：scripts -> backend
    backendDir = path.resolve(scriptDir, '..');
  }
  
  // 验证 backendDir 是否正确（应该包含 package.json）
  const packageJsonPath = path.join(backendDir, 'package.json');
  const fs = require('fs');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ 无法找到 package.json 在: ${backendDir}`);
    console.error(`   请检查路径计算逻辑`);
    process.exit(1);
  }
  
  console.log(`📁 后端目录: ${backendDir}`);
  
  console.log('🚀 开始启动应用...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 工作目录: ${backendDir}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  
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
  console.log(`   数据库 URL: ${process.env.DATABASE_URL ? '已设置' : '❌ 未设置'}`);
  
  try {
    const migrateResult = await runCommand('npx prisma migrate deploy', backendDir);
    
    if (!migrateResult.success) {
      const errorOutput = migrateResult.error?.stderr || migrateResult.error?.stdout || '';
      
      // 首先检查是否是迁移失败错误（P3009 或 P3018）- 优先级最高
      const isMigrationFailedError = 
        errorOutput.includes('P3009') ||
        errorOutput.includes('P3018') ||
        errorOutput.includes('failed migrations') ||
        errorOutput.includes('migrate resolve') ||
        errorOutput.includes('Invalid use of NULL value') ||
        (errorOutput.includes('migration started at') && errorOutput.includes('failed'));
      
      if (isMigrationFailedError) {
        console.error('\n❌ 数据库迁移失败：迁移执行失败');
        console.error('   错误类型:', errorOutput.includes('P3018') ? 'P3018 (迁移失败)' : errorOutput.includes('P3009') ? 'P3009 (迁移状态错误)' : '其他迁移错误');
        
        // 自动使用 db push 修复（如果设置了 AUTO_FIX_DB 或检测到 NULL 值错误）
        const shouldAutoFix = process.env.AUTO_FIX_DB === 'true' || errorOutput.includes('Invalid use of NULL value');
        
        if (shouldAutoFix) {
          console.log('\n🔧 自动修复迁移问题...');
          
          // 先尝试重置失败的迁移，然后使用 db push
          console.log('   步骤 1: 尝试重置失败的迁移状态...');
          const resetResult = await runCommand('npx prisma migrate resolve --rolled-back 20260107211017_attendance_api', backendDir);
          if (resetResult.success) {
            console.log('   ✅ 迁移状态已重置');
          } else {
            console.log('   ⚠️  无法重置迁移状态（可能迁移不存在），继续使用 db push...');
          }
          
          console.log('   步骤 2: 使用 db push 同步数据库结构...');
          
          // 尝试使用 --force-reset 强制重置（如果数据库为空）
          let pushResult = await runCommand('npx prisma db push --accept-data-loss --skip-generate --force-reset', backendDir);
          
          // 如果 force-reset 失败，尝试不使用 force-reset
          if (!pushResult.success) {
            console.log('   ⚠️  force-reset 失败，尝试普通 db push...');
            pushResult = await runCommand('npx prisma db push --accept-data-loss --skip-generate', backendDir);
          }
          
          if (pushResult.success) {
            console.log('✅ 数据库表同步成功（使用 db push）');
            
            // 标记迁移为已应用（使用 migrate resolve --applied）
            console.log('   步骤 3: 标记迁移为已应用...');
            const markResult = await runCommand('npx prisma migrate resolve --applied 20260107211017_attendance_api', backendDir);
            if (markResult.success) {
              console.log('   ✅ 迁移已标记为已应用');
            } else {
              console.log('   ⚠️  无法标记迁移（可能迁移不存在），但这不影响数据库结构');
            }
            
            console.log('⚠️  注意：使用了 db push 同步数据库，迁移历史可能不完整');
          } else {
            const pushError = pushResult.error?.stderr || pushResult.error?.stdout || '';
            console.error('❌ db push 失败');
            console.error('   错误:', pushError);
            
            // 检查是否是 schema 问题
            if (pushError.includes('Invalid default value') || pushError.includes('created_at')) {
              console.error('\n   检测到 MySQL 默认值兼容性问题');
              console.error('   这可能是因为 MySQL 版本或配置不支持 TIMESTAMP 默认值');
              console.error('   解决方案：');
              console.error('   1. 检查 MySQL 版本（需要 5.6.5+）');
              console.error('   2. 检查 SQL_MODE 设置');
              console.error('   3. 联系数据库管理员检查配置');
              console.error('   4. 或者修改 schema.prisma，移除所有 @default，在应用层处理');
            }
            
            process.exit(1);
          }
        } else {
          console.error('   解决方案：');
          console.error('   1. 设置环境变量 AUTO_FIX_DB=true 以自动使用 db push 修复');
          console.error('   2. 或者手动解决迁移问题（需要 Shell 访问）');
          console.error('\n   错误详情:', errorOutput);
          process.exit(1);
        }
      } else {
        // 检查是否是表不存在错误
        const isTableNotExistError = 
          errorOutput.includes('does not exist') || 
          (errorOutput.includes('Table') && errorOutput.includes('doesn\'t exist'));
        
        if (isTableNotExistError) {
        console.error('\n❌ 数据库迁移失败：表不存在');
        console.error('   这表明数据库是全新的，但迁移文件可能不完整');
        
        // 自动使用 db push 修复（如果设置了 AUTO_FIX_DB）
        if (process.env.AUTO_FIX_DB === 'true') {
          console.log('\n🔧 检测到 AUTO_FIX_DB=true，尝试使用 db push 自动修复...');
          
          // 先尝试重置失败的迁移
          console.log('   步骤 1: 尝试重置失败的迁移状态...');
          const resetResult = await runCommand('npx prisma migrate resolve --rolled-back 20260107211017_attendance_api', backendDir);
          if (resetResult.success) {
            console.log('   ✅ 迁移状态已重置');
          } else {
            console.log('   ⚠️  无法重置迁移状态，继续使用 db push...');
          }
          
          console.log('   步骤 2: 使用 db push 创建表结构...');
          const pushResult = await runCommand('npx prisma db push --accept-data-loss --skip-generate', backendDir);
          
          if (pushResult.success) {
            console.log('✅ 数据库表创建成功（使用 db push）');
            
            // 标记迁移为已应用
            console.log('   步骤 3: 标记迁移为已应用...');
            const markResult = await runCommand('npx prisma migrate resolve --applied 20260107211017_attendance_api', backendDir);
            if (markResult.success) {
              console.log('   ✅ 迁移已标记为已应用');
            } else {
              console.log('   ⚠️  无法标记迁移，但这不影响数据库结构');
            }
            
            console.log('⚠️  注意：使用了 db push 同步数据库，迁移历史可能不完整');
          } else {
            const pushError = pushResult.error?.stderr || pushResult.error?.stdout || '';
            console.error('❌ db push 也失败了');
            console.error('   错误:', pushError);
            
            // 检查是否是 schema 问题
            if (pushError.includes('Invalid default value') || pushError.includes('created_at')) {
              console.error('\n   检测到 schema 问题，可能是 MySQL 版本兼容性问题');
              console.error('   请检查 Prisma schema 中的时间字段类型');
            }
            
            process.exit(1);
          }
        } else {
          console.error('   解决方案：');
          console.error('   1. 在 Render Shell 中运行: npx prisma db push');
          console.error('   2. 或者设置环境变量 AUTO_FIX_DB=true 以自动修复（不推荐用于生产）');
          console.error('   3. 或者检查迁移文件是否包含创建表的语句');
          console.error('\n   错误详情:', errorOutput);
          process.exit(1);
        }
      } else {
        // 检查是否是数据库连接错误
          const isConnectionError = 
            errorOutput.includes('Can\'t reach database') ||
            errorOutput.includes('Connection') ||
            errorOutput.includes('ECONNREFUSED') ||
            errorOutput.includes('ENOTFOUND');
          
          if (isConnectionError) {
            console.error('\n❌ 数据库连接失败！');
            console.error('   请检查 DATABASE_URL 环境变量是否正确设置');
            console.error('   错误详情:', errorOutput);
            process.exit(1);
          } else {
            console.warn('\n⚠️  数据库迁移失败，但继续启动应用...');
            console.warn('   这可能是正常的（迁移已应用），或者请检查数据库连接');
            console.warn('   如果是首次部署，请确保 DATABASE_URL 环境变量已正确设置');
            console.warn('\n   错误详情:', errorOutput);
          }
        }
      }
    } else {
      console.log('✅ 数据库迁移完成');
    }
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    const isTableNotExistError = 
      errorMessage.includes('does not exist') || 
      errorMessage.includes('Table') && errorMessage.includes('doesn\'t exist');
    
    if (isTableNotExistError) {
      console.error('\n❌ 数据库迁移失败：表不存在');
      console.error('   这表明数据库是全新的，但迁移文件可能不完整');
      
      // 自动使用 db push 修复（如果设置了 AUTO_FIX_DB）
      if (process.env.AUTO_FIX_DB === 'true') {
        console.log('\n🔧 检测到 AUTO_FIX_DB=true，尝试使用 db push 自动修复...');
        
        try {
          // 先尝试重置失败的迁移
          console.log('   步骤 1: 尝试重置失败的迁移状态...');
          const resetResult = await runCommand('npx prisma migrate resolve --rolled-back 20260107211017_attendance_api', backendDir);
          if (resetResult.success) {
            console.log('   ✅ 迁移状态已重置');
          } else {
            console.log('   ⚠️  无法重置迁移状态，继续使用 db push...');
          }
          
          console.log('   步骤 2: 使用 db push 创建表结构...');
          const pushResult = await runCommand('npx prisma db push --accept-data-loss --skip-generate', backendDir);
          
          if (pushResult.success) {
            console.log('✅ 数据库表创建成功（使用 db push）');
            
            // 标记迁移为已应用
            console.log('   步骤 3: 标记迁移为已应用...');
            const markResult = await runCommand('npx prisma migrate resolve --applied 20260107211017_attendance_api', backendDir);
            if (markResult.success) {
              console.log('   ✅ 迁移已标记为已应用');
            } else {
              console.log('   ⚠️  无法标记迁移，但这不影响数据库结构');
            }
            
            console.log('⚠️  注意：使用了 db push 同步数据库，迁移历史可能不完整');
          } else {
            const pushError = pushResult.error?.stderr || pushResult.error?.stdout || '';
            console.error('❌ db push 也失败了');
            console.error('   错误:', pushError);
            
            // 检查是否是 schema 问题
            if (pushError.includes('Invalid default value') || pushError.includes('created_at')) {
              console.error('\n   检测到 schema 问题，可能是 MySQL 版本兼容性问题');
              console.error('   请检查 Prisma schema 中的时间字段类型');
            }
            
            process.exit(1);
          }
        } catch (pushError: any) {
          console.error('❌ db push 执行失败');
          console.error('   错误:', pushError?.message || String(pushError));
          process.exit(1);
        }
      } else {
        console.error('   解决方案：');
        console.error('   1. 在 Render Shell 中运行: npx prisma db push');
        console.error('   2. 或者设置环境变量 AUTO_FIX_DB=true 以自动修复（不推荐用于生产）');
        console.error('\n   错误:', errorMessage);
        process.exit(1);
      }
    } else {
      console.warn('\n⚠️  迁移过程中出现错误，但继续启动应用...');
      console.warn('   错误:', errorMessage);
    }
  }
  
  // 3. 检查并运行种子数据
  console.log('\n3️⃣ 检查是否需要初始化种子数据...');
  
  // 检查数据库是否为空（通过检查角色表）
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // 检查是否存在角色数据
    const roleCount = await prisma.role.count();
    const orgCount = await prisma.org.count();
    
    await prisma.$disconnect();
    
    const shouldAutoSeed = process.env.RUN_SEED === 'true' || 
                           process.env.AUTO_SEED === 'true' ||
                           (roleCount === 0 && orgCount === 0); // 如果数据库为空，自动运行 seed
    
    if (shouldAutoSeed) {
      if (roleCount === 0 && orgCount === 0) {
        console.log('   检测到数据库为空，自动运行种子数据...');
      } else {
        console.log('   检测到 RUN_SEED=true 或 AUTO_SEED=true，运行种子数据...');
      }
      
      // 尝试使用 tsx 运行 seed（如果可用）
      // 如果 tsx 不可用，seed 会失败，但可以通过 API 端点手动触发
      const seedResult = await runCommand('npx tsx prisma/seed.ts', backendDir);
      
      if (!seedResult.success) {
        console.warn('⚠️  种子数据初始化失败（tsx 可能不可用）');
        console.warn('   解决方案：');
        console.warn('   1. 设置环境变量 RUN_SEED=true（会尝试使用 tsx）');
        console.warn('   2. 使用 API 端点 POST /admin/system/seed（需要管理员权限）');
        console.warn('   3. 在本地运行: npm run prisma:seed');
      }
      
      if (seedResult.success) {
        console.log('✅ 种子数据初始化完成');
      } else {
        console.warn('⚠️  种子数据初始化失败，但继续启动应用...');
        console.warn('   如果这是首次部署，请检查数据库连接和 seed 脚本');
      }
    } else {
      console.log(`   数据库已有数据（${roleCount} 个角色，${orgCount} 个组织），跳过种子数据`);
      console.log('   如需重新初始化，设置环境变量 RUN_SEED=true 或 AUTO_SEED=true');
    }
  } catch (error: any) {
    console.warn('⚠️  检查数据库状态时出错，跳过自动种子数据:', error.message);
    console.warn('   如需手动初始化，设置环境变量 RUN_SEED=true');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 初始化完成，启动应用...\n');
  
  // 4. 启动应用
  const { spawn } = require('child_process');
  // fs 已经在上面声明过了，不需要重复声明
  
  // 确定 app.js 的路径
  const appJsPath = path.join(backendDir, 'dist', 'app.js');
  console.log(`\n📂 启动应用: ${appJsPath}`);
  
  // 检查文件是否存在
  if (!fs.existsSync(appJsPath)) {
    console.error(`\n❌ 应用文件不存在: ${appJsPath}`);
    console.error('   请检查构建是否成功');
    console.error(`   当前工作目录: ${process.cwd()}`);
    console.error(`   后端目录: ${backendDir}`);
    
    // 列出 dist 目录内容
    const distDir = path.join(backendDir, 'dist');
    if (fs.existsSync(distDir)) {
      console.error(`\n   dist 目录内容:`);
      try {
        const files = fs.readdirSync(distDir);
        files.forEach((file: string) => {
          const filePath = path.join(distDir, file);
          const stat = fs.statSync(filePath);
          console.error(`     ${stat.isDirectory() ? '📁' : '📄'} ${file}`);
        });
      } catch (e: any) {
        console.error(`   无法读取 dist 目录: ${e.message}`);
      }
    } else {
      console.error(`\n   dist 目录不存在: ${distDir}`);
    }
    
    process.exit(1);
  }
  
  const app = spawn('node', [appJsPath], {
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
  console.error('\n❌ 启动脚本执行失败:');
  console.error('错误类型:', error?.constructor?.name || typeof error);
  console.error('错误消息:', error?.message || String(error));
  if (error?.stack) {
    console.error('错误堆栈:', error.stack);
  }
  process.exit(1);
});


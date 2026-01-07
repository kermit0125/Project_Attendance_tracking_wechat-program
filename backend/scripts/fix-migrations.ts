import * as fs from 'fs';
import * as path from 'path';

/**
 * 修复迁移文件中的 CURRENT_TIMESTAMP(3) 问题
 * MySQL 的 DATETIME 类型不支持精度参数，需要改为 CURRENT_TIMESTAMP
 */
function fixMigrationFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // 修复 CURRENT_TIMESTAMP(3) -> CURRENT_TIMESTAMP
    if (content.includes('CURRENT_TIMESTAMP(3)')) {
      content = content.replace(/CURRENT_TIMESTAMP\(3\)/g, 'CURRENT_TIMESTAMP');
      modified = true;
    }

    // 修复 updated_at 字段缺少默认值的问题
    // 查找所有 `updated_at` DATETIME NOT NULL 但没有默认值的情况
    const updatedAtPattern = /(`updated_at`\s+DATETIME\s+NOT\s+NULL)(?!\s+DEFAULT)/g;
    if (updatedAtPattern.test(content)) {
      content = content.replace(
        /(`updated_at`\s+DATETIME\s+NOT\s+NULL)(?!\s+DEFAULT)/g,
        '$1 DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    }

    return false;
  } catch (error: any) {
    console.error(`❌ 修复失败 ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 扫描并修复所有迁移文件
 */
function fixAllMigrations() {
  // 从脚本所在位置查找迁移目录（相对于 backend 目录）
  const backendDir = path.resolve(__dirname, '..');
  const migrationsDir = path.join(backendDir, 'prisma', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('📁 迁移目录不存在:', migrationsDir);
    console.log('   这是正常的，如果还没有创建迁移文件');
    return;
  }

  console.log('🔍 扫描迁移文件:', migrationsDir);
  const migrations = fs.readdirSync(migrationsDir, { withFileTypes: true });

  let fixedCount = 0;
  for (const migration of migrations) {
    if (migration.isDirectory()) {
      const migrationFile = path.join(
        migrationsDir,
        migration.name,
        'migration.sql'
      );

      if (fs.existsSync(migrationFile)) {
        if (fixMigrationFile(migrationFile)) {
          fixedCount++;
        }
      }
    }
  }

  if (fixedCount > 0) {
    console.log(`\n✅ 共修复 ${fixedCount} 个迁移文件`);
  } else {
    console.log('\n✅ 所有迁移文件都已正确，无需修复');
  }
}

// 执行修复
fixAllMigrations();


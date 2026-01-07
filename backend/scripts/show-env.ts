import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ 未找到 .env 文件');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

interface EnvVar {
  name: string;
  value: string;
  masked: string;
}

const envVars: EnvVar[] = [];

for (const line of envLines) {
  const trimmed = line.trim();
  
  // 跳过空行和注释
  if (!trimmed || trimmed.startsWith('#')) {
    continue;
  }
  
  // 解析 KEY=VALUE 格式
  const equalIndex = trimmed.indexOf('=');
  if (equalIndex === -1) {
    continue;
  }
  
  const key = trimmed.substring(0, equalIndex);
  let value = trimmed.substring(equalIndex + 1);
  
  // 移除引号（如果有）
  value = value.replace(/^["']|["']$/g, '');
  
  // 生成掩码版本（敏感信息）
  let masked = value;
  if (key.includes('SECRET') || key.includes('PASSWORD') || key === 'DATABASE_URL') {
    if (key === 'DATABASE_URL') {
      // 对于 DATABASE_URL，只隐藏密码部分
      masked = value.replace(/:([^:@]+)@/, ':****@');
    } else {
      // 对于其他敏感信息，只显示前4个字符和后4个字符
      if (value.length > 8) {
        masked = value.substring(0, 4) + '...' + value.substring(value.length - 4);
      } else {
        masked = '****';
      }
    }
  }
  
  envVars.push({ name: key, value, masked });
}

console.log('\n📋 .env 文件中的环境变量：');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 按 README 中提到的顺序显示
const importantVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'LOG_LEVEL',
  'RATE_LIMIT_MAX',
  'RATE_LIMIT_TIME_WINDOW',
];

console.log('\n🔑 重要环境变量（对应 README 中的配置）：\n');

for (const varName of importantVars) {
  const envVar = envVars.find(v => v.name === varName);
  if (envVar) {
    console.log(`${varName}=${envVar.masked}`);
  } else {
    console.log(`${varName}=(未设置)`);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📝 所有环境变量（完整值）：\n');

for (const envVar of envVars) {
  console.log(`${envVar.name}=${envVar.value}`);
}

console.log('\n');



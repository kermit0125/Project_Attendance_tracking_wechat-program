import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ 未找到 .env 文件');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let databaseUrl = '';
for (const line of envLines) {
  if (line.startsWith('DATABASE_URL=')) {
    databaseUrl = line.replace('DATABASE_URL=', '').trim();
    // 移除引号（如果有）
    databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');
    break;
  }
}

if (!databaseUrl) {
  console.error('❌ 未找到 DATABASE_URL 配置');
  process.exit(1);
}

// 解析 DATABASE_URL
// 格式: mysql://用户名:密码@主机:端口/数据库名?参数
const urlPattern = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
const match = databaseUrl.match(urlPattern);

if (!match) {
  console.error('❌ DATABASE_URL 格式不正确');
  console.log('当前 DATABASE_URL:', databaseUrl.replace(/:([^:@]+)@/, ':****@')); // 隐藏密码
  process.exit(1);
}

const [, username, password, host, port, database] = match;

console.log('\n📋 MySQL 连接信息：');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`主机: ${host}`);
console.log(`端口: ${port}`);
console.log(`用户名: ${username}`);
console.log(`密码: ${password}`);
console.log(`数据库: ${database}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 MySQL 连接命令：\n');
console.log(`mysql -h ${host} -P ${port} -u ${username} -p${password} ${database}`);
console.log('\n或者（密码会提示输入，更安全）：');
console.log(`mysql -h ${host} -P ${port} -u ${username} -p ${database}`);
console.log('\n');


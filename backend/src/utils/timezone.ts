/**
 * 时区工具函数
 * 系统统一使用北京时间 (UTC+8)
 */

const BEIJING_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000; // UTC+8 的毫秒数

/**
 * 获取北京时间的今天开始时间（00:00:00）
 * 返回的是 UTC 时间，表示北京时间当天的 00:00:00
 */
export function getBeijingStartOfDay(date: Date = new Date()): Date {
  // 获取当前时间的 UTC 时间戳
  const utcTime = date.getTime();
  
  // 转换为北京时间（UTC+8）
  const beijingTime = utcTime + BEIJING_TIMEZONE_OFFSET;
  
  // 计算北京时间的年月日
  const beijingDate = new Date(beijingTime);
  const year = beijingDate.getUTCFullYear();
  const month = beijingDate.getUTCMonth();
  const day = beijingDate.getUTCDate();
  
  // 创建北京时间的当天 00:00:00（作为 UTC 时间）
  // 例如：北京时间 2026-01-07 00:00:00 = UTC 2026-01-06 16:00:00
  const startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  
  // 转换回 UTC（减去 8 小时）
  // 这样返回的时间就是：北京时间当天的 00:00:00 对应的 UTC 时间
  const result = new Date(startOfDayUTC.getTime() - BEIJING_TIMEZONE_OFFSET);
  
  return result;
}

/**
 * 获取北京时间的今天结束时间（23:59:59.999）
 * 返回的是 UTC 时间，表示北京时间当天的 23:59:59.999
 */
export function getBeijingEndOfDay(date: Date = new Date()): Date {
  // 获取当前时间的 UTC 时间戳
  const utcTime = date.getTime();
  
  // 转换为北京时间（UTC+8）
  const beijingTime = utcTime + BEIJING_TIMEZONE_OFFSET;
  
  // 计算北京时间的年月日
  const beijingDate = new Date(beijingTime);
  const year = beijingDate.getUTCFullYear();
  const month = beijingDate.getUTCMonth();
  const day = beijingDate.getUTCDate();
  
  // 创建北京时间的当天 23:59:59.999（作为 UTC 时间）
  // 例如：北京时间 2026-01-07 23:59:59.999 = UTC 2026-01-07 15:59:59.999
  const endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  
  // 转换回 UTC（减去 8 小时）
  // 这样返回的时间就是：北京时间当天的 23:59:59.999 对应的 UTC 时间
  const result = new Date(endOfDayUTC.getTime() - BEIJING_TIMEZONE_OFFSET);
  
  return result;
}

/**
 * 获取北京时间的今天日期对象（用于日期比较）
 */
export function getBeijingToday(date: Date = new Date()): Date {
  return getBeijingStartOfDay(date);
}

/**
 * 将 UTC 时间转换为北京时间显示字符串
 */
export function formatBeijingTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const beijingTime = new Date(d.getTime() + BEIJING_TIMEZONE_OFFSET);
  return beijingTime.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * 获取当前北京时间的时分秒（返回分钟数，便于比较）
 * 例如：09:00 返回 540，18:00 返回 1080
 */
export function getBeijingTimeMinutes(date: Date = new Date()): number {
  const beijingTime = new Date(date.getTime() + BEIJING_TIMEZONE_OFFSET);
  const hours = beijingTime.getUTCHours();
  const minutes = beijingTime.getUTCMinutes();
  return hours * 60 + minutes;
}

/**
 * 将时间字符串（HH:mm 或 HH:mm:ss）转换为分钟数
 */
export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * 将 MySQL Time 类型转换为分钟数
 * MySQL Time 类型在 Prisma 中返回的是 Date 对象，时间部分是有效的
 */
export function mysqlTimeToMinutes(time: Date): number {
  // MySQL Time 类型返回的 Date 对象，日期部分是 1970-01-01
  // 时间部分是实际时间
  const hours = time.getUTCHours();
  const minutes = time.getUTCMinutes();
  return hours * 60 + minutes;
}

/**
 * 将分钟数转换为时间字符串（HH:mm）
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 获取北京时间的时分字符串
 */
export function getBeijingTimeString(date: Date = new Date()): string {
  const beijingTime = new Date(date.getTime() + BEIJING_TIMEZONE_OFFSET);
  const hours = beijingTime.getUTCHours().toString().padStart(2, '0');
  const minutes = beijingTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}


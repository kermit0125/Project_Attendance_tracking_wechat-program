/**
 * 时间工具函数
 */

/**
 * 计算两个日期之间的分钟数
 */
export function getMinutesBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * 获取当天的开始时间（00:00:00）
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取当天的结束时间（23:59:59）
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * 判断是否为同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

/**
 * 判断日期是否为工作日（简单实现，不考虑节假日）
 */
export function isWorkday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 周一到周五
}

/**
 * 解析时间字符串为 Date（用于班次时间）
 */
export function parseTime(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes || 0, seconds || 0, 0);
  return date;
}




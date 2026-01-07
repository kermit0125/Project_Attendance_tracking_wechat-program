/**
 * 序列化工具函数
 * 将 BigInt 和 Date 对象转换为可 JSON 序列化的类型
 */

/**
 * 递归地将对象中的所有 BigInt 转换为 Number，Date 转换为 ISO 字符串
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 如果是 BigInt，转换为 Number
  if (typeof obj === 'bigint') {
    return Number(obj) as T;
  }

  // 如果是 Date，转换为 ISO 字符串
  if (obj instanceof Date) {
    return obj.toISOString() as T;
  }

  // 如果是数组，递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item)) as T;
  }

  // 如果是对象，递归处理每个属性
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeBigInt(obj[key]);
      }
    }
    return result as T;
  }

  // 其他类型直接返回
  return obj;
}





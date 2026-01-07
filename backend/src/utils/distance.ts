/**
 * 使用 Haversine 公式计算两点之间的距离（单位：米）
 * @param lat1 纬度1
 * @param lng1 经度1
 * @param lat2 纬度2
 * @param lng2 经度2
 * @returns 距离（米）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // 地球半径（米）
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * 角度转弧度
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 检查点是否在围栏内
 * @param lat 纬度
 * @param lng 经度
 * @param fenceLat 围栏中心纬度
 * @param fenceLng 围栏中心经度
 * @param radiusM 围栏半径（米）
 * @returns 是否在围栏内，以及距离围栏中心的距离
 */
export function checkInFence(
  lat: number,
  lng: number,
  fenceLat: number,
  fenceLng: number,
  radiusM: number
): { inFence: boolean; distance: number } {
  const distance = calculateDistance(lat, lng, fenceLat, fenceLng);
  return {
    inFence: distance <= radiusM,
    distance: Math.round(distance),
  };
}




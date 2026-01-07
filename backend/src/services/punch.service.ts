import { PunchRepository } from '../repositories/punch.repository';
import { GeoFenceRepository } from '../repositories/geo-fence.repository';
import { WorkScheduleRepository } from '../repositories/work-schedule.repository';
import { Errors } from '../utils/errors';
import { checkInFence } from '../utils/distance';
import { PunchInput } from '../validators/punch';
import { prisma } from '../config/prisma';
import { AnomalyType } from '@prisma/client';
import { 
  getBeijingStartOfDay, 
  getBeijingEndOfDay, 
  getBeijingTimeMinutes,
  mysqlTimeToMinutes,
  minutesToTimeString,
  getBeijingTimeString
} from '../utils/timezone';

/**
 * 打卡服务
 */
export class PunchService {
  private punchRepo: PunchRepository;
  private geoFenceRepo: GeoFenceRepository;
  private workScheduleRepo: WorkScheduleRepository;

  constructor() {
    this.punchRepo = new PunchRepository();
    this.geoFenceRepo = new GeoFenceRepository();
    this.workScheduleRepo = new WorkScheduleRepository();
  }

  /**
   * 创建打卡记录
   */
  async createPunch(
    userId: number,
    orgId: number,
    input: PunchInput,
    ipAddress?: string
  ) {
    const now = new Date();
    const startOfDay = getBeijingStartOfDay(now);
    const endOfDay = getBeijingEndOfDay(now);

    // 检查今天是否已打过该类型的卡
    const hasPunched = await this.punchRepo.hasPunchedToday(
      userId,
      input.punchType,
      now
    );

    if (hasPunched) {
      throw Errors.ALREADY_PUNCHED(input.punchType);
    }

    // 处理围栏检查
    let geoFenceId: number | undefined;
    let distanceToFenceM: number | undefined;
    let inFence: boolean | undefined = true;

    if (input.lat !== undefined && input.lng !== undefined) {
      const fences = await this.geoFenceRepo.findActiveByOrg(orgId);
      
      if (fences.length > 0) {
        let nearestFence = fences[0];
        let minDistance = Infinity;

        for (const fence of fences) {
          const lat = Number(fence.lat);
          const lng = Number(fence.lng);
          const result = checkInFence(input.lat, input.lng, lat, lng, fence.radiusM);
          
          if (result.distance < minDistance) {
            minDistance = result.distance;
            nearestFence = fence;
            inFence = result.inFence;
            distanceToFenceM = result.distance;
          }
        }

        geoFenceId = Number(nearestFence.id);

        if (!inFence) {
          await this.createAnomaly(userId, orgId, AnomalyType.OUT_OF_FENCE, startOfDay);
        }
      }
    } else {
      await this.createAnomaly(userId, orgId, AnomalyType.LOCATION_DENIED, startOfDay);
    }

    // 验证状态
    const verifyStatus: 'PASS' | 'FAIL' | 'SKIPPED' = 
      input.verifyMethod !== 'NONE' && input.evidenceUrl ? 'PASS' : 'SKIPPED';

    // 获取默认班次
    const schedule = await this.workScheduleRepo.findDefaultByOrg(orgId);

    // 创建打卡记录
    const punch = await this.punchRepo.create({
      orgId,
      userId,
      punchType: input.punchType,
      punchedAt: now,
      lat: input.lat,
      lng: input.lng,
      accuracyM: input.accuracyM,
      geoFenceId,
      distanceToFenceM,
      inFence,
      verifyMethod: input.verifyMethod,
      verifyStatus,
      evidenceUrl: input.evidenceUrl,
      deviceInfo: input.deviceInfo,
      ipAddress,
      scheduleId: schedule ? Number(schedule.id) : undefined,
    });

    // 检查迟到/早退
    const punchStatus = this.checkPunchStatus(input.punchType, now, schedule);

    // 如果迟到或早退，创建异常记录
    if (punchStatus.isLate) {
      await this.createAnomaly(userId, orgId, AnomalyType.LATE, startOfDay, punch.id);
    } else if (punchStatus.isEarlyLeave) {
      await this.createAnomaly(userId, orgId, AnomalyType.EARLY_LEAVE, startOfDay, punch.id);
    }

    // 返回序列化后的数据
    return {
      id: Number(punch.id),
      punchType: punch.punchType,
      punchedAt: punch.punchedAt.toISOString(),
      inFence: punch.inFence ?? null,
      verifyStatus: punch.verifyStatus,
      // 新增：打卡状态信息
      status: punchStatus.status,
      message: punchStatus.message,
      scheduleInfo: punchStatus.scheduleInfo,
    };
  }

  /**
   * 检查打卡状态（迟到/早退）
   */
  private checkPunchStatus(
    punchType: 'IN' | 'OUT',
    punchTime: Date,
    schedule: any
  ): {
    status: 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'NO_SCHEDULE';
    isLate: boolean;
    isEarlyLeave: boolean;
    message: string;
    scheduleInfo: {
      scheduleName: string;
      startTime: string;
      endTime: string;
      lateGraceMinutes: number;
      earlyLeaveGraceMinutes: number;
    } | null;
  } {
    // 如果没有班次配置
    if (!schedule) {
      return {
        status: 'NO_SCHEDULE',
        isLate: false,
        isEarlyLeave: false,
        message: '未配置班次，打卡成功',
        scheduleInfo: null,
      };
    }

    // 获取当前北京时间的分钟数
    const currentMinutes = getBeijingTimeMinutes(punchTime);
    const currentTimeStr = getBeijingTimeString(punchTime);

    // 获取班次时间（MySQL Time 类型）
    const scheduleStartMinutes = mysqlTimeToMinutes(schedule.startTime);
    const scheduleEndMinutes = mysqlTimeToMinutes(schedule.endTime);
    const lateGrace = schedule.lateGraceMinutes || 0;
    const earlyLeaveGrace = schedule.earlyLeaveGraceMinutes || 0;

    const scheduleInfo = {
      scheduleName: schedule.name,
      startTime: minutesToTimeString(scheduleStartMinutes),
      endTime: minutesToTimeString(scheduleEndMinutes),
      lateGraceMinutes: lateGrace,
      earlyLeaveGraceMinutes: earlyLeaveGrace,
    };

    if (punchType === 'IN') {
      // 上班打卡：检查是否迟到
      // 迟到 = 打卡时间 > 上班时间 + 宽限期
      const lateThreshold = scheduleStartMinutes + lateGrace;
      
      if (currentMinutes > lateThreshold) {
        const lateMinutes = currentMinutes - scheduleStartMinutes;
        const lateHours = Math.floor(lateMinutes / 60);
        const lateMins = lateMinutes % 60;
        const lateStr = lateHours > 0 
          ? `${lateHours}小时${lateMins}分钟` 
          : `${lateMins}分钟`;
        
        return {
          status: 'LATE',
          isLate: true,
          isEarlyLeave: false,
          message: `迟到${lateStr}（规定上班时间：${scheduleInfo.startTime}，实际打卡时间：${currentTimeStr}）`,
          scheduleInfo,
        };
      } else {
        return {
          status: 'NORMAL',
          isLate: false,
          isEarlyLeave: false,
          message: `打卡成功（规定上班时间：${scheduleInfo.startTime}，实际打卡时间：${currentTimeStr}）`,
          scheduleInfo,
        };
      }
    } else {
      // 下班打卡：检查是否早退
      // 早退 = 打卡时间 < 下班时间 - 宽限期
      const earlyLeaveThreshold = scheduleEndMinutes - earlyLeaveGrace;
      
      if (currentMinutes < earlyLeaveThreshold) {
        const earlyMinutes = scheduleEndMinutes - currentMinutes;
        const earlyHours = Math.floor(earlyMinutes / 60);
        const earlyMins = earlyMinutes % 60;
        const earlyStr = earlyHours > 0 
          ? `${earlyHours}小时${earlyMins}分钟` 
          : `${earlyMins}分钟`;
        
        return {
          status: 'EARLY_LEAVE',
          isLate: false,
          isEarlyLeave: true,
          message: `早退${earlyStr}（规定下班时间：${scheduleInfo.endTime}，实际打卡时间：${currentTimeStr}）`,
          scheduleInfo,
        };
      } else {
        return {
          status: 'NORMAL',
          isLate: false,
          isEarlyLeave: false,
          message: `打卡成功（规定下班时间：${scheduleInfo.endTime}，实际打卡时间：${currentTimeStr}）`,
          scheduleInfo,
        };
      }
    }
  }

  /**
   * 创建异常记录
   */
  private async createAnomaly(
    userId: number,
    orgId: number,
    anomalyType: AnomalyType,
    anomalyDate: Date,
    punchId?: bigint
  ) {
    await prisma.attendanceAnomaly.create({
      data: {
        orgId: BigInt(orgId),
        userId: BigInt(userId),
        anomalyDate,
        anomalyType: anomalyType, // 现在 Prisma Client 已经包含 LATE 和 EARLY_LEAVE
        severity: anomalyType === 'LATE' || anomalyType === 'EARLY_LEAVE' ? 'LOW' : 'MEDIUM',
        status: 'OPEN',
        relatedPunchId: punchId,
      },
    });
  }

  /**
   * 获取当前班次信息
   */
  async getCurrentSchedule(orgId: number) {
    const schedule = await this.workScheduleRepo.findDefaultByOrg(orgId);
    
    if (!schedule) {
      return null;
    }

    const scheduleStartMinutes = mysqlTimeToMinutes(schedule.startTime);
    const scheduleEndMinutes = mysqlTimeToMinutes(schedule.endTime);

    return {
      id: Number(schedule.id),
      name: schedule.name,
      startTime: minutesToTimeString(scheduleStartMinutes),
      endTime: minutesToTimeString(scheduleEndMinutes),
      lateGraceMinutes: schedule.lateGraceMinutes,
      earlyLeaveGraceMinutes: schedule.earlyLeaveGraceMinutes,
      minWorkMinutes: schedule.minWorkMinutes,
      breakStart: schedule.breakStart ? minutesToTimeString(mysqlTimeToMinutes(schedule.breakStart)) : null,
      breakEnd: schedule.breakEnd ? minutesToTimeString(mysqlTimeToMinutes(schedule.breakEnd)) : null,
    };
  }

  /**
   * 获取今天的打卡记录
   */
  async getTodayPunches(userId: number) {
    const now = new Date();
    const punches = await this.punchRepo.findByUserAndDate(userId, now);

    // 按类型分组并排序
    const punchIn = punches
      .filter(p => p.punchType === 'IN')
      .sort((a, b) => b.punchedAt.getTime() - a.punchedAt.getTime())[0] || null;
    
    const punchOut = punches
      .filter(p => p.punchType === 'OUT')
      .sort((a, b) => b.punchedAt.getTime() - a.punchedAt.getTime())[0] || null;

    // 格式化并序列化
    return {
      punchIn: this.formatPunch(punchIn),
      punchOut: this.formatPunch(punchOut),
    };
  }

  /**
   * 获取打卡历史
   */
  async getHistory(
    userId: number,
    from: string,
    to: string,
    page: number = 1,
    pageSize: number = 20
  ) {
    // 处理日期：如果只提供了日期（YYYY-MM-DD），需要转换为完整的日期时间
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    console.log(`获取打卡历史 - 用户ID: ${userId}, 日期范围: ${fromDate.toISOString()} 到 ${toDate.toISOString()}`);

    // 获取所有记录（不分页），因为需要配对后再分页
    const { list: allPunches } = await this.punchRepo.getHistory(
      userId,
      fromDate,
      toDate,
      1,
      10000 // 获取足够多的记录
    );

    console.log(`找到 ${allPunches.length} 条原始打卡记录`);

    // 按日期分组（使用北京时区）
    const groupedByDate = new Map<string, { punchIn?: any; punchOut?: any }>();

    for (const punch of allPunches) {
      // 转换为北京时区的日期字符串（UTC+8）
      const utcTime = punch.punchedAt.getTime();
      const beijingTime = utcTime + 8 * 60 * 60 * 1000; // UTC+8
      const beijingDate = new Date(beijingTime);
      const dateKey = beijingDate.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, {});
      }

      const dayRecord = groupedByDate.get(dateKey)!;
      const formattedPunch = this.formatPunchForHistory(punch);

      if (punch.punchType === 'IN') {
        // 如果同一天有多条 IN 记录，保留最新的
        if (!dayRecord.punchIn || new Date(punch.punchedAt) > new Date(dayRecord.punchIn.punchAt)) {
          dayRecord.punchIn = formattedPunch;
        }
      } else if (punch.punchType === 'OUT') {
        // 如果同一天有多条 OUT 记录，保留最新的
        if (!dayRecord.punchOut || new Date(punch.punchedAt) > new Date(dayRecord.punchOut.punchAt)) {
          dayRecord.punchOut = formattedPunch;
        }
      }
    }

    // 转换为数组并按日期倒序排列（最新的在前）
    const pairedList = Array.from(groupedByDate.entries())
      .map(([date, record]) => ({
        date,
        punchIn: record.punchIn || null,
        punchOut: record.punchOut || null,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)); // 日期倒序

    const total = pairedList.length;
    const skip = (page - 1) * pageSize;
    const paginatedList = pairedList.slice(skip, skip + pageSize);

    console.log(`配对后共 ${total} 条记录，返回第 ${page} 页的 ${paginatedList.length} 条`);

    return {
      list: paginatedList,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 格式化打卡记录 - 确保所有 BigInt 和 Date 都被正确序列化
   */
  private formatPunch(p: any, includeDetails: boolean = false): any {
    if (!p) return null;

    const base = {
      id: Number(p.id),
      punchType: p.punchType,
      punchedAt: p.punchedAt.toISOString(),
      lat: p.lat != null ? Number(p.lat) : null,
      lng: p.lng != null ? Number(p.lng) : null,
      inFence: p.inFence ?? null,
      verifyStatus: p.verifyStatus,
      location: p.geoFence?.name || null,
      geoFence: p.geoFence ? {
        id: Number(p.geoFence.id),
        name: p.geoFence.name,
      } : null,
    };

    if (includeDetails) {
      return {
        ...base,
        accuracyM: p.accuracyM ?? null,
        distanceToFenceM: p.distanceToFenceM ?? null,
        verifyMethod: p.verifyMethod,
        evidenceUrl: p.evidenceUrl || null,
        deviceInfo: p.deviceInfo || null,
      };
    }

    return base;
  }

  /**
   * 格式化打卡记录用于历史记录（前端期望的格式）
   */
  private formatPunchForHistory(p: any): any {
    if (!p) return null;

    return {
      id: Number(p.id),
      punchType: p.punchType,
      punchAt: p.punchedAt.toISOString(), // 前端期望的字段名是 punchAt
      lat: p.lat != null ? Number(p.lat) : null,
      lng: p.lng != null ? Number(p.lng) : null,
      inFence: p.inFence ?? null,
      verifyStatus: p.verifyStatus,
      location: p.geoFence?.name || null,
      geoFence: p.geoFence ? {
        id: Number(p.geoFence.id),
        name: p.geoFence.name,
      } : null,
      accuracyM: p.accuracyM ?? null,
      distanceToFenceM: p.distanceToFenceM ?? null,
      verifyMethod: p.verifyMethod,
      evidenceUrl: p.evidenceUrl || null,
      deviceInfo: p.deviceInfo || null,
    };
  }
}

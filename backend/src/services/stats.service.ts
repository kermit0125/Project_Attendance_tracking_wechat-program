import { prisma } from '../config/prisma';
import { getBeijingStartOfDay, getBeijingEndOfDay } from '../utils/timezone';

/**
 * 统计服务
 */
export class StatsService {
  /**
   * 获取月度统计
   */
  async getMonthStats(userId: number, orgId: number, month: string) {
    // 解析月份：YYYY-MM
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // 转换为北京时区的开始和结束时间
    const fromDate = getBeijingStartOfDay(startDate);
    const toDate = getBeijingEndOfDay(endDate);

    console.log(`统计月度数据 - 用户ID: ${userId}, 月份: ${month}, 日期范围: ${fromDate.toISOString()} 到 ${toDate.toISOString()}`);

    // 1. 获取打卡记录，计算基础工时
    const punches = await prisma.attendancePunch.findMany({
      where: {
        userId: BigInt(userId),
        orgId: BigInt(orgId),
        punchedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: {
        punchedAt: 'asc',
      },
    });

    // 按日期分组打卡记录
    const punchByDate = new Map<string, { punchIn?: Date; punchOut?: Date }>();
    
    for (const punch of punches) {
      const punchTime = punch.punchedAt;
      const beijingTime = new Date(punchTime.getTime() + 8 * 60 * 60 * 1000);
      const dateKey = beijingTime.toISOString().split('T')[0];

      if (!punchByDate.has(dateKey)) {
        punchByDate.set(dateKey, {});
      }

      const dayRecord = punchByDate.get(dateKey)!;
      if (punch.punchType === 'IN') {
        if (!dayRecord.punchIn || punchTime > dayRecord.punchIn) {
          dayRecord.punchIn = punchTime;
        }
      } else if (punch.punchType === 'OUT') {
        if (!dayRecord.punchOut || punchTime > dayRecord.punchOut) {
          dayRecord.punchOut = punchTime;
        }
      }
    }

    // 计算基础工时（分钟）
    let baseWorkMinutes = 0;
    let workDays = 0;
    let missingPunchCount = 0;

    for (const [date, record] of punchByDate.entries()) {
      if (record.punchIn && record.punchOut) {
        const workMinutes = Math.floor((record.punchOut.getTime() - record.punchIn.getTime()) / (1000 * 60));
        baseWorkMinutes += workMinutes;
        workDays++;
      } else {
        missingPunchCount++;
      }
    }

    // 2. 获取已通过的申请，计算额外工时
    // 使用原始 SQL 查询以确保 approvedDurationMinutes 字段被正确读取
    // 查询条件：申请的结束时间 >= 月份开始 且 开始时间 <= 月份结束（即申请与统计月份有交集）
    const approvedRequestsRaw = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, request_type, start_at, end_at, duration_minutes, approved_duration_minutes, status
      FROM requests
      WHERE requester_id = ? 
        AND org_id = ? 
        AND status = 'APPROVED'
        AND end_at >= ? 
        AND start_at <= ?
    `, BigInt(userId), BigInt(orgId), fromDate, toDate);
    
    console.log(`原始查询结果数量: ${approvedRequestsRaw.length}`);
    approvedRequestsRaw.forEach((r: any) => {
      console.log(`申请 ID ${r.id}: type=${r.request_type}, start=${r.start_at}, end=${r.end_at}, duration=${r.duration_minutes}, approved=${r.approved_duration_minutes}`);
    });
    
    // 转换为标准格式
    const approvedRequests = approvedRequestsRaw.map((r: any) => ({
      id: r.id,
      requestType: r.request_type,
      startAt: r.start_at,
      endAt: r.end_at,
      durationMinutes: r.duration_minutes ? Number(r.duration_minutes) : null,
      approvedDurationMinutes: r.approved_duration_minutes ? Number(r.approved_duration_minutes) : null,
      status: r.status,
    }));

    console.log(`找到 ${approvedRequests.length} 条已通过的申请`);

    // 计算加班工时（分钟）
    // 优先使用审批后实际批准的时长，如果没有则使用申请时的时长
    let overtimeMinutes = 0;
    const overtimeRequests = approvedRequests.filter(r => r.requestType === 'OVERTIME');
    console.log(`找到 ${overtimeRequests.length} 条加班申请`);
    
    for (const req of overtimeRequests) {
      // 优先使用审批后的实际时长（approvedDurationMinutes 是管理者审批后实际批准的时长）
      const approvedDuration = req.approvedDurationMinutes;
      const originalDuration = req.durationMinutes;
      
      // 如果审批时长存在且大于0，使用审批时长；否则使用原始时长
      let duration: number | null = null;
      
      if (approvedDuration !== null && approvedDuration !== undefined && approvedDuration > 0) {
        duration = approvedDuration;
        console.log(`加班申请 ID ${req.id}: 使用审批后实际批准的时长 ${approvedDuration} 分钟（原始申请: ${originalDuration} 分钟）`);
      } else if (originalDuration !== null && originalDuration !== undefined) {
        duration = originalDuration;
        console.log(`加班申请 ID ${req.id}: 审批时长未设置，使用原始申请时长 ${originalDuration} 分钟`);
      }
      
      if (duration) {
        overtimeMinutes += duration;
      } else {
        // 如果都没有，从时间计算
        const start = new Date(req.startAt);
        const end = new Date(req.endAt);
        const calculatedMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        console.log(`加班申请 ID ${req.id}: 从时间计算得到 ${calculatedMinutes} 分钟`);
        overtimeMinutes += calculatedMinutes;
      }
    }
    
    console.log(`总加班工时: ${overtimeMinutes} 分钟 (${(overtimeMinutes / 60).toFixed(1)} 小时)`);

    // 计算补卡工时（分钟）
    // 补卡申请应该增加对应的工时
    // 补卡通常有两种情况：
    // 1. 补上班打卡：增加从标准上班时间到实际下班时间的工时
    // 2. 补下班打卡：增加从实际上班时间到标准下班时间的工时
    // 如果补卡申请有 durationMinutes，使用它；否则从时间范围计算
    let fixPunchMinutes = 0;
    const fixPunchRequests = approvedRequests.filter(r => r.requestType === 'FIX_PUNCH');
    console.log(`找到 ${fixPunchRequests.length} 条补卡申请`);
    
    // 获取标准工作时长（从班次配置）
    const schedule = await prisma.workSchedule.findFirst({
      where: {
        orgId: BigInt(orgId),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    const standardWorkMinutes = schedule?.minWorkMinutes || 8 * 60; // 默认8小时

    for (const req of fixPunchRequests) {
      // 优先使用审批后的实际时长
      const approvedDuration = req.approvedDurationMinutes;
      const originalDuration = req.durationMinutes;
      const duration = approvedDuration ?? originalDuration;
      
      console.log(`补卡申请 ID ${req.id}: approvedDuration=${approvedDuration}, originalDuration=${originalDuration}, 使用=${duration}`);
      
      if (duration) {
        // 使用审批后实际批准的时长或申请中记录的时长
        fixPunchMinutes += duration;
      } else {
        // 如果没有 durationMinutes，从时间范围计算
        const start = new Date(req.startAt);
        const end = new Date(req.endAt);
        const calculatedMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        
        if (calculatedMinutes > 0) {
          fixPunchMinutes += calculatedMinutes;
        } else {
          // 如果时间范围无效，根据补卡类型估算
          // 补上班打卡：假设增加标准工作时长
          // 补下班打卡：假设增加标准工作时长
          // 这里统一按标准工作时长的一半计算（因为补卡通常只补一个打卡点）
          fixPunchMinutes += standardWorkMinutes / 2;
        }
      }
    }

    // 计算出差工时（分钟）- 出差因为地点限制无法打卡，通过申请补足时间
    // 优先使用审批后实际批准的时长，如果没有则使用申请时的时长
    let tripMinutes = 0;
    const tripRequests = approvedRequests.filter(r => r.requestType === 'TRIP');
    console.log(`找到 ${tripRequests.length} 条出差申请`);
    
    for (const req of tripRequests) {
      // 优先使用审批后的实际时长
      const approvedDuration = req.approvedDurationMinutes;
      const originalDuration = req.durationMinutes;
      const duration = approvedDuration ?? originalDuration;
      
      console.log(`出差申请 ID ${req.id}: approvedDuration=${approvedDuration}, originalDuration=${originalDuration}, 使用=${duration}`);
      
      if (duration) {
        tripMinutes += duration;
      } else {
        // 如果都没有，从时间计算
        const start = new Date(req.startAt);
        const end = new Date(req.endAt);
        const calculatedMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        console.log(`出差申请 ID ${req.id}: 从时间计算得到 ${calculatedMinutes} 分钟`);
        tripMinutes += calculatedMinutes;
      }
    }
    
    console.log(`总出差工时: ${tripMinutes} 分钟 (${(tripMinutes / 60).toFixed(1)} 小时)`);

    // 计算请假天数 - 请假不是减少工时，而是将那天记录为请假
    // 请假的员工不会来打卡，所以那天不会有打卡记录
    let leaveDays = 0;
    const leaveRequests = approvedRequests.filter(r => r.requestType === 'LEAVE');
    for (const req of leaveRequests) {
      if (req.durationMinutes) {
        // 按8小时一天计算
        leaveDays += req.durationMinutes / (8 * 60);
      } else {
        // 如果没有 durationMinutes，从时间范围计算天数
        const start = new Date(req.startAt);
        const end = new Date(req.endAt);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        leaveDays += days || 1; // 至少1天
      }
    }

    // 计算总工时（分钟）
    // 总工时 = 基础工时（打卡记录）+ 加班工时 + 补卡工时 + 出差工时
    // 请假不计入工时，但算作出勤天数
    const totalWorkMinutes = baseWorkMinutes + overtimeMinutes + fixPunchMinutes + tripMinutes;

    // 转换为小时（保留1位小数）
    const baseWorkHours = Math.round(baseWorkMinutes / 6) / 10; // 保留1位小数
    const overtimeHours = Math.round(overtimeMinutes / 6) / 10;
    const fixPunchHours = Math.round(fixPunchMinutes / 6) / 10;
    const tripHours = Math.round(tripMinutes / 6) / 10;
    const totalWorkHours = Math.round(totalWorkMinutes / 6) / 10;

    // 计算迟到次数（需要根据班次时间判断）
    // TODO: 实现迟到和早退的统计逻辑

    // 计算异常次数
    const anomalyCount = await prisma.attendanceAnomaly.count({
      where: {
        userId: BigInt(userId),
        orgId: BigInt(orgId),
        anomalyDate: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    console.log(`统计结果 - 基础工时: ${baseWorkHours}小时, 加班: ${overtimeHours}小时, 补卡: ${fixPunchHours}小时, 出差: ${tripHours}小时, 请假: ${leaveDays.toFixed(1)}天, 总工时: ${totalWorkHours}小时`);

    return {
      workDays,
      workHours: totalWorkHours,
      baseWorkHours, // 基础工时（从打卡记录）
      overtimeHours, // 加班工时（增加工时）
      fixPunchHours, // 补卡工时（增加工时）
      tripHours, // 出差工时（增加工时）
      leaveDays: Math.round(leaveDays * 10) / 10, // 请假天数（不计入工时）
      lateCount: 0, // TODO: 实现迟到统计
      earlyLeaveCount: 0, // TODO: 实现早退统计
      missingPunchCount,
      anomalyCount,
    };
  }
}


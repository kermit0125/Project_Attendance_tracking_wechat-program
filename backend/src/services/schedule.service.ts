import { prisma } from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { mysqlTimeToMinutes, minutesToTimeString } from '../utils/timezone';

/**
 * 班次管理服务
 */
export class ScheduleService {
  /**
   * 获取组织的所有班次
   */
  async getSchedules(orgId: number) {
    const schedules = await prisma.workSchedule.findMany({
      where: {
        orgId: BigInt(orgId),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return schedules.map((s) => this.formatSchedule(s));
  }

  /**
   * 获取班次详情
   */
  async getScheduleById(id: number, orgId: number) {
    const schedule = await prisma.workSchedule.findFirst({
      where: {
        id: BigInt(id),
        orgId: BigInt(orgId),
      },
    });

    if (!schedule) {
      throw new NotFoundError('班次不存在');
    }

    return this.formatSchedule(schedule);
  }

  /**
   * 创建班次
   */
  async createSchedule(
    orgId: number,
    data: {
      name: string;
      startTime: string; // HH:mm 格式
      endTime: string; // HH:mm 格式
      breakStart?: string; // HH:mm 格式
      breakEnd?: string; // HH:mm 格式
      lateGraceMinutes?: number;
      earlyLeaveGraceMinutes?: number;
      minWorkMinutes?: number;
      crossDay?: boolean;
    }
  ) {
    // 验证时间格式
    this.validateTimeFormat(data.startTime, '上班时间');
    this.validateTimeFormat(data.endTime, '下班时间');
    if (data.breakStart) this.validateTimeFormat(data.breakStart, '休息开始时间');
    if (data.breakEnd) this.validateTimeFormat(data.breakEnd, '休息结束时间');

    const schedule = await prisma.workSchedule.create({
      data: {
        orgId: BigInt(orgId),
        name: data.name,
        startTime: this.timeStringToDate(data.startTime),
        endTime: this.timeStringToDate(data.endTime),
        breakStart: data.breakStart ? this.timeStringToDate(data.breakStart) : null,
        breakEnd: data.breakEnd ? this.timeStringToDate(data.breakEnd) : null,
        lateGraceMinutes: data.lateGraceMinutes ?? 5,
        earlyLeaveGraceMinutes: data.earlyLeaveGraceMinutes ?? 5,
        minWorkMinutes: data.minWorkMinutes,
        crossDay: data.crossDay ?? false,
      },
    });

    return this.formatSchedule(schedule);
  }

  /**
   * 更新班次
   */
  async updateSchedule(
    id: number,
    orgId: number,
    data: {
      name?: string;
      startTime?: string;
      endTime?: string;
      breakStart?: string | null;
      breakEnd?: string | null;
      lateGraceMinutes?: number;
      earlyLeaveGraceMinutes?: number;
      minWorkMinutes?: number | null;
      crossDay?: boolean;
    }
  ) {
    const existing = await prisma.workSchedule.findFirst({
      where: {
        id: BigInt(id),
        orgId: BigInt(orgId),
      },
    });

    if (!existing) {
      throw new NotFoundError('班次不存在');
    }

    // 验证时间格式
    if (data.startTime) this.validateTimeFormat(data.startTime, '上班时间');
    if (data.endTime) this.validateTimeFormat(data.endTime, '下班时间');
    if (data.breakStart) this.validateTimeFormat(data.breakStart, '休息开始时间');
    if (data.breakEnd) this.validateTimeFormat(data.breakEnd, '休息结束时间');

    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startTime !== undefined) updateData.startTime = this.timeStringToDate(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = this.timeStringToDate(data.endTime);
    if (data.breakStart !== undefined) {
      updateData.breakStart = data.breakStart ? this.timeStringToDate(data.breakStart) : null;
    }
    if (data.breakEnd !== undefined) {
      updateData.breakEnd = data.breakEnd ? this.timeStringToDate(data.breakEnd) : null;
    }
    if (data.lateGraceMinutes !== undefined) updateData.lateGraceMinutes = data.lateGraceMinutes;
    if (data.earlyLeaveGraceMinutes !== undefined) updateData.earlyLeaveGraceMinutes = data.earlyLeaveGraceMinutes;
    if (data.minWorkMinutes !== undefined) updateData.minWorkMinutes = data.minWorkMinutes;
    if (data.crossDay !== undefined) updateData.crossDay = data.crossDay;

    const schedule = await prisma.workSchedule.update({
      where: {
        id: BigInt(id),
      },
      data: updateData,
    });

    return this.formatSchedule(schedule);
  }

  /**
   * 删除班次
   */
  async deleteSchedule(id: number, orgId: number) {
    const existing = await prisma.workSchedule.findFirst({
      where: {
        id: BigInt(id),
        orgId: BigInt(orgId),
      },
    });

    if (!existing) {
      throw new NotFoundError('班次不存在');
    }

    await prisma.workSchedule.delete({
      where: {
        id: BigInt(id),
      },
    });

    return { message: '班次已删除' };
  }

  /**
   * 格式化班次数据
   */
  private formatSchedule(schedule: any) {
    return {
      id: Number(schedule.id),
      name: schedule.name,
      startTime: minutesToTimeString(mysqlTimeToMinutes(schedule.startTime)),
      endTime: minutesToTimeString(mysqlTimeToMinutes(schedule.endTime)),
      breakStart: schedule.breakStart 
        ? minutesToTimeString(mysqlTimeToMinutes(schedule.breakStart)) 
        : null,
      breakEnd: schedule.breakEnd 
        ? minutesToTimeString(mysqlTimeToMinutes(schedule.breakEnd)) 
        : null,
      lateGraceMinutes: schedule.lateGraceMinutes,
      earlyLeaveGraceMinutes: schedule.earlyLeaveGraceMinutes,
      minWorkMinutes: schedule.minWorkMinutes,
      crossDay: schedule.crossDay,
      createdAt: schedule.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * 验证时间格式（HH:mm）
   */
  private validateTimeFormat(time: string, fieldName: string) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time)) {
      throw new BadRequestError(`${fieldName}格式错误，应为 HH:mm 格式（如 09:00）`);
    }
  }

  /**
   * 将时间字符串转换为 Date 对象（MySQL Time 类型）
   */
  private timeStringToDate(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    // MySQL Time 类型使用 1970-01-01 作为日期部分
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
  }
}


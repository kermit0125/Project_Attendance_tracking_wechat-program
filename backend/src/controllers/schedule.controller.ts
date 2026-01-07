import { FastifyRequest, FastifyReply } from 'fastify';
import { ScheduleService } from '../services/schedule.service';

const scheduleService = new ScheduleService();

/**
 * 班次管理控制器
 */
export class ScheduleController {
  /**
   * 获取班次列表
   */
  static async getSchedules(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;

    const schedules = await scheduleService.getSchedules(orgId);

    return reply.send({
      code: 'SUCCESS',
      message: '获取班次列表成功',
      data: schedules,
    });
  }

  /**
   * 获取班次详情
   */
  static async getScheduleById(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { id } = request.params as any;

    const schedule = await scheduleService.getScheduleById(Number(id), orgId);

    return reply.send({
      code: 'SUCCESS',
      message: '获取班次详情成功',
      data: schedule,
    });
  }

  /**
   * 创建班次
   */
  static async createSchedule(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const data = request.body as any;

    const schedule = await scheduleService.createSchedule(orgId, data);

    return reply.code(201).send({
      code: 'SUCCESS',
      message: '创建班次成功',
      data: schedule,
    });
  }

  /**
   * 更新班次
   */
  static async updateSchedule(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { id } = request.params as any;
    const data = request.body as any;

    const schedule = await scheduleService.updateSchedule(Number(id), orgId, data);

    return reply.send({
      code: 'SUCCESS',
      message: '更新班次成功',
      data: schedule,
    });
  }

  /**
   * 删除班次
   */
  static async deleteSchedule(request: FastifyRequest, reply: FastifyReply) {
    const { orgId } = request.user as any;
    const { id } = request.params as any;

    const result = await scheduleService.deleteSchedule(Number(id), orgId);

    return reply.send({
      code: 'SUCCESS',
      message: result.message,
      data: null,
    });
  }
}


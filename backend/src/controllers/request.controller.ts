import { FastifyRequest, FastifyReply } from 'fastify';
import { RequestService } from '../services/request.service';
import { createRequestSchema } from '../validators/request';
import { getCurrentUser } from '../middlewares/auth';

/**
 * 申请控制器
 */
export class RequestController {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  /**
   * 创建申请
   */
  async createRequest(
    request: FastifyRequest<{
      Body: CreateRequestInput;
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const body = createRequestSchema.parse(request.body);

    const result = await this.requestService.createRequest(
      user.userId,
      user.orgId,
      body
    );

    return reply.send({
      code: 'SUCCESS',
      message: '申请提交成功',
      data: result,
    });
  }

  /**
   * 获取申请列表
   */
  async getRequests(
    request: FastifyRequest<{
      Querystring: {
        page?: string;
        pageSize?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const { page = '1', pageSize = '20' } = request.query;

    console.log(`获取申请列表 - 用户ID: ${user.userId}, 组织ID: ${user.orgId}, 页码: ${page}, 每页: ${pageSize}`);

    const result = await this.requestService.getRequests(
      user.userId,
      user.orgId,
      parseInt(page, 10),
      parseInt(pageSize, 10)
    );

    console.log('申请列表结果:', JSON.stringify(result, null, 2));

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    });
  }

  /**
   * 获取申请详情
   */
  async getRequestById(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const id = parseInt(request.params.id, 10);

    console.log(`获取申请详情 - ID: ${id}, 用户ID: ${user.userId}, 组织ID: ${user.orgId}`);

    const result = await this.requestService.getRequestById(
      id,
      user.userId,
      user.orgId,
      user.roles
    );

    console.log('申请详情结果:', JSON.stringify(result, null, 2));

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    });
  }

  /**
   * 取消申请
   */
  async cancelRequest(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const id = parseInt(request.params.id, 10);

    const result = await this.requestService.cancelRequest(
      id,
      user.userId,
      user.orgId
    );

    return reply.send({
      code: 'SUCCESS',
      message: '取消成功',
      data: result,
    });
  }

  /**
   * 添加附件
   */
  async addAttachment(
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        fileName: string;
        fileUrl: string;
        mimeType?: string;
        fileSizeBytes?: number;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const id = parseInt(request.params.id, 10);

    const result = await this.requestService.addAttachment(
      id,
      user.userId,
      user.orgId,
      request.body
    );

    return reply.send({
      code: 'SUCCESS',
      message: '附件上传成功',
      data: result,
    });
  }
}

type CreateRequestInput = {
  requestType: 'LEAVE' | 'TRIP' | 'FIX_PUNCH' | 'OVERTIME';
  startAt: string;
  endAt: string;
  reason?: string;
  leaveCategory?: string;
  destination?: string;
  fixPunchDate?: string;
  fixPunchType?: 'IN' | 'OUT';
};




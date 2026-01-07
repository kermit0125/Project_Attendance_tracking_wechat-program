import { FastifyRequest, FastifyReply } from 'fastify';
import { ApprovalService } from '../services/approval.service';
import { getCurrentUser } from '../middlewares/auth';

/**
 * 审批控制器
 */
export class ApprovalController {
  private approvalService: ApprovalService;

  constructor() {
    this.approvalService = new ApprovalService();
  }

  /**
   * 获取待我审批的申请列表
   */
  async getPendingApprovals(
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

    const result = await this.approvalService.getPendingApprovals(
      user.userId,
      user.orgId,
      parseInt(page, 10),
      parseInt(pageSize, 10)
    );

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: result,
    });
  }

  /**
   * 审批决策
   */
  async makeDecision(
    request: FastifyRequest<{
      Params: { requestId: string };
      Body: {
        decision: 'APPROVED' | 'REJECTED' | 'TRANSFERRED';
        comment?: string;
        transferredTo?: number;
        approvedDurationMinutes?: number; // 审批后实际批准的时长（分钟）
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const requestId = parseInt(request.params.requestId, 10);
    const { decision, comment, transferredTo, approvedDurationMinutes } = request.body;

    // 验证时长（如果提供）
    if (approvedDurationMinutes !== undefined && approvedDurationMinutes !== null) {
      if (approvedDurationMinutes < 0) {
        return reply.status(400).send({
          code: 'VALIDATION_ERROR',
          message: '批准的时长不能为负数',
        });
      }
    }

    const result = await this.approvalService.makeDecision(
      requestId,
      user.userId,
      user.orgId,
      decision,
      comment,
      transferredTo,
      approvedDurationMinutes
    );

    return reply.send({
      code: 'SUCCESS',
      message: decision === 'APPROVED' ? '审批通过' : decision === 'REJECTED' ? '已驳回' : '已转交',
      data: result,
    });
  }
}


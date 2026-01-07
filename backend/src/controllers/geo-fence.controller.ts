import { FastifyRequest, FastifyReply } from 'fastify';
import { GeoFenceService } from '../services/geo-fence.service';
import { getCurrentUser } from '../middlewares/auth';

/**
 * 地理围栏控制器
 */
export class GeoFenceController {
  private geoFenceService: GeoFenceService;

  constructor() {
    this.geoFenceService = new GeoFenceService();
  }

  /**
   * 获取围栏列表
   */
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = getCurrentUser(request);
    const fences = await this.geoFenceService.list(user.orgId);

    return reply.send({
      code: 'SUCCESS',
      message: '获取成功',
      data: {
        items: fences,
        total: fences.length,
      },
    });
  }

  /**
   * 创建围栏
   */
  async create(
    request: FastifyRequest<{
      Body: {
        name: string;
        lat: number;
        lng: number;
        radiusM: number;
        address?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const body = request.body;

    const fence = await this.geoFenceService.create(user.orgId, {
      name: body.name,
      lat: body.lat,
      lng: body.lng,
      radiusM: body.radiusM,
      address: body.address,
    });

    return reply.send({
      code: 'SUCCESS',
      message: '创建成功',
      data: fence,
    });
  }

  /**
   * 更新围栏
   */
  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: {
        name?: string;
        lat?: number;
        lng?: number;
        radiusM?: number;
        address?: string;
        isActive?: boolean;
      };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const id = parseInt(request.params.id, 10);
    const body = request.body;

    const fence = await this.geoFenceService.update(user.orgId, id, body);

    return reply.send({
      code: 'SUCCESS',
      message: '更新成功',
      data: fence,
    });
  }

  /**
   * 删除围栏
   */
  async delete(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply
  ) {
    const user = getCurrentUser(request);
    const id = parseInt(request.params.id, 10);

    await this.geoFenceService.delete(user.orgId, id);

    return reply.send({
      code: 'SUCCESS',
      message: '删除成功',
    });
  }
}






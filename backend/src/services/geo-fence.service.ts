import { GeoFenceRepository } from '../repositories/geo-fence.repository';
import { Errors } from '../utils/errors';

/**
 * 地理围栏服务
 */
export class GeoFenceService {
  private geoFenceRepo: GeoFenceRepository;

  constructor() {
    this.geoFenceRepo = new GeoFenceRepository();
  }

  /**
   * 获取围栏列表
   */
  async list(orgId: number) {
    const fences = await this.geoFenceRepo.findByOrg(orgId);
    return fences.map(f => ({
      id: Number(f.id),
      name: f.name,
      lat: Number(f.lat),
      lng: Number(f.lng),
      radiusM: f.radiusM,
      description: f.description,
      isActive: f.isActive === 1,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }

  /**
   * 创建围栏
   */
  async create(
    orgId: number,
    data: {
      name: string;
      lat: number;
      lng: number;
      radiusM: number;
      description?: string;
    }
  ) {
    const fence = await this.geoFenceRepo.create({
      orgId,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      radiusM: data.radiusM,
      description: data.description,
    });

    return {
      id: Number(fence.id),
      name: fence.name,
      lat: Number(fence.lat),
      lng: Number(fence.lng),
      radiusM: fence.radiusM,
      description: fence.description,
      isActive: fence.isActive === 1,
      createdAt: fence.createdAt,
      updatedAt: fence.updatedAt,
    };
  }

  /**
   * 更新围栏
   */
  async update(
    orgId: number,
    id: number,
    data: {
      name?: string;
      lat?: number;
      lng?: number;
      radiusM?: number;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const fence = await this.geoFenceRepo.findById(id, orgId);
    if (!fence) {
      throw Errors.GEO_FENCE_NOT_FOUND();
    }

    const updated = await this.geoFenceRepo.update(id, {
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      radiusM: data.radiusM,
      description: data.description,
      isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined,
    });

    return {
      id: Number(updated.id),
      name: updated.name,
      lat: Number(updated.lat),
      lng: Number(updated.lng),
      radiusM: updated.radiusM,
      description: updated.description,
      isActive: updated.isActive === 1,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * 删除围栏
   */
  async delete(orgId: number, id: number) {
    const fence = await this.geoFenceRepo.findById(id, orgId);
    if (!fence) {
      throw Errors.GEO_FENCE_NOT_FOUND();
    }

    await this.geoFenceRepo.delete(id);
  }
}






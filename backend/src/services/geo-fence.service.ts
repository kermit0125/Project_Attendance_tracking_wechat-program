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
      address: f.address,
      isActive: f.isActive,
      createdAt: f.createdAt,
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
      address?: string;
    }
  ) {
    const fence = await this.geoFenceRepo.create({
      orgId,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
      radiusM: data.radiusM,
      address: data.address,
    });

    return {
      id: Number(fence.id),
      name: fence.name,
      lat: Number(fence.lat),
      lng: Number(fence.lng),
      radiusM: fence.radiusM,
      address: fence.address,
      isActive: fence.isActive,
      createdAt: fence.createdAt,
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
      address?: string;
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
      address: data.address,
      isActive: data.isActive,
    });

    return {
      id: Number(updated.id),
      name: updated.name,
      lat: Number(updated.lat),
      lng: Number(updated.lng),
      radiusM: updated.radiusM,
      address: updated.address,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
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






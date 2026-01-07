import { prisma } from '../config/prisma';

/**
 * 地理围栏数据访问层
 */
export class GeoFenceRepository {
  /**
   * 获取组织的所有活跃围栏
   */
  async findActiveByOrg(orgId: number) {
    return prisma.geoFence.findMany({
      where: {
        orgId: BigInt(orgId),
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 获取组织的所有围栏
   */
  async findByOrg(orgId: number) {
    return prisma.geoFence.findMany({
      where: {
        orgId: BigInt(orgId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 根据 ID 查找围栏
   */
  async findById(id: number, orgId?: number) {
    return prisma.geoFence.findFirst({
      where: {
        id: BigInt(id),
        ...(orgId && { orgId: BigInt(orgId) }),
      },
    });
  }

  /**
   * 创建围栏
   */
  async create(data: {
    orgId: number;
    name: string;
    lat: number;
    lng: number;
    radiusM: number;
    address?: string;
  }) {
    return prisma.geoFence.create({
      data: {
        orgId: BigInt(data.orgId),
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        radiusM: data.radiusM,
        address: data.address,
        isActive: true,
      },
    });
  }

  /**
   * 更新围栏
   */
  async update(
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
    return prisma.geoFence.update({
      where: {
        id: BigInt(id),
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.lat !== undefined && { lat: data.lat }),
        ...(data.lng !== undefined && { lng: data.lng }),
        ...(data.radiusM !== undefined && { radiusM: data.radiusM }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  /**
   * 删除围栏
   */
  async delete(id: number) {
    return prisma.geoFence.delete({
      where: {
        id: BigInt(id),
      },
    });
  }
}




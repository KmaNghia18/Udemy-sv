import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import Promotion from '../models/Promotion';
import Course from '../models/Course';
import PriceTier from '../models/PriceTier';

export interface CreatePromotionDTO {
  name: string;
  description?: string;
  discountPercent: number;
  scope?: 'all' | 'specific_tiers' | 'specific_categories';
  scopeIds?: number[] | string[];   // tier IDs hoặc category UUIDs
  minPriceTierId?: number;
  startsAt: Date;
  endsAt: Date;
  isActive?: boolean;
}

export class PromotionService {

  // ── Admin: tạo promotion ──────────────────────────────────────────────────
  async create(dto: CreatePromotionDTO): Promise<Promotion> {
    if (dto.discountPercent <= 0 || dto.discountPercent > 100) {
      throw new AppError('Discount percent must be between 1 and 100', 400);
    }
    if (new Date(dto.startsAt) >= new Date(dto.endsAt)) {
      throw new AppError('ends_at must be after starts_at', 400);
    }

    // ── Kiểm tra trùng thời gian với promotion cùng scope đang active ────
    const scope = dto.scope ?? 'all';
    const overlapping = await Promotion.findAll({
      where: {
        scope,
        // Overlap: existingStart < newEnd AND existingEnd > newStart
        startsAt: { [Op.lt]: new Date(dto.endsAt) },
        endsAt: { [Op.gt]: new Date(dto.startsAt) },
      },
    });

    if (overlapping.length > 0) {
      // Nếu scope là all → luôn conflict
      if (scope === 'all') {
        throw new AppError(
          `Đã tồn tại khuyến mãi "${overlapping[0].name}" (scope: all) trùng thời gian. Vui lòng chọn khoảng thời gian khác hoặc tắt promotion cũ.`,
          400,
        );
      }
      // Nếu scope specific → chỉ conflict khi scopeIds giao nhau
      const newIds = new Set((dto.scopeIds ?? []).map(String));
      for (const existing of overlapping) {
        const existingIds: string[] = JSON.parse(existing.scopeIds ?? '[]');
        const hasIntersection = existingIds.some((id) => newIds.has(String(id)));
        if (hasIntersection) {
          throw new AppError(
            `Đã tồn tại khuyến mãi "${existing.name}" trùng thời gian và trùng ${scope === 'specific_tiers' ? 'tier' : 'danh mục'}. Vui lòng kiểm tra lại.`,
            400,
          );
        }
      }
    }

    return Promotion.create({
      name: dto.name,
      description: dto.description,
      discountPercent: dto.discountPercent,
      scope,
      scopeIds: dto.scopeIds ? JSON.stringify(dto.scopeIds) : null,
      minPriceTierId: dto.minPriceTierId ?? null,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
  }

  // ── Admin: lấy tất cả promotions ──────────────────────────────────────────
  async getAll(): Promise<Promotion[]> {
    return Promotion.findAll({ order: [['startsAt', 'DESC']] });
  }

  // ── Public: lấy promotions đang active (cho mobile banner) ─────────────────
  async getActive(): Promise<Promotion[]> {
    const now = new Date();
    return Promotion.findAll({
      where: {
        isActive: true,
        startsAt: { [Op.lte]: now },
        endsAt: { [Op.gte]: now },
      },
      order: [['discountPercent', 'DESC']],
    });
  }

  // ── Admin: cập nhật promotion ─────────────────────────────────────────────
  async update(id: number, dto: Partial<CreatePromotionDTO> & { isActive?: boolean }): Promise<Promotion> {
    const promo = await Promotion.findByPk(id);
    if (!promo) throw new AppError('Promotion not found', 404);

    await promo.update({
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
      ...(dto.scope && { scope: dto.scope }),
      ...(dto.scopeIds !== undefined && { scopeIds: JSON.stringify(dto.scopeIds) }),
      ...(dto.minPriceTierId !== undefined && { minPriceTierId: dto.minPriceTierId }),
      ...(dto.startsAt && { startsAt: new Date(dto.startsAt) }),
      ...(dto.endsAt && { endsAt: new Date(dto.endsAt) }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return promo;
  }

  // ── Admin: xóa promotion ──────────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    const promo = await Promotion.findByPk(id);
    if (!promo) throw new AppError('Promotion not found', 404);
    await promo.destroy();
  }

  // ── Lấy promotion đang active cho 1 course (gọi khi tính giá) ─────────────
  // Priority: lấy promotion có discount cao nhất nếu có nhiều cái active cùng lúc
  async getActiveForCourse(courseId: string): Promise<Promotion | null> {
    const now = new Date();
    const course = await Course.findByPk(courseId, {
      include: [{ model: PriceTier, as: 'priceTier' }],
    });
    if (!course) return null;

    const priceTierId = course.priceTierId;
    const categoryIds: string[] = ((course as any).categories ?? []).map((c: any) => c.id);

    // Lấy tất cả promotions đang active
    const promotions = await Promotion.findAll({
      where: {
        isActive: true,
        startsAt: { [Op.lte]: now },
        endsAt: { [Op.gte]: now },
      },
      order: [['discountPercent', 'DESC']], // ưu tiên discount cao nhất
    });

    for (const promo of promotions) {
      // scope = all → áp dụng cho tất cả
      if (promo.scope === 'all') {
        // Kiểm tra minPriceTierId
        if (promo.minPriceTierId && priceTierId && priceTierId < promo.minPriceTierId) {
          continue;
        }
        return promo;
      }

      // scope = specific_tiers
      if (promo.scope === 'specific_tiers' && priceTierId) {
        const tierIds: number[] = JSON.parse(promo.scopeIds ?? '[]');
        if (tierIds.includes(priceTierId)) return promo;
      }

      // scope = specific_categories
      if (promo.scope === 'specific_categories' && categoryIds.length > 0) {
        const catIds: string[] = JSON.parse(promo.scopeIds ?? '[]');
        if (categoryIds.some(id => catIds.includes(id))) return promo;
      }
    }

    return null;
  }

  // ── Tính giá sau khi áp dụng promotion (không cần coupon code) ─────────────
  async calculatePromotionPrice(courseId: string): Promise<{
    originalPrice: number;
    promotion: Promotion | null;
    discountAmount: number;
    finalPrice: number;
  }> {
    const course = await Course.findByPk(courseId, {
      include: [{ model: PriceTier, as: 'priceTier' }],
    });
    if (!course) throw new AppError('Course not found', 404);

    const originalPrice = Number((course as any).priceTier?.price ?? 0);
    const promotion = await this.getActiveForCourse(courseId);

    if (!promotion) {
      return { originalPrice, promotion: null, discountAmount: 0, finalPrice: originalPrice };
    }

    const discountAmount = Math.round(originalPrice * Number(promotion.discountPercent) / 100);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return { originalPrice, promotion, discountAmount, finalPrice };
  }
}

export const promotionService = new PromotionService();

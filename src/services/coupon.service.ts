import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import Coupon from '../models/Coupon';
import Course from '../models/Course';
import User from '../models/User';
import { Instructor } from '../models/Instructor';
import PriceTier from '../models/PriceTier';

export interface CreateCouponDTO {
  code: string;
  courseId: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxUses?: number;
  startsAt?: Date;
  expiresAt?: Date;
}

export class CouponService {

  // ── Admin: xem tất cả coupons ─────────────────────────────────────────────
  async getAll(): Promise<Coupon[]> {
    return Coupon.findAll({
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // ── Instructor tạo coupon cho course của mình ─────────────────────────────
  async create(dto: CreateCouponDTO, instructorUserId: string): Promise<Coupon> {
    // Kiểm tra course thuộc instructor
    const instructor = await Instructor.findOne({ where: { userId: instructorUserId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);

    const course = await Course.findOne({ where: { id: dto.courseId, instructorId: instructor.id } });
    if (!course) throw new AppError('Course not found or you do not own this course', 404);

    // Kiểm tra code trùng
    const existing = await Coupon.findOne({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new AppError('Coupon code already exists', 409);

    // Validate discount_value
    if (dto.discountType === 'percent' && (dto.discountValue <= 0 || dto.discountValue > 100)) {
      throw new AppError('Percent discount must be between 1 and 100', 400);
    }

    return Coupon.create({
      code: dto.code.toUpperCase(),
      courseId: dto.courseId,
      createdBy: instructorUserId,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUses: dto.maxUses ?? null,
      startsAt: dto.startsAt ?? null,
      expiresAt: dto.expiresAt ?? null,
    });
  }

  // ── Lấy danh sách coupon của instructor ──────────────────────────────────
  async getByInstructor(instructorUserId: string): Promise<Coupon[]> {
    return Coupon.findAll({
      where: { createdBy: instructorUserId },
      order: [['createdAt', 'DESC']],
    });
  }

  // ── Lấy coupon theo course ────────────────────────────────────────────────
  async getByCourse(courseId: string, instructorUserId: string): Promise<Coupon[]> {
    const instructor = await Instructor.findOne({ where: { userId: instructorUserId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);

    const course = await Course.findOne({ where: { id: courseId, instructorId: instructor.id } });
    if (!course) throw new AppError('Course not found or you do not own this course', 404);

    return Coupon.findAll({ where: { courseId }, order: [['createdAt', 'DESC']] });
  }

  // ── Xóa coupon (soft: set isActive = false) ───────────────────────────────
  async deactivate(couponId: number, instructorUserId: string): Promise<void> {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) throw new AppError('Coupon not found', 404);
    if (coupon.createdBy !== instructorUserId) throw new AppError('You do not own this coupon', 403);
    await coupon.update({ isActive: false });
  }

  // ── Validate coupon code: trả về final price sau khi áp dụng ─────────────
  async validate(code: string, courseId: string): Promise<{
    coupon: Coupon;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  }> {
    const now = new Date();

    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        courseId,
        isActive: true,
        [Op.and]: [
          { [Op.or]: [{ startsAt: null }, { startsAt: { [Op.lte]: now } }] },
          { [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gte]: now } }] },
        ],
      },
    });

    if (!coupon) throw new AppError('Coupon code is invalid, expired, or not applicable to this course', 400);

    // Kiểm tra giới hạn uses
    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    // Lấy giá gốc từ tier
    const course = await Course.findByPk(courseId, {
      include: [{ model: PriceTier, as: 'priceTier' }],
    });
    if (!course) throw new AppError('Course not found', 404);

    const originalPrice = Number((course as any).priceTier?.price ?? 0);

    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round(originalPrice * Number(coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), originalPrice);
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return { coupon, originalPrice, discountAmount, finalPrice };
  }

  // ── Tăng usesCount sau khi dùng coupon thành công (gọi khi thanh toán) ───
  async incrementUses(couponId: number): Promise<void> {
    await Coupon.increment('usesCount', { where: { id: couponId } });
  }
}

export const couponService = new CouponService();

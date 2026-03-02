import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { couponService } from '../services/coupon.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/coupons — admin xem tất cả coupons
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await couponService.getAll();
    sendSuccess(res, coupons);
  } catch (error) { next(error); }
};

// POST /api/v1/coupons — instructor tạo coupon
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { code, courseId, discountType, discountValue, maxUses, startsAt, expiresAt } = req.body;
    if (!code || !courseId || !discountType || discountValue === undefined) {
      throw new AppError('code, courseId, discountType, and discountValue are required', 400);
    }
    const coupon = await couponService.create(
      { code, courseId, discountType, discountValue: Number(discountValue), maxUses, startsAt, expiresAt },
      req.user.id
    );
    sendSuccess(res, coupon, 'Coupon created', 201);
  } catch (error) { next(error); }
};

// GET /api/v1/coupons/my — instructor xem coupon của mình
export const getMy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const coupons = await couponService.getByInstructor(req.user.id);
    sendSuccess(res, coupons);
  } catch (error) { next(error); }
};

// GET /api/v1/coupons/course/:courseId — instructor xem coupon theo course
export const getByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const coupons = await couponService.getByCourse(req.params.courseId, req.user.id);
    sendSuccess(res, coupons);
  } catch (error) { next(error); }
};

// DELETE /api/v1/coupons/:id — instructor deactivate coupon
export const deactivate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await couponService.deactivate(Number(req.params.id), req.user.id);
    sendSuccess(res, null, 'Coupon deactivated');
  } catch (error) { next(error); }
};

// POST /api/v1/coupons/validate — public: validate coupon code cho 1 course
export const validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, courseId } = req.body;
    if (!code || !courseId) throw new AppError('code and courseId are required', 400);
    const result = await couponService.validate(code, courseId);
    sendSuccess(res, {
      couponId: result.coupon.id,
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      originalPrice: result.originalPrice,
      discountAmount: result.discountAmount,
      finalPrice: result.finalPrice,
    }, 'Coupon is valid');
  } catch (error) { next(error); }
};

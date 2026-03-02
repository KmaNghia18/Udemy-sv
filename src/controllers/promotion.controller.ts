import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { promotionService } from '../services/promotion.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/promotions — admin xem tất cả promotions
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotions = await promotionService.getAll();
    sendSuccess(res, promotions);
  } catch (error) { next(error); }
};

// GET /api/v1/promotions/active — public: lấy promotions đang active
export const getActive = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotions = await promotionService.getActive();
    sendSuccess(res, promotions);
  } catch (error) { next(error); }
};

// POST /api/v1/promotions — admin tạo promotion
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, discountPercent, scope, scopeIds, minPriceTierId, startsAt, endsAt, isActive } = req.body;
    if (!name || discountPercent === undefined || !startsAt || !endsAt) {
      throw new AppError('name, discountPercent, startsAt, and endsAt are required', 400);
    }
    const promotion = await promotionService.create({
      name, description, discountPercent: Number(discountPercent),
      scope, scopeIds, minPriceTierId, startsAt, endsAt, isActive,
    });
    sendSuccess(res, promotion, 'Promotion created', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/promotions/:id — admin cập nhật
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const promotion = await promotionService.update(Number(req.params.id), req.body);
    sendSuccess(res, promotion, 'Promotion updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/promotions/:id — admin xóa
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await promotionService.remove(Number(req.params.id));
    sendSuccess(res, null, 'Promotion deleted');
  } catch (error) { next(error); }
};

// GET /api/v1/promotions/course/:courseId/price — public: tính giá sau promotion
export const getCoursePrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await promotionService.calculatePromotionPrice(req.params.courseId);
    sendSuccess(res, {
      originalPrice: result.originalPrice,
      promotion: result.promotion ? {
        id: result.promotion.id,
        name: result.promotion.name,
        discountPercent: result.promotion.discountPercent,
        endsAt: result.promotion.endsAt,
      } : null,
      discountAmount: result.discountAmount,
      finalPrice: result.finalPrice,
    });
  } catch (error) { next(error); }
};

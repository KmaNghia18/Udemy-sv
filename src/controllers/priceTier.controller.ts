import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import PriceTier from '../models/PriceTier';
import { AppError } from '../utils/AppError';

// GET /api/v1/price-tiers — danh sách tất cả tier đang active (public)
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tiers = await PriceTier.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']],
      attributes: ['id', 'label', 'price', 'sortOrder'],
    });
    sendSuccess(res, tiers, 'Price tiers fetched successfully');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/price-tiers — admin tạo tier mới
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { label, price, sortOrder } = req.body;
    if (!label || price === undefined) throw new AppError('label and price are required', 400);

    const tier = await PriceTier.create({ label, price: Number(price), sortOrder: sortOrder ?? 0 });
    sendSuccess(res, tier, 'Price tier created', 201);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/price-tiers/:id — admin cập nhật tier
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tier = await PriceTier.findByPk(req.params.id);
    if (!tier) throw new AppError('Price tier not found', 404);

    const { label, price, isActive, sortOrder } = req.body;
    await tier.update({
      ...(label !== undefined && { label }),
      ...(price !== undefined && { price: Number(price) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
    });
    sendSuccess(res, tier, 'Price tier updated');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/price-tiers/:id — admin xóa tier (soft: set isActive = false)
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tier = await PriceTier.findByPk(req.params.id);
    if (!tier) throw new AppError('Price tier not found', 404);
    await tier.update({ isActive: false });
    sendSuccess(res, null, 'Price tier deactivated');
  } catch (error) {
    next(error);
  }
};

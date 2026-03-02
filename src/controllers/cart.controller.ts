import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { cartService } from '../services/cart.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/cart — xem giỏ hàng
export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const result = await cartService.getCart(req.user.id);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// GET /api/v1/cart/count — đếm số item
export const getCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const count = await cartService.getCount(req.user.id);
    sendSuccess(res, { count });
  } catch (error) { next(error); }
};

// POST /api/v1/cart/:courseId — thêm vào giỏ
export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const item = await cartService.addToCart(req.user.id, req.params.courseId);
    sendSuccess(res, item, 'Added to cart', 201);
  } catch (error) { next(error); }
};

// DELETE /api/v1/cart/:courseId — xóa khỏi giỏ
export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await cartService.removeFromCart(req.user.id, req.params.courseId);
    sendSuccess(res, null, 'Removed from cart');
  } catch (error) { next(error); }
};

// DELETE /api/v1/cart — xóa toàn bộ giỏ
export const clearCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await cartService.clearCart(req.user.id);
    sendSuccess(res, null, 'Cart cleared');
  } catch (error) { next(error); }
};

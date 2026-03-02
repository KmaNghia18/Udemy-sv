import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { wishlistService } from '../services/wishlist.service';
import { AppError } from '../utils/AppError';
import { WishlistTargetType } from '../models/Wishlist';

// POST /api/v1/wishlists/toggle — toggle thích/bỏ thích
export const toggle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { targetType, targetId } = req.body;
    if (!targetType || !targetId) throw new AppError('targetType and targetId are required', 400);
    if (!['course', 'lesson'].includes(targetType)) throw new AppError('targetType must be course or lesson', 400);
    const result = await wishlistService.toggle(req.user.id, targetType as WishlistTargetType, targetId);
    sendSuccess(res, result, result.liked ? 'Added to wishlist' : 'Removed from wishlist');
  } catch (error) { next(error); }
};

// GET /api/v1/wishlists/check?targetType=course&targetId=xxx — kiểm tra đã thích chưa
export const checkLiked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) throw new AppError('targetType and targetId are required', 400);
    const liked = await wishlistService.isLiked(req.user.id, targetType as WishlistTargetType, targetId as string);
    sendSuccess(res, { liked });
  } catch (error) { next(error); }
};

// GET /api/v1/wishlists/courses — lấy ds khóa học yêu thích
export const getMyCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const wishlists = await wishlistService.getMyWishlist(req.user.id, 'course');
    sendSuccess(res, wishlists);
  } catch (error) { next(error); }
};

// GET /api/v1/wishlists/lessons — lấy ds bài học yêu thích
export const getMyLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const wishlists = await wishlistService.getMyWishlist(req.user.id, 'lesson');
    sendSuccess(res, wishlists);
  } catch (error) { next(error); }
};

// GET /api/v1/wishlists/count?targetType=course&targetId=xxx — đếm lượt thích (public)
export const getLikeCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) throw new AppError('targetType and targetId are required', 400);
    const count = await wishlistService.getLikeCount(targetType as WishlistTargetType, targetId as string);
    sendSuccess(res, { count });
  } catch (error) { next(error); }
};

// POST /api/v1/wishlists/batch-check — kiểm tra nhiều target cùng lúc
export const batchCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { targetType, targetIds } = req.body;
    if (!targetType || !targetIds || !Array.isArray(targetIds)) {
      throw new AppError('targetType and targetIds[] are required', 400);
    }
    const likedIds = await wishlistService.getLikedIds(req.user.id, targetType as WishlistTargetType, targetIds);
    sendSuccess(res, { likedIds });
  } catch (error) { next(error); }
};

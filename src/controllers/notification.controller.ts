import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { notificationService } from '../services/notification.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/notifications — lấy danh sách notification
export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.getMyNotifications(req.user.id, page, limit);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// GET /api/v1/notifications/unread-count — đếm chưa đọc
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const count = await notificationService.getUnreadCount(req.user.id);
    sendSuccess(res, { count });
  } catch (error) { next(error); }
};

// PATCH /api/v1/notifications/:id/read — đánh dấu đã đọc
export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await notificationService.markAsRead(req.params.id, req.user.id);
    sendSuccess(res, null, 'Marked as read');
  } catch (error) { next(error); }
};

// PATCH /api/v1/notifications/read-all — đánh dấu tất cả đã đọc
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, null, 'All marked as read');
  } catch (error) { next(error); }
};

// DELETE /api/v1/notifications/:id — xóa 1 notification
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await notificationService.remove(req.params.id, req.user.id);
    sendSuccess(res, null, 'Notification deleted');
  } catch (error) { next(error); }
};

// DELETE /api/v1/notifications/clear — xóa tất cả đã đọc
export const clearRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await notificationService.clearRead(req.user.id);
    sendSuccess(res, null, 'Read notifications cleared');
  } catch (error) { next(error); }
};

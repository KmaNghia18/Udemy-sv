import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { orderService } from '../services/order.service';
import { AppError } from '../utils/AppError';
import { OrderStatus } from '../models/Order';

// POST /api/v1/orders — user: tạo order (mua khóa học)
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { courseId, couponCode, paymentMethod } = req.body;
    if (!courseId) throw new AppError('courseId is required', 400);
    const order = await orderService.create({
      userId: req.user.id,
      courseId,
      couponCode,
      paymentMethod,
    });
    sendSuccess(res, order, 'Order created', 201);
  } catch (error) { next(error); }
};

// PATCH /api/v1/orders/:id/complete — hoàn thành thanh toán
export const complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { paymentId } = req.body;
    const order = await orderService.completeOrder(req.params.id, paymentId);
    sendSuccess(res, order, 'Order completed');
  } catch (error) { next(error); }
};

// PATCH /api/v1/orders/:id/cancel — user: hủy order
export const cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    sendSuccess(res, order, 'Order cancelled');
  } catch (error) { next(error); }
};

// PATCH /api/v1/orders/:id/refund — admin: hoàn tiền
export const refund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.refundOrder(req.params.id);
    sendSuccess(res, order, 'Order refunded');
  } catch (error) { next(error); }
};

// GET /api/v1/orders/my — user: lịch sử mua hàng
export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const orders = await orderService.getMyOrders(req.user.id);
    sendSuccess(res, orders);
  } catch (error) { next(error); }
};

// GET /api/v1/orders/check/:courseId — user: kiểm tra đã mua chưa
export const checkPurchased = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const purchased = await orderService.hasPurchased(req.user.id, req.params.courseId);
    sendSuccess(res, { purchased });
  } catch (error) { next(error); }
};

// GET /api/v1/orders — admin: tất cả orders
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await orderService.getAll(req.query.status as OrderStatus | undefined);
    sendSuccess(res, orders);
  } catch (error) { next(error); }
};

// GET /api/v1/orders/:id — admin: chi tiết order
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.getById(req.params.id);
    sendSuccess(res, order);
  } catch (error) { next(error); }
};

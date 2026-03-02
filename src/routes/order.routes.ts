import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { create, complete, cancel, refund, getMyOrders, checkPurchased, getAll, getById } from '../controllers/order.controller';

const OrderRouter = Router();

// User
OrderRouter.get('/my', authenticate, getMyOrders);
OrderRouter.get('/check/:courseId', authenticate, checkPurchased);
OrderRouter.post('/', authenticate, create);
OrderRouter.patch('/:id/complete', authenticate, complete);
OrderRouter.patch('/:id/cancel', authenticate, cancel);

// Admin
OrderRouter.get('/', authenticate, authorize('admin'), getAll);
OrderRouter.get('/:id', authenticate, authorize('admin'), getById);
OrderRouter.patch('/:id/refund', authenticate, authorize('admin'), refund);

export default OrderRouter;

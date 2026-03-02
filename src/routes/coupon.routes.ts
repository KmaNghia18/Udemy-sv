import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getAll, create, getMy, getByCourse, deactivate, validate } from '../controllers/coupon.controller';

const CouponRouter = Router();

// Public: validate coupon trước khi checkout
CouponRouter.post('/validate', validate);

// Admin: xem tất cả coupons
CouponRouter.get('/all', authenticate, authorize('admin'), getAll);

// Instructor only
CouponRouter.post('/', authenticate, authorize('instructor', 'admin'), create);
CouponRouter.get('/my', authenticate, authorize('instructor', 'admin'), getMy);
CouponRouter.get('/course/:courseId', authenticate, authorize('instructor', 'admin'), getByCourse);
CouponRouter.delete('/:id', authenticate, authorize('instructor', 'admin'), deactivate);

export default CouponRouter;

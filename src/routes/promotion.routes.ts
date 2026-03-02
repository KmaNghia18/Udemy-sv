import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getAll, getActive, create, update, remove, getCoursePrice } from '../controllers/promotion.controller';

const PromotionRouter = Router();

// Public: tính giá sau promotion cho 1 course
PromotionRouter.get('/course/:courseId/price', getCoursePrice);

// Public: lấy promotions đang active
PromotionRouter.get('/active', getActive);

// Admin only
PromotionRouter.get('/', authenticate, authorize('admin'), getAll);
PromotionRouter.post('/', authenticate, authorize('admin'), create);
PromotionRouter.put('/:id', authenticate, authorize('admin'), update);
PromotionRouter.delete('/:id', authenticate, authorize('admin'), remove);

export default PromotionRouter;

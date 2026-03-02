import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getAll, getCategories, create, update, remove } from '../controllers/faq.controller';

const FaqRouter = Router();

// Public
FaqRouter.get('/', getAll);                 // GET /faqs?category=Thanh+toán
FaqRouter.get('/categories', getCategories); // GET /faqs/categories

// Admin only
FaqRouter.post('/', authenticate, authorize('admin'), create);
FaqRouter.put('/:id', authenticate, authorize('admin'), update);
FaqRouter.delete('/:id', authenticate, authorize('admin'), remove);

export default FaqRouter;

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getAll, create, update, remove } from '../controllers/priceTier.controller';

const PriceTierRouter = Router();

// Public: xem danh sách tiers
PriceTierRouter.get('/', getAll);

// Admin only: quản lý tiers
PriceTierRouter.post('/', authenticate, authorize('admin'), create);
PriceTierRouter.put('/:id', authenticate, authorize('admin'), update);
PriceTierRouter.delete('/:id', authenticate, authorize('admin'), remove);

export default PriceTierRouter;

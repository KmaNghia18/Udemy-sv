import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadCategoryIcon } from '../utils/upload';
import { getTree, getAll, getById, create, update, remove } from '../controllers/category.controller';

const CategoryRouter = Router();

// ─── Middleware: chỉ dùng multer khi request là multipart/form-data ──────────
// Nếu gửi JSON thuần thì bỏ qua multer (express.json() đã parse sẵn)
const optionalIconUpload = (req: Request, res: Response, next: NextFunction): void => {
  if (req.is('multipart/form-data')) {
    uploadCategoryIcon.single('icon')(req, res, next);
  } else {
    next();
  }
};

// Static trước /:id
CategoryRouter.get('/tree', getTree);
CategoryRouter.get('/', getAll);
CategoryRouter.get('/:id', getById);

// Admin only — hỗ trợ cả JSON và multipart/form-data
CategoryRouter.post('/', authenticate, authorize('admin'), optionalIconUpload, create);
CategoryRouter.put('/:id', authenticate, authorize('admin'), optionalIconUpload, update);
CategoryRouter.delete('/:id', authenticate, authorize('admin'), remove);

export default CategoryRouter;

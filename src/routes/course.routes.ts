import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadCourseFiles } from '../utils/upload';
import {
  getAll,
  getAllAdmin,
  getById,
  getMyCourses,
  getPurchasedCourses,
  create,
  update,
  submit,
  approve,
  reject,
  remove,
} from '../controllers/course.controller';

const CourseRouter = Router();

// ─── Middleware: chỉ dùng multer khi request là multipart/form-data ───────────
const optionalCourseUpload = (req: Request, res: Response, next: NextFunction): void => {
  if (req.is('multipart/form-data')) {
    uploadCourseFiles(req, res, next);
  } else {
    next();
  }
};

// ─── Static routes trước (tránh bị /:id nuốt) ────────────────────────────────
CourseRouter.get('/my', authenticate, getMyCourses);
CourseRouter.get('/purchased', authenticate, getPurchasedCourses);

// ─── Public ───────────────────────────────────────────────────────────────────
CourseRouter.get('/', getAll);
CourseRouter.get('/admin', authenticate, authorize('admin'), getAllAdmin);
CourseRouter.get('/:id', getById);

// ─── Instructor ───────────────────────────────────────────────────────────────
CourseRouter.post('/', authenticate, authorize('instructor', 'admin'), optionalCourseUpload, create);
CourseRouter.put('/:id', authenticate, authorize('instructor', 'admin'), optionalCourseUpload, update);
CourseRouter.patch('/:id/submit', authenticate, authorize('instructor'), submit);

// ─── Admin only ───────────────────────────────────────────────────────────────
CourseRouter.patch('/:id/approve', authenticate, authorize('admin'), approve);
CourseRouter.patch('/:id/reject', authenticate, authorize('admin'), reject);

// ─── Owner / Admin ────────────────────────────────────────────────────────────
CourseRouter.delete('/:id', authenticate, authorize('instructor', 'admin'), remove);

export default CourseRouter;

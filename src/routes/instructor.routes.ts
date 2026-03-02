import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAll,
  getAllAdmin,
  getById,
  getMyProfile,
  register,
  updateMyProfile,
  approve,
  remove,
  getMyStudents,
} from '../controllers/instructor.controller';
import reviewRoutes from './instructorReview.routes';

const InstructorRouter = Router();

// ─── Nested: /api/v1/instructors/:instructorId/reviews ────────────────────────
InstructorRouter.use('/:instructorId/reviews', reviewRoutes);

// ─── Protected (static routes trước — tránh bị /:id nuốt) ────────────────────
InstructorRouter.get('/me', authenticate, getMyProfile);
InstructorRouter.get('/me/students', authenticate, getMyStudents);
InstructorRouter.post('/register', authenticate, register);
InstructorRouter.put('/me', authenticate, updateMyProfile);

// ─── Admin only (static routes — phải trước /:id) ─────────────────────────────
InstructorRouter.get('/admin/all', authenticate, authorize('admin'), getAllAdmin);

// ─── Public ───────────────────────────────────────────────────────────────────
InstructorRouter.get('/', getAll);
InstructorRouter.get('/:id', getById);          // ← phải sau /me và /admin/all

// ─── Admin only ───────────────────────────────────────────────────────────────
InstructorRouter.patch('/:id/approve', authenticate, authorize('admin'), approve);
InstructorRouter.delete('/:id', authenticate, authorize('admin'), remove);

export default InstructorRouter;


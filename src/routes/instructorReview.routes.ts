import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getByInstructor,
  create,
  update,
  remove,
} from '../controllers/instructorReview.controller';
import { createForInstructor as createReply } from '../controllers/reviewReply.controller';

const InstructorReviewRouter = Router({ mergeParams: true });

// GET  /api/v1/instructors/:instructorId/reviews     — Xem reviews của instructor (public)
InstructorReviewRouter.get('/', getByInstructor);

// POST /api/v1/instructors/:instructorId/reviews     — Viết review (phải login)
InstructorReviewRouter.post('/', authenticate, create);

// PUT  /api/v1/instructors/:instructorId/reviews/:reviewId  — Sửa review của mình
InstructorReviewRouter.put('/:reviewId', authenticate, update);

// DELETE /api/v1/instructors/:instructorId/reviews/:reviewId — Xóa review (owner/admin)
InstructorReviewRouter.delete('/:reviewId', authenticate, remove);

// POST /api/v1/instructors/:instructorId/reviews/:reviewId/reply — Instructor phản hồi review
InstructorReviewRouter.post('/:reviewId/reply', authenticate, createReply);

export default InstructorReviewRouter;


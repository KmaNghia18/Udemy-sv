import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getByCourse, create, update, remove } from '../controllers/courseReview.controller';
import { createForCourse as createReply } from '../controllers/reviewReply.controller';

const CourseReviewRouter = Router();

// Public
CourseReviewRouter.get('/course/:courseId', getByCourse);

// Authenticated users
CourseReviewRouter.post('/course/:courseId', authenticate, create);
CourseReviewRouter.put('/:id', authenticate, update);
CourseReviewRouter.delete('/:id', authenticate, remove);

// Instructor reply cho course review
CourseReviewRouter.post('/:reviewId/reply', authenticate, createReply);

export default CourseReviewRouter;

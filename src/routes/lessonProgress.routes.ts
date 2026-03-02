import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { markComplete, unmarkComplete, getCourseProgress, getAllProgress } from '../controllers/lessonProgress.controller';

const ProgressRouter = Router();

// Tất cả đều cần auth
ProgressRouter.get('/', authenticate, getAllProgress);
ProgressRouter.get('/course/:courseId', authenticate, getCourseProgress);
ProgressRouter.post('/:lessonId/complete', authenticate, markComplete);
ProgressRouter.delete('/:lessonId/complete', authenticate, unmarkComplete);

export default ProgressRouter;

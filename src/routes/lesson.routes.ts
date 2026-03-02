import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadLessonVideo } from '../utils/upload';
import { getByCourse, getById, create, bulkCreate, update, remove, reorder } from '../controllers/lesson.controller';
import LessonDiscussionRouter from './lessonDiscussion.routes';
import QuizRouter from './quiz.routes';
const LessonRouter = Router();

// Public
LessonRouter.get('/course/:courseId', getByCourse);
LessonRouter.get('/:id', getById);

// Instructor only
// create / update: multer middleware xử lý file upload (field 'video'), nếu không có file thì req.file = undefined
LessonRouter.post('/course/:courseId', authenticate, authorize('instructor', 'admin'), uploadLessonVideo, create);
LessonRouter.post('/course/:courseId/bulk', authenticate, authorize('instructor', 'admin'), bulkCreate);  // bulk: JSON only, không upload file
LessonRouter.patch('/course/:courseId/reorder', authenticate, authorize('instructor', 'admin'), reorder);
LessonRouter.put('/:id', authenticate, authorize('instructor', 'admin'), uploadLessonVideo, update);
LessonRouter.delete('/:id', authenticate, authorize('instructor', 'admin'), remove);

// Thảo luận bài học (nested route)
LessonRouter.use('/:lessonId/discussions', LessonDiscussionRouter);

// Quiz bài học (nested route)
LessonRouter.use('/:lessonId/quiz', QuizRouter);

export default LessonRouter;

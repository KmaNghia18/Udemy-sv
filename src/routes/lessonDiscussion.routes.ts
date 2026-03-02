import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getByLesson, getCount, create, update, remove } from '../controllers/lessonDiscussion.controller';

const LessonDiscussionRouter = Router({ mergeParams: true });

// Public: xem thảo luận & đếm
LessonDiscussionRouter.get('/', getByLesson);
LessonDiscussionRouter.get('/count', getCount);

// Auth: tạo comment/reply
LessonDiscussionRouter.post('/', authenticate, create);

// Auth: sửa/xóa (route riêng, dùng discussion id)
LessonDiscussionRouter.put('/:id', authenticate, update);
LessonDiscussionRouter.delete('/:id', authenticate, remove);

export default LessonDiscussionRouter;

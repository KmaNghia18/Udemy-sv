import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getByLesson, create, update, remove } from '../controllers/lessonNote.controller';

const NoteRouter = Router();

// Tất cả đều cần đăng nhập (notes là cá nhân)
NoteRouter.get('/lesson/:lessonId', authenticate, getByLesson);
NoteRouter.post('/lesson/:lessonId', authenticate, create);
NoteRouter.put('/:id', authenticate, update);
NoteRouter.delete('/:id', authenticate, remove);

export default NoteRouter;

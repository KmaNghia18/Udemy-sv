import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadMaterialFile } from '../utils/upload';
import { getByLesson, upload, remove } from '../controllers/lessonMaterial.controller';

const MaterialRouter = Router();

// Public: danh sách tài liệu của lesson
MaterialRouter.get('/lesson/:lessonId', getByLesson);

// Instructor: upload & xóa tài liệu
MaterialRouter.post('/lesson/:lessonId', authenticate, authorize('instructor', 'admin'), uploadMaterialFile, upload);
MaterialRouter.delete('/:id', authenticate, authorize('instructor', 'admin'), remove);

export default MaterialRouter;

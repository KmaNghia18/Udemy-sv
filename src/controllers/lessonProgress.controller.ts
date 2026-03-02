import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { lessonProgressService } from '../services/lessonProgress.service';
import { AppError } from '../utils/AppError';

// POST /api/v1/progress/:lessonId/complete — đánh dấu hoàn thành
export const markComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const progress = await lessonProgressService.markComplete(req.user.id, req.params.lessonId);
    sendSuccess(res, progress, 'Lesson marked as completed', 201);
  } catch (error) { next(error); }
};

// DELETE /api/v1/progress/:lessonId/complete — bỏ đánh dấu
export const unmarkComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await lessonProgressService.unmarkComplete(req.user.id, req.params.lessonId);
    sendSuccess(res, null, 'Lesson unmarked');
  } catch (error) { next(error); }
};

// GET /api/v1/progress/course/:courseId — tiến độ khóa học
export const getCourseProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const result = await lessonProgressService.getCourseProgress(req.user.id, req.params.courseId);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// GET /api/v1/progress — tiến độ tất cả khóa học
export const getAllProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const result = await lessonProgressService.getAllProgress(req.user.id);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

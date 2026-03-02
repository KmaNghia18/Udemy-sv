import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { lessonDiscussionService } from '../services/lessonDiscussion.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/lessons/:lessonId/discussions — lấy thảo luận (dạng cây)
export const getByLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await lessonDiscussionService.getByLesson(req.params.lessonId);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// GET /api/v1/lessons/:lessonId/discussions/count — đếm
export const getCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await lessonDiscussionService.getCount(req.params.lessonId);
    sendSuccess(res, { count });
  } catch (error) { next(error); }
};

// POST /api/v1/lessons/:lessonId/discussions — tạo comment hoặc reply
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { content, parentId } = req.body;
    if (!content) throw new AppError('content is required', 400);
    const comment = await lessonDiscussionService.create({
      lessonId: req.params.lessonId,
      userId: req.user.id,
      parentId,
      content,
    });
    sendSuccess(res, comment, 'Comment created', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/lesson-discussions/:id — sửa comment
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { content } = req.body;
    if (!content) throw new AppError('content is required', 400);
    const comment = await lessonDiscussionService.update(req.params.id, req.user.id, content);
    sendSuccess(res, comment, 'Comment updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/lesson-discussions/:id — xóa comment
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await lessonDiscussionService.remove(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, null, 'Comment deleted');
  } catch (error) { next(error); }
};

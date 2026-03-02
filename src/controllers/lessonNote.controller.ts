import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { lessonNoteService } from '../services/lessonNote.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/notes/lesson/:lessonId — user: xem notes của mình cho bài học
export const getByLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const notes = await lessonNoteService.getByLesson(req.params.lessonId, req.user.id);
    sendSuccess(res, notes);
  } catch (error) { next(error); }
};

// POST /api/v1/notes/lesson/:lessonId — user: tạo note
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { content, timestamp } = req.body;
    if (!content) throw new AppError('content is required', 400);
    const note = await lessonNoteService.create(
      req.user.id,
      req.params.lessonId,
      content,
      timestamp !== undefined ? Number(timestamp) : undefined,
    );
    sendSuccess(res, note, 'Note created', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/notes/:id — user: cập nhật note
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { content } = req.body;
    if (!content) throw new AppError('content is required', 400);
    const note = await lessonNoteService.update(Number(req.params.id), req.user.id, content);
    sendSuccess(res, note, 'Note updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/notes/:id — user: xóa note
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await lessonNoteService.remove(Number(req.params.id), req.user.id);
    sendSuccess(res, null, 'Note deleted');
  } catch (error) { next(error); }
};

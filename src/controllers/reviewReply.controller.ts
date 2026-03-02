import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { reviewReplyService } from '../services/reviewReply.service';
import { AppError } from '../utils/AppError';
import { ReviewType } from '../models/ReviewReply';

// POST /api/v1/instructors/:instructorId/reviews/:reviewId/reply — instructor reply (instructor review)
export const createForInstructor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { comment } = req.body;
    if (!comment) throw new AppError('comment is required', 400);
    const reply = await reviewReplyService.create({
      reviewType: 'instructor',
      reviewId: req.params.reviewId,
      userId: req.user.id,
      comment,
    });
    sendSuccess(res, reply, 'Reply created', 201);
  } catch (error) { next(error); }
};

// POST /api/v1/course-reviews/:reviewId/reply — instructor reply (course review)
export const createForCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { comment } = req.body;
    if (!comment) throw new AppError('comment is required', 400);
    const reply = await reviewReplyService.create({
      reviewType: 'course',
      reviewId: req.params.reviewId,
      userId: req.user.id,
      comment,
    });
    sendSuccess(res, reply, 'Reply created', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/review-replies/:id — sửa reply
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { comment } = req.body;
    if (!comment) throw new AppError('comment is required', 400);
    const reply = await reviewReplyService.update(req.params.id, req.user.id, { comment });
    sendSuccess(res, reply, 'Reply updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/review-replies/:id — xóa reply
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await reviewReplyService.remove(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, null, 'Reply deleted');
  } catch (error) { next(error); }
};

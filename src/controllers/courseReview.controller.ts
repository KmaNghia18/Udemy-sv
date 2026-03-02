import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { courseReviewService } from '../services/courseReview.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/course-reviews/course/:courseId — public
export const getByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await courseReviewService.getByCourse(req.params.courseId);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// POST /api/v1/course-reviews/course/:courseId — user
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { rating, comment } = req.body;
    if (!rating) throw new AppError('rating is required', 400);
    const review = await courseReviewService.create({
      userId: req.user.id,
      courseId: req.params.courseId,
      rating: Number(rating),
      comment,
    });
    sendSuccess(res, review, 'Review created', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/course-reviews/:id — user (chỉ sửa review của mình)
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { rating, comment } = req.body;
    const review = await courseReviewService.update(req.params.id, req.user.id, {
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(comment !== undefined && { comment }),
    });
    sendSuccess(res, review, 'Review updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/course-reviews/:id — user hoặc admin
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await courseReviewService.remove(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, null, 'Review deleted');
  } catch (error) { next(error); }
};

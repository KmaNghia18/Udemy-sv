import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { instructorReviewService } from '../services/instructorReview.service';

// ─── GET /api/v1/instructors/:instructorId/reviews ────────────────────────────
export const getByInstructor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await instructorReviewService.getByInstructor(req.params.instructorId);
    sendSuccess(res, result, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/instructors/:instructorId/reviews ───────────────────────────
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const { rating, comment } = req.body;
    if (!rating) throw new AppError('Rating is required', 400);

    const review = await instructorReviewService.create({
      userId: req.user.id,
      instructorId: req.params.instructorId,
      rating: Number(rating),
      comment,
    });
    sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/instructors/reviews/:reviewId ────────────────────────────────
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const { rating, comment } = req.body;
    const review = await instructorReviewService.update(req.params.reviewId, req.user.id, {
      rating: rating !== undefined ? Number(rating) : undefined,
      comment,
    });
    sendSuccess(res, review, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/instructors/reviews/:reviewId ─────────────────────────────
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    await instructorReviewService.remove(req.params.reviewId, req.user.id, req.user.role);
    sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

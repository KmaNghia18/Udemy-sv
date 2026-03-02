import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import InstructorReview from '../models/InstructorReview';
import { Instructor } from '../models/Instructor';
import User from '../models/User';
import ReviewReply from '../models/ReviewReply';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreateReviewDTO {
  userId: string;
  instructorId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export class InstructorReviewService {

  // ── Lấy tất cả reviews của 1 instructor ─────────────────────────────────
  async getByInstructor(instructorId: string): Promise<{ reviews: InstructorReview[]; averageRating: number; total: number }> {
    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) throw new AppError('Instructor not found', 404);

    const reviews = await InstructorReview.findAll({
      where: { instructorId },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'avatarUrl'] },
        { model: ReviewReply, as: 'reply' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const total = reviews.length;
    const averageRating = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 100) / 100
      : 0;

    return { reviews, averageRating, total };
  }

  // ── Tạo review mới ───────────────────────────────────────────────────────
  async create(dto: CreateReviewDTO): Promise<InstructorReview> {
    // Kiểm tra instructor tồn tại + đã approved
    const instructor = await Instructor.findByPk(dto.instructorId);
    if (!instructor) throw new AppError('Instructor not found', 404);
    if (!instructor.approved) throw new AppError('Instructor is not approved yet', 400);

    // Không được tự review bản thân
    if (instructor.userId === dto.userId) {
      throw new AppError('You cannot review yourself', 400);
    }

    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Kiểm tra đã review chưa (unique constraint)
    const existing = await InstructorReview.findOne({
      where: { userId: dto.userId, instructorId: dto.instructorId },
    });
    if (existing) throw new AppError('You have already reviewed this instructor', 409);

    const review = await InstructorReview.create(dto);

    // Cập nhật average_rating trong bảng instructors
    await this.recalculateRating(dto.instructorId);

    return review;
  }

  // ── Cập nhật review ──────────────────────────────────────────────────────
  async update(reviewId: string, userId: string, dto: UpdateReviewDTO): Promise<InstructorReview> {
    const review = await InstructorReview.findByPk(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== userId) throw new AppError('You can only edit your own review', 403);

    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    await review.update(dto);
    await this.recalculateRating(review.instructorId);

    return review;
  }

  // ── Xóa review ───────────────────────────────────────────────────────────
  async remove(reviewId: string, userId: string, role: string): Promise<void> {
    const review = await InstructorReview.findByPk(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    // Admin có thể xóa bất kỳ review, user chỉ xóa của mình
    if (role !== 'admin' && review.userId !== userId) {
      throw new AppError('You can only delete your own review', 403);
    }

    const { instructorId } = review;
    await review.destroy();
    await this.recalculateRating(instructorId);
  }

  // ── Tính lại average rating sau mỗi thay đổi ────────────────────────────
  private async recalculateRating(instructorId: string): Promise<void> {
    const reviews = await InstructorReview.findAll({ where: { instructorId } });
    const total = reviews.length;
    const avg = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 100) / 100
      : 0;

    await Instructor.update({ averageRating: avg }, { where: { id: instructorId } });
  }
}

export const instructorReviewService = new InstructorReviewService();

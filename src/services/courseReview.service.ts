import { AppError } from '../utils/AppError';
import CourseReview from '../models/CourseReview';
import Course from '../models/Course';
import User from '../models/User';
import Order from '../models/Order';
import ReviewReply from '../models/ReviewReply';
import { notificationService } from './notification.service';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreateCourseReviewDTO {
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
}

export interface UpdateCourseReviewDTO {
  rating?: number;
  comment?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export class CourseReviewService {

  // ── Public: lấy tất cả reviews của 1 course ──────────────────────────────
  async getByCourse(courseId: string): Promise<{ reviews: CourseReview[]; averageRating: number; total: number }> {
    const course = await Course.findByPk(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const reviews = await CourseReview.findAll({
      where: { courseId },
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

  // ── User: tạo review ──────────────────────────────────────────────────────
  async create(dto: CreateCourseReviewDTO): Promise<CourseReview> {
    const course = await Course.findByPk(dto.courseId);
    if (!course) throw new AppError('Course not found', 404);

    // Kiểm tra user đã mua khóa học chưa (phải có order completed)
    const purchased = await Order.findOne({
      where: { userId: dto.userId, courseId: dto.courseId, status: 'completed' },
    });
    if (!purchased) throw new AppError('You must purchase this course before reviewing', 403);

    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Kiểm tra đã review chưa
    const existing = await CourseReview.findOne({
      where: { userId: dto.userId, courseId: dto.courseId },
    });
    if (existing) throw new AppError('You have already reviewed this course', 409);

    const review = await CourseReview.create(dto);
    await this.recalculateRating(dto.courseId);

    // Notification → Instructor + Admin
    notificationService.notifyCourseInstructor(dto.courseId, 'new_course_review', 'Đánh giá mới', `Có đánh giá ${dto.rating}⭐ mới cho khóa học của bạn`, { reviewId: review.id, courseId: dto.courseId, rating: dto.rating }).catch(() => {});
    notificationService.notifyAdmins('new_course_review', 'Review khóa học mới', `Đánh giá ${dto.rating}⭐ mới`, { reviewId: review.id, courseId: dto.courseId }).catch(() => {});

    return review;
  }

  // ── User: cập nhật review ─────────────────────────────────────────────────
  async update(reviewId: string, userId: string, dto: UpdateCourseReviewDTO): Promise<CourseReview> {
    const review = await CourseReview.findByPk(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== userId) throw new AppError('You can only edit your own review', 403);

    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    await review.update(dto);
    await this.recalculateRating(review.courseId);

    return review;
  }

  // ── User/Admin: xóa review ────────────────────────────────────────────────
  async remove(reviewId: string, userId: string, role: string): Promise<void> {
    const review = await CourseReview.findByPk(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    if (role !== 'admin' && review.userId !== userId) {
      throw new AppError('You can only delete your own review', 403);
    }

    const { courseId } = review;
    await review.destroy();
    await this.recalculateRating(courseId);
  }

  // ── Tính lại average rating + totalReviews cho course ───────────────────────
  private async recalculateRating(courseId: string): Promise<void> {
    const reviews = await CourseReview.findAll({ where: { courseId } });
    const total = reviews.length;
    const avg = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 100) / 100
      : 0;

    await Course.update({ averageRating: avg, totalReviews: total }, { where: { id: courseId } });
  }
}

export const courseReviewService = new CourseReviewService();

import { AppError } from '../utils/AppError';
import ReviewReply, { ReviewType } from '../models/ReviewReply';
import InstructorReview from '../models/InstructorReview';
import CourseReview from '../models/CourseReview';
import { Instructor } from '../models/Instructor';
import Course from '../models/Course';
import { notificationService } from './notification.service';

export interface CreateReplyDTO {
  reviewType: ReviewType;
  reviewId: string;
  userId: string;       // userId của instructor (để verify quyền)
  comment: string;
}

export interface UpdateReplyDTO {
  comment: string;
}

export class ReviewReplyService {

  // ── Instructor: tạo reply cho review ───────────────────────────────────────
  async create(dto: CreateReplyDTO): Promise<ReviewReply> {
    // Lấy instructor profile từ userId
    const instructor = await Instructor.findOne({ where: { userId: dto.userId } });
    if (!instructor) throw new AppError('You are not an instructor', 403);

    if (dto.reviewType === 'instructor') {
      // Review trên profile instructor
      const review = await InstructorReview.findByPk(dto.reviewId);
      if (!review) throw new AppError('Review not found', 404);
      if (review.instructorId !== instructor.id) {
        throw new AppError('You can only reply to reviews on your own profile', 403);
      }
    } else {
      // Review trên khóa học — kiểm tra instructor sở hữu course đó
      const review = await CourseReview.findByPk(dto.reviewId);
      if (!review) throw new AppError('Review not found', 404);
      const course = await Course.findByPk(review.courseId);
      if (!course || course.instructorId !== instructor.id) {
        throw new AppError('You can only reply to reviews on your own course', 403);
      }
    }

    // Kiểm tra đã reply chưa (1 review chỉ reply 1 lần)
    const existing = await ReviewReply.findOne({
      where: { reviewType: dto.reviewType, reviewId: dto.reviewId, instructorId: instructor.id },
    });
    if (existing) throw new AppError('You have already replied to this review', 409);

    const reply = await ReviewReply.create({
      reviewType: dto.reviewType,
      reviewId: dto.reviewId,
      instructorId: instructor.id,
      comment: dto.comment,
    });

    // Notification → user who wrote the review
    if (dto.reviewType === 'instructor') {
      const review = await InstructorReview.findByPk(dto.reviewId);
      if (review) {
        notificationService.create({ userId: review.userId, type: 'review_reply', title: 'Instructor đã phản hồi', message: 'Instructor đã trả lời đánh giá của bạn', data: { replyId: reply.id, reviewId: dto.reviewId } }).catch(() => {});
      }
    } else {
      const review = await CourseReview.findByPk(dto.reviewId);
      if (review) {
        notificationService.create({ userId: review.userId, type: 'review_reply', title: 'Instructor đã phản hồi', message: 'Instructor đã trả lời đánh giá khóa học của bạn', data: { replyId: reply.id, reviewId: dto.reviewId } }).catch(() => {});
      }
    }

    return reply;
  }

  // ── Instructor: sửa reply ──────────────────────────────────────────────────
  async update(replyId: string, userId: string, dto: UpdateReplyDTO): Promise<ReviewReply> {
    const reply = await ReviewReply.findByPk(replyId);
    if (!reply) throw new AppError('Reply not found', 404);

    const instructor = await Instructor.findOne({ where: { userId } });
    if (!instructor || reply.instructorId !== instructor.id) {
      throw new AppError('You can only edit your own reply', 403);
    }

    await reply.update({ comment: dto.comment });
    return reply;
  }

  // ── Instructor/Admin: xóa reply ───────────────────────────────────────────
  async remove(replyId: string, userId: string, role: string): Promise<void> {
    const reply = await ReviewReply.findByPk(replyId);
    if (!reply) throw new AppError('Reply not found', 404);

    if (role !== 'admin') {
      const instructor = await Instructor.findOne({ where: { userId } });
      if (!instructor || reply.instructorId !== instructor.id) {
        throw new AppError('You can only delete your own reply', 403);
      }
    }

    await reply.destroy();
  }
}

export const reviewReplyService = new ReviewReplyService();

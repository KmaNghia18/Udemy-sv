import { AppError } from '../utils/AppError';
import LessonDiscussion from '../models/LessonDiscussion';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import Order from '../models/Order';
import User from '../models/User';
import { Instructor } from '../models/Instructor';
import { notificationService } from './notification.service';

export interface CreateDiscussionDTO {
  lessonId: string;
  userId: string;
  parentId?: string;
  content: string;
}

export class LessonDiscussionService {

  // ── Kiểm tra quyền tham gia thảo luận (đã mua hoặc là instructor) ─────────
  private async checkAccess(userId: string, lessonId: string): Promise<void> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    const course = await Course.findByPk(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404);

    // Instructor của khóa học → luôn được quyền
    const instructor = await Instructor.findOne({ where: { userId } });
    if (instructor && course.instructorId === instructor.id) return;

    // User đã mua khóa học (order completed)
    const purchased = await Order.findOne({
      where: { userId, courseId: lesson.courseId, status: 'completed' },
    });
    if (!purchased) throw new AppError('You must purchase this course to join the discussion', 403);
  }

  // ── Tạo comment hoặc reply ─────────────────────────────────────────────────
  async create(dto: CreateDiscussionDTO): Promise<LessonDiscussion> {
    await this.checkAccess(dto.userId, dto.lessonId);

    // Nếu là reply → kiểm tra parent tồn tại và cùng lesson
    if (dto.parentId) {
      const parent = await LessonDiscussion.findByPk(dto.parentId);
      if (!parent) throw new AppError('Parent comment not found', 404);
      if (parent.lessonId !== dto.lessonId) {
        throw new AppError('Parent comment does not belong to this lesson', 400);
      }
    }

    const comment = await LessonDiscussion.create({
      lessonId: dto.lessonId,
      userId: dto.userId,
      parentId: dto.parentId ?? null,
      content: dto.content,
    });

    // Notifications
    const lesson = await Lesson.findByPk(dto.lessonId);
    if (lesson) {
      if (!dto.parentId) {
        // Comment gốc → notify instructor
        notificationService.notifyCourseInstructor(lesson.courseId, 'new_discussion', 'Câu hỏi mới', 'Có câu hỏi mới trong bài học của bạn', { lessonId: dto.lessonId, discussionId: comment.id }).catch(() => {});
      } else {
        // Reply → notify parent author
        const parent = await LessonDiscussion.findByPk(dto.parentId);
        if (parent && parent.userId !== dto.userId) {
          notificationService.create({ userId: parent.userId, type: 'discussion_reply', title: 'Có người trả lời', message: 'Có người trả lời bình luận của bạn', data: { lessonId: dto.lessonId, discussionId: comment.id } }).catch(() => {});
        }
      }
    }

    // Reload kèm author
    return LessonDiscussion.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] }],
    }) as Promise<LessonDiscussion>;
  }

  // ── Sửa comment (chỉ owner) ───────────────────────────────────────────────
  async update(commentId: string, userId: string, content: string): Promise<LessonDiscussion> {
    const comment = await LessonDiscussion.findByPk(commentId);
    if (!comment) throw new AppError('Comment not found', 404);
    if (comment.userId !== userId) throw new AppError('You can only edit your own comment', 403);

    await comment.update({ content });
    return comment;
  }

  // ── Xóa comment (owner hoặc instructor hoặc admin) ────────────────────────
  async remove(commentId: string, userId: string, role: string): Promise<void> {
    const comment = await LessonDiscussion.findByPk(commentId);
    if (!comment) throw new AppError('Comment not found', 404);

    if (role !== 'admin' && comment.userId !== userId) {
      // Kiểm tra instructor có phải chủ khóa học không
      const lesson = await Lesson.findByPk(comment.lessonId);
      if (lesson) {
        const course = await Course.findByPk(lesson.courseId);
        const instructor = await Instructor.findOne({ where: { userId } });
        if (!course || !instructor || course.instructorId !== instructor.id) {
          throw new AppError('You can only delete your own comment', 403);
        }
      }
    }

    // CASCADE sẽ tự xóa replies con
    await comment.destroy();
  }

  // ── Lấy thảo luận theo lesson (dạng cây) ──────────────────────────────────
  async getByLesson(lessonId: string): Promise<{ discussions: any[]; total: number }> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    // Lấy tất cả comments của lesson
    const allComments = await LessonDiscussion.findAll({
      where: { lessonId },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] }],
      order: [['createdAt', 'ASC']],
    });

    // Convert to plain objects (Sequelize toJSON() ignores manually-set properties)
    const plainComments = allComments.map(c => ({ ...c.toJSON(), replies: [] as any[] }));

    // Build tree: chỉ trả về root comments, mỗi root kèm replies lồng nhau
    const commentMap = new Map<string, any>();
    const roots: any[] = [];

    for (const c of plainComments) {
      commentMap.set(c.id, c);
    }

    for (const c of plainComments) {
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId)!.replies.push(c);
      } else {
        roots.push(c);
      }
    }

    return { discussions: roots, total: allComments.length };
  }

  // ── Đếm số comments trong lesson ──────────────────────────────────────────
  async getCount(lessonId: string): Promise<number> {
    return LessonDiscussion.count({ where: { lessonId } });
  }
}

export const lessonDiscussionService = new LessonDiscussionService();

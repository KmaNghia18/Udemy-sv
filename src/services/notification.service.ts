import Notification from '../models/Notification';
import User from '../models/User';
import { Instructor } from '../models/Instructor';
import Course from '../models/Course';
import { Op } from 'sequelize';

// ─── Notification Types ───────────────────────────────────────────────────────
export type NotificationType =
  | 'order_created'
  | 'order_completed'
  | 'order_cancelled'
  | 'order_refunded'
  | 'new_user'
  | 'new_course'
  | 'new_course_review'
  | 'new_instructor_review'
  | 'review_reply'
  | 'new_discussion'
  | 'discussion_reply'
  | 'quiz_completed'
  | 'new_promotion'
  | 'promotion_expiring'
  | 'coupon_expiring'
  | 'new_lesson'
  | 'course_milestone'
  | 'welcome';

interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class NotificationService {

  // ── Tạo 1 notification ─────────────────────────────────────────────────────
  async create(dto: CreateNotificationDTO): Promise<Notification> {
    return Notification.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data ?? null,
    });
  }

  // ── Tạo notification cho nhiều user cùng lúc ──────────────────────────────
  async createBulk(userIds: string[], type: NotificationType, title: string, message: string, data?: Record<string, any>): Promise<void> {
    const records = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      data: data ?? null,
    }));
    await Notification.bulkCreate(records);
  }

  // ── Gửi notification cho tất cả Admin ──────────────────────────────────────
  async notifyAdmins(type: NotificationType, title: string, message: string, data?: Record<string, any>): Promise<void> {
    const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
    if (admins.length === 0) return;
    await this.createBulk(admins.map(a => a.id), type, title, message, data);
  }

  // ── Gửi notification cho instructor sở hữu course ─────────────────────────
  async notifyCourseInstructor(courseId: string, type: NotificationType, title: string, message: string, data?: Record<string, any>): Promise<void> {
    const course = await Course.findByPk(courseId);
    if (!course || !course.instructorId) return;
    const instructor = await Instructor.findByPk(course.instructorId);
    if (!instructor) return;
    await this.create({ userId: instructor.userId, type, title, message, data });
  }

  // ── Lấy notifications của user ─────────────────────────────────────────────
  async getMyNotifications(userId: string, page = 1, limit = 20): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const offset = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      }),
      Notification.count({ where: { userId } }),
      Notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  // ── Đếm unread ─────────────────────────────────────────────────────────────
  async getUnreadCount(userId: string): Promise<number> {
    return Notification.count({ where: { userId, isRead: false } });
  }

  // ── Đánh dấu đã đọc 1 notification ────────────────────────────────────────
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.update({ isRead: true }, { where: { id: notificationId, userId } });
  }

  // ── Đánh dấu đã đọc tất cả ────────────────────────────────────────────────
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
  }

  // ── Xóa 1 notification ─────────────────────────────────────────────────────
  async remove(notificationId: string, userId: string): Promise<void> {
    await Notification.destroy({ where: { id: notificationId, userId } });
  }

  // ── Xóa tất cả đã đọc ─────────────────────────────────────────────────────
  async clearRead(userId: string): Promise<void> {
    await Notification.destroy({ where: { userId, isRead: true } });
  }
}

export const notificationService = new NotificationService();

import { AppError } from '../utils/AppError';
import Wishlist, { WishlistTargetType } from '../models/Wishlist';
import Course from '../models/Course';
import Lesson from '../models/Lesson';

export class WishlistService {

  // ── Toggle thích/bỏ thích ──────────────────────────────────────────────────
  async toggle(userId: string, targetType: WishlistTargetType, targetId: string): Promise<{ liked: boolean }> {
    // Kiểm tra target tồn tại
    if (targetType === 'course') {
      const course = await Course.findByPk(targetId);
      if (!course) throw new AppError('Course not found', 404);
    } else {
      const lesson = await Lesson.findByPk(targetId);
      if (!lesson) throw new AppError('Lesson not found', 404);
    }

    // Check đã thích chưa → toggle
    const existing = await Wishlist.findOne({ where: { userId, targetType, targetId } });

    if (existing) {
      await existing.destroy();
      return { liked: false };
    } else {
      await Wishlist.create({ userId, targetType, targetId });
      return { liked: true };
    }
  }

  // ── Kiểm tra đã thích chưa ────────────────────────────────────────────────
  async isLiked(userId: string, targetType: WishlistTargetType, targetId: string): Promise<boolean> {
    const item = await Wishlist.findOne({ where: { userId, targetType, targetId } });
    return !!item;
  }

  // ── Lấy danh sách yêu thích theo loại ─────────────────────────────────────
  async getMyWishlist(userId: string, targetType: WishlistTargetType): Promise<Wishlist[]> {
    const wishlists = await Wishlist.findAll({
      where: { userId, targetType },
      order: [['createdAt', 'DESC']],
    });

    // Eager load thông tin course hoặc lesson
    if (targetType === 'course') {
      const courseIds = wishlists.map(w => w.targetId);
      const { Instructor } = require('../models/Instructor');
      const User = require('../models/User').default;
      const courses = await Course.findAll({
        where: { id: courseIds },
        attributes: ['id', 'name', 'thumbnailUrl', 'price', 'averageRating', 'totalReviews', 'purchased'],
        include: [{
          model: Instructor,
          as: 'instructor',
          attributes: ['id'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
        }],
      });
      const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
      return wishlists.map(w => {
        (w as any).dataValues.course = courseMap[w.targetId] ?? null;
        return w;
      });
    } else {
      const lessonIds = wishlists.map(w => w.targetId);
      const lessons = await Lesson.findAll({
        where: { id: lessonIds },
        attributes: ['id', 'title', 'courseId', 'videoSection'],
        include: [{ model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] }],
      });
      const lessonMap = Object.fromEntries(lessons.map(l => [l.id, l]));
      return wishlists.map(w => {
        (w as any).dataValues.lesson = lessonMap[w.targetId] ?? null;
        return w;
      });
    }
  }

  // ── Đếm số lượt thích của 1 target ────────────────────────────────────────
  async getLikeCount(targetType: WishlistTargetType, targetId: string): Promise<number> {
    return Wishlist.count({ where: { targetType, targetId } });
  }

  // ── Batch check: trả về danh sách targetId mà user đã thích ───────────────
  async getLikedIds(userId: string, targetType: WishlistTargetType, targetIds: string[]): Promise<string[]> {
    const items = await Wishlist.findAll({
      where: { userId, targetType, targetId: targetIds },
      attributes: ['targetId'],
    });
    return items.map(i => i.targetId);
  }
}

export const wishlistService = new WishlistService();

import { AppError } from '../utils/AppError';
import LessonProgress from '../models/LessonProgress';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import Order from '../models/Order';

export class LessonProgressService {

  // ── Kiểm tra quyền: phải đã mua khóa học ──────────────────────────────────
  private async checkPurchased(userId: string, courseId: string): Promise<void> {
    const purchased = await Order.findOne({
      where: { userId, courseId, status: 'completed' },
    });
    if (!purchased) throw new AppError('You must purchase this course first', 403);
  }

  // ── Đánh dấu hoàn thành bài học ───────────────────────────────────────────
  async markComplete(userId: string, lessonId: string): Promise<LessonProgress> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    await this.checkPurchased(userId, lesson.courseId);

    // Upsert: nếu đã hoàn thành thì bỏ qua
    const [progress] = await LessonProgress.findOrCreate({
      where: { userId, lessonId },
      defaults: { userId, lessonId, courseId: lesson.courseId },
    });

    return progress;
  }

  // ── Bỏ đánh dấu hoàn thành ────────────────────────────────────────────────
  async unmarkComplete(userId: string, lessonId: string): Promise<void> {
    const deleted = await LessonProgress.destroy({ where: { userId, lessonId } });
    if (!deleted) throw new AppError('Progress not found', 404);
  }

  // ── Lấy tiến độ khóa học của user ──────────────────────────────────────────
  async getCourseProgress(userId: string, courseId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    completedLessonIds: string[];
  }> {
    const course = await Course.findByPk(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const [totalLessons, completedRecords] = await Promise.all([
      Lesson.count({ where: { courseId } }),
      LessonProgress.findAll({
        where: { userId, courseId },
        attributes: ['lessonId'],
      }),
    ]);

    const completedLessons = completedRecords.length;
    const completedLessonIds = completedRecords.map(r => r.lessonId);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, progressPercent, completedLessonIds };
  }

  // ── Lấy tiến độ tất cả khóa học của user ──────────────────────────────────
  async getAllProgress(userId: string): Promise<any[]> {
    // Lấy tất cả khóa học đã mua
    const orders = await Order.findAll({
      where: { userId, status: 'completed' },
      include: [{ model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] }],
    });

    const result = [];
    for (const order of orders) {
      const courseId = order.courseId;
      const totalLessons = await Lesson.count({ where: { courseId } });
      const completedLessons = await LessonProgress.count({ where: { userId, courseId } });
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      result.push({
        courseId,
        course: (order as any).course,
        totalLessons,
        completedLessons,
        progressPercent,
      });
    }

    return result;
  }
}

export const lessonProgressService = new LessonProgressService();

import { Op, fn, col, literal } from 'sequelize';
import User from '../models/User';
import { Instructor } from '../models/Instructor';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import Order from '../models/Order';
import CourseReview from '../models/CourseReview';
import InstructorReview from '../models/InstructorReview';
import QuizAttempt from '../models/QuizAttempt';
import LessonDiscussion from '../models/LessonDiscussion';
import { sequelize } from '../config/database';

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN STATS
// ═══════════════════════════════════════════════════════════════════════════════

export class StatsService {

  // ── Admin: tổng quan hệ thống ──────────────────────────────────────────────
  async getAdminOverview() {
    const [totalUsers, totalInstructors, totalCourses, totalLessons, totalOrders] = await Promise.all([
      User.count(),
      Instructor.count(),
      Course.count(),
      Lesson.count(),
      Order.count(),
    ]);

    // Tổng doanh thu (chỉ order completed)
    const revenueResult = await Order.findOne({
      where: { status: 'completed' },
      attributes: [[fn('COALESCE', fn('SUM', col('final_price')), 0), 'totalRevenue']],
      raw: true,
    }) as any;
    const totalRevenue = Number(revenueResult?.totalRevenue ?? 0);

    // Orders theo status
    const ordersByStatus = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // User mới trong 30 ngày
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersLast30Days = await User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } });

    // Orders trong 30 ngày
    const ordersLast30Days = await Order.count({
      where: { status: 'completed', createdAt: { [Op.gte]: thirtyDaysAgo } },
    });

    return {
      totalUsers,
      totalInstructors,
      totalCourses,
      totalLessons,
      totalOrders,
      totalRevenue,
      ordersByStatus,
      newUsersLast30Days,
      ordersLast30Days,
    };
  }

  // ── Admin: doanh thu theo tháng (12 tháng gần nhất) ────────────────────────
  async getAdminRevenueByMonth() {
    const result = await sequelize.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS totalOrders,
        COALESCE(SUM(final_price), 0) AS revenue
      FROM orders
      WHERE status = 'completed'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `, { type: 'SELECT' as any });

    return result;
  }

  // ── Admin: top khóa học bán chạy ──────────────────────────────────────────
  async getAdminTopCourses(limit = 10) {
    const result = await sequelize.query(`
      SELECT 
        c.id, c.name, c.thumbnail_url AS thumbnailUrl,
        COUNT(o.id) AS totalSold,
        COALESCE(SUM(o.final_price), 0) AS totalRevenue
      FROM courses c
      LEFT JOIN orders o ON o.course_id = c.id AND o.status = 'completed'
      GROUP BY c.id, c.name, c.thumbnail_url
      ORDER BY totalSold DESC
      LIMIT :limit
    `, { replacements: { limit }, type: 'SELECT' as any });

    return result;
  }

  // ── Admin: đơn hàng gần đây ───────────────────────────────────────────────
  async getAdminRecentOrders(limit = 10) {
    return Order.findAll({
      where: { status: 'completed' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  // ── Admin: user mới theo ngày (30 ngày) ────────────────────────────────────
  async getAdminNewUsersDaily() {
    const result = await sequelize.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, { type: 'SELECT' as any });

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INSTRUCTOR STATS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Instructor: tổng quan ──────────────────────────────────────────────────
  async getInstructorOverview(instructorId: string) {
    // Lấy tất cả course của instructor
    const courses = await Course.findAll({
      where: { instructorId },
      attributes: ['id'],
      raw: true,
    });
    const courseIds = courses.map(c => c.id);

    const totalCourses = courseIds.length;

    if (totalCourses === 0) {
      return {
        totalCourses: 0,
        totalLessons: 0,
        totalStudents: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageRating: 0,
        totalReviews: 0,
        totalDiscussions: 0,
      };
    }

    // Tổng lessons
    const totalLessons = await Lesson.count({ where: { courseId: { [Op.in]: courseIds } } });

    // Tổng học viên (orders completed, unique users)
    const studentResult = await Order.findOne({
      where: { courseId: { [Op.in]: courseIds }, status: 'completed' },
      attributes: [[fn('COUNT', fn('DISTINCT', col('user_id'))), 'count']],
      raw: true,
    }) as any;
    const totalStudents = Number(studentResult?.count ?? 0);

    // Tổng doanh thu
    const revenueResult = await Order.findOne({
      where: { courseId: { [Op.in]: courseIds }, status: 'completed' },
      attributes: [[fn('COALESCE', fn('SUM', col('final_price')), 0), 'total']],
      raw: true,
    }) as any;
    const totalRevenue = Number(revenueResult?.total ?? 0);

    // Tổng orders
    const totalOrders = await Order.count({
      where: { courseId: { [Op.in]: courseIds }, status: 'completed' },
    });

    // Average rating
    const ratingResult = await CourseReview.findOne({
      where: { courseId: { [Op.in]: courseIds } },
      attributes: [
        [fn('COALESCE', fn('AVG', col('rating')), 0), 'avg'],
        [fn('COUNT', col('id')), 'count'],
      ],
      raw: true,
    }) as any;
    const averageRating = Math.round(Number(ratingResult?.avg ?? 0) * 100) / 100;
    const totalReviews = Number(ratingResult?.count ?? 0);

    // Tổng discussions
    const lessonIds = (await Lesson.findAll({
      where: { courseId: { [Op.in]: courseIds } },
      attributes: ['id'],
      raw: true,
    })).map(l => l.id);

    const totalDiscussions = lessonIds.length > 0
      ? await LessonDiscussion.count({ where: { lessonId: { [Op.in]: lessonIds } } })
      : 0;

    return {
      totalCourses,
      totalLessons,
      totalStudents,
      totalRevenue,
      totalOrders,
      averageRating,
      totalReviews,
      totalDiscussions,
    };
  }

  // ── Instructor: doanh thu theo tháng ───────────────────────────────────────
  async getInstructorRevenueByMonth(instructorId: string) {
    const result = await sequelize.query(`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') AS month,
        COUNT(*) AS totalOrders,
        COALESCE(SUM(o.final_price), 0) AS revenue
      FROM orders o
      JOIN courses c ON c.id = o.course_id
      WHERE o.status = 'completed'
        AND c.instructor_id = :instructorId
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
      ORDER BY month ASC
    `, { replacements: { instructorId }, type: 'SELECT' as any });

    return result;
  }

  // ── Instructor: top khóa học của mình ──────────────────────────────────────
  async getInstructorTopCourses(instructorId: string) {
    const result = await sequelize.query(`
      SELECT 
        c.id, c.name, c.thumbnail_url AS thumbnailUrl,
        COUNT(o.id) AS totalSold,
        COALESCE(SUM(o.final_price), 0) AS totalRevenue,
        c.average_rating AS averageRating
      FROM courses c
      LEFT JOIN orders o ON o.course_id = c.id AND o.status = 'completed'
      WHERE c.instructor_id = :instructorId
      GROUP BY c.id, c.name, c.thumbnail_url, c.average_rating
      ORDER BY totalSold DESC
    `, { replacements: { instructorId }, type: 'SELECT' as any });

    return result;
  }

  // ── Instructor: đơn hàng gần đây ──────────────────────────────────────────
  async getInstructorRecentOrders(instructorId: string, limit = 10) {
    const courseIds = (await Course.findAll({
      where: { instructorId },
      attributes: ['id'],
      raw: true,
    })).map(c => c.id);

    if (courseIds.length === 0) return [];

    return Order.findAll({
      where: { courseId: { [Op.in]: courseIds }, status: 'completed' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  // ── Instructor: thống kê course cụ thể ────────────────────────────────────
  async getInstructorCourseStats(instructorId: string, courseId: string) {
    const course = await Course.findOne({ where: { id: courseId, instructorId } });
    if (!course) return null;

    const [totalLessons, totalStudents, totalRevenue, reviewStats, lessonIds] = await Promise.all([
      Lesson.count({ where: { courseId } }),
      Order.count({ where: { courseId, status: 'completed' } }),
      Order.findOne({
        where: { courseId, status: 'completed' },
        attributes: [[fn('COALESCE', fn('SUM', col('final_price')), 0), 'total']],
        raw: true,
      }).then((r: any) => Number(r?.total ?? 0)),
      CourseReview.findOne({
        where: { courseId },
        attributes: [
          [fn('COALESCE', fn('AVG', col('rating')), 0), 'avg'],
          [fn('COUNT', col('id')), 'count'],
        ],
        raw: true,
      }).then((r: any) => ({
        averageRating: Math.round(Number(r?.avg ?? 0) * 100) / 100,
        totalReviews: Number(r?.count ?? 0),
      })),
      Lesson.findAll({ where: { courseId }, attributes: ['id'], raw: true }).then(ls => ls.map(l => l.id)),
    ]);

    // Quiz stats
    const quizAttempts = lessonIds.length > 0
      ? await QuizAttempt.count({ where: { lessonId: { [Op.in]: lessonIds } } })
      : 0;

    // Discussion stats
    const totalDiscussions = lessonIds.length > 0
      ? await LessonDiscussion.count({ where: { lessonId: { [Op.in]: lessonIds } } })
      : 0;

    // Rating breakdown: 1★-5★
    const ratingBreakdown = await CourseReview.findAll({
      where: { courseId },
      attributes: ['rating', [fn('COUNT', col('id')), 'count']],
      group: ['rating'],
      raw: true,
    });

    return {
      course: { id: course.id, title: course.name },
      totalLessons,
      totalStudents,
      totalRevenue,
      ...reviewStats,
      ratingBreakdown,
      quizAttempts,
      totalDiscussions,
    };
  }
}

export const statsService = new StatsService();

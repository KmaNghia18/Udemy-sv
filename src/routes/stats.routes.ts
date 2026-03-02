import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAdminOverview,
  getAdminRevenueByMonth,
  getAdminTopCourses,
  getAdminRecentOrders,
  getAdminNewUsersDaily,
  getInstructorOverview,
  getInstructorRevenueByMonth,
  getInstructorTopCourses,
  getInstructorRecentOrders,
  getInstructorCourseStats,
} from '../controllers/stats.controller';

const StatsRouter = Router();

// ── Admin Stats ──────────────────────────────────────────────────────────────
StatsRouter.get('/admin/overview', authenticate, authorize('admin'), getAdminOverview);
StatsRouter.get('/admin/revenue-by-month', authenticate, authorize('admin'), getAdminRevenueByMonth);
StatsRouter.get('/admin/top-courses', authenticate, authorize('admin'), getAdminTopCourses);
StatsRouter.get('/admin/recent-orders', authenticate, authorize('admin'), getAdminRecentOrders);
StatsRouter.get('/admin/new-users-daily', authenticate, authorize('admin'), getAdminNewUsersDaily);

// ── Instructor Stats ─────────────────────────────────────────────────────────
StatsRouter.get('/instructor/overview', authenticate, authorize('instructor', 'admin'), getInstructorOverview);
StatsRouter.get('/instructor/revenue-by-month', authenticate, authorize('instructor', 'admin'), getInstructorRevenueByMonth);
StatsRouter.get('/instructor/top-courses', authenticate, authorize('instructor', 'admin'), getInstructorTopCourses);
StatsRouter.get('/instructor/recent-orders', authenticate, authorize('instructor', 'admin'), getInstructorRecentOrders);
StatsRouter.get('/instructor/course/:courseId', authenticate, authorize('instructor', 'admin'), getInstructorCourseStats);

export default StatsRouter;

import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { statsService } from '../services/stats.service';
import { AppError } from '../utils/AppError';
import { Instructor } from '../models/Instructor';

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const getAdminOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await statsService.getAdminOverview();
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getAdminRevenueByMonth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await statsService.getAdminRevenueByMonth();
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getAdminTopCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await statsService.getAdminTopCourses(limit);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getAdminRecentOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await statsService.getAdminRecentOrders(limit);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getAdminNewUsersDaily = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await statsService.getAdminNewUsersDaily();
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  INSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════

// Helper: lấy instructorId từ userId
const getInstructorId = async (userId: string): Promise<string> => {
  const instructor = await Instructor.findOne({ where: { userId } });
  if (!instructor) throw new AppError('You are not an instructor', 403);
  return instructor.id;
};

export const getInstructorOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructorId = await getInstructorId(req.user.id);
    const data = await statsService.getInstructorOverview(instructorId);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getInstructorRevenueByMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructorId = await getInstructorId(req.user.id);
    const data = await statsService.getInstructorRevenueByMonth(instructorId);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getInstructorTopCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructorId = await getInstructorId(req.user.id);
    const data = await statsService.getInstructorTopCourses(instructorId);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getInstructorRecentOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructorId = await getInstructorId(req.user.id);
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await statsService.getInstructorRecentOrders(instructorId, limit);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

export const getInstructorCourseStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructorId = await getInstructorId(req.user.id);
    const data = await statsService.getInstructorCourseStats(instructorId, req.params.courseId);
    if (!data) throw new AppError('Course not found or not yours', 404);
    sendSuccess(res, data);
  } catch (error) { next(error); }
};

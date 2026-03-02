import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { instructorService } from '../services/instructor.service';
import { orderService } from '../services/order.service';

// ─── GET /api/v1/instructors ──────────────────────────────────────────────────
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const instructors = await instructorService.getAll();
    sendSuccess(res, instructors, 'Instructors fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/instructors/admin/all — Admin: tất cả (cả chưa duyệt) ──────
export const getAllAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const instructors = await instructorService.getAllAdmin();
    sendSuccess(res, instructors, 'All instructors fetched');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/instructors/:id ─────────────────────────────────────────────
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const instructor = await instructorService.getById(req.params.id);
    sendSuccess(res, instructor, 'Instructor fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/instructors/me ───────────────────────────────────────────────
export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructor = await instructorService.getByUserId(req.user.id);
    sendSuccess(res, instructor, 'Instructor profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/instructors/register ───────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const { bio, experience } = req.body;
    const instructor = await instructorService.register({
      userId: req.user.id,
      bio,
      experience: experience ? Number(experience) : 0,
    });
    sendSuccess(res, instructor, 'Instructor registration submitted. Awaiting admin approval.', 201);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/instructors/me ───────────────────────────────────────────────
export const updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const { bio, experience } = req.body;
    const instructor = await instructorService.update(req.user.id, {
      bio,
      experience: experience !== undefined ? Number(experience) : undefined,
    });
    sendSuccess(res, instructor, 'Instructor profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/instructors/:id/approve  [Admin only] ─────────────────────
export const approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const instructor = await instructorService.approve(req.params.id);
    sendSuccess(res, instructor, 'Instructor approved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/instructors/:id  [Admin only] ────────────────────────────
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await instructorService.remove(req.params.id);
    sendSuccess(res, null, 'Instructor removed successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/instructors/me/students — xem danh sách học viên ─────────────
export const getMyStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const instructor = await instructorService.getByUserId(req.user.id);
    if (!instructor) throw new AppError('Instructor not found', 404);
    const students = await orderService.getMyStudents(instructor.id);
    sendSuccess(res, students);
  } catch (error) {
    next(error);
  }
};

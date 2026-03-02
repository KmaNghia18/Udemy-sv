import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { courseService } from '../services/course.service';
import { saveThumbnail, saveDemo, deleteOldFile } from '../utils/upload';

// ─── Helper: đọc files từ req.files (multer .fields()) ───────────────────────
const getUploadedFiles = (req: Request) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return {
    thumbnailFile: files?.['thumbnail']?.[0] ?? null,
    demoFile: files?.['demo']?.[0] ?? null,
  };
};

// ─── GET /api/v1/courses ──────────────────────────────────────────────────────
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level, categoryId, search, isFree, page, limit } = req.query;
    const result = await courseService.getAll({
      status: 'active' as import('../models/Course').CourseStatus,
      level: level as import('../models/Course').CourseLevel | undefined,
      categoryId: categoryId as string | undefined,
      search: search as string | undefined,
      isFree: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
    sendSuccess(res, result, 'Courses fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/admin (admin: xem tất cả status) ─────────────────────
export const getAllAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { level, categoryId, search, isFree, page, limit, status } = req.query;
    const result = await courseService.getAll({
      status: (status as import('../models/Course').CourseStatus) || undefined,
      level: level as import('../models/Course').CourseLevel | undefined,
      categoryId: categoryId as string | undefined,
      search: search as string | undefined,
      isFree: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
    sendSuccess(res, result, 'Courses fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/my ───────────────────────────────────────────────────
// Instructor: trả về khóa học do instructor tạo
export const getMyCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const courses = await courseService.getByInstructor(req.user.id);
    sendSuccess(res, courses, 'My courses fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/purchased ────────────────────────────────────────────
// Student: trả về khóa học đã mua
export const getPurchasedCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const Order = require('../models/Order').default;
    const Course = require('../models/Course').default;
    const { Instructor } = require('../models/Instructor');
    const User = require('../models/User').default;

    const orders = await Order.findAll({
      where: { userId: req.user.id, status: 'completed' },
      attributes: ['courseId'],
    });
    const courseIds = orders.map((o: any) => o.courseId);

    if (courseIds.length === 0) {
      sendSuccess(res, [], 'Purchased courses fetched successfully');
      return;
    }

    const courses = await Course.findAll({
      where: { id: courseIds },
      include: [{
        model: Instructor,
        as: 'instructor',
        attributes: ['id'],
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
      }],
    });

    sendSuccess(res, courses, 'Purchased courses fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/courses/:id ──────────────────────────────────────────────────
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.getById(req.params.id);
    sendSuccess(res, course, 'Course fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/courses ─────────────────────────────────────────────────────
// multipart/form-data: name, description, price, categoryIds[], tags[], level,
//   estimatedPrice, isFree + file fields: thumbnail (image), demo (video)
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { thumbnailFile, demoFile } = getUploadedFiles(req);
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const { name, description, priceTierId, categoryIds, tags, level, estimatedPrice, thumbnailUrl, demoUrl, benefits, prerequisites } = req.body;

    if (!name || !description || priceTierId === undefined) {
      throw new AppError('name, description, and priceTierId are required', 400);
    }

    const toArray = (v: unknown) => v ? (Array.isArray(v) ? v : [v]) : undefined;

    // Tạo course trước để có id
    const course = await courseService.create({
      instructorId: req.user.id,
      name,
      description,
      priceTierId: Number(priceTierId),
      thumbnailUrl: thumbnailUrl ?? undefined,
      demoUrl: demoUrl ?? undefined,
      categoryIds: toArray(categoryIds),
      tags: toArray(tags),
      level,
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
      benefits: toArray(benefits),
      prerequisites: toArray(prerequisites),
    });

    // Upload files sau khi có courseId
    const updates: { thumbnailUrl?: string; demoUrl?: string } = {};
    if (thumbnailFile) updates.thumbnailUrl = await saveThumbnail(course.id, thumbnailFile);
    if (demoFile)      updates.demoUrl      = saveDemo(course.id, demoFile);

    if (Object.keys(updates).length > 0) {
      await courseService.updateFiles(course.id, updates);
      Object.assign(course, updates);
    }

    sendSuccess(res, course, 'Course created successfully', 201);
  } catch (error) {
    // Cleanup: nếu lỗi sau khi đã upload file tạm → xóa file tạm
    if (thumbnailFile) deleteOldFile(thumbnailFile.path);
    if (demoFile)      deleteOldFile(demoFile.path);
    next(error);
  }
};

// ─── PUT /api/v1/courses/:id ──────────────────────────────────────────────────
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { thumbnailFile, demoFile } = getUploadedFiles(req);
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);

    const { name, description, priceTierId, categoryIds, tags, level, estimatedPrice, demoUrl, benefits, prerequisites } = req.body;
    const toArray = (v: unknown) => v ? (Array.isArray(v) ? v : [v]) : undefined;

    // Lấy course hiện tại để biết thumbnail/demo cũ
    const existing = await courseService.getById(req.params.id);

    // Tính URL cuối cùng sau upload
    let finalThumbnailUrl: string | undefined;
    let finalDemoUrl: string | undefined;

    if (thumbnailFile) {
      finalThumbnailUrl = await saveThumbnail(req.params.id, thumbnailFile);
      // Xóa AFTER save thành công (tránh mất file nếu save lỗi)
      if (existing.thumbnailUrl !== finalThumbnailUrl) deleteOldFile(existing.thumbnailUrl);
    }

    if (demoFile) {
      finalDemoUrl = saveDemo(req.params.id, demoFile);
      // Xóa AFTER move thành công
      // (saveDemo đã rename/copy rồi, file cũ cùng ext sẽ bị ghi đè, khác ext thì xóa thủ công)
      const oldExt = existing.demoUrl ? path.extname(existing.demoUrl).toLowerCase() : '';
      const newExt = path.extname(demoFile.originalname).toLowerCase();
      if (existing.demoUrl?.startsWith('/assets/') && oldExt !== newExt) {
        deleteOldFile(existing.demoUrl); // chỉ xóa nếu khác extension (khác ext = không tự ghi đè)
      }
    } else if (demoUrl !== undefined) {
      // Không upload file nhưng gửi URL string (YouTube, Vimeo, v.v.)
      if (existing.demoUrl?.startsWith('/assets/')) deleteOldFile(existing.demoUrl);
      finalDemoUrl = demoUrl;
    }

    const course = await courseService.update(req.params.id, req.user.id, {
      name,
      description,
      priceTierId: priceTierId !== undefined ? Number(priceTierId) : undefined,
      categoryIds: toArray(categoryIds),
      tags: toArray(tags),
      level,
      estimatedPrice: estimatedPrice !== undefined ? Number(estimatedPrice) : undefined,
      thumbnailUrl: finalThumbnailUrl,
      demoUrl: finalDemoUrl,
      benefits: toArray(benefits),
      prerequisites: toArray(prerequisites),
    });

    sendSuccess(res, course, 'Course updated successfully');
  } catch (error) {
    if (thumbnailFile) deleteOldFile(thumbnailFile.path);
    if (demoFile)      deleteOldFile(demoFile.path);
    next(error);
  }
};

// ─── PATCH /api/v1/courses/:id/submit ────────────────────────────────────────
export const submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const course = await courseService.submit(req.params.id, req.user.id);
    sendSuccess(res, course, 'Course submitted for review');
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/courses/:id/approve  [Admin] ───────────────────────────────
export const approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.approve(req.params.id);
    sendSuccess(res, course, 'Course approved successfully');
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/courses/:id/reject  [Admin] ────────────────────────────────
export const reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.reject(req.params.id);
    sendSuccess(res, course, 'Course rejected');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/courses/:id ───────────────────────────────────────────────
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    // Lấy course trước để xóa file vật lý
    const course = await courseService.getById(req.params.id);
    deleteOldFile(course.thumbnailUrl);
    deleteOldFile(course.demoUrl && course.demoUrl.startsWith('/assets/') ? course.demoUrl : null);
    await courseService.remove(req.params.id, req.user.id, req.user.role);
    sendSuccess(res, null, 'Course deleted successfully');
  } catch (error) {
    next(error);
  }
};

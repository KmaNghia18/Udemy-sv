import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { sendSuccess } from '../utils/response';
import { lessonService } from '../services/lesson.service';
import { AppError } from '../utils/AppError';
import { getUploadedVideo, saveLessonVideo, deleteOldFile } from '../utils/upload';

// GET /api/v1/lessons/course/:courseId — public: danh sách bài học
export const getByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lessons = await lessonService.getByCourse(req.params.courseId);
    sendSuccess(res, lessons);
  } catch (error) { next(error); }
};

// GET /api/v1/lessons/:id — public / enrolled: chi tiết bài học
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lesson = await lessonService.getById(req.params.id);
    sendSuccess(res, lesson);
  } catch (error) { next(error); }
};

// POST /api/v1/lessons/course/:courseId — instructor: tạo bài học
// multipart/form-data: title, description, videoSection, videoLength, isFreePreview, orderIndex + file field: video
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoFile = getUploadedVideo(req);
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { title, description, videoUrl, videoSection, videoLength, isFreePreview, orderIndex } = req.body;
    if (!title) throw new AppError('title is required', 400);

    // Tạo lesson trước để có id
    const lesson = await lessonService.create(req.params.courseId, req.user.id, {
      title, description,
      videoUrl: videoUrl ?? undefined,
      videoSection,
      videoLength: videoLength ? Number(videoLength) : undefined,
      isFreePreview: isFreePreview === true || isFreePreview === 'true',
      orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined,
    });

    // Upload video nếu có file
    if (videoFile) {
      const url = saveLessonVideo(lesson.courseId, lesson.id, videoFile);
      await lessonService.updateVideoUrl(lesson.id, url);
      lesson.videoUrl = url;
    }

    sendSuccess(res, lesson, 'Lesson created', 201);
  } catch (error) {
    // Cleanup file tạm nếu lỗi
    if (videoFile) {
      const fs = require('fs');
      if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
    }
    next(error);
  }
};

// POST /api/v1/lessons/course/:courseId/bulk — instructor: tạo nhiều bài học
export const bulkCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { lessons } = req.body;
    if (!Array.isArray(lessons) || lessons.length === 0) {
      throw new AppError('lessons must be a non-empty array', 400);
    }
    for (const l of lessons) {
      if (!l.title) throw new AppError('Each lesson must have a title', 400);
    }
    const created = await lessonService.bulkCreate(req.params.courseId, req.user.id, lessons);
    sendSuccess(res, created, `${created.length} lessons created`, 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/lessons/:id — instructor: cập nhật (hỗ trợ upload video mới)
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoFile = getUploadedVideo(req);
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { videoLength, isFreePreview, orderIndex, videoUrl, ...rest } = req.body;

    // Lấy lesson hiện tại để biết courseId + videoUrl cũ
    const existing = await lessonService.getById(req.params.id);

    let finalVideoUrl: string | undefined;

    if (videoFile) {
      // Upload file mới
      finalVideoUrl = saveLessonVideo(existing.courseId, existing.id, videoFile);
      // Xóa file cũ nếu khác extension
      const oldExt = existing.videoUrl ? path.extname(existing.videoUrl).toLowerCase() : '';
      const newExt = path.extname(videoFile.originalname).toLowerCase();
      if (existing.videoUrl?.startsWith('/assets/') && oldExt !== newExt) {
        deleteOldFile(existing.videoUrl);
      }
    } else if (videoUrl !== undefined) {
      // Set videoUrl thủ công (YouTube link, etc.)
      if (existing.videoUrl?.startsWith('/assets/')) deleteOldFile(existing.videoUrl);
      finalVideoUrl = videoUrl;
    }

    const lesson = await lessonService.update(req.params.id, req.user.id, {
      ...rest,
      ...(finalVideoUrl !== undefined && { videoUrl: finalVideoUrl }),
      ...(videoLength !== undefined && { videoLength: Number(videoLength) }),
      ...(isFreePreview !== undefined && { isFreePreview: isFreePreview === true || isFreePreview === 'true' }),
      ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
    });
    sendSuccess(res, lesson, 'Lesson updated');
  } catch (error) {
    if (videoFile) {
      const fs = require('fs');
      if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
    }
    next(error);
  }
};

// DELETE /api/v1/lessons/:id — instructor: xóa (kèm xóa file video)
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const lesson = await lessonService.getById(req.params.id);
    if (lesson.videoUrl?.startsWith('/assets/')) deleteOldFile(lesson.videoUrl);
    await lessonService.remove(req.params.id, req.user.id);
    sendSuccess(res, null, 'Lesson deleted');
  } catch (error) { next(error); }
};

// PATCH /api/v1/lessons/course/:courseId/reorder — instructor: sắp xếp lại
export const reorder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { lessonIds } = req.body;
    if (!Array.isArray(lessonIds)) throw new AppError('lessonIds must be an array', 400);
    await lessonService.reorder(req.params.courseId, req.user.id, lessonIds);
    sendSuccess(res, null, 'Lessons reordered');
  } catch (error) { next(error); }
};

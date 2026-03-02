import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { sendSuccess } from '../utils/response';
import { lessonMaterialService } from '../services/lessonMaterial.service';
import { lessonService } from '../services/lesson.service';
import { AppError } from '../utils/AppError';
import { saveLessonMaterial, deleteOldFile } from '../utils/upload';

// GET /api/v1/materials/lesson/:lessonId — public: danh sách tài liệu
export const getByLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const materials = await lessonMaterialService.getByLesson(req.params.lessonId);
    sendSuccess(res, materials);
  } catch (error) { next(error); }
};

// POST /api/v1/materials/lesson/:lessonId — instructor: upload tài liệu (nhiều file)
// multipart/form-data: titles[] (tùy chọn) + materials[] (files)
export const upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const files = req.files as Express.Multer.File[] | undefined;
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    if (!files || files.length === 0) throw new AppError('At least one material file is required', 400);

    // titles có thể là array hoặc string (1 file)
    const rawTitles = req.body.titles;
    const titles: string[] = rawTitles
      ? (Array.isArray(rawTitles) ? rawTitles : [rawTitles])
      : [];

    // Lấy courseId từ lesson
    const lesson = await lessonService.getById(req.params.lessonId);

    const created = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileUrl = saveLessonMaterial(lesson.courseId, lesson.id, file);
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

      const material = await lessonMaterialService.create(req.params.lessonId, req.user.id, {
        title: titles[i] || file.originalname,
        fileUrl,
        fileType: ext,
        fileSize: file.size,
      });
      created.push(material);
    }

    sendSuccess(res, created, `${created.length} material(s) uploaded`, 201);
  } catch (error) {
    // Cleanup file tạm nếu lỗi
    if (files) {
      for (const f of files) {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      }
    }
    next(error);
  }
};

// DELETE /api/v1/materials/:id — instructor: xóa tài liệu + file
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const material = await lessonMaterialService.remove(Number(req.params.id), req.user.id);
    if (material.fileUrl?.startsWith('/assets/')) deleteOldFile(material.fileUrl);
    sendSuccess(res, null, 'Material deleted');
  } catch (error) { next(error); }
};

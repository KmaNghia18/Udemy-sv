import path from 'path';
import { AppError } from '../utils/AppError';
import LessonMaterial from '../models/LessonMaterial';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import { Instructor } from '../models/Instructor';

export class LessonMaterialService {

  // Kiểm tra ownership: instructor → course → lesson
  private async checkLessonOwnership(lessonId: string, instructorUserId: string): Promise<Lesson> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    const instructor = await Instructor.findOne({ where: { userId: instructorUserId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);

    const course = await Course.findOne({ where: { id: lesson.courseId, instructorId: instructor.id } });
    if (!course) throw new AppError('You do not own this lesson', 403);

    return lesson;
  }

  // ── Public: lấy danh sách tài liệu theo lesson ───────────────────────────
  async getByLesson(lessonId: string): Promise<LessonMaterial[]> {
    return LessonMaterial.findAll({
      where: { lessonId },
      attributes: ['id', 'title', 'fileUrl', 'fileType', 'fileSize'],
      order: [['id', 'ASC']],
    });
  }

  // ── Instructor: thêm tài liệu (sau khi file đã upload) ──────────────────
  async create(lessonId: string, instructorUserId: string, data: {
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize: number | null;
  }): Promise<LessonMaterial> {
    await this.checkLessonOwnership(lessonId, instructorUserId);

    return LessonMaterial.create({
      lessonId,
      title: data.title,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
    });
  }

  // ── Instructor: xóa tài liệu ─────────────────────────────────────────────
  async remove(materialId: number, instructorUserId: string): Promise<LessonMaterial> {
    const material = await LessonMaterial.findByPk(materialId);
    if (!material) throw new AppError('Material not found', 404);

    await this.checkLessonOwnership(material.lessonId, instructorUserId);
    await material.destroy();
    return material; // trả về để controller xóa file
  }
}

export const lessonMaterialService = new LessonMaterialService();

import { AppError } from '../utils/AppError';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import { Instructor } from '../models/Instructor';

export interface CreateLessonDTO {
  title: string;
  description?: string;
  videoUrl?: string;
  videoSection?: string;
  videoLength?: number;
  isFreePreview?: boolean;
  orderIndex?: number;
}

export type UpdateLessonDTO = Partial<CreateLessonDTO>;

export class LessonService {

  // Kiểm tra instructor có sở hữu course không
  private async checkCourseOwnership(courseId: string, instructorUserId: string): Promise<void> {
    const instructor = await Instructor.findOne({ where: { userId: instructorUserId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);

    const course = await Course.findOne({ where: { id: courseId, instructorId: instructor.id } });
    if (!course) throw new AppError('Course not found or you do not own this course', 404);
  }

  // Kiểm tra instructor có sở hữu lesson không
  private async checkLessonOwnership(lessonId: string, instructorUserId: string): Promise<Lesson> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    const instructor = await Instructor.findOne({ where: { userId: instructorUserId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);

    const course = await Course.findOne({ where: { id: lesson.courseId, instructorId: instructor.id } });
    if (!course) throw new AppError('You do not own this lesson', 403);

    return lesson;
  }

  // ── Public: lấy danh sách bài học theo course ─────────────────────────────
  async getByCourse(courseId: string): Promise<Lesson[]> {
    const course = await Course.findByPk(courseId);
    if (!course) throw new AppError('Course not found', 404);

    return Lesson.findAll({
      where: { courseId },
      order: [['orderIndex', 'ASC']],
      attributes: ['id', 'courseId', 'title', 'description', 'videoUrl', 'videoSection', 'videoLength', 'isFreePreview', 'orderIndex'],
    });
  }

  // ── Public / Enrolled: lấy chi tiết 1 bài học ────────────────────────────
  async getById(id: string): Promise<Lesson> {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) throw new AppError('Lesson not found', 404);
    return lesson;
  }

  // ── Instructor: tạo bài học ───────────────────────────────────────────────
  async create(courseId: string, instructorUserId: string, dto: CreateLessonDTO): Promise<Lesson> {
    await this.checkCourseOwnership(courseId, instructorUserId);

    // Tự động set orderIndex = số lượng bài hiện có
    const count = await Lesson.count({ where: { courseId } });

    return Lesson.create({
      courseId,
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      videoSection: dto.videoSection,
      videoLength: dto.videoLength,
      isFreePreview: dto.isFreePreview ?? false,
      orderIndex: dto.orderIndex ?? count,
    });
  }

  // ── Cập nhật videoUrl sau khi upload file ─────────────────────────────────
  async updateVideoUrl(lessonId: string, videoUrl: string): Promise<void> {
    await Lesson.update({ videoUrl }, { where: { id: lessonId } });
  }

  // ── Instructor: tạo nhiều bài học cùng lúc ────────────────────────────────
  async bulkCreate(courseId: string, instructorUserId: string, lessons: CreateLessonDTO[]): Promise<Lesson[]> {
    await this.checkCourseOwnership(courseId, instructorUserId);

    if (!lessons.length) throw new AppError('lessons array must not be empty', 400);

    const existingCount = await Lesson.count({ where: { courseId } });

    const data = lessons.map((dto, index) => ({
      courseId,
      title: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      videoSection: dto.videoSection,
      videoLength: dto.videoLength,
      isFreePreview: dto.isFreePreview ?? false,
      orderIndex: dto.orderIndex ?? existingCount + index,
    }));

    return Lesson.bulkCreate(data);
  }

  // ── Instructor: cập nhật bài học ─────────────────────────────────────────
  async update(id: string, instructorUserId: string, dto: UpdateLessonDTO): Promise<Lesson> {
    const lesson = await this.checkLessonOwnership(id, instructorUserId);

    await lesson.update({
      ...(dto.title && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
      ...(dto.videoSection !== undefined && { videoSection: dto.videoSection }),
      ...(dto.videoLength !== undefined && { videoLength: dto.videoLength }),
      ...(dto.isFreePreview !== undefined && { isFreePreview: dto.isFreePreview }),
      ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
    });

    return lesson;
  }

  // ── Instructor: xóa bài học ───────────────────────────────────────────────
  async remove(id: string, instructorUserId: string): Promise<void> {
    const lesson = await this.checkLessonOwnership(id, instructorUserId);
    await lesson.destroy();
  }

  // ── Instructor: sắp xếp lại thứ tự bài học ───────────────────────────────
  // dto.lessonIds: mảng lesson ID theo thứ tự mới
  async reorder(courseId: string, instructorUserId: string, lessonIds: string[]): Promise<void> {
    await this.checkCourseOwnership(courseId, instructorUserId);

    const updates = lessonIds.map((id, index) =>
      Lesson.update({ orderIndex: index }, { where: { id, courseId } })
    );
    await Promise.all(updates);
  }
}

export const lessonService = new LessonService();

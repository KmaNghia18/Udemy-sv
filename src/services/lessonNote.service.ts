import { AppError } from '../utils/AppError';
import LessonNote from '../models/LessonNote';

export class LessonNoteService {

  // ── User: lấy notes của mình cho 1 lesson ─────────────────────────────────
  async getByLesson(lessonId: string, userId: string): Promise<LessonNote[]> {
    return LessonNote.findAll({
      where: { lessonId, userId },
      order: [['timestamp', 'ASC'], ['createdAt', 'ASC']],
    });
  }

  // ── User: lấy tất cả notes của mình cho 1 course ─────────────────────────
  async getByCourse(lessonIds: string[], userId: string): Promise<LessonNote[]> {
    if (!lessonIds.length) return [];
    return LessonNote.findAll({
      where: { lessonId: lessonIds, userId },
      order: [['lessonId', 'ASC'], ['timestamp', 'ASC']],
    });
  }

  // ── User: tạo note ────────────────────────────────────────────────────────
  async create(userId: string, lessonId: string, content: string, timestamp?: number): Promise<LessonNote> {
    if (!content.trim()) throw new AppError('Note content is required', 400);
    return LessonNote.create({
      userId,
      lessonId,
      content: content.trim(),
      timestamp: timestamp ?? null,
    });
  }

  // ── User: cập nhật note (chỉ owner) ───────────────────────────────────────
  async update(noteId: number, userId: string, content: string): Promise<LessonNote> {
    const note = await LessonNote.findOne({ where: { id: noteId, userId } });
    if (!note) throw new AppError('Note not found', 404);

    await note.update({ content: content.trim() });
    return note;
  }

  // ── User: xóa note (chỉ owner) ────────────────────────────────────────────
  async remove(noteId: number, userId: string): Promise<void> {
    const note = await LessonNote.findOne({ where: { id: noteId, userId } });
    if (!note) throw new AppError('Note not found', 404);
    await note.destroy();
  }
}

export const lessonNoteService = new LessonNoteService();

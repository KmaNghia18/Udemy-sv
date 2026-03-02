import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError';
import Certificate from '../models/Certificate';
import Course from '../models/Course';
import User from '../models/User';
import Lesson from '../models/Lesson';
import LessonProgress from '../models/LessonProgress';
import { Instructor } from '../models/Instructor';
import { sendMailCertificate } from '../utils/sendMail';

export class CertificateService {

  // ── Tạo mã chứng chỉ duy nhất ─────────────────────────────────────────────
  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'CERT';
    let code = prefix + '-';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  // ── Cấp chứng chỉ khi hoàn thành 100% khóa học ───────────────────────────
  async issue(userId: string, courseId: string): Promise<Certificate> {
    // 1. Kiểm tra khóa học tồn tại
    const course = await Course.findByPk(courseId, {
      include: [{ model: Instructor, as: 'instructor', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    });
    if (!course) throw new AppError('Course not found', 404);

    // 2. Kiểm tra user tồn tại
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    // 3. Kiểm tra đã hoàn thành 100%
    const totalLessons = await Lesson.count({ where: { courseId } });
    const completedLessons = await LessonProgress.count({ where: { userId, courseId } });
    if (totalLessons === 0 || completedLessons < totalLessons) {
      throw new AppError(`You must complete all lessons first (${completedLessons}/${totalLessons})`, 400);
    }

    // 4. Kiểm tra đã cấp chưa
    const existing = await Certificate.findOne({ where: { userId, courseId } });
    if (existing) throw new AppError('Certificate already issued', 409);

    // 5. Lấy tên instructor
    const instructor = course.get('instructor') as any;
    const mentorName = instructor?.user?.name || 'Giảng viên';

    // 6. Tạo certificate
    const certificate = await Certificate.create({
      userId,
      courseId,
      certificateCode: this.generateCode(),
      userNameAtIssue: user.name,
      courseNameAtIssue: course.name,
      mentorNameAtIssue: mentorName,
    });

    // 7. Gửi email certificate (async, không block response)
    this.sendCertificateEmail(user.email, user.name, course.name, certificate.issueDate)
      .catch(err => console.error('Failed to send certificate email:', err));

    return certificate;
  }

  // ── Gửi email chứng chỉ ───────────────────────────────────────────────────
  private async sendCertificateEmail(email: string, name: string, course: string, date: Date): Promise<void> {
    await sendMailCertificate({
      email,
      subject: `🎓 Chứng chỉ hoàn thành khóa học: ${course}`,
      template: 'send-certification.ejs',
      data: { name, course, date: new Date(date).toLocaleDateString('vi-VN') },
    });
  }

  // ── Lấy chứng chỉ của user cho 1 khóa ────────────────────────────────────
  async getByUserAndCourse(userId: string, courseId: string): Promise<Certificate | null> {
    return Certificate.findOne({ where: { userId, courseId } });
  }

  // ── Lấy tất cả chứng chỉ của user ────────────────────────────────────────
  async getMyAll(userId: string): Promise<Certificate[]> {
    return Certificate.findAll({
      where: { userId },
      include: [{ model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] }],
      order: [['issueDate', 'DESC']],
    });
  }

  // ── Xác minh chứng chỉ (public) ──────────────────────────────────────────
  async verify(code: string): Promise<Certificate | null> {
    return Certificate.findOne({
      where: { certificateCode: code },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] },
        { model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] },
      ],
    });
  }
}

export const certificateService = new CertificateService();

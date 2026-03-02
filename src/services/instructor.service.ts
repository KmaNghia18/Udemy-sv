import { AppError } from '../utils/AppError';
import { Instructor, InstructorAttributes } from '../models/Instructor';
import User from '../models/User';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreateInstructorDTO {
  userId: string;
  bio?: string;
  experience?: number;
}

export interface UpdateInstructorDTO {
  bio?: string;
  experience?: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export class InstructorService {

  // ── Lấy tất cả instructors (đã approved) — public ──────────────────────
  async getAll(): Promise<Instructor[]> {
    return Instructor.findAll({
      where: { approved: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
      order: [['averageRating', 'DESC']],
    });
  }

  // ── Admin: lấy tất cả instructors (cả chưa duyệt) ────────────────────
  async getAllAdmin(): Promise<Instructor[]> {
    return Instructor.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
      order: [['approved', 'ASC'], ['createdAt', 'DESC']],  // Chưa duyệt lên trước
    });
  }

  // ── Lấy 1 instructor theo id ────────────────────────────────────────────
  async getById(id: string): Promise<Instructor> {
    const instructor = await Instructor.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
    });
    if (!instructor) throw new AppError('Instructor not found', 404);
    return instructor;
  }

  // ── Lấy instructor theo userId ──────────────────────────────────────────
  async getByUserId(userId: string): Promise<Instructor> {
    const instructor = await Instructor.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
    });
    if (!instructor) throw new AppError('Instructor profile not found', 404);
    return instructor;
  }

  // ── Đăng ký làm instructor ──────────────────────────────────────────────
  async register(dto: CreateInstructorDTO): Promise<Instructor> {
    // Kiểm tra user tồn tại
    const user = await User.findByPk(dto.userId);
    if (!user) throw new AppError('User not found', 404);

    // Kiểm tra đã đăng ký chưa
    const existing = await Instructor.findOne({ where: { userId: dto.userId } });
    if (existing) throw new AppError('You have already registered as an instructor', 409);

    // Tạo instructor profile (approved: false → chờ admin duyệt)
    // Role vẫn giữ nguyên 'student' cho đến khi admin approve
    const instructor = await Instructor.create({
      userId: dto.userId,
      bio: dto.bio ?? null,
      experience: dto.experience ?? 0,
    });

    return instructor;
  }

  // ── Cập nhật profile ─────────────────────────────────────────────────────
  async update(userId: string, dto: UpdateInstructorDTO): Promise<Instructor> {
    const instructor = await Instructor.findOne({ where: { userId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);

    await instructor.update(dto);
    return instructor;
  }

  // ── Admin: duyệt instructor ──────────────────────────────────────────────
  async approve(id: string): Promise<Instructor> {
    const instructor = await Instructor.findByPk(id);
    if (!instructor) throw new AppError('Instructor not found', 404);

    await instructor.update({ approved: true });

    // Chỉ đổi role khi admin approve
    await User.update({ role: 'instructor' }, { where: { id: instructor.userId } });

    return instructor;
  }

  // ── Admin: từ chối / xóa instructor ─────────────────────────────────────
  async remove(id: string): Promise<void> {
    const instructor = await Instructor.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!instructor) throw new AppError('Instructor not found', 404);

    // Đổi role user về student
    await User.update({ role: 'student' }, { where: { id: instructor.userId } });
    await instructor.destroy();
  }
}

export const instructorService = new InstructorService();

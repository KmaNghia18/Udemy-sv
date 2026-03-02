import { AppError } from '../utils/AppError';
import User, { UserAttributes } from '../models/User';
import { deleteOldAvatar } from '../utils/upload';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SafeUser = Omit<UserAttributes, 'password'>;

export interface UpdateProfileDTO {
  name?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class UserService {
  // ── Chuyển user sang object không chứa password ───────────────────────────
  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // ── Lấy thông tin user ────────────────────────────────────────────────────
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.toSafeUser(user);
  }

  // ── Cập nhật thông tin cơ bản ─────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<SafeUser> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (dto.name) user.name = dto.name;

    await user.save();
    return this.toSafeUser(user);
  }

  // ── Cập nhật avatar ───────────────────────────────────────────────────────
  async updateAvatar(userId: string, avatarUrl: string): Promise<SafeUser> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Xóa avatar cũ nếu có
    deleteOldAvatar(user.avatarUrl);

    user.avatarUrl = avatarUrl;
    await user.save();
    return this.toSafeUser(user);
  }

  // ── Xóa avatar ───────────────────────────────────────────────────────────
  async removeAvatar(userId: string): Promise<SafeUser> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Xóa file avatar
    deleteOldAvatar(user.avatarUrl);

    user.avatarUrl = null;
    await user.save();
    return this.toSafeUser(user);
  }
}

// Export singleton
export const userService = new UserService();

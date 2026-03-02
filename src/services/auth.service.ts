import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AppError } from '../utils/AppError';
import User, { UserAttributes } from '../models/User';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor' | 'admin';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export type SafeUser = Omit<UserAttributes, 'password'>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class AuthService {
  // ── Token helpers ──────────────────────────────────────────────────────────

  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

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

  // ── Register ───────────────────────────────────────────────────────────────

  async register(dto: RegisterDTO): Promise<{ user: SafeUser } & AuthTokens> {
    const { name, email, password, role = 'student' } = dto;

    // 1. Check if email already taken
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const user = await User.create({ name, email, password: hashedPassword, role });

    // 4. Generate tokens
    const tokens = this.generateTokens({ id: user.id, email: user.email, role: user.role });

    return { user: this.toSafeUser(user), ...tokens };
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDTO): Promise<{ user: SafeUser } & AuthTokens> {
    const { email, password } = dto;

    // 1. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Check account active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403);
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // 4. Generate tokens
    const tokens = this.generateTokens({ id: user.id, email: user.email, role: user.role });

    return { user: this.toSafeUser(user), ...tokens };
  }

  // ── Refresh Token ──────────────────────────────────────────────────────────

  refreshAccessToken(token: string): AuthTokens {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
      return this.generateTokens({ id: decoded.id, email: decoded.email, role: decoded.role });
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  // ── Get Me ─────────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.toSafeUser(user);
  }
}

// Export singleton
export const authService = new AuthService();

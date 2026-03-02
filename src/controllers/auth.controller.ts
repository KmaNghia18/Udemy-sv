import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { authService } from '../services/auth.service';

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    const result = await authService.register({ name, email, password, role });
    sendSuccess(res, result, 'Registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await authService.login({ email, password });
    sendSuccess(res, result, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/refresh-token ─────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokens = authService.refreshAccessToken(token);
    sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────
export const logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token');
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await authService.getProfile(req.user.id);
    sendSuccess(res, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { userService } from '../services/user.service';
import { saveAvatar } from '../utils/upload';

// ─── GET /api/v1/users/profile ────────────────────────────────────────────────
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await userService.getProfile(req.user.id);
    sendSuccess(res, user, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/profile ────────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    const { name } = req.body;
    const user = await userService.updateProfile(req.user.id, { name });
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/avatar ─────────────────────────────────────────────────
export const updateAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    // Sharp resize + nén + lưu vào assets/users/{userId}/avatar.webp
    const avatarUrl = await saveAvatar(req.user.id, req.file);
    const user = await userService.updateAvatar(req.user.id, avatarUrl);
    sendSuccess(res, user, 'Avatar updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/users/avatar ──────────────────────────────────────────────
export const removeAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await userService.removeAvatar(req.user.id);
    sendSuccess(res, user, 'Avatar removed successfully');
  } catch (error) {
    next(error);
  }
};

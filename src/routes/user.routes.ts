import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { uploadAvatar } from '../utils/upload';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
} from '../controllers/user.controller';

const UserRouter = Router();

// Tất cả route đều yêu cầu đăng nhập
UserRouter.use(authenticate);

// GET  /api/v1/users/profile   — Lấy thông tin user
UserRouter.get('/profile', getProfile);

// PUT  /api/v1/users/profile   — Cập nhật thông tin (name)
UserRouter.put('/profile', updateProfile);

// PUT  /api/v1/users/avatar    — Upload avatar mới
UserRouter.put('/avatar', uploadAvatar.single('avatar'), updateAvatar);

// DELETE /api/v1/users/avatar  — Xóa avatar
UserRouter.delete('/avatar', removeAvatar);

export default UserRouter;

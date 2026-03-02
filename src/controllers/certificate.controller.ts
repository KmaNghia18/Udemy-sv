import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { certificateService } from '../services/certificate.service';
import { AppError } from '../utils/AppError';

// POST /api/v1/certificates/course/:courseId — cấp chứng chỉ
export const issue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const cert = await certificateService.issue(req.user.id, req.params.courseId);
    sendSuccess(res, cert, 'Certificate issued successfully', 201);
  } catch (error) { next(error); }
};

// GET /api/v1/certificates/my — tất cả chứng chỉ của tôi
export const getMyAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const certs = await certificateService.getMyAll(req.user.id);
    sendSuccess(res, certs);
  } catch (error) { next(error); }
};

// GET /api/v1/certificates/course/:courseId — chứng chỉ 1 khóa
export const getByUserAndCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const cert = await certificateService.getByUserAndCourse(req.user.id, req.params.courseId);
    sendSuccess(res, cert);
  } catch (error) { next(error); }
};

// GET /api/v1/certificates/verify/:code — xác minh chứng chỉ (public)
export const verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await certificateService.verify(req.params.code);
    if (!cert) throw new AppError('Certificate not found', 404);
    sendSuccess(res, cert, 'Certificate verified');
  } catch (error) { next(error); }
};

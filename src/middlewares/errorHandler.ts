import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import multer from 'multer';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    let msg: string;
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      // err.field = tên field client gửi sai
      msg = `Unexpected file field '${err.field}'. `
        + `For courses: use 'thumbnail' (image) and/or 'demo' (video). `
        + `For categories: use 'icon' (image).`;
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      msg = `File too large. Courses: thumbnail max 10MB, demo max 200MB. Categories: icon max 2MB.`;
    } else {
      msg = err.message;
    }
    res.status(400).json({ success: false, message: msg });
    return;
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

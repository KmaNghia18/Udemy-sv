import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
  } as ApiResponse);
};

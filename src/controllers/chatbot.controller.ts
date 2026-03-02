import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { chatbotService } from '../services/chatbot.service';
import { AppError } from '../utils/AppError';

// POST /api/v1/chatbot/message
export const sendChatbotMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { message } = req.body;
    if (!message?.trim()) throw new AppError('message is required', 400);
    const result = await chatbotService.chat(req.user.id, message.trim());
    sendSuccess(res, result, 'AI response', 200);
  } catch (error) { next(error); }
};

// GET /api/v1/chatbot/history
export const getChatbotHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await chatbotService.getHistory(req.user.id, page, limit);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// DELETE /api/v1/chatbot/history
export const clearChatbotHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const count = await chatbotService.clearHistory(req.user.id);
    sendSuccess(res, { deleted: count });
  } catch (error) { next(error); }
};

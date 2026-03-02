import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { chatService } from '../services/chat.service';
import { AppError } from '../utils/AppError';
import { saveChatImage } from '../utils/upload';
import { ioInstance } from '../socket/chatSocket';

// POST /api/v1/chat/conversations — tạo/mở conversation
export const createConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { instructorId } = req.body;
    if (!instructorId) throw new AppError('instructorId is required', 400);
    const conv = await chatService.getOrCreateConversation(req.user.id, instructorId);
    sendSuccess(res, conv, 'Conversation created', 201);
  } catch (error) { next(error); }
};

// GET /api/v1/chat/conversations — danh sách conversations
export const getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const convs = await chatService.getConversations(req.user.id, req.user.role || 'student');
    sendSuccess(res, convs);
  } catch (error) { next(error); }
};

// GET /api/v1/chat/conversations/:id/messages — lịch sử tin nhắn
export const getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await chatService.getMessages(req.params.id, page, limit);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

// POST /api/v1/chat/conversations/:id/messages — gửi tin nhắn text
export const sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { content } = req.body;
    if (!content?.trim()) throw new AppError('content is required', 400);
    const message = await chatService.sendMessage(req.params.id, req.user.id, content.trim());
    sendSuccess(res, message, 'Message sent', 201);
  } catch (error) { next(error); }
};

// POST /api/v1/chat/conversations/:id/images — gửi ảnh
export const sendImageMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    if (!req.file) throw new AppError('No image file provided', 400);

    const convId = req.params.id;
    const imageUrl = await saveChatImage(convId, req.file);
    const caption = req.body.caption?.trim() || null;
    const message = await chatService.sendMessage(convId, req.user.id, caption, 'image', imageUrl);

    // Broadcast qua socket để bên kia thấy real-time
    if (ioInstance) {
      ioInstance.to(`conv:${convId}`).emit('new_message', message);

      // Gửi notification cho người nhận
      const Conversation = (await import('../models/Conversation')).default;
      const conv = await Conversation.findByPk(convId);
      if (conv) {
        const { Instructor } = await import('../models/Instructor');
        if (conv.userId === req.user.id) {
          const instructor = await Instructor.findByPk(conv.instructorId);
          if (instructor) ioInstance.to(`user:${instructor.userId}`).emit('new_message_notification', { conversationId: convId, message });
        } else {
          ioInstance.to(`user:${conv.userId}`).emit('new_message_notification', { conversationId: convId, message });
        }
      }
    }

    sendSuccess(res, message, 'Image sent', 201);
  } catch (error) { next(error); }
};

// PATCH /api/v1/chat/conversations/:id/read — đánh dấu đã đọc
export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const count = await chatService.markAsRead(req.params.id, req.user.id);
    sendSuccess(res, { markedCount: count });
  } catch (error) { next(error); }
};

// GET /api/v1/chat/unread-count
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const count = await chatService.getUnreadCount(req.user.id, req.user.role || 'student');
    sendSuccess(res, { unreadCount: count });
  } catch (error) { next(error); }
};

import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { chatService } from '../services/chat.service';
import logger from '../utils/logger';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export let ioInstance: Server | null = null;

export function initSocketIO(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });
  ioInstance = io;

  // ── JWT Authentication middleware ─────────────────────────────────────────
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      socket.userId = decoded.id || decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;
    logger.info(`🔌 Socket connected: ${userId}`);

    // User tự join room cá nhân để nhận tin từ bất kỳ conversation nào
    socket.join(`user:${userId}`);

    // ── Join conversation room ──────────────────────────────────────────
    socket.on('join', (data: { conversationId: string }) => {
      socket.join(`conv:${data.conversationId}`);
      logger.info(`📥 User ${userId} joined conv:${data.conversationId}`);
    });

    // ── Leave conversation room ─────────────────────────────────────────
    socket.on('leave', (data: { conversationId: string }) => {
      socket.leave(`conv:${data.conversationId}`);
    });

    // ── Send message ────────────────────────────────────────────────────
    socket.on('send_message', async (data: { conversationId: string; content: string; type?: 'text' | 'image' }) => {
      try {
        if (!data.content?.trim() && data.type !== 'image') return;
        const message = await chatService.sendMessage(data.conversationId, userId, (data.content || '').trim(), data.type || 'text');

        // Broadcast tin nhắn mới cho tất cả trong room
        io.to(`conv:${data.conversationId}`).emit('new_message', message);

        // Gửi notification đến user room (cho badge update)
        // Tìm conversation để biết ai là người nhận
        const conv = (await import('../models/Conversation')).default;
        const conversation = await conv.findByPk(data.conversationId);
        if (conversation) {
          const Instructor = (await import('../models/Instructor')).Instructor;
          // Nếu sender là user → notify instructor, ngược lại
          if (conversation.userId === userId) {
            const instructor = await Instructor.findByPk(conversation.instructorId);
            if (instructor) io.to(`user:${instructor.userId}`).emit('new_message_notification', { conversationId: data.conversationId, message });
          } else {
            io.to(`user:${conversation.userId}`).emit('new_message_notification', { conversationId: data.conversationId, message });
          }
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
        logger.error('Socket send_message error:', err);
      }
    });

    // ── Typing indicator ────────────────────────────────────────────────
    socket.on('typing', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('user_typing', { userId, conversationId: data.conversationId });
    });

    socket.on('stop_typing', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('user_stop_typing', { userId, conversationId: data.conversationId });
    });

    // ── Mark as read ────────────────────────────────────────────────────
    socket.on('mark_read', async (data: { conversationId: string }) => {
      try {
        await chatService.markAsRead(data.conversationId, userId);
        socket.to(`conv:${data.conversationId}`).emit('messages_read', { userId, conversationId: data.conversationId });
      } catch (err) {
        logger.error('Socket mark_read error:', err);
      }
    });

    // ── Disconnect ──────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${userId}`);
    });
  });

  logger.info('💬 Socket.IO initialized');
  return io;
}

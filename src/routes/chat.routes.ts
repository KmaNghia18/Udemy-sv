import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { uploadChatImage } from '../utils/upload';
import {
  createConversation, getConversations, getMessages,
  sendMessage, sendImageMessage, markAsRead, getUnreadCount,
} from '../controllers/chat.controller';

const ChatRouter = Router();

ChatRouter.get('/conversations', authenticate, getConversations);
ChatRouter.post('/conversations', authenticate, createConversation);
ChatRouter.get('/conversations/:id/messages', authenticate, getMessages);
ChatRouter.post('/conversations/:id/messages', authenticate, sendMessage);
ChatRouter.post('/conversations/:id/images', authenticate, uploadChatImage, sendImageMessage);
ChatRouter.patch('/conversations/:id/read', authenticate, markAsRead);
ChatRouter.get('/unread-count', authenticate, getUnreadCount);

export default ChatRouter;

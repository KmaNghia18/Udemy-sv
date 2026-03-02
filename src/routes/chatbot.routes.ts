import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { sendChatbotMessage, getChatbotHistory, clearChatbotHistory } from '../controllers/chatbot.controller';

const ChatbotRouter = Router();

ChatbotRouter.post('/message', authenticate, sendChatbotMessage);
ChatbotRouter.get('/history', authenticate, getChatbotHistory);
ChatbotRouter.delete('/history', authenticate, clearChatbotHistory);

export default ChatbotRouter;

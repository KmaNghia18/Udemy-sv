import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, remove, clearRead } from '../controllers/notification.controller';

const NotificationRouter = Router();

// Tất cả đều cần auth
NotificationRouter.get('/', authenticate, getMyNotifications);
NotificationRouter.get('/unread-count', authenticate, getUnreadCount);
NotificationRouter.patch('/read-all', authenticate, markAllAsRead);
NotificationRouter.patch('/:id/read', authenticate, markAsRead);
NotificationRouter.delete('/clear', authenticate, clearRead);
NotificationRouter.delete('/:id', authenticate, remove);

export default NotificationRouter;

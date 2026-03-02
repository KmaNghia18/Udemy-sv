import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { update, remove } from '../controllers/reviewReply.controller';

const ReviewReplyRouter = Router();

// Sửa / Xóa reply (instructor hoặc admin)
ReviewReplyRouter.put('/:id', authenticate, update);
ReviewReplyRouter.delete('/:id', authenticate, remove);

export default ReviewReplyRouter;

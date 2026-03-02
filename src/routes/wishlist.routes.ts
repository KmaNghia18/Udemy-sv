import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { toggle, checkLiked, getMyCourses, getMyLessons, getLikeCount, batchCheck } from '../controllers/wishlist.controller';

const WishlistRouter = Router();

// Public
WishlistRouter.get('/count', getLikeCount);

// Auth required
WishlistRouter.post('/toggle', authenticate, toggle);
WishlistRouter.post('/batch-check', authenticate, batchCheck);
WishlistRouter.get('/check', authenticate, checkLiked);
WishlistRouter.get('/courses', authenticate, getMyCourses);
WishlistRouter.get('/lessons', authenticate, getMyLessons);

export default WishlistRouter;

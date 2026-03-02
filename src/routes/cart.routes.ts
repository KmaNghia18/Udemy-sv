import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { getCart, getCount, addToCart, removeFromCart, clearCart } from '../controllers/cart.controller';

const CartRouter = Router();

// Tất cả đều cần đăng nhập (giỏ hàng cá nhân)
CartRouter.get('/', authenticate, getCart);
CartRouter.get('/count', authenticate, getCount);
CartRouter.post('/:courseId', authenticate, addToCart);
CartRouter.delete('/:courseId', authenticate, removeFromCart);
CartRouter.delete('/', authenticate, clearCart);

export default CartRouter;

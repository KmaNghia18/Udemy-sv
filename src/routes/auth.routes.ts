import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const AuthRouter = Router();

AuthRouter.post('/register', register);
AuthRouter.post('/login', login);
AuthRouter.post('/refresh-token', refreshToken);
AuthRouter.post('/logout', authenticate, logout);
AuthRouter.get('/me', authenticate, getMe);

export default AuthRouter;

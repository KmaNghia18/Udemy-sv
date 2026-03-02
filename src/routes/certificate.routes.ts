import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { issue, getMyAll, getByUserAndCourse, verify } from '../controllers/certificate.controller';

const CertificateRouter = Router();

// Public — xác minh chứng chỉ bằng mã
CertificateRouter.get('/verify/:code', verify);

// Protected
CertificateRouter.get('/my', authenticate, getMyAll);
CertificateRouter.get('/course/:courseId', authenticate, getByUserAndCourse);
CertificateRouter.post('/course/:courseId', authenticate, issue);

export default CertificateRouter;

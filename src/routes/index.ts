import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import instructorRoutes from './instructor.routes';
import courseRoutes from './course.routes';
import categoryRoutes from './category.routes';
import priceTierRoutes from './priceTier.routes';
import couponRoutes from './coupon.routes';
import promotionRoutes from './promotion.routes';
import faqRoutes from './faq.routes';
import lessonRoutes from './lesson.routes';
import materialRoutes from './lessonMaterial.routes';
import noteRoutes from './lessonNote.routes';
import courseReviewRoutes from './courseReview.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import wishlistRoutes from './wishlist.routes';
import reviewReplyRoutes from './reviewReply.routes';
import notificationRoutes from './notification.routes';
import statsRoutes from './stats.routes';
import progressRoutes from './lessonProgress.routes';
import certificateRoutes from './certificate.routes';
import chatRoutes from './chat.routes';
import chatbotRoutes from './chatbot.routes';
import { authenticate, authorize } from '../middlewares/auth';
import { updateQuestion, deleteQuestion, getAttemptDetail } from '../controllers/quiz.controller';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/instructors', instructorRoutes);
router.use('/courses', courseRoutes);
router.use('/categories', categoryRoutes);
router.use('/price-tiers', priceTierRoutes);
router.use('/coupons', couponRoutes);
router.use('/promotions', promotionRoutes);
router.use('/faqs', faqRoutes);
router.use('/lessons', lessonRoutes);
router.use('/materials', materialRoutes);
router.use('/notes', noteRoutes);
router.use('/course-reviews', courseReviewRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlists', wishlistRoutes);
router.use('/review-replies', reviewReplyRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stats', statsRoutes);
router.use('/progress', progressRoutes);
router.use('/certificates', certificateRoutes);
router.use('/chat', chatRoutes);
router.use('/chatbot', chatbotRoutes);

// Quiz standalone routes (không nested dưới lesson)
router.put('/quiz/questions/:id', authenticate, authorize('instructor', 'admin'), updateQuestion);
router.delete('/quiz/questions/:id', authenticate, authorize('instructor', 'admin'), deleteQuestion);
router.get('/quiz/attempts/:attemptId', authenticate, getAttemptDetail);

export default router;


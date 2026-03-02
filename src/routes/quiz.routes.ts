import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadQuizImages } from '../utils/upload';
import {
  createQuestion,
  bulkCreateQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionsForInstructor,
  getQuiz,
  submitQuiz,
  getAttemptHistory,
  getAttemptDetail,
} from '../controllers/quiz.controller';

const QuizRouter = Router({ mergeParams: true });

// ── Instructor: quản lý câu hỏi ─────────────────────────────────────────────
// GET  /api/v1/lessons/:lessonId/quiz/questions      — xem câu hỏi (kèm isCorrect)
QuizRouter.get('/questions', authenticate, authorize('instructor', 'admin'), getQuestionsForInstructor);
// POST /api/v1/lessons/:lessonId/quiz/questions      — tạo 1 câu hỏi (JSON)
QuizRouter.post('/questions', authenticate, authorize('instructor', 'admin'), createQuestion);
// POST /api/v1/lessons/:lessonId/quiz/questions/bulk — tạo nhiều câu hỏi + upload ảnh
QuizRouter.post('/questions/bulk', authenticate, authorize('instructor', 'admin'), uploadQuizImages, bulkCreateQuestions);

// ── User: làm quiz ───────────────────────────────────────────────────────────
// GET  /api/v1/lessons/:lessonId/quiz                — lấy quiz (ẩn isCorrect)
QuizRouter.get('/', authenticate, getQuiz);
// POST /api/v1/lessons/:lessonId/quiz/submit         — nộp bài
QuizRouter.post('/submit', authenticate, submitQuiz);
// GET  /api/v1/lessons/:lessonId/quiz/attempts       — lịch sử
QuizRouter.get('/attempts', authenticate, getAttemptHistory);

export default QuizRouter;

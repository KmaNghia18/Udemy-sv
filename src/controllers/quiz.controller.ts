import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { quizService } from '../services/quiz.service';
import { AppError } from '../utils/AppError';
import { saveQuizImage } from '../utils/upload';
import Lesson from '../models/Lesson';
import Course from '../models/Course';

// ═══════════════════════════════════════════════════════════════════════════════
//  INSTRUCTOR
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/lessons/:lessonId/quiz/questions — tạo 1 câu hỏi (JSON, không upload ảnh)
export const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { questionType, question, imageUrl, orderIndex, answers } = req.body;
    if (!question || !answers) throw new AppError('question and answers are required', 400);
    const result = await quizService.createQuestion(req.user.id, {
      lessonId: req.params.lessonId,
      questionType: questionType ?? 'text',
      question,
      imageUrl,
      orderIndex,
      answers,
    });
    sendSuccess(res, result, 'Question created', 201);
  } catch (error) { next(error); }
};

// POST /api/v1/lessons/:lessonId/quiz/questions/bulk — tạo nhiều câu hỏi + upload ảnh
// Body: multipart/form-data
//   - field 'questions': JSON string of array [{questionType, question, orderIndex, answers, imageIndex?}]
//   - field 'images': array of files (matched by imageIndex in questions array)
export const bulkCreateQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const lessonId = req.params.lessonId;

    // Parse questions từ JSON string
    let questionsData: any[];
    try {
      questionsData = JSON.parse(req.body.questions);
    } catch {
      throw new AppError('questions must be a valid JSON array', 400);
    }
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new AppError('questions array is required', 400);
    }

    // Lấy courseId để lưu ảnh
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);
    const course = await Course.findByPk(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404);

    const files = (req.files as Express.Multer.File[]) || [];

    const results = [];
    for (const qData of questionsData) {
      // Tạo question trước
      const created = await quizService.createQuestion(req.user.id, {
        lessonId,
        questionType: qData.questionType ?? 'text',
        question: qData.question,
        imageUrl: qData.imageUrl ?? undefined,
        orderIndex: qData.orderIndex,
        answers: qData.answers,
      });

      // Nếu question type = text_image và có imageIndex → upload ảnh
      if (qData.questionType === 'text_image' && qData.imageIndex !== undefined && files[qData.imageIndex]) {
        const imageUrl = await saveQuizImage(course.id, created.id, files[qData.imageIndex]);
        await created.update({ imageUrl });
      }

      results.push(created);
    }

    sendSuccess(res, results, `${results.length} questions created`, 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/quiz/questions/:id — sửa câu hỏi
export const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const result = await quizService.updateQuestion(req.user.id, req.params.id, req.body);

    // Nếu có upload ảnh mới
    const file = (req.files as Express.Multer.File[])?.[0] || (req as any).file;
    if (file) {
      const question = await quizService.getQuestionById(req.params.id);
      if (question) {
        const lesson = await Lesson.findByPk(question.lessonId);
        if (lesson) {
          const imageUrl = await saveQuizImage(lesson.courseId, question.id, file);
          await result.update({ imageUrl });
        }
      }
    }

    sendSuccess(res, result, 'Question updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/quiz/questions/:id — xóa câu hỏi
export const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    await quizService.deleteQuestion(req.user.id, req.params.id);
    sendSuccess(res, null, 'Question deleted');
  } catch (error) { next(error); }
};

// GET /api/v1/lessons/:lessonId/quiz/questions — instructor xem câu hỏi (kèm isCorrect)
export const getQuestionsForInstructor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const questions = await quizService.getQuestionsForInstructor(req.user.id, req.params.lessonId);
    sendSuccess(res, questions);
  } catch (error) { next(error); }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  USER
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/v1/lessons/:lessonId/quiz — lấy quiz (ẩn isCorrect)
export const getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const questions = await quizService.getQuiz(req.user.id, req.params.lessonId);
    sendSuccess(res, questions);
  } catch (error) { next(error); }
};

// POST /api/v1/lessons/:lessonId/quiz/submit — nộp bài
export const submitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) throw new AppError('answers[] is required', 400);
    const attempt = await quizService.submitQuiz(req.user.id, req.params.lessonId, answers);
    sendSuccess(res, attempt, 'Quiz submitted', 201);
  } catch (error) { next(error); }
};

// GET /api/v1/lessons/:lessonId/quiz/attempts — lịch sử làm quiz
export const getAttemptHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const attempts = await quizService.getAttemptHistory(req.user.id, req.params.lessonId);
    sendSuccess(res, attempts);
  } catch (error) { next(error); }
};

// GET /api/v1/quiz/attempts/:attemptId — chi tiết 1 lần làm
export const getAttemptDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    const attempt = await quizService.getAttemptDetail(req.user.id, req.params.attemptId);
    sendSuccess(res, attempt);
  } catch (error) { next(error); }
};

import { AppError } from '../utils/AppError';
import QuizQuestion from '../models/QuizQuestion';
import QuizAnswer from '../models/QuizAnswer';
import QuizAttempt from '../models/QuizAttempt';
import QuizAttemptAnswer from '../models/QuizAttemptAnswer';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import Order from '../models/Order';
import { Instructor } from '../models/Instructor';

// ─── DTOs ─────────────────────────────────────────────────────────────────────
interface AnswerInput {
  content: string;
  isCorrect: boolean;
  orderIndex?: number;
}
interface CreateQuestionDTO {
  lessonId: string;
  questionType: 'text' | 'text_image';
  question: string;
  imageUrl?: string;
  orderIndex?: number;
  answers: AnswerInput[];   // phải đúng 4 đáp án
}
interface SubmitAnswerDTO {
  questionId: string;
  answerId: string;
}

export class QuizService {

  // ── Kiểm tra instructor sở hữu khóa học ───────────────────────────────────
  private async checkInstructor(userId: string, lessonId: string): Promise<void> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);
    const course = await Course.findByPk(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404);
    const instructor = await Instructor.findOne({ where: { userId } });
    if (!instructor || course.instructorId !== instructor.id) {
      throw new AppError('You can only manage quiz for your own course', 403);
    }
  }

  // ── Kiểm tra user đã mua khóa học ─────────────────────────────────────────
  private async checkPurchased(userId: string, lessonId: string): Promise<void> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    // Instructor luôn được quyền
    const course = await Course.findByPk(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404);
    const instructor = await Instructor.findOne({ where: { userId } });
    if (instructor && course.instructorId === instructor.id) return;

    const purchased = await Order.findOne({
      where: { userId, courseId: lesson.courseId, status: 'completed' },
    });
    if (!purchased) throw new AppError('You must purchase this course to take the quiz', 403);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INSTRUCTOR: CRUD câu hỏi
  // ═══════════════════════════════════════════════════════════════════════════

  async createQuestion(userId: string, dto: CreateQuestionDTO): Promise<QuizQuestion> {
    await this.checkInstructor(userId, dto.lessonId);

    // Validate: phải có đúng 4 đáp án, ít nhất 1 đáp án đúng
    if (!dto.answers || dto.answers.length !== 4) {
      throw new AppError('Exactly 4 answers are required', 400);
    }
    const correctCount = dto.answers.filter(a => a.isCorrect).length;
    if (correctCount === 0) throw new AppError('At least one answer must be correct', 400);

    const question = await QuizQuestion.create({
      lessonId: dto.lessonId,
      questionType: dto.questionType,
      question: dto.question,
      imageUrl: dto.imageUrl ?? null,
      orderIndex: dto.orderIndex ?? 0,
    });

    // Tạo 4 đáp án
    for (let i = 0; i < dto.answers.length; i++) {
      await QuizAnswer.create({
        questionId: question.id,
        content: dto.answers[i].content,
        isCorrect: dto.answers[i].isCorrect,
        orderIndex: dto.answers[i].orderIndex ?? i,
      });
    }

    // Reload kèm answers
    return QuizQuestion.findByPk(question.id, {
      include: [{ model: QuizAnswer, as: 'answers', attributes: ['id', 'content', 'isCorrect', 'orderIndex'] }],
    }) as Promise<QuizQuestion>;
  }

  async updateQuestion(userId: string, questionId: string, data: Partial<CreateQuestionDTO>): Promise<QuizQuestion> {
    const question = await QuizQuestion.findByPk(questionId);
    if (!question) throw new AppError('Question not found', 404);
    await this.checkInstructor(userId, question.lessonId);

    // Update question fields
    await question.update({
      ...(data.questionType && { questionType: data.questionType }),
      ...(data.question && { question: data.question }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
    });

    // Update answers nếu có
    if (data.answers && data.answers.length === 4) {
      const correctCount = data.answers.filter(a => a.isCorrect).length;
      if (correctCount === 0) throw new AppError('At least one answer must be correct', 400);

      // Xóa answers cũ, tạo mới
      await QuizAnswer.destroy({ where: { questionId: question.id } });
      for (let i = 0; i < data.answers.length; i++) {
        await QuizAnswer.create({
          questionId: question.id,
          content: data.answers[i].content,
          isCorrect: data.answers[i].isCorrect,
          orderIndex: data.answers[i].orderIndex ?? i,
        });
      }
    }

    return QuizQuestion.findByPk(question.id, {
      include: [{ model: QuizAnswer, as: 'answers', attributes: ['id', 'content', 'isCorrect', 'orderIndex'] }],
    }) as Promise<QuizQuestion>;
  }

  async deleteQuestion(userId: string, questionId: string): Promise<void> {
    const question = await QuizQuestion.findByPk(questionId);
    if (!question) throw new AppError('Question not found', 404);
    await this.checkInstructor(userId, question.lessonId);
    await question.destroy(); // CASCADE xóa answers
  }

  // Helper: lấy question by id
  async getQuestionById(questionId: string): Promise<QuizQuestion | null> {
    return QuizQuestion.findByPk(questionId);
  }

  // Instructor xem câu hỏi (kèm isCorrect)
  async getQuestionsForInstructor(userId: string, lessonId: string): Promise<QuizQuestion[]> {
    await this.checkInstructor(userId, lessonId);
    return QuizQuestion.findAll({
      where: { lessonId },
      include: [{ model: QuizAnswer, as: 'answers', attributes: ['id', 'content', 'isCorrect', 'orderIndex'] }],
      order: [['orderIndex', 'ASC'], [{ model: QuizAnswer, as: 'answers' }, 'orderIndex', 'ASC']],
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  USER: làm quiz
  // ═══════════════════════════════════════════════════════════════════════════

  // Lấy quiz (ẨN isCorrect)
  async getQuiz(userId: string, lessonId: string): Promise<QuizQuestion[]> {
    await this.checkPurchased(userId, lessonId);
    return QuizQuestion.findAll({
      where: { lessonId },
      include: [{ model: QuizAnswer, as: 'answers', attributes: ['id', 'content', 'orderIndex'] }],
      order: [['orderIndex', 'ASC'], [{ model: QuizAnswer, as: 'answers' }, 'orderIndex', 'ASC']],
    });
  }

  // Nộp bài
  async submitQuiz(userId: string, lessonId: string, userAnswers: SubmitAnswerDTO[]): Promise<QuizAttempt> {
    await this.checkPurchased(userId, lessonId);

    // Lấy tất cả câu hỏi + đáp án đúng
    const questions = await QuizQuestion.findAll({
      where: { lessonId },
      include: [{ model: QuizAnswer, as: 'answers' }],
    });
    if (questions.length === 0) throw new AppError('No quiz questions found for this lesson', 404);

    // Map đáp án đúng: questionId → set of correct answerIds
    const correctMap = new Map<string, Set<string>>();
    for (const q of questions) {
      const correctIds = ((q as any).answers as QuizAnswer[]).filter(a => a.isCorrect).map(a => a.id);
      correctMap.set(q.id, new Set(correctIds));
    }

    // Tính điểm
    let score = 0;
    const attemptAnswers: { questionId: string; selectedAnswerId: string; isCorrect: boolean }[] = [];

    for (const ua of userAnswers) {
      const correctSet = correctMap.get(ua.questionId);
      if (!correctSet) continue; // skip câu hỏi không tồn tại
      const isCorrect = correctSet.has(ua.answerId);
      if (isCorrect) score++;
      attemptAnswers.push({ questionId: ua.questionId, selectedAnswerId: ua.answerId, isCorrect });
    }

    // Tạo attempt
    const attempt = await QuizAttempt.create({
      userId,
      lessonId,
      score,
      totalQuestions: questions.length,
      completedAt: new Date(),
    });

    // Lưu từng đáp án user đã chọn
    for (const aa of attemptAnswers) {
      await QuizAttemptAnswer.create({ attemptId: attempt.id, ...aa });
    }

    // Reload kèm detail
    return QuizAttempt.findByPk(attempt.id, {
      include: [{
        model: QuizAttemptAnswer,
        as: 'answers',
        include: [
          { model: QuizQuestion, as: 'question', attributes: ['id', 'question', 'questionType', 'imageUrl'] },
          { model: QuizAnswer, as: 'selectedAnswer', attributes: ['id', 'content'] },
        ],
      }],
    }) as Promise<QuizAttempt>;
  }

  // Lịch sử các lần làm
  async getAttemptHistory(userId: string, lessonId: string): Promise<QuizAttempt[]> {
    return QuizAttempt.findAll({
      where: { userId, lessonId },
      order: [['completedAt', 'DESC']],
    });
  }

  // Chi tiết 1 lần làm (đáp án đã chọn + đúng/sai + đáp án đúng)
  async getAttemptDetail(userId: string, attemptId: string): Promise<QuizAttempt> {
    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [{
        model: QuizAttemptAnswer,
        as: 'answers',
        include: [
          {
            model: QuizQuestion,
            as: 'question',
            attributes: ['id', 'question', 'questionType', 'imageUrl'],
            include: [{ model: QuizAnswer, as: 'answers', attributes: ['id', 'content', 'isCorrect', 'orderIndex'] }],
          },
          { model: QuizAnswer, as: 'selectedAnswer', attributes: ['id', 'content'] },
        ],
      }],
    });
    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.userId !== userId) throw new AppError('You can only view your own attempts', 403);
    return attempt;
  }
}

export const quizService = new QuizService();

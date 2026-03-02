import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { faqService } from '../services/faq.service';
import { AppError } from '../utils/AppError';

// GET /api/v1/faqs?category=Thanh+toán — public
export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faqs = await faqService.getAll(req.query.category as string | undefined);
    sendSuccess(res, faqs);
  } catch (error) { next(error); }
};

// GET /api/v1/faqs/categories — public: danh sách categories
export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await faqService.getCategories();
    sendSuccess(res, categories);
  } catch (error) { next(error); }
};

// POST /api/v1/faqs — admin
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faq = await faqService.create(req.body);
    sendSuccess(res, faq, 'FAQ created', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/faqs/:id — admin
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faq = await faqService.update(Number(req.params.id), req.body);
    sendSuccess(res, faq, 'FAQ updated');
  } catch (error) { next(error); }
};

// DELETE /api/v1/faqs/:id — admin
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await faqService.remove(Number(req.params.id));
    sendSuccess(res, null, 'FAQ deleted');
  } catch (error) { next(error); }
};

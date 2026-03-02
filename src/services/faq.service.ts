import { AppError } from '../utils/AppError';
import Faq from '../models/Faq';
import { Op } from 'sequelize';

export interface CreateFaqDTO {
  question: string;
  answer: string;
  category?: string;
}

export class FaqService {

  // ── Public: lấy tất cả FAQ active (có thể filter theo category) ───────────
  async getAll(category?: string): Promise<Faq[]> {
    const where: Record<string, unknown> = { isActive: true };
    if (category) where['category'] = category;

    return Faq.findAll({
      where,
      order: [['id', 'ASC']],
      attributes: ['id', 'question', 'answer', 'category'],
    });
  }

  // ── Public: lấy danh sách các categories ─────────────────────────────────
  async getCategories(): Promise<string[]> {
    const faqs = await Faq.findAll({
      where: { isActive: true, category: { [Op.ne]: null } },
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
    });
    return faqs.map(f => f.category as string);
  }

  // ── Admin: tạo FAQ mới ─────────────────────────────────────────────────────
  async create(dto: CreateFaqDTO): Promise<Faq> {
    if (!dto.question || !dto.answer) throw new AppError('question and answer are required', 400);
    return Faq.create({
      question: dto.question,
      answer: dto.answer,
      category: dto.category ?? null,
    });
  }

  // ── Admin: cập nhật FAQ ───────────────────────────────────────────────────
  async update(id: number, dto: Partial<CreateFaqDTO> & { isActive?: boolean }): Promise<Faq> {
    const faq = await Faq.findByPk(id);
    if (!faq) throw new AppError('FAQ not found', 404);
    await faq.update({
      ...(dto.question && { question: dto.question }),
      ...(dto.answer && { answer: dto.answer }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return faq;
  }

  // ── Admin: xóa FAQ ────────────────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    const faq = await Faq.findByPk(id);
    if (!faq) throw new AppError('FAQ not found', 404);
    await faq.destroy();
  }
}

export const faqService = new FaqService();

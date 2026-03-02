import { AppError } from '../utils/AppError';
import Category from '../models/Category';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CreateCategoryDTO {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  iconUrl?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  parentId?: string | null;
  description?: string;
  iconUrl?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────
export class CategoryService {

  // ── Lấy toàn bộ category dạng cây (chỉ root + children) ─────────────────
  async getTree(): Promise<Category[]> {
    return Category.findAll({
      where: { parentId: null },        // chỉ lấy root
      include: [{
        model: Category,
        as: 'children',
        include: [{ model: Category, as: 'children' }],  // 2 cấp
      }],
      order: [['name', 'ASC']],
    });
  }

  // ── Lấy toàn bộ danh sách phẳng ──────────────────────────────────────────
  async getAll(): Promise<Category[]> {
    return Category.findAll({
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] }],
      order: [['name', 'ASC']],
    });
  }

  // ── Chi tiết 1 category ───────────────────────────────────────────────────
  async getById(id: string): Promise<Category> {
    const cat = await Category.findByPk(id, {
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
      ],
    });
    if (!cat) throw new AppError('Category not found', 404);
    return cat;
  }

  // ── Admin: tạo category ───────────────────────────────────────────────────
  async create(dto: CreateCategoryDTO): Promise<Category> {
    // Kiểm tra slug trùng
    const existing = await Category.findOne({ where: { slug: dto.slug } });
    if (existing) throw new AppError('Slug already exists', 409);

    // Kiểm tra parent tồn tại
    if (dto.parentId) {
      const parent = await Category.findByPk(dto.parentId);
      if (!parent) throw new AppError('Parent category not found', 404);
    }

    return Category.create(dto);
  }

  // ── Admin: cập nhật category ──────────────────────────────────────────────
  async update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const cat = await Category.findByPk(id);
    if (!cat) throw new AppError('Category not found', 404);

    if (dto.slug && dto.slug !== cat.slug) {
      const existing = await Category.findOne({ where: { slug: dto.slug } });
      if (existing) throw new AppError('Slug already exists', 409);
    }

    // Không cho phép set parentId = chính nó
    if (dto.parentId === id) {
      throw new AppError('A category cannot be its own parent', 400);
    }

    await cat.update(dto);
    return cat;
  }

  // ── Admin: xóa category ───────────────────────────────────────────────────
  async remove(id: string): Promise<void> {
    const cat = await Category.findByPk(id, {
      include: [{ model: Category, as: 'children' }],
    });
    if (!cat) throw new AppError('Category not found', 404);
    if (cat.children && cat.children.length > 0) {
      throw new AppError('Cannot delete a category that has sub-categories. Delete sub-categories first.', 400);
    }
    await cat.destroy();
  }
}

export const categoryService = new CategoryService();

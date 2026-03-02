import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { categoryService } from '../services/category.service';
import { saveCategoryIcon, deleteOldIcon } from '../utils/upload';

// GET /api/v1/categories/tree
export const getTree = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tree = await categoryService.getTree();
    sendSuccess(res, tree, 'Category tree fetched successfully');
  } catch (error) { next(error); }
};

// GET /api/v1/categories
export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await categoryService.getAll();
    sendSuccess(res, categories, 'Categories fetched successfully');
  } catch (error) { next(error); }
};

// GET /api/v1/categories/:id
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cat = await categoryService.getById(req.params.id);
    sendSuccess(res, cat, 'Category fetched successfully');
  } catch (error) { next(error); }
};

// POST /api/v1/categories  [Admin]
// multipart/form-data: name, slug?, parentId?, description?, icon? (file)
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, parentId, description } = req.body;
    if (!name) throw new AppError('name is required', 400);

    // Auto-generate slug from name if not provided
    const slug = req.body.slug || name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Tạo category trước để có id
    const cat = await categoryService.create({ name, slug, parentId, description });

    // Upload icon nếu có file đính kèm
    if (req.file) {
      const iconUrl = await saveCategoryIcon(cat.id, req.file);
      await categoryService.update(cat.id, { iconUrl });
      cat.iconUrl = iconUrl;
    }

    sendSuccess(res, cat, 'Category created successfully', 201);
  } catch (error) { next(error); }
};

// PUT /api/v1/categories/:id  [Admin]
// multipart/form-data: name?, slug?, parentId?, description?, icon? (file)
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, parentId, description } = req.body;

    // Lấy category hiện tại để kiểm tra icon cũ
    const existing = await categoryService.getById(req.params.id);

    let iconUrl: string | undefined;

    // Nếu có file mới → xóa icon cũ, lưu icon mới
    if (req.file) {
      deleteOldIcon(existing.iconUrl);
      iconUrl = await saveCategoryIcon(req.params.id, req.file);
    }

    const cat = await categoryService.update(req.params.id, {
      name,
      slug,
      parentId,
      description,
      ...(iconUrl && { iconUrl }),
    });

    sendSuccess(res, cat, 'Category updated successfully');
  } catch (error) { next(error); }
};

// DELETE /api/v1/categories/:id  [Admin]
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Lấy category để xóa icon file trước
    const cat = await categoryService.getById(req.params.id);
    deleteOldIcon(cat.iconUrl);

    await categoryService.remove(req.params.id);
    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) { next(error); }
};

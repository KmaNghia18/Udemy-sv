import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import Course, { CourseLevel, CourseStatus } from '../models/Course';
import { Instructor } from '../models/Instructor';
import Category from '../models/Category';
import CourseBenefit from '../models/CourseBenefit';
import CoursePrerequisite from '../models/CoursePrerequisite';
import PriceTier from '../models/PriceTier';
import Promotion from '../models/Promotion';
import Lesson from '../models/Lesson';
import User from '../models/User';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreateCourseDTO {
  instructorId: string;
  name: string;
  description: string;
  priceTierId: number;        // bắt buộc chọn tier
  price?: number;             // tự động từ tier, không nhập tay
  categoryIds?: string[];
  tags?: string[];
  level?: CourseLevel;
  estimatedPrice?: number;
  thumbnailUrl?: string;
  demoUrl?: string;
  benefits?: string[];
  prerequisites?: string[];
}

export interface UpdateCourseDTO {
  name?: string;
  description?: string;
  priceTierId?: number;       // nếu gửi → đổi tier
  categoryIds?: string[];
  tags?: string[];
  level?: CourseLevel;
  estimatedPrice?: number;
  thumbnailUrl?: string;
  demoUrl?: string;
  benefits?: string[];
  prerequisites?: string[];
}

export interface CourseFilterDTO {
  status?: CourseStatus;
  level?: CourseLevel;
  categoryId?: string;        // filter theo UUID category
  search?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}

// ─── Shared includes ──────────────────────────────────────────────────────────
const COURSE_INCLUDES = [
  {
    model: Instructor,
    as: 'instructor',
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
  },
  { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
  { model: CourseBenefit, as: 'benefits', attributes: ['id', 'benefit', 'displayOrder'] },
  { model: CoursePrerequisite, as: 'prerequisites', attributes: ['id', 'prerequisite', 'displayOrder'] },
  { model: PriceTier, as: 'priceTier', attributes: ['id', 'label', 'price'] },
  {
    model: Lesson,
    as: 'lessons',
    attributes: ['id', 'title', 'videoUrl', 'videoSection', 'videoLength', 'isFreePreview', 'orderIndex'],
  },
];

// ─── Service ─────────────────────────────────────────────────────────────────
export class CourseService {

  // ── Danh sách (admin truyền status, public mặc định active) ────────────
  async getAll(filter: CourseFilterDTO = {}) {
    const { status, level, categoryId, search, isFree, page = 1, limit = 12 } = filter;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where['status'] = status; // admin has no default; public passes 'active'
    if (level) where['level'] = level;
    if (isFree !== undefined) where['isFree'] = isFree;
    if (search) where['name'] = { [Op.like]: `%${search}%` };

    // Filter theo category: nếu là parent thì bao gồm cả subcategories
    let categoryInclude;
    if (categoryId) {
      // Tìm tất cả child categories của categoryId này
      const childCats = await Category.findAll({ where: { parentId: categoryId }, attributes: ['id'] });
      const allCatIds = [categoryId, ...childCats.map(c => c.id)];
      categoryInclude = { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], where: { id: { [Op.in]: allCatIds } }, through: { attributes: [] }, required: true };
    } else {
      categoryInclude = { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } };
    }

    const { rows: courses, count: total } = await Course.findAndCountAll({
      where,
      include: [
        {
          model: Instructor,
          as: 'instructor',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatarUrl'] }],
        },
        categoryInclude,
        { model: PriceTier, as: 'priceTier', attributes: ['id', 'label', 'price'] },
      ],
      distinct: true,     // cần thiết khi dùng include + count
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Lấy tất cả promotions đang active 1 lần duy nhất (tránh N+1)
    const now = new Date();
    const activePromotions = await Promotion.findAll({
      where: {
        isActive: true,
        startsAt: { [Op.lte]: now },
        endsAt: { [Op.gte]: now },
      },
      order: [['discountPercent', 'DESC']], // ưu tiên chiết khấu cao nhất
    });

    // Tính finalPrice cho từng course trong bộ nhớ (không query thêm)
    const coursesWithPrice = courses.map((course) => {
      const plain = course.get({ plain: true }) as unknown as Record<string, unknown>;
      const basePrice = Number((course as any).priceTier?.price ?? 0);
      const categoryIds: string[] = ((course as any).categories ?? []).map((c: any) => c.id);

      let appliedPromotion = null;
      for (const promo of activePromotions) {
        // scope = all
        if (promo.scope === 'all') {
          if (!promo.minPriceTierId || (course.priceTierId && course.priceTierId >= promo.minPriceTierId)) {
            appliedPromotion = promo; break;
          }
        }
        // scope = specific_tiers
        if (promo.scope === 'specific_tiers' && course.priceTierId) {
          const tierIds: number[] = JSON.parse(promo.scopeIds ?? '[]');
          if (tierIds.includes(course.priceTierId)) { appliedPromotion = promo; break; }
        }
        // scope = specific_categories
        if (promo.scope === 'specific_categories' && categoryIds.length > 0) {
          const catIds: string[] = JSON.parse(promo.scopeIds ?? '[]');
          if (categoryIds.some(id => catIds.includes(id))) { appliedPromotion = promo; break; }
        }
      }

      const discountAmount = appliedPromotion
        ? Math.round(basePrice * Number(appliedPromotion.discountPercent) / 100)
        : 0;

      return {
        ...plain,
        finalPrice: Math.max(0, basePrice - discountAmount),
        activePromotion: appliedPromotion ? {
          id: appliedPromotion.id,
          name: appliedPromotion.name,
          discountPercent: appliedPromotion.discountPercent,
          endsAt: appliedPromotion.endsAt,
        } : null,
      };
    });

    return { courses: coursesWithPrice, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Chi tiết 1 khóa học ───────────────────────────────────────────────────
  async getById(id: string): Promise<Course> {
    const course = await Course.findByPk(id, { include: COURSE_INCLUDES });
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  // ── Lấy courses của instructor (kể cả draft) ─────────────────────────────
  async getByInstructor(userId: string) {
    const instructor = await Instructor.findOne({ where: { userId } });
    if (!instructor) return [];
    return Course.findAll({
      where: { instructorId: instructor.id },
      include: [
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: CourseBenefit, as: 'benefits', attributes: ['id', 'benefit', 'displayOrder'] },
        { model: CoursePrerequisite, as: 'prerequisites', attributes: ['id', 'prerequisite', 'displayOrder'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // ── Instructor tạo khóa học (status: draft) ───────────────────────────────
  async create(dto: CreateCourseDTO): Promise<Course> {
    const instructor = await Instructor.findOne({ where: { userId: dto.instructorId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);
    if (!instructor.approved) throw new AppError('Your instructor account is not approved yet', 403);

    // Xác thực priceTier
    const tier = await PriceTier.findOne({ where: { id: dto.priceTierId, isActive: true } });
    if (!tier) throw new AppError('Invalid or inactive price tier', 400);

    const course = await Course.create({
      instructorId: instructor.id,
      name: dto.name,
      description: dto.description,
      priceTierId: tier.id,
      price: Number(tier.price),         // auto-set từ tier
      isFree: Number(tier.price) === 0,  // auto-detect free
      tags: dto.tags ? JSON.stringify(dto.tags) : null,
      level: dto.level,
      estimatedPrice: dto.estimatedPrice,
      thumbnailUrl: dto.thumbnailUrl,
      demoUrl: dto.demoUrl,
      status: 'draft',
    });

    // Gán categories (many-to-many)
    if (dto.categoryIds?.length) {
      await this.setCategories(course, dto.categoryIds);
    }

    // Gán benefits
    if (dto.benefits?.length) {
      await this.setBenefits(course.id, dto.benefits);
    }

    // Gán prerequisites
    if (dto.prerequisites?.length) {
      await this.setPrerequisites(course.id, dto.prerequisites);
    }

    return Course.findByPk(course.id, { include: COURSE_INCLUDES }) as Promise<Course>;
  }

  // ── Instructor cập nhật khóa học (chỉ khi draft/rejected) ────────────────
  async update(id: string, userId: string, dto: UpdateCourseDTO): Promise<Course> {
    const course = await this.findOwnCourse(id, userId);

    if (course.status === 'locked') {
      throw new AppError('This course is locked by admin and cannot be edited', 403);
    }

    await course.update({
      ...(dto.name && { name: dto.name }),
      ...(dto.description && { description: dto.description }),
      ...(dto.tags && { tags: JSON.stringify(dto.tags) }),
      ...(dto.level && { level: dto.level }),
      ...(dto.estimatedPrice !== undefined && { estimatedPrice: dto.estimatedPrice }),
      ...(dto.thumbnailUrl && { thumbnailUrl: dto.thumbnailUrl }),
      ...(dto.demoUrl && { demoUrl: dto.demoUrl }),
    });

    // Nếu đổi priceTier
    if (dto.priceTierId !== undefined) {
      const tier = await PriceTier.findOne({ where: { id: dto.priceTierId, isActive: true } });
      if (!tier) throw new AppError('Invalid or inactive price tier', 400);
      await course.update({
        priceTierId: tier.id,
        price: Number(tier.price),
        isFree: Number(tier.price) === 0,
      });
    }

    // Gán lại categories nếu có
    if (dto.categoryIds !== undefined) {
      await this.setCategories(course, dto.categoryIds);
    }

    // Gán lại benefits nếu có (replace toàn bộ)
    if (dto.benefits !== undefined) {
      await this.setBenefits(course.id, dto.benefits);
    }

    // Gán lại prerequisites nếu có (replace toàn bộ)
    if (dto.prerequisites !== undefined) {
      await this.setPrerequisites(course.id, dto.prerequisites);
    }

    return Course.findByPk(course.id, { include: COURSE_INCLUDES }) as Promise<Course>;
  }

  // ── Instructor submit duyệt ───────────────────────────────────────────────
  async submit(id: string, userId: string): Promise<Course> {
    const course = await this.findOwnCourse(id, userId);
    if (course.status !== 'draft' && course.status !== 'rejected') {
      throw new AppError('Only draft or rejected courses can be submitted for review', 400);
    }
    await course.update({ status: 'pending' });
    return course;
  }

  // ── Admin: duyệt khóa học ─────────────────────────────────────────────────
  async approve(id: string): Promise<Course> {
    const course = await Course.findByPk(id);
    if (!course) throw new AppError('Course not found', 404);
    if (course.status !== 'pending') throw new AppError('Only pending courses can be approved', 400);
    await course.update({ status: 'active' });
    return course;
  }

  // ── Admin: từ chối khóa học ───────────────────────────────────────────────
  async reject(id: string): Promise<Course> {
    const course = await Course.findByPk(id);
    if (!course) throw new AppError('Course not found', 404);
    if (course.status !== 'pending') throw new AppError('Only pending courses can be rejected', 400);
    await course.update({ status: 'rejected' });
    return course;
  }

  // ── Instructor/Admin xóa khóa học ─────────────────────────────────────────
  async remove(id: string, userId: string, role: string): Promise<void> {
    const course = role === 'admin'
      ? await Course.findByPk(id)
      : await this.findOwnCourse(id, userId);
    if (!course) throw new AppError('Course not found', 404);
    await course.destroy();
  }

  // ── Helper: gán categories (many-to-many) ────────────────────────────────
  private async setCategories(course: Course, categoryIds: string[]): Promise<void> {
    const categories = await Category.findAll({ where: { id: categoryIds } });
    if (categories.length !== categoryIds.length) {
      throw new AppError('One or more category IDs are invalid', 400);
    }
    await (course as any).setCategories(categories);
  }

  // ── Helper: replace toàn bộ benefits ─────────────────────────────────────
  private async setBenefits(courseId: string, benefits: string[]): Promise<void> {
    await CourseBenefit.destroy({ where: { courseId } });
    if (benefits.length > 0) {
      await CourseBenefit.bulkCreate(
        benefits.map((benefit, index) => ({ courseId, benefit, displayOrder: index }))
      );
    }
  }

  // ── Helper: replace toàn bộ prerequisites ────────────────────────────────
  private async setPrerequisites(courseId: string, prerequisites: string[]): Promise<void> {
    await CoursePrerequisite.destroy({ where: { courseId } });
    if (prerequisites.length > 0) {
      await CoursePrerequisite.bulkCreate(
        prerequisites.map((prerequisite, index) => ({ courseId, prerequisite, displayOrder: index }))
      );
    }
  }

  // ── Internal: cập nhật URLs sau khi upload file (bỏ qua status check) ──────
  async updateFiles(id: string, urls: { thumbnailUrl?: string; demoUrl?: string }): Promise<void> {
    await Course.update(urls, { where: { id } });
  }

  // ── Helper: verify ownership ──────────────────────────────────────────────
  private async findOwnCourse(courseId: string, userId: string): Promise<Course> {
    const instructor = await Instructor.findOne({ where: { userId } });
    if (!instructor) throw new AppError('Instructor profile not found', 404);
    const course = await Course.findOne({ where: { id: courseId, instructorId: instructor.id } });
    if (!course) throw new AppError('Course not found or you do not own this course', 404);
    return course;
  }
}

export const courseService = new CourseService();

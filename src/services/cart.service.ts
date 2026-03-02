import { AppError } from '../utils/AppError';
import CartItem from '../models/CartItem';
import Course from '../models/Course';
import PriceTier from '../models/PriceTier';

export class CartService {

  // ── Xem giỏ hàng (kèm thông tin course + giá) ─────────────────────────────
  async getCart(userId: string): Promise<{ items: CartItem[]; totalPrice: number }> {
    const items = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'thumbnailUrl', 'averageRating'],
          include: [{ model: PriceTier, as: 'priceTier', attributes: ['id', 'label', 'price'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Tính tổng giá
    const totalPrice = items.reduce((sum, item) => {
      const course = (item as any).course;
      const price = course?.priceTier?.price ?? 0;
      return sum + Number(price);
    }, 0);

    return { items, totalPrice };
  }

  // ── Thêm course vào giỏ ───────────────────────────────────────────────────
  async addToCart(userId: string, courseId: string): Promise<CartItem> {
    // Kiểm tra course tồn tại
    const course = await Course.findByPk(courseId);
    if (!course) throw new AppError('Course not found', 404);

    // Kiểm tra đã có trong giỏ chưa
    const existing = await CartItem.findOne({ where: { userId, courseId } });
    if (existing) throw new AppError('Course already in cart', 409);

    return CartItem.create({ userId, courseId });
  }

  // ── Xóa 1 course khỏi giỏ ─────────────────────────────────────────────────
  async removeFromCart(userId: string, courseId: string): Promise<void> {
    const item = await CartItem.findOne({ where: { userId, courseId } });
    if (!item) throw new AppError('Item not found in cart', 404);
    await item.destroy();
  }

  // ── Xóa toàn bộ giỏ hàng ──────────────────────────────────────────────────
  async clearCart(userId: string): Promise<void> {
    await CartItem.destroy({ where: { userId } });
  }

  // ── Đếm số lượng items ────────────────────────────────────────────────────
  async getCount(userId: string): Promise<number> {
    return CartItem.count({ where: { userId } });
  }
}

export const cartService = new CartService();

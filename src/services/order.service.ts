import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import Order, { OrderStatus } from '../models/Order';
import Course from '../models/Course';
import User from '../models/User';
import PriceTier from '../models/PriceTier';
import CartItem from '../models/CartItem';
import Coupon from '../models/Coupon';
import { notificationService } from './notification.service';

export interface CreateOrderDTO {
  userId: string;
  courseId: string;
  couponCode?: string;
  paymentMethod?: string;
}

export class OrderService {

  // ── Validate & tính discount từ coupon ─────────────────────────────────────
  private async applyCoupon(couponCode: string, courseId: string, price: number): Promise<{ discountAmount: number; coupon: Coupon }> {
    const coupon = await Coupon.findOne({ where: { code: couponCode } });
    if (!coupon) throw new AppError('Coupon not found', 404);
    if (!coupon.isActive) throw new AppError('Coupon is no longer active', 400);

    // Kiểm tra coupon có áp dụng cho course này không
    if (coupon.courseId !== courseId) {
      throw new AppError('This coupon is not valid for this course', 400);
    }

    // Kiểm tra thời gian
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) throw new AppError('Coupon has not started yet', 400);
    if (coupon.expiresAt && now > coupon.expiresAt) throw new AppError('Coupon has expired', 400);

    // Kiểm tra số lần sử dụng
    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    // Tính discount
    let discountAmount: number;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round(price * Number(coupon.discountValue) / 100);
    } else {
      // fixed
      discountAmount = Number(coupon.discountValue);
    }

    // Không giảm quá giá gốc
    discountAmount = Math.min(discountAmount, price);

    return { discountAmount, coupon };
  }

  // ── User: tạo order (mua 1 khóa học) ──────────────────────────────────────
  async create(dto: CreateOrderDTO): Promise<Order> {
    // Kiểm tra course tồn tại
    const course = await Course.findByPk(dto.courseId, {
      include: [{ model: PriceTier, as: 'priceTier' }],
    });
    if (!course) throw new AppError('Course not found', 404);

    // Kiểm tra đã mua chưa
    const existing = await Order.findOne({
      where: { userId: dto.userId, courseId: dto.courseId, status: { [Op.ne]: 'cancelled' } },
    });
    if (existing) throw new AppError('You have already purchased this course', 409);

    // Tính giá
    const price = Number((course as any).priceTier?.price ?? 0);

    // Áp dụng coupon nếu có
    let discountAmount = 0;
    if (dto.couponCode) {
      const result = await this.applyCoupon(dto.couponCode, dto.courseId, price);
      discountAmount = result.discountAmount;
    }

    const finalPrice = Math.max(0, price - discountAmount);

    const order = await Order.create({
      userId: dto.userId,
      courseId: dto.courseId,
      price,
      discountAmount,
      finalPrice,
      couponCode: dto.couponCode ?? null,
      paymentMethod: dto.paymentMethod ?? null,
    });

    // Notification → Admin
    notificationService.notifyAdmins('order_created', 'Đơn hàng mới', `User vừa đặt mua khóa học`, { orderId: order.id, courseId: dto.courseId }).catch(() => {});

    return order;
  }

  // ── Thanh toán thành công → complete order ─────────────────────────────────
  async completeOrder(orderId: string, paymentId?: string): Promise<Order> {
    const order = await Order.findByPk(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status === 'completed') throw new AppError('Order already completed', 400);
    if (order.status === 'cancelled') throw new AppError('Order was cancelled', 400);

    await order.update({
      status: 'completed',
      paymentId: paymentId ?? order.paymentId,
      completedAt: new Date(),
    });

    // Cập nhật purchased count trong course
    await Course.increment('purchased', { where: { id: order.courseId } });

    // Tăng usesCount của coupon
    if (order.couponCode) {
      await Coupon.increment('usesCount', { where: { code: order.couponCode } });
    }

    // Xóa khỏi giỏ hàng (nếu có)
    await CartItem.destroy({ where: { userId: order.userId, courseId: order.courseId } });

    // Notifications
    notificationService.create({ userId: order.userId, type: 'order_completed', title: 'Đơn hàng hoàn thành', message: 'Đơn hàng của bạn đã thanh toán thành công!', data: { orderId: order.id } }).catch(() => {});
    notificationService.notifyCourseInstructor(order.courseId, 'order_completed', 'Có người mua khóa học', 'Có học viên mới đăng ký khóa học của bạn!', { orderId: order.id }).catch(() => {});
    notificationService.notifyAdmins('order_completed', 'Đơn hàng hoàn thành', 'Đơn hàng đã thanh toán thành công', { orderId: order.id }).catch(() => {});

    return order;
  }

  // ── Hủy order ──────────────────────────────────────────────────────────────
  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await Order.findByPk(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('You can only cancel your own order', 403);
    if (order.status === 'completed') throw new AppError('Cannot cancel a completed order', 400);

    await order.update({ status: 'cancelled' });

    notificationService.create({ userId: order.userId, type: 'order_cancelled', title: 'Đơn hàng đã hủy', message: 'Đơn hàng của bạn đã được hủy', data: { orderId: order.id } }).catch(() => {});

    return order;
  }

  // ── Hoàn tiền ──────────────────────────────────────────────────────────────
  async refundOrder(orderId: string): Promise<Order> {
    const order = await Order.findByPk(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'completed') throw new AppError('Can only refund completed orders', 400);

    await order.update({ status: 'refunded' });

    // Giảm purchased count
    await Course.decrement('purchased', { where: { id: order.courseId } });

    // Giảm usesCount của coupon (trả lại lượt dùng)
    if (order.couponCode) {
      await Coupon.decrement('usesCount', { where: { code: order.couponCode } });
    }

    notificationService.create({ userId: order.userId, type: 'order_refunded', title: 'Đã hoàn tiền', message: 'Đơn hàng của bạn đã được hoàn tiền', data: { orderId: order.id } }).catch(() => {});
    notificationService.notifyAdmins('order_refunded', 'Hoàn tiền đơn hàng', 'Đơn hàng đã được hoàn tiền', { orderId: order.id }).catch(() => {});

    return order;
  }

  // ── User: xem lịch sử mua hàng ────────────────────────────────────────────
  async getMyOrders(userId: string): Promise<Order[]> {
    return Order.findAll({
      where: { userId },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // ── User: kiểm tra đã mua khóa học chưa ───────────────────────────────────
  async hasPurchased(userId: string, courseId: string): Promise<boolean> {
    const order = await Order.findOne({
      where: { userId, courseId, status: 'completed' },
    });
    return !!order;
  }

  // ── Admin: xem tất cả orders ──────────────────────────────────────────────
  async getAll(status?: OrderStatus): Promise<Order[]> {
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;

    return Order.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // ── Admin: xem chi tiết 1 order ───────────────────────────────────────────
  async getById(orderId: string): Promise<Order> {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] },
      ],
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  // ── Instructor: xem danh sách học viên đã mua khóa học ──────────────────────
  async getMyStudents(instructorId: string): Promise<any[]> {
    // Tìm tất cả khóa học của instructor
    const courses = await Course.findAll({
      where: { instructorId },
      attributes: ['id', 'name', 'thumbnailUrl'],
    });

    if (courses.length === 0) return [];

    const courseIds = courses.map(c => c.id);

    // Tìm tất cả orders completed cho các khóa học này
    const orders = await Order.findAll({
      where: { courseId: { [Op.in]: courseIds }, status: 'completed' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] },
        { model: Course, as: 'course', attributes: ['id', 'name', 'thumbnailUrl'] },
      ],
      order: [['completedAt', 'DESC']],
    });

    // Import dynamic để tránh circular dependency
    const LessonProgress = (await import('../models/LessonProgress')).default;
    const Certificate = (await import('../models/Certificate')).default;
    const Lesson = (await import('../models/Lesson')).default;

    // Cache lesson count per course để tránh query lặp
    const lessonCounts: Record<string, number> = {};
    for (const cid of courseIds) {
      lessonCounts[cid] = await Lesson.count({ where: { courseId: cid } });
    }

    // Tính progress + certificate cho mỗi order
    const result = await Promise.all(orders.map(async (o) => {
      const order = o.toJSON() as any;
      const totalLessons = lessonCounts[order.courseId] || 0;
      const completedLessons = await LessonProgress.count({
        where: { userId: order.userId, courseId: order.courseId },
      });
      const cert = await Certificate.findOne({
        where: { userId: order.userId, courseId: order.courseId },
        attributes: ['id', 'certificateCode', 'issueDate'],
      });

      return {
        ...order,
        totalLessons,
        completedLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        hasCertificate: !!cert,
        certificate: cert ? cert.toJSON() : null,
      };
    }));

    return result;
  }
}

export const orderService = new OrderService();

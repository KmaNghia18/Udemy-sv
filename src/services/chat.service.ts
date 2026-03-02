import { Op } from 'sequelize';
import { AppError } from '../utils/AppError';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import { Instructor } from '../models/Instructor';

export class ChatService {

  // ── Tạo hoặc lấy conversation ─────────────────────────────────────────────
  async getOrCreateConversation(userId: string, instructorId: string): Promise<Conversation> {
    const instructor = await Instructor.findByPk(instructorId);
    if (!instructor) throw new AppError('Instructor not found', 404);

    const [conv] = await Conversation.findOrCreate({
      where: { userId, instructorId },
      defaults: { userId, instructorId },
    });

    return conv;
  }

  // ── Lấy danh sách conversations của user ──────────────────────────────────
  async getConversations(userId: string, role: string): Promise<Conversation[]> {
    let where: any;

    if (role === 'instructor') {
      // Instructor: tìm theo instructorId (lấy từ bảng instructors)
      const instructor = await Instructor.findOne({ where: { userId } });
      if (!instructor) throw new AppError('Instructor not found', 404);
      where = { instructorId: instructor.id };
    } else {
      // Student: tìm theo userId
      where = { userId };
    }

    return Conversation.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] },
        {
          model: Instructor, as: 'instructor',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
        },
      ],
      order: [['lastMessageAt', 'DESC']],
    });
  }

  // ── Gửi tin nhắn ──────────────────────────────────────────────────────────
  async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' = 'text', imageUrl?: string): Promise<Message> {
    const conv = await Conversation.findByPk(conversationId);
    if (!conv) throw new AppError('Conversation not found', 404);

    const message = await Message.create({
      conversationId,
      senderId,
      type,
      content: content || null,
      imageUrl: imageUrl || null,
    });

    // Cập nhật last message
    const preview = type === 'image' ? '📷 Hình ảnh' : (content || '').substring(0, 200);
    await conv.update({
      lastMessage: preview,
      lastMessageAt: new Date(),
    });

    // Reload with sender info
    return Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] }],
    }) as Promise<Message>;
  }

  // ── Lấy tin nhắn của conversation (pagination) ────────────────────────────
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<{ messages: Message[]; total: number }> {
    const offset = (page - 1) * limit;

    const { rows: messages, count: total } = await Message.findAndCountAll({
      where: { conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] }],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });

    return { messages, total };
  }

  // ── Đánh dấu đã đọc tất cả tin trong conversation ────────────────────────
  async markAsRead(conversationId: string, userId: string): Promise<number> {
    const [count] = await Message.update(
      { isRead: true },
      { where: { conversationId, senderId: { [Op.ne]: userId }, isRead: false } }
    );
    return count;
  }

  // ── Đếm tin chưa đọc ─────────────────────────────────────────────────────
  async getUnreadCount(userId: string, role: string): Promise<number> {
    let conversationIds: string[];

    if (role === 'instructor') {
      const instructor = await Instructor.findOne({ where: { userId } });
      if (!instructor) return 0;
      const convs = await Conversation.findAll({
        where: { instructorId: instructor.id },
        attributes: ['id'],
      });
      conversationIds = convs.map(c => c.id);
    } else {
      const convs = await Conversation.findAll({
        where: { userId },
        attributes: ['id'],
      });
      conversationIds = convs.map(c => c.id);
    }

    if (conversationIds.length === 0) return 0;

    return Message.count({
      where: {
        conversationId: { [Op.in]: conversationIds },
        senderId: { [Op.ne]: userId },
        isRead: false,
      },
    });
  }
}

export const chatService = new ChatService();

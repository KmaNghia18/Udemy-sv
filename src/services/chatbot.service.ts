import Groq from 'groq-sdk';
import ChatbotMessage from '../models/ChatbotMessage';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của hệ thống LMS (Learning Management System) — một nền tảng học trực tuyến.

Vai trò của bạn:
- Hỗ trợ học viên trả lời câu hỏi về lập trình, công nghệ, và các chủ đề học tập
- Giải thích khái niệm một cách dễ hiểu, có ví dụ minh họa
- Gợi ý phương pháp học tập hiệu quả
- Trả lời câu hỏi về cách sử dụng nền tảng LMS

Quy tắc:
- Trả lời bằng tiếng Việt (trừ khi user hỏi bằng tiếng Anh)
- Giữ câu trả lời ngắn gọn, rõ ràng (tối đa 500 từ)
- Dùng markdown format khi cần (bold, code block, list)
- Thân thiện, nhiệt tình như một gia sư tận tâm
- Nếu không biết, hãy nói thẳng và gợi ý hỏi giảng viên`;

export class ChatbotService {
  // ── Gửi tin nhắn và nhận phản hồi AI ──────────────────────────────────
  async chat(userId: string, message: string): Promise<{ userMsg: ChatbotMessage; aiMsg: ChatbotMessage }> {
    // Lưu tin nhắn user
    const userMsg = await ChatbotMessage.create({ userId, role: 'user', content: message });

    // Lấy 10 tin gần nhất làm context
    const history = await ChatbotMessage.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    history.reverse();

    // Build messages cho Groq
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Gọi Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiContent = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    // Lưu phản hồi AI
    const aiMsg = await ChatbotMessage.create({ userId, role: 'assistant', content: aiContent });

    return { userMsg, aiMsg };
  }

  // ── Lấy lịch sử chat ──────────────────────────────────────────────────
  async getHistory(userId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const { rows: messages, count: total } = await ChatbotMessage.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });
    return { messages, total };
  }

  // ── Xóa lịch sử ──────────────────────────────────────────────────────
  async clearHistory(userId: string) {
    const count = await ChatbotMessage.destroy({ where: { userId } });
    return count;
  }
}

export const chatbotService = new ChatbotService();

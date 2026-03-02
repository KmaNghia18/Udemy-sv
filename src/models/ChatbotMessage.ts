import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ChatbotMessageAttributes {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatbotMessageCreation extends Optional<ChatbotMessageAttributes, 'id'> {}

export class ChatbotMessage
  extends Model<ChatbotMessageAttributes, ChatbotMessageCreation>
  implements ChatbotMessageAttributes
{
  public id!: string;
  public userId!: string;
  public role!: 'user' | 'assistant';
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatbotMessage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'chatbot_messages',
    timestamps: true,
    underscored: true,
  }
);

export default ChatbotMessage;

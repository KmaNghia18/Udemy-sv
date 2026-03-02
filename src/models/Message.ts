import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Conversation from './Conversation';

export type MessageType = 'text' | 'image';

export interface MessageAttributes {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageCreationAttributes
  extends Optional<MessageAttributes, 'id' | 'type' | 'imageUrl' | 'isRead'> {}

export class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  public id!: string;
  public conversationId!: string;
  public senderId!: string;
  public type!: MessageType;
  public content!: string | null;
  public imageUrl!: string | null;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversationId: { type: DataTypes.UUID, allowNull: false },
    senderId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('text', 'image'), allowNull: false, defaultValue: 'text' },
    content: { type: DataTypes.TEXT, allowNull: true },
    imageUrl: { type: DataTypes.STRING(500), allowNull: true },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    underscored: true,
  }
);

Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });

export default Message;

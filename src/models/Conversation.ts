import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import { Instructor } from './Instructor';

export interface ConversationAttributes {
  id: string;
  userId: string;
  instructorId: string;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, 'id' | 'lastMessage' | 'lastMessageAt'> {}

export class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes
{
  public id!: string;
  public userId!: string;
  public instructorId!: string;
  public lastMessage!: string | null;
  public lastMessageAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    instructorId: { type: DataTypes.UUID, allowNull: false },
    lastMessage: { type: DataTypes.TEXT, allowNull: true },
    lastMessageAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'instructor_id'], name: 'unique_user_instructor_conversation' },
    ],
  }
);

Conversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Conversation.belongsTo(Instructor, { foreignKey: 'instructorId', as: 'instructor' });
User.hasMany(Conversation, { foreignKey: 'userId', as: 'conversations' });
Instructor.hasMany(Conversation, { foreignKey: 'instructorId', as: 'conversations' });

export default Conversation;

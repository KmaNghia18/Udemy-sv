import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Lesson from './Lesson';

export interface LessonDiscussionAttributes {
  id: string;
  lessonId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonDiscussionCreationAttributes
  extends Optional<LessonDiscussionAttributes, 'id' | 'parentId'> {}

export class LessonDiscussion
  extends Model<LessonDiscussionAttributes, LessonDiscussionCreationAttributes>
  implements LessonDiscussionAttributes
{
  public id!: string;
  public lessonId!: string;
  public userId!: string;
  public parentId!: string | null;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual field for nested replies
  public replies?: LessonDiscussion[];
}

LessonDiscussion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    parentId: { type: DataTypes.UUID, allowNull: true, defaultValue: null },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'lesson_discussions',
    timestamps: true,
    underscored: true,
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
LessonDiscussion.belongsTo(User, { foreignKey: 'userId', as: 'author' });
LessonDiscussion.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// Self-referencing: cây comment
LessonDiscussion.belongsTo(LessonDiscussion, { foreignKey: 'parentId', as: 'parent' });
LessonDiscussion.hasMany(LessonDiscussion, { foreignKey: 'parentId', as: 'replies' });

export default LessonDiscussion;

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Lesson from './Lesson';
import Course from './Course';

export interface LessonProgressAttributes {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonProgressCreationAttributes
  extends Optional<LessonProgressAttributes, 'id' | 'completedAt'> {}

export class LessonProgress
  extends Model<LessonProgressAttributes, LessonProgressCreationAttributes>
  implements LessonProgressAttributes
{
  public id!: string;
  public userId!: string;
  public lessonId!: string;
  public courseId!: string;
  public completedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LessonProgress.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    completedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'lesson_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'lesson_id'], name: 'unique_user_lesson_progress' },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
LessonProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });
LessonProgress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(LessonProgress, { foreignKey: 'userId', as: 'lessonProgress' });
Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId', as: 'progress' });
Course.hasMany(LessonProgress, { foreignKey: 'courseId', as: 'lessonProgress' });

export default LessonProgress;

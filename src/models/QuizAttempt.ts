import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Lesson from './Lesson';

export interface QuizAttemptAttributes {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  createdAt?: Date;
}

export interface QuizAttemptCreationAttributes
  extends Optional<QuizAttemptAttributes, 'id' | 'completedAt'> {}

export class QuizAttempt
  extends Model<QuizAttemptAttributes, QuizAttemptCreationAttributes>
  implements QuizAttemptAttributes
{
  public id!: string;
  public userId!: string;
  public lessonId!: string;
  public score!: number;
  public totalQuestions!: number;
  public completedAt!: Date;
  public readonly createdAt!: Date;
}

QuizAttempt.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalQuestions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    completedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'quiz_attempts',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  }
);

QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });
QuizAttempt.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

export default QuizAttempt;

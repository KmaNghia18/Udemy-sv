import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Lesson from './Lesson';

export type QuestionType = 'text' | 'text_image';

export interface QuizQuestionAttributes {
  id: string;
  lessonId: string;
  questionType: QuestionType;
  question: string;
  imageUrl: string | null;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizQuestionCreationAttributes
  extends Optional<QuizQuestionAttributes, 'id' | 'imageUrl' | 'orderIndex'> {}

export class QuizQuestion
  extends Model<QuizQuestionAttributes, QuizQuestionCreationAttributes>
  implements QuizQuestionAttributes
{
  public id!: string;
  public lessonId!: string;
  public questionType!: QuestionType;
  public question!: string;
  public imageUrl!: string | null;
  public orderIndex!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QuizQuestion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    questionType: { type: DataTypes.ENUM('text', 'text_image'), allowNull: false, defaultValue: 'text' },
    question: { type: DataTypes.TEXT, allowNull: false },
    imageUrl: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'quiz_questions',
    timestamps: true,
    underscored: true,
  }
);

QuizQuestion.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

export default QuizQuestion;

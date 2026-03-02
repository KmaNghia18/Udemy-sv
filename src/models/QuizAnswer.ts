import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import QuizQuestion from './QuizQuestion';

export interface QuizAnswerAttributes {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizAnswerCreationAttributes
  extends Optional<QuizAnswerAttributes, 'id' | 'isCorrect' | 'orderIndex'> {}

export class QuizAnswer
  extends Model<QuizAnswerAttributes, QuizAnswerCreationAttributes>
  implements QuizAnswerAttributes
{
  public id!: string;
  public questionId!: string;
  public content!: string;
  public isCorrect!: boolean;
  public orderIndex!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QuizAnswer.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    questionId: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'quiz_answers',
    timestamps: true,
    underscored: true,
  }
);

QuizAnswer.belongsTo(QuizQuestion, { foreignKey: 'questionId', as: 'question' });
QuizQuestion.hasMany(QuizAnswer, { foreignKey: 'questionId', as: 'answers' });

export default QuizAnswer;

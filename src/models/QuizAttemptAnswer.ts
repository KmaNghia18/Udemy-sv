import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import QuizAttempt from './QuizAttempt';
import QuizQuestion from './QuizQuestion';
import QuizAnswer from './QuizAnswer';

export interface QuizAttemptAnswerAttributes {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
}

export interface QuizAttemptAnswerCreationAttributes
  extends Optional<QuizAttemptAnswerAttributes, 'id'> {}

export class QuizAttemptAnswer
  extends Model<QuizAttemptAnswerAttributes, QuizAttemptAnswerCreationAttributes>
  implements QuizAttemptAnswerAttributes
{
  public id!: string;
  public attemptId!: string;
  public questionId!: string;
  public selectedAnswerId!: string;
  public isCorrect!: boolean;
}

QuizAttemptAnswer.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    attemptId: { type: DataTypes.UUID, allowNull: false },
    questionId: { type: DataTypes.UUID, allowNull: false },
    selectedAnswerId: { type: DataTypes.UUID, allowNull: false },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    tableName: 'quiz_attempt_answers',
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ['attempt_id', 'question_id'], name: 'unique_attempt_question' },
    ],
  }
);

QuizAttemptAnswer.belongsTo(QuizAttempt, { foreignKey: 'attemptId', as: 'attempt' });
QuizAttempt.hasMany(QuizAttemptAnswer, { foreignKey: 'attemptId', as: 'answers' });

QuizAttemptAnswer.belongsTo(QuizQuestion, { foreignKey: 'questionId', as: 'question' });
QuizAttemptAnswer.belongsTo(QuizAnswer, { foreignKey: 'selectedAnswerId', as: 'selectedAnswer' });

export default QuizAttemptAnswer;

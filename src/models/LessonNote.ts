import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LessonNoteAttributes {
  id: number;
  userId: string;
  lessonId: string;
  content: string;
  timestamp: number | null;   // giây trong video
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonNoteCreationAttributes
  extends Optional<LessonNoteAttributes, 'id' | 'timestamp'> {}

export class LessonNote
  extends Model<LessonNoteAttributes, LessonNoteCreationAttributes>
  implements LessonNoteAttributes
{
  public id!: number;
  public userId!: string;
  public lessonId!: string;
  public content!: string;
  public timestamp!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LessonNote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'lesson_notes',
    timestamps: true,
    underscored: true,
  }
);

export default LessonNote;

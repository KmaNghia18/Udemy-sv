import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Lesson from './Lesson';

export interface LessonMaterialAttributes {
  id: number;
  lessonId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonMaterialCreationAttributes
  extends Optional<LessonMaterialAttributes, 'id' | 'fileSize'> {}

export class LessonMaterial
  extends Model<LessonMaterialAttributes, LessonMaterialCreationAttributes>
  implements LessonMaterialAttributes
{
  public id!: number;
  public lessonId!: string;
  public title!: string;
  public fileUrl!: string;
  public fileType!: string;
  public fileSize!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LessonMaterial.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    fileUrl: { type: DataTypes.TEXT, allowNull: false },
    fileType: { type: DataTypes.STRING(20), allowNull: false },
    fileSize: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'lesson_materials',
    timestamps: true,
    underscored: true,
  }
);

// ─── Associations ──────────────────────────────────────────────────────────────
Lesson.hasMany(LessonMaterial, { foreignKey: 'lessonId', as: 'materials', onDelete: 'CASCADE' });
LessonMaterial.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

export default LessonMaterial;

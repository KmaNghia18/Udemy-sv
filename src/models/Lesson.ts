import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Course from './Course';

export interface LessonAttributes {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  videoSection: string | null;
  videoLength: number | null;   // giây
  isFreePreview: boolean;
  orderIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonCreationAttributes
  extends Optional<
    LessonAttributes,
    'id' | 'description' | 'videoUrl' | 'videoSection' | 'videoLength' | 'isFreePreview' | 'orderIndex'
  > {}

export class Lesson
  extends Model<LessonAttributes, LessonCreationAttributes>
  implements LessonAttributes
{
  public id!: string;
  public courseId!: string;
  public title!: string;
  public description!: string | null;
  public videoUrl!: string | null;
  public videoSection!: string | null;
  public videoLength!: number | null;
  public isFreePreview!: boolean;
  public orderIndex!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lesson.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    courseId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    videoUrl: { type: DataTypes.TEXT, allowNull: true },
    videoSection: { type: DataTypes.STRING(255), allowNull: true },
    videoLength: { type: DataTypes.INTEGER, allowNull: true },
    isFreePreview: { type: DataTypes.BOOLEAN, defaultValue: false },
    orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'lessons',
    timestamps: true,
    underscored: true,
  }
);

// ─── Associations ──────────────────────────────────────────────────────────────
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export default Lesson;

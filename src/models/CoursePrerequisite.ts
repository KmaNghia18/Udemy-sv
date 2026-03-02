import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CoursePrerequisiteAttributes {
  id: number;
  courseId: string;
  prerequisite: string;
  displayOrder: number;
}

export interface CoursePrerequisiteCreationAttributes
  extends Optional<CoursePrerequisiteAttributes, 'id' | 'displayOrder'> {}

export class CoursePrerequisite
  extends Model<CoursePrerequisiteAttributes, CoursePrerequisiteCreationAttributes>
  implements CoursePrerequisiteAttributes
{
  public id!: number;
  public courseId!: string;
  public prerequisite!: string;
  public displayOrder!: number;
}

CoursePrerequisite.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.UUID, allowNull: false },
    prerequisite: { type: DataTypes.STRING(500), allowNull: false },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'course_prerequisites',
    timestamps: true,
    underscored: true,
  }
);

export default CoursePrerequisite;

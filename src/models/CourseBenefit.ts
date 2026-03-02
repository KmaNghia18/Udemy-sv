import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CourseBenefitAttributes {
  id: number;
  courseId: string;
  benefit: string;
  displayOrder: number;
}

export interface CourseBenefitCreationAttributes
  extends Optional<CourseBenefitAttributes, 'id' | 'displayOrder'> {}

export class CourseBenefit
  extends Model<CourseBenefitAttributes, CourseBenefitCreationAttributes>
  implements CourseBenefitAttributes
{
  public id!: number;
  public courseId!: string;
  public benefit!: string;
  public displayOrder!: number;
}

CourseBenefit.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.UUID, allowNull: false },
    benefit: { type: DataTypes.STRING(500), allowNull: false },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'course_benefits',
    timestamps: true,
    underscored: true,
  }
);

export default CourseBenefit;

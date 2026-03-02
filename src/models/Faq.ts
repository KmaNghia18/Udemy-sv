import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FaqAttributes {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FaqCreationAttributes
  extends Optional<FaqAttributes, 'id' | 'category' | 'isActive'> {}

export class Faq
  extends Model<FaqAttributes, FaqCreationAttributes>
  implements FaqAttributes
{
  public id!: number;
  public question!: string;
  public answer!: string;
  public category!: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Faq.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.STRING(500), allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'faqs',
    timestamps: true,
    underscored: true,
  }
);

export default Faq;

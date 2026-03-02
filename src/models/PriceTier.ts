import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PriceTierAttributes {
  id: number;
  label: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
}

export interface PriceTierCreationAttributes
  extends Optional<PriceTierAttributes, 'id' | 'isActive' | 'sortOrder'> {}

export class PriceTier
  extends Model<PriceTierAttributes, PriceTierCreationAttributes>
  implements PriceTierAttributes
{
  public id!: number;
  public label!: string;
  public price!: number;
  public isActive!: boolean;
  public sortOrder!: number;
}

PriceTier.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    label: { type: DataTypes.STRING(50), allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 0), allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    tableName: 'price_tiers',
    timestamps: true,
    underscored: true,
  }
);

export default PriceTier;

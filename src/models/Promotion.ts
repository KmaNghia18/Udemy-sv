import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PromotionScope = 'all' | 'specific_tiers' | 'specific_categories';

export interface PromotionAttributes {
  id: number;
  name: string;
  description: string | null;
  discountPercent: number;
  scope: PromotionScope;
  scopeIds: string | null;      // JSON array
  minPriceTierId: number | null;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromotionCreationAttributes
  extends Optional<PromotionAttributes, 'id' | 'description' | 'scope' | 'scopeIds' | 'minPriceTierId' | 'isActive'> {}

export class Promotion
  extends Model<PromotionAttributes, PromotionCreationAttributes>
  implements PromotionAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public discountPercent!: number;
  public scope!: PromotionScope;
  public scopeIds!: string | null;
  public minPriceTierId!: number | null;
  public startsAt!: Date;
  public endsAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Promotion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    discountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    scope: {
      type: DataTypes.ENUM('all', 'specific_tiers', 'specific_categories'),
      defaultValue: 'all',
    },
    scopeIds: { type: DataTypes.TEXT, allowNull: true },
    minPriceTierId: { type: DataTypes.INTEGER, allowNull: true },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: { type: DataTypes.DATE, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
  }
);

export default Promotion;

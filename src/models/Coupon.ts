import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Course from './Course';

export type DiscountType = 'percent' | 'fixed';

export interface CouponAttributes {
  id: number;
  code: string;
  courseId: string;
  createdBy: string;          // userId của instructor
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  usesCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CouponCreationAttributes
  extends Optional<CouponAttributes, 'id' | 'usesCount' | 'maxUses' | 'startsAt' | 'expiresAt' | 'isActive'> {}

export class Coupon
  extends Model<CouponAttributes, CouponCreationAttributes>
  implements CouponAttributes
{
  public id!: number;
  public code!: string;
  public courseId!: string;
  public createdBy!: string;
  public discountType!: DiscountType;
  public discountValue!: number;
  public maxUses!: number | null;
  public usesCount!: number;
  public startsAt!: Date | null;
  public expiresAt!: Date | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Coupon.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    courseId: { type: DataTypes.UUID, allowNull: false },
    createdBy: { type: DataTypes.UUID, allowNull: false },
    discountType: { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false, defaultValue: 'percent' },
    discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    maxUses: { type: DataTypes.INTEGER, allowNull: true },
    usesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    startsAt: { type: DataTypes.DATE, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
  }
);

// ─── Associations ─────────────────────────────────────────────────────────
Coupon.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Coupon.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export default Coupon;

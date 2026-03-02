import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export type WishlistTargetType = 'course' | 'lesson';

export interface WishlistAttributes {
  id: number;
  userId: string;
  targetType: WishlistTargetType;
  targetId: string;
  createdAt?: Date;
}

export interface WishlistCreationAttributes {
  userId: string;
  targetType: WishlistTargetType;
  targetId: string;
}

export class Wishlist
  extends Model<WishlistAttributes, WishlistCreationAttributes>
  implements WishlistAttributes
{
  public id!: number;
  public userId!: string;
  public targetType!: WishlistTargetType;
  public targetId!: string;
  public readonly createdAt!: Date;
}

Wishlist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    targetType: { type: DataTypes.ENUM('course', 'lesson'), allowNull: false },
    targetId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    tableName: 'wishlists',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'target_type', 'target_id'], name: 'unique_user_wishlist_target' },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlists' });

export default Wishlist;

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Course from './Course';

export interface CartItemAttributes {
  id: number;
  userId: string;
  courseId: string;
  createdAt?: Date;
}

export interface CartItemCreationAttributes {
  userId: string;
  courseId: string;
}

export class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  public id!: number;
  public userId!: string;
  public courseId!: string;
  public readonly createdAt!: Date;
}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    tableName: 'cart_items',
    timestamps: true,
    updatedAt: false,       // giỏ hàng không cần updatedAt
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'course_id'],
        name: 'unique_user_cart_course',
      },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CartItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });

export default CartItem;

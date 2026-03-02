import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Course from './Course';

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface OrderAttributes {
  id: string;
  userId: string;
  courseId: string;
  price: number;            // giá gốc
  discountAmount: number;   // số tiền giảm
  finalPrice: number;       // thực trả
  couponCode: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  status: OrderStatus;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes
  extends Optional<OrderAttributes, 'id' | 'discountAmount' | 'couponCode' | 'paymentMethod' | 'paymentId' | 'status' | 'completedAt'> {}

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public price!: number;
  public discountAmount!: number;
  public finalPrice!: number;
  public couponCode!: string | null;
  public paymentMethod!: string | null;
  public paymentId!: string | null;
  public status!: OrderStatus;
  public completedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discountAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    finalPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    couponCode: { type: DataTypes.STRING(50), allowNull: true },
    paymentMethod: { type: DataTypes.STRING(30), allowNull: true },
    paymentId: { type: DataTypes.STRING(255), allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
    },
    completedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'course_id'], name: 'unique_user_course_order' },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Course.hasMany(Order, { foreignKey: 'courseId', as: 'orders' });

export default Order;

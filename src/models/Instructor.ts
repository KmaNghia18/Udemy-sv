import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface InstructorAttributes {
  id: string;
  userId: string;
  bio: string | null;
  experience: number;
  averageRating: number;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InstructorCreationAttributes
  extends Optional<InstructorAttributes, 'id' | 'bio' | 'experience' | 'averageRating' | 'approved'> {}

// ─── Model ────────────────────────────────────────────────────────────────────
export class Instructor
  extends Model<InstructorAttributes, InstructorCreationAttributes>
  implements InstructorAttributes
{
  public id!: string;
  public userId!: string;
  public bio!: string | null;
  public experience!: number;
  public averageRating!: number;
  public approved!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Instructor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'instructors',
    timestamps: true,
    underscored: true, // tự map userId → user_id, averageRating → average_rating
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
Instructor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Instructor, { foreignKey: 'userId', as: 'instructor' });

export default Instructor;

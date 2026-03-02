import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import { Instructor } from './Instructor';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface InstructorReviewAttributes {
  id: string;
  userId: string;
  instructorId: string;
  rating: number;       // 1-5
  comment: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InstructorReviewCreationAttributes
  extends Optional<InstructorReviewAttributes, 'id' | 'comment'> {}

// ─── Model ────────────────────────────────────────────────────────────────────
export class InstructorReview
  extends Model<InstructorReviewAttributes, InstructorReviewCreationAttributes>
  implements InstructorReviewAttributes
{
  public id!: string;
  public userId!: string;
  public instructorId!: string;
  public rating!: number;
  public comment!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InstructorReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    instructorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'instructor_reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'instructor_id'],
        name: 'unique_user_instructor_review',
      },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
// Review thuộc về User (người review)
InstructorReview.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });
User.hasMany(InstructorReview, { foreignKey: 'userId', as: 'reviews' });

// Review thuộc về Instructor (người được review)
InstructorReview.belongsTo(Instructor, { foreignKey: 'instructorId', as: 'instructor' });
Instructor.hasMany(InstructorReview, { foreignKey: 'instructorId', as: 'reviews' });

export default InstructorReview;

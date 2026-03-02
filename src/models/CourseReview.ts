import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Course from './Course';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface CourseReviewAttributes {
  id: string;
  userId: string;
  courseId: string;
  rating: number;       // 1-5
  comment: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseReviewCreationAttributes
  extends Optional<CourseReviewAttributes, 'id' | 'comment'> {}

// ─── Model ────────────────────────────────────────────────────────────────────
export class CourseReview
  extends Model<CourseReviewAttributes, CourseReviewCreationAttributes>
  implements CourseReviewAttributes
{
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public rating!: number;
  public comment!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CourseReview.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: 'course_reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'course_id'],
        name: 'unique_user_course_review',
      },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
CourseReview.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });
User.hasMany(CourseReview, { foreignKey: 'userId', as: 'courseReviews' });

CourseReview.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Course.hasMany(CourseReview, { foreignKey: 'courseId', as: 'reviews' });

export default CourseReview;

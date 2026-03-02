import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import InstructorReview from './InstructorReview';
import CourseReview from './CourseReview';
import { Instructor } from './Instructor';

export type ReviewType = 'instructor' | 'course';

export interface ReviewReplyAttributes {
  id: string;
  reviewType: ReviewType;
  reviewId: string;
  instructorId: string;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReviewReplyCreationAttributes
  extends Optional<ReviewReplyAttributes, 'id'> {}

export class ReviewReply
  extends Model<ReviewReplyAttributes, ReviewReplyCreationAttributes>
  implements ReviewReplyAttributes
{
  public id!: string;
  public reviewType!: ReviewType;
  public reviewId!: string;
  public instructorId!: string;
  public comment!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ReviewReply.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reviewType: { type: DataTypes.ENUM('instructor', 'course'), allowNull: false },
    reviewId: { type: DataTypes.UUID, allowNull: false },
    instructorId: { type: DataTypes.UUID, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'review_replies',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['review_type', 'review_id', 'instructor_id'], name: 'unique_reply_per_review' },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
// Instructor review → reply
ReviewReply.belongsTo(InstructorReview, { foreignKey: 'reviewId', as: 'instructorReview', constraints: false });
InstructorReview.hasOne(ReviewReply, { foreignKey: 'reviewId', as: 'reply', constraints: false, scope: { reviewType: 'instructor' } });

// Course review → reply
ReviewReply.belongsTo(CourseReview, { foreignKey: 'reviewId', as: 'courseReview', constraints: false });
CourseReview.hasOne(ReviewReply, { foreignKey: 'reviewId', as: 'reply', constraints: false, scope: { reviewType: 'course' } });

ReviewReply.belongsTo(Instructor, { foreignKey: 'instructorId', as: 'instructor' });

export default ReviewReply;

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Instructor } from './Instructor';
import Category from './Category';
import CourseBenefit from './CourseBenefit';
import CoursePrerequisite from './CoursePrerequisite';
import PriceTier from './PriceTier';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export type CourseStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'locked';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseAttributes {
  id: string;
  instructorId: string | null;
  name: string;
  description: string;
  tags: string | null;
  level: CourseLevel | null;
  price: number;
  priceTierId: number | null;   // FK → price_tiers.id
  estimatedPrice: number | null;
  isFree: boolean;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  averageRating: number;
  totalReviews: number;
  purchased: number;
  status: CourseStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseCreationAttributes
  extends Optional<
    CourseAttributes,
    | 'id'
    | 'instructorId'
    | 'tags'
    | 'level'
    | 'priceTierId'
    | 'estimatedPrice'
    | 'isFree'
    | 'thumbnailUrl'
    | 'demoUrl'
    | 'averageRating'
    | 'totalReviews'
    | 'purchased'
    | 'status'
  > {}

// ─── Model ────────────────────────────────────────────────────────────────────
export class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  public id!: string;
  public instructorId!: string | null;
  public name!: string;
  public description!: string;
  public tags!: string | null;
  public level!: CourseLevel | null;
  public price!: number;
  public priceTierId!: number | null;
  public estimatedPrice!: number | null;
  public isFree!: boolean;
  public thumbnailUrl!: string | null;
  public demoUrl!: string | null;
  public averageRating!: number;
  public totalReviews!: number;
  public purchased!: number;
  public status!: CourseStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Course.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    instructorId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    tags: { type: DataTypes.TEXT, allowNull: true },
    level: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), allowNull: true },
    price: { type: DataTypes.DECIMAL(12, 0), allowNull: false, defaultValue: 0 },
    priceTierId: { type: DataTypes.INTEGER, allowNull: true },
    estimatedPrice: { type: DataTypes.DECIMAL(12, 0), allowNull: true },
    isFree: { type: DataTypes.BOOLEAN, defaultValue: false },
    thumbnailUrl: { type: DataTypes.TEXT, allowNull: true },
    demoUrl: { type: DataTypes.TEXT, allowNull: true },
    averageRating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    purchased: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'rejected', 'locked'),
      defaultValue: 'draft',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true,
    underscored: true,
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
Course.belongsTo(Instructor, { foreignKey: 'instructorId', as: 'instructor' });
Instructor.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });

// Many-to-many with Category via course_categories junction table
Course.belongsToMany(Category, { through: 'course_categories', foreignKey: 'courseId', otherKey: 'categoryId', as: 'categories' });
Category.belongsToMany(Course, { through: 'course_categories', foreignKey: 'categoryId', otherKey: 'courseId', as: 'courses' });

// One-to-many: benefits & prerequisites
Course.hasMany(CourseBenefit, { foreignKey: 'courseId', as: 'benefits', onDelete: 'CASCADE' });
CourseBenefit.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(CoursePrerequisite, { foreignKey: 'courseId', as: 'prerequisites', onDelete: 'CASCADE' });
CoursePrerequisite.belongsTo(Course, { foreignKey: 'courseId' });

// BelongsTo PriceTier
Course.belongsTo(PriceTier, { foreignKey: 'priceTierId', as: 'priceTier' });
PriceTier.hasMany(Course, { foreignKey: 'priceTierId', as: 'courses' });

export default Course;

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Course from './Course';

export interface CertificateAttributes {
  id: string;
  userId: string;
  courseId: string;
  certificateCode: string;
  userNameAtIssue: string;
  courseNameAtIssue: string;
  mentorNameAtIssue: string;
  issueDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CertificateCreationAttributes
  extends Optional<CertificateAttributes, 'id' | 'issueDate'> {}

export class Certificate
  extends Model<CertificateAttributes, CertificateCreationAttributes>
  implements CertificateAttributes
{
  public id!: string;
  public userId!: string;
  public courseId!: string;
  public certificateCode!: string;
  public userNameAtIssue!: string;
  public courseNameAtIssue!: string;
  public mentorNameAtIssue!: string;
  public issueDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Certificate.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    certificateCode: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    userNameAtIssue: { type: DataTypes.STRING, allowNull: false },
    courseNameAtIssue: { type: DataTypes.STRING, allowNull: false },
    mentorNameAtIssue: { type: DataTypes.STRING, allowNull: false },
    issueDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'certificates',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'course_id'], name: 'unique_user_course_certificate' },
    ],
  }
);

// ─── Associations ─────────────────────────────────────────────────────────────
Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Certificate.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(Certificate, { foreignKey: 'userId', as: 'certificates' });
Course.hasMany(Certificate, { foreignKey: 'courseId', as: 'certificates' });

export default Certificate;

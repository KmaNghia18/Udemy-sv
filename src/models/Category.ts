import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface CategoryAttributes {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  // Virtual (populated by associations)
  children?: Category[];
  parent?: Category;
}

export interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, 'id' | 'parentId' | 'description' | 'iconUrl'> {}

// ─── Model ────────────────────────────────────────────────────────────────────
export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: string;
  public parentId!: string | null;
  public name!: string;
  public slug!: string;
  public description!: string | null;
  public iconUrl!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public children?: Category[];
  public parent?: Category;
}

Category.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    parentId: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    iconUrl: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    underscored: true,
  }
);

// ─── Self-referencing Associations (hierarchy) ────────────────────────────────
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

export default Category;

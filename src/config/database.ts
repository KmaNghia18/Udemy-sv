import { Sequelize } from 'sequelize';
import logger from '../utils/logger';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'lms_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Nghia@182002',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 30,
    min: Number(process.env.DB_POOL_MIN) || 2,
    acquire: 60000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');
    logger.info('💡 Run "npm run db:migrate" to apply pending migrations');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDatabase, sequelize } from './config/database';
import logger from './utils/logger';
import { initSocketIO } from './socket/chatSocket';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    const server = http.createServer(app);
    initSocketIO(server);

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n⚡ ${signal} received. Shutting down gracefully...`);

      // 1. Ngừng nhận request mới
      server.close(() => {
        logger.info('🔒 HTTP server closed');
      });

      // 2. Đóng DB connection pool
      try {
        await sequelize.close();
        logger.info('🗄️  Database connections closed');
      } catch (err) {
        logger.error('Error closing database:', err);
      }

      // 3. Thoát process
      logger.info('👋 Server shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = {
  apps: [
    {
      name: 'lms-server',
      script: 'dist/index.js',
      instances: 'max',        // Tạo 1 process cho mỗi CPU core
      exec_mode: 'cluster',    // Cluster mode — chia request giữa các process
      
      // ─── Environment ────────────────────────────────────────────────
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // ─── Performance ────────────────────────────────────────────────
      max_memory_restart: '500M',  // Restart nếu dùng quá 500MB RAM
      node_args: '--max-old-space-size=512',

      // ─── Logging ────────────────────────────────────────────────────
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,

      // ─── Restart Policy ─────────────────────────────────────────────
      exp_backoff_restart_delay: 100, // Tăng delay giữa các lần restart
      max_restarts: 10,               // Max restart trong 15 phút
      min_uptime: '10s',              // Process phải chạy ít nhất 10s mới tính stable

      // ─── Graceful Shutdown ──────────────────────────────────────────
      kill_timeout: 5000,             // Chờ 5s để graceful shutdown
      listen_timeout: 10000,          // Chờ 10s cho process sẵn sàng
      shutdown_with_message: true,
    },
  ],
};

module.exports = {
  apps: [
    {
      // Application configuration
      name: 'qr-promotion-system',
      script: 'server.js',
      
      // Process management
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3008
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3008
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3008
      },
      
      // Restart policies
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging configuration
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced PM2 features
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Source map support for better error tracking
      source_map_support: true,
      
      // Process monitoring
      pmx: true,
      
      // Additional configuration
      cwd: './',
      ignore_watch: [
        'node_modules',
        'logs',
        '*.db',
        '.git'
      ],
      
      // Health check
      health_check_grace_period: 3000,
      
      // Cluster mode settings (if needed in future)
      // instances: 'max',
      // exec_mode: 'cluster',
      
      // Custom environment variables for the application
      env_vars: {
        SESSION_SECRET: 'qr-promotion-system-secret-key-2024',
        DB_PATH: './promotion_codes.db'
      }
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:repo.git',
      path: '/var/www/qr-promotion-system',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

/**
 * MPLP v1.0 统一配置管理
 * 
 * @compliance .cursor/rules/security-requirements.mdc - 敏感配置管理
 * @compliance .cursor/rules/integration-patterns.mdc - TracePilot配置
 */

import { config as dotenvConfig } from 'dotenv';
import { tracePilotConfig } from './tracepilot';

// 加载环境变量
dotenvConfig();

export const config = {
  app: {
    name: 'MPLP',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'mplp',
    username: process.env.DB_USERNAME || 'mplp',
    password: process.env.DB_PASSWORD || 'password',
    synchronize: process.env.NODE_ENV === 'development'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD
  },
  
  // TracePilot配置（简化版本，兼容适配器）
  tracepilot: {
    apiUrl: tracePilotConfig.connection.apiUrl,
    apiKey: tracePilotConfig.connection.apiKey,
    timeout: tracePilotConfig.connection.timeout,
    retryAttempts: tracePilotConfig.connection.retryAttempts,
    batchSize: tracePilotConfig.performance.batchSize,
    // 添加integration字段以兼容server.ts
    integration: {
      enabled: tracePilotConfig.integration.enabled
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'mplp-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
}; 
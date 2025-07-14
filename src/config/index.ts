/**
 * MPLP v1.0 统一配置管理
 * 
 * @version v1.1.0
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-07-16T16:00:00+08:00
 * @compliance .cursor/rules/security-requirements.mdc - 敏感配置管理
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立配置
 */

import { config as dotenvConfig } from 'dotenv';
import { traceAdapterConfig } from './trace-adapter.config';

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
  
  // 追踪适配器配置（厂商中立）
  traceAdapter: {
    apiUrl: traceAdapterConfig.connection.apiUrl,
    apiKey: traceAdapterConfig.connection.apiKey,
    timeout: traceAdapterConfig.connection.timeout,
    retryAttempts: traceAdapterConfig.connection.retryAttempts,
    batchSize: traceAdapterConfig.performance.batchSize,
    integration: {
      enabled: traceAdapterConfig.integration.enabled
    }
  },
  
  // 向后兼容字段 - 已废弃，请使用traceAdapter
  tracepilot: {
    apiUrl: traceAdapterConfig.connection.apiUrl,
    apiKey: traceAdapterConfig.connection.apiKey,
    timeout: traceAdapterConfig.connection.timeout,
    retryAttempts: traceAdapterConfig.connection.retryAttempts,
    batchSize: traceAdapterConfig.performance.batchSize,
    integration: {
      enabled: traceAdapterConfig.integration.enabled
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'mplp-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
}; 
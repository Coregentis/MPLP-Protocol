/**
 * TracePilot MCP集成配置
 * 
 * @version v2.2
 * @created 2025-07-09T21:00:00+08:00
 * @compliance .cursor/rules/integration-patterns.mdc - TracePilot集成配置
 * @compliance .cursor/rules/security-requirements.mdc - 安全配置管理
 * @performance 连接<5秒，同步<100ms，批处理>1000 TPS
 */

import { config as dotenvConfig } from 'dotenv';

// 加载环境变量
dotenvConfig();

/**
 * TracePilot连接配置接口
 */
export interface TracePilotConnectionConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  connectionTimeout: number;
  healthCheckInterval: number;
}

/**
 * TracePilot性能配置接口
 */
export interface TracePilotPerformanceConfig {
  syncLatencyTarget: number;      // 同步延迟目标 (ms)
  batchThroughputTarget: number;  // 批处理吞吐量目标 (TPS)
  formatConversionTarget: number; // 格式转换目标 (ms)
  batchSize: number;              // 批处理大小
  batchTimeout: number;           // 批处理超时 (ms)
  maxQueueSize: number;           // 最大队列大小
}

/**
 * TracePilot集成策略配置
 */
export interface TracePilotIntegrationConfig {
  enabled: boolean;
  realtimeSync: boolean;
  batchSync: boolean;
  errorRetry: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  auditEnabled: boolean;
}

/**
 * TracePilot完整配置
 */
export interface TracePilotConfig {
  connection: TracePilotConnectionConfig;
  performance: TracePilotPerformanceConfig;
  integration: TracePilotIntegrationConfig;
}

/**
 * 默认TracePilot配置
 */
const defaultTracePilotConfig: TracePilotConfig = {
  connection: {
    apiUrl: 'http://localhost:8080',
    apiKey: 'dev-api-key',
    timeout: 10000,
    retryAttempts: 3,
    connectionTimeout: 5000,
    healthCheckInterval: 30000
  },
  
  performance: {
    syncLatencyTarget: 100,       // 同步延迟 <100ms
    batchThroughputTarget: 1000,  // 批处理 >1000 TPS
    formatConversionTarget: 50,   // 格式转换 <50ms
    batchSize: 100,
    batchTimeout: 5000,
    maxQueueSize: 10000
  },
  
  integration: {
    enabled: true,
    realtimeSync: true,
    batchSync: true,
    errorRetry: true,
    compressionEnabled: true,
    encryptionEnabled: false,     // 开发环境默认关闭
    auditEnabled: true
  }
};

/**
 * 从环境变量创建TracePilot配置
 */
export function createTracePilotConfig(): TracePilotConfig {
  const config: TracePilotConfig = {
    connection: {
      apiUrl: process.env.TRACEPILOT_API_URL || defaultTracePilotConfig.connection.apiUrl,
      apiKey: process.env.TRACEPILOT_API_KEY || defaultTracePilotConfig.connection.apiKey,
      timeout: parseInt(process.env.TRACEPILOT_TIMEOUT || '10000', 10),
      retryAttempts: parseInt(process.env.TRACEPILOT_RETRY || '3', 10),
      connectionTimeout: parseInt(process.env.TRACEPILOT_CONNECTION_TIMEOUT || '5000', 10),
      healthCheckInterval: parseInt(process.env.TRACEPILOT_HEALTH_INTERVAL || '30000', 10)
    },
    
    performance: {
      syncLatencyTarget: parseInt(process.env.TRACEPILOT_SYNC_TARGET || '100', 10),
      batchThroughputTarget: parseInt(process.env.TRACEPILOT_THROUGHPUT_TARGET || '1000', 10),
      formatConversionTarget: parseInt(process.env.TRACEPILOT_CONVERSION_TARGET || '50', 10),
      batchSize: parseInt(process.env.TRACEPILOT_BATCH_SIZE || '100', 10),
      batchTimeout: parseInt(process.env.TRACEPILOT_BATCH_TIMEOUT || '5000', 10),
      maxQueueSize: parseInt(process.env.TRACEPILOT_QUEUE_SIZE || '10000', 10)
    },
    
    integration: {
      enabled: process.env.TRACEPILOT_ENABLED !== 'false',
      realtimeSync: process.env.TRACEPILOT_REALTIME !== 'false',
      batchSync: process.env.TRACEPILOT_BATCH !== 'false',
      errorRetry: process.env.TRACEPILOT_RETRY_ENABLED !== 'false',
      compressionEnabled: process.env.TRACEPILOT_COMPRESSION === 'true',
      encryptionEnabled: process.env.TRACEPILOT_ENCRYPTION === 'true',
      auditEnabled: process.env.TRACEPILOT_AUDIT !== 'false'
    }
  };

  // 开发环境配置验证
  if (process.env.NODE_ENV === 'development') {
    validateDevelopmentConfig(config);
  }

  // 生产环境配置验证
  if (process.env.NODE_ENV === 'production') {
    validateProductionConfig(config);
  }

  return config;
}

/**
 * 验证开发环境配置
 */
function validateDevelopmentConfig(config: TracePilotConfig): void {
  if (!config.connection.apiUrl) {
    throw new Error('TRACEPILOT_API_URL is required in development');
  }

  if (config.connection.apiKey === 'dev-api-key') {
    console.warn('⚠️  使用默认开发API密钥，生产环境请更换');
  }

  console.log('📋 TracePilot开发环境配置:', {
    apiUrl: config.connection.apiUrl,
    enabled: config.integration.enabled,
    realtimeSync: config.integration.realtimeSync,
    batchSize: config.performance.batchSize
  });
}

/**
 * 验证生产环境配置
 */
function validateProductionConfig(config: TracePilotConfig): void {
  if (!config.connection.apiUrl) {
    throw new Error('TRACEPILOT_API_URL is required in production');
  }

  if (!config.connection.apiKey || config.connection.apiKey === 'dev-api-key') {
    throw new Error('Valid TRACEPILOT_API_KEY is required in production');
  }

  if (!config.integration.encryptionEnabled) {
    console.warn('⚠️  生产环境建议启用TracePilot加密传输');
  }

  // 生产环境性能要求更严格
  if (config.performance.syncLatencyTarget > 50) {
    console.warn('⚠️  生产环境建议TracePilot同步延迟 <50ms');
  }
}

/**
 * 获取TracePilot健康检查配置
 */
export function getTracePilotHealthConfig() {
  return {
    endpoint: '/tracepilot/health',
    timeout: 3000,
    interval: 30000,
    retryAttempts: 3
  };
}

/**
 * 获取TracePilot监控指标配置
 */
export function getTracePilotMetricsConfig() {
  return {
    metricsEndpoint: '/metrics/tracepilot',
    collectInterval: 10000,
    historyLength: 1000,
    alertThresholds: {
      syncLatency: 150,          // 超过150ms告警
      errorRate: 0.05,           // 错误率超过5%告警
      queueBacklog: 5000         // 队列积压超过5000条告警
    }
  };
}

// 导出配置实例
export const tracePilotConfig = createTracePilotConfig(); 
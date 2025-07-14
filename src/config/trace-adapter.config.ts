/**
 * 追踪适配器配置 - 厂商中立设计
 * 
 * @version v1.0.0
 * @created 2025-07-16T16:00:00+08:00
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立配置
 * @compliance .cursor/rules/security-requirements.mdc - 安全配置管理
 * @performance 连接<5秒，同步<100ms，批处理>1000 TPS
 */

import { config as dotenvConfig } from 'dotenv';
import { logger } from '../utils/logger';

// 加载环境变量
dotenvConfig();

/**
 * 追踪适配器连接配置接口
 */
export interface TraceAdapterConnectionConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  connectionTimeout: number;
  healthCheckInterval: number;
}

/**
 * 追踪适配器性能配置接口
 */
export interface TraceAdapterPerformanceConfig {
  syncLatencyTarget: number;      // 同步延迟目标 (ms)
  batchThroughputTarget: number;  // 批处理吞吐量目标 (TPS)
  formatConversionTarget: number; // 格式转换目标 (ms)
  batchSize: number;              // 批处理大小
  batchTimeout: number;           // 批处理超时 (ms)
  maxQueueSize: number;           // 最大队列大小
}

/**
 * 追踪适配器集成策略配置
 */
export interface TraceAdapterIntegrationConfig {
  enabled: boolean;
  realtimeSync: boolean;
  batchSync: boolean;
  errorRetry: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  auditEnabled: boolean;
  adapterVersion: 'basic' | 'enhanced';     // 适配器版本选择
  enhancedFeatures: {                       // 增强版功能配置
    aiIssueDetection: boolean;
    autoFixSuggestions: boolean;
    intelligentTaskTracking: boolean;
    performanceOptimization: boolean;
  };
}

/**
 * 追踪适配器完整配置
 */
export interface TraceAdapterConfig {
  connection: TraceAdapterConnectionConfig;
  performance: TraceAdapterPerformanceConfig;
  integration: TraceAdapterIntegrationConfig;
}

/**
 * 默认追踪适配器配置
 */
const defaultTraceAdapterConfig: TraceAdapterConfig = {
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
    auditEnabled: true,
    adapterVersion: 'enhanced',   // 默认使用增强版适配器
    enhancedFeatures: {           // 启用所有增强功能
      aiIssueDetection: true,
      autoFixSuggestions: true,
      intelligentTaskTracking: true,
      performanceOptimization: true
    }
  }
};

/**
 * 从环境变量创建追踪适配器配置
 * 
 * 支持两种环境变量前缀:
 * - TRACE_ADAPTER_* (推荐，厂商中立)
 * - TRACEPILOT_* (兼容旧版)
 */
export function createTraceAdapterConfig(): TraceAdapterConfig {
  const config: TraceAdapterConfig = {
    connection: {
      apiUrl: process.env.TRACE_ADAPTER_API_URL || process.env.TRACEPILOT_API_URL || defaultTraceAdapterConfig.connection.apiUrl,
      apiKey: process.env.TRACE_ADAPTER_API_KEY || process.env.TRACEPILOT_API_KEY || defaultTraceAdapterConfig.connection.apiKey,
      timeout: parseInt(process.env.TRACE_ADAPTER_TIMEOUT || process.env.TRACEPILOT_TIMEOUT || '10000', 10),
      retryAttempts: parseInt(process.env.TRACE_ADAPTER_RETRY || process.env.TRACEPILOT_RETRY || '3', 10),
      connectionTimeout: parseInt(process.env.TRACE_ADAPTER_CONNECTION_TIMEOUT || process.env.TRACEPILOT_CONNECTION_TIMEOUT || '5000', 10),
      healthCheckInterval: parseInt(process.env.TRACE_ADAPTER_HEALTH_INTERVAL || process.env.TRACEPILOT_HEALTH_INTERVAL || '30000', 10)
    },
    
    performance: {
      syncLatencyTarget: parseInt(process.env.TRACE_ADAPTER_SYNC_TARGET || process.env.TRACEPILOT_SYNC_TARGET || '100', 10),
      batchThroughputTarget: parseInt(process.env.TRACE_ADAPTER_THROUGHPUT_TARGET || process.env.TRACEPILOT_THROUGHPUT_TARGET || '1000', 10),
      formatConversionTarget: parseInt(process.env.TRACE_ADAPTER_CONVERSION_TARGET || process.env.TRACEPILOT_CONVERSION_TARGET || '50', 10),
      batchSize: parseInt(process.env.TRACE_ADAPTER_BATCH_SIZE || process.env.TRACEPILOT_BATCH_SIZE || '100', 10),
      batchTimeout: parseInt(process.env.TRACE_ADAPTER_BATCH_TIMEOUT || process.env.TRACEPILOT_BATCH_TIMEOUT || '5000', 10),
      maxQueueSize: parseInt(process.env.TRACE_ADAPTER_QUEUE_SIZE || process.env.TRACEPILOT_QUEUE_SIZE || '10000', 10)
    },
    
    integration: {
      enabled: process.env.TRACE_ADAPTER_ENABLED !== 'false' && process.env.TRACEPILOT_ENABLED !== 'false',
      realtimeSync: process.env.TRACE_ADAPTER_REALTIME !== 'false' && process.env.TRACEPILOT_REALTIME !== 'false',
      batchSync: process.env.TRACE_ADAPTER_BATCH !== 'false' && process.env.TRACEPILOT_BATCH !== 'false',
      errorRetry: process.env.TRACE_ADAPTER_RETRY_ENABLED !== 'false' && process.env.TRACEPILOT_RETRY_ENABLED !== 'false',
      compressionEnabled: process.env.TRACE_ADAPTER_COMPRESSION === 'true' || process.env.TRACEPILOT_COMPRESSION === 'true',
      encryptionEnabled: process.env.TRACE_ADAPTER_ENCRYPTION === 'true' || process.env.TRACEPILOT_ENCRYPTION === 'true',
      auditEnabled: process.env.TRACE_ADAPTER_AUDIT !== 'false' && process.env.TRACEPILOT_AUDIT !== 'false',
      adapterVersion: (process.env.TRACE_ADAPTER_VERSION || process.env.TRACEPILOT_ADAPTER_VERSION || 'enhanced') as 'basic' | 'enhanced',
      enhancedFeatures: {
        aiIssueDetection: process.env.TRACE_ADAPTER_AI_DETECTION !== 'false' && process.env.TRACEPILOT_AI_DETECTION !== 'false',
        autoFixSuggestions: process.env.TRACE_ADAPTER_AUTO_FIX !== 'false' && process.env.TRACEPILOT_AUTO_FIX !== 'false',
        intelligentTaskTracking: process.env.TRACE_ADAPTER_INTELLIGENT_TRACKING !== 'false' && process.env.TRACEPILOT_INTELLIGENT_TRACKING !== 'false',
        performanceOptimization: process.env.TRACE_ADAPTER_PERFORMANCE_OPT !== 'false' && process.env.TRACEPILOT_PERFORMANCE_OPT !== 'false'
      }
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
function validateDevelopmentConfig(config: TraceAdapterConfig): void {
  if (!config.connection.apiUrl) {
    throw new Error('追踪适配器API URL在开发环境中是必需的');
  }

  if (config.connection.apiKey === 'dev-api-key') {
    logger.warn('⚠️ 使用默认开发API密钥，生产环境请更换');
  }

  logger.debug('📋 追踪适配器开发环境配置:', {
    apiUrl: config.connection.apiUrl,
    enabled: config.integration.enabled,
    realtimeSync: config.integration.realtimeSync,
    batchSize: config.performance.batchSize
  });
}

/**
 * 验证生产环境配置
 */
function validateProductionConfig(config: TraceAdapterConfig): void {
  if (!config.connection.apiUrl) {
    throw new Error('追踪适配器API URL在生产环境中是必需的');
  }

  if (!config.connection.apiKey || config.connection.apiKey === 'dev-api-key') {
    throw new Error('生产环境需要有效的追踪适配器API密钥');
  }

  if (!config.integration.encryptionEnabled) {
    logger.warn('⚠️ 生产环境建议启用追踪适配器加密传输');
  }

  // 生产环境性能要求更严格
  if (config.performance.syncLatencyTarget > 50) {
    logger.warn('⚠️ 生产环境建议追踪适配器同步延迟 <50ms');
  }
}

/**
 * 获取追踪适配器健康检查配置
 */
export function getTraceAdapterHealthConfig() {
  return {
    endpoint: '/trace-adapter/health',
    timeout: 3000,
    interval: 30000,
    retryAttempts: 3
  };
}

/**
 * 获取追踪适配器监控指标配置
 */
export function getTraceAdapterMetricsConfig() {
  return {
    metricsEndpoint: '/metrics/trace',
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
export const traceAdapterConfig = createTraceAdapterConfig(); 
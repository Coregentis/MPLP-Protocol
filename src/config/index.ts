/**
 * MPLP Configuration Module - 厂商中立配置管理
 * 
 * 提供应用程序的配置管理功能，支持环境变量和默认配置
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  server: {
    port: number;
    host: string;
  };
  traceAdapter: {
    integration: {
      enabled: boolean;
    };
    batchSize: number;
    timeout: number;
  };
}

export const config: AppConfig = {
  app: {
    name: process.env.APP_NAME || 'MPLP',
    version: process.env.APP_VERSION || '1.0.3',
    environment: process.env.NODE_ENV || 'development'
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost'
  },
  traceAdapter: {
    integration: {
      enabled: process.env.TRACE_ADAPTER_ENABLED === 'true' || false
    },
    batchSize: parseInt(process.env.TRACE_BATCH_SIZE || '100', 10),
    timeout: parseInt(process.env.TRACE_TIMEOUT || '5000', 10)
  }
};

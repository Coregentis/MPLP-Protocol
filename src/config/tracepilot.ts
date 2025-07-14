/**
 * TracePilot MCP集成配置 - 重定向文件
 * 
 * @version v2.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-07-16T16:00:00+08:00
 * @deprecated 请使用厂商中立的配置文件 src/config/trace-adapter.config.ts
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立重定向
 */

import { logger } from '../utils/logger';
import {
  TraceAdapterConfig,
  TraceAdapterConnectionConfig,
  TraceAdapterPerformanceConfig,
  TraceAdapterIntegrationConfig,
  traceAdapterConfig,
  createTraceAdapterConfig,
  getTraceAdapterHealthConfig,
  getTraceAdapterMetricsConfig
} from './trace-adapter.config';

// 记录废弃警告
logger.warn(
  '⚠️ src/config/tracepilot.ts 已废弃，请使用厂商中立的配置文件 src/config/trace-adapter.config.ts',
  { stack: new Error().stack }
);

// 重命名导出以保持向后兼容
export type TracePilotConnectionConfig = TraceAdapterConnectionConfig;
export type TracePilotPerformanceConfig = TraceAdapterPerformanceConfig;
export type TracePilotIntegrationConfig = TraceAdapterIntegrationConfig;
export type TracePilotConfig = TraceAdapterConfig;

// 重新导出函数
export const createTracePilotConfig = createTraceAdapterConfig;
export const getTracePilotHealthConfig = getTraceAdapterHealthConfig;
export const getTracePilotMetricsConfig = getTraceAdapterMetricsConfig;

// 导出配置实例
export const tracePilotConfig = traceAdapterConfig; 
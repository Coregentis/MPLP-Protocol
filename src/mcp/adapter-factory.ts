/**
 * 适配器工厂重定向文件
 * 
 * 此文件仅用于向后兼容，将导入重定向到新的厂商中立适配器工厂。
 * 
 * @version v1.0.0
 * @created 2025-07-16T14:30:00+08:00
 * @deprecated 请直接导入 src/adapters/legacy-adapter-factory.ts 或 src/adapters/trace/adapter-factory.ts
 */

import { logger } from '../utils/logger';
import { LegacyAdapterFactory, AdapterConfig, AdapterFactory } from '../adapters/legacy-adapter-factory';

// 记录重定向警告
logger.warn(
  'src/mcp/adapter-factory.ts 已废弃，请使用 src/adapters/legacy-adapter-factory.ts 或 src/adapters/trace/adapter-factory.ts',
  { stack: new Error().stack }
);

// 重新导出所有内容
export {
  LegacyAdapterFactory as MCPAdapterFactory,
  AdapterFactory,
  AdapterConfig
};

// 默认导出
export default LegacyAdapterFactory; 
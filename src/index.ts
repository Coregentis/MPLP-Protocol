/**
 * MPLP v1.0 - Multi-Agent Protocol Lifecycle Platform
 * 主入口文件
 *
 * @version 1.0.0
 * @description MPLP协议栈的统一入口点，提供所有10个模块的标准化访问接口
 * @architecture L1-L3分层协议栈
 * - L1 Protocol Layer: 基础设施层 (Security • Performance • Events • Storage)
 * - L2 Coordination Layer: 协调管理层 (10个业务模块)
 * - L3 Execution Layer: 执行编排层 (CoreOrchestrator)
 * @modules Context, Plan, Confirm, Trace, Role, Extension, Core, Collab, Dialog, Network
 */

// ===== L1 协议层 (基础设施) =====
export * from './core/protocols/mplp-protocol-base';
export * from './core/protocols/cross-cutting-concerns';

// ===== 模块导出 (按架构层级排序) =====

// L2 协调层模块 (10个业务模块)
export * from './modules/context';    // ✅ 已实现
// export * from './modules/plan';      // 🔄 待实现
// export * from './modules/confirm';   // 🔄 待实现
// export * from './modules/trace';     // 🔄 待实现
// export * from './modules/role';      // 🔄 待实现
// export * from './modules/extension'; // 🔄 待实现
// export * from './modules/core';      // 🔄 待实现
// export * from './modules/collab';    // 🔄 待实现
// export * from './modules/dialog';    // 🔄 待实现
// export * from './modules/network';   // 🔄 待实现

// L3 执行层 (CoreOrchestrator)
// export * from './core/orchestrator'; // 🔄 待实现

// ===== 共享类型和工具 (具名导出避免冲突) =====
export {
  UUID,
  Timestamp,
  PaginatedResult,
  PaginationParams
} from './shared/types';
export * from './shared/utils';

// ===== Schema和验证 (具名导出避免冲突) =====
export {
  CrossCuttingConcernsSchemaMap,
  CrossCuttingConcernSchemaName,
  AllCrossCuttingConcernsSchemas,
  CrossCuttingConcernNames
} from './schemas';

/**
 * MPLP平台版本信息
 */
export const MPLP_VERSION = '1.0.0';
export const MPLP_PROTOCOL_VERSION = '1.0.0';

/**
 * 支持的模块列表
 */
export const MPLP_MODULES = [
  'context',   // ✅ 已实现
  'plan',      // 🔄 待实现
  'confirm',   // 🔄 待实现
  'trace',     // 🔄 待实现
  'role',      // 🔄 待实现
  'extension', // 🔄 待实现
  'core',      // 🔄 待实现
  'collab',    // 🔄 待实现
  'dialog',    // 🔄 待实现
  'network'    // 🔄 待实现
] as const;

export type MLPPModuleName = typeof MPLP_MODULES[number];

/**
 * MPLP横切关注点管理器统一导出
 * 
 * @description 提供所有9个L3管理器的统一访问接口
 * @version 1.0.0
 * @architecture L1基础设施 → L3管理器 → L2模块集成
 */

// ===== 9个L3管理器导出 =====
export { MLPPSecurityManager } from './security-manager';
export { MLPPPerformanceMonitor } from './performance-monitor';
export { MLPPEventBusManager } from './event-bus-manager';
export { MLPPErrorHandler } from './error-handler';
export { MLPPCoordinationManager } from './coordination-manager';
export { MLPPOrchestrationManager } from './orchestration-manager';
export { MLPPStateSyncManager } from './state-sync-manager';
export { MLPPTransactionManager } from './transaction-manager';
export { MLPPProtocolVersionManager } from './protocol-version-manager';

// ===== 管理器工厂 =====
export { CrossCuttingConcernsFactory } from './factory';

// ===== 共享类型 =====
export * from './types';

/**
 * 横切关注点管理器列表
 */
export const CROSS_CUTTING_MANAGERS = [
  'security',
  'performance',
  'eventBus',
  'errorHandler',
  'coordination',
  'orchestration',
  'stateSync',
  'transaction',
  'protocolVersion'
] as const;

export type CrossCuttingManagerName = typeof CROSS_CUTTING_MANAGERS[number];

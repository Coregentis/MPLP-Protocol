/**
 * MPLP - Multi-Agent Project Lifecycle Protocol
 * 统一导出文件
 *
 * @version 1.0.0
 */

// 核心调度器
export { CoreOrchestrator } from './modules/core/orchestrator/core-orchestrator';
export { PerformanceEnhancedOrchestrator } from './modules/core/orchestrator/performance-enhanced-orchestrator';

// 工作流管理
export { WorkflowManager } from './modules/core/workflow/workflow-manager';
export { ModuleCoordinator } from './modules/core/coordination/module-coordinator';

// 六大核心模块
export * from './modules/context';
export * from './modules/plan';
export * from './modules/confirm';
export * from './modules/trace';
export * from './modules/role';
export * from './modules/extension';

// Schema验证
export { SchemaValidator } from './schemas';

// 性能优化工具
export {
  IntelligentCacheManager,
  ConnectionPoolManager,
  BatchProcessor,
  BusinessPerformanceMonitor
} from './core/performance/real-performance-optimizer';

// 类型定义
export * from './modules/core/types/core.types';
export * from './shared/types/index';

// 工具类
export { Logger } from './utils/logger';

// 默认导出 (向后兼容)
export { CoreOrchestrator as Orchestrator } from './modules/core/orchestrator/core-orchestrator';
export { PerformanceEnhancedOrchestrator as EnhancedOrchestrator } from './modules/core/orchestrator/performance-enhanced-orchestrator';


// 版本信息
export const VERSION = '1.0.0';

/**
 * Extension模块主入口 (DDD架构)
 *
 * 导出Extension模块的公共API
 *
 * @version 1.0.0
 * @created 2025-09-16
 * @architecture DDD (Domain-Driven Design)
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/extension.controller';

// 应用层
export * from './application/services/extension-management.service';

// 领域层
export * from './domain/entities/extension.entity';

// 基础设施层
export * from './infrastructure/repositories/extension.repository';

// 模块集成
export * from './module';

// ===== 特定导出 (避免冲突) =====
export {
  IExtensionRepository,
  ExtensionFilter,
} from './domain/repositories/extension-repository.interface';

// ===== 类型定义导出 =====
export * from './types';

// ===== DDD架构完成，旧架构文件已清理 =====
// 所有功能现在通过新的DDD架构提供

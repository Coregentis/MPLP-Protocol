/**
 * Role模块主入口 (DDD架构)
 *
 * 导出Role模块的公共API
 *
 * @version 2.0.0
 * @created 2025-09-16
 * @updated 2025-08-04 22:19
 * @architecture DDD (Domain-Driven Design)
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/role.controller';

// 应用层 - 明确导出避免冲突
export {
  RoleManagementService,
  OperationResult
} from './application/services/role-management.service';

// 领域层
export * from './domain/entities/role.entity';

// 基础设施层
export * from './infrastructure/repositories/role.repository';

// 模块集成
export * from './module';

// ===== 特定导出 (避免冲突) =====
export { IRoleRepository, RoleFilter } from './domain/repositories/role-repository.interface';

// ===== 类型定义导出 =====
export * from './types';

// ===== 适配器导出 =====
export { RoleModuleAdapter } from './infrastructure/adapters/role-module.adapter';

// ===== DDD架构完成，旧架构文件已清理 =====
// 所有功能现在通过新的DDD架构提供
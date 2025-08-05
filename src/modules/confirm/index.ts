/**
 * Confirm模块主入口 (DDD架构) (推荐)
 *
 * 导出Confirm模块的公共API
 *
 * @version 2.0.0
 * @created 2025-09-16
 * @updated 2025-08-04 23:32
 * @architecture DDD (Domain-Driven Design)
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/dto/confirm.dto';
export * from './api/controllers/confirm.controller';

// 应用层
export * from './application/services/confirm-management.service';
export * from './application/commands/create-confirm.command';
export * from './application/queries/get-confirm-by-id.query';

// 领域层
export * from './domain/entities/confirm.entity';
export * from './domain/services/confirm-validation.service';

// 基础设施层
export * from './infrastructure/repositories/confirm.repository';

// ===== 适配器导出 =====
export { ConfirmModuleAdapter } from './infrastructure/adapters/confirm-module.adapter';

// 模块集成
export * from './module';

// ===== 特定导出 (避免冲突) =====
export { IConfirmRepository } from './domain/repositories/confirm-repository.interface';
export { ConfirmFactory, CreateConfirmRequest as DomainCreateConfirmRequest } from './domain/factories/confirm.factory';

// ===== 类型定义导出 =====
export * from './types';

// ===== DDD架构完成，旧架构文件已清理 =====
// 所有功能现在通过新的DDD架构提供
/**
 * Context模块主入口
 * 
 * 导出Context模块的公共API
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/dto';
export * from './api/controllers/context.controller';

// 应用层
export * from './application/services/context-management.service';
export * from './application/services/shared-state-management.service';
export * from './application/services/access-control-management.service';
export * from './application/services/context-performance-monitor.service';
export * from './application/services/dependency-resolution.service';
export * from './application/services/context-synchronization.service';
export * from './application/commands/create-context.command';
export * from './application/queries/get-context-by-id.query';

// 领域层
export * from './domain/entities/context.entity';
export * from './domain/repositories/context-repository.interface';
export * from './domain/services/context-validation.service';

// 基础设施层
export * from './infrastructure/repositories/context.repository';

// 模块集成
export * from './module';

// ===== 类型定义导出 =====
export * from './types';
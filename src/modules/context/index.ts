/**
 * Context模块主入口
 *
 * 导出Context模块的公共API
 *
 * @version 1.0.0
 * @created 2025-08-09
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/context.controller';
export * from './api/dto';
export * from './api/mappers/context.mapper';

// 应用层
export * from './application/services/context-management.service';

// 领域层
export * from './domain/entities/context.entity';
export * from './domain/repositories/context-repository.interface';

// 基础设施层
export * from './infrastructure/repositories/context.repository';

// ===== 适配器导出 =====
export { ContextModuleAdapter } from './infrastructure/adapters/context-module.adapter';

// ===== 模块集成 =====
export * from './module';

// ===== 类型定义导出 =====
// 注意：types.ts中的接口与context-management.service.ts中的接口有冲突
// 暂时注释掉以避免重复导出错误
// export * from './types';
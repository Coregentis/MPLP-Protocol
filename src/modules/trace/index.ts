/**
 * Trace模块主入口
 *
 * 导出Trace模块的公共API
 *
 * @version 1.0.0
 * @created 2025-08-09
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/trace.controller';
export * from './api/dto';
export * from './api/mappers/trace.mapper';

// 应用层
export * from './application/services/trace-management.service';

// 领域层
export * from './domain/entities/trace.entity';
export * from './domain/repositories/trace-repository.interface';

// 基础设施层
export * from './infrastructure/repositories/trace.repository';

// ===== 适配器导出 =====
export { TraceModuleAdapter } from './infrastructure/adapters/trace-module.adapter';

// ===== 模块集成 =====
export * from './module';

// ===== 类型定义导出 =====
export * from './types';
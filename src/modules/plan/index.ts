/**
 * Plan模块主入口
 *
 * 导出Plan模块的公共API
 *
 * @version 1.0.0
 * @created 2025-08-09
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/plan.controller';
export * from './api/dto/plan.dto';
export * from './api/mappers/plan.mapper';

// 应用层
export * from './application/services/plan-management.service';

// 领域层
export * from './domain/entities/plan.entity';
export * from './domain/repositories/plan-repository.interface';

// 基础设施层
export * from './infrastructure/repositories/plan-repository.impl';

// ===== 适配器导出 =====
export { PlanModuleAdapter } from './infrastructure/adapters/plan-module.adapter';

// ===== 模块集成 =====
export * from './module';

// ===== 类型定义导出 =====
export * from './types';
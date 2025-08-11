/**
 * Confirm模块主入口
 *
 * 导出Confirm模块的公共API
 *
 * @version 1.0.0
 * @created 2025-08-09
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/confirm.controller';
export * from './api/dto/confirm.dto';
export * from './api/mappers/confirm.mapper';

// 应用层
export * from './application/services/confirm-management.service';

// 领域层
export * from './domain/entities/confirm.entity';
export * from './domain/repositories/confirm-repository.interface';

// 基础设施层
export * from './infrastructure/repositories/confirm.repository';

// ===== 适配器导出 =====
export { ConfirmModuleAdapter } from './infrastructure/adapters/confirm-module.adapter';

// ===== 模块集成 =====
export * from './module';

// ===== 类型定义导出 =====
export * from './types';
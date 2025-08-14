/**
 * Extension模块主入口
 *
 * @version 1.0.0
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 ===== (MANDATORY SECTION)

// API层 (MANDATORY)
export * from './api/controllers/extension.controller';
export * from './api/dto/extension.dto';
export * from './api/mappers/extension.mapper';

// 应用层 (MANDATORY)
export * from './application/services/extension-management.service';

// 领域层 (MANDATORY)
export * from './domain/entities/extension.entity';
export * from './domain/repositories/extension-repository.interface';

// 基础设施层 (MANDATORY)
export * from './infrastructure/repositories/extension.repository';

// ===== 适配器导出 ===== (MANDATORY SECTION)
export { ExtensionModuleAdapter } from './infrastructure/adapters/extension-module.adapter';

// ===== 模块集成 ===== (MANDATORY SECTION)
export * from './module';

// ===== 类型定义导出 ===== (MANDATORY SECTION)
export * from './types';

/**
 * Trace模块主入口 (DDD架构)
 *
 * 导出Trace模块的公共API
 *
 * @version 1.0.0
 * @created 2025-09-16
 * @architecture DDD (Domain-Driven Design)
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/trace.controller';

// 应用层
export * from './application/services/trace-management.service';

// 领域层
export * from './domain/entities/trace.entity';
export * from './domain/services/trace-analysis.service';

// 基础设施层
export * from './infrastructure/repositories/trace.repository';

// 模块集成
export * from './module';

// ===== 特定导出 (避免冲突) =====
export { ITraceRepository, TraceFilter, TraceStatistics } from './domain/repositories/trace-repository.interface';
export { TraceFactory, CreateTraceRequest as DomainCreateTraceRequest } from './domain/factories/trace.factory';

// ===== 类型定义导出 =====
export * from './types';

// ===== DDD架构完成，旧架构文件已清理 =====
// 所有功能现在通过新的DDD架构提供
/**
 * MPLP Context模块主入口
 *
 * @description Context模块的统一导出入口，提供上下文和全局状态管理功能
 * @version 1.0.0
 * @module L2协调层 - Context模块
 * @architecture 统一DDD架构 + L3管理器集成模式
 * @status ✅ 实现中 - 基于实际Schema重构
 */
export * from './api/controllers/context.controller';
export * from './api/dto/context.dto';
export * from './api/mappers/context.mapper';
export * from './application/services/context-management.service';
export * from './domain/entities/context.entity';
export * from './domain/repositories/context-repository.interface';
export * from './infrastructure/repositories/context.repository';
export * from './infrastructure/protocols/context.protocol.js';
export * from './infrastructure/factories/context-protocol.factory.js';
export { ContextModuleAdapter } from './infrastructure/adapters/context-module.adapter';
export * from './module.js';
export * from './types.js';
/**
 * Context模块信息
 */
export declare const CONTEXT_MODULE_INFO: {
    readonly name: "context";
    readonly version: "1.0.0";
    readonly description: "MPLP上下文和全局状态管理模块";
    readonly layer: "L2";
    readonly status: "implementing";
    readonly features: readonly ["上下文管理", "状态同步", "生命周期管理", "权限控制", "审计追踪", "性能监控", "版本历史", "搜索索引", "缓存策略", "同步配置", "错误处理", "集成接口", "事件集成"];
    readonly dependencies: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
};
//# sourceMappingURL=index.d.ts.map
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
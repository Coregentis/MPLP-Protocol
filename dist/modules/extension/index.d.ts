/**
 * MPLP Extension模块主入口
 *
 * @description Extension模块的统一导出入口，提供扩展管理和插件协调功能
 * @version 1.0.0
 * @module L2协调层 - Extension模块
 * @architecture 统一DDD架构 + L3管理器集成模式
 * @status ✅ 实现中 - 基于实际Schema重构
 */
export * from './api/controllers/extension.controller';
export * from './api/dto/extension.dto';
export * from './api/mappers/extension.mapper';
export * from './application/services/extension-management.service';
export * from './application/services/extension-analytics.service';
export * from './application/services/extension-security.service';
export * from './domain/entities/extension.entity';
export * from './domain/repositories/extension.repository.interface';
export * from './infrastructure/repositories/extension.repository';
export * from './infrastructure/protocols/extension.protocol';
export * from './infrastructure/factories/extension-protocol.factory';
export * from './module';
export * from './types';
/**
 * Extension模块信息
 */
export declare const EXTENSION_MODULE_INFO: {
    readonly name: "extension";
    readonly version: "1.0.0";
    readonly description: "MPLP扩展管理和插件协调模块";
    readonly layer: "L2";
    readonly status: "implementing";
    readonly features: readonly ["扩展生命周期管理", "插件协调", "扩展点管理", "API扩展", "事件订阅", "安全沙箱", "资源限制", "代码签名", "权限管理", "性能监控", "版本历史", "搜索元数据", "事件集成", "审计追踪"];
    readonly dependencies: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "sandboxing", "resourceManagement", "protocolVersion"];
};
//# sourceMappingURL=index.d.ts.map
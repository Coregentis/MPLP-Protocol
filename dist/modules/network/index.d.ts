export * from './api/controllers/network.controller';
export * from './api/dto/network.dto';
export * from './api/mappers/network.mapper';
export * from './application/services/network-management.service';
export * from './domain/entities/network.entity';
export * from './domain/repositories/network-repository.interface';
export * from './infrastructure/repositories/network.repository';
export * from './infrastructure/protocols/network.protocol';
export * from './infrastructure/factories/network-protocol.factory';
export { NetworkModuleAdapter } from './infrastructure/adapters/network-module.adapter';
export * from './module';
export * from './types';
export declare const NETWORK_MODULE_INFO: {
    readonly name: "network";
    readonly version: "1.0.0";
    readonly description: "MPLP网络通信和分布式协作模块";
    readonly layer: "L2";
    readonly status: "implementing";
    readonly features: readonly ["网络拓扑管理", "节点发现和注册", "路由策略优化", "连接状态监控", "负载均衡", "故障恢复", "性能监控", "安全通信", "分布式协调", "事件广播", "消息路由", "网络诊断", "拓扑可视化"];
    readonly dependencies: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
};
//# sourceMappingURL=index.d.ts.map
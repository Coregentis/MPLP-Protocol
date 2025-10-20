/**
 * Network模块初始化
 *
 * @description Network模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 */
import { NetworkModuleAdapter } from './infrastructure/adapters/network-module.adapter';
import { NetworkController } from './api/controllers/network.controller';
import { NetworkManagementService } from './application/services/network-management.service';
import { MemoryNetworkRepository } from './infrastructure/repositories/network.repository';
/**
 * Network模块选项
 */
export interface NetworkModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
    networkTimeout?: number;
    maxConnections?: number;
}
/**
 * Network模块类
 */
export declare class NetworkModule {
    private adapter;
    private controller;
    private service;
    private repository;
    constructor(options?: NetworkModuleOptions);
    /**
     * 静态初始化方法
     */
    static initialize(options?: NetworkModuleOptions): Promise<NetworkModule>;
    /**
     * 启动模块
     */
    startup(): Promise<void>;
    /**
     * 关闭模块
     */
    shutdown(): Promise<void>;
    /**
     * 获取控制器
     */
    getController(): NetworkController;
    /**
     * 获取服务
     */
    getService(): NetworkManagementService;
    /**
     * 获取仓储
     */
    getRepository(): MemoryNetworkRepository;
    /**
     * 获取适配器
     */
    getAdapter(): NetworkModuleAdapter;
    /**
     * 健康检查
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
        timestamp: string;
    }>;
    /**
     * 获取模块信息
     */
    getModuleInfo(): {
        name: string;
        version: string;
        description: string;
        author: string;
        license: string;
        dependencies: {
            typescript: string;
        };
        features: string[];
        capabilities: {
            maxNetworks: number;
            maxNodesPerNetwork: number;
            maxConnectionsPerNode: number;
            supportedTopologies: string[];
            supportedProtocols: string[];
            discoveryMechanisms: string[];
            routingAlgorithms: string[];
        };
        performance: {
            networkLatency: string;
            connectionSuccess: string;
            topologyEfficiency: string;
            routingCalculation: string;
            nodeDiscovery: string;
            failoverTime: string;
        };
        crossCuttingConcerns: string[];
    };
    /**
     * 与Context模块协作 - 预留接口
     */
    coordinateWithContext(_contextId: string, _operation: string): Promise<boolean>;
    /**
     * 与Plan模块协作 - 预留接口
     */
    coordinateWithPlan(_planId: string, _networkRequirements: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Role模块协作 - 预留接口
     */
    coordinateWithRole(_roleId: string, _networkPermissions: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Confirm模块协作 - 预留接口
     */
    coordinateWithConfirm(_confirmId: string, _networkChanges: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Trace模块协作 - 预留接口
     */
    coordinateWithTrace(_traceId: string, _networkMetrics: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Extension模块协作 - 预留接口
     */
    coordinateWithExtension(_extensionId: string, _networkExtensions: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Dialog模块协作 - 预留接口
     */
    coordinateWithDialog(_dialogId: string, _networkCommunication: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Collab模块协作 - 预留接口
     */
    coordinateWithCollab(_collabId: string, _networkCollaboration: Record<string, unknown>): Promise<boolean>;
    /**
     * 与Core模块协作 - 预留接口
     */
    coordinateWithCore(_coreOperation: string, _networkData: Record<string, unknown>): Promise<boolean>;
    /**
     * CoreOrchestrator协调场景支持 - 预留接口
     */
    handleOrchestrationScenario(_scenarioType: string, _scenarioData: Record<string, unknown>): Promise<Record<string, unknown>>;
}
/**
 * Network模块版本信息
 */
export declare const NetworkModuleInfo: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    dependencies: {
        typescript: string;
    };
    features: string[];
    mplpIntegration: {
        supportedModules: string[];
        orchestrationScenarios: string[];
        crossCuttingConcerns: string[];
    };
};
//# sourceMappingURL=module.d.ts.map
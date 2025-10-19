/**
 * Extension协议工厂
 *
 * @description Extension模块的协议工厂，负责创建和配置Extension协议实例
 * @version 1.0.0
 * @layer Infrastructure层 - 工厂
 * @pattern 工厂模式 + 依赖注入 + 协议配置
 */
import { ExtensionProtocol } from '../protocols/extension.protocol';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
import { IExtensionRepository } from '../../domain/repositories/extension.repository.interface';
import { ExtensionModuleAdapter } from '../adapters/extension-module.adapter';
import { ExtensionProtocolFactoryConfig } from '../../types';
import { ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Extension协议配置选项
 */
export interface ExtensionProtocolConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    enableSecurity?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableEventBus?: boolean;
    enableErrorHandling?: boolean;
    enableCoordination?: boolean;
    enableOrchestration?: boolean;
    maxExtensions?: number;
    activationTimeout?: number;
    deactivationTimeout?: number;
    healthCheckInterval?: number;
    performanceMetricsInterval?: number;
    enableSandbox?: boolean;
    enableCodeSigning?: boolean;
    enablePermissionValidation?: boolean;
    enableResourceLimiting?: boolean;
    maxMemoryUsage?: number;
    maxCpuUsage?: number;
    maxNetworkRequests?: number;
}
/**
 * Extension协议依赖项
 */
export interface ExtensionProtocolDependencies {
    extensionRepository?: IExtensionRepository;
    extensionManagementService?: ExtensionManagementService;
    extensionModuleAdapter?: ExtensionModuleAdapter;
    securityManager?: unknown;
    performanceManager?: unknown;
    eventBusManager?: unknown;
    errorHandlerManager?: unknown;
    coordinationManager?: unknown;
    orchestrationManager?: unknown;
    stateSyncManager?: unknown;
    transactionManager?: unknown;
    protocolVersionManager?: unknown;
}
/**
 * Extension协议工厂类
 */
export declare class ExtensionProtocolFactory {
    private static instance;
    private readonly defaultConfig;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): ExtensionProtocolFactory;
    /**
     * 创建Extension协议实例（单例模式）
     */
    createProtocol(config?: Partial<ExtensionProtocolFactoryConfig>): Promise<ExtensionProtocol>;
    /**
     * 创建默认Extension协议实例
     */
    createDefaultProtocol(): Promise<ExtensionProtocol>;
    /**
     * 创建测试Extension协议实例
     */
    createTestProtocol(config?: Partial<ExtensionProtocolConfig>): ExtensionProtocol;
    /**
     * 创建生产Extension协议实例
     */
    createProductionProtocol(config?: Partial<ExtensionProtocolConfig>): ExtensionProtocol;
    /**
     * 解析依赖项
     */
    private resolveDependencies;
    /**
     * 创建测试依赖项
     */
    private createTestDependencies;
    /**
     * 创建生产依赖项
     */
    private createProductionDependencies;
    /**
     * 验证配置
     */
    validateConfig(config: ExtensionProtocolConfig): boolean;
    /**
     * 获取默认配置
     */
    getDefaultConfig(): ExtensionProtocolConfig;
    /**
     * 获取协议元数据
     * @description 基于mplp-extension.json Schema的元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议健康状态
     * @description 基于Schema定义的健康检查
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * 重置协议实例
     * @description 用于测试和重新配置
     */
    reset(): void;
    /**
     * 销毁协议实例
     * @description 清理资源和连接
     */
    destroy(): Promise<void>;
}
/**
 * 默认Extension协议工厂配置
 * @description 基于mplp-extension.json Schema的默认配置
 */
export declare const DEFAULT_EXTENSION_PROTOCOL_CONFIG: ExtensionProtocolFactoryConfig;
//# sourceMappingURL=extension-protocol.factory.d.ts.map
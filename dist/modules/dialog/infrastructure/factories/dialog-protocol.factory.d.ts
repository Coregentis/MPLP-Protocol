/**
 * Dialog Protocol Factory
 * @description Dialog模块协议工厂 - 协议实例创建和管理
 * @version 1.0.0
 */
import { type IMLPPProtocol } from '../protocols/dialog.protocol';
/**
 * 协议工厂配置接口
 */
export interface ProtocolFactoryConfig {
    environment: 'development' | 'staging' | 'production';
    enableLogging: boolean;
    enableMetrics: boolean;
    enableHealthCheck: boolean;
    dependencies: {
        database?: unknown;
        cache?: unknown;
        messageQueue?: unknown;
        monitoring?: unknown;
    };
    features: {
        intelligentControl: boolean;
        criticalThinking: boolean;
        knowledgeSearch: boolean;
        multimodal: boolean;
        collaboration: boolean;
    };
}
/**
 * 协议实例配置接口
 */
export interface ProtocolInstanceConfig {
    instanceId: string;
    protocolVersion: string;
    customCapabilities?: string[];
    overrideDefaults?: Record<string, unknown>;
    integrationConfig?: {
        enabledModules: string[];
        orchestrationScenarios: string[];
        adapterSettings: Record<string, unknown>;
    };
}
/**
 * Dialog协议工厂类
 * 负责创建和管理Dialog协议实例
 */
export declare class DialogProtocolFactory {
    private static _instance;
    private _protocolInstances;
    private _factoryConfig;
    private constructor();
    /**
     * 获取工厂单例实例
     * @param config 工厂配置
     * @returns 工厂实例
     */
    static getInstance(config?: ProtocolFactoryConfig): DialogProtocolFactory;
    /**
     * 创建Dialog协议实例
     * @param instanceConfig 实例配置
     * @returns 协议实例
     */
    createProtocolInstance(instanceConfig: ProtocolInstanceConfig): Promise<IMLPPProtocol>;
    /**
     * 获取协议实例
     * @param instanceId 实例ID
     * @returns 协议实例或null
     */
    getProtocolInstance(instanceId: string): IMLPPProtocol | null;
    /**
     * 销毁协议实例
     * @param instanceId 实例ID
     */
    destroyProtocolInstance(instanceId: string): Promise<void>;
    /**
     * 获取所有协议实例
     * @returns 协议实例映射
     */
    getAllProtocolInstances(): Map<string, IMLPPProtocol>;
    /**
     * 获取工厂状态
     * @returns 工厂状态
     */
    getFactoryStatus(): {
        totalInstances: number;
        activeInstances: number;
        factoryConfig: ProtocolFactoryConfig;
        instanceIds: string[];
    };
    /**
     * 更新工厂配置
     * @param newConfig 新配置
     */
    updateFactoryConfig(newConfig: Partial<ProtocolFactoryConfig>): Promise<void>;
    /**
     * 工厂健康检查
     * @returns 健康状态
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        instances: {
            [instanceId: string]: string;
        };
        factoryMetrics: {
            totalInstances: number;
            healthyInstances: number;
            unhealthyInstances: number;
        };
    }>;
    /**
     * 创建依赖服务
     * @returns 依赖服务对象
     */
    private _createDependencies;
    /**
     * 配置协议实例
     * @param instance 协议实例
     * @param config 实例配置
     */
    private _configureProtocolInstance;
    /**
     * 记录工厂事件
     * @param eventType 事件类型
     * @param eventData 事件数据
     */
    private _recordFactoryEvent;
    /**
     * 清理工厂资源
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=dialog-protocol.factory.d.ts.map
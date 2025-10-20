/**
 * Collab协议工厂
 *
 * @description Collab模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 * @pattern 基于Context/Plan/Confirm/Trace/Extension模块的IDENTICAL工厂模式
 */
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Collab协议工厂配置
 */
export interface CollabProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxParticipants?: number;
    defaultCoordinationType?: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    defaultDecisionMaking?: 'consensus' | 'majority' | 'weighted' | 'coordinator';
    crossCuttingConcerns?: {
        security?: {
            enabled: boolean;
        };
        performance?: {
            enabled: boolean;
        };
        eventBus?: {
            enabled: boolean;
        };
        errorHandler?: {
            enabled: boolean;
        };
        coordination?: {
            enabled: boolean;
        };
        orchestration?: {
            enabled: boolean;
        };
        stateSync?: {
            enabled: boolean;
        };
        transaction?: {
            enabled: boolean;
        };
        protocolVersion?: {
            enabled: boolean;
        };
    };
}
/**
 * Collab协议工厂
 *
 * @description 提供Collab协议的标准化创建和配置，基于其他5个模块的成功工厂模式
 */
export declare class CollabProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): CollabProtocolFactory;
    /**
     * 创建Collab协议实例
     */
    createProtocol(config?: CollabProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 创建带配置的协议实例
     */
    createConfiguredProtocol(config: CollabProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 健康检查
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 重置工厂状态
     */
    reset(): void;
    /**
     * 销毁工厂实例
     */
    static destroy(): void;
    /**
     * 获取默认配置
     */
    static getDefaultConfig(): CollabProtocolFactoryConfig;
    /**
     * 验证配置
     */
    static validateConfig(config: CollabProtocolFactoryConfig): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=collab-protocol.factory.d.ts.map
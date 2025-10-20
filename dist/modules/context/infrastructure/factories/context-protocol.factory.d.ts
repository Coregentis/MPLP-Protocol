/**
 * Context协议工厂
 *
 * @description Context模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */
import { ContextProtocol } from '../protocols/context.protocol.js';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base.js';
/**
 * Context协议工厂配置
 */
export interface ContextProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
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
 * Context协议工厂
 *
 * @description 提供Context协议的标准化创建和配置
 */
export declare class ContextProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): ContextProtocolFactory;
    /**
     * 创建Context协议实例
     */
    createProtocol(config?: ContextProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 获取已创建的协议实例
     */
    getProtocol(): ContextProtocol | null;
    /**
     * 重置工厂（主要用于测试）
     */
    reset(): void;
    /**
     * 创建协议实例（静态方法）
     */
    static create(config?: ContextProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 获取协议元数据（静态方法）
     */
    static getMetadata(): Promise<ProtocolMetadata>;
    /**
     * 健康检查（静态方法）
     */
    static healthCheck(): Promise<HealthStatus>;
}
//# sourceMappingURL=context-protocol.factory.d.ts.map
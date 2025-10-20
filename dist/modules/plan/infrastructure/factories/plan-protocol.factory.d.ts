/**
 * Plan协议工厂
 *
 * @description Plan模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */
import { PlanProtocol } from '../protocols/plan.protocol';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Plan协议工厂配置
 */
export interface PlanProtocolFactoryConfig {
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
 * Plan协议工厂
 *
 * @description 提供Plan协议的标准化创建和配置
 */
export declare class PlanProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): PlanProtocolFactory;
    /**
     * 创建Plan协议实例
     */
    createProtocol(config?: PlanProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议健康状态
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * 重置协议实例
     */
    reset(): void;
    /**
     * 销毁协议实例
     */
    destroy(): Promise<void>;
    /**
     * 获取当前协议实例
     */
    getCurrentProtocol(): PlanProtocol | null;
    /**
     * 检查协议是否已初始化
     */
    isInitialized(): boolean;
    /**
     * 创建协议的便捷方法
     */
    static create(config?: PlanProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 获取默认配置
     */
    static getDefaultConfig(): PlanProtocolFactoryConfig;
    /**
     * 创建开发环境配置
     */
    static getDevelopmentConfig(): PlanProtocolFactoryConfig;
    /**
     * 创建生产环境配置
     */
    static getProductionConfig(): PlanProtocolFactoryConfig;
}
//# sourceMappingURL=plan-protocol.factory.d.ts.map
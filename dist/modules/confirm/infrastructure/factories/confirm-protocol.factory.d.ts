/**
 * Confirm协议工厂
 *
 * @description 基于Context和Plan模块的企业级标准，创建和配置Confirm协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 * @pattern 单例模式，确保协议实例的唯一性和一致性
 */
import { ConfirmProtocol } from '../protocols/confirm.protocol';
/**
 * Confirm协议工厂配置
 */
export interface ConfirmProtocolFactoryConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    crossCuttingConcerns?: Record<string, {
        enabled: boolean;
    }>;
}
/**
 * Confirm协议工厂类
 *
 * @description 基于Context和Plan模块的成功模式，实现统一的协议创建和配置管理
 * @pattern 单例模式，确保所有模块使用相同的协议实例
 */
export declare class ConfirmProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): ConfirmProtocolFactory;
    /**
     * 创建Confirm协议实例
     *
     * @description 基于Context和Plan模块的企业级标准，集成9个L3横切关注点管理器
     */
    createProtocol(config?: ConfirmProtocolFactoryConfig): Promise<ConfirmProtocol>;
    /**
     * 获取已创建的协议实例
     */
    getProtocol(): ConfirmProtocol | null;
    /**
     * 重置工厂（主要用于测试）
     */
    reset(): void;
    /**
     * 创建仓库实例
     */
    private createRepository;
    /**
     * 协议健康检查
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    /**
     * 获取协议元数据
     */
    getMetadata(): import("../../../../core/protocols/mplp-protocol-base").ProtocolMetadata;
    /**
     * 协议配置验证
     */
    validateConfig(config: ConfirmProtocolFactoryConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * 获取工厂统计信息
     */
    getStatistics(): {
        protocolInitialized: boolean;
        factoryVersion: string;
        supportedRepositoryTypes: string[];
        supportedCrossCuttingConcerns: string[];
    };
}
//# sourceMappingURL=confirm-protocol.factory.d.ts.map
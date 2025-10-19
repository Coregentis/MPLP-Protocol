/**
 * 横切关注点工厂
 *
 * @description 创建和配置所有L3管理器的工厂类
 * @version 1.0.0
 * @pattern 单例模式，确保所有模块使用相同的管理器实例
 */
import { MLPPSecurityManager } from './security-manager';
import { MLPPPerformanceMonitor } from './performance-monitor';
import { MLPPEventBusManager } from './event-bus-manager';
import { MLPPErrorHandler } from './error-handler';
import { MLPPCoordinationManager } from './coordination-manager';
import { MLPPOrchestrationManager } from './orchestration-manager';
import { MLPPStateSyncManager } from './state-sync-manager';
import { MLPPTransactionManager } from './transaction-manager';
import { MLPPProtocolVersionManager } from './protocol-version-manager';
/**
 * 横切关注点配置接口
 */
export interface CrossCuttingConcernsConfig {
    security?: {
        enabled: boolean;
        authenticationMethods?: string[];
        sessionTimeout?: number;
    };
    performance?: {
        enabled: boolean;
        collectionInterval?: number;
        retentionPeriod?: number;
    };
    eventBus?: {
        enabled: boolean;
        maxListeners?: number;
    };
    errorHandler?: {
        enabled: boolean;
        logLevel?: string;
        maxErrors?: number;
    };
    coordination?: {
        enabled: boolean;
        timeout?: number;
    };
    orchestration?: {
        enabled: boolean;
        maxConcurrentWorkflows?: number;
    };
    stateSync?: {
        enabled: boolean;
        syncInterval?: number;
    };
    transaction?: {
        enabled: boolean;
        defaultTimeout?: number;
    };
    protocolVersion?: {
        enabled: boolean;
        strictVersioning?: boolean;
    };
}
/**
 * 横切关注点管理器集合
 */
export interface CrossCuttingManagers {
    security: MLPPSecurityManager;
    performance: MLPPPerformanceMonitor;
    eventBus: MLPPEventBusManager;
    errorHandler: MLPPErrorHandler;
    coordination: MLPPCoordinationManager;
    orchestration: MLPPOrchestrationManager;
    stateSync: MLPPStateSyncManager;
    transaction: MLPPTransactionManager;
    protocolVersion: MLPPProtocolVersionManager;
}
/**
 * 横切关注点工厂类
 *
 * @description 单例工厂，确保所有模块使用相同的管理器实例
 */
export declare class CrossCuttingConcernsFactory {
    private static instance;
    private managers;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): CrossCuttingConcernsFactory;
    /**
     * 创建所有横切关注点管理器
     */
    createManagers(config?: CrossCuttingConcernsConfig): CrossCuttingManagers;
    /**
     * 获取已创建的管理器
     */
    getManagers(): CrossCuttingManagers | null;
    /**
     * 重置工厂（主要用于测试）
     */
    reset(): void;
    /**
     * 应用配置到管理器
     */
    private applyConfiguration;
    /**
     * 应用安全管理器配置
     */
    private applySecurityConfig;
    /**
     * 应用性能监控配置
     */
    private applyPerformanceConfig;
    /**
     * 应用事件总线配置
     */
    private applyEventBusConfig;
    /**
     * 应用错误处理配置
     */
    private applyErrorHandlerConfig;
    /**
     * 应用协调管理器配置
     */
    private applyCoordinationConfig;
    /**
     * 应用编排管理器配置
     */
    private applyOrchestrationConfig;
    /**
     * 应用状态同步配置
     */
    private applyStateSyncConfig;
    /**
     * 应用事务管理器配置
     */
    private applyTransactionConfig;
    /**
     * 应用协议版本管理器配置
     */
    private applyProtocolVersionConfig;
    /**
     * 健康检查所有管理器
     */
    healthCheckAll(): Promise<Record<string, boolean>>;
}
//# sourceMappingURL=factory.d.ts.map
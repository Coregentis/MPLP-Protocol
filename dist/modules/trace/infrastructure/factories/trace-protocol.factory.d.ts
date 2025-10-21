/**
 * Trace协议工厂
 *
 * @description 创建和配置Trace协议实例，集成9个L3横切关注点管理器
 * @version 1.0.0
 * @pattern 单例模式，与Context、Plan、Role、Confirm模块使用IDENTICAL架构
 * @integration 统一L3管理器注入模式
 */
import { TraceProtocol } from '../protocols/trace.protocol';
import { ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Trace协议工厂配置
 */
export interface TraceProtocolFactoryConfig {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    maxCacheSize?: number;
    cacheTimeout?: number;
    traceConfiguration?: {
        maxTraces?: number;
        defaultTraceType?: 'execution' | 'decision' | 'event' | 'error' | 'performance' | 'context';
        retentionPeriodDays?: number;
        compressionEnabled?: boolean;
        indexingEnabled?: boolean;
    };
    monitoringConfiguration?: {
        enabled?: boolean;
        samplingRate?: number;
        alertThresholds?: {
            errorRate?: number;
            latencyP99Ms?: number;
            throughputRps?: number;
        };
        exportInterval?: number;
    };
    performanceMetrics?: {
        enabled?: boolean;
        collectionIntervalSeconds?: number;
        traceCreationLatencyThresholdMs?: number;
        traceQueryLatencyThresholdMs?: number;
        storageEfficiencyThreshold?: number;
    };
    crossCuttingConcerns?: {
        security?: {
            enabled?: boolean;
        };
        performance?: {
            enabled?: boolean;
        };
        eventBus?: {
            enabled?: boolean;
        };
        errorHandler?: {
            enabled?: boolean;
        };
        coordination?: {
            enabled?: boolean;
        };
        orchestration?: {
            enabled?: boolean;
        };
        stateSync?: {
            enabled?: boolean;
        };
        transaction?: {
            enabled?: boolean;
        };
        protocolVersion?: {
            enabled?: boolean;
        };
    };
    enableRealTimeMonitoring?: boolean;
    enableCorrelationAnalysis?: boolean;
    enableDistributedTracing?: boolean;
    maxTraceRetentionDays?: number;
    enableAutoArchiving?: boolean;
}
/**
 * Trace协议工厂类
 *
 * @description 单例工厂，负责创建和配置Trace协议实例
 */
export declare class TraceProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): TraceProtocolFactory;
    /**
     * 创建Trace协议实例
     */
    createProtocol(config?: TraceProtocolFactoryConfig): Promise<TraceProtocol>;
    /**
     * 获取已创建的协议实例
     */
    getProtocol(): TraceProtocol | null;
    /**
     * 重置工厂（主要用于测试）
     */
    reset(): void;
    /**
     * 创建仓库实例
     */
    private createRepository;
    /**
     * 获取默认配置
     */
    static getDefaultConfig(): TraceProtocolFactoryConfig;
    /**
     * 获取工厂元数据
     */
    getMetadata(): {
        name: string;
        version: string;
        description: string;
        supportedRepositoryTypes: string[];
        crossCuttingConcerns: string[];
        capabilities: string[];
    };
    /**
     * 获取协议元数据
     * @description 基于mplp-trace.json Schema的元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议健康状态
     * @description 基于Schema定义的健康检查
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * 销毁协议实例
     * @description 清理资源和连接
     */
    destroy(): Promise<void>;
}
/**
 * 默认Trace协议工厂配置
 * @description 基于mplp-trace.json Schema的默认配置
 */
export declare const DEFAULT_TRACE_PROTOCOL_CONFIG: TraceProtocolFactoryConfig;
//# sourceMappingURL=trace-protocol.factory.d.ts.map
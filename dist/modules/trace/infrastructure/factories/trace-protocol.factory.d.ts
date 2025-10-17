import { TraceProtocol } from '../protocols/trace.protocol';
import { ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
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
export declare class TraceProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    static getInstance(): TraceProtocolFactory;
    createProtocol(config?: TraceProtocolFactoryConfig): Promise<TraceProtocol>;
    getProtocol(): TraceProtocol | null;
    reset(): void;
    private createRepository;
    private validateConfig;
    static getDefaultConfig(): TraceProtocolFactoryConfig;
    getMetadata(): {
        name: string;
        version: string;
        description: string;
        supportedRepositoryTypes: string[];
        crossCuttingConcerns: string[];
        capabilities: string[];
    };
    getProtocolMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<HealthStatus>;
    destroy(): Promise<void>;
}
export declare const DEFAULT_TRACE_PROTOCOL_CONFIG: TraceProtocolFactoryConfig;
//# sourceMappingURL=trace-protocol.factory.d.ts.map
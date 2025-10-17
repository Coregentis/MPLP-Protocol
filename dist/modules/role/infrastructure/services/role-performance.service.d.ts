import { MLPPPerformanceMonitor } from '../../../../core/protocols/cross-cutting-concerns/performance-monitor';
export declare enum PerformanceMetricType {
    LATENCY = "latency",
    THROUGHPUT = "throughput",
    ERROR_RATE = "error_rate",
    MEMORY_USAGE = "memory_usage",
    CPU_USAGE = "cpu_usage",
    CACHE_HIT_RATE = "cache_hit_rate",
    PERMISSION_CHECK = "permission_check",
    ROLE_OPERATION = "role_operation"
}
export declare enum AlertLevel {
    INFO = "info",
    WARNING = "warning",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export interface RolePerformanceMetric {
    id: string;
    type: PerformanceMetricType;
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    tags: Record<string, string>;
    metadata?: Record<string, unknown>;
}
export interface PerformanceAlert {
    id: string;
    level: AlertLevel;
    metric: string;
    threshold: number;
    currentValue: number;
    message: string;
    timestamp: number;
    resolved: boolean;
    resolvedAt?: number;
}
export interface OperationTrace {
    traceId: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'running' | 'completed' | 'failed';
    metadata?: Record<string, unknown>;
    childTraces?: OperationTrace[];
}
export interface PerformanceBenchmark {
    operation: string;
    p50: number;
    p95: number;
    p99: number;
    mean: number;
    min: number;
    max: number;
    sampleCount: number;
    lastUpdated: number;
}
export interface RolePerformanceConfig {
    enabled: boolean;
    collectionInterval: number;
    retentionPeriod: number;
    alertThresholds: Record<string, number>;
    benchmarkEnabled: boolean;
    realTimeAlertsEnabled: boolean;
    detailedTracing: boolean;
    optimizationEnabled: boolean;
}
export declare class RolePerformanceService {
    private mlppPerformanceMonitor?;
    private metrics;
    private alerts;
    private traces;
    private benchmarks;
    private logger;
    private config;
    private metricsTimer?;
    private cleanupTimer?;
    constructor(config?: Partial<RolePerformanceConfig>, mlppPerformanceMonitor?: MLPPPerformanceMonitor | undefined);
    startTrace(operationName: string, metadata?: Record<string, unknown>): string;
    endTrace(traceId: string, status?: 'completed' | 'failed', error?: Error): Promise<void>;
    recordMetric(metricData: Omit<RolePerformanceMetric, 'id' | 'timestamp'>): Promise<void>;
    optimizePermissionCheck<T>(operation: () => Promise<T>, context: {
        roleId?: string;
        permission?: string;
        resourceId?: string;
    }): Promise<T>;
    getPerformanceStats(): {
        totalMetrics: number;
        activeTraces: number;
        totalAlerts: number;
        unresolvedAlerts: number;
        benchmarks: Record<string, PerformanceBenchmark>;
        recentMetrics: RolePerformanceMetric[];
    };
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        score: number;
        issues: string[];
        recommendations: string[];
    };
    private checkAlertThresholds;
    private determineAlertLevel;
    private sendRealTimeAlert;
    private updateBenchmark;
    private startMetricsCollection;
    private collectSystemMetrics;
    private startCleanupTimer;
    private cleanupOldData;
    private generateTraceId;
    private generateMetricId;
    private generateAlertId;
    resolveAlert(alertId: string): Promise<boolean>;
    getUnresolvedAlerts(): PerformanceAlert[];
    getOperationBenchmarks(): Map<string, PerformanceBenchmark>;
    resetBenchmarks(): void;
    destroy(): Promise<void>;
}
export declare function createRolePerformanceService(config?: Partial<RolePerformanceConfig>, mlppPerformanceMonitor?: MLPPPerformanceMonitor): RolePerformanceService;
//# sourceMappingURL=role-performance.service.d.ts.map
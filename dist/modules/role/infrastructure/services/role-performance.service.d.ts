/**
 * Role模块企业级性能监控服务
 *
 * @description 提供详细性能指标收集、实时告警、权限检查算法优化等企业级功能
 * @version 1.0.0
 * @layer 基础设施层 - 服务
 */
import { MLPPPerformanceMonitor } from '../../../../core/protocols/cross-cutting-concerns/performance-monitor';
/**
 * 性能指标类型
 */
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
/**
 * 性能告警级别
 */
export declare enum AlertLevel {
    INFO = "info",
    WARNING = "warning",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
/**
 * 性能指标接口
 */
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
/**
 * 性能告警接口
 */
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
/**
 * 操作追踪接口
 */
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
/**
 * 性能基准接口
 */
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
/**
 * 性能配置接口
 */
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
/**
 * Role模块企业级性能监控服务
 *
 * @description 高性能监控系统，支持实时告警、基准测试、算法优化
 */
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
    /**
     * 开始操作追踪
     */
    startTrace(operationName: string, metadata?: Record<string, unknown>): string;
    /**
     * 结束操作追踪
     */
    endTrace(traceId: string, status?: 'completed' | 'failed', error?: Error): Promise<void>;
    /**
     * 记录性能指标
     */
    recordMetric(metricData: Omit<RolePerformanceMetric, 'id' | 'timestamp'>): Promise<void>;
    /**
     * 优化权限检查算法
     */
    optimizePermissionCheck<T>(operation: () => Promise<T>, context: {
        roleId?: string;
        permission?: string;
        resourceId?: string;
    }): Promise<T>;
    /**
     * 获取性能统计
     */
    getPerformanceStats(): {
        totalMetrics: number;
        activeTraces: number;
        totalAlerts: number;
        unresolvedAlerts: number;
        benchmarks: Record<string, PerformanceBenchmark>;
        recentMetrics: RolePerformanceMetric[];
    };
    /**
     * 获取性能健康状态
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        score: number;
        issues: string[];
        recommendations: string[];
    };
    /**
     * 检查告警阈值
     */
    private checkAlertThresholds;
    /**
     * 确定告警级别
     */
    private determineAlertLevel;
    /**
     * 发送实时告警
     */
    private sendRealTimeAlert;
    /**
     * 更新基准测试
     */
    private updateBenchmark;
    /**
     * 开始指标收集
     */
    private startMetricsCollection;
    /**
     * 收集系统指标
     */
    private collectSystemMetrics;
    /**
     * 开始清理定时器
     */
    private startCleanupTimer;
    /**
     * 清理过期数据
     */
    private cleanupOldData;
    /**
     * 生成追踪ID
     */
    private generateTraceId;
    /**
     * 生成指标ID
     */
    private generateMetricId;
    /**
     * 生成告警ID
     */
    private generateAlertId;
    /**
     * 解决告警
     */
    resolveAlert(alertId: string): Promise<boolean>;
    /**
     * 获取未解决的告警
     */
    getUnresolvedAlerts(): PerformanceAlert[];
    /**
     * 获取操作基准
     */
    getOperationBenchmarks(): Map<string, PerformanceBenchmark>;
    /**
     * 重置基准测试
     */
    resetBenchmarks(): void;
    /**
     * 销毁性能监控服务
     */
    destroy(): Promise<void>;
}
/**
 * 创建Role性能监控服务实例的工厂函数
 */
export declare function createRolePerformanceService(config?: Partial<RolePerformanceConfig>, mlppPerformanceMonitor?: MLPPPerformanceMonitor): RolePerformanceService;
//# sourceMappingURL=role-performance.service.d.ts.map
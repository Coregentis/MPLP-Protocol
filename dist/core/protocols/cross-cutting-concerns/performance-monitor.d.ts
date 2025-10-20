/**
 * MPLP性能监控管理器
 *
 * @description L3层统一性能监控，提供指标收集、分析和告警功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 性能指标接口
 */
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
}
/**
 * 性能监控配置
 */
export interface PerformanceConfig {
    enabled: boolean;
    collectionInterval: number;
    retentionPeriod: number;
    alertThresholds: Record<string, number>;
    exportFormats: string[];
}
/**
 * 性能告警
 */
export interface PerformanceAlert {
    id: string;
    metricName: string;
    threshold: number;
    currentValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    message: string;
    resolved: boolean;
}
/**
 * 操作性能跟踪
 */
export interface OperationTrace {
    operationId: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'running' | 'completed' | 'failed';
    metadata?: Record<string, unknown>;
}
/**
 * MPLP性能监控管理器
 *
 * @description 统一的性能监控实现，所有模块使用相同的监控策略
 */
export declare class MLPPPerformanceMonitor {
    private metrics;
    private alerts;
    private activeTraces;
    private config;
    /**
     * 记录性能指标
     */
    recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): Promise<void>;
    /**
     * 开始操作跟踪
     */
    startTrace(operationName: string, metadata?: Record<string, unknown>): string;
    /**
     * 结束操作跟踪
     */
    endTrace(operationId: string, status?: 'completed' | 'failed'): Promise<OperationTrace | null>;
    /**
     * 获取性能指标
     */
    getMetrics(filter?: {
        name?: string;
        startTime?: string;
        endTime?: string;
        tags?: Record<string, string>;
    }): PerformanceMetric[];
    /**
     * 获取实时性能统计
     */
    getRealTimeStats(): Record<string, unknown>;
    /**
     * 获取活动告警
     */
    getActiveAlerts(): PerformanceAlert[];
    /**
     * 解决告警
     */
    resolveAlert(alertId: string): Promise<boolean>;
    /**
     * 导出性能数据
     */
    exportMetrics(_format?: string): Promise<string>;
    /**
     * 更新监控配置
     */
    updateConfig(newConfig: Partial<PerformanceConfig>): void;
    /**
     * 检查告警阈值
     */
    private checkAlertThresholds;
    /**
     * 计算告警严重程度
     */
    private calculateSeverity;
    /**
     * 清理过期指标
     */
    private cleanupOldMetrics;
    /**
     * 导出Prometheus格式
     */
    private exportPrometheusFormat;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=performance-monitor.d.ts.map
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
}
export interface PerformanceConfig {
    enabled: boolean;
    collectionInterval: number;
    retentionPeriod: number;
    alertThresholds: Record<string, number>;
    exportFormats: string[];
}
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
export interface OperationTrace {
    operationId: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    status: 'running' | 'completed' | 'failed';
    metadata?: Record<string, unknown>;
}
export declare class MLPPPerformanceMonitor {
    private metrics;
    private alerts;
    private activeTraces;
    private config;
    recordMetric(name: string, value: number, unit: string, tags?: Record<string, string>): Promise<void>;
    startTrace(operationName: string, metadata?: Record<string, unknown>): string;
    endTrace(operationId: string, status?: 'completed' | 'failed'): Promise<OperationTrace | null>;
    getMetrics(filter?: {
        name?: string;
        startTime?: string;
        endTime?: string;
        tags?: Record<string, string>;
    }): PerformanceMetric[];
    getRealTimeStats(): Record<string, unknown>;
    getActiveAlerts(): PerformanceAlert[];
    resolveAlert(alertId: string): Promise<boolean>;
    exportMetrics(_format?: string): Promise<string>;
    updateConfig(newConfig: Partial<PerformanceConfig>): void;
    private checkAlertThresholds;
    private calculateSeverity;
    private cleanupOldMetrics;
    private exportPrometheusFormat;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=performance-monitor.d.ts.map
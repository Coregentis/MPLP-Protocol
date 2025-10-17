import { UUID, Timestamp } from '../../modules/core/types';
export interface MonitoringConfig {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableTracing: boolean;
    enableAlerting: boolean;
    metricsInterval: number;
    logLevel: LogLevel;
    retentionDays: number;
    alertThresholds: AlertThresholds;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface AlertThresholds {
    cpuUsage: number;
    memoryUsage: number;
    errorRate: number;
    responseTime: number;
    connectionCount: number;
}
export interface ExecutionStatus {
    executionId: UUID;
    workflowId: UUID;
    status: ExecutionState;
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number;
    currentStage?: string;
    progress: ExecutionProgress;
    metrics: ExecutionMetrics;
    errors: ExecutionError[];
}
export type ExecutionState = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface ExecutionProgress {
    totalStages: number;
    completedStages: number;
    failedStages: number;
    progressPercentage: number;
    estimatedTimeRemaining?: number;
}
export interface ExecutionMetrics {
    cpuUsage: number;
    memoryUsage: number;
    networkIO: number;
    diskIO: number;
    moduleCallCount: number;
    averageResponseTime: number;
}
export interface ExecutionError {
    errorId: UUID;
    errorType: string;
    message: string;
    stackTrace?: string;
    timestamp: Timestamp;
    context?: Record<string, unknown>;
}
export interface PerformanceMetrics {
    timestamp: Timestamp;
    system: SystemMetrics;
    application: ApplicationMetrics;
    business: BusinessMetrics;
}
export interface SystemMetrics {
    cpu: CpuMetrics;
    memory: MemoryMetrics;
    disk: DiskMetrics;
    network: NetworkMetrics;
}
export interface CpuMetrics {
    usage: number;
    loadAverage: number[];
    processes: number;
    threads: number;
}
export interface MemoryMetrics {
    total: number;
    used: number;
    free: number;
    cached: number;
    heapUsed: number;
    heapTotal: number;
}
export interface DiskMetrics {
    usage: number;
    readOps: number;
    writeOps: number;
    readBytes: number;
    writeBytes: number;
}
export interface NetworkMetrics {
    connections: number;
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
}
export interface ApplicationMetrics {
    activeExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    moduleCallRate: number;
    errorRate: number;
    throughput: number;
}
export interface BusinessMetrics {
    workflowsPerHour: number;
    successRate: number;
    userSatisfactionScore: number;
    costPerExecution: number;
    resourceEfficiency: number;
}
export interface LogEntry {
    logId: UUID;
    timestamp: Timestamp;
    level: LogLevel;
    message: string;
    category: string;
    source: string;
    executionId?: UUID;
    workflowId?: UUID;
    moduleId?: string;
    userId?: string;
    sessionId?: string;
    context?: Record<string, unknown>;
    metadata?: LogMetadata;
}
export interface LogMetadata {
    version: string;
    environment: string;
    hostname: string;
    processId: number;
    threadId?: string;
    correlationId?: UUID;
    traceId?: UUID;
    spanId?: UUID;
}
export interface ErrorTrace {
    traceId: UUID;
    errorId: UUID;
    timestamp: Timestamp;
    errorType: string;
    severity: ErrorSeverity;
    message: string;
    stackTrace: string;
    source: ErrorSource;
    context: ErrorContext;
    resolution?: ErrorResolution;
}
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface ErrorSource {
    moduleId: string;
    serviceId?: string;
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
}
export interface ErrorContext {
    executionId?: UUID;
    workflowId?: UUID;
    userId?: string;
    sessionId?: string;
    requestId?: UUID;
    parameters?: Record<string, unknown>;
    environment: Record<string, unknown>;
}
export interface ErrorResolution {
    status: 'pending' | 'investigating' | 'resolved' | 'ignored';
    assignedTo?: string;
    resolution?: string;
    resolvedAt?: Timestamp;
    preventionMeasures?: string[];
}
export interface Alert {
    alertId: UUID;
    timestamp: Timestamp;
    severity: AlertSeverity;
    type: AlertType;
    title: string;
    description: string;
    source: string;
    metrics: Record<string, number>;
    threshold: number;
    currentValue: number;
    status: AlertStatus;
    acknowledgedBy?: string;
    acknowledgedAt?: Timestamp;
    resolvedAt?: Timestamp;
}
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertType = 'performance' | 'error' | 'resource' | 'security' | 'business';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed';
export declare class SystemMonitor {
    private config;
    private executionStatuses;
    private logEntries;
    private errorTraces;
    private alerts;
    private metricsHistory;
    private monitoringInterval;
    constructor(config?: Partial<MonitoringConfig>);
    startExecutionMonitoring(executionId: UUID, workflowId: UUID): void;
    updateExecutionStatus(executionId: UUID, updates: Partial<ExecutionStatus>): void;
    stopExecutionMonitoring(executionId: UUID): void;
    collectPerformanceMetrics(): Promise<PerformanceMetrics>;
    log(level: LogLevel, message: string, category: string, context?: Record<string, unknown>): void;
    traceError(error: Error, context?: Partial<ErrorContext>): ErrorTrace;
    createAlert(type: AlertType, title: string, description: string, metrics: Record<string, number>): Alert;
    getMonitoringStatistics(): MonitoringStatistics;
    private startMonitoring;
    private getActiveExecutionCount;
    private getCompletedExecutionCount;
    private getFailedExecutionCount;
    private getAverageExecutionTime;
    private getErrorRate;
    private getThroughput;
    private getWorkflowsPerHour;
    private getSuccessRate;
    private getActiveConnectionCount;
    private checkAlertThresholds;
    private determineSeverity;
    private determineAlertSeverity;
    private getThresholdForType;
    private getCurrentValueForType;
    private extractFunctionName;
    private extractFileName;
    private extractLineNumber;
    private cleanupOldMetrics;
    private cleanupOldLogs;
    private cleanupOldTraces;
    private generateUUID;
    destroy(): void;
}
export interface MonitoringStatistics {
    activeExecutions: number;
    totalLogEntries: number;
    totalErrorTraces: number;
    activeAlerts: number;
    metricsDataPoints: number;
    uptime: number;
    lastMetricsCollection?: Timestamp;
}
//# sourceMappingURL=system.monitor.d.ts.map
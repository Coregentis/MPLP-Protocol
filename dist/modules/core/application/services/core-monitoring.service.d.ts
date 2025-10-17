import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, HealthStatus, CheckStatus } from '../../types';
export interface SystemHealthStatus {
    overall: HealthStatus;
    modules: ModuleHealthStatus[];
    resources: ResourceHealthStatus;
    network: NetworkHealthStatus;
    timestamp: string;
}
export interface ModuleHealthStatus {
    moduleId: string;
    moduleName: string;
    status: HealthStatus;
    lastCheck: string;
    responseTime: number;
    errorCount: number;
    checks: HealthCheckResult[];
}
export interface ResourceHealthStatus {
    cpu: {
        usage: number;
        status: HealthStatus;
    };
    memory: {
        usage: number;
        status: HealthStatus;
    };
    disk: {
        usage: number;
        status: HealthStatus;
    };
    network: {
        usage: number;
        status: HealthStatus;
    };
}
export interface NetworkHealthStatus {
    connectivity: HealthStatus;
    latency: number;
    throughput: number;
    errorRate: number;
    activeConnections: number;
}
export interface HealthCheckResult {
    checkName: string;
    status: CheckStatus;
    message?: string;
    durationMs: number;
    timestamp: string;
}
export interface AlertData {
    alertId?: UUID;
    alertType: 'performance' | 'error' | 'security' | 'resource' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    source: string;
    metadata?: Record<string, unknown>;
    timestamp?: string;
}
export interface AlertResult {
    alertId: UUID;
    processed: boolean;
    actions: string[];
    notifications: string[];
    escalated: boolean;
    resolvedAt?: string;
}
export type MonitoringReportType = 'daily' | 'weekly' | 'monthly' | 'custom';
export interface MonitoringReport {
    reportId: UUID;
    reportType: MonitoringReportType;
    generatedAt: string;
    period: {
        startDate: string;
        endDate: string;
    };
    summary: {
        totalWorkflows: number;
        successfulWorkflows: number;
        failedWorkflows: number;
        averageResponseTime: number;
        systemUptime: number;
        errorRate: number;
    };
    trends: {
        performanceTrend: 'improving' | 'stable' | 'degrading';
        errorTrend: 'decreasing' | 'stable' | 'increasing';
        resourceTrend: 'optimizing' | 'stable' | 'increasing';
    };
    recommendations: string[];
    alerts: AlertData[];
}
export declare class CoreMonitoringService {
    private readonly coreRepository;
    private readonly alerts;
    private readonly healthHistory;
    constructor(coreRepository: ICoreRepository);
    performHealthCheck(): Promise<SystemHealthStatus>;
    manageAlerts(alertData: AlertData): Promise<AlertResult>;
    generateMonitoringReport(reportType: MonitoringReportType, customPeriod?: {
        startDate: string;
        endDate: string;
    }): Promise<MonitoringReport>;
    getAlertHistory(hours?: number): AlertData[];
    getHealthHistory(hours?: number): SystemHealthStatus[];
    getSystemStatistics(): Promise<{
        totalAlerts: number;
        criticalAlerts: number;
        averageResponseTime: number;
        systemUptime: number;
        healthScore: number;
    }>;
    private checkAllModulesHealth;
    private performModuleHealthChecks;
    private determineModuleHealth;
    private getModuleName;
    private checkSystemResources;
    private checkNetworkConnectivity;
    private calculateOverallHealth;
    private validateAlertData;
    private assessAlertSeverity;
    private processAlert;
    private getReportPeriod;
    private collectMonitoringData;
    private analyzeMonitoringTrends;
    private createMonitoringReport;
    private calculateHealthScore;
}
//# sourceMappingURL=core-monitoring.service.d.ts.map
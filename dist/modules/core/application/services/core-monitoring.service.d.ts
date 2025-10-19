/**
 * 监控管理服务
 * 职责：系统监控、健康检查、告警管理
 * 遵循DDD应用服务模式
 */
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
/**
 * 监控管理服务类
 * 提供系统监控、健康检查和告警管理功能
 */
export declare class CoreMonitoringService {
    private readonly coreRepository;
    private readonly alerts;
    private readonly healthHistory;
    constructor(coreRepository: ICoreRepository);
    /**
     * 执行系统健康检查
     * @returns 系统健康状态
     */
    performHealthCheck(): Promise<SystemHealthStatus>;
    /**
     * 管理系统告警
     * @param alertData 告警数据
     * @returns 告警处理结果
     */
    manageAlerts(alertData: AlertData): Promise<AlertResult>;
    /**
     * 生成监控报告
     * @param reportType 报告类型
     * @param customPeriod 自定义时间段
     * @returns 监控报告
     */
    generateMonitoringReport(reportType: MonitoringReportType, customPeriod?: {
        startDate: string;
        endDate: string;
    }): Promise<MonitoringReport>;
    /**
     * 获取告警历史
     * @param hours 获取最近几小时的告警
     * @returns 告警列表
     */
    getAlertHistory(hours?: number): AlertData[];
    /**
     * 获取健康检查历史
     * @param hours 获取最近几小时的健康检查
     * @returns 健康检查历史
     */
    getHealthHistory(hours?: number): SystemHealthStatus[];
    /**
     * 获取系统统计信息
     * @returns 系统统计
     */
    getSystemStatistics(): Promise<{
        totalAlerts: number;
        criticalAlerts: number;
        averageResponseTime: number;
        systemUptime: number;
        healthScore: number;
    }>;
    /**
     * 检查所有模块健康状态
     */
    private checkAllModulesHealth;
    /**
     * 执行模块健康检查
     */
    private performModuleHealthChecks;
    /**
     * 确定模块健康状态
     */
    private determineModuleHealth;
    /**
     * 获取模块名称
     */
    private getModuleName;
    /**
     * 检查系统资源状态
     */
    private checkSystemResources;
    /**
     * 检查网络连接状态
     */
    private checkNetworkConnectivity;
    /**
     * 计算综合健康状态
     */
    private calculateOverallHealth;
    /**
     * 验证告警数据
     */
    private validateAlertData;
    /**
     * 评估告警严重程度
     */
    private assessAlertSeverity;
    /**
     * 处理告警
     */
    private processAlert;
    /**
     * 获取报告时间段
     */
    private getReportPeriod;
    /**
     * 收集监控数据
     */
    private collectMonitoringData;
    /**
     * 分析监控趋势
     */
    private analyzeMonitoringTrends;
    /**
     * 创建监控报告
     */
    private createMonitoringReport;
    /**
     * 计算健康分数
     */
    private calculateHealthScore;
}
//# sourceMappingURL=core-monitoring.service.d.ts.map
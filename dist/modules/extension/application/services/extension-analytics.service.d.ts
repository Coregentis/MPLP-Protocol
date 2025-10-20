/**
 * Extension分析服务
 *
 * @description 扩展分析和监控服务，负责使用统计、性能监控、健康检查
 * @version 1.0.0
 * @layer Application层 - 应用服务
 * @pattern 基于重构指南的3服务架构设计
 */
import { UUID } from '../../../../shared/types';
import { IExtensionRepository } from '../../domain/repositories/extension.repository.interface';
import { ExtensionPerformanceMetrics, ExtensionStatus } from '../../types';
export interface IMetricsCollector {
    collectUsageMetrics(extensionId: UUID): Promise<ExtensionUsageMetrics>;
    collectPerformanceMetrics(extensionId: UUID): Promise<ExtensionPerformanceMetrics>;
    collectHealthMetrics(extensionId: UUID): Promise<ExtensionHealthMetrics>;
}
export interface IAnalyticsEngine {
    analyzeUsagePatterns(metrics: ExtensionUsageMetrics[]): Promise<UsageAnalysis>;
    analyzePerformanceTrends(metrics: ExtensionPerformanceMetrics[]): Promise<PerformanceAnalysis>;
    detectAnomalies(metrics: ExtensionHealthMetrics[]): Promise<AnomalyDetection>;
}
export interface ExtensionUsageMetrics {
    extensionId: UUID;
    activationCount: number;
    usageTime: number;
    featureUsage: Record<string, number>;
    userCount: number;
    lastUsed: string;
    popularityScore: number;
}
export interface ExtensionHealthMetrics {
    extensionId: UUID;
    status: ExtensionStatus;
    uptime: number;
    errorCount: number;
    warningCount: number;
    memoryUsage: number;
    cpuUsage: number;
    healthScore: number;
}
export interface UsageAnalysis {
    totalUsage: number;
    averageUsageTime: number;
    mostUsedFeatures: string[];
    userEngagement: number;
    trends: UsageTrend[];
}
export interface PerformanceAnalysis {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: ResourceUtilization;
    performanceTrends: PerformanceTrend[];
}
export interface AnomalyDetection {
    anomalies: ExtensionAnomaly[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
}
export interface UsageTrend {
    period: string;
    value: number;
    change: number;
}
export interface PerformanceTrend {
    metric: string;
    period: string;
    value: number;
    trend: 'improving' | 'stable' | 'degrading';
}
export interface ResourceUtilization {
    memory: number;
    cpu: number;
    network: number;
    storage: number;
}
export interface ExtensionAnomaly {
    type: 'performance' | 'usage' | 'error' | 'security';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: string;
    affectedExtensions: UUID[];
}
export interface AnalyticsReport {
    reportId: UUID;
    reportType: 'usage' | 'performance' | 'health' | 'comprehensive';
    generatedAt: string;
    timeRange: {
        start: string;
        end: string;
    };
    summary: AnalyticsSummary;
    details: AnalyticsDetails;
    recommendations: string[];
}
export interface AnalyticsSummary {
    totalExtensions: number;
    activeExtensions: number;
    averagePerformance: number;
    overallHealth: number;
    criticalIssues: number;
}
export interface AnalyticsDetails {
    usageAnalysis: UsageAnalysis;
    performanceAnalysis: PerformanceAnalysis;
    anomalyDetection: AnomalyDetection;
    extensionRankings: ExtensionRanking[];
}
export interface ExtensionRanking {
    extensionId: UUID;
    name: string;
    rank: number;
    score: number;
    category: 'performance' | 'usage' | 'reliability';
}
export interface GenerateReportRequest {
    reportType: 'usage' | 'performance' | 'health' | 'comprehensive';
    timeRange: {
        start: string;
        end: string;
    };
    extensionIds?: UUID[];
    includeDetails?: boolean;
}
export interface GetMetricsRequest {
    extensionId: UUID;
    metricTypes: ('usage' | 'performance' | 'health')[];
    timeRange?: {
        start: string;
        end: string;
    };
}
/**
 * Extension分析服务实现
 */
export declare class ExtensionAnalyticsService {
    private readonly extensionRepository;
    private readonly metricsCollector;
    private readonly analyticsEngine;
    constructor(extensionRepository: IExtensionRepository, metricsCollector: IMetricsCollector, analyticsEngine: IAnalyticsEngine);
    /**
     * 收集扩展使用指标
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionUsageMetrics> - 使用指标
     */
    collectUsageMetrics(extensionId: UUID): Promise<ExtensionUsageMetrics>;
    /**
     * 收集扩展性能指标
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionPerformanceMetrics> - 性能指标
     */
    collectPerformanceMetrics(extensionId: UUID): Promise<ExtensionPerformanceMetrics>;
    /**
     * 收集扩展健康指标
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionHealthMetrics> - 健康指标
     */
    collectHealthMetrics(extensionId: UUID): Promise<ExtensionHealthMetrics>;
    /**
     * 分析使用模式
     * @param extensionIds - 扩展ID列表
     * @returns Promise<UsageAnalysis> - 使用分析结果
     */
    analyzeUsagePatterns(extensionIds: UUID[]): Promise<UsageAnalysis>;
    /**
     * 分析性能趋势
     * @param extensionIds - 扩展ID列表
     * @returns Promise<PerformanceAnalysis> - 性能分析结果
     */
    analyzePerformanceTrends(extensionIds: UUID[]): Promise<PerformanceAnalysis>;
    /**
     * 检测异常
     * @param extensionIds - 扩展ID列表
     * @returns Promise<AnomalyDetection> - 异常检测结果
     */
    detectAnomalies(extensionIds: UUID[]): Promise<AnomalyDetection>;
    /**
     * 生成分析报告
     * @param request - 报告生成请求
     * @returns Promise<AnalyticsReport> - 分析报告
     */
    generateReport(request: GenerateReportRequest): Promise<AnalyticsReport>;
    private generateReportId;
    private generateSummary;
    private generateExtensionRankings;
    private generateRecommendations;
    private calculateOverallHealth;
}
//# sourceMappingURL=extension-analytics.service.d.ts.map
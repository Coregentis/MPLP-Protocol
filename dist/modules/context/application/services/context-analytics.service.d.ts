/**
 * Context分析服务 - 新增服务
 *
 * @description 基于SCTM+GLFB+ITCM方法论设计的上下文分析和洞察服务
 * 整合原有17个服务中的分析相关功能：性能监控、搜索索引，新增：使用分析、趋势预测、优化建议
 * @version 2.0.0
 * @layer 应用层 - 分析服务
 * @refactor 17→3服务简化，专注于分析和洞察功能
 */
import { ContextEntity } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';
import { LifecycleStage } from '../../types';
import { UUID } from '../../../../shared/types';
export interface IAnalyticsEngine {
    analyzeUsage(contextId: UUID): Promise<UsageMetrics>;
    analyzePatterns(contexts: ContextEntity[]): Promise<PatternAnalysis>;
    generateInsights(context: ContextEntity, metrics: ContextMetrics): Promise<AnalysisInsights>;
}
export interface ISearchEngine {
    search(query: SearchQuery): Promise<SearchResults>;
    indexDocument(index: string, id: string, document: Record<string, string | number | boolean>): Promise<void>;
    updateIndex(index: string, id: string, document: Record<string, string | number | boolean>): Promise<void>;
    deleteFromIndex(index: string, id: string): Promise<void>;
}
export interface IMetricsCollector {
    getContextMetrics(contextId: UUID): Promise<ContextMetrics>;
    getUsageMetrics(contextId: UUID): Promise<UsageMetrics>;
    recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export interface ContextAnalysis {
    contextId: UUID;
    timestamp: string;
    usage: UsageMetrics;
    patterns: PatternAnalysis;
    performance: PerformanceMetrics;
    insights: AnalysisInsights;
    recommendations: string[];
}
export interface UsageMetrics {
    accessCount: number;
    lastAccessed: string;
    averageSessionDuration: number;
    peakUsageTime: string;
    userCount: number;
}
export interface PatternAnalysis {
    userBehaviorPatterns: BehaviorPattern[];
    dataAccessPatterns: AccessPattern[];
    performancePatterns: PerformancePattern[];
}
export interface BehaviorPattern {
    type: string;
    frequency: number;
    description: string;
}
export interface AccessPattern {
    operation: string;
    frequency: number;
    averageResponseTime: number;
}
export interface PerformancePattern {
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    value: number;
}
export interface PerformanceMetrics {
    responseTime: {
        average: number;
        p95: number;
        p99: number;
    };
    throughput: {
        requestsPerSecond: number;
        peakThroughput: number;
    };
    resourceUsage: {
        memoryUsage: number;
        cpuUsage: number;
        storageUsage: number;
    };
    cacheMetrics: {
        hitRate: number;
        missRate: number;
        evictionRate: number;
    };
}
export interface AnalysisInsights {
    recommendations: string[];
    optimizationSuggestions: string[];
    riskAssessment: 'low' | 'medium' | 'high';
    healthScore: number;
}
export interface ContextTrends {
    timeRange: TimeRange;
    totalContexts: number;
    activeContexts: number;
    lifecycleDistribution: Record<LifecycleStage, number>;
    usagePatterns: UsagePattern[];
    performanceTrends: PerformanceTrend[];
    growthRate: number;
}
export interface TimeRange {
    startDate: Date;
    endDate: Date;
}
export interface UsagePattern {
    pattern: string;
    frequency: number;
    impact: 'high' | 'medium' | 'low';
}
export interface PerformanceTrend {
    metric: string;
    trend: 'improving' | 'degrading' | 'stable';
    changePercentage: number;
}
export interface SearchQuery {
    text: string;
    filters?: Record<string, string | number | boolean | string[]>;
    sort?: string;
    pagination?: {
        page: number;
        size: number;
    };
}
export interface SearchResults {
    results: ContextEntity[];
    total: number;
    page: number;
    size: number;
    facets?: Record<string, {
        count: number;
        values: string[];
    }>;
}
export interface ContextMetrics {
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    peakThroughput: number;
    memoryUsage: number;
    cpuUsage: number;
    storageUsage: number;
    cacheHitRate: number;
    cacheMissRate: number;
    cacheEvictionRate: number;
    totalAccess: number;
    lastAccessTime: string;
    avgSessionDuration: number;
    peakUsageTime: string;
    uniqueUsers: number;
}
export type ReportType = 'usage' | 'performance' | 'security' | 'comprehensive';
export interface AnalyticsReport {
    reportId: string;
    contextId: UUID;
    reportType: ReportType;
    generatedAt: Date;
    data: Record<string, string | number | boolean | object>;
    summary: string;
    recommendations: string[];
}
/**
 * Context分析服务
 *
 * @description 整合原有17个服务中的3个分析相关服务，新增2个智能分析功能
 * 职责：上下文分析、趋势预测、搜索索引、报告生成、洞察建议
 */
export declare class ContextAnalyticsService {
    private readonly contextRepository;
    private readonly analyticsEngine;
    private readonly searchEngine;
    private readonly metricsCollector;
    private readonly logger;
    constructor(contextRepository: IContextRepository, analyticsEngine: IAnalyticsEngine, searchEngine: ISearchEngine, metricsCollector: IMetricsCollector, logger: ILogger);
    /**
     * 分析单个上下文
     * 整合：原性能监控功能，新增：使用分析、模式识别、洞察生成
     */
    analyzeContext(contextId: UUID): Promise<ContextAnalysis>;
    /**
     * 分析上下文使用趋势
     * 新增功能：基于历史数据的趋势分析和预测
     */
    analyzeTrends(timeRange: TimeRange): Promise<ContextTrends>;
    /**
     * 分析上下文性能指标
     * 整合：原性能监控功能，增强：详细的性能分析和建议
     */
    analyzePerformance(contextId: UUID): Promise<PerformanceMetrics>;
    /**
     * 搜索上下文
     * 整合：原搜索索引功能，增强：智能搜索和过滤
     */
    searchContexts(query: SearchQuery): Promise<SearchResults>;
    /**
     * 更新搜索索引
     * 整合：原搜索索引功能
     */
    updateSearchIndex(contextId: UUID): Promise<void>;
    /**
     * 生成分析报告
     * 新增功能：多种类型的分析报告生成
     */
    generateReport(contextId: UUID, reportType: ReportType): Promise<AnalyticsReport>;
    /**
     * 分析使用情况
     */
    private analyzeUsage;
    /**
     * 分析模式
     */
    private analyzePatterns;
    /**
     * 生成洞察
     */
    private generateInsights;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 计算生命周期分布
     */
    private calculateLifecycleDistribution;
    /**
     * 分析使用模式
     */
    private analyzeUsagePatterns;
    /**
     * 分析性能趋势
     */
    private analyzePerformanceTrends;
    /**
     * 计算增长率
     */
    private calculateGrowthRate;
    /**
     * 生成使用报告
     */
    private generateUsageReport;
    /**
     * 生成性能报告
     */
    private generatePerformanceReport;
    /**
     * 生成安全报告
     */
    private generateSecurityReport;
    /**
     * 生成综合报告
     */
    private generateComprehensiveReport;
    /**
     * 计算安全分数
     */
    private calculateSecurityScore;
    /**
     * 计算整体健康分数
     */
    private calculateOverallHealthScore;
}
//# sourceMappingURL=context-analytics.service.d.ts.map
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
export declare class ContextAnalyticsService {
    private readonly contextRepository;
    private readonly analyticsEngine;
    private readonly searchEngine;
    private readonly metricsCollector;
    private readonly logger;
    constructor(contextRepository: IContextRepository, analyticsEngine: IAnalyticsEngine, searchEngine: ISearchEngine, metricsCollector: IMetricsCollector, logger: ILogger);
    analyzeContext(contextId: UUID): Promise<ContextAnalysis>;
    analyzeTrends(timeRange: TimeRange): Promise<ContextTrends>;
    analyzePerformance(contextId: UUID): Promise<PerformanceMetrics>;
    searchContexts(query: SearchQuery): Promise<SearchResults>;
    updateSearchIndex(contextId: UUID): Promise<void>;
    generateReport(contextId: UUID, reportType: ReportType): Promise<AnalyticsReport>;
    private analyzeUsage;
    private analyzePatterns;
    private generateInsights;
    private generateRecommendations;
    private calculateLifecycleDistribution;
    private analyzeUsagePatterns;
    private analyzePerformanceTrends;
    private calculateGrowthRate;
    private generateUsageReport;
    private generatePerformanceReport;
    private generateSecurityReport;
    private generateComprehensiveReport;
    private calculateSecurityScore;
    private calculateOverallHealthScore;
}
//# sourceMappingURL=context-analytics.service.d.ts.map
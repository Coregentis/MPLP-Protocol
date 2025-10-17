import { UUID, type IAnalyticsEngine, type INLPProcessor } from '../../types';
import { DialogRepository } from '../../domain/repositories/dialog.repository';
export interface GenerateAnalyticsReportRequest {
    dialogIds?: UUID[];
    reportType: 'usage' | 'performance' | 'health' | 'comprehensive';
    timeRange?: {
        startDate: string;
        endDate: string;
    };
    includeRecommendations?: boolean;
    userId?: UUID;
}
export interface AnalyzeDialogUsageRequest {
    dialogIds: UUID[];
    analysisType: 'basic' | 'detailed' | 'trend';
    timeRange?: {
        startDate: string;
        endDate: string;
    };
}
export interface AnalyzeDialogPerformanceRequest {
    dialogIds: UUID[];
    performanceMetrics: string[];
    benchmarkComparison?: boolean;
}
export interface DialogAnalyticsReport {
    reportId: UUID;
    reportType: 'usage' | 'performance' | 'health' | 'comprehensive';
    generatedAt: string;
    dialogIds: UUID[];
    summary: AnalyticsSummary;
    usageAnalysis?: UsageAnalysis;
    performanceAnalysis?: PerformanceAnalysis;
    healthAnalysis?: HealthAnalysis;
    recommendations?: string[];
    trends?: TrendAnalysis[];
}
export interface AnalyticsSummary {
    totalDialogs: number;
    activeDialogs: number;
    averagePerformance: number;
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
    criticalIssues: number;
}
export interface UsageAnalysis {
    totalInteractions: number;
    averageSessionDuration: number;
    mostUsedCapabilities: string[];
    participantEngagement: Record<string, number>;
    peakUsageHours: number[];
}
export interface PerformanceAnalysis {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: {
        memory: number;
        cpu: number;
        network: number;
    };
    performanceTrends: PerformanceTrend[];
}
export interface HealthAnalysis {
    overallScore: number;
    healthMetrics: {
        availability: number;
        reliability: number;
        responsiveness: number;
        scalability: number;
    };
    issues: HealthIssue[];
}
export interface TrendAnalysis {
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    prediction: number;
}
export interface PerformanceTrend {
    timestamp: string;
    responseTime: number;
    throughput: number;
    errorRate: number;
}
export interface HealthIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
}
export interface DialogRanking {
    dialogId: UUID;
    name: string;
    score: number;
    rank: number;
    metrics: {
        usage: number;
        performance: number;
        health: number;
    };
}
export declare class DialogAnalyticsService {
    private readonly dialogRepository;
    private readonly analyticsEngine;
    private readonly nlpProcessor;
    constructor(dialogRepository: DialogRepository, analyticsEngine?: IAnalyticsEngine, nlpProcessor?: INLPProcessor);
    generateAnalyticsReport(request: GenerateAnalyticsReportRequest): Promise<DialogAnalyticsReport>;
    analyzeDialogUsage(request: AnalyzeDialogUsageRequest): Promise<UsageAnalysis>;
    analyzeDialogPerformance(request: AnalyzeDialogPerformanceRequest): Promise<PerformanceAnalysis>;
    getDialogRankings(dialogIds: UUID[]): Promise<DialogRanking[]>;
    performNLPAnalysis(_dialogIds: UUID[]): Promise<{
        sentimentAnalysis: {
            overall: 'positive' | 'neutral' | 'negative';
            score: number;
            distribution: Record<string, number>;
        };
        topicModeling: {
            topics: Array<{
                id: string;
                name: string;
                keywords: string[];
                weight: number;
            }>;
            topicDistribution: Record<string, number>;
        };
        languageDetection: {
            primaryLanguage: string;
            confidence: number;
            languageDistribution: Record<string, number>;
        };
        keywordExtraction: {
            keywords: Array<{
                term: string;
                frequency: number;
                relevance: number;
            }>;
            phrases: Array<{
                phrase: string;
                frequency: number;
                context: string[];
            }>;
        };
    }>;
    identifyDialogPatterns(_dialogIds: UUID[]): Promise<{
        conversationPatterns: Array<{
            patternId: string;
            name: string;
            description: string;
            frequency: number;
            examples: string[];
            effectiveness: number;
        }>;
        userBehaviorPatterns: Array<{
            behaviorId: string;
            type: 'engagement' | 'response_time' | 'question_type' | 'satisfaction';
            pattern: string;
            frequency: number;
            impact: 'positive' | 'neutral' | 'negative';
        }>;
        temporalPatterns: Array<{
            timePattern: string;
            description: string;
            peakHours: number[];
            seasonality: Record<string, number>;
        }>;
    }>;
    generatePredictiveAnalysis(dialogIds: UUID[], predictionType: 'volume' | 'satisfaction' | 'resolution_time' | 'churn'): Promise<{
        predictions: Array<{
            timestamp: string;
            predictedValue: number;
            confidence: number;
            factors: string[];
        }>;
        accuracy: {
            historicalAccuracy: number;
            confidenceInterval: [number, number];
            modelVersion: string;
        };
        recommendations: string[];
    }>;
    private analyzeUsagePatterns;
    private analyzePerformanceTrends;
    private analyzeDialogHealth;
    private generatePerformanceTrends;
    private generateSummary;
    private calculateOverallHealth;
    private generateRecommendations;
    private analyzeTrends;
    private generateDialogRankings;
    private generateReportId;
    private generatePredictedValue;
    private getPredictionFactors;
    private generatePredictionRecommendations;
}
//# sourceMappingURL=dialog-analytics.service.d.ts.map
import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../entities/collab.entity';
export interface PerformanceMetrics {
    metricsId: UUID;
    entityId: UUID;
    entityType: 'collaboration' | 'member' | 'task' | 'resource';
    timestamp: Date;
    timeWindow: {
        startTime: Date;
        endTime: Date;
    };
    throughput: number;
    latency: number;
    errorRate: number;
    availability: number;
    cpuUtilization: number;
    memoryUtilization: number;
    networkUtilization: number;
    storageUtilization: number;
    completionRate: number;
    qualityScore: number;
    efficiencyScore: number;
    satisfactionScore: number;
    customMetrics: Record<string, number>;
    metadata: Record<string, unknown>;
}
export interface PerformanceAnalysisResult {
    analysisId: UUID;
    entityId: UUID;
    entityType: string;
    analyzedAt: Date;
    timeWindow: {
        startTime: Date;
        endTime: Date;
    };
    currentMetrics: PerformanceMetrics;
    trends: {
        throughputTrend: 'improving' | 'stable' | 'declining';
        latencyTrend: 'improving' | 'stable' | 'declining';
        errorRateTrend: 'improving' | 'stable' | 'declining';
        overallTrend: 'improving' | 'stable' | 'declining';
    };
    issues: Array<{
        issueId: UUID;
        severity: 'low' | 'medium' | 'high' | 'critical';
        category: 'performance' | 'reliability' | 'efficiency' | 'quality';
        description: string;
        impact: string;
        recommendations: string[];
        estimatedResolutionTime: number;
    }>;
    benchmarks: {
        industryAverage: PerformanceMetrics;
        bestPractice: PerformanceMetrics;
        historicalBest: PerformanceMetrics;
        comparisonScore: number;
    };
    optimizations: Array<{
        optimizationId: UUID;
        category: string;
        description: string;
        expectedImprovement: number;
        implementationEffort: 'low' | 'medium' | 'high';
        priority: 'low' | 'medium' | 'high' | 'critical';
        estimatedROI: number;
    }>;
    overallScore: number;
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface PerformanceBaseline {
    baselineId: UUID;
    entityId: UUID;
    entityType: string;
    createdAt: Date;
    baselineMetrics: PerformanceMetrics;
    baselineConditions: {
        workload: string;
        environment: string;
        configuration: Record<string, unknown>;
    };
    validityPeriod: {
        startDate: Date;
        endDate: Date;
    };
    metadata: Record<string, unknown>;
}
export interface PerformanceComparison {
    comparisonId: UUID;
    comparedAt: Date;
    baselineMetrics: PerformanceMetrics;
    currentMetrics: PerformanceMetrics;
    improvements: Array<{
        metric: string;
        improvementPercentage: number;
        significance: 'minor' | 'moderate' | 'significant' | 'major';
    }>;
    regressions: Array<{
        metric: string;
        regressionPercentage: number;
        severity: 'minor' | 'moderate' | 'significant' | 'critical';
    }>;
    overallImprovement: number;
    significantChanges: number;
    summary: string;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface PerformanceAlert {
    alertId: UUID;
    entityId: UUID;
    entityType: string;
    triggeredAt: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    alertType: 'threshold_breach' | 'anomaly_detected' | 'trend_degradation' | 'sla_violation';
    metric: string;
    currentValue: number;
    thresholdValue: number;
    description: string;
    impact: string;
    status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
    acknowledgedBy?: UUID;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    resolutionNotes?: string;
    escalationLevel: number;
    escalatedTo?: UUID[];
    metadata: Record<string, unknown>;
}
export interface IPerformanceAnalyzer {
    analyzePerformance(entity: CollabEntity | UUID, timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceAnalysisResult>;
    collectMetrics(entityId: UUID, entityType: 'collaboration' | 'member' | 'task' | 'resource', timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceMetrics>;
    createBaseline(entityId: UUID, entityType: string, conditions: {
        workload: string;
        environment: string;
        configuration: Record<string, unknown>;
    }): Promise<PerformanceBaseline>;
    compareToBaseline(entityId: UUID, baselineId: UUID, timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceComparison>;
    setPerformanceThresholds(entityId: UUID, thresholds: Record<string, {
        warningThreshold: number;
        criticalThreshold: number;
        alertEnabled: boolean;
    }>): Promise<void>;
    getActiveAlerts(entityId?: UUID, severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<PerformanceAlert[]>;
    acknowledgeAlert(alertId: UUID, acknowledgedBy: UUID, notes?: string): Promise<void>;
    resolveAlert(alertId: UUID, resolvedBy: UUID, resolutionNotes: string): Promise<void>;
    generateReport(entityIds: UUID[], reportType: 'summary' | 'detailed' | 'trend' | 'comparison', timeWindow: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceReport>;
    getPerformanceTrends(entityId: UUID, metrics: string[], timeWindow: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceTrends>;
    predictPerformance(entityId: UUID, predictionHorizon: number, scenarios?: Array<{
        name: string;
        conditions: Record<string, unknown>;
    }>): Promise<PerformancePrediction>;
    getStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceStatistics>;
}
export interface PerformanceReport {
    reportId: UUID;
    reportType: 'summary' | 'detailed' | 'trend' | 'comparison';
    generatedAt: Date;
    timeWindow: {
        startTime: Date;
        endTime: Date;
    };
    entities: UUID[];
    summary: {
        totalEntities: number;
        averagePerformanceScore: number;
        topPerformers: UUID[];
        underPerformers: UUID[];
        keyInsights: string[];
    };
    details: PerformanceAnalysisResult[];
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface PerformanceTrends {
    trendsId: UUID;
    entityId: UUID;
    analyzedAt: Date;
    timeWindow: {
        startTime: Date;
        endTime: Date;
    };
    trends: Record<string, {
        direction: 'improving' | 'stable' | 'declining';
        rate: number;
        confidence: number;
        significance: 'minor' | 'moderate' | 'significant' | 'major';
    }>;
    projections: Record<string, {
        projectedValue: number;
        projectionDate: Date;
        confidence: number;
    }>;
    metadata: Record<string, unknown>;
}
export interface PerformancePrediction {
    predictionId: UUID;
    entityId: UUID;
    predictedAt: Date;
    predictionHorizon: number;
    scenarios: Array<{
        scenarioName: string;
        probability: number;
        predictedMetrics: PerformanceMetrics;
        confidence: number;
        riskFactors: string[];
    }>;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface PerformanceStatistics {
    totalAnalyses: number;
    totalAlerts: number;
    averagePerformanceScore: number;
    performanceDistribution: Record<string, number>;
    alertsByCategory: Record<string, number>;
    trendsByDirection: Record<string, number>;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=performance-analyzer.interface.d.ts.map
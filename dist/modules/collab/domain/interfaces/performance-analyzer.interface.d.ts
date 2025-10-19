/**
 * Performance Analyzer Interface - Domain Layer
 * @description Interface for performance analysis operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */
import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../entities/collab.entity';
/**
 * Performance metrics
 */
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
/**
 * Performance analysis result
 */
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
/**
 * Performance baseline
 */
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
/**
 * Performance comparison result
 */
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
/**
 * Performance alert
 */
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
/**
 * Performance Analyzer Interface
 * Handles all performance analysis operations
 *
 * @interface IPerformanceAnalyzer
 * @description Core interface for performance analysis as required by refactoring guide
 */
export interface IPerformanceAnalyzer {
    /**
     * Analyze performance of entity
     * @param entity - Entity to analyze (collaboration, member, task, etc.)
     * @param timeWindow - Time window for analysis (optional)
     * @returns Promise<PerformanceAnalysisResult> - Analysis result
     * @throws Error if analysis fails
     */
    analyzePerformance(entity: CollabEntity | UUID, timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceAnalysisResult>;
    /**
     * Collect performance metrics
     * @param entityId - Entity identifier
     * @param entityType - Type of entity
     * @param timeWindow - Time window for metrics collection (optional)
     * @returns Promise<PerformanceMetrics> - Collected metrics
     * @throws Error if collection fails
     */
    collectMetrics(entityId: UUID, entityType: 'collaboration' | 'member' | 'task' | 'resource', timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceMetrics>;
    /**
     * Create performance baseline
     * @param entityId - Entity identifier
     * @param entityType - Type of entity
     * @param conditions - Baseline conditions
     * @returns Promise<PerformanceBaseline> - Created baseline
     * @throws Error if baseline creation fails
     */
    createBaseline(entityId: UUID, entityType: string, conditions: {
        workload: string;
        environment: string;
        configuration: Record<string, unknown>;
    }): Promise<PerformanceBaseline>;
    /**
     * Compare performance against baseline
     * @param entityId - Entity identifier
     * @param baselineId - Baseline identifier
     * @param timeWindow - Time window for comparison (optional)
     * @returns Promise<PerformanceComparison> - Comparison result
     * @throws Error if comparison fails
     */
    compareToBaseline(entityId: UUID, baselineId: UUID, timeWindow?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceComparison>;
    /**
     * Set performance thresholds and alerts
     * @param entityId - Entity identifier
     * @param thresholds - Performance thresholds
     * @returns Promise<void>
     * @throws Error if threshold setting fails
     */
    setPerformanceThresholds(entityId: UUID, thresholds: Record<string, {
        warningThreshold: number;
        criticalThreshold: number;
        alertEnabled: boolean;
    }>): Promise<void>;
    /**
     * Get active performance alerts
     * @param entityId - Entity identifier (optional, gets all if not provided)
     * @param severity - Filter by severity (optional)
     * @returns Promise<PerformanceAlert[]> - Active alerts
     */
    getActiveAlerts(entityId?: UUID, severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<PerformanceAlert[]>;
    /**
     * Acknowledge performance alert
     * @param alertId - Alert identifier
     * @param acknowledgedBy - User acknowledging the alert
     * @param notes - Acknowledgment notes (optional)
     * @returns Promise<void>
     * @throws Error if acknowledgment fails
     */
    acknowledgeAlert(alertId: UUID, acknowledgedBy: UUID, notes?: string): Promise<void>;
    /**
     * Resolve performance alert
     * @param alertId - Alert identifier
     * @param resolvedBy - User resolving the alert
     * @param resolutionNotes - Resolution notes
     * @returns Promise<void>
     * @throws Error if resolution fails
     */
    resolveAlert(alertId: UUID, resolvedBy: UUID, resolutionNotes: string): Promise<void>;
    /**
     * Generate performance report
     * @param entityIds - Entity identifiers
     * @param reportType - Type of report
     * @param timeWindow - Time window for report
     * @returns Promise<PerformanceReport> - Generated report
     * @throws Error if report generation fails
     */
    generateReport(entityIds: UUID[], reportType: 'summary' | 'detailed' | 'trend' | 'comparison', timeWindow: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceReport>;
    /**
     * Get performance trends
     * @param entityId - Entity identifier
     * @param metrics - Metrics to analyze for trends
     * @param timeWindow - Time window for trend analysis
     * @returns Promise<PerformanceTrends> - Trend analysis result
     */
    getPerformanceTrends(entityId: UUID, metrics: string[], timeWindow: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceTrends>;
    /**
     * Predict future performance
     * @param entityId - Entity identifier
     * @param predictionHorizon - How far into the future to predict (in milliseconds)
     * @param scenarios - Different scenarios to consider (optional)
     * @returns Promise<PerformancePrediction> - Performance prediction
     */
    predictPerformance(entityId: UUID, predictionHorizon: number, scenarios?: Array<{
        name: string;
        conditions: Record<string, unknown>;
    }>): Promise<PerformancePrediction>;
    /**
     * Get performance statistics
     * @param timeRange - Time range for statistics (optional)
     * @returns Promise<PerformanceStatistics> - Performance statistics
     */
    getStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<PerformanceStatistics>;
}
/**
 * Performance report
 */
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
/**
 * Performance trends
 */
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
/**
 * Performance prediction
 */
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
/**
 * Performance statistics
 */
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
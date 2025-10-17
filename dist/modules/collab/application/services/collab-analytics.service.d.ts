import { UUID } from '../../../../shared/types';
import { ICollabRepository } from '../../domain/repositories/collab.repository';
import { IAnalyticsEngine } from '../../domain/interfaces/analytics-engine.interface';
import { IPerformanceAnalyzer } from '../../domain/interfaces/performance-analyzer.interface';
import { CollabPerformanceReport } from '../../types';
interface CollabEffectivenessAnalysis {
    collaborationId: string;
    analyzedAt: Date;
    overview: OverviewAnalysis;
    performance: PerformanceAnalysis;
    collaboration: CollaborationAnalysis;
    insights: InsightsAnalysis;
}
interface OverviewAnalysis {
    duration: string;
    memberCount: number;
    taskCount: number;
    completionRate: number;
    status: string;
}
interface PerformanceAnalysis {
    productivity: number;
    efficiency: number;
    resourceUtilization: number;
    timeToCompletion: number;
}
interface CollaborationAnalysis {
    memberEngagement: number;
    communicationEffectiveness: number;
    conflictResolution: number;
}
interface InsightsAnalysis {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskFactors: string[];
}
interface CollabPatternAnalysis {
    collaborationId: string;
    analyzedAt: Date;
    communicationPatterns: {
        frequency: string;
        channels: string[];
        peakTimes: string[];
        responseTime: string;
    };
    collaborationPatterns: {
        workStyle: string;
        decisionMaking: string;
        taskDistribution: string;
        knowledgeSharing: string;
    };
    performancePatterns: {
        productivity: string;
        quality: string;
        efficiency: string;
        bottlenecks: string[];
    };
    recommendations: string[];
}
interface CollabOptimizationResult {
    collaborationId: string;
    optimizedAt: Date;
    currentConfiguration: {
        teamSize: number;
        mode: string;
        coordinationStrategy: string;
    };
    optimizations: ConfigOptimization[];
    expectedImprovements: {
        productivity: number;
        efficiency: number;
        satisfaction: number;
    };
    implementationPriority: string;
}
interface ConfigOptimization {
    category: string;
    current: string;
    recommended: string;
    impact: string;
    reason: string;
}
interface CollabOutcomePrediction {
    collaborationId: string;
    predictedAt: Date;
    successProbability: number;
    expectedDuration: number;
    riskLevel: string;
    confidenceLevel: number;
    keyFactors: {
        positive: string[];
        negative: string[];
        critical: string[];
    };
    recommendations: string[];
    nextReviewDate: Date;
}
export declare class CollabAnalyticsService {
    private readonly collabRepository;
    private readonly analyticsEngine;
    private readonly performanceAnalyzer;
    constructor(collabRepository: ICollabRepository, analyticsEngine: IAnalyticsEngine, performanceAnalyzer: IPerformanceAnalyzer);
    generatePerformanceReport(collaborationId: UUID): Promise<CollabPerformanceReport>;
    private calculatePerformanceMetrics;
    private generateRecommendations;
    private calculateOverallHealthScore;
    private assessRisks;
    private calculateCoordinationEfficiency;
    private estimateCoordinationLatency;
    private estimateCoordinationErrors;
    private estimateAverageResponseTime;
    private estimateParticipantSatisfaction;
    private calculateTaskCompletionRate;
    private estimateAverageTaskDuration;
    private calculateQualityScore;
    private calculateResourceUtilization;
    private calculateResourceEfficiency;
    private estimateResourceCost;
    private calculateSuccessRate;
    private calculateThroughput;
    private calculateErrorRate;
    private calculateCapabilityDiversity;
    private analyzeTrends;
    private calculateJoinRate;
    private calculateLeaveRate;
    private calculateEngagementTrend;
    private calculateProductivityTrend;
    private calculateQualityTrend;
    private calculateEfficiencyTrend;
    private calculateDecisionSpeedTrend;
    private calculateConflictTrend;
    private calculateCoordinationTrend;
    private calculateOverallRiskLevel;
    private calculateRiskScore;
    private prioritizeMitigation;
    private getRiskPriorityScore;
    analyzeCollaborationEffectiveness(collabId: string): Promise<CollabEffectivenessAnalysis>;
    private analyzeOverviewDimension;
    private analyzePerformanceDimension;
    private analyzeCollaborationDimension;
    private analyzeInsightsDimension;
    analyzeCollaborationPatterns(collabId: string): Promise<CollabPatternAnalysis>;
    optimizeCollaborationConfiguration(collabId: string): Promise<CollabOptimizationResult>;
    predictCollaborationOutcome(collabId: string): Promise<CollabOutcomePrediction>;
}
export {};
//# sourceMappingURL=collab-analytics.service.d.ts.map
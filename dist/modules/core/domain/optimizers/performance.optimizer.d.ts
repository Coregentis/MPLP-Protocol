import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { UUID } from '../../types';
export interface PerformanceAnalysisResult {
    analysisId: UUID;
    timestamp: string;
    overallScore: number;
    bottlenecks: PerformanceBottleneck[];
    recommendations: OptimizationRecommendation[];
    metrics: PerformanceMetrics;
}
export interface PerformanceBottleneck {
    type: 'cpu' | 'memory' | 'disk' | 'network' | 'module' | 'workflow';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    affectedComponents: string[];
    detectedAt: string;
}
export interface OptimizationRecommendation {
    recommendationId: UUID;
    type: 'resource_allocation' | 'workflow_optimization' | 'module_tuning' | 'system_configuration';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImprovement: number;
    implementationComplexity: 'low' | 'medium' | 'high';
    estimatedImplementationTime: number;
    autoImplementable: boolean;
}
export interface PerformanceMetrics {
    cpu: {
        usage: number;
        efficiency: number;
        bottleneckScore: number;
    };
    memory: {
        usage: number;
        efficiency: number;
        bottleneckScore: number;
    };
    disk: {
        usage: number;
        efficiency: number;
        bottleneckScore: number;
    };
    network: {
        usage: number;
        efficiency: number;
        bottleneckScore: number;
    };
    workflow: {
        averageExecutionTime: number;
        throughput: number;
        errorRate: number;
        efficiency: number;
    };
    modules: Record<string, {
        responseTime: number;
        throughput: number;
        errorRate: number;
        efficiency: number;
    }>;
}
export interface OptimizationPlan {
    planId: UUID;
    createdAt: string;
    recommendations: OptimizationRecommendation[];
    estimatedTotalImprovement: number;
    estimatedImplementationTime: number;
    implementationOrder: string[];
    riskAssessment: {
        overallRisk: 'low' | 'medium' | 'high';
        risks: string[];
        mitigations: string[];
    };
}
export interface OptimizationResult {
    optimizationId: UUID;
    planId: UUID;
    implementedRecommendations: string[];
    actualImprovement: number;
    implementationTime: number;
    success: boolean;
    errors?: string[];
    performanceComparison: {
        before: PerformanceMetrics;
        after: PerformanceMetrics;
        improvement: Record<string, number>;
    };
}
export declare class PerformanceOptimizer {
    private readonly resourceService;
    private readonly monitoringService;
    private readonly analysisHistory;
    private readonly optimizationHistory;
    constructor(resourceService: CoreResourceService, monitoringService: CoreMonitoringService);
    analyzePerformance(): Promise<PerformanceAnalysisResult>;
    createOptimizationPlan(analysisResult: PerformanceAnalysisResult): Promise<OptimizationPlan>;
    executeAutoOptimization(plan: OptimizationPlan): Promise<OptimizationResult>;
    getPerformanceTrends(hours?: number): {
        trend: 'improving' | 'stable' | 'degrading';
        trendScore: number;
        keyMetrics: {
            cpu: {
                current: number;
                trend: number;
            };
            memory: {
                current: number;
                trend: number;
            };
            workflow: {
                current: number;
                trend: number;
            };
        };
    };
    getOptimizationHistory(): OptimizationResult[];
    getAnalysisHistory(): PerformanceAnalysisResult[];
    private collectPerformanceMetrics;
    private identifyBottlenecks;
    private generateRecommendations;
    private calculateOverallPerformanceScore;
    private determineImplementationOrder;
    private assessImplementationRisks;
    private implementRecommendation;
    private calculateActualImprovement;
    private calculateImprovementDetails;
    private generateAnalysisId;
    private generatePlanId;
    private generateOptimizationId;
    private generateRecommendationId;
}
//# sourceMappingURL=performance.optimizer.d.ts.map
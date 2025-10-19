/**
 * 性能优化器
 * 提供系统性能分析、优化建议和自动优化功能
 * 实现企业级性能优化管理
 */
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
/**
 * 性能优化器类
 * 提供完整的性能分析和优化功能
 */
export declare class PerformanceOptimizer {
    private readonly resourceService;
    private readonly monitoringService;
    private readonly analysisHistory;
    private readonly optimizationHistory;
    constructor(resourceService: CoreResourceService, monitoringService: CoreMonitoringService);
    /**
     * 执行性能分析
     */
    analyzePerformance(): Promise<PerformanceAnalysisResult>;
    /**
     * 创建优化计划
     */
    createOptimizationPlan(analysisResult: PerformanceAnalysisResult): Promise<OptimizationPlan>;
    /**
     * 执行自动优化
     */
    executeAutoOptimization(plan: OptimizationPlan): Promise<OptimizationResult>;
    /**
     * 获取性能趋势分析
     */
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
    /**
     * 获取优化历史
     */
    getOptimizationHistory(): OptimizationResult[];
    /**
     * 获取性能分析历史
     */
    getAnalysisHistory(): PerformanceAnalysisResult[];
    /**
     * 收集性能指标
     */
    private collectPerformanceMetrics;
    /**
     * 识别性能瓶颈
     */
    private identifyBottlenecks;
    /**
     * 生成优化建议
     */
    private generateRecommendations;
    /**
     * 计算整体性能分数
     */
    private calculateOverallPerformanceScore;
    /**
     * 确定实施顺序
     */
    private determineImplementationOrder;
    /**
     * 评估实施风险
     */
    private assessImplementationRisks;
    /**
     * 实施建议
     */
    private implementRecommendation;
    /**
     * 计算实际改进
     */
    private calculateActualImprovement;
    /**
     * 计算改进详情
     */
    private calculateImprovementDetails;
    /**
     * 生成分析ID
     */
    private generateAnalysisId;
    /**
     * 生成计划ID
     */
    private generatePlanId;
    /**
     * 生成优化ID
     */
    private generateOptimizationId;
    /**
     * 生成建议ID
     */
    private generateRecommendationId;
}
//# sourceMappingURL=performance.optimizer.d.ts.map
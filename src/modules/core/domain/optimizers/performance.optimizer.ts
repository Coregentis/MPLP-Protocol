/**
 * 性能优化器
 * 提供系统性能分析、优化建议和自动优化功能
 * 实现企业级性能优化管理
 */

import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { UUID } from '../../types';

// ===== 性能优化相关类型 =====

export interface PerformanceAnalysisResult {
  analysisId: UUID;
  timestamp: string;
  overallScore: number; // 0-100
  bottlenecks: PerformanceBottleneck[];
  recommendations: OptimizationRecommendation[];
  metrics: PerformanceMetrics;
}

export interface PerformanceBottleneck {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'module' | 'workflow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number; // 0-100
  affectedComponents: string[];
  detectedAt: string;
}

export interface OptimizationRecommendation {
  recommendationId: UUID;
  type: 'resource_allocation' | 'workflow_optimization' | 'module_tuning' | 'system_configuration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImprovement: number; // 0-100
  implementationComplexity: 'low' | 'medium' | 'high';
  estimatedImplementationTime: number; // minutes
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
export class PerformanceOptimizer {
  private readonly analysisHistory: PerformanceAnalysisResult[] = [];
  private readonly optimizationHistory: OptimizationResult[] = [];

  constructor(
    private readonly resourceService: CoreResourceService,
    private readonly monitoringService: CoreMonitoringService
  ) {}

  /**
   * 执行性能分析
   */
  async analyzePerformance(): Promise<PerformanceAnalysisResult> {
    const analysisId = this.generateAnalysisId();
    const timestamp = new Date().toISOString();

    // 1. 收集性能指标
    const metrics = await this.collectPerformanceMetrics();

    // 2. 识别性能瓶颈
    const bottlenecks = await this.identifyBottlenecks(metrics);

    // 3. 生成优化建议
    const recommendations = await this.generateRecommendations(metrics, bottlenecks);

    // 4. 计算整体性能分数
    const overallScore = this.calculateOverallPerformanceScore(metrics, bottlenecks);

    const analysisResult: PerformanceAnalysisResult = {
      analysisId,
      timestamp,
      overallScore,
      bottlenecks,
      recommendations,
      metrics
    };

    // 5. 记录分析历史
    this.analysisHistory.push(analysisResult);
    if (this.analysisHistory.length > 100) {
      this.analysisHistory.splice(0, this.analysisHistory.length - 100);
    }

    return analysisResult;
  }

  /**
   * 创建优化计划
   */
  async createOptimizationPlan(analysisResult: PerformanceAnalysisResult): Promise<OptimizationPlan> {
    const planId = this.generatePlanId();

    // 1. 按优先级排序建议
    const sortedRecommendations = analysisResult.recommendations
      .sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    // 2. 计算总体改进预期
    const estimatedTotalImprovement = sortedRecommendations
      .reduce((sum, rec) => sum + rec.expectedImprovement, 0) / sortedRecommendations.length;

    // 3. 计算总实施时间
    const estimatedImplementationTime = sortedRecommendations
      .reduce((sum, rec) => sum + rec.estimatedImplementationTime, 0);

    // 4. 确定实施顺序
    const implementationOrder = this.determineImplementationOrder(sortedRecommendations);

    // 5. 风险评估
    const riskAssessment = this.assessImplementationRisks(sortedRecommendations);

    return {
      planId,
      createdAt: new Date().toISOString(),
      recommendations: sortedRecommendations,
      estimatedTotalImprovement,
      estimatedImplementationTime,
      implementationOrder,
      riskAssessment
    };
  }

  /**
   * 执行自动优化
   */
  async executeAutoOptimization(plan: OptimizationPlan): Promise<OptimizationResult> {
    const optimizationId = this.generateOptimizationId();
    const startTime = Date.now();

    // 记录优化前的性能指标
    const beforeMetrics = await this.collectPerformanceMetrics();

    const implementedRecommendations: string[] = [];
    const errors: string[] = [];

    try {
      // 只执行可自动实施的建议
      const autoRecommendations = plan.recommendations.filter(rec => rec.autoImplementable);

      for (const recommendation of autoRecommendations) {
        try {
          await this.implementRecommendation(recommendation);
          implementedRecommendations.push(recommendation.recommendationId);
        } catch (error) {
          errors.push(`Failed to implement ${recommendation.recommendationId}: ${(error as Error).message}`);
        }
      }

      // 等待优化生效
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 记录优化后的性能指标
      const afterMetrics = await this.collectPerformanceMetrics();

      // 计算实际改进
      const actualImprovement = this.calculateActualImprovement(beforeMetrics, afterMetrics);
      const implementationTime = Date.now() - startTime;

      const result: OptimizationResult = {
        optimizationId,
        planId: plan.planId,
        implementedRecommendations,
        actualImprovement,
        implementationTime,
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        performanceComparison: {
          before: beforeMetrics,
          after: afterMetrics,
          improvement: this.calculateImprovementDetails(beforeMetrics, afterMetrics)
        }
      };

      // 记录优化历史
      this.optimizationHistory.push(result);

      return result;

    } catch (error) {
      const implementationTime = Date.now() - startTime;

      return {
        optimizationId,
        planId: plan.planId,
        implementedRecommendations,
        actualImprovement: 0,
        implementationTime,
        success: false,
        errors: [error as string],
        performanceComparison: {
          before: beforeMetrics,
          after: beforeMetrics,
          improvement: {}
        }
      };
    }
  }

  /**
   * 获取性能趋势分析
   */
  getPerformanceTrends(hours: number = 24): {
    trend: 'improving' | 'stable' | 'degrading';
    trendScore: number;
    keyMetrics: {
      cpu: { current: number; trend: number };
      memory: { current: number; trend: number };
      workflow: { current: number; trend: number };
    };
  } {
    const recentAnalyses = this.analysisHistory
      .filter(analysis => {
        const analysisTime = new Date(analysis.timestamp);
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return analysisTime >= cutoffTime;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (recentAnalyses.length < 2) {
      return {
        trend: 'stable',
        trendScore: 0,
        keyMetrics: {
          cpu: { current: 0, trend: 0 },
          memory: { current: 0, trend: 0 },
          workflow: { current: 0, trend: 0 }
        }
      };
    }

    const latest = recentAnalyses[recentAnalyses.length - 1]!;
    const earliest = recentAnalyses[0]!;

    // 计算趋势
    const scoreTrend = latest.overallScore - earliest.overallScore;
    const cpuTrend = earliest.metrics.cpu.efficiency - latest.metrics.cpu.efficiency; // 使用率降低是好的
    const memoryTrend = earliest.metrics.memory.efficiency - latest.metrics.memory.efficiency;
    const workflowTrend = latest.metrics.workflow.efficiency - earliest.metrics.workflow.efficiency;

    const avgTrend = (scoreTrend + cpuTrend + memoryTrend + workflowTrend) / 4;

    let trend: 'improving' | 'stable' | 'degrading';
    if (avgTrend > 5) {
      trend = 'improving';
    } else if (avgTrend < -5) {
      trend = 'degrading';
    } else {
      trend = 'stable';
    }

    return {
      trend,
      trendScore: avgTrend,
      keyMetrics: {
        cpu: { current: latest.metrics.cpu.efficiency, trend: cpuTrend },
        memory: { current: latest.metrics.memory.efficiency, trend: memoryTrend },
        workflow: { current: latest.metrics.workflow.efficiency, trend: workflowTrend }
      }
    };
  }

  /**
   * 获取优化历史
   */
  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * 获取性能分析历史
   */
  getAnalysisHistory(): PerformanceAnalysisResult[] {
    return [...this.analysisHistory];
  }

  // ===== 私有辅助方法 =====

  /**
   * 收集性能指标
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    // 获取系统性能指标
    const systemPerformance = await this.resourceService.monitorSystemPerformance();
    const _resourceStats = await this.resourceService.getResourceUsageStatistics();
    // Mark _resourceStats as intentionally unused (reserved for future resource analysis)
    void _resourceStats;

    // 模拟模块性能指标
    const modules = ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'network'];
    const moduleMetrics: Record<string, {
      responseTime: number;
      throughput: number;
      errorRate: number;
      efficiency: number;
    }> = {};

    modules.forEach(module => {
      moduleMetrics[module] = {
        responseTime: Math.random() * 100 + 10, // 10-110ms
        throughput: Math.random() * 100 + 50, // 50-150 ops/sec
        errorRate: Math.random() * 2, // 0-2%
        efficiency: Math.random() * 30 + 70 // 70-100%
      };
    });

    return {
      cpu: {
        usage: systemPerformance.cpuUsagePercent,
        efficiency: Math.max(0, 100 - systemPerformance.cpuUsagePercent),
        bottleneckScore: systemPerformance.cpuUsagePercent > 80 ? 80 : 20
      },
      memory: {
        usage: systemPerformance.memoryUsagePercent,
        efficiency: Math.max(0, 100 - systemPerformance.memoryUsagePercent),
        bottleneckScore: systemPerformance.memoryUsagePercent > 80 ? 80 : 20
      },
      disk: {
        usage: systemPerformance.diskUsagePercent,
        efficiency: Math.max(0, 100 - systemPerformance.diskUsagePercent),
        bottleneckScore: systemPerformance.diskUsagePercent > 80 ? 80 : 20
      },
      network: {
        usage: systemPerformance.networkUsagePercent,
        efficiency: Math.max(0, 100 - systemPerformance.networkUsagePercent),
        bottleneckScore: systemPerformance.networkUsagePercent > 80 ? 80 : 20
      },
      workflow: {
        averageExecutionTime: systemPerformance.averageResponseTimeMs,
        throughput: systemPerformance.throughputPerSecond,
        errorRate: systemPerformance.errorRate,
        efficiency: Math.max(0, 100 - systemPerformance.errorRate * 10)
      },
      modules: moduleMetrics
    };
  }

  /**
   * 识别性能瓶颈
   */
  private async identifyBottlenecks(metrics: PerformanceMetrics): Promise<PerformanceBottleneck[]> {
    const bottlenecks: PerformanceBottleneck[] = [];

    // CPU瓶颈检测
    if (metrics.cpu.usage > 80) {
      bottlenecks.push({
        type: 'cpu',
        severity: metrics.cpu.usage > 95 ? 'critical' : 'high',
        description: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`,
        impact: metrics.cpu.usage,
        affectedComponents: ['system', 'all_modules'],
        detectedAt: new Date().toISOString()
      });
    }

    // 内存瓶颈检测
    if (metrics.memory.usage > 80) {
      bottlenecks.push({
        type: 'memory',
        severity: metrics.memory.usage > 95 ? 'critical' : 'high',
        description: `Memory usage is ${metrics.memory.usage.toFixed(1)}%`,
        impact: metrics.memory.usage,
        affectedComponents: ['system', 'all_modules'],
        detectedAt: new Date().toISOString()
      });
    }

    // 工作流瓶颈检测
    if (metrics.workflow.errorRate > 5) {
      bottlenecks.push({
        type: 'workflow',
        severity: metrics.workflow.errorRate > 10 ? 'critical' : 'medium',
        description: `Workflow error rate is ${metrics.workflow.errorRate.toFixed(1)}%`,
        impact: metrics.workflow.errorRate * 10,
        affectedComponents: ['workflow_engine'],
        detectedAt: new Date().toISOString()
      });
    }

    // 模块瓶颈检测
    Object.entries(metrics.modules).forEach(([moduleName, moduleMetrics]) => {
      if (moduleMetrics.responseTime > 200) {
        bottlenecks.push({
          type: 'module',
          severity: moduleMetrics.responseTime > 500 ? 'high' : 'medium',
          description: `${moduleName} module response time is ${moduleMetrics.responseTime.toFixed(1)}ms`,
          impact: Math.min(100, moduleMetrics.responseTime / 5),
          affectedComponents: [moduleName],
          detectedAt: new Date().toISOString()
        });
      }
    });

    return bottlenecks;
  }

  /**
   * 生成优化建议
   */
  private async generateRecommendations(
    metrics: PerformanceMetrics,
    bottlenecks: PerformanceBottleneck[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // 基于瓶颈生成建议
    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.type) {
        case 'cpu':
          recommendations.push({
            recommendationId: this.generateRecommendationId(),
            type: 'resource_allocation',
            priority: bottleneck.severity === 'critical' ? 'critical' : 'high',
            title: 'Optimize CPU Usage',
            description: 'Reduce CPU-intensive operations and optimize algorithms',
            expectedImprovement: Math.min(50, bottleneck.impact * 0.6),
            implementationComplexity: 'medium',
            estimatedImplementationTime: 30,
            autoImplementable: true
          });
          break;

        case 'memory':
          recommendations.push({
            recommendationId: this.generateRecommendationId(),
            type: 'resource_allocation',
            priority: bottleneck.severity === 'critical' ? 'critical' : 'high',
            title: 'Optimize Memory Usage',
            description: 'Implement memory pooling and garbage collection optimization',
            expectedImprovement: Math.min(40, bottleneck.impact * 0.5),
            implementationComplexity: 'medium',
            estimatedImplementationTime: 25,
            autoImplementable: true
          });
          break;

        case 'workflow':
          recommendations.push({
            recommendationId: this.generateRecommendationId(),
            type: 'workflow_optimization',
            priority: 'high',
            title: 'Optimize Workflow Execution',
            description: 'Implement workflow caching and parallel execution',
            expectedImprovement: Math.min(60, bottleneck.impact * 0.8),
            implementationComplexity: 'high',
            estimatedImplementationTime: 60,
            autoImplementable: false
          });
          break;

        case 'module':
          recommendations.push({
            recommendationId: this.generateRecommendationId(),
            type: 'module_tuning',
            priority: 'medium',
            title: `Optimize ${bottleneck.affectedComponents[0]} Module`,
            description: 'Tune module configuration and implement caching',
            expectedImprovement: Math.min(30, bottleneck.impact * 0.4),
            implementationComplexity: 'low',
            estimatedImplementationTime: 15,
            autoImplementable: true
          });
          break;
      }
    });

    // 通用优化建议
    if (metrics.workflow.averageExecutionTime > 1000) {
      recommendations.push({
        recommendationId: this.generateRecommendationId(),
        type: 'system_configuration',
        priority: 'medium',
        title: 'Enable Response Caching',
        description: 'Implement intelligent caching to reduce response times',
        expectedImprovement: 25,
        implementationComplexity: 'low',
        estimatedImplementationTime: 10,
        autoImplementable: true
      });
    }

    return recommendations;
  }

  /**
   * 计算整体性能分数
   */
  private calculateOverallPerformanceScore(metrics: PerformanceMetrics, bottlenecks: PerformanceBottleneck[]): number {
    // 基础分数
    let score = 100;

    // 根据资源使用率扣分
    score -= Math.max(0, metrics.cpu.usage - 70) * 0.5;
    score -= Math.max(0, metrics.memory.usage - 70) * 0.5;
    score -= Math.max(0, metrics.disk.usage - 80) * 0.3;
    score -= Math.max(0, metrics.network.usage - 80) * 0.3;

    // 根据工作流性能扣分
    score -= metrics.workflow.errorRate * 5;
    score -= Math.max(0, (metrics.workflow.averageExecutionTime - 500) / 50);

    // 根据瓶颈严重程度扣分
    bottlenecks.forEach(bottleneck => {
      const severityPenalty = {
        'low': 2,
        'medium': 5,
        'high': 10,
        'critical': 20
      };
      score -= severityPenalty[bottleneck.severity];
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 确定实施顺序
   */
  private determineImplementationOrder(recommendations: OptimizationRecommendation[]): string[] {
    // 按优先级和复杂度排序
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return complexityOrder[a.implementationComplexity] - complexityOrder[b.implementationComplexity];
      })
      .map(rec => rec.recommendationId);
  }

  /**
   * 评估实施风险
   */
  private assessImplementationRisks(recommendations: OptimizationRecommendation[]): {
    overallRisk: 'low' | 'medium' | 'high';
    risks: string[];
    mitigations: string[];
  } {
    const highComplexityCount = recommendations.filter(r => r.implementationComplexity === 'high').length;
    const criticalPriorityCount = recommendations.filter(r => r.priority === 'critical').length;

    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    const risks: string[] = [];
    const mitigations: string[] = [];

    if (highComplexityCount > 2) {
      overallRisk = 'high';
      risks.push('Multiple high-complexity optimizations may cause system instability');
      mitigations.push('Implement optimizations in phases with thorough testing');
    } else if (highComplexityCount > 0 || criticalPriorityCount > 1) {
      overallRisk = 'medium';
      risks.push('Some optimizations may temporarily impact system performance');
      mitigations.push('Monitor system closely during implementation');
    }

    if (recommendations.some(r => !r.autoImplementable)) {
      risks.push('Manual implementation required for some optimizations');
      mitigations.push('Ensure proper documentation and rollback procedures');
    }

    return { overallRisk, risks, mitigations };
  }

  /**
   * 实施建议
   */
  private async implementRecommendation(recommendation: OptimizationRecommendation): Promise<void> {
    // 模拟实施过程
    await new Promise(resolve => setTimeout(resolve, recommendation.estimatedImplementationTime * 10));

    // 根据建议类型执行不同的优化
    switch (recommendation.type) {
      case 'resource_allocation':
        // 模拟资源分配优化
        break;
      case 'system_configuration':
        // 模拟系统配置优化
        break;
      case 'module_tuning':
        // 模拟模块调优
        break;
      default:
        throw new Error(`Unsupported recommendation type: ${recommendation.type}`);
    }
  }

  /**
   * 计算实际改进
   */
  private calculateActualImprovement(before: PerformanceMetrics, after: PerformanceMetrics): number {
    const cpuImprovement = before.cpu.usage - after.cpu.usage;
    const memoryImprovement = before.memory.usage - after.memory.usage;
    const workflowImprovement = before.workflow.errorRate - after.workflow.errorRate;

    return (cpuImprovement + memoryImprovement + workflowImprovement * 10) / 3;
  }

  /**
   * 计算改进详情
   */
  private calculateImprovementDetails(before: PerformanceMetrics, after: PerformanceMetrics): Record<string, number> {
    return {
      cpu_usage: before.cpu.usage - after.cpu.usage,
      memory_usage: before.memory.usage - after.memory.usage,
      workflow_error_rate: before.workflow.errorRate - after.workflow.errorRate,
      workflow_response_time: before.workflow.averageExecutionTime - after.workflow.averageExecutionTime
    };
  }

  /**
   * 生成分析ID
   */
  private generateAnalysisId(): UUID {
    return `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成计划ID
   */
  private generatePlanId(): UUID {
    return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成优化ID
   */
  private generateOptimizationId(): UUID {
    return `optimization-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成建议ID
   */
  private generateRecommendationId(): UUID {
    return `recommendation-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

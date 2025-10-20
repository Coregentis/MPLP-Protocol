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
import {
  ExtensionEntityData,
  ExtensionPerformanceMetrics,
  ExtensionStatus
} from '../../types';

// ===== 分析相关接口定义 =====

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

// ===== 分析数据类型定义 =====

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

// ===== 请求/响应类型 =====

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
export class ExtensionAnalyticsService {
  constructor(
    private readonly extensionRepository: IExtensionRepository,
    private readonly metricsCollector: IMetricsCollector,
    private readonly analyticsEngine: IAnalyticsEngine
  ) {}

  /**
   * 收集扩展使用指标
   * @param extensionId - 扩展ID
   * @returns Promise<ExtensionUsageMetrics> - 使用指标
   */
  async collectUsageMetrics(extensionId: UUID): Promise<ExtensionUsageMetrics> {
    // 验证扩展存在
    const extension = await this.extensionRepository.findById(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    // 收集使用指标
    return await this.metricsCollector.collectUsageMetrics(extensionId);
  }

  /**
   * 收集扩展性能指标
   * @param extensionId - 扩展ID
   * @returns Promise<ExtensionPerformanceMetrics> - 性能指标
   */
  async collectPerformanceMetrics(extensionId: UUID): Promise<ExtensionPerformanceMetrics> {
    // 验证扩展存在
    const extension = await this.extensionRepository.findById(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    // 收集性能指标
    return await this.metricsCollector.collectPerformanceMetrics(extensionId);
  }

  /**
   * 收集扩展健康指标
   * @param extensionId - 扩展ID
   * @returns Promise<ExtensionHealthMetrics> - 健康指标
   */
  async collectHealthMetrics(extensionId: UUID): Promise<ExtensionHealthMetrics> {
    // 验证扩展存在
    const extension = await this.extensionRepository.findById(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    // 收集健康指标
    return await this.metricsCollector.collectHealthMetrics(extensionId);
  }

  /**
   * 分析使用模式
   * @param extensionIds - 扩展ID列表
   * @returns Promise<UsageAnalysis> - 使用分析结果
   */
  async analyzeUsagePatterns(extensionIds: UUID[]): Promise<UsageAnalysis> {
    // 收集所有扩展的使用指标
    const usageMetrics: ExtensionUsageMetrics[] = [];
    
    for (const extensionId of extensionIds) {
      try {
        const metrics = await this.collectUsageMetrics(extensionId);
        usageMetrics.push(metrics);
      } catch (error) {
        // 记录错误但继续处理其他扩展
        // eslint-disable-next-line no-console
        console.warn(`Failed to collect usage metrics for extension ${extensionId}:`, error);
      }
    }

    // 分析使用模式
    return await this.analyticsEngine.analyzeUsagePatterns(usageMetrics);
  }

  /**
   * 分析性能趋势
   * @param extensionIds - 扩展ID列表
   * @returns Promise<PerformanceAnalysis> - 性能分析结果
   */
  async analyzePerformanceTrends(extensionIds: UUID[]): Promise<PerformanceAnalysis> {
    // 收集所有扩展的性能指标
    const performanceMetrics: ExtensionPerformanceMetrics[] = [];
    
    for (const extensionId of extensionIds) {
      try {
        const metrics = await this.collectPerformanceMetrics(extensionId);
        performanceMetrics.push(metrics);
      } catch (error) {
        // 记录错误但继续处理其他扩展
        // eslint-disable-next-line no-console
        console.warn(`Failed to collect performance metrics for extension ${extensionId}:`, error);
      }
    }

    // 分析性能趋势
    return await this.analyticsEngine.analyzePerformanceTrends(performanceMetrics);
  }

  /**
   * 检测异常
   * @param extensionIds - 扩展ID列表
   * @returns Promise<AnomalyDetection> - 异常检测结果
   */
  async detectAnomalies(extensionIds: UUID[]): Promise<AnomalyDetection> {
    // 收集所有扩展的健康指标
    const healthMetrics: ExtensionHealthMetrics[] = [];
    
    for (const extensionId of extensionIds) {
      try {
        const metrics = await this.collectHealthMetrics(extensionId);
        healthMetrics.push(metrics);
      } catch (error) {
        // 记录错误但继续处理其他扩展
        // eslint-disable-next-line no-console
        console.warn(`Failed to collect health metrics for extension ${extensionId}:`, error);
      }
    }

    // 检测异常
    return await this.analyticsEngine.detectAnomalies(healthMetrics);
  }

  /**
   * 生成分析报告
   * @param request - 报告生成请求
   * @returns Promise<AnalyticsReport> - 分析报告
   */
  async generateReport(request: GenerateReportRequest): Promise<AnalyticsReport> {
    const reportId = this.generateReportId();
    const generatedAt = new Date().toISOString();

    // 获取要分析的扩展列表
    let extensionIds = request.extensionIds;
    if (!extensionIds) {
      // 如果没有指定扩展，获取所有活跃扩展
      const allExtensions = await this.extensionRepository.findByFilter({
        status: ['active'] as ExtensionStatus[]
      });
      extensionIds = allExtensions.extensions.map((ext: ExtensionEntityData) => ext.extensionId);
    }

    // 确保extensionIds不为undefined
    if (!extensionIds || extensionIds.length === 0) {
      extensionIds = [];
    }

    // 根据报告类型收集数据
    let usageAnalysis: UsageAnalysis | undefined;
    let performanceAnalysis: PerformanceAnalysis | undefined;
    let anomalyDetection: AnomalyDetection | undefined;

    if (request.reportType === 'usage' || request.reportType === 'comprehensive') {
      usageAnalysis = await this.analyzeUsagePatterns(extensionIds);
    }

    if (request.reportType === 'performance' || request.reportType === 'comprehensive') {
      performanceAnalysis = await this.analyzePerformanceTrends(extensionIds);
    }

    if (request.reportType === 'health' || request.reportType === 'comprehensive') {
      anomalyDetection = await this.detectAnomalies(extensionIds);
    }

    // 生成摘要
    const summary = await this.generateSummary(extensionIds, usageAnalysis, performanceAnalysis, anomalyDetection);

    // 生成扩展排名
    const extensionRankings = await this.generateExtensionRankings(extensionIds, usageAnalysis, performanceAnalysis);

    return {
      reportId,
      reportType: request.reportType,
      generatedAt,
      timeRange: request.timeRange,
      summary,
      details: {
        usageAnalysis: usageAnalysis || {} as UsageAnalysis,
        performanceAnalysis: performanceAnalysis || {} as PerformanceAnalysis,
        anomalyDetection: anomalyDetection || {} as AnomalyDetection,
        extensionRankings
      },
      recommendations: await this.generateRecommendations(usageAnalysis, performanceAnalysis, anomalyDetection)
    };
  }

  // ===== 私有辅助方法 =====

  private generateReportId(): UUID {
    return `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as UUID;
  }

  private async generateSummary(
    extensionIds: UUID[],
    _usageAnalysis?: UsageAnalysis,
    performanceAnalysis?: PerformanceAnalysis,
    anomalyDetection?: AnomalyDetection
  ): Promise<AnalyticsSummary> {
    const activeExtensions = await this.extensionRepository.findByFilter({
      status: ['active'] as ExtensionStatus[]
    });

    return {
      totalExtensions: extensionIds.length,
      activeExtensions: activeExtensions.extensions.length,
      averagePerformance: performanceAnalysis?.averageResponseTime || 0,
      overallHealth: this.calculateOverallHealth(anomalyDetection),
      criticalIssues: anomalyDetection?.anomalies.filter(a => a.severity === 'critical').length || 0
    };
  }

  private async generateExtensionRankings(
    extensionIds: UUID[],
    _usageAnalysis?: UsageAnalysis,
    _performanceAnalysis?: PerformanceAnalysis
  ): Promise<ExtensionRanking[]> {
    // 简化实现，实际应该基于多个指标计算排名
    const rankings: ExtensionRanking[] = [];
    
    for (let i = 0; i < extensionIds.length; i++) {
      const extensionId = extensionIds[i]!; // 非空断言：i < extensionIds.length
      const extension = await this.extensionRepository.findById(extensionId);

      if (extension) {
        rankings.push({
          extensionId,
          name: extension.name ?? 'Unknown', // 空值合并：确保name为string类型
          rank: i + 1,
          score: Math.random() * 100, // 简化实现
          category: 'performance'
        });
      }
    }

    return rankings.sort((a, b) => b.score - a.score);
  }

  private async generateRecommendations(
    usageAnalysis?: UsageAnalysis,
    performanceAnalysis?: PerformanceAnalysis,
    anomalyDetection?: AnomalyDetection
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (performanceAnalysis && performanceAnalysis.errorRate > 0.05) {
      recommendations.push('考虑优化扩展性能以降低错误率');
    }

    if (anomalyDetection && anomalyDetection.riskLevel === 'high') {
      recommendations.push('发现高风险异常，建议立即检查相关扩展');
    }

    if (usageAnalysis && usageAnalysis.userEngagement < 0.3) {
      recommendations.push('用户参与度较低，建议改进扩展用户体验');
    }

    return recommendations;
  }

  private calculateOverallHealth(anomalyDetection?: AnomalyDetection): number {
    if (!anomalyDetection) return 100;

    const criticalCount = anomalyDetection.anomalies.filter(a => a.severity === 'critical').length;
    const highCount = anomalyDetection.anomalies.filter(a => a.severity === 'high').length;
    const mediumCount = anomalyDetection.anomalies.filter(a => a.severity === 'medium').length;

    // 简化的健康度计算
    const healthScore = 100 - (criticalCount * 30 + highCount * 20 + mediumCount * 10);
    return Math.max(0, healthScore);
  }
}

/**
 * MPLP Confirm Module - Analytics Service
 * @description 企业级审批工作流分析服务 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmAnalyticsService
 */

import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { UUID } from '../../types';

// ===== 基于Schema的分析接口定义 =====

/**
 * 时间范围接口 - 基于Schema timestamp字段
 */
export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

/**
 * 确认分析结果接口 - 基于Schema结构
 */
export interface ConfirmAnalysis {
  requestId: UUID;
  timestamp: string; // 基于Schema timestamp字段
  workflow: {
    totalSteps: number;
    completedSteps: number;
    averageApprovalTime: number;
    bottlenecks: string[];
  };
  performance: {
    processingTime: number;
    efficiency: number;
    approvalRate: number;
  };
  insights: {
    recommendations: string[];
    riskFactors: string[];
  };
}

/**
 * 审批趋势接口 - 基于Schema字段
 */
export interface ApprovalTrends {
  timeRange: TimeRange;
  totalRequests: number;
  approvalRate: number;
  averageProcessingTime: number;
  trends: {
    requestVolume: number;
    approvalSpeed: number;
    rejectionRate: number;
  };
}

/**
 * 审批历史条目接口 - 基于Schema approval_workflow结构
 */
export interface ApprovalHistoryEntry {
  stepId: UUID;
  approverId: string;
  action: 'approve' | 'reject' | 'delegate' | 'escalate';
  timestamp: Date;
  result: boolean;
  comments?: string;
  processingTime: number;
}

/**
 * 报告类型 - 基于重构指南要求
 */
export type ApprovalReportType = 'performance' | 'compliance' | 'efficiency';

/**
 * 报告参数接口
 */
export interface ReportParams {
  timeRange: TimeRange;
  includeDetails?: boolean;
}

/**
 * 审批报告接口
 */
export interface ApprovalReport {
  reportType: ApprovalReportType;
  generatedAt: string;
  timeRange: TimeRange;
  summary: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    pendingRequests: number;
    averageProcessingTime: number;
    approvalRate: number;
  };
  insights: {
    keyFindings: string[];
    recommendations: string[];
    trends: string[];
  };
}

/**
 * 分析引擎接口
 */
export interface IAnalyticsEngine {
  analyzeWorkflowPerformance(data: ConfirmEntity[]): Promise<number>;
  detectBottlenecks(data: ConfirmEntity[]): Promise<string[]>;
  generateInsights(data: ConfirmEntity[]): Promise<string[]>;
}

/**
 * 确认分析服务
 * 基于重构指南第200-377行实现，严格遵循Schema驱动开发
 */
export class ConfirmAnalyticsService {
  constructor(
    private readonly confirmRepository: IConfirmRepository,
    private readonly _analyticsEngine: IAnalyticsEngine
  ) {}

  /**
   * 分析确认请求 - 基于Schema confirm_id字段
   * @param requestId 请求ID
   * @returns 确认分析结果
   */
  async analyzeConfirmRequest(requestId: UUID): Promise<ConfirmAnalysis> {
    const confirmRequest = await this.confirmRepository.findById(requestId);
    if (!confirmRequest) {
      throw new Error(`Confirm request ${requestId} not found`);
    }

    const approvalHistory = this.extractApprovalHistory(confirmRequest);
    
    return {
      requestId,
      timestamp: new Date().toISOString(),
      workflow: {
        totalSteps: approvalHistory.length,
        completedSteps: approvalHistory.filter(h => h.result).length,
        averageApprovalTime: this.calculateAverageApprovalTime(approvalHistory),
        bottlenecks: this.identifyBottlenecks(approvalHistory)
      },
      performance: {
        processingTime: this.calculateProcessingTime(confirmRequest, approvalHistory),
        efficiency: this.calculateEfficiency(confirmRequest, approvalHistory),
        approvalRate: this.calculateApprovalRate(approvalHistory)
      },
      insights: {
        recommendations: this.generateRecommendations(confirmRequest, approvalHistory),
        riskFactors: this.identifyRiskFactors(confirmRequest, approvalHistory)
      }
    };
  }

  /**
   * 分析审批趋势 - 基于Schema timestamp字段
   * @param timeRange 时间范围
   * @returns 审批趋势分析结果
   */
  async analyzeApprovalTrends(timeRange: TimeRange): Promise<ApprovalTrends> {
    const requests = await this.confirmRepository.findByTimeRange(timeRange);
    
    return {
      timeRange,
      totalRequests: requests.length,
      approvalRate: this.calculateOverallApprovalRate(requests),
      averageProcessingTime: this.calculateAverageProcessingTime(requests),
      trends: {
        requestVolume: requests.length,
        approvalSpeed: this.calculateAverageProcessingTime(requests),
        rejectionRate: 1 - this.calculateOverallApprovalRate(requests)
      }
    };
  }

  /**
   * 生成审批报告
   * @param reportType 报告类型
   * @param params 报告参数
   * @returns 审批报告
   */
  async generateApprovalReport(reportType: ApprovalReportType, params: ReportParams): Promise<ApprovalReport> {
    const requests = await this.confirmRepository.findByTimeRange(params.timeRange);
    
    const summary = {
      totalRequests: requests.length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      averageProcessingTime: this.calculateAverageProcessingTime(requests),
      approvalRate: this.calculateOverallApprovalRate(requests)
    };

    return {
      reportType,
      generatedAt: new Date().toISOString(),
      timeRange: params.timeRange,
      summary,
      insights: {
        keyFindings: this.generateKeyFindings(summary),
        recommendations: this.generateReportRecommendations(summary),
        trends: this.generateTrendAnalysis(requests)
      }
    };
  }

  /**
   * 从确认实体提取审批历史 - 基于Schema approval_workflow结构
   * @param confirmRequest 确认请求实体
   * @returns 审批历史条目数组
   */
  private extractApprovalHistory(confirmRequest: ConfirmEntity): ApprovalHistoryEntry[] {
    const history: ApprovalHistoryEntry[] = [];
    const workflow = confirmRequest.approvalWorkflow;
    
    for (const step of workflow.steps) {
      if (step.decision) {
        history.push({
          stepId: step.stepId,
          approverId: step.approver.userId,
          action: step.decision.outcome as 'approve' | 'reject' | 'delegate' | 'escalate',
          timestamp: step.decision.timestamp,
          result: step.decision.outcome === 'approve',
          comments: step.decision.comments,
          processingTime: this.calculateStepProcessingTime(step.decision.timestamp, confirmRequest.timestamp)
        });
      }
    }

    return history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * 计算步骤处理时间 - 基于Schema timestamp字段
   * @param decisionTime 决策时间
   * @param requestTime 请求时间
   * @returns 处理时间（毫秒）
   */
  private calculateStepProcessingTime(decisionTime: Date, requestTime: Date): number {
    return decisionTime.getTime() - requestTime.getTime();
  }

  /**
   * 计算平均审批时间
   * @param history 审批历史
   * @returns 平均审批时间（毫秒）
   */
  private calculateAverageApprovalTime(history: ApprovalHistoryEntry[]): number {
    if (history.length === 0) return 0;
    
    const totalTime = history.reduce((sum, entry) => sum + entry.processingTime, 0);
    return totalTime / history.length;
  }

  /**
   * 识别瓶颈
   * @param history 审批历史
   * @returns 瓶颈列表
   */
  private identifyBottlenecks(history: ApprovalHistoryEntry[]): string[] {
    const bottlenecks: string[] = [];
    
    if (history.length === 0) return bottlenecks;
    
    const avgProcessingTime = this.calculateAverageApprovalTime(history);
    
    history.forEach((entry, index) => {
      if (entry.processingTime > avgProcessingTime * 2) {
        bottlenecks.push(`Step ${index + 1}: Excessive processing time`);
      }
    });

    const rejectionRate = 1 - this.calculateApprovalRate(history);
    if (rejectionRate > 0.3) {
      bottlenecks.push(`High rejection rate: ${Math.round(rejectionRate * 100)}%`);
    }

    return bottlenecks;
  }

  /**
   * 计算处理时间 - 基于Schema timestamp字段
   * @param request 确认请求
   * @param history 审批历史
   * @returns 处理时间（毫秒）
   */
  private calculateProcessingTime(request: ConfirmEntity, history: ApprovalHistoryEntry[]): number {
    if (history.length === 0) return 0;
    const lastEntry = history[history.length - 1]!;
    return lastEntry.timestamp.getTime() - request.timestamp.getTime();
  }

  /**
   * 计算效率
   * @param request 确认请求
   * @param history 审批历史
   * @returns 效率分数（0-1）
   */
  private calculateEfficiency(request: ConfirmEntity, history: ApprovalHistoryEntry[]): number {
    if (history.length === 0) return 0;

    const actualTime = this.calculateProcessingTime(request, history);
    const expectedTime = history.length * 24 * 60 * 60 * 1000; // 每步预期1天

    return Math.min(1, expectedTime / Math.max(actualTime, 1));
  }

  /**
   * 计算审批率
   * @param history 审批历史
   * @returns 审批率（0-1）
   */
  private calculateApprovalRate(history: ApprovalHistoryEntry[]): number {
    if (history.length === 0) return 0;
    const approvedCount = history.filter(h => h.result).length;
    return approvedCount / history.length;
  }

  /**
   * 生成建议 - 基于Schema risk_assessment字段
   * @param request 确认请求
   * @param history 审批历史
   * @returns 建议列表
   */
  private generateRecommendations(request: ConfirmEntity, history: ApprovalHistoryEntry[]): string[] {
    const recommendations: string[] = [];

    if (history.length > 5) {
      recommendations.push('Consider simplifying the approval workflow');
    }

    if (this.calculateProcessingTime(request, history) > 7 * 24 * 60 * 60 * 1000) {
      recommendations.push('Review approval timeouts and escalation policies');
    }

    const rejectionRate = 1 - this.calculateApprovalRate(history);
    if (rejectionRate > 0.3) {
      recommendations.push('High rejection rate indicates need for better pre-approval validation');
    }

    return recommendations;
  }

  /**
   * 识别风险因素 - 基于Schema risk_assessment字段
   * @param request 确认请求
   * @param history 审批历史
   * @returns 风险因素列表
   */
  private identifyRiskFactors(request: ConfirmEntity, history: ApprovalHistoryEntry[]): string[] {
    const risks: string[] = [];

    if (request.priority === 'high' && history.length === 0) {
      risks.push('High priority request with no approvals');
    }

    if (request.riskAssessment.overallRiskLevel === 'critical') {
      risks.push('Critical risk level requires immediate attention');
    }

    const processingTime = this.calculateProcessingTime(request, history);
    if (processingTime > 14 * 24 * 60 * 60 * 1000) { // 2 weeks
      risks.push('Extended processing time may indicate process issues');
    }

    return risks;
  }

  /**
   * 计算整体审批率 - 基于Schema status字段
   * @param requests 确认请求数组
   * @returns 整体审批率（0-1）
   */
  private calculateOverallApprovalRate(requests: ConfirmEntity[]): number {
    if (requests.length === 0) return 0;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    return approvedCount / requests.length;
  }

  /**
   * 计算平均处理时间 - 基于Schema timestamp字段
   * @param requests 确认请求数组
   * @returns 平均处理时间（毫秒）
   */
  private calculateAverageProcessingTime(requests: ConfirmEntity[]): number {
    if (requests.length === 0) return 0;

    const totalTime = requests.reduce((sum, request) => {
      const processingTime = new Date().getTime() - request.timestamp.getTime();
      return sum + processingTime;
    }, 0);

    return totalTime / requests.length;
  }

  /**
   * 生成关键发现
   * @param summary 报告摘要
   * @returns 关键发现列表
   */
  private generateKeyFindings(summary: ApprovalReport['summary']): string[] {
    const findings: string[] = [];

    findings.push(`Total requests processed: ${summary.totalRequests}`);
    findings.push(`Overall approval rate: ${Math.round(summary.approvalRate * 100)}%`);
    findings.push(`Average processing time: ${Math.round(summary.averageProcessingTime / (1000 * 60 * 60))} hours`);

    if (summary.pendingRequests > summary.totalRequests * 0.3) {
      findings.push(`High number of pending requests: ${summary.pendingRequests}`);
    }

    return findings;
  }

  /**
   * 生成报告建议
   * @param summary 报告摘要
   * @returns 建议列表
   */
  private generateReportRecommendations(summary: ApprovalReport['summary']): string[] {
    const recommendations: string[] = [];

    if (summary.approvalRate < 0.7) {
      recommendations.push('Low approval rate indicates need for process improvement');
    }

    if (summary.averageProcessingTime > 7 * 24 * 60 * 60 * 1000) {
      recommendations.push('Consider optimizing approval workflows to reduce processing time');
    }

    if (summary.pendingRequests > summary.totalRequests * 0.2) {
      recommendations.push('High number of pending requests may indicate bottlenecks');
    }

    return recommendations;
  }

  /**
   * 生成趋势分析
   * @param requests 请求数组
   * @returns 趋势分析列表
   */
  private generateTrendAnalysis(requests: ConfirmEntity[]): string[] {
    const trends: string[] = [];

    if (requests.length > 0) {
      trends.push(`Request volume: ${requests.length} requests in the specified period`);

      const approvedCount = requests.filter(r => r.status === 'approved').length;
      const rejectedCount = requests.filter(r => r.status === 'rejected').length;

      trends.push(`Approval distribution: ${approvedCount} approved, ${rejectedCount} rejected`);
    }

    return trends;
  }
}

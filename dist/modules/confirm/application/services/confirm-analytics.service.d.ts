/**
 * MPLP Confirm Module - Analytics Service
 * @description 企业级审批工作流分析服务 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmAnalyticsService
 */
import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { UUID } from '../../types';
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
    timestamp: string;
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
export declare class ConfirmAnalyticsService {
    private readonly confirmRepository;
    private readonly analyticsEngine;
    constructor(confirmRepository: IConfirmRepository, analyticsEngine: IAnalyticsEngine);
    /**
     * 分析确认请求 - 基于Schema confirm_id字段
     * @param requestId 请求ID
     * @returns 确认分析结果
     */
    analyzeConfirmRequest(requestId: UUID): Promise<ConfirmAnalysis>;
    /**
     * 分析审批趋势 - 基于Schema timestamp字段
     * @param timeRange 时间范围
     * @returns 审批趋势分析结果
     */
    analyzeApprovalTrends(timeRange: TimeRange): Promise<ApprovalTrends>;
    /**
     * 生成审批报告
     * @param reportType 报告类型
     * @param params 报告参数
     * @returns 审批报告
     */
    generateApprovalReport(reportType: ApprovalReportType, params: ReportParams): Promise<ApprovalReport>;
    /**
     * 从确认实体提取审批历史 - 基于Schema approval_workflow结构
     * @param confirmRequest 确认请求实体
     * @returns 审批历史条目数组
     */
    private extractApprovalHistory;
    /**
     * 计算步骤处理时间 - 基于Schema timestamp字段
     * @param decisionTime 决策时间
     * @param requestTime 请求时间
     * @returns 处理时间（毫秒）
     */
    private calculateStepProcessingTime;
    /**
     * 计算平均审批时间
     * @param history 审批历史
     * @returns 平均审批时间（毫秒）
     */
    private calculateAverageApprovalTime;
    /**
     * 识别瓶颈
     * @param history 审批历史
     * @returns 瓶颈列表
     */
    private identifyBottlenecks;
    /**
     * 计算处理时间 - 基于Schema timestamp字段
     * @param request 确认请求
     * @param history 审批历史
     * @returns 处理时间（毫秒）
     */
    private calculateProcessingTime;
    /**
     * 计算效率
     * @param request 确认请求
     * @param history 审批历史
     * @returns 效率分数（0-1）
     */
    private calculateEfficiency;
    /**
     * 计算审批率
     * @param history 审批历史
     * @returns 审批率（0-1）
     */
    private calculateApprovalRate;
    /**
     * 生成建议 - 基于Schema risk_assessment字段
     * @param request 确认请求
     * @param history 审批历史
     * @returns 建议列表
     */
    private generateRecommendations;
    /**
     * 识别风险因素 - 基于Schema risk_assessment字段
     * @param request 确认请求
     * @param history 审批历史
     * @returns 风险因素列表
     */
    private identifyRiskFactors;
    /**
     * 计算整体审批率 - 基于Schema status字段
     * @param requests 确认请求数组
     * @returns 整体审批率（0-1）
     */
    private calculateOverallApprovalRate;
    /**
     * 计算平均处理时间 - 基于Schema timestamp字段
     * @param requests 确认请求数组
     * @returns 平均处理时间（毫秒）
     */
    private calculateAverageProcessingTime;
    /**
     * 生成关键发现
     * @param summary 报告摘要
     * @returns 关键发现列表
     */
    private generateKeyFindings;
    /**
     * 生成报告建议
     * @param summary 报告摘要
     * @returns 建议列表
     */
    private generateReportRecommendations;
    /**
     * 生成趋势分析
     * @param requests 请求数组
     * @returns 趋势分析列表
     */
    private generateTrendAnalysis;
}
//# sourceMappingURL=confirm-analytics.service.d.ts.map
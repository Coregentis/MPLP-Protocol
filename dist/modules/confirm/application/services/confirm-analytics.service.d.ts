import { IConfirmRepository } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../domain/entities/confirm.entity';
import { UUID } from '../../types';
export interface TimeRange {
    startDate: Date;
    endDate: Date;
}
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
export interface ApprovalHistoryEntry {
    stepId: UUID;
    approverId: string;
    action: 'approve' | 'reject' | 'delegate' | 'escalate';
    timestamp: Date;
    result: boolean;
    comments?: string;
    processingTime: number;
}
export type ApprovalReportType = 'performance' | 'compliance' | 'efficiency';
export interface ReportParams {
    timeRange: TimeRange;
    includeDetails?: boolean;
}
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
export interface IAnalyticsEngine {
    analyzeWorkflowPerformance(data: ConfirmEntity[]): Promise<number>;
    detectBottlenecks(data: ConfirmEntity[]): Promise<string[]>;
    generateInsights(data: ConfirmEntity[]): Promise<string[]>;
}
export declare class ConfirmAnalyticsService {
    private readonly confirmRepository;
    private readonly analyticsEngine;
    constructor(confirmRepository: IConfirmRepository, analyticsEngine: IAnalyticsEngine);
    analyzeConfirmRequest(requestId: UUID): Promise<ConfirmAnalysis>;
    analyzeApprovalTrends(timeRange: TimeRange): Promise<ApprovalTrends>;
    generateApprovalReport(reportType: ApprovalReportType, params: ReportParams): Promise<ApprovalReport>;
    private extractApprovalHistory;
    private calculateStepProcessingTime;
    private calculateAverageApprovalTime;
    private identifyBottlenecks;
    private calculateProcessingTime;
    private calculateEfficiency;
    private calculateApprovalRate;
    private generateRecommendations;
    private identifyRiskFactors;
    private calculateOverallApprovalRate;
    private calculateAverageProcessingTime;
    private generateKeyFindings;
    private generateReportRecommendations;
    private generateTrendAnalysis;
}
//# sourceMappingURL=confirm-analytics.service.d.ts.map
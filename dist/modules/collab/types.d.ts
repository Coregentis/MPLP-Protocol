/**
 * Collab模块类型定义
 *
 * @description Collab模块的核心类型定义，与其他6个已完成模块保持IDENTICAL架构
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { UUID } from '../../shared/types';
export type { UUID };
export type CollabMode = 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
export type CollabStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
export type ParticipantStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'removed';
export type CoordinationType = 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
export type DecisionMaking = 'consensus' | 'majority' | 'weighted' | 'coordinator';
export interface CollabParticipantData {
    participantId: UUID;
    agentId: UUID;
    roleId: UUID;
    status: ParticipantStatus;
    capabilities: string[];
    joinedAt: Date;
    lastActivity?: Date;
}
export interface CollabCoordinationStrategyData {
    type: CoordinationType;
    decisionMaking: DecisionMaking;
    coordinatorId?: UUID;
    configuration?: Record<string, unknown>;
}
export interface CollabEntityData {
    collaborationId: UUID;
    protocolVersion: string;
    timestamp: Date;
    contextId: UUID;
    planId: UUID;
    name: string;
    description?: string;
    mode: CollabMode;
    status: CollabStatus;
    participants: CollabParticipantData[];
    coordinationStrategy: CollabCoordinationStrategyData;
    createdBy: string;
    updatedBy?: string;
}
export interface CreateCollabRequest {
    contextId: UUID;
    planId: UUID;
    name: string;
    description?: string;
    mode: CollabMode;
    coordinationStrategy: CollabCoordinationStrategyData;
    participants: Omit<CollabParticipantData, 'participantId' | 'joinedAt' | 'lastActivity'>[];
    createdBy: string;
}
export interface UpdateCollabRequest {
    name?: string;
    description?: string;
    mode?: CollabMode;
    status?: CollabStatus;
    coordinationStrategy?: CollabCoordinationStrategyData;
    updatedBy: string;
}
export interface CollabQueryFilter {
    status?: CollabStatus | CollabStatus[];
    mode?: CollabMode | CollabMode[];
    contextId?: UUID;
    planId?: UUID;
    participantId?: UUID;
    createdBy?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
}
export interface CollabSortOptions {
    field: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'mode';
    direction: 'asc' | 'desc';
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface CollabListResult {
    items: CollabEntityData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface CollabSearchResult extends CollabListResult {
    searchMetadata: {
        query: string;
        executionTimeMs: number;
        totalMatches: number;
    };
}
export interface CollabStatistics {
    total: number;
    byStatus: Record<CollabStatus, number>;
    byMode: Record<CollabMode, number>;
    averageParticipants: number;
    activeCollaborations: number;
}
export interface CollabHealthMetrics {
    healthScore: number;
    issues: string[];
    recommendations: string[];
    metrics: {
        participantUtilization: number;
        coordinationEfficiency: number;
        decisionMakingSpeed: number;
    };
}
export interface CollabCoordinationRecommendations {
    strategyRecommendations: string[];
    participantRecommendations: string[];
    processRecommendations: string[];
}
export interface CollabOperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
}
export interface CollabDomainEventData {
    eventId: UUID;
    eventType: string;
    collaborationId: UUID;
    timestamp: Date;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface CollabAuditEntry {
    auditId: UUID;
    collaborationId: UUID;
    operation: string;
    userId: string;
    timestamp: Date;
    details: Record<string, unknown>;
}
export interface CollabPerformanceMetrics {
    coordinationMetrics: {
        coordinationLatency: number;
        coordinationEfficiency: number;
        coordinationErrors: number;
    };
    participantMetrics: {
        totalParticipants: number;
        activeParticipants: number;
        averageResponseTime: number;
        participantUtilization: number;
        utilizationRate: number;
        participantSatisfaction: number;
    };
    taskMetrics: {
        taskCompletionRate: number;
        averageTaskDuration: number;
        taskQualityScore: number;
    };
    resourceMetrics: {
        resourceUtilization: number;
        resourceEfficiency: number;
        resourceCost: number;
    };
    performanceMetrics: {
        taskCompletionRate: number;
        successRate: number;
        throughput: number;
        errorRate: number;
    };
}
export interface CollabModuleConfig {
    maxParticipants: number;
    defaultCoordinationType: CoordinationType;
    defaultDecisionMaking: DecisionMaking;
    performanceThresholds: {
        maxCoordinationLatency: number;
        minSuccessRate: number;
        maxErrorRate: number;
    };
    auditSettings: {
        enabled: boolean;
        retentionDays: number;
    };
}
/**
 * 协作效果分析结果 - 基于mplp-collab.json Schema定义
 * TypeScript层使用camelCase，Schema层使用snake_case
 */
export interface CollabEffectivenessAnalysis {
    analysisId: UUID;
    collaborationId: UUID;
    effectivenessScore: number;
    efficiencyMetrics: {
        taskCompletionRate: number;
        averageResponseTimeMs: number;
        resourceUtilizationRate: number;
        participantEngagementScore: number;
    };
    qualityMetrics: {
        decisionQualityScore: number;
        communicationEffectiveness: number;
        conflictResolutionRate: number;
    };
    analyzedAt: Date;
    recommendations: Array<{
        recommendationId: UUID;
        category: 'efficiency' | 'quality' | 'communication' | 'resource_allocation';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        expectedImpact?: number;
    }>;
}
/**
 * 协作模式分析结果 - 基于mplp-collab.json Schema定义
 */
export interface CollabPatternAnalysis {
    analysisId: UUID;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    identifiedPatterns: Array<{
        patternId: UUID;
        patternType: 'communication' | 'decision_making' | 'task_allocation' | 'resource_usage' | 'temporal';
        patternName: string;
        frequency: number;
        confidenceScore: number;
        impactAssessment: {
            positiveImpact: number;
            negativeImpact: number;
            overallImpact: number;
        };
    }>;
    trendAnalysis: {
        collaborationFrequencyTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
        efficiencyTrend: 'improving' | 'declining' | 'stable' | 'volatile';
        participantEngagementTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    };
    analyzedAt: Date;
}
/**
 * 协作优化建议 - 基于分析结果的优化方案
 */
export interface CollabOptimization {
    optimizationId: UUID;
    collaborationId: UUID;
    currentConfiguration: Record<string, unknown>;
    recommendedConfiguration: Record<string, unknown>;
    expectedImprovements: {
        efficiencyGain: number;
        qualityImprovement: number;
        resourceSavings: number;
        timeReduction: number;
    };
    implementationSteps: Array<{
        stepId: UUID;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        estimatedEffort: 'low' | 'medium' | 'high';
        dependencies: UUID[];
    }>;
    riskAssessment: {
        implementationRisk: 'low' | 'medium' | 'high';
        potentialIssues: string[];
        mitigationStrategies: string[];
    };
    optimizedAt: Date;
}
/**
 * 协作结果预测 - 基于历史数据的预测分析
 */
export interface CollabOutcomePrediction {
    predictionId: UUID;
    collaborationData: Record<string, unknown>;
    predictedOutcomes: {
        successProbability: number;
        expectedDuration: number;
        qualityScore: number;
        riskFactors: Array<{
            factor: string;
            impact: number;
            likelihood: number;
        }>;
    };
    confidenceLevel: number;
    predictionModel: string;
    predictedAt: Date;
}
/**
 * 协作报告 - 综合分析报告
 */
export interface CollabReport {
    reportId: UUID;
    collaborationId: UUID;
    reportType: 'summary' | 'detailed' | 'performance' | 'comprehensive';
    generatedAt: Date;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    executiveSummary: {
        overallScore: number;
        keyFindings: string[];
        criticalIssues: string[];
        recommendations: string[];
    };
    detailedAnalysis: Record<string, unknown>;
    visualizations: Array<{
        type: 'chart' | 'graph' | 'table' | 'diagram';
        title: string;
        data: Record<string, unknown>;
    }>;
    appendices: Record<string, unknown>;
}
/**
 * 治理检查结果 - 基于mplp-collab.json Schema定义
 */
export interface GovernanceCheckResult {
    checkId: UUID;
    collaborationId: UUID;
    checkType: 'compliance' | 'policy' | 'security' | 'data_protection' | 'audit';
    checkStatus: 'passed' | 'failed' | 'warning' | 'not_applicable';
    complianceScore: number;
    violations: Array<{
        violationId: UUID;
        violationType: 'policy_violation' | 'security_breach' | 'data_leak' | 'access_violation' | 'audit_failure';
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        remediationRequired: boolean;
        remediationSteps?: string[];
    }>;
    checkedAt: Date;
    nextCheckDue?: Date;
}
/**
 * 安全审计结果
 */
export interface CollabSecurityAudit {
    auditId: UUID;
    collaborationId: UUID;
    auditType: 'security' | 'compliance' | 'access' | 'data_protection' | 'comprehensive';
    auditScope: string[];
    findings: Array<{
        findingId: UUID;
        category: 'security' | 'compliance' | 'performance' | 'governance';
        severity: 'low' | 'medium' | 'high' | 'critical';
        title: string;
        description: string;
        evidence: Record<string, unknown>;
        recommendations: string[];
        status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
    }>;
    overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    complianceScore: number;
    auditedAt: Date;
    auditedBy: string;
    nextAuditDue: Date;
}
/**
 * 可疑活动监控
 */
export interface SuspiciousActivity {
    activityId: UUID;
    collaborationId: UUID;
    activityType: 'unusual_access_pattern' | 'unauthorized_operation' | 'data_exfiltration' | 'privilege_escalation' | 'anomalous_behavior';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    affectedUsers: UUID[];
    evidenceData: Record<string, unknown>;
    riskScore: number;
    status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
    investigationNotes?: string;
    responseActions: string[];
}
/**
 * 协作性能报告
 */
export interface CollabPerformanceReport {
    collaborationId: UUID;
    reportGeneratedAt: Date;
    metrics: CollabPerformanceMetrics;
    trends: CollabTrends;
    recommendations: CollabRecommendation[];
    healthScore: number;
    riskAssessment: CollabRiskAssessment;
}
/**
 * 协作趋势分析
 */
export interface CollabTrends {
    participantTrends: {
        joinRate: number;
        leaveRate: number;
        engagementTrend: 'increasing' | 'stable' | 'decreasing';
    };
    performanceTrends: {
        productivityTrend: 'increasing' | 'stable' | 'decreasing';
        qualityTrend: 'increasing' | 'stable' | 'decreasing';
        efficiencyTrend: 'increasing' | 'stable' | 'decreasing';
    };
    coordinationTrends: {
        decisionMakingSpeedTrend: 'increasing' | 'stable' | 'decreasing';
        conflictFrequencyTrend: 'increasing' | 'stable' | 'decreasing';
        coordinationEffectivenessTrend: 'increasing' | 'stable' | 'decreasing';
    };
}
/**
 * 协作建议
 */
export interface CollabRecommendation {
    category: 'participants' | 'coordination' | 'performance' | 'resources';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    actionItems: string[];
    expectedImpact: string;
    estimatedEffort: 'low' | 'medium' | 'high';
}
/**
 * 协作风险评估
 */
export interface CollabRiskAssessment {
    overallRiskLevel: 'low' | 'medium' | 'high';
    risks: CollabRisk[];
    riskScore: number;
    mitigationPriority: string[];
}
/**
 * 协作风险
 */
export interface CollabRisk {
    type: 'participant' | 'coordination' | 'performance' | 'quality' | 'resource';
    level: 'low' | 'medium' | 'high';
    description: string;
    probability: number;
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
}
//# sourceMappingURL=types.d.ts.map
import { UUID } from '../../../../shared/types';
export type ComplianceCheckType = 'regulatory' | 'policy' | 'security' | 'data_protection' | 'operational' | 'financial' | 'quality' | 'risk_management';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review' | 'exempt';
export interface ComplianceRule {
    ruleId: UUID;
    name: string;
    description: string;
    category: ComplianceCheckType;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    conditions: Array<{
        conditionId: UUID;
        field: string;
        operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'exists' | 'not_exists';
        value: unknown;
        weight: number;
    }>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mandatory: boolean;
    applicableEntities: string[];
    exemptionAllowed: boolean;
    remediationSteps: string[];
    remediationTimeframe: number;
    escalationRules: Array<{
        level: number;
        timeframe: number;
        escalateTo: UUID[];
        actions: string[];
    }>;
    metadata: Record<string, unknown>;
}
export interface ComplianceCheckResult {
    checkId: UUID;
    ruleId: UUID;
    entityId: UUID;
    entityType: string;
    checkedAt: Date;
    status: ComplianceStatus;
    score: number;
    passedConditions: number;
    totalConditions: number;
    failedConditions: Array<{
        conditionId: UUID;
        field: string;
        expectedValue: unknown;
        actualValue: unknown;
        reason: string;
    }>;
    violations: Array<{
        violationId: UUID;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        impact: string;
        remediationRequired: boolean;
        remediationSteps: string[];
        dueDate?: Date;
    }>;
    recommendations: string[];
    nextCheckDue: Date;
    metadata: Record<string, unknown>;
}
export interface GovernanceAssessment {
    assessmentId: UUID;
    entityId: UUID;
    entityType: string;
    assessedAt: Date;
    assessmentType: 'comprehensive' | 'targeted' | 'periodic' | 'incident_driven';
    overallScore: number;
    overallStatus: ComplianceStatus;
    maturityLevel: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
    categoryScores: Record<ComplianceCheckType, {
        score: number;
        status: ComplianceStatus;
        checkCount: number;
        violationCount: number;
    }>;
    checkResults: ComplianceCheckResult[];
    summary: {
        totalChecks: number;
        passedChecks: number;
        failedChecks: number;
        criticalViolations: number;
        highViolations: number;
        mediumViolations: number;
        lowViolations: number;
    };
    actionItems: Array<{
        itemId: UUID;
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: string;
        description: string;
        assignedTo?: UUID;
        dueDate: Date;
        status: 'open' | 'in_progress' | 'completed' | 'overdue';
    }>;
    recommendations: Array<{
        category: string;
        recommendation: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        estimatedEffort: 'low' | 'medium' | 'high';
        expectedImpact: string;
    }>;
    metadata: Record<string, unknown>;
}
export interface GovernancePolicy {
    policyId: UUID;
    name: string;
    description: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    effectiveDate: Date;
    expirationDate?: Date;
    isActive: boolean;
    objectives: string[];
    scope: {
        applicableEntities: string[];
        excludedEntities: string[];
        conditions: Record<string, unknown>;
    };
    requirements: Array<{
        requirementId: UUID;
        description: string;
        mandatory: boolean;
        verificationMethod: string;
        frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    }>;
    complianceRules: UUID[];
    owner: UUID;
    approvers: UUID[];
    reviewers: UUID[];
    nextReviewDate: Date;
    metadata: Record<string, unknown>;
}
export interface IGovernanceEngine {
    checkCompliance(entityId: UUID, entityType: string, checkTypes?: ComplianceCheckType[]): Promise<ComplianceCheckResult[]>;
    performGovernanceAssessment(entityId: UUID, entityType: string, assessmentType?: 'comprehensive' | 'targeted' | 'periodic' | 'incident_driven'): Promise<GovernanceAssessment>;
    createComplianceRule(rule: Omit<ComplianceRule, 'ruleId' | 'createdAt' | 'updatedAt'>, createdBy: UUID): Promise<UUID>;
    updateComplianceRule(ruleId: UUID, updates: Partial<ComplianceRule>, updatedBy: UUID): Promise<void>;
    deleteComplianceRule(ruleId: UUID, deletedBy: UUID, reason?: string): Promise<void>;
    getApplicableRules(entityType: string, category?: ComplianceCheckType): Promise<ComplianceRule[]>;
    createGovernancePolicy(policy: Omit<GovernancePolicy, 'policyId' | 'createdAt' | 'updatedAt'>, createdBy: UUID): Promise<UUID>;
    updateGovernancePolicy(policyId: UUID, updates: Partial<GovernancePolicy>, updatedBy: UUID): Promise<void>;
    approveGovernancePolicy(policyId: UUID, approvedBy: UUID, comments?: string): Promise<void>;
    getGovernancePolicies(entityType?: string, isActive?: boolean): Promise<GovernancePolicy[]>;
    requestComplianceExemption(entityId: UUID, ruleId: UUID, requestedBy: UUID, justification: string, duration?: number): Promise<UUID>;
    approveComplianceExemption(exemptionId: UUID, approvedBy: UUID, comments?: string): Promise<void>;
    generateGovernanceReport(reportType: 'compliance_summary' | 'violation_report' | 'policy_effectiveness' | 'maturity_assessment', timeRange: {
        startTime: Date;
        endTime: Date;
    }, filters?: Record<string, unknown>): Promise<GovernanceReport>;
    getGovernanceStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<GovernanceStatistics>;
    schedulePeriodicChecks(entityId: UUID, entityType: string, schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
        checkTypes: ComplianceCheckType[];
        startDate: Date;
        endDate?: Date;
    }): Promise<UUID>;
    cancelScheduledChecks(scheduleId: UUID, cancelledBy: UUID, reason?: string): Promise<void>;
}
export interface GovernanceReport {
    reportId: UUID;
    reportType: 'compliance_summary' | 'violation_report' | 'policy_effectiveness' | 'maturity_assessment';
    generatedAt: Date;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    summary: {
        totalEntities: number;
        compliantEntities: number;
        nonCompliantEntities: number;
        averageComplianceScore: number;
        totalViolations: number;
        criticalViolations: number;
        keyFindings: string[];
    };
    details: Record<string, unknown>;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface GovernanceStatistics {
    totalAssessments: number;
    totalComplianceChecks: number;
    totalPolicies: number;
    totalRules: number;
    averageComplianceScore: number;
    complianceDistribution: Record<ComplianceStatus, number>;
    violationsByCategory: Record<ComplianceCheckType, number>;
    violationsBySeverity: Record<string, number>;
    maturityDistribution: Record<string, number>;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=governance-engine.interface.d.ts.map
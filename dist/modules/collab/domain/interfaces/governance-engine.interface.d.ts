/**
 * Governance Engine Interface - Domain Layer
 * @description Interface for governance and compliance operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */
import { UUID } from '../../../../shared/types';
/**
 * Compliance check types
 */
export type ComplianceCheckType = 'regulatory' | 'policy' | 'security' | 'data_protection' | 'operational' | 'financial' | 'quality' | 'risk_management';
/**
 * Compliance status
 */
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review' | 'exempt';
/**
 * Compliance rule
 */
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
/**
 * Compliance check result
 */
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
/**
 * Governance assessment
 */
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
/**
 * Governance policy
 */
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
/**
 * Governance Engine Interface
 * Handles all governance and compliance operations
 *
 * @interface IGovernanceEngine
 * @description Core interface for governance as required by refactoring guide
 */
export interface IGovernanceEngine {
    /**
     * Check compliance for entity
     * @param entityId - Entity identifier
     * @param entityType - Type of entity
     * @param checkTypes - Types of compliance checks to perform (optional)
     * @returns Promise<ComplianceCheckResult[]> - Compliance check results
     * @throws Error if compliance check fails
     */
    checkCompliance(entityId: UUID, entityType: string, checkTypes?: ComplianceCheckType[]): Promise<ComplianceCheckResult[]>;
    /**
     * Perform comprehensive governance assessment
     * @param entityId - Entity identifier
     * @param entityType - Type of entity
     * @param assessmentType - Type of assessment (optional)
     * @returns Promise<GovernanceAssessment> - Governance assessment result
     * @throws Error if assessment fails
     */
    performGovernanceAssessment(entityId: UUID, entityType: string, assessmentType?: 'comprehensive' | 'targeted' | 'periodic' | 'incident_driven'): Promise<GovernanceAssessment>;
    /**
     * Create compliance rule
     * @param rule - Compliance rule to create
     * @param createdBy - User creating the rule
     * @returns Promise<UUID> - Rule identifier
     * @throws Error if creation fails
     */
    createComplianceRule(rule: Omit<ComplianceRule, 'ruleId' | 'createdAt' | 'updatedAt'>, createdBy: UUID): Promise<UUID>;
    /**
     * Update compliance rule
     * @param ruleId - Rule identifier
     * @param updates - Rule updates
     * @param updatedBy - User updating the rule
     * @returns Promise<void>
     * @throws Error if update fails
     */
    updateComplianceRule(ruleId: UUID, updates: Partial<ComplianceRule>, updatedBy: UUID): Promise<void>;
    /**
     * Delete compliance rule
     * @param ruleId - Rule identifier
     * @param deletedBy - User deleting the rule
     * @param reason - Reason for deletion (optional)
     * @returns Promise<void>
     * @throws Error if deletion fails
     */
    deleteComplianceRule(ruleId: UUID, deletedBy: UUID, reason?: string): Promise<void>;
    /**
     * Get applicable compliance rules
     * @param entityType - Type of entity
     * @param category - Rule category (optional)
     * @returns Promise<ComplianceRule[]> - Applicable rules
     */
    getApplicableRules(entityType: string, category?: ComplianceCheckType): Promise<ComplianceRule[]>;
    /**
     * Create governance policy
     * @param policy - Governance policy to create
     * @param createdBy - User creating the policy
     * @returns Promise<UUID> - Policy identifier
     * @throws Error if creation fails
     */
    createGovernancePolicy(policy: Omit<GovernancePolicy, 'policyId' | 'createdAt' | 'updatedAt'>, createdBy: UUID): Promise<UUID>;
    /**
     * Update governance policy
     * @param policyId - Policy identifier
     * @param updates - Policy updates
     * @param updatedBy - User updating the policy
     * @returns Promise<void>
     * @throws Error if update fails
     */
    updateGovernancePolicy(policyId: UUID, updates: Partial<GovernancePolicy>, updatedBy: UUID): Promise<void>;
    /**
     * Approve governance policy
     * @param policyId - Policy identifier
     * @param approvedBy - User approving the policy
     * @param comments - Approval comments (optional)
     * @returns Promise<void>
     * @throws Error if approval fails
     */
    approveGovernancePolicy(policyId: UUID, approvedBy: UUID, comments?: string): Promise<void>;
    /**
     * Get governance policies
     * @param entityType - Filter by entity type (optional)
     * @param isActive - Filter by active status (optional)
     * @returns Promise<GovernancePolicy[]> - Governance policies
     */
    getGovernancePolicies(entityType?: string, isActive?: boolean): Promise<GovernancePolicy[]>;
    /**
     * Request compliance exemption
     * @param entityId - Entity identifier
     * @param ruleId - Rule identifier
     * @param requestedBy - User requesting exemption
     * @param justification - Exemption justification
     * @param duration - Exemption duration in milliseconds (optional)
     * @returns Promise<UUID> - Exemption request identifier
     * @throws Error if request fails
     */
    requestComplianceExemption(entityId: UUID, ruleId: UUID, requestedBy: UUID, justification: string, duration?: number): Promise<UUID>;
    /**
     * Approve compliance exemption
     * @param exemptionId - Exemption request identifier
     * @param approvedBy - User approving the exemption
     * @param comments - Approval comments (optional)
     * @returns Promise<void>
     * @throws Error if approval fails
     */
    approveComplianceExemption(exemptionId: UUID, approvedBy: UUID, comments?: string): Promise<void>;
    /**
     * Generate governance report
     * @param reportType - Type of report
     * @param timeRange - Time range for report
     * @param filters - Report filters (optional)
     * @returns Promise<GovernanceReport> - Generated report
     * @throws Error if report generation fails
     */
    generateGovernanceReport(reportType: 'compliance_summary' | 'violation_report' | 'policy_effectiveness' | 'maturity_assessment', timeRange: {
        startTime: Date;
        endTime: Date;
    }, filters?: Record<string, unknown>): Promise<GovernanceReport>;
    /**
     * Get governance statistics
     * @param timeRange - Time range for statistics (optional)
     * @returns Promise<GovernanceStatistics> - Governance statistics
     */
    getGovernanceStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<GovernanceStatistics>;
    /**
     * Schedule periodic compliance checks
     * @param entityId - Entity identifier
     * @param entityType - Type of entity
     * @param schedule - Check schedule configuration
     * @returns Promise<UUID> - Schedule identifier
     * @throws Error if scheduling fails
     */
    schedulePeriodicChecks(entityId: UUID, entityType: string, schedule: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
        checkTypes: ComplianceCheckType[];
        startDate: Date;
        endDate?: Date;
    }): Promise<UUID>;
    /**
     * Cancel scheduled compliance checks
     * @param scheduleId - Schedule identifier
     * @param cancelledBy - User cancelling the schedule
     * @param reason - Cancellation reason (optional)
     * @returns Promise<void>
     * @throws Error if cancellation fails
     */
    cancelScheduledChecks(scheduleId: UUID, cancelledBy: UUID, reason?: string): Promise<void>;
}
/**
 * Governance report
 */
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
/**
 * Governance statistics
 */
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
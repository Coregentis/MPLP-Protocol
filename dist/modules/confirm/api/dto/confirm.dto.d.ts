import { UUID, Priority, ConfirmationType, ConfirmationStatus, WorkflowType, StepStatus, DecisionOutcome, RiskLevel, ImpactLevel, BusinessImpact, TechnicalImpact } from '../../types';
export interface CreateConfirmRequestDTO {
    contextId: UUID;
    planId?: UUID;
    confirmationType: ConfirmationType;
    priority: Priority;
    requester: {
        userId: string;
        role: string;
        department?: string;
        requestReason: string;
    };
    approvalWorkflow: {
        workflowType: WorkflowType;
        steps: Array<{
            stepId: UUID;
            stepOrder: number;
            approver: {
                userId: string;
                role: string;
                isRequired: boolean;
                delegationAllowed?: boolean;
            };
            approvalCriteria?: Array<{
                criterion: string;
                required: boolean;
                weight?: number;
            }>;
            timeout?: {
                duration: number;
                unit: 'minutes' | 'hours' | 'days';
                actionOnTimeout: 'auto_approve' | 'auto_reject' | 'escalate' | 'extend';
            };
        }>;
        escalationRules?: Array<{
            trigger: 'timeout' | 'rejection' | 'manual' | 'system';
            escalateTo: {
                userId: string;
                role: string;
            };
            notificationDelay?: number;
        }>;
    };
    subject: {
        title: string;
        description: string;
        impactAssessment: {
            scope: 'task' | 'project' | 'organization' | 'external';
            affectedSystems?: string[];
            affectedUsers?: string[];
            businessImpact: BusinessImpact;
            technicalImpact: TechnicalImpact;
        };
        attachments?: Array<{
            fileId: string;
            filename: string;
            mimeType: string;
            size: number;
            description?: string;
        }>;
    };
    riskAssessment: {
        overallRiskLevel: RiskLevel;
        riskFactors: Array<{
            factor: string;
            description?: string;
            probability: number;
            impact: ImpactLevel;
            mitigation?: string;
        }>;
        complianceRequirements?: Array<{
            regulation: string;
            requirement: string;
            complianceStatus: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
            evidence?: string;
        }>;
    };
}
export interface UpdateConfirmRequestDTO {
    confirmationType?: ConfirmationType;
    priority?: Priority;
    status?: ConfirmationStatus;
    subject?: {
        title?: string;
        description?: string;
        impactAssessment?: {
            scope?: 'task' | 'project' | 'organization' | 'external';
            affectedSystems?: string[];
            affectedUsers?: string[];
            businessImpact?: BusinessImpact;
            technicalImpact?: TechnicalImpact;
        };
    };
    riskAssessment?: {
        overallRiskLevel?: RiskLevel;
        riskFactors?: Array<{
            factor: string;
            description?: string;
            probability: number;
            impact: ImpactLevel;
            mitigation?: string;
        }>;
    };
}
export interface ConfirmResponseDTO {
    protocolVersion: string;
    timestamp: string;
    confirmId: UUID;
    contextId: UUID;
    planId?: UUID;
    confirmationType: ConfirmationType;
    status: ConfirmationStatus;
    priority: Priority;
    requester: {
        userId: string;
        role: string;
        department?: string;
        requestReason: string;
    };
    approvalWorkflow: {
        workflowType: WorkflowType;
        steps: Array<{
            stepId: UUID;
            stepOrder: number;
            approver: {
                userId: string;
                role: string;
                isRequired: boolean;
                delegationAllowed?: boolean;
            };
            approvalCriteria?: Array<{
                criterion: string;
                required: boolean;
                weight?: number;
            }>;
            status: StepStatus;
            decision?: {
                outcome: DecisionOutcome;
                comments?: string;
                conditions?: string[];
                timestamp: string;
                signature?: string;
            };
            timeout?: {
                duration: number;
                unit: 'minutes' | 'hours' | 'days';
                actionOnTimeout: 'auto_approve' | 'auto_reject' | 'escalate' | 'extend';
            };
        }>;
        escalationRules?: Array<{
            trigger: 'timeout' | 'rejection' | 'manual' | 'system';
            escalateTo: {
                userId: string;
                role: string;
            };
            notificationDelay?: number;
        }>;
    };
    subject: {
        title: string;
        description: string;
        impactAssessment: {
            scope: 'task' | 'project' | 'organization' | 'external';
            affectedSystems?: string[];
            affectedUsers?: string[];
            businessImpact: BusinessImpact;
            technicalImpact: TechnicalImpact;
        };
        attachments?: Array<{
            fileId: string;
            filename: string;
            mimeType: string;
            size: number;
            description?: string;
        }>;
    };
    riskAssessment: {
        overallRiskLevel: RiskLevel;
        riskFactors: Array<{
            factor: string;
            description?: string;
            probability: number;
            impact: ImpactLevel;
            mitigation?: string;
        }>;
        complianceRequirements?: Array<{
            regulation: string;
            requirement: string;
            complianceStatus: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
            evidence?: string;
        }>;
    };
}
export interface ApprovalActionRequestDTO {
    confirmId: UUID;
    approverId: UUID;
    action: 'approve' | 'reject' | 'delegate';
    comments?: string;
    reason?: string;
    delegateTo?: UUID;
}
export interface ConfirmQueryFilterDTO {
    confirmationType?: ConfirmationType[];
    status?: ConfirmationStatus[];
    priority?: Priority[];
    requesterId?: string;
    approverId?: string;
    contextId?: UUID;
    planId?: UUID;
    createdAfter?: string;
    createdBefore?: string;
    riskLevel?: RiskLevel[];
    workflowType?: WorkflowType[];
}
export interface PaginationParamsDTO {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface PaginatedResultDTO<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface ApiResponseDTO<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
    requestId?: string;
}
export interface HealthCheckResponseDTO {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    details: {
        confirmService: boolean;
        database: boolean;
        cache?: boolean;
        externalServices?: Record<string, boolean>;
    };
    version: string;
    uptime: number;
}
export interface StatisticsResponseDTO {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byRiskLevel: Record<string, number>;
    recentActivity: Array<{
        date: string;
        count: number;
        type: string;
    }>;
    performance: {
        averageProcessingTime: number;
        successRate: number;
        errorRate: number;
    };
}
//# sourceMappingURL=confirm.dto.d.ts.map
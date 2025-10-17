export type UUID = string;
export type Timestamp = string;
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ConfirmationType = 'plan_approval' | 'task_approval' | 'milestone_confirmation' | 'risk_acceptance' | 'resource_allocation' | 'emergency_approval';
export type ConfirmationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'expired';
export type WorkflowType = 'single_approver' | 'sequential' | 'parallel' | 'consensus' | 'escalation';
export type StepStatus = 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped';
export type DecisionOutcome = 'approve' | 'reject' | 'request_changes' | 'delegate';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ImpactLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type BusinessImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type TechnicalImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type NotificationEvent = 'created' | 'approved' | 'rejected' | 'timeout' | 'escalated' | 'cancelled';
export type NotificationChannel = 'email' | 'sms' | 'webhook' | 'in_app' | 'slack';
export type AuditEventType = 'confirm_created' | 'confirm_updated' | 'confirm_approved' | 'confirm_rejected' | 'confirm_cancelled' | 'confirm_escalated' | 'confirm_delegated' | 'confirm_reviewed' | 'confirm_expired';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'pending';
export type CheckStatus = 'pass' | 'fail' | 'warn';
export type AIProvider = 'openai' | 'anthropic' | 'azure_ai' | 'google_ai' | 'custom' | 'none';
export type AuthenticationType = 'api_key' | 'oauth' | 'jwt' | 'none';
export type FallbackBehavior = 'manual_review' | 'default_approval' | 'default_rejection';
export type ConfirmOperation = 'create' | 'approve' | 'reject' | 'delegate' | 'escalate';
export interface CreateConfirmRequest {
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
export interface UpdateConfirmRequest {
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
export interface ConfirmQueryFilter {
    confirmationType?: ConfirmationType[];
    status?: ConfirmationStatus[];
    priority?: Priority[];
    requesterId?: string;
    approverId?: string;
    contextId?: UUID;
    planId?: UUID;
    createdAfter?: Date;
    createdBefore?: Date;
    riskLevel?: RiskLevel[];
    workflowType?: WorkflowType[];
}
export interface ConfirmEntityData {
    protocolVersion: string;
    timestamp: Date;
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
                timestamp: Date;
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
//# sourceMappingURL=types.d.ts.map
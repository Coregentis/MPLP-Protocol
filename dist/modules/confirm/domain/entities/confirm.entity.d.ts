import { UUID, Priority, ConfirmationType, ConfirmationStatus, WorkflowType, StepStatus, DecisionOutcome, RiskLevel, ImpactLevel, BusinessImpact, TechnicalImpact } from '../../types';
export declare class ConfirmEntity {
    readonly protocolVersion: string;
    readonly timestamp: Date;
    readonly confirmId: UUID;
    readonly contextId: UUID;
    readonly planId?: UUID;
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
    approvals: Array<{
        approvalId: UUID;
        approverId: UUID;
        decision: DecisionOutcome;
        comments?: string;
        timestamp: Date;
        stepId: UUID;
    }>;
    auditTrail: Array<{
        eventId: UUID;
        timestamp: Date;
        userId: UUID;
        action: string;
        details: string;
        ipAddress: string;
        userAgent: string;
    }>;
    notifications: {
        channels: string[];
        recipients: Array<{
            userId: UUID;
            role: string;
            notificationPreferences: {
                email: boolean;
                slack: boolean;
                sms: boolean;
            };
        }>;
        templates: {
            pending: string;
            approved: string;
            rejected: string;
        };
    };
    integrations: {
        externalSystems: Array<{
            systemId: string;
            systemName: string;
            referenceId: string;
            syncStatus: string;
            lastSyncAt: Date;
        }>;
        webhooks: Array<{
            url: string;
            events: string[];
            secret: string;
        }>;
    };
    constructor(data: {
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
        approvals?: Array<{
            approvalId: UUID;
            approverId: UUID;
            decision: DecisionOutcome;
            comments?: string;
            timestamp: Date;
            stepId: UUID;
        }>;
        auditTrail?: Array<{
            eventId: UUID;
            timestamp: Date;
            userId: UUID;
            action: string;
            details: string;
            ipAddress: string;
            userAgent: string;
        }>;
        notifications?: {
            channels: string[];
            recipients: Array<{
                userId: UUID;
                role: string;
                notificationPreferences: {
                    email: boolean;
                    slack: boolean;
                    sms: boolean;
                };
            }>;
            templates: {
                pending: string;
                approved: string;
                rejected: string;
            };
        };
        integrations?: {
            externalSystems: Array<{
                systemId: string;
                systemName: string;
                referenceId: string;
                syncStatus: string;
                lastSyncAt: Date;
            }>;
            webhooks: Array<{
                url: string;
                events: string[];
                secret: string;
            }>;
        };
    });
    private validate;
    canApprove(userId: string): boolean;
    canReject(userId: string): boolean;
    canDelegate(userId: string): boolean;
    getCurrentStep(): typeof this.approvalWorkflow.steps[0] | null;
    getCompletedStepsCount(): number;
    areAllRequiredStepsCompleted(): boolean;
    updateTimestamp(): void;
    addApproval(approval: {
        approvalId: UUID;
        approverId: UUID;
        decision: DecisionOutcome;
        comments?: string;
        timestamp: Date;
        stepId: UUID;
    }): void;
    updateStatus(newStatus: ConfirmationStatus): void;
    addAuditEvent(auditEvent: {
        eventId: UUID;
        timestamp: Date;
        userId: UUID;
        action: string;
        details: string;
        ipAddress: string;
        userAgent: string;
    }): void;
    getCurrentApprovalCount(): number;
    toEntityData(): Record<string, unknown>;
}
//# sourceMappingURL=confirm.entity.d.ts.map
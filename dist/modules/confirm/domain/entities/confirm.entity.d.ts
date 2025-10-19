/**
 * Confirm领域实体
 *
 * @description Confirm模块的核心领域实体，基于实际Schema定义
 * @version 1.0.0
 * @layer 领域层 - 实体
 */
import { UUID, Priority, ConfirmationType, ConfirmationStatus, WorkflowType, StepStatus, DecisionOutcome, RiskLevel, ImpactLevel, BusinessImpact, TechnicalImpact } from '../../types';
/**
 * Confirm领域实体
 *
 * @description 企业级审批工作流的核心领域实体，包含完整的业务逻辑和验证规则
 */
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
    /**
     * 验证实体数据
     */
    private validate;
    /**
     * 检查是否可以审批
     */
    canApprove(userId: string): boolean;
    /**
     * 检查是否可以拒绝
     */
    canReject(userId: string): boolean;
    /**
     * 检查是否可以委派
     */
    canDelegate(userId: string): boolean;
    /**
     * 获取当前审批步骤
     */
    getCurrentStep(): typeof this.approvalWorkflow.steps[0] | null;
    /**
     * 获取已完成的步骤数
     */
    getCompletedStepsCount(): number;
    /**
     * 检查是否所有必需步骤都已完成
     */
    areAllRequiredStepsCompleted(): boolean;
    /**
     * 更新实体时间戳
     */
    updateTimestamp(): void;
    /**
     * 添加审批记录
     */
    addApproval(approval: {
        approvalId: UUID;
        approverId: UUID;
        decision: DecisionOutcome;
        comments?: string;
        timestamp: Date;
        stepId: UUID;
    }): void;
    /**
     * 更新状态
     */
    updateStatus(newStatus: ConfirmationStatus): void;
    /**
     * 添加审计事件
     */
    addAuditEvent(auditEvent: {
        eventId: UUID;
        timestamp: Date;
        userId: UUID;
        action: string;
        details: string;
        ipAddress: string;
        userAgent: string;
    }): void;
    /**
     * 获取当前审批数量
     */
    getCurrentApprovalCount(): number;
    /**
     * 转换为实体数据格式
     */
    toEntityData(): Record<string, unknown>;
}
//# sourceMappingURL=confirm.entity.d.ts.map
/**
 * Confirm模块Schema-TypeScript映射器 (重构版本)
 *
 * 实现MPLP双重命名约定：
 * - Schema层：snake_case (字符串时间戳)
 * - TypeScript层：camelCase (Date对象)
 *
 * 严格基于types.ts中的现有类型定义
 *
 * @version 2.0.0
 * @created 2025-08-18
 * @updated 2025-08-18 - TDD重构，修复双重命名约定
 */

import {
  ConfirmSubject,
  Requester,
  ApprovalWorkflow,
  ConfirmDecision,
  ConfirmMetadata,
  ConfirmationType,
  ConfirmStatus,
  Priority,
  RiskLevel,
  StepStatus,
  DecisionType
} from '../../types';

/**
 * Schema接口 (snake_case)
 * 严格对应mplp-confirm.json Schema定义
 */
export interface ConfirmSchema {
  // 核心标识字段
  protocol_version: string;
  timestamp: string;  // ISO8601字符串
  confirm_id: string;
  context_id: string;
  plan_id?: string;

  // 确认类型和状态
  confirmation_type: 'plan_approval' | 'task_approval' | 'milestone_confirmation' | 'risk_acceptance' | 'resource_allocation' | 'emergency_approval';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'escalated' | 'delegated' | 'under_review';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';

  // 时间字段
  created_at: string;  // ISO8601字符串
  updated_at: string;  // ISO8601字符串
  expires_at?: string; // ISO8601字符串

  // 业务字段 (使用Schema中的snake_case结构)
  subject: {
    title: string;
    description: string;
    impact_assessment: {
      business_impact: string;
      technical_impact: string;
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      impact_scope: string[];
      estimated_cost?: number;
    };
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size?: number;
    }>;
  };

  requester: {
    user_id: string;
    name: string;
    role: string;
    email: string;
    department?: string;
    request_reason?: string;
  };

  approval_workflow: {
    workflow_id?: string;
    name?: string;
    workflow_type?: 'sequential' | 'parallel' | 'consensus';
    steps: Array<{
      step_id: string;
      name: string;
      step_order?: number;
      level?: number;
      approvers?: Array<{
        approver_id: string;
        name: string;
        role: string;
        email: string;
        priority: number;
        is_active: boolean;
      }>;
      approver_role?: string;
      required_approvals?: number;
      timeout_minutes?: number;
      timeout_hours?: number;
      is_required?: boolean;
      auto_escalate?: boolean;
      escalation_rules?: {
        enabled: boolean;
        escalation_timeout_hours: number;
        escalation_target: string;
      };
      status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'skipped';
      started_at?: string;
      completed_at?: string;
    }>;
    require_all_approvers?: boolean;
    allow_delegation?: boolean;
    timeout_config?: {
      default_timeout_minutes: number;
      warning_minutes: number;
      max_timeout_minutes: number;
      auto_reject: boolean;
      escalate_on_timeout: boolean;
    };
    auto_approval_rules?: {
      enabled: boolean;
      conditions?: string[];
    };
  };

  decision?: {
    decision_id: string;
    type: 'approve' | 'reject' | 'delegate' | 'escalate';
    approver_id: string;
    timestamp: string;
    comment?: string;
    attachments?: string[];
    delegated_to?: string;
  };

  metadata?: {
    source?: string;
    tags?: string[];
    custom_fields?: Record<string, unknown>;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size?: number;
    }>;
  };
}

/**
 * TypeScript实体数据接口 (camelCase)
 * 基于ConfirmProtocol，时间字段转换为Date类型
 */
export interface ConfirmEntityData {
  // 基于ConfirmProtocol，但时间字段转换为Date
  protocolVersion: string;
  timestamp: Date;
  confirmId: string;
  contextId: string;
  planId?: string;
  confirmationType: ConfirmationType;
  status: ConfirmStatus;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  decision?: ConfirmDecision;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: ConfirmMetadata;
}

/**
 * Confirm映射器类
 */
export class ConfirmMapper {
  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: ConfirmSchema): ConfirmEntityData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      confirmId: schema.confirm_id,
      contextId: schema.context_id,
      planId: schema.plan_id,
      confirmationType: schema.confirmation_type as ConfirmationType,
      status: schema.status as ConfirmStatus,
      priority: schema.priority as Priority,
      subject: {
        title: schema.subject.title,
        description: schema.subject.description,
        impactAssessment: {
          businessImpact: schema.subject.impact_assessment.business_impact,
          technicalImpact: schema.subject.impact_assessment.technical_impact,
          riskLevel: schema.subject.impact_assessment.risk_level as RiskLevel,
          impactScope: schema.subject.impact_assessment.impact_scope,
          estimatedCost: schema.subject.impact_assessment.estimated_cost,
        },
        attachments: schema.subject.attachments?.map(att => ({
          name: att.name,
          url: att.url,
          type: att.type,
          size: att.size,
        })),
      },
      requester: {
        userId: schema.requester.user_id,
        name: schema.requester.name,
        role: schema.requester.role,
        email: schema.requester.email,
        department: schema.requester.department,
        requestReason: schema.requester.request_reason,
      },
      approvalWorkflow: {
        workflowId: schema.approval_workflow.workflow_id,
        name: schema.approval_workflow.name,
        workflowType: schema.approval_workflow.workflow_type,
        steps: schema.approval_workflow.steps.map(step => ({
          stepId: step.step_id,
          name: step.name,
          stepOrder: step.step_order,
          level: step.level,
          approvers: step.approvers?.map(approver => ({
            approverId: approver.approver_id,
            name: approver.name,
            role: approver.role,
            email: approver.email,
            priority: approver.priority,
            isActive: approver.is_active,
          })),
          approverRole: step.approver_role,
          requiredApprovals: step.required_approvals,
          timeoutMinutes: step.timeout_minutes,
          timeoutHours: step.timeout_hours,
          isRequired: step.is_required,
          autoEscalate: step.auto_escalate,
          escalationRules: step.escalation_rules ? {
            enabled: step.escalation_rules.enabled,
            escalationTimeoutHours: step.escalation_rules.escalation_timeout_hours,
            escalationTarget: step.escalation_rules.escalation_target,
          } : undefined,
          status: step.status as StepStatus,
          startedAt: step.started_at ? new Date(step.started_at).toISOString() : undefined,
          completedAt: step.completed_at ? new Date(step.completed_at).toISOString() : undefined,
        })),
        requireAllApprovers: schema.approval_workflow.require_all_approvers,
        allowDelegation: schema.approval_workflow.allow_delegation,
        timeoutConfig: schema.approval_workflow.timeout_config ? {
          defaultTimeoutMinutes: schema.approval_workflow.timeout_config.default_timeout_minutes,
          warningMinutes: schema.approval_workflow.timeout_config.warning_minutes,
          maxTimeoutMinutes: schema.approval_workflow.timeout_config.max_timeout_minutes,
          autoReject: schema.approval_workflow.timeout_config.auto_reject,
          escalateOnTimeout: schema.approval_workflow.timeout_config.escalate_on_timeout,
        } : undefined,
        autoApprovalRules: schema.approval_workflow.auto_approval_rules,
      },
      decision: schema.decision ? {
        decisionId: schema.decision.decision_id,
        type: schema.decision.type as DecisionType,
        approverId: schema.decision.approver_id,
        timestamp: schema.decision.timestamp,
        comment: schema.decision.comment,
        attachments: schema.decision.attachments,
        delegatedTo: schema.decision.delegated_to,
      } : undefined,
      createdAt: new Date(schema.created_at),
      updatedAt: new Date(schema.updated_at),
      expiresAt: schema.expires_at ? new Date(schema.expires_at) : undefined,
      metadata: schema.metadata ? {
        source: schema.metadata.source,
        tags: schema.metadata.tags,
        customFields: schema.metadata.custom_fields,
        attachments: schema.metadata.attachments?.map(att => ({
          name: att.name,
          url: att.url,
          type: att.type,
          size: att.size,
        })),
      } : undefined,
    };
  }

  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(entity: ConfirmEntityData): ConfirmSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      confirm_id: entity.confirmId,
      context_id: entity.contextId,
      plan_id: entity.planId,
      confirmation_type: entity.confirmationType as ConfirmationType,
      status: entity.status as 'pending' | 'approved' | 'cancelled' | 'rejected' | 'expired' | 'delegated' | 'escalated' | 'under_review',
      priority: entity.priority as Priority,
      subject: {
        title: entity.subject.title,
        description: entity.subject.description,
        impact_assessment: {
          business_impact: entity.subject.impactAssessment.businessImpact,
          technical_impact: entity.subject.impactAssessment.technicalImpact,
          risk_level: entity.subject.impactAssessment.riskLevel,
          impact_scope: entity.subject.impactAssessment.impactScope,
          estimated_cost: entity.subject.impactAssessment.estimatedCost,
        },
        attachments: entity.subject.attachments?.map(att => ({
          name: att.name,
          url: att.url,
          type: att.type,
          size: att.size,
        })),
      },
      requester: {
        user_id: entity.requester.userId,
        name: entity.requester.name,
        role: entity.requester.role,
        email: entity.requester.email,
        department: entity.requester.department,
        request_reason: entity.requester.requestReason,
      },
      approval_workflow: {
        workflow_id: entity.approvalWorkflow.workflowId,
        name: entity.approvalWorkflow.name,
        workflow_type: entity.approvalWorkflow.workflowType,
        steps: entity.approvalWorkflow.steps.map(step => ({
          step_id: step.stepId,
          name: step.name,
          step_order: step.stepOrder,
          level: step.level,
          approvers: step.approvers?.map(approver => ({
            approver_id: approver.approverId,
            name: approver.name,
            role: approver.role,
            email: approver.email,
            priority: approver.priority,
            is_active: approver.isActive,
          })),
          approver_role: step.approverRole,
          required_approvals: step.requiredApprovals,
          timeout_minutes: step.timeoutMinutes,
          timeout_hours: step.timeoutHours,
          is_required: step.isRequired,
          auto_escalate: step.autoEscalate,
          escalation_rules: step.escalationRules ? {
            enabled: step.escalationRules.enabled,
            escalation_timeout_hours: step.escalationRules.escalationTimeoutHours,
            escalation_target: step.escalationRules.escalationTarget,
          } : undefined,
          status: step.status as 'pending' | 'approved' | 'rejected' | 'in_progress' | 'skipped',
          started_at: step.startedAt,
          completed_at: step.completedAt,
        })),
        require_all_approvers: entity.approvalWorkflow.requireAllApprovers,
        allow_delegation: entity.approvalWorkflow.allowDelegation,
        timeout_config: entity.approvalWorkflow.timeoutConfig ? {
          default_timeout_minutes: entity.approvalWorkflow.timeoutConfig.defaultTimeoutMinutes,
          warning_minutes: entity.approvalWorkflow.timeoutConfig.warningMinutes,
          max_timeout_minutes: entity.approvalWorkflow.timeoutConfig.maxTimeoutMinutes,
          auto_reject: entity.approvalWorkflow.timeoutConfig.autoReject,
          escalate_on_timeout: entity.approvalWorkflow.timeoutConfig.escalateOnTimeout,
        } : undefined,
        auto_approval_rules: entity.approvalWorkflow.autoApprovalRules,
      },
      decision: entity.decision ? {
        decision_id: entity.decision.decisionId,
        type: entity.decision.type,
        approver_id: entity.decision.approverId,
        timestamp: entity.decision.timestamp,
        comment: entity.decision.comment,
        attachments: entity.decision.attachments,
        delegated_to: entity.decision.delegatedTo,
      } : undefined,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      expires_at: entity.expiresAt?.toISOString(),
      metadata: entity.metadata ? {
        source: entity.metadata.source,
        tags: entity.metadata.tags,
        custom_fields: entity.metadata.customFields,
        attachments: entity.metadata.attachments?.map(att => ({
          name: att.name,
          url: att.url,
          type: att.type,
          size: att.size,
        })),
      } : undefined,
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is ConfirmSchema {
    if (!data || typeof data !== 'object') return false;
    const schema = data as Record<string, unknown>;
    
    return !!(
      schema.confirm_id &&
      schema.context_id &&
      schema.confirmation_type &&
      schema.status &&
      schema.priority &&
      schema.subject &&
      schema.requester &&
      schema.approval_workflow
    );
  }

  /**
   * 创建默认的EntityData
   */
  static createDefaultEntityData(overrides: Partial<ConfirmEntityData> = {}): ConfirmEntityData {
    const now = new Date();
    // 根据优先级设置合理的过期时间
    const priority = overrides.priority || Priority.MEDIUM;
    const getExpirationDays = (p: Priority): number => {
      switch (p) {
        case Priority.URGENT: return 1;
        case Priority.HIGH: return 3;
        case Priority.MEDIUM: return 7;
        case Priority.LOW: return 30;
        default: return 7;
      }
    };
    const expirationDays = getExpirationDays(priority);
    const defaultExpiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

    return {
      protocolVersion: '1.0.0',
      timestamp: now,
      confirmId: `confirm-${Date.now()}`,
      contextId: 'default-context',
      confirmationType: ConfirmationType.PLAN_APPROVAL,
      status: ConfirmStatus.PENDING,
      priority: Priority.MEDIUM,  // 使用MEDIUM，对应'medium'
      subject: {
        title: 'Default Confirmation',
        description: 'Default confirmation description',
        impactAssessment: {
          businessImpact: 'Low impact',
          technicalImpact: 'Low impact',
          riskLevel: RiskLevel.LOW,
          impactScope: ['system', 'users'],
        },
      },
      requester: {
        userId: 'default-user',
        name: 'Default User',
        role: 'user',
        email: 'user@example.com',
      },
      approvalWorkflow: {
        workflowId: `workflow-${Date.now()}`,
        name: 'Default Approval Workflow',
        workflowType: 'sequential',
        steps: [
          {
            stepId: `step-${Date.now()}`,
            name: 'Default Approval',
            stepOrder: 1,
            level: 1,
            approvers: [
              {
                approverId: 'default-approver-1',
                name: 'Default Approver 1',
                role: 'approver',
                email: 'approver1@example.com',
                priority: 1,
                isActive: true,
              },
              {
                approverId: 'default-approver-2',
                name: 'Default Approver 2',
                role: 'approver',
                email: 'approver2@example.com',
                priority: 2,
                isActive: true,
              }
            ],
            status: StepStatus.PENDING,
            timeoutHours: 24,
          }
        ],
        requireAllApprovers: false,
        allowDelegation: true,
        autoApprovalRules: {
          enabled: false,
        },
      },
      createdAt: now,
      updatedAt: now,
      expiresAt: defaultExpiresAt, // 添加合理的过期时间
      ...overrides,
    };
  }

  /**
   * 创建默认的Schema数据
   */
  static createDefaultSchema(overrides: Partial<ConfirmSchema> = {}): ConfirmSchema {
    const now = new Date().toISOString();
    return {
      protocol_version: '1.0.0',
      timestamp: now,
      confirm_id: `confirm-${Date.now()}`,
      context_id: 'default-context',
      confirmation_type: 'plan_approval',
      status: 'pending',
      priority: 'medium',
      subject: {
        title: 'Default Confirmation',
        description: 'Default confirmation description',
        impact_assessment: {
          business_impact: 'Low impact',
          technical_impact: 'Low impact',
          risk_level: 'low',
          impact_scope: [],
        },
      },
      requester: {
        user_id: 'default-user',
        name: 'Default User',
        role: 'user',
        email: 'user@example.com',
      },
      approval_workflow: {
        steps: [],
      },
      created_at: now,
      updated_at: now,
      ...overrides,
    };
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: ConfirmSchema[]): ConfirmEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: ConfirmEntityData[]): ConfirmSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }
}

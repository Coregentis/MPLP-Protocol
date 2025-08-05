/**
 * Confirm工厂
 * 
 * 负责创建Confirm领域实体的工厂类
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../../shared/types';
import { Confirm } from '../entities/confirm.entity';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  Requester,
  ApprovalWorkflow,
  ApprovalStep,
  ConfirmSubject,
  ConfirmMetadata
} from '../../shared/types';

/**
 * 创建确认请求
 */
export interface CreateConfirmRequest {
  context_id: UUID;
  plan_id?: UUID;
  confirmation_type: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approval_workflow: ApprovalWorkflow;
  expires_at?: string;
  metadata?: ConfirmMetadata;
}

/**
 * Confirm工厂
 */
export class ConfirmFactory {
  private static readonly PROTOCOL_VERSION = '1.0.0';

  /**
   * 创建ApprovalStep的辅助方法
   */
  private static createApprovalStep(
    stepName: string,
    stepOrder: number,
    approverRole: string,
    timeoutHours: number,
    isRequired: boolean = true,
    escalationRules?: any
  ): ApprovalStep {
    return {
      step_id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      step_name: stepName,
      step_order: stepOrder,
      approver: {
        user_id: approverRole,
        role: approverRole,
        is_required: isRequired
      },
      approver_role: approverRole,
      is_required: isRequired,
      timeout_hours: timeoutHours,
      status: 'pending',
      ...(escalationRules && { escalation_rules: escalationRules })
    };
  }

  /**
   * 创建新的确认实体
   */
  static create(request: CreateConfirmRequest): Confirm {
    const now = new Date().toISOString();
    const confirmId = uuidv4();

    return new Confirm(
      confirmId,
      request.context_id,
      this.PROTOCOL_VERSION,
      request.confirmation_type,
      'pending', // 新创建的确认默认为待处理状态
      request.priority,
      request.subject,
      request.requester,
      request.approval_workflow,
      now,
      now,
      request.plan_id,
      undefined, // 新创建时没有决策
      request.expires_at,
      request.metadata
    );
  }

  /**
   * 创建紧急审批确认
   */
  static createEmergencyApproval(
    context_id: UUID,
    subject: ConfirmSubject,
    requester: Requester,
    plan_id?: UUID
  ): Confirm {
    // 紧急审批使用简化的工作流
    const emergencyWorkflow: ApprovalWorkflow = {
      workflow_type: 'sequential',
      steps: [
        {
          step_id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          step_name: '紧急审批',
          step_order: 1,
          approver: {
            user_id: 'emergency_approver',
            role: 'emergency_approver',
            is_required: true
          },
          approver_role: 'emergency_approver',
          is_required: true,
          timeout_hours: 2, // 2小时超时
          status: 'pending',
          escalation_rules: {
            enabled: true,
            escalation_timeout_hours: 1,
            escalation_target: 'senior_manager'
          }
        }
      ],
      auto_approval_rules: {
        enabled: false
      }
    };

    return this.create({
      context_id,
      plan_id,
      confirmation_type: 'emergency_approval',
      priority: 'high', // 紧急审批必须是高优先级
      subject,
      requester,
      approval_workflow: emergencyWorkflow,
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4小时后过期
    });
  }

  /**
   * 创建计划审批确认
   */
  static createPlanApproval(
    context_id: UUID,
    plan_id: UUID,
    subject: ConfirmSubject,
    requester: Requester,
    priority: Priority = 'medium'
  ): Confirm {
    const planApprovalWorkflow: ApprovalWorkflow = {
      workflow_type: 'sequential',
      steps: [
        this.createApprovalStep('技术审核', 1, 'technical_lead', 24),
        this.createApprovalStep('业务审批', 2, 'business_manager', 48)
      ],
      auto_approval_rules: {
        enabled: false
      }
    };

    return this.create({
      context_id,
      plan_id,
      confirmation_type: 'plan_approval',
      priority,
      subject,
      requester,
      approval_workflow: planApprovalWorkflow,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
    });
  }

  /**
   * 创建里程碑确认
   */
  static createMilestoneConfirmation(
    context_id: UUID,
    plan_id: UUID,
    subject: ConfirmSubject,
    requester: Requester,
    priority: Priority = 'medium'
  ): Confirm {
    const milestoneWorkflow: ApprovalWorkflow = {
      workflow_type: 'parallel',
      steps: [
        this.createApprovalStep('质量检查', 1, 'quality_assurance', 24),
        this.createApprovalStep('项目经理确认', 1, 'project_manager', 24)
      ],
      auto_approval_rules: {
        enabled: false
      }
    };

    return this.create({
      context_id,
      plan_id,
      confirmation_type: 'milestone_confirmation',
      priority,
      subject,
      requester,
      approval_workflow: milestoneWorkflow,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3天后过期
    });
  }

  /**
   * 创建风险接受确认
   */
  static createRiskAcceptance(
    context_id: UUID,
    subject: ConfirmSubject,
    requester: Requester,
    priority: Priority = 'high',
    plan_id?: UUID
  ): Confirm {
    const riskWorkflow: ApprovalWorkflow = {
      workflow_type: 'sequential',
      steps: [
        this.createApprovalStep('风险评估', 1, 'risk_manager', 48),
        this.createApprovalStep('高级管理层审批', 2, 'senior_manager', 72)
      ],
      auto_approval_rules: {
        enabled: false
      }
    };

    return this.create({
      context_id,
      plan_id,
      confirmation_type: 'risk_acceptance',
      priority,
      subject,
      requester,
      approval_workflow: riskWorkflow,
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5天后过期
    });
  }

  /**
   * 从协议数据重建确认实体
   */
  static fromProtocol(protocol: any): Confirm {
    return Confirm.fromProtocol(protocol);
  }

  /**
   * 验证创建请求
   */
  static validateCreateRequest(request: CreateConfirmRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.context_id) {
      errors.push('上下文ID不能为空');
    }

    if (!request.subject?.title) {
      errors.push('确认主题标题不能为空');
    }

    if (!request.requester?.user_id) {
      errors.push('请求者用户ID不能为空');
    }

    if (!request.approval_workflow?.steps?.length) {
      errors.push('审批工作流必须包含至少一个步骤');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

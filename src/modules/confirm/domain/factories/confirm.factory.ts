/**
 * Confirm工厂
 * 
 * 负责创建Confirm领域实体的工厂类
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../../../public/shared/types';
import { Confirm } from '../entities/confirm.entity';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  StepStatus,
  Requester,
  ApprovalWorkflow,
  ApprovalStep,
  ConfirmSubject,
  ConfirmMetadata,
  ConfirmProtocol
} from '../../types';

/**
 * 创建确认请求
 * Application层使用camelCase
 */
export interface CreateConfirmRequest {
  contextId: UUID;
  planId?: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  expiresAt?: string;
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
    escalationRules?: {
      enabled: boolean;
      escalationTimeoutHours: number;
      escalationTarget: string;
    }
  ): ApprovalStep {
    return {
      stepId: `step_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: stepName,
      stepOrder: stepOrder,
      approvers: [{
        approverId: approverRole,
        name: `${approverRole} 审批者`,
        role: approverRole,
        email: `${approverRole}@company.com`,
        priority: 1,
        isActive: true
      }],
      approverRole: approverRole,
      isRequired: isRequired,
      timeoutHours: timeoutHours,
      status: StepStatus.PENDING,
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
      request.contextId,
      this.PROTOCOL_VERSION,
      request.confirmationType,
      ConfirmStatus.PENDING, // 新创建的确认默认为待处理状态
      request.priority,
      request.subject,
      request.requester,
      request.approvalWorkflow,
      now,
      now,
      request.planId,
      undefined, // 新创建时没有决策
      request.expiresAt,
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
      workflowType: 'sequential',
      steps: [
        {
          stepId: `step_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: '紧急审批',
          stepOrder: 1,
          approvers: [{
            approverId: 'emergency_approver',
            name: '紧急审批者',
            role: 'emergency_approver',
            email: 'emergency@company.com',
            priority: 1,
            isActive: true
          }],
          approverRole: 'emergency_approver',
          isRequired: true,
          timeoutHours: 2, // 2小时超时
          status: StepStatus.PENDING,
          escalationRules: {
            enabled: true,
            escalationTimeoutHours: 1,
            escalationTarget: 'senior_manager'
          }
        }
      ],
      autoApprovalRules: {
        enabled: false
      }
    };

    return this.create({
      contextId: context_id,
      planId: plan_id,
      confirmationType: ConfirmationType.EMERGENCY_APPROVAL,
      priority: Priority.HIGH, // 紧急审批必须是高优先级
      subject,
      requester,
      approvalWorkflow: emergencyWorkflow,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4小时后过期
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
    priority: Priority = Priority.MEDIUM
  ): Confirm {
    const planApprovalWorkflow: ApprovalWorkflow = {
      workflowType: 'sequential',
      steps: [
        this.createApprovalStep('技术审核', 1, 'technical_lead', 24),
        this.createApprovalStep('业务审批', 2, 'business_manager', 48)
      ],
      autoApprovalRules: {
        enabled: false
      }
    };

    return this.create({
      contextId: context_id,
      planId: plan_id,
      confirmationType: ConfirmationType.PLAN_APPROVAL,
      priority,
      subject,
      requester,
      approvalWorkflow: planApprovalWorkflow,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
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
    priority: Priority = Priority.MEDIUM
  ): Confirm {
    const milestoneWorkflow: ApprovalWorkflow = {
      workflowType: 'parallel',
      steps: [
        this.createApprovalStep('质量检查', 1, 'quality_assurance', 24),
        this.createApprovalStep('项目经理确认', 1, 'project_manager', 24)
      ],
      autoApprovalRules: {
        enabled: false
      }
    };

    return this.create({
      contextId: context_id,
      planId: plan_id,
      confirmationType: ConfirmationType.MILESTONE_CONFIRMATION,
      priority,
      subject,
      requester,
      approvalWorkflow: milestoneWorkflow,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3天后过期
    });
  }

  /**
   * 创建风险接受确认
   */
  static createRiskAcceptance(
    context_id: UUID,
    subject: ConfirmSubject,
    requester: Requester,
    priority: Priority = Priority.HIGH,
    plan_id?: UUID
  ): Confirm {
    const riskWorkflow: ApprovalWorkflow = {
      workflowType: 'sequential',
      steps: [
        this.createApprovalStep('风险评估', 1, 'risk_manager', 48),
        this.createApprovalStep('高级管理层审批', 2, 'senior_manager', 72)
      ],
      autoApprovalRules: {
        enabled: false
      }
    };

    return this.create({
      contextId: context_id,
      planId: plan_id,
      confirmationType: ConfirmationType.RISK_ACCEPTANCE,
      priority,
      subject,
      requester,
      approvalWorkflow: riskWorkflow,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5天后过期
    });
  }

  /**
   * 从协议数据重建确认实体
   */
  static fromProtocol(protocol: ConfirmProtocol): Confirm {
    return Confirm.fromProtocol(protocol);
  }

  /**
   * 验证创建请求
   */
  static validateCreateRequest(request: CreateConfirmRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.contextId) {
      errors.push('上下文ID不能为空');
    }

    if (!request.subject?.title) {
      errors.push('确认主题标题不能为空');
    }

    if (!request.requester?.userId) {
      errors.push('请求者用户ID不能为空');
    }

    if (!request.approvalWorkflow?.steps?.length) {
      errors.push('审批工作流必须包含至少一个步骤');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

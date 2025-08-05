/**
 * Confirm验证服务
 * 
 * 提供确认相关的领域验证逻辑
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { 
  ConfirmationType, 
  ConfirmStatus, 
  Priority, 
  Requester, 
  ApprovalWorkflow,
  ConfirmSubject 
} from '../../shared/types';

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Confirm验证服务
 */
export class ConfirmValidationService {
  /**
   * 验证确认创建请求
   */
  validateCreateRequest(
    context_id: UUID,
    confirmation_type: ConfirmationType,
    priority: Priority,
    subject: ConfirmSubject,
    requester: Requester,
    approval_workflow: ApprovalWorkflow
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基础字段
    if (!context_id || context_id.trim().length === 0) {
      errors.push('上下文ID不能为空');
    }

    // 验证主题
    const subjectValidation = this.validateSubject(subject);
    errors.push(...subjectValidation.errors);
    warnings.push(...subjectValidation.warnings);

    // 验证请求者
    const requesterValidation = this.validateRequester(requester);
    errors.push(...requesterValidation.errors);
    warnings.push(...requesterValidation.warnings);

    // 验证审批工作流
    const workflowValidation = this.validateApprovalWorkflow(approval_workflow);
    errors.push(...workflowValidation.errors);
    warnings.push(...workflowValidation.warnings);

    // 验证确认类型和优先级的组合
    const combinationValidation = this.validateTypeAndPriority(confirmation_type, priority);
    errors.push(...combinationValidation.errors);
    warnings.push(...combinationValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证主题
   */
  private validateSubject(subject: ConfirmSubject): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!subject.title || subject.title.trim().length === 0) {
      errors.push('确认主题标题不能为空');
    } else if (subject.title.length > 200) {
      errors.push('确认主题标题不能超过200个字符');
    }

    if (subject.description && subject.description.length > 2000) {
      errors.push('确认主题描述不能超过2000个字符');
    }

    if (!subject.description || subject.description.trim().length === 0) {
      warnings.push('建议提供确认主题描述以便审批者理解');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证请求者
   */
  private validateRequester(requester: Requester): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!requester.user_id || requester.user_id.trim().length === 0) {
      errors.push('请求者用户ID不能为空');
    }

    if (!requester.role || requester.role.trim().length === 0) {
      errors.push('请求者角色不能为空');
    }

    if (!requester.request_reason || requester.request_reason.trim().length === 0) {
      errors.push('请求原因不能为空');
    } else if (requester.request_reason.length > 1000) {
      errors.push('请求原因不能超过1000个字符');
    }

    if (!requester.department) {
      warnings.push('建议提供请求者部门信息');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证审批工作流
   */
  private validateApprovalWorkflow(workflow: ApprovalWorkflow): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!workflow.workflow_type) {
      errors.push('审批工作流类型不能为空');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('审批工作流必须包含至少一个步骤');
    } else {
      // 验证每个步骤
      workflow.steps.forEach((step, index) => {
        if (!step.step_name || step.step_name.trim().length === 0) {
          errors.push(`第${index + 1}个审批步骤名称不能为空`);
        }

        if (!step.approver_role || step.approver_role.trim().length === 0) {
          errors.push(`第${index + 1}个审批步骤的审批者角色不能为空`);
        }

        if (step.timeout_hours && (step.timeout_hours <= 0 || step.timeout_hours > 720)) {
          errors.push(`第${index + 1}个审批步骤的超时时间必须在1-720小时之间`);
        }
      });

      // 检查步骤顺序
      const stepOrders = workflow.steps.map(step => step.step_order);
      const uniqueOrders = new Set(stepOrders);
      if (uniqueOrders.size !== stepOrders.length) {
        errors.push('审批步骤顺序不能重复');
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证确认类型和优先级的组合
   */
  private validateTypeAndPriority(type: ConfirmationType, priority: Priority): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 紧急审批必须是高优先级
    if (type === 'emergency_approval' && priority !== 'high') {
      errors.push('紧急审批必须设置为高优先级');
    }

    // 风险接受建议使用中等或高优先级
    if (type === 'risk_acceptance' && priority === 'low') {
      warnings.push('风险接受建议使用中等或高优先级');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证状态转换
   */
  validateStatusTransition(from: ConfirmStatus, to: ConfirmStatus): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validTransitions: Record<ConfirmStatus, ConfirmStatus[]> = {
      'pending': ['in_review', 'cancelled', 'expired'],
      'in_review': ['approved', 'rejected', 'escalated', 'cancelled'],
      'approved': [],
      'rejected': [],
      'cancelled': [],
      'expired': [],
      'escalated': ['in_review', 'approved', 'rejected']
    };

    if (!validTransitions[from].includes(to)) {
      errors.push(`无效的状态转换: ${from} -> ${to}`);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证确认是否可以修改
   */
  validateCanModify(status: ConfirmStatus): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const modifiableStatuses: ConfirmStatus[] = ['pending', 'in_review'];
    
    if (!modifiableStatuses.includes(status)) {
      errors.push(`状态为 ${status} 的确认不能修改`);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}

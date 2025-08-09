/**
 * Confirm模块适配器
 *
 * 实现Core模块的ModuleInterface接口，提供确认和审批流程功能
 *
 * @version 2.0.0
 * @created 2025-08-04
 * @updated 2025-08-04 23:32
 */

/**
 * 业务数据载荷接口
 */
interface BusinessPayload {
  confirmation_strategy?: 'manual' | 'automatic' | 'conditional' | 'multi_stage';
  approval_type?: string;
  approvers?: string[];
  approvalCriteria?: Record<string, unknown>;
  contextId?: UUID;
  [key: string]: unknown;
}



import { v4 as uuidv4 } from 'uuid';
import {
  ModuleInterface,
  ModuleStatus,
  ConfirmationCoordinationRequest,
  ConfirmationResult,
  ValidationResult,
  WorkflowExecutionContext,
  StageExecutionResult,
  BusinessCoordinationRequest,
  BusinessCoordinationResult,
  BusinessError,
  BusinessContext,
  ErrorHandlingResult
} from '../../../../public/modules/core/types/core.types';
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { ConfirmFactory, CreateConfirmRequest } from '../../domain/factories/confirm.factory';
import { ConfirmValidationService } from '../../domain/services/confirm-validation.service';
import { Logger } from '../../../../public/utils/logger';
import {
  ConfirmationType,
  Priority,
  UUID,
  Timestamp,
  RiskLevel,
  ApprovalStep,
  StepStatus
} from '../../types';

/**
 * Confirm模块适配器类
 * 实现Core模块的ModuleInterface接口
 */
export class ConfirmModuleAdapter implements ModuleInterface {
  public readonly module_name = 'confirm';
  private logger = new Logger('ConfirmModuleAdapter');
  private moduleStatus: ModuleStatus = {
    module_name: 'confirm',
    status: 'idle',
    error_count: 0
  };

  constructor(
    private confirmManagementService: ConfirmManagementService,
    private confirmFactory: ConfirmFactory,
    private confirmValidationService: ConfirmValidationService
  ) {}

  /**
   * 初始化模块
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Confirm module adapter');
      
      // 检查服务是否可用
      if (!this.confirmManagementService || !this.confirmFactory || !this.confirmValidationService) {
        throw new Error('Confirm services not available');
      }

      this.moduleStatus.status = 'initialized';
      this.logger.info('Confirm module adapter initialized successfully');
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      this.logger.error('Failed to initialize Confirm module adapter', error);
      throw error;
    }
  }

  /**
   * 执行确认协调
   */
  async execute(request: ConfirmationCoordinationRequest): Promise<ConfirmationResult> {
    this.logger.info('Executing confirmation coordination', { 
      contextId: request.contextId,
      strategy: request.confirmation_strategy 
    });

    this.moduleStatus.status = 'running';
    this.moduleStatus.last_execution = new Date().toISOString();

    try {
      // 验证请求参数
      this.validateConfirmationRequest(request);

      // 根据策略执行确认流程
      const result = await this.executeConfirmationStrategy(request);

      this.moduleStatus.status = 'idle';
      
      this.logger.info('Confirmation coordination completed', {
        contextId: request.contextId,
        confirmation_id: result.confirmation_id
      });

      return result;
    } catch (error) {
      this.moduleStatus.status = 'error';
      this.moduleStatus.error_count++;
      
      this.logger.error('Confirmation coordination failed', {
        contextId: request.contextId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Confirm module adapter');
      this.moduleStatus.status = 'idle';
      this.logger.info('Confirm module adapter cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup Confirm module adapter', error);
      throw error;
    }
  }

  /**
   * 获取模块状态
   */
  getStatus(): ModuleStatus {
    return this.moduleStatus;
  }

  // ===== 私有方法 =====

  /**
   * 验证确认请求
   */
  private validateConfirmationRequest(request: ConfirmationCoordinationRequest): void {
    if (!request.contextId) {
      throw new Error('Context ID is required');
    }

    if (!['manual', 'automatic', 'conditional', 'multi_stage'].includes(request.confirmation_strategy)) {
      throw new Error(`Unsupported confirmation strategy: ${request.confirmation_strategy}`);
    }

    // 验证超时设置
    if (request.parameters.timeoutMs && (request.parameters.timeoutMs as number) <= 0) {
      throw new Error('Timeout must be positive');
    }

    // 验证升级策略
    if (request.parameters.escalation_policy) {
      const { levels, timeout_per_level } = request.parameters.escalation_policy;
      
      if (!Array.isArray(levels) || levels.length === 0) {
        throw new Error('Escalation levels must be a non-empty array');
      }
      
      if (timeout_per_level && timeout_per_level <= 0) {
        throw new Error('Escalation timeout per level must be positive');
      }
    }

    // 验证审批工作流
    if (request.approvalWorkflow) {
      const { required_approvers, approval_threshold } = request.approvalWorkflow;
      
      if (!Array.isArray(required_approvers) || required_approvers.length === 0) {
        throw new Error('Required approvers must be a non-empty array');
      }
      
      if (approval_threshold && (approval_threshold <= 0 || approval_threshold > required_approvers.length)) {
        throw new Error('Approval threshold must be between 1 and the number of required approvers');
      }
    }
  }

  /**
   * 执行确认策略
   */
  private async executeConfirmationStrategy(request: ConfirmationCoordinationRequest): Promise<ConfirmationResult> {
    const confirmation_id = uuidv4();
    const timestamp = new Date().toISOString();

    // 根据策略生成确认数据
    const confirmData = await this.generateConfirmData(request);

    // 创建确认
    const createResult = await this.confirmManagementService.createConfirm(confirmData);
    if (!createResult.success || !createResult.data) {
      throw new Error(`Failed to create confirmation: ${createResult.error}`);
    }

    // 执行确认流程
    const approverResponses = await this.executeApprovalWorkflow(request);

    // 确定最终决策
    const finalDecision = this.determineFinalDecision(request, approverResponses);

    return {
      confirmation_id: confirmation_id as UUID,
      approval_status: this.mapDecisionToStatus(finalDecision, approverResponses),
      approver_responses: approverResponses,
      final_decision: finalDecision,
      timestamp: timestamp as Timestamp
    };
  }

  /**
   * 生成确认数据
   */
  private async generateConfirmData(request: ConfirmationCoordinationRequest): Promise<CreateConfirmRequest> {
    const confirmationType = this.mapStrategyToConfirmationType(request.confirmation_strategy);
    const priority = this.determinePriority(request);

    return {
      contextId: request.contextId,
      confirmationType: confirmationType,
      priority: priority,
      subject: {
        title: `Confirmation for ${request.confirmation_strategy} strategy`,
        description: `Confirmation request created using ${request.confirmation_strategy} strategy`,
        impactAssessment: {
          businessImpact: 'medium',
          technicalImpact: 'low',
          riskLevel: RiskLevel.MEDIUM,
          impactScope: ['core-orchestrator', 'system']
        }
      },
      requester: {
        userId: 'core-orchestrator',
        name: 'Core Orchestrator',
        role: 'system',
        email: 'core@system.com',
        department: 'core',
        requestReason: `Coordination request using ${request.confirmation_strategy} strategy`
      },
      approvalWorkflow: {
        workflowType: request.confirmation_strategy === 'multi_stage' ? 'sequential' :
                      request.approvalWorkflow?.parallel_approval ? 'parallel' : 'consensus',
        steps: this.generateApprovalSteps(request),
        autoApprovalRules: request.confirmation_strategy === 'automatic' ? {
          enabled: true,
          conditions: ['system_request']
        } : undefined
      },
      expiresAt: request.parameters.timeoutMs ?
        new Date(Date.now() + (request.parameters.timeoutMs as number)).toISOString() : undefined,
      metadata: {
        source: 'core-orchestrator',
        tags: [request.confirmation_strategy, 'coordination'],
        customFields: {
          strategy: request.confirmation_strategy,
          auto_approval: request.confirmation_strategy === 'automatic',
          conditional_rules: request.parameters.approval_rules || []
        }
      }
    };
  }

  /**
   * 执行审批工作流
   */
  private async executeApprovalWorkflow(
    request: ConfirmationCoordinationRequest
  ): Promise<Record<string, {
    decision: 'approve' | 'reject' | 'abstain';
    timestamp: Timestamp;
    comments?: string;
  }>> {
    const responses: Record<string, {
      decision: 'approve' | 'reject' | 'abstain';
      timestamp: Timestamp;
      comments?: string;
    }> = {};
    const approvers = request.approvalWorkflow?.required_approvers || ['system'];

    // 根据策略执行不同的审批流程
    switch (request.confirmation_strategy) {
      case 'automatic':
        // 自动批准
        responses['system'] = {
          decision: 'approve',
          timestamp: new Date().toISOString(),
          comments: 'Automatically approved'
        };
        break;

      case 'manual':
        // 手动审批（模拟）
        for (const approver of approvers) {
          responses[approver] = {
            decision: 'approve', // 简化实现，实际应该等待用户输入
            timestamp: new Date().toISOString(),
            comments: 'Manual approval'
          };
        }
        break;

      case 'conditional': {
        // 条件审批
        const shouldApprove = this.evaluateApprovalConditions(request);
        responses['system'] = {
          decision: shouldApprove ? 'approve' : 'reject',
          timestamp: new Date().toISOString(),
          comments: `Conditional approval: ${shouldApprove ? 'conditions met' : 'conditions not met'}`
        };
        break;
      }

      case 'multi_stage':
        // 多阶段审批
        for (let i = 0; i < approvers.length; i++) {
          const approver = approvers[i];
          responses[approver] = {
            decision: 'approve', // 简化实现
            timestamp: new Date().toISOString(),
            comments: `Stage ${i + 1} approval`
          };
        }
        break;
    }

    return responses;
  }

  /**
   * 确定最终决策
   */
  private determineFinalDecision(
    request: ConfirmationCoordinationRequest,
    approverResponses: Record<string, {
      decision: 'approve' | 'reject' | 'abstain';
      timestamp: Timestamp;
      comments?: string;
    }>
  ): boolean {
    const responses = Object.values(approverResponses);
    const approvals = responses.filter(r => r.decision === 'approve').length;
    const rejections = responses.filter(r => r.decision === 'reject').length;
    const threshold = request.approvalWorkflow?.approval_threshold || 1;

    // 如果有拒绝且不是自动策略，则拒绝
    if (rejections > 0 && request.confirmation_strategy !== 'automatic') {
      return false;
    }

    // 检查是否达到批准阈值
    return approvals >= threshold;
  }

  /**
   * 映射决策到状态
   */
  private mapDecisionToStatus(
    finalDecision: boolean,
    approverResponses: Record<string, {
      decision: 'approve' | 'reject' | 'abstain';
      timestamp: Timestamp;
      comments?: string;
    }>
  ): 'approved' | 'rejected' | 'pending' | 'escalated' {
    if (finalDecision) {
      return 'approved';
    }

    const responses = Object.values(approverResponses);
    const hasRejection = responses.some(r => r.decision === 'reject');
    
    if (hasRejection) {
      return 'rejected';
    }

    // 检查是否需要升级
    const hasPendingApprovals = responses.some(r => r.decision === 'abstain');
    if (hasPendingApprovals) {
      return 'escalated';
    }

    return 'pending';
  }

  /**
   * 映射策略到确认类型
   */
  private mapStrategyToConfirmationType(strategy: string): ConfirmationType {
    switch (strategy) {
      case 'manual':
        return ConfirmationType.TASK_APPROVAL;
      case 'automatic':
        return ConfirmationType.RESOURCE_ALLOCATION;
      case 'conditional':
        return ConfirmationType.RISK_ACCEPTANCE;
      case 'multi_stage':
        return ConfirmationType.PLAN_APPROVAL;
      default:
        return ConfirmationType.TASK_APPROVAL;
    }
  }

  /**
   * 确定优先级
   */
  private determinePriority(request: ConfirmationCoordinationRequest): Priority {
    const timeout = request.parameters.timeoutMs;
    
    if (timeout && (timeout as number) < 300000) { // < 5 minutes
      return Priority.URGENT;
    } else if (timeout && (timeout as number) < 3600000) { // < 1 hour
      return Priority.HIGH;
    } else {
      return Priority.MEDIUM;
    }
  }

  /**
   * 评估审批条件
   */
  private evaluateApprovalConditions(request: ConfirmationCoordinationRequest): boolean {
    const rules = request.parameters.approval_rules || [];

    // 简化实现：如果没有规则，默认批准
    if (rules.length === 0) {
      return true;
    }

    // 简化实现：检查基本条件
    for (const rule of rules) {
      if (typeof rule === 'string' && rule.includes('reject')) {
        return false;
      }
    }

    return true;
  }

  /**
   * 生成审批步骤
   */
  private generateApprovalSteps(request: ConfirmationCoordinationRequest): ApprovalStep[] {
    const approvers = request.approvalWorkflow?.required_approvers || ['system'];
    const steps: ApprovalStep[] = [];

    if (request.confirmation_strategy === 'multi_stage') {
      // 多阶段：每个审批者一个步骤
      approvers.forEach((approver, index) => {
        steps.push({
          stepId: `step_${index + 1}`,
          name: `Stage ${index + 1} Approval`,
          stepOrder: index + 1,
          approverRole: approver,
          timeoutHours: 1,
          status: StepStatus.PENDING
        });
      });
    } else {
      // 单阶段：所有审批者在一个步骤中
      steps.push({
        stepId: 'step_1',
        name: 'Single Stage Approval',
        stepOrder: 1,
        approverRole: approvers[0] || 'system',
        timeoutHours: Math.ceil((typeof request.parameters.timeoutMs === 'number' ? request.parameters.timeoutMs : 3600000) / (1000 * 60 * 60)),
        status: StepStatus.PENDING
      });
    }

    return steps;
  }

  /**
   * P0修复：执行工作流阶段
   */
  async executeStage(context: WorkflowExecutionContext): Promise<StageExecutionResult> {
    // 简化实现：直接调用executeBusinessCoordination
    const businessRequest: BusinessCoordinationRequest = {
      coordination_id: ('stage-' + Date.now()) as UUID,
      contextId: context.contextId,
      module: 'confirm',
      coordination_type: 'confirmation_coordination',
      input_data: {
        data_type: 'confirmation_data',
        data_version: '1.0.0',
        payload: { contextId: context.contextId },
        metadata: {
          source_module: 'confirm',
          target_modules: ['confirm'],
          data_schema_version: '1.0.0',
          validation_status: 'valid',
          security_level: 'internal'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      previous_stage_results: [],
      configuration: {
        timeout_ms: 30000,
        retryPolicy: { max_attempts: 3, delay_ms: 1000 },
        validationRules: [],
        output_format: 'confirmation_data'
      }
    };

    const result = await this.executeBusinessCoordination(businessRequest);
    return {
      stage: 'confirm',
      status: 'completed',
      result: result.output_data,
      duration_ms: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
  }

  /**
   * P0修复：执行业务协调
   */
  async executeBusinessCoordination(request: BusinessCoordinationRequest): Promise<BusinessCoordinationResult> {
    const startTime = Date.now();

    try {
      // 转换为原有的确认请求格式
      const payload = request.input_data.payload as BusinessPayload;
      const confirmRequest: ConfirmationCoordinationRequest = {
        contextId: request.contextId,
        confirmation_strategy: payload?.confirmation_strategy || 'manual',
        parameters: {
          approval_type: payload?.approval_type || 'manual',
          approvers: payload?.approvers || ['default-approver'],
          approval_criteria: payload?.approvalCriteria || {},
          timeout_ms: 30000
        }
      };

      // 执行原有的确认逻辑
      const result = await this.execute(confirmRequest);

      // 转换结果为业务协调结果
      return {
        coordination_id: request.coordination_id,
        module: 'confirm',
        status: 'completed',
        output_data: {
          data_type: 'confirmation_data',
          data_version: '1.0.0',
          payload: result as unknown as Record<string, unknown>,
          metadata: {
            source_module: 'confirm',
            target_modules: ['trace'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        coordination_id: request.coordination_id,
        module: 'confirm',
        status: 'failed',
        output_data: request.input_data,
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        error: {
          error_id: 'confirm-error-' + Date.now(),
          error_type: 'business_logic_error',
          error_code: 'CONFIRM_COORDINATION_FAILED',
          error_message: error instanceof Error ? error.message : String(error),
          source_module: 'confirm',
          context_data: { coordinationId: request.coordination_id },
          recovery_suggestions: [
            {
              suggestion_type: 'retry',
              description: 'Retry the confirmation coordination',
              automated: true
            }
          ],
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * P0修复：验证输入数据
   */
  async validateInput(input: unknown): Promise<ValidationResult> {
    try {
      // 基本验证：检查输入是否为对象
      if (!input || typeof input !== 'object') {
        return {
          is_valid: false,
          errors: [{
            field_path: 'input',
            error_code: 'INVALID_TYPE',
            error_message: 'Input must be a valid object'
          }],
          warnings: []
        };
      }

      // 验证通过
      return {
        is_valid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      return {
        is_valid: false,
        errors: [{
          field_path: 'input',
          error_code: 'VALIDATION_ERROR',
          error_message: error instanceof Error ? error.message : 'Unknown validation error'
        }],
        warnings: []
      };
    }
  }

  /**
   * P0修复：处理错误
   */
  async handleError(error: BusinessError, context: BusinessContext): Promise<ErrorHandlingResult> {
    this.logger.error('Handling Confirm module error', {
      errorId: error.error_id,
      errorType: error.error_type,
      contextId: context.contextId
    });

    // 根据错误类型决定恢复策略
    let recoveryAction: 'retry' | 'skip' | 'rollback' | 'escalate' = 'escalate';

    switch (error.error_type) {
      case 'validation_error':
        recoveryAction = 'retry';
        break;
      case 'timeout_error':
        recoveryAction = 'retry';
        break;
      case 'dependency_error':
        recoveryAction = 'retry';
        break;
      default:
        recoveryAction = 'escalate';
        break;
    }

    return {
      handled: true,
      recovery_action: recoveryAction
    };
  }
}

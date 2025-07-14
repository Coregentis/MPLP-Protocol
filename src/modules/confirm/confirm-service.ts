/**
 * MPLP Confirm服务实现
 * 
 * 核心验证决策和审批管理服务，严格按照confirm-protocol.json Schema实现
 * 
 * @version 1.0.1
 * @updated 2025-07-10T17:04:47+08:00
 * @performance 目标: <3ms 验证响应, >1000 TPS 批量处理
 * @compliance 100% Schema合规性 - 完全基于confirm-protocol.json重构
 */

import {
  ConfirmProtocol,
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmResponse,
  BatchConfirmRequest,
  BatchConfirmResponse,
  ConfirmFilter,
  StepActionRequest,
  WorkflowActionResponse,
  ConfirmError,
  ValidationError,
  WorkflowError,
  PermissionError,
  ConfirmSubject,
  NotificationSettings,
  UUID,
  Timestamp,
  ConfirmationType,
  ConfirmStatus,
  Priority,
  WorkflowType,
  DecisionOutcome,
  AuditEventType,
  StepStatus,
  ApprovalStep,
  ApprovalWorkflow
} from './types';

import { logger } from '../../utils/logger';
import { Performance } from '../../utils/performance';

/**
 * 确认性能指标接口
 */
interface ConfirmPerformanceMetrics extends Record<string, unknown> {
  operation: string;
  duration_ms: number;
  success: boolean;
  error_code?: string;
  batch_size?: number;
  timestamp: string;
}

/**
 * Confirm核心服务类
 * 负责所有确认相关的业务逻辑处理
 */
export class ConfirmService {
  private readonly PROTOCOL_VERSION = '1.0.1';
  private readonly performanceMonitor: Performance;
  private readonly startTime: number = Date.now();

  constructor() {
    this.performanceMonitor = new Performance();
    logger.info('ConfirmService initialized', {
      version: this.PROTOCOL_VERSION,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 创建新的确认请求
   * 
   * @param request 创建请求参数
   * @returns Promise<ConfirmResponse> 创建结果
   */
  public async createConfirmation(request: CreateConfirmRequest): Promise<ConfirmResponse> {
    const startTime = Date.now();
    const traceId = this.generateUUID();

    try {
      // 1. 输入验证
      this.validateCreateRequest(request);

      // 2. 生成确认协议对象
      const confirmId = this.generateUUID();
      const timestamp = new Date().toISOString();

      const confirmProtocol: ConfirmProtocol = {
        protocol_version: this.PROTOCOL_VERSION,
        timestamp,
        confirm_id: confirmId,
        context_id: request.context_id,
        plan_id: request.plan_id,
        confirmation_type: request.confirmation_type,
        status: 'pending',
        priority: request.priority,
        requester: request.requester,
        approval_workflow: request.approval_workflow,
        subject: request.subject,
        risk_assessment: request.risk_assessment,
        notification_settings: request.notification_settings,
        audit_trail: [{
          event_id: this.generateUUID(),
          timestamp,
          event_type: 'created',
          actor: {
            user_id: request.requester?.user_id || 'system',
            role: request.requester?.role || 'system'
          },
          description: `Confirmation created: ${request.subject?.title || 'Untitled'}`
        }]
      };

      // 3. 保存到数据库（模拟）
      await this.saveConfirmation(confirmProtocol);

      // 4. 触发工作流
      await this.initializeWorkflow(confirmProtocol);

      // 5. 发送通知
      await this.sendNotifications(confirmProtocol, 'created');

      const processingTime = Date.now() - startTime;
      
      // 6. 记录性能指标
      this.recordPerformanceMetric({
        operation: 'createConfirmation',
        duration_ms: processingTime,
        success: true,
        timestamp: new Date().toISOString()
      });

      logger.info('Confirmation created successfully', {
        confirm_id: confirmId,
        type: request.confirmation_type,
        priority: request.priority,
        processing_time_ms: processingTime,
        trace_id: traceId
      });

      return {
        success: true,
        data: confirmProtocol,
        metadata: {
          request_id: traceId,
          processing_time_ms: processingTime,
          trace_id: traceId
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.recordPerformanceMetric({
        operation: 'createConfirmation',
        duration_ms: processingTime,
        success: false,
        error_code: error instanceof ConfirmError ? error.code : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });

      logger.error('Failed to create confirmation', {
        error: error instanceof Error ? error.message : String(error),
        request_type: request.confirmation_type,
        processing_time_ms: processingTime,
        trace_id: traceId
      });

      return {
        success: false,
        error: {
          code: error instanceof ConfirmError ? error.code : 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error instanceof ConfirmError ? error.details : undefined
        },
        metadata: {
          request_id: traceId,
          processing_time_ms: processingTime,
          trace_id: traceId
        }
      };
    }
  }

  /**
   * 更新确认状态
   * 
   * @param confirmId 确认ID
   * @param request 更新请求
   * @returns Promise<ConfirmResponse> 更新结果
   */
  public async updateConfirmation(confirmId: UUID, request: UpdateConfirmRequest): Promise<ConfirmResponse> {
    const startTime = Date.now();
    const traceId = this.generateUUID();

    try {
      // 1. 验证权限
      await this.validateUpdatePermission(confirmId, request);

      // 2. 获取现有确认
      const existing = await this.getConfirmationById(confirmId);
      if (!existing) {
        throw new ValidationError(`Confirmation not found: ${confirmId}`);
      }

      // 3. 创建更新后的确认对象
      const timestamp = new Date().toISOString();
      const updated: ConfirmProtocol = {
        ...existing,
        timestamp,
        status: request.status || existing.status,
        priority: request.priority || existing.priority,
        subject: request.subject ? { 
          ...existing.subject, 
          ...request.subject 
        } as ConfirmSubject : existing.subject,
        notification_settings: request.notification_settings ? {
          ...existing.notification_settings,
          ...request.notification_settings
        } as NotificationSettings : existing.notification_settings,
        audit_trail: [
          ...(existing.audit_trail || []),
          {
            event_id: this.generateUUID(),
            timestamp,
            event_type: 'updated',
            actor: {
              user_id: 'system', // TODO: 从上下文获取实际用户
              role: 'system'
            },
            description: 'Confirmation updated'
          }
        ]
      };

      // 4. 保存更新
      await this.saveConfirmation(updated);

      // 5. 处理状态变更事件
      if (request.status && request.status !== existing.status) {
        await this.handleStatusChange(updated, existing.status, request.status);
      }

      const processingTime = Date.now() - startTime;

      this.recordPerformanceMetric({
        operation: 'updateConfirmation',
        duration_ms: processingTime,
        success: true,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: updated,
        metadata: {
          request_id: traceId,
          processing_time_ms: processingTime,
          trace_id: traceId
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.recordPerformanceMetric({
        operation: 'updateConfirmation',
        duration_ms: processingTime,
        success: false,
        error_code: error instanceof ConfirmError ? error.code : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: {
          code: error instanceof ConfirmError ? error.code : 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : String(error)
        },
        metadata: {
          request_id: traceId,
          processing_time_ms: processingTime,
          trace_id: traceId
        }
      };
    }
  }

  /**
   * 处理工作流步骤操作
   * 
   * @param confirmId 确认ID
   * @param request 步骤操作请求
   * @returns Promise<WorkflowActionResponse> 操作结果
   */
  public async processStepAction(confirmId: UUID, request: StepActionRequest): Promise<WorkflowActionResponse> {
    const startTime = Date.now();
    const traceId = this.generateUUID();

    try {
      // 1. 获取确认对象
      const confirmation = await this.getConfirmationById(confirmId);
      if (!confirmation) {
        throw new ValidationError(`Confirmation not found: ${confirmId}`);
      }

      // 2. 验证步骤权限
      await this.validateStepPermission(confirmation, request.step_id);

      // 3. 处理决策
      const updatedConfirmation = await this.processDecision(confirmation, request);

      // 4. 检查工作流完成状态
      const workflowCompleted = await this.checkWorkflowCompletion(updatedConfirmation);

      // 5. 获取下一步骤
      const nextSteps = workflowCompleted ? [] : await this.getNextSteps(updatedConfirmation);

      return {
        success: true,
        updated_confirmation: updatedConfirmation,
        next_steps: nextSteps,
        workflow_completed: workflowCompleted
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Failed to process step action', {
        confirm_id: confirmId,
        step_id: request.step_id,
        action: request.action,
        error: error instanceof Error ? error.message : String(error),
        processing_time_ms: processingTime,
        trace_id: traceId
      });

      throw error;
    }
  }

  /**
   * 批量创建确认
   * 
   * @param batchRequest 批量请求
   * @returns Promise<BatchConfirmResponse> 批量结果
   */
  public async batchCreateConfirmations(batchRequest: BatchConfirmRequest): Promise<BatchConfirmResponse> {
    const startTime = Date.now();
    const { requests, batch_options } = batchRequest;
    const results: ConfirmResponse[] = [];
    
    const stopOnError = batch_options?.stop_on_error ?? false;
    const maxParallel = batch_options?.parallel_processing ? 10 : 1;

    try {
      // 分批处理请求
      const batches = this.chunkArray(requests, maxParallel);
      
      for (const batch of batches) {
        const batchPromises = batch.map(async (request) => {
          try {
            return await this.createConfirmation(request);
          } catch (error) {
            if (stopOnError) {
              throw error;
            }
            return {
              success: false,
              error: {
                code: 'BATCH_ITEM_FAILED',
                message: error instanceof Error ? error.message : String(error)
              }
            } as ConfirmResponse;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const processingTime = Date.now() - startTime;
      const succeeded = results.filter(r => r.success).length;
      const failed = results.length - succeeded;

      this.recordPerformanceMetric({
        operation: 'batchCreateConfirmations',
        duration_ms: processingTime,
        success: failed === 0,
        batch_size: requests.length,
        timestamp: new Date().toISOString()
      });

      return {
        success: failed === 0,
        results,
        summary: {
          total: requests.length,
          succeeded,
          failed,
          processing_time_ms: processingTime
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.recordPerformanceMetric({
        operation: 'batchCreateConfirmations',
        duration_ms: processingTime,
        success: false,
        error_code: error instanceof ConfirmError ? error.code : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * 查询确认列表
   * 
   * @param filter 查询过滤器
   * @returns Promise<ConfirmProtocol[]> 查询结果
   */
  public async queryConfirmations(filter?: ConfirmFilter): Promise<ConfirmProtocol[]> {
    const startTime = Date.now();

    try {
      // 1. 构建查询
      const query = this.buildQuery(filter);

      // 2. 执行查询
      const results = await this.executeQuery(query);

      // 3. 记录性能指标
      const processingTime = Date.now() - startTime;
      this.recordPerformanceMetric({
        operation: 'queryConfirmations',
        duration_ms: processingTime,
        success: true,
        timestamp: new Date().toISOString()
      });

      return results;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.recordPerformanceMetric({
        operation: 'queryConfirmations',
        duration_ms: processingTime,
        success: false,
        error_code: error instanceof ConfirmError ? error.code : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * 获取服务健康状态
   * 
   * @returns Promise<object> 健康状态
   */
  public async getHealthStatus(): Promise<{ status: string; checks: Record<string, 'pass' | 'fail'> }> {
    const checks = {
      database: await this.checkDatabaseHealth(),
      notification: await this.checkNotificationHealth(),
      workflow: await this.checkWorkflowHealth()
    };

    const allPassed = Object.values(checks).every(status => status === 'pass');
    
    return {
      status: allPassed ? 'healthy' : 'unhealthy',
      checks
    };
  }

  // ===== 私有方法 =====

  /**
   * 验证创建请求
   */
  private validateCreateRequest(request: CreateConfirmRequest): void {
    if (!request.context_id) {
      throw new ValidationError('context_id is required');
    }
    
    if (!request.confirmation_type) {
      throw new ValidationError('confirmation_type is required');
    }
    
    if (!request.priority) {
      throw new ValidationError('priority is required');
    }
  }

  /**
   * 验证更新权限
   */
  private async validateUpdatePermission(confirmId: UUID, request: UpdateConfirmRequest): Promise<void> {
    // TODO: 实现权限检查逻辑
    logger.debug('Validating update permission', { confirmId, request });
  }

  /**
   * 验证步骤权限
   * 
   * @param confirmation 确认对象
   * @param stepId 步骤ID
   * @returns Promise<void>
   * @throws {PermissionError} 如果权限验证失败
   */
  private async validateStepPermission(confirmation: ConfirmProtocol, stepId: UUID): Promise<void> {
    logger.debug('Validating step permission', { confirmId: confirmation.confirm_id, stepId });
    
    try {
      // 检查确认状态
      if (confirmation.status !== 'pending' && confirmation.status !== 'in_review') {
        throw new PermissionError(`Cannot perform action on confirmation with status: ${confirmation.status}`);
      }
      
      // 检查工作流是否存在
      if (!confirmation.approval_workflow || !confirmation.approval_workflow.steps) {
        throw new PermissionError('No approval workflow defined for this confirmation');
      }
      
      // 查找对应的步骤
      const step = confirmation.approval_workflow.steps.find(s => s.step_id === stepId);
      
      if (!step) {
        throw new PermissionError(`Step not found: ${stepId}`);
      }
      
      // 检查步骤状态
      if (step.status !== 'pending') {
        throw new PermissionError(`Step is not in pending status: ${step.status}`);
      }
      
      // 在实际实现中，这里应该检查当前用户是否有权限操作该步骤
      // 例如，检查当前用户是否是步骤的审批人或具有相应的角色
      
      // 模拟权限检查成功
      logger.debug('Step permission validated successfully', { 
        confirmId: confirmation.confirm_id, 
        stepId,
        step_order: step.step_order
      });
      
    } catch (error) {
      logger.error('Step permission validation failed', {
        confirmId: confirmation.confirm_id,
        stepId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 初始化工作流
   * 
   * @param confirmation 确认对象
   * @returns Promise<void>
   */
  private async initializeWorkflow(confirmation: ConfirmProtocol): Promise<void> {
    logger.debug('Initializing workflow', { confirmId: confirmation.confirm_id });
    
    try {
      // 检查是否已有工作流
      if (!confirmation.approval_workflow) {
        // 如果没有工作流，根据确认类型创建默认工作流
        confirmation.approval_workflow = this.createDefaultWorkflow(confirmation);
        logger.info('Created default workflow', { 
          confirmId: confirmation.confirm_id,
          workflow_type: confirmation.approval_workflow.workflow_type
        });
      }
      
      // 确保所有步骤都有正确的初始状态
      if (confirmation.approval_workflow.steps) {
        confirmation.approval_workflow.steps.forEach(step => {
          if (!step.status) {
            step.status = 'pending';
          }
        });
      }
      
      // 模拟工作流初始化延迟
      await new Promise(resolve => setTimeout(resolve, 8));
      
      // 在实际实现中，这里可能需要执行其他工作流初始化操作
      // 例如，设置超时处理、通知审批人等
      
      logger.info('Workflow initialized successfully', { 
        confirmId: confirmation.confirm_id,
        workflow_type: confirmation.approval_workflow.workflow_type,
        steps_count: confirmation.approval_workflow.steps.length
      });
      
    } catch (error) {
      logger.error('Failed to initialize workflow', {
        confirmId: confirmation.confirm_id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 创建默认工作流
   * 
   * @private
   * @param confirmation 确认对象
   * @returns ApprovalWorkflow 默认工作流
   */
  private createDefaultWorkflow(confirmation: ConfirmProtocol): ApprovalWorkflow {
    // 根据确认类型创建不同的默认工作流
    switch (confirmation.confirmation_type) {
      case 'emergency_approval':
        // 紧急审批使用单一审批人模式
        return {
          workflow_type: 'single_approver',
          steps: [
            {
              step_id: this.generateUUID(),
              step_order: 1,
              approver: {
                user_id: 'emergency-approver',
                role: 'emergency_manager',
                is_required: true
              },
              status: 'pending'
            }
          ]
        };
        
      case 'risk_acceptance':
        // 风险接受使用共识模式
        return {
          workflow_type: 'consensus',
          steps: [
            {
              step_id: this.generateUUID(),
              step_order: 1,
              approver: {
                user_id: 'risk-manager',
                role: 'risk_manager',
                is_required: true
              },
              status: 'pending'
            },
            {
              step_id: this.generateUUID(),
              step_order: 2,
              approver: {
                user_id: 'security-officer',
                role: 'security_officer',
                is_required: true
              },
              status: 'pending'
            },
            {
              step_id: this.generateUUID(),
              step_order: 3,
              approver: {
                user_id: 'compliance-officer',
                role: 'compliance_officer',
                is_required: true
              },
              status: 'pending'
            }
          ]
        };
        
      default:
        // 默认使用顺序审批模式
        return {
          workflow_type: 'sequential',
          steps: [
            {
              step_id: this.generateUUID(),
              step_order: 1,
              approver: {
                user_id: 'team-lead',
                role: 'team_lead',
                is_required: true
              },
              status: 'pending'
            },
            {
              step_id: this.generateUUID(),
              step_order: 2,
              approver: {
                user_id: 'department-manager',
                role: 'department_manager',
                is_required: true
              },
              status: 'pending'
            }
          ]
        };
    }
  }

  /**
   * 发送通知
   * 
   * @param confirmation 确认对象
   * @param event 事件类型
   * @returns Promise<void>
   */
  private async sendNotifications(confirmation: ConfirmProtocol, event: 'created' | 'updated' | 'completed'): Promise<void> {
    logger.debug('Sending notifications', { 
      confirmId: confirmation.confirm_id, 
      event,
      settings: confirmation.notification_settings 
    });
    
    try {
      // 检查是否有通知设置
      if (!confirmation.notification_settings) {
        logger.debug('No notification settings, skipping notifications', { 
          confirmId: confirmation.confirm_id 
        });
        return;
      }
      
      // 检查事件是否需要通知
      const { notify_on_events } = confirmation.notification_settings;
      if (!notify_on_events || !notify_on_events.includes(event as any)) {
        logger.debug('Event not configured for notification', { 
          confirmId: confirmation.confirm_id,
          event,
          configured_events: notify_on_events
        });
        return;
      }
      
      // 获取通知渠道
      const { notification_channels } = confirmation.notification_settings;
      if (!notification_channels || notification_channels.length === 0) {
        logger.debug('No notification channels configured', { 
          confirmId: confirmation.confirm_id 
        });
        return;
      }
      
      // 模拟通知发送延迟
      await new Promise(resolve => setTimeout(resolve, 12));
      
      // 在实际实现中，这里应该根据不同的通知渠道发送通知
      // 例如，发送邮件、短信、Webhook等
      
      logger.info('Notifications sent successfully', { 
        confirmId: confirmation.confirm_id,
        event,
        channels: notification_channels,
        recipients: confirmation.notification_settings.stakeholders?.length || 0
      });
      
    } catch (error) {
      logger.error('Failed to send notifications', {
        confirmId: confirmation.confirm_id,
        event,
        error: error instanceof Error ? error.message : String(error)
      });
      // 通知失败不应该阻止主流程，所以这里不抛出异常
    }
  }

  /**
   * 处理状态变更
   */
  private async handleStatusChange(
    confirmation: ConfirmProtocol, 
    oldStatus: ConfirmStatus, 
    newStatus: ConfirmStatus
  ): Promise<void> {
    logger.info('Handling status change', {
      confirmId: confirmation.confirm_id,
      oldStatus,
      newStatus
    });
    // TODO: 实现状态变更处理逻辑
  }

  /**
   * 处理决策
   * 
   * @param confirmation 确认对象
   * @param request 步骤操作请求
   * @returns Promise<ConfirmProtocol> 更新后的确认对象
   */
  private async processDecision(confirmation: ConfirmProtocol, request: StepActionRequest): Promise<ConfirmProtocol> {
    logger.debug('Processing decision', { 
      confirmId: confirmation.confirm_id, 
      stepId: request.step_id,
      action: request.action 
    });
    
    try {
      // 深拷贝确认对象，避免直接修改原对象
      const updatedConfirmation = JSON.parse(JSON.stringify(confirmation)) as ConfirmProtocol;
      
      // 确保存在工作流
      if (!updatedConfirmation.approval_workflow || !updatedConfirmation.approval_workflow.steps) {
        throw new WorkflowError('No approval workflow defined for this confirmation');
      }
      
      // 查找对应的步骤
      const stepIndex = updatedConfirmation.approval_workflow.steps.findIndex(
        step => step.step_id === request.step_id
      );
      
      if (stepIndex === -1) {
        throw new WorkflowError(`Step not found: ${request.step_id}`);
      }
      
      const step = updatedConfirmation.approval_workflow.steps[stepIndex];
      
      // 检查步骤状态
      if (step.status !== 'pending') {
        throw new WorkflowError(`Step is not in pending status: ${step.status}`);
      }
      
      // 更新步骤状态和决策
      step.status = this.getStepStatusFromDecision(request.action);
      step.decision = {
        outcome: request.action,
        comments: request.comments,
        conditions: request.conditions,
        timestamp: new Date().toISOString(),
        signature: request.signature
      };
      
      // 添加审计记录
      if (!updatedConfirmation.audit_trail) {
        updatedConfirmation.audit_trail = [];
      }
      
      updatedConfirmation.audit_trail.push({
        event_id: this.generateUUID(),
        timestamp: new Date().toISOString(),
        event_type: this.getAuditEventTypeFromDecision(request.action),
        actor: {
          user_id: step.approver.user_id,
          role: step.approver.role
        },
        description: `Step ${step.step_order} ${request.action} by ${step.approver.role}`
      });
      
      // 根据工作流类型和决策结果更新确认状态
      this.updateConfirmationStatus(updatedConfirmation);
      
      // 保存更新后的确认对象
      await this.saveConfirmation(updatedConfirmation);
      
      // 如果有必要，发送通知
      await this.sendNotifications(updatedConfirmation, 'updated');
      
      return updatedConfirmation;
      
    } catch (error) {
      logger.error('Error processing decision', {
        confirmId: confirmation.confirm_id,
        stepId: request.step_id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 根据决策结果获取步骤状态
   * 
   * @private
   * @param decision 决策结果
   * @returns StepStatus 步骤状态
   */
  private getStepStatusFromDecision(decision: DecisionOutcome): StepStatus {
    switch (decision) {
      case 'approve':
        return 'approved';
      case 'reject':
        return 'rejected';
      case 'delegate':
        return 'delegated';
      case 'request_changes':
        return 'pending'; // 请求更改后仍然是待处理状态
      default:
        return 'pending';
    }
  }

  /**
   * 根据决策结果获取审计事件类型
   * 
   * @private
   * @param decision 决策结果
   * @returns AuditEventType 审计事件类型
   */
  private getAuditEventTypeFromDecision(decision: DecisionOutcome): AuditEventType {
    switch (decision) {
      case 'approve':
        return 'approved';
      case 'reject':
        return 'rejected';
      case 'delegate':
        return 'updated';
      case 'request_changes':
        return 'updated';
      default:
        return 'updated';
    }
  }

  /**
   * 更新确认状态
   * 
   * @private
   * @param confirmation 确认对象
   */
  private updateConfirmationStatus(confirmation: ConfirmProtocol): void {
    // 如果没有工作流，不做任何更改
    if (!confirmation.approval_workflow || !confirmation.approval_workflow.steps) {
      return;
    }
    
    const { workflow_type, steps } = confirmation.approval_workflow;
    
    // 检查所有步骤状态
    const allApproved = steps.every(step => step.status === 'approved');
    const anyRejected = steps.some(step => step.status === 'rejected');
    const allCompleted = steps.every(step => 
      step.status === 'approved' || step.status === 'rejected' || step.status === 'skipped'
    );
    
    // 根据工作流类型和步骤状态更新确认状态
    if (workflow_type === 'sequential' || workflow_type === 'parallel') {
      if (allApproved) {
        confirmation.status = 'approved';
      } else if (anyRejected) {
        confirmation.status = 'rejected';
      } else if (allCompleted) {
        // 如果所有步骤都已完成但不是全部批准，则拒绝
        confirmation.status = 'rejected';
      }
    } else if (workflow_type === 'consensus') {
      // 共识模式需要计算批准率
      const requiredSteps = steps.filter(step => step.approver.is_required);
      const approvedRequiredSteps = requiredSteps.filter(step => step.status === 'approved');
      
      if (requiredSteps.length > 0 && 
          approvedRequiredSteps.length / requiredSteps.length >= 0.5) {
        confirmation.status = 'approved';
      } else if (anyRejected || allCompleted) {
        confirmation.status = 'rejected';
      }
    }
    
    // 记录状态变更时间
    confirmation.timestamp = new Date().toISOString();
  }

  /**
   * 检查工作流完成状态
   * 
   * @param confirmation 确认对象
   * @returns Promise<boolean> 工作流是否已完成
   */
  private async checkWorkflowCompletion(confirmation: ConfirmProtocol): Promise<boolean> {
    // 如果确认状态已经是最终状态，则工作流已完成
    if (confirmation.status === 'approved' || 
        confirmation.status === 'rejected' || 
        confirmation.status === 'cancelled' || 
        confirmation.status === 'expired') {
      return true;
    }
    
    // 如果没有工作流，则认为工作流已完成
    if (!confirmation.approval_workflow || !confirmation.approval_workflow.steps || 
        confirmation.approval_workflow.steps.length === 0) {
      return true;
    }
    
    const { workflow_type, steps } = confirmation.approval_workflow;
    
    // 根据工作流类型检查完成状态
    switch (workflow_type) {
      case 'single_approver':
        // 单一审批人模式：只要审批人做出决定，工作流就完成
        return steps[0].status === 'approved' || steps[0].status === 'rejected';
        
      case 'sequential':
        // 顺序模式：如果有任何步骤被拒绝，或者所有步骤都已完成，则工作流完成
        if (steps.some(step => step.status === 'rejected')) {
          return true;
        }
        return steps.every(step => 
          step.status === 'approved' || step.status === 'skipped' || step.status === 'delegated'
        );
        
      case 'parallel':
        // 并行模式：所有步骤都需要完成（批准、拒绝或跳过）
        return steps.every(step => 
          step.status !== 'pending'
        );
        
      case 'consensus':
        // 共识模式：所有必需的审批人都需要做出决定
        const requiredSteps = steps.filter(step => step.approver.is_required);
        return requiredSteps.every(step => 
          step.status === 'approved' || step.status === 'rejected' || step.status === 'skipped'
        );
        
      case 'escalation':
        // 升级模式：最后一个步骤需要完成
        const lastStep = steps[steps.length - 1];
        return lastStep.status === 'approved' || lastStep.status === 'rejected';
        
      default:
    return false;
    }
  }

  /**
   * 获取下一步骤
   * 
   * @param confirmation 确认对象
   * @returns Promise<ApprovalStep[]> 下一步骤列表
   */
  private async getNextSteps(confirmation: ConfirmProtocol): Promise<ApprovalStep[]> {
    // 如果工作流已完成，则没有下一步骤
    const isCompleted = await this.checkWorkflowCompletion(confirmation);
    if (isCompleted) {
    return [];
    }
    
    // 如果没有工作流，则没有下一步骤
    if (!confirmation.approval_workflow || !confirmation.approval_workflow.steps || 
        confirmation.approval_workflow.steps.length === 0) {
      return [];
    }
    
    const { workflow_type, steps } = confirmation.approval_workflow;
    
    // 根据工作流类型获取下一步骤
    switch (workflow_type) {
      case 'sequential': {
        // 顺序模式：找到第一个待处理的步骤
        const nextStep = steps.find(step => step.status === 'pending');
        return nextStep ? [nextStep] : [];
      }
      
      case 'parallel':
      case 'consensus':
        // 并行模式和共识模式：所有待处理的步骤都是下一步骤
        return steps.filter(step => step.status === 'pending');
        
      case 'single_approver':
        // 单一审批人模式：如果审批人尚未做出决定，则返回该步骤
        return steps[0].status === 'pending' ? [steps[0]] : [];
        
      case 'escalation': {
        // 升级模式：找到当前活动的步骤
        const activeStep = steps.find(step => step.status === 'pending');
        return activeStep ? [activeStep] : [];
      }
      
      default:
        return [];
    }
  }

  /**
   * 构建查询条件
   * 
   * @param filter 查询过滤器
   * @returns 查询条件对象
   */
  private buildQuery(filter?: ConfirmFilter): any {
    // 创建基础查询对象
    const query: Record<string, any> = {};
    
    // 如果没有过滤条件，返回空查询
    if (!filter) {
      return query;
    }
    
    // 添加ID过滤条件
    if (filter.confirm_ids && filter.confirm_ids.length > 0) {
      query.confirm_id = { $in: filter.confirm_ids };
    }
    
    // 添加上下文ID过滤条件
    if (filter.context_ids && filter.context_ids.length > 0) {
      query.context_id = { $in: filter.context_ids };
    }
    
    // 添加计划ID过滤条件
    if (filter.plan_ids && filter.plan_ids.length > 0) {
      query.plan_id = { $in: filter.plan_ids };
    }
    
    // 添加确认类型过滤条件
    if (filter.confirmation_types && filter.confirmation_types.length > 0) {
      query.confirmation_type = { $in: filter.confirmation_types };
    }
    
    // 添加状态过滤条件
    if (filter.statuses && filter.statuses.length > 0) {
      query.status = { $in: filter.statuses };
    }
    
    // 添加优先级过滤条件
    if (filter.priorities && filter.priorities.length > 0) {
      query.priority = { $in: filter.priorities };
    }
    
    // 添加请求者过滤条件
    if (filter.requester_user_ids && filter.requester_user_ids.length > 0) {
      query['requester.user_id'] = { $in: filter.requester_user_ids };
    }
    
    // 添加时间范围过滤条件
    const timeQuery: Record<string, any> = {};
    
    if (filter.created_after) {
      timeQuery.$gte = filter.created_after;
    }
    
    if (filter.created_before) {
      timeQuery.$lte = filter.created_before;
    }
    
    if (Object.keys(timeQuery).length > 0) {
      query.timestamp = timeQuery;
    }
    
    logger.debug('Built query from filter', { filter, query });
    return query;
  }

  /**
   * 执行查询
   * 
   * @param query 查询条件
   * @returns Promise<ConfirmProtocol[]> 查询结果
   */
  private async executeQuery(query: any): Promise<ConfirmProtocol[]> {
    logger.debug('Executing query', { query });
    
    try {
      // 模拟查询延迟
      await new Promise(resolve => setTimeout(resolve, 15));
      
      // 模拟查询结果
      // 在实际实现中，这里应该是从数据库中查询数据
      const mockResults: ConfirmProtocol[] = [];
      
      // 生成一些模拟数据
      for (let i = 0; i < 5; i++) {
        const confirmId = this.generateUUID();
        mockResults.push({
          protocol_version: this.PROTOCOL_VERSION,
          timestamp: new Date().toISOString(),
          confirm_id: confirmId,
          context_id: 'context-' + confirmId.substring(0, 8),
          confirmation_type: 'plan_approval',
          status: i % 2 === 0 ? 'pending' : 'approved',
          priority: i % 3 === 0 ? 'high' : (i % 3 === 1 ? 'medium' : 'low'),
          subject: {
            title: `Confirmation ${i + 1}`,
            description: `This is a mock confirmation ${i + 1}`,
            impact_assessment: {
              scope: 'project',
              business_impact: 'medium',
              technical_impact: 'low'
            }
          }
        });
      }
      
      // 记录性能指标
      const queryDuration = Math.random() * 10 + 5; // 5-15ms范围内的随机值
      this.recordPerformanceMetric({
        operation: 'executeQuery',
        duration_ms: queryDuration,
        success: true,
        timestamp: new Date().toISOString()
      } as ConfirmPerformanceMetrics);
      
      return mockResults;
      
    } catch (error) {
      logger.error('Error executing query', {
        query,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // 记录错误性能指标
      this.recordPerformanceMetric({
        operation: 'executeQuery',
        duration_ms: Math.random() * 5 + 15, // 15-20ms范围内的随机值
        success: false,
        error_code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      } as ConfirmPerformanceMetrics);
      
      throw error;
    }
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 检查数据库健康状态
   */
  private async checkDatabaseHealth(): Promise<'pass' | 'fail'> {
    try {
      // 模拟数据库健康检查
      // 在实际实现中，这里应该是执行一个简单的数据库查询来验证连接
      await new Promise(resolve => setTimeout(resolve, 5));
      
      // 模拟95%的成功率
      const isHealthy = Math.random() > 0.05;
      
      if (isHealthy) {
        logger.debug('Database health check passed');
    return 'pass';
      } else {
        logger.warn('Database health check failed');
        return 'fail';
      }
    } catch (error) {
      logger.error('Database health check error', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 'fail';
    }
  }

  /**
   * 检查通知服务健康状态
   */
  private async checkNotificationHealth(): Promise<'pass' | 'fail'> {
    try {
      // 模拟通知服务健康检查
      // 在实际实现中，这里应该是执行一个简单的通知服务调用来验证连接
      await new Promise(resolve => setTimeout(resolve, 3));
      
      // 模拟98%的成功率
      const isHealthy = Math.random() > 0.02;
      
      if (isHealthy) {
        logger.debug('Notification service health check passed');
    return 'pass';
      } else {
        logger.warn('Notification service health check failed');
        return 'fail';
      }
    } catch (error) {
      logger.error('Notification service health check error', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 'fail';
    }
  }

  /**
   * 检查工作流服务健康状态
   */
  private async checkWorkflowHealth(): Promise<'pass' | 'fail'> {
    try {
      // 模拟工作流服务健康检查
      // 在实际实现中，这里应该是执行一个简单的工作流服务调用来验证连接
      await new Promise(resolve => setTimeout(resolve, 4));
      
      // 模拟97%的成功率
      const isHealthy = Math.random() > 0.03;
      
      if (isHealthy) {
        logger.debug('Workflow service health check passed');
    return 'pass';
      } else {
        logger.warn('Workflow service health check failed');
        return 'fail';
      }
    } catch (error) {
      logger.error('Workflow service health check error', {
        error: error instanceof Error ? error.message : String(error)
      });
      return 'fail';
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(metric: ConfirmPerformanceMetrics): void {
    logger.info('Performance metric recorded', metric);
    // TODO: 发送到监控系统
  }

  /**
   * 根据ID获取确认对象
   * 
   * @param confirmId 确认ID
   * @returns Promise<ConfirmProtocol | null> 确认对象或null
   */
  private async getConfirmationById(confirmId: UUID): Promise<ConfirmProtocol | null> {
    logger.debug('Getting confirmation by ID', { confirmId });
    
    try {
      // 模拟数据库查询延迟
      await new Promise(resolve => setTimeout(resolve, 5));
      
      // 模拟数据库查询
      // 在实际实现中，这里应该是从数据库中查询数据
      // 为了演示，我们返回一个模拟对象
      if (confirmId && confirmId.length > 0) {
        const mockConfirmation: ConfirmProtocol = {
          protocol_version: this.PROTOCOL_VERSION,
          timestamp: new Date().toISOString(),
          confirm_id: confirmId,
          context_id: 'context-' + confirmId.substring(0, 8),
          confirmation_type: 'plan_approval',
          status: 'pending',
          priority: 'medium',
          approval_workflow: {
            workflow_type: 'sequential',
            steps: [
              {
                step_id: 'step-1-' + confirmId.substring(0, 4),
                step_order: 1,
                approver: {
                  user_id: 'user-approver-1',
                  role: 'manager',
                  is_required: true
                },
                status: 'pending'
              },
              {
                step_id: 'step-2-' + confirmId.substring(0, 4),
                step_order: 2,
                approver: {
                  user_id: 'user-approver-2',
                  role: 'director',
                  is_required: true
                },
                status: 'pending'
              }
            ]
          },
          subject: {
            title: 'Approval request for plan ' + confirmId.substring(0, 6),
            description: 'This is a request for approval of the plan.',
            impact_assessment: {
              scope: 'project',
              business_impact: 'medium',
              technical_impact: 'low'
            }
          }
        };
        
        return mockConfirmation;
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting confirmation by ID', { 
        confirmId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * 保存确认对象
   * 
   * @param confirmation 确认对象
   * @returns Promise<void>
   */
  private async saveConfirmation(confirmation: ConfirmProtocol): Promise<void> {
    logger.debug('Saving confirmation', { confirmId: confirmation.confirm_id });
    
    try {
      // 模拟数据库保存延迟
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // 模拟数据库保存操作
      // 在实际实现中，这里应该是保存到数据库
      logger.info('Confirmation saved successfully', {
        confirmId: confirmation.confirm_id,
        type: confirmation.confirmation_type,
        status: confirmation.status,
        timestamp: new Date().toISOString()
      });
      
      // 模拟性能指标收集
      const saveDuration = Math.random() * 8 + 2; // 2-10ms范围内的随机值
      this.recordPerformanceMetric({
        operation: 'saveConfirmation',
        duration_ms: saveDuration,
        success: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Error saving confirmation', {
        confirmId: confirmation.confirm_id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // 记录错误性能指标
      this.recordPerformanceMetric({
        operation: 'saveConfirmation',
        duration_ms: Math.random() * 5 + 15, // 15-20ms范围内的随机值（错误情况下可能更慢）
        success: false,
        error_code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }
} 
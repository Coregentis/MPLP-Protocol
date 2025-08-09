/**
 * Core协调器服务
 * @description MPLP Core协议的核心实现，负责协调所有9个协议模块的执行
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../../../../public/utils/logger';
import { EventBus } from '../../../../core/event-bus';
import { WorkflowManager } from '../../../../core/workflow/workflow-manager';
import { WorkflowExecution } from '../../domain/entities/workflow-execution.entity';
import { IWorkflowExecutionRepository } from '../../domain/repositories/workflow-execution.repository.interface';
import {
  ICoreOrchestrator,
  CoreOrchestratorConfig,
  WorkflowConfig,
  ExecutionContext,
  WorkflowExecutionResult,
  OperationResult,
  ExecutionStatus,
  WorkflowStage,
  StageStatus,
  IModuleAdapter,
  EventType,
  UUID,
  WorkflowStatus,
  ExecutionMode,
  Priority
} from '../../types';

/**
 * Core协调器服务实现
 */
export class CoreOrchestratorService implements ICoreOrchestrator {
  private logger: Logger;
  private eventBus: EventBus;
  private workflowManager: WorkflowManager;
  private repository: IWorkflowExecutionRepository;
  private config: CoreOrchestratorConfig;
  private moduleAdapters: Map<WorkflowStage, IModuleAdapter> = new Map();
  private eventListeners: Map<EventType, Set<(event: any) => void>> = new Map();
  private activeExecutions: Map<UUID, WorkflowExecution> = new Map();

  constructor(
    repository: IWorkflowExecutionRepository,
    config: CoreOrchestratorConfig = {},
    eventBus?: EventBus,
    workflowManager?: WorkflowManager
  ) {
    this.repository = repository;
    this.config = {
      module_timeout_ms: 30000,
      max_concurrent_executions: 50,
      enable_metrics: true,
      enable_events: true,
      ...config
    };
    
    this.logger = new Logger('CoreOrchestrator');
    this.eventBus = eventBus || new EventBus();
    this.workflowManager = workflowManager || new WorkflowManager({
      maxConcurrentWorkflows: this.config.max_concurrent_executions || 50,
      defaultTimeout: this.config.module_timeout_ms || 30000,
      enableRetry: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableMetrics: this.config.enable_metrics || true
    });

    this.initializeEventHandlers();
  }

  /**
   * 初始化事件处理器
   */
  private initializeEventHandlers(): void {
    if (!this.config.enable_events) return;

    // 注意：WorkflowManager的事件处理将在未来版本中实现
    // 目前直接在CoreOrchestrator中处理事件
    this.logger.debug('事件处理器已初始化');
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(
    contextId: string, 
    config?: Partial<WorkflowConfig>
  ): Promise<OperationResult<WorkflowExecutionResult>> {
    try {
      // 1. 生成工作流ID
      const workflowId = this.generateWorkflowId();
      const orchestratorId = this.generateOrchestratorId();

      // 2. 合并配置
      const workflowConfig: WorkflowConfig = {
        name: `Workflow-${workflowId}`,
        stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM, WorkflowStage.TRACE],
        execution_mode: ExecutionMode.SEQUENTIAL,
        timeoutMs: this.config.module_timeout_ms,
        max_concurrent_executions: this.config.max_concurrent_executions,
        ...this.config.default_workflow,
        ...config
      };

      // 3. 创建执行上下文
      const executionContext: ExecutionContext = {
        sessionId: contextId,
        request_id: workflowId,
        priority: Priority.MEDIUM,
        metadata: {
          created_by: 'core-orchestrator',
          context_id: contextId
        }
      };

      // 4. 创建工作流执行实体
      const execution = new WorkflowExecution(
        workflowId,
        orchestratorId,
        workflowConfig,
        executionContext
      );

      // 5. 验证配置
      if (!execution.validateConfig()) {
        return {
          success: false,
          error: 'Invalid workflow configuration'
        };
      }

      // 6. 检查并发限制
      if (this.activeExecutions.size >= (this.config.max_concurrent_executions || 50)) {
        return {
          success: false,
          error: 'Maximum concurrent executions reached'
        };
      }

      // 7. 保存到存储
      await this.repository.save(execution);

      // 8. 添加到活跃执行列表
      this.activeExecutions.set(workflowId, execution);

      // 9. 发出创建事件
      this.emitEvent(EventType.WORKFLOW_CREATED, {
        workflow_id: workflowId,
        config: workflowConfig
      });

      // 10. 开始执行
      const result = await this.executeWorkflowStages(execution);

      // 11. 从活跃列表中移除
      this.activeExecutions.delete(workflowId);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      this.logger.error('工作流执行失败', {
        contextId,
        config,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow execution failed'
      };
    }
  }

  /**
   * 执行工作流阶段
   */
  private async executeWorkflowStages(execution: WorkflowExecution): Promise<WorkflowExecutionResult> {
    const workflowId = execution.workflow_id;
    const config = execution.workflow_config;

    try {
      // 开始执行
      execution.start();
      await this.repository.update(execution);

      this.emitEvent(EventType.WORKFLOW_STARTED, {
        workflow_id: workflowId
      });

      // 根据执行模式执行阶段
      if (config.execution_mode === ExecutionMode.PARALLEL) {
        await this.executeStagesInParallel(execution);
      } else {
        await this.executeStagesSequentially(execution);
      }

      // 完成执行
      execution.complete();
      await this.repository.update(execution);

      this.emitEvent(EventType.WORKFLOW_COMPLETED, {
        workflow_id: workflowId
      });

      return this.buildExecutionResult(execution);

    } catch (error) {
      // 标记失败
      execution.fail({
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      await this.repository.update(execution);

      this.emitEvent(EventType.WORKFLOW_FAILED, {
        workflow_id: workflowId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * 顺序执行阶段
   */
  private async executeStagesSequentially(execution: WorkflowExecution): Promise<void> {
    const stages = execution.workflow_config.stages;

    for (const stage of stages) {
      await this.executeStage(execution, stage);
    }
  }

  /**
   * 并行执行阶段
   */
  private async executeStagesInParallel(execution: WorkflowExecution): Promise<void> {
    const stages = execution.workflow_config.stages;
    const promises = stages.map(stage => this.executeStage(execution, stage));
    
    await Promise.all(promises);
  }

  /**
   * 执行单个阶段
   */
  private async executeStage(execution: WorkflowExecution, stage: WorkflowStage): Promise<void> {
    const workflowId = execution.workflow_id;

    try {
      // 开始阶段
      execution.startStage(stage);
      await this.repository.update(execution);

      this.emitEvent(EventType.STAGE_STARTED, {
        workflow_id: workflowId,
        stage
      });

      // 获取模块适配器
      const adapter = this.moduleAdapters.get(stage);
      if (!adapter) {
        throw new Error(`No adapter registered for stage: ${stage}`);
      }

      // 准备输入数据
      const input = this.prepareStageInput(execution, stage);

      // 执行阶段
      const result = await adapter.execute(input);

      if (!result.success) {
        throw new Error(result.error || `Stage ${stage} execution failed`);
      }

      // 完成阶段
      execution.completeStage(stage, result.data as Record<string, unknown>);
      await this.repository.update(execution);

      this.emitEvent(EventType.STAGE_COMPLETED, {
        workflow_id: workflowId,
        stage,
        result: result.data
      });

    } catch (error) {
      // 阶段失败
      execution.failStage(stage, {
        code: 'STAGE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      await this.repository.update(execution);

      this.emitEvent(EventType.STAGE_FAILED, {
        workflow_id: workflowId,
        stage,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * 准备阶段输入数据
   */
  private prepareStageInput(execution: WorkflowExecution, stage: WorkflowStage): Record<string, any> {
    const context = execution.execution_context;
    const stageResults = execution.execution_status.stage_results || {};

    // 基础输入
    const input: Record<string, any> = {
      workflow_id: execution.workflow_id,
      stage,
      context,
      previous_results: stageResults
    };

    // 根据阶段类型添加特定输入
    switch (stage) {
      case WorkflowStage.CONTEXT:
        input.sessionId = context.sessionId;
        break;
      case WorkflowStage.PLAN:
        input.contextId = context.sessionId;
        input.context_result = stageResults[WorkflowStage.CONTEXT]?.result;
        break;
      case WorkflowStage.CONFIRM:
        input.planId = stageResults[WorkflowStage.PLAN]?.result?.plan_id;
        break;
      case WorkflowStage.TRACE:
        input.confirmId = stageResults[WorkflowStage.CONFIRM]?.result?.confirm_id;
        break;
    }

    return input;
  }

  /**
   * 构建执行结果
   */
  private buildExecutionResult(execution: WorkflowExecution): WorkflowExecutionResult {
    const status = execution.execution_status;
    
    return {
      workflowId: execution.workflow_id,
      status: status.status,
      start_time: status.start_time!,
      end_time: status.end_time,
      duration_ms: status.duration_ms,
      completed_stages: status.completed_stages || [],
      stage_results: status.stage_results || {},
      context: execution.execution_context
    };
  }

  /**
   * 获取活跃执行
   */
  async getActiveExecutions(): Promise<string[]> {
    return Array.from(this.activeExecutions.keys());
  }

  /**
   * 获取执行状态
   */
  async getExecutionStatus(workflowId: string): Promise<OperationResult<ExecutionStatus>> {
    try {
      const execution = await this.repository.findById(workflowId);
      if (!execution) {
        return {
          success: false,
          error: 'Workflow not found'
        };
      }

      return {
        success: true,
        data: execution.executionStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get execution status'
      };
    }
  }

  /**
   * 获取模块状态
   */
  async getModuleStatuses(): Promise<Record<string, StageStatus>> {
    const statuses: Record<string, StageStatus> = {};

    for (const [stage, adapter] of this.moduleAdapters) {
      try {
        statuses[stage] = await adapter.getStatus();
      } catch (error) {
        statuses[stage] = StageStatus.FAILED;
      }
    }

    return statuses;
  }

  /**
   * 注册模块适配器
   */
  async registerModuleAdapter(stage: WorkflowStage, adapter: IModuleAdapter): Promise<void> {
    this.moduleAdapters.set(stage, adapter);
    this.logger.info(`模块适配器已注册: ${stage}`, {
      metadata: adapter.getMetadata()
    });

    this.emitEvent(EventType.MODULE_CONNECTED, {
      stage,
      metadata: adapter.getMetadata()
    });
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType: EventType, handler: (event: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(handler);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventType: EventType, handler: (event: any) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(handler);
    }
  }

  /**
   * 暂停工作流
   */
  async pauseWorkflow(workflowId: string): Promise<OperationResult<boolean>> {
    try {
      const execution = this.activeExecutions.get(workflowId);
      if (!execution) {
        return {
          success: false,
          error: 'Workflow not found or not active'
        };
      }

      execution.pause();
      await this.repository.update(execution);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pause workflow'
      };
    }
  }

  /**
   * 恢复工作流
   */
  async resumeWorkflow(workflowId: string): Promise<OperationResult<boolean>> {
    try {
      const execution = this.activeExecutions.get(workflowId);
      if (!execution) {
        return {
          success: false,
          error: 'Workflow not found or not active'
        };
      }

      execution.resume();
      await this.repository.update(execution);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resume workflow'
      };
    }
  }

  /**
   * 取消工作流
   */
  async cancelWorkflow(workflowId: string): Promise<OperationResult<boolean>> {
    try {
      const execution = this.activeExecutions.get(workflowId);
      if (!execution) {
        return {
          success: false,
          error: 'Workflow not found or not active'
        };
      }

      execution.cancel();
      await this.repository.update(execution);
      this.activeExecutions.delete(workflowId);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel workflow'
      };
    }
  }

  /**
   * 发出事件
   */
  private emitEvent(eventType: EventType, data: any): void {
    if (!this.config.enable_events) return;

    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    };

    // 发送到事件总线
    this.eventBus.publish(eventType, event);

    // 通知本地监听器
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          this.logger.error('事件处理器错误', {
            eventType,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }
  }

  /**
   * 生成工作流ID
   */
  private generateWorkflowId(): UUID {
    return `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成协调器ID
   */
  private generateOrchestratorId(): UUID {
    return `orch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

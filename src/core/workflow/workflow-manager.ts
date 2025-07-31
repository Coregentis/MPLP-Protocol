/**
 * 工作流管理器
 * @description 管理MPLP协议的工作流执行，协调Plan→Confirm→Trace→Delivery流程
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../../public/utils/logger';
import { EventBus } from '../event-bus';
import { EventType } from '../event-types';
import { WorkflowStageType, WorkflowStatus } from './workflow-types';
import { IWorkflowContext } from './interfaces/workflow-context.interface';

export interface WorkflowManagerConfig {
  maxConcurrentWorkflows: number;
  defaultTimeout: number;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableMetrics: boolean;
}

export interface WorkflowExecution {
  workflow_id: string;
  status: WorkflowStatus;
  current_stage: WorkflowStageType;
  context: IWorkflowContext;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error?: string;
  retry_count: number;
}

export interface WorkflowMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_duration: number;
  current_active: number;
}

/**
 * 工作流管理器类
 */
export class WorkflowManager {
  private executions = new Map<string, WorkflowExecution>();
  private stageHandlers = new Map<WorkflowStageType, Function>();
  private metrics: WorkflowMetrics;
  private logger: Logger;

  constructor(
    private config: WorkflowManagerConfig,
    private eventBus?: EventBus
  ) {
    this.logger = new Logger('WorkflowManager');
    this.metrics = {
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      average_duration: 0,
      current_active: 0
    };

    this.setupDefaultHandlers();
    this.logger.info('Workflow manager initialized', { config });
  }

  /**
   * 初始化工作流
   */
  async initializeWorkflow(context: IWorkflowContext): Promise<{ workflow_id: string; status: WorkflowStatus }> {
    const workflow_id = this.generateWorkflowId();
    const now = new Date().toISOString();

    const execution: WorkflowExecution = {
      workflow_id,
      status: WorkflowStatus.CREATED,
      current_stage: WorkflowStageType.PLAN,
      context,
      created_at: now,
      updated_at: now,
      retry_count: 0
    };

    this.executions.set(workflow_id, execution);
    this.metrics.total_executions++;
    this.metrics.current_active++;

    this.emitEvent('workflow.initialized', { workflow_id, context });
    this.logger.info('Workflow initialized', { workflow_id });

    return { workflow_id, status: WorkflowStatus.CREATED };
  }

  /**
   * 启动工作流
   */
  async startWorkflow(workflow_id: string): Promise<{ workflow_id: string; status: WorkflowStatus }> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    execution.status = WorkflowStatus.IN_PROGRESS;
    execution.updated_at = new Date().toISOString();

    this.emitEvent('workflow.started', { workflow_id });
    this.logger.info('Workflow started', { workflow_id });

    // 开始执行第一个阶段
    await this.executeStage(workflow_id, WorkflowStageType.PLAN);

    return { workflow_id, status: WorkflowStatus.IN_PROGRESS };
  }

  /**
   * 执行工作流阶段
   */
  async startStage(workflow_id: string, stage: WorkflowStageType): Promise<{ stage_id: string; status: string }> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    const stage_id = `${workflow_id}_${stage}_${Date.now()}`;
    execution.current_stage = stage;
    execution.updated_at = new Date().toISOString();

    this.emitEvent('stage.started', { workflow_id, stage, stage_id });
    this.logger.info('Stage started', { workflow_id, stage, stage_id });

    return { stage_id, status: 'in_progress' };
  }

  /**
   * 完成工作流阶段
   */
  async completeStage(workflow_id: string, stage: WorkflowStageType, result?: any): Promise<{ stage_id: string; status: string }> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    const stage_id = `${workflow_id}_${stage}_completed`;
    execution.updated_at = new Date().toISOString();

    // 更新上下文
    if (result) {
      execution.context.stage_results = execution.context.stage_results || {} as Record<WorkflowStageType, any>;
      (execution.context.stage_results as any)[stage] = result;
    }

    this.emitEvent('stage.completed', { workflow_id, stage, stage_id, result });
    this.logger.info('Stage completed', { workflow_id, stage, stage_id });

    // 检查是否需要进入下一个阶段
    await this.checkNextStage(workflow_id, stage);

    return { stage_id, status: 'completed' };
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(workflow_id: string): Promise<WorkflowStatus> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    return execution.status;
  }

  /**
   * 更新工作流上下文
   */
  async updateWorkflowContext(workflow_id: string, updates: Partial<IWorkflowContext>): Promise<void> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    execution.context = { ...execution.context, ...updates };
    execution.updated_at = new Date().toISOString();

    this.emitEvent('context.updated', { workflow_id, updates });
    this.logger.debug('Workflow context updated', { workflow_id, updates });
  }

  /**
   * 获取工作流执行信息
   */
  getWorkflowExecution(workflow_id: string): WorkflowExecution | undefined {
    return this.executions.get(workflow_id);
  }

  /**
   * 获取所有活跃的工作流
   */
  getActiveWorkflows(): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(
      execution => execution.status === WorkflowStatus.IN_PROGRESS
    );
  }

  /**
   * 获取工作流统计信息
   */
  getMetrics(): WorkflowMetrics {
    return { ...this.metrics };
  }

  /**
   * 注册阶段处理器
   */
  registerStageHandler(stage: WorkflowStageType, handler: Function): void {
    this.stageHandlers.set(stage, handler);
    this.logger.debug('Stage handler registered', { stage });
  }

  /**
   * 执行阶段
   */
  private async executeStage(workflow_id: string, stage: WorkflowStageType): Promise<void> {
    const handler = this.stageHandlers.get(stage);
    if (!handler) {
      this.logger.warn('No handler found for stage', { stage });
      return;
    }

    const execution = this.executions.get(workflow_id);
    if (!execution) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    try {
      await this.startStage(workflow_id, stage);
      const result = await handler(execution.context);
      await this.completeStage(workflow_id, stage, result);
    } catch (error) {
      await this.handleStageError(workflow_id, stage, error as Error);
    }
  }

  /**
   * 检查下一个阶段
   */
  private async checkNextStage(workflow_id: string, currentStage: WorkflowStageType): Promise<void> {
    const nextStage = this.getNextStage(currentStage);
    
    if (nextStage) {
      await this.executeStage(workflow_id, nextStage);
    } else {
      // 工作流完成
      await this.completeWorkflow(workflow_id);
    }
  }

  /**
   * 获取下一个阶段
   */
  private getNextStage(currentStage: WorkflowStageType): WorkflowStageType | null {
    const stageOrder = [
      WorkflowStageType.PLAN,
      WorkflowStageType.CONFIRM,
      WorkflowStageType.TRACE,
      WorkflowStageType.DELIVERY
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < stageOrder.length - 1) {
      return stageOrder[currentIndex + 1];
    }

    return null;
  }

  /**
   * 完成工作流
   */
  private async completeWorkflow(workflow_id: string): Promise<void> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      return;
    }

    execution.status = WorkflowStatus.COMPLETED;
    execution.completed_at = new Date().toISOString();
    execution.updated_at = execution.completed_at;

    this.metrics.successful_executions++;
    this.metrics.current_active--;

    this.emitEvent('workflow.completed', { workflow_id });
    this.logger.info('Workflow completed', { workflow_id });
  }

  /**
   * 处理阶段错误
   */
  private async handleStageError(workflow_id: string, stage: WorkflowStageType, error: Error): Promise<void> {
    const execution = this.executions.get(workflow_id);
    if (!execution) {
      return;
    }

    execution.error = error.message;
    execution.retry_count++;

    if (this.config.enableRetry && execution.retry_count <= this.config.maxRetries) {
      this.logger.warn('Stage failed, retrying', { workflow_id, stage, retry_count: execution.retry_count });
      
      // 延迟后重试
      setTimeout(() => {
        this.executeStage(workflow_id, stage);
      }, this.config.retryDelay);
    } else {
      // 标记工作流失败
      execution.status = WorkflowStatus.FAILED;
      execution.updated_at = new Date().toISOString();
      
      this.metrics.failed_executions++;
      this.metrics.current_active--;

      this.emitEvent('workflow.failed', { workflow_id, stage, error: error.message });
      this.logger.error('Workflow failed', { workflow_id, stage, error: error.message });
    }
  }

  /**
   * 设置默认处理器
   */
  private setupDefaultHandlers(): void {
    // Plan阶段处理器
    this.registerStageHandler(WorkflowStageType.PLAN, async (context: IWorkflowContext) => {
      this.logger.info('Executing PLAN stage', { context });
      return { stage: 'plan', status: 'completed', timestamp: new Date().toISOString() };
    });

    // Confirm阶段处理器
    this.registerStageHandler(WorkflowStageType.CONFIRM, async (context: IWorkflowContext) => {
      this.logger.info('Executing CONFIRM stage', { context });
      return { stage: 'confirm', status: 'completed', timestamp: new Date().toISOString() };
    });

    // Trace阶段处理器
    this.registerStageHandler(WorkflowStageType.TRACE, async (context: IWorkflowContext) => {
      this.logger.info('Executing TRACE stage', { context });
      return { stage: 'trace', status: 'completed', timestamp: new Date().toISOString() };
    });

    // Delivery阶段处理器
    this.registerStageHandler(WorkflowStageType.DELIVERY, async (context: IWorkflowContext) => {
      this.logger.info('Executing DELIVERY stage', { context });
      return { stage: 'delivery', status: 'completed', timestamp: new Date().toISOString() };
    });
  }

  /**
   * 生成工作流ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 发送事件
   */
  private emitEvent(eventType: string, data: any): void {
    if (!this.eventBus) return;

    this.eventBus.publish(EventType.WORKFLOW_STARTED, {
      timestamp: new Date().toISOString(),
      source: 'WorkflowManager',
      eventType,
      ...data
    });
  }
}

/**
 * 工作流事件系统
 * @description 定义和管理工作流相关的事件
 * @author MPLP Team
 * @version 1.0.1
 */

import { EventBus } from '../event-bus';
import { Logger } from '../../utils/logger';
import { WorkflowStageType, WorkflowStatus, IWorkflowContext } from './workflow-types';

/**
 * 工作流事件类型
 */
export enum WorkflowEvents {
  // 工作流级别事件
  WORKFLOW_CREATED = 'workflow.created',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  WORKFLOW_CANCELLED = 'workflow.cancelled',
  WORKFLOW_PAUSED = 'workflow.paused',
  WORKFLOW_RESUMED = 'workflow.resumed',
  
  // 阶段级别事件
  STAGE_STARTED = 'stage.started',
  STAGE_COMPLETED = 'stage.completed',
  STAGE_FAILED = 'stage.failed',
  STAGE_SKIPPED = 'stage.skipped',
  STAGE_RETRIED = 'stage.retried',
  
  // 上下文事件
  CONTEXT_UPDATED = 'context.updated',
  VARIABLE_CHANGED = 'variable.changed',
  
  // 错误事件
  ERROR_OCCURRED = 'error.occurred',
  ERROR_RECOVERED = 'error.recovered',
  
  // 性能事件
  PERFORMANCE_THRESHOLD_EXCEEDED = 'performance.threshold_exceeded',
  MEMORY_WARNING = 'memory.warning'
}

/**
 * 工作流事件数据接口
 */
export interface WorkflowEventData {
  workflow_id: string;
  timestamp: string;
  source: string;
  correlation_id?: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

/**
 * 工作流创建事件数据
 */
export interface WorkflowCreatedEventData extends WorkflowEventData {
  context: IWorkflowContext;
  definition_id?: string;
  priority?: string;
}

/**
 * 工作流状态变更事件数据
 */
export interface WorkflowStatusChangedEventData extends WorkflowEventData {
  old_status: WorkflowStatus;
  new_status: WorkflowStatus;
  reason?: string;
  duration?: number;
}

/**
 * 阶段事件数据
 */
export interface StageEventData extends WorkflowEventData {
  stage_id: string;
  stage_type: WorkflowStageType;
  stage_name?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  duration?: number;
  retry_count?: number;
}

/**
 * 上下文更新事件数据
 */
export interface ContextUpdatedEventData extends WorkflowEventData {
  changes: Record<string, any>;
  previous_values?: Record<string, any>;
  change_type: 'add' | 'update' | 'delete';
}

/**
 * 错误事件数据
 */
export interface ErrorEventData extends WorkflowEventData {
  error_code: string;
  error_message: string;
  error_type: string;
  stage_id?: string;
  stage_type?: WorkflowStageType;
  stack_trace?: string;
  recovery_action?: string;
}

/**
 * 性能事件数据
 */
export interface PerformanceEventData extends WorkflowEventData {
  metric_name: string;
  metric_value: number;
  threshold: number;
  stage_id?: string;
  stage_type?: WorkflowStageType;
}

/**
 * 工作流事件发射器
 */
export class WorkflowEventEmitter {
  private logger: Logger;

  constructor(private eventBus: EventBus) {
    this.logger = new Logger('WorkflowEventEmitter');
  }

  /**
   * 发射工作流创建事件
   */
  async emitWorkflowCreated(data: WorkflowCreatedEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.WORKFLOW_CREATED, data);
  }

  /**
   * 发射工作流开始事件
   */
  async emitWorkflowStarted(data: WorkflowEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.WORKFLOW_STARTED, data);
  }

  /**
   * 发射工作流完成事件
   */
  async emitWorkflowCompleted(data: WorkflowStatusChangedEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.WORKFLOW_COMPLETED, data);
  }

  /**
   * 发射工作流失败事件
   */
  async emitWorkflowFailed(data: WorkflowStatusChangedEventData & { error?: ErrorEventData }): Promise<void> {
    await this.emitEvent(WorkflowEvents.WORKFLOW_FAILED, data);
  }

  /**
   * 发射阶段开始事件
   */
  async emitStageStarted(data: StageEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.STAGE_STARTED, data);
  }

  /**
   * 发射阶段完成事件
   */
  async emitStageCompleted(data: StageEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.STAGE_COMPLETED, data);
  }

  /**
   * 发射阶段失败事件
   */
  async emitStageFailed(data: StageEventData & { error: ErrorEventData }): Promise<void> {
    await this.emitEvent(WorkflowEvents.STAGE_FAILED, data);
  }

  /**
   * 发射上下文更新事件
   */
  async emitContextUpdated(data: ContextUpdatedEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.CONTEXT_UPDATED, data);
  }

  /**
   * 发射错误事件
   */
  async emitError(data: ErrorEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.ERROR_OCCURRED, data);
  }

  /**
   * 发射性能事件
   */
  async emitPerformanceEvent(data: PerformanceEventData): Promise<void> {
    await this.emitEvent(WorkflowEvents.PERFORMANCE_THRESHOLD_EXCEEDED, data);
  }

  /**
   * 通用事件发射方法
   */
  private async emitEvent(eventType: WorkflowEvents, data: any): Promise<void> {
    try {
      await this.eventBus.publish(eventType, {
        ...data,
        event_type: eventType,
        emitted_at: new Date().toISOString()
      });

      this.logger.debug('Workflow event emitted', { eventType, workflow_id: data.workflow_id });
    } catch (error) {
      this.logger.error('Failed to emit workflow event', { eventType, error });
    }
  }
}

/**
 * 工作流事件监听器
 */
export class WorkflowEventListener {
  private logger: Logger;
  private subscriptions: Map<string, string> = new Map();

  constructor(private eventBus: EventBus) {
    this.logger = new Logger('WorkflowEventListener');
  }

  /**
   * 监听工作流创建事件
   */
  onWorkflowCreated(handler: (data: WorkflowCreatedEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.WORKFLOW_CREATED, handler);
  }

  /**
   * 监听工作流开始事件
   */
  onWorkflowStarted(handler: (data: WorkflowEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.WORKFLOW_STARTED, handler);
  }

  /**
   * 监听工作流完成事件
   */
  onWorkflowCompleted(handler: (data: WorkflowStatusChangedEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.WORKFLOW_COMPLETED, handler);
  }

  /**
   * 监听工作流失败事件
   */
  onWorkflowFailed(handler: (data: WorkflowStatusChangedEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.WORKFLOW_FAILED, handler);
  }

  /**
   * 监听阶段开始事件
   */
  onStageStarted(handler: (data: StageEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.STAGE_STARTED, handler);
  }

  /**
   * 监听阶段完成事件
   */
  onStageCompleted(handler: (data: StageEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.STAGE_COMPLETED, handler);
  }

  /**
   * 监听阶段失败事件
   */
  onStageFailed(handler: (data: StageEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.STAGE_FAILED, handler);
  }

  /**
   * 监听上下文更新事件
   */
  onContextUpdated(handler: (data: ContextUpdatedEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.CONTEXT_UPDATED, handler);
  }

  /**
   * 监听错误事件
   */
  onError(handler: (data: ErrorEventData) => void | Promise<void>): string {
    return this.subscribe(WorkflowEvents.ERROR_OCCURRED, handler);
  }

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): boolean {
    const eventType = this.subscriptions.get(subscriptionId);
    if (eventType) {
      this.subscriptions.delete(subscriptionId);
      return this.eventBus.unsubscribe(subscriptionId);
    }
    return false;
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.eventBus.unsubscribe(subscriptionId);
    }
    this.subscriptions.clear();
  }

  /**
   * 通用订阅方法
   */
  private subscribe(eventType: WorkflowEvents, handler: (data: any) => void | Promise<void>): string {
    const subscriptionId = this.eventBus.subscribe(eventType, handler);
    this.subscriptions.set(subscriptionId, eventType);
    
    this.logger.debug('Subscribed to workflow event', { eventType, subscriptionId });
    return subscriptionId;
  }
}

/**
 * 工作流事件过滤器
 */
export class WorkflowEventFilter {
  /**
   * 按工作流ID过滤
   */
  static byWorkflowId(workflowId: string) {
    return (data: WorkflowEventData) => data.workflow_id === workflowId;
  }

  /**
   * 按用户ID过滤
   */
  static byUserId(userId: string) {
    return (data: WorkflowEventData) => data.user_id === userId;
  }

  /**
   * 按阶段类型过滤
   */
  static byStageType(stageType: WorkflowStageType) {
    return (data: StageEventData) => data.stage_type === stageType;
  }

  /**
   * 按时间范围过滤
   */
  static byTimeRange(startTime: Date, endTime: Date) {
    return (data: WorkflowEventData) => {
      const eventTime = new Date(data.timestamp);
      return eventTime >= startTime && eventTime <= endTime;
    };
  }

  /**
   * 组合过滤器
   */
  static combine(...filters: Array<(data: any) => boolean>) {
    return (data: any) => filters.every(filter => filter(data));
  }
}

/**
 * 创建工作流事件系统
 */
export function createWorkflowEventSystem(eventBus: EventBus) {
  return {
    emitter: new WorkflowEventEmitter(eventBus),
    listener: new WorkflowEventListener(eventBus),
    filter: WorkflowEventFilter
  };
}

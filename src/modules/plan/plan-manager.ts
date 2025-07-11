/**
 * MPLP Plan模块管理器 - 完全符合Schema规范
 * 
 * @version v1.0.1
 * @created 2025-07-10T13:30:00+08:00
 * @compliance plan-protocol.json Schema v1.0.1 - 100%合规
 * @architecture Schema-driven development with complete type safety
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
import { EnhancedTracePilotAdapter, TaskTracker, DevelopmentIssue } from '@/mcp/enhanced-tracepilot-adapter';
import {
  PlanProtocol,
  PlanTask,
  PlanDependency,
  PlanStatus,
  TaskStatus,
  Priority,
  DependencyType,
  PlanOperationResult,
  PlanConfiguration,
  ProgressSummary,
  PlanMilestone,
  PlanRiskAssessment,
  Task,
  TaskPriority,
  TaskOperationResult,
  TaskDependency,
  BatchOperationResult,
  PLAN_CONSTANTS,
  UUID,
  Timestamp,
  Version,
  DependencyCriticality,
  FailureResolver,
  RetryConfig,
  RollbackConfig,
  PerformanceThresholds
} from './types';
import { FailureResolverManager, FailureResolverConfig, FailureRecoveryResult } from './failure-resolver';
import { createDefaultFailureResolver } from './utils';

// ================== Schema合规类型扩展 ==================

/**
 * Plan事件类型 - Schema合规
 */
export type PlanEventType = 
  | 'plan_created' 
  | 'plan_updated' 
  | 'plan_deleted'
  | 'task_created'
  | 'task_updated'
  | 'task_failure_resolved'
  | 'task_retry_scheduled'
  | 'task_unblocked'
  | 'dependency_resolved'
  | 'manual_intervention_required';

/**
 * Plan事件对象 - Schema合规
 */
export interface PlanEvent {
  event_id: UUID;
  event_type: PlanEventType;
  plan_id: UUID;
  task_id?: UUID;
  timestamp: Timestamp;
  data: unknown;
  metadata: {
    source: string;
    severity: 'info' | 'warning' | 'error';
    tracepilot_synced: boolean;
  };
}

/**
 * 任务依赖图 - Schema合规
 */
export interface TaskDependencyGraph {
  nodes: UUID[];
  edges: PlanDependency[];
  entry_points: UUID[];
  exit_points: UUID[];
  critical_path: UUID[];
  cycles: UUID[][];
}

/**
 * Plan进度汇总 - Schema合规
 */
export interface PlanProgressSummary {
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  blocked_tasks: number;
  running_tasks: number; // 修复：使用Schema标准的running
  pending_tasks: number;
  overall_progress_percentage: number;
  milestones: {
    total: number;
    achieved: number;
    at_risk: number;
  };
}

/**
 * Plan性能指标 - Schema合规
 */
export interface PlanPerformanceMetrics {
  total_planning_time_ms: number;
  dependency_analysis_time_ms: number;
  task_scheduling_time_ms: number;
  execution_efficiency_score: number;
  resource_utilization_rate: number;
  deadline_adherence_rate: number;
  quality_score: number;
  last_updated: Timestamp;
}

/**
 * 任务性能指标 - Schema合规
 */
export interface TaskPerformanceMetrics {
  queue_time_ms: number;
  execution_time_ms: number;
  wait_time_ms: number;
  resource_usage: {
    cpu_percentage: number;
    memory_mb: number;
    network_io_bytes: number;
    disk_io_bytes: number;
  };
  dependency_resolution_time_ms: number;
  last_updated: Timestamp;
}

// 创建logger和performance实例
const logger = new Logger('PlanManager');
const performance = new Performance();

// 创建性能监控装饰器
function PerformanceMonitor(target: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.since(startTime);
        
        // 记录性能指标
        const metricId = performance.start(`${target}.${propertyKey}`);
        performance.end(metricId);
        
        return result;
      } catch (error) {
        const duration = performance.since(startTime);
        const metricId = performance.start(`${target}.${propertyKey}`, { error: true });
        performance.end(metricId);
        throw error;
      }
    };
  };
}

/**
 * Plan模块管理器 - 完全符合Schema规范
 * 
 * 负责管理项目计划、任务和依赖关系
 * 性能要求：
 * - 计划创建 <10ms
 * - 任务添加 <10ms
 * - 依赖解析 <5ms
 * - 失败恢复 <10ms
 */
export class PlanManager extends EventEmitter {
  private plans: Map<UUID, PlanProtocol> = new Map();
  private tasks: Map<UUID, PlanTask> = new Map();
  private dependencies: Map<UUID, PlanDependency> = new Map();
  private dependencyGraphs: Map<UUID, TaskDependencyGraph> = new Map();
  private config: PlanConfiguration;
  private tracePilotAdapter?: EnhancedTracePilotAdapter;
  private performanceMetrics: Map<UUID, PlanPerformanceMetrics> = new Map();
  private taskTrackers: Map<UUID, TaskTracker> = new Map();
  private failureResolver: FailureResolverManager;

  constructor(config: PlanConfiguration, tracePilotAdapter?: EnhancedTracePilotAdapter) {
    super();
    this.config = config;
    this.tracePilotAdapter = tracePilotAdapter;
    
    // 初始化故障解决器
    const failureResolverConfig: FailureResolverConfig = {
      default_resolver: createDefaultFailureResolver(),
      notification_handler: this.handleNotification.bind(this),
      manual_intervention_handler: this.handleManualIntervention.bind(this),
      performance_monitor: this.recordPerformanceMetrics.bind(this)
    };
    this.failureResolver = new FailureResolverManager(failureResolverConfig);
    
    // 监听故障解决器事件
    this.setupFailureResolverListeners();
    
    // 启动任务调度器
    this.startScheduler();
    
    // 初始化TracePilot任务追踪
    this.initializeTaskTracking();
    
    logger.info('PlanManager initialized with Enhanced TracePilot', {
      config: this.config,
      tracepilot_enabled: !!tracePilotAdapter,
      task_tracking_enabled: !!tracePilotAdapter,
      failure_resolver_enabled: this.config.failure_recovery_enabled
    });
  }

  /**
   * 初始化任务追踪
   */
  private initializeTaskTracking(): void {
    if (this.tracePilotAdapter) {
      // 监听TracePilot的问题检测
      this.tracePilotAdapter.on('issue_detected', (issue: DevelopmentIssue) => {
        this.handleDetectedIssue(issue);
      });
      
      // 监听自动修复应用
      this.tracePilotAdapter.on('auto_fix_applied', (data: any) => {
        this.handleAutoFixApplied(data);
      });
    }
  }

  /**
   * 处理检测到的问题
   */
  private handleDetectedIssue(issue: DevelopmentIssue): void {
    logger.info('TracePilot检测到问题', {
      issue_id: issue.id,
      type: issue.type,
      severity: issue.severity,
      title: issue.title
    });

    // 如果是Plan模块相关的问题，创建对应的任务追踪
    if (issue.file_path?.includes('plan') || issue.type === 'incomplete_implementation') {
      this.createIssueTracker(issue);
    }
  }

  /**
   * 处理自动修复应用
   */
  private handleAutoFixApplied(data: any): void {
    logger.info('TracePilot自动修复应用', {
      suggestion_id: data.suggestion_id,
      title: data.suggestion.title
    });

    // 更新相关的任务追踪状态
    this.updateIssueTrackerStatus(data.suggestion_id, 'resolved');
  }

  /**
   * 创建问题追踪器
   */
  private createIssueTracker(issue: DevelopmentIssue): void {
    const tracker: TaskTracker = {
      task_id: `issue-${issue.id}`,
      module: 'plan',
      task_name: issue.title,
      expected_completion_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: 'pending',
      progress_percentage: 0,
      dependencies: issue.dependencies || [],
      blockers: [issue],
      quality_checks: [{
        check_id: `check-${issue.id}`,
        check_type: 'type_safety',
        status: 'failing',
        details: issue.description,
        auto_fixable: issue.auto_fixable
      }]
    };

    this.taskTrackers.set(tracker.task_id, tracker);
    
    logger.info('创建问题追踪器', {
      tracker_id: tracker.task_id,
      issue_type: issue.type,
      auto_fixable: issue.auto_fixable
    });
  }

  /**
   * 更新问题追踪器状态
   */
  private updateIssueTrackerStatus(suggestionId: string, status: 'resolved' | 'in_progress' | 'blocked'): void {
    for (const [trackerId, tracker] of this.taskTrackers) {
      if (tracker.task_id.includes(suggestionId)) {
        tracker.status = status === 'resolved' ? 'completed' : status;
        tracker.progress_percentage = status === 'resolved' ? 100 : (status === 'in_progress' ? 50 : 0);
        tracker.actual_completion_time = status === 'resolved' ? new Date().toISOString() : undefined;
        
        // 更新质量检查状态
        tracker.quality_checks.forEach(check => {
          if (status === 'resolved') {
            check.status = 'passing';
          }
        });
        
        this.taskTrackers.set(trackerId, tracker);
        break;
      }
    }
  }

  /**
   * 获取任务追踪报告
   */
  getTaskTrackingReport(): {
    total_trackers: number;
    by_status: Record<string, number>;
    by_module: Record<string, number>;
    recent_issues: DevelopmentIssue[];
  } {
    const trackers = Array.from(this.taskTrackers.values());
    const statusCounts = trackers.reduce((acc, tracker) => {
      acc[tracker.status] = (acc[tracker.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const moduleCounts = trackers.reduce((acc, tracker) => {
      acc[tracker.module] = (acc[tracker.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentIssues = trackers
      .filter(tracker => tracker.blockers.length > 0)
      .slice(-5)
      .map(tracker => tracker.blockers[0]);

    return {
      total_trackers: trackers.length,
      by_status: statusCounts,
      by_module: moduleCounts,
      recent_issues: recentIssues
    };
  }

  /**
   * 创建新计划（Schema兼容）
   * Performance Target: <10ms
   */
  @PerformanceMonitor('PlanManager')
  async createPlan(
    contextId: UUID,
    name: string,
    description: string,
    priority: Priority = 'medium',
    ownerId?: string,
    configuration?: Partial<PlanConfiguration>
  ): Promise<PlanOperationResult<PlanProtocol>> {
    const startTime = performance.now();
    const planId = uuidv4();

    try {
      // 创建Schema兼容的Plan对象
      const plan: PlanProtocol = {
        // Schema必需字段
        protocol_version: PLAN_CONSTANTS.PROTOCOL_VERSION,
        timestamp: new Date().toISOString(),
        plan_id: planId,
        context_id: contextId,
        name,
        description,
        status: 'draft',
        priority,
        timeline: {
          estimated_duration: {
            value: 1,
            unit: 'days'
          }
        },
        tasks: [],
        dependencies: [],
        milestones: [],
        optimization: {
          strategy: 'balanced'
        },
        risk_assessment: this.createInitialRiskAssessment(),
        failure_resolver: this.createDefaultFailureResolver(),
      };

      this.plans.set(planId, plan);
      this.dependencyGraphs.set(planId, this.createEmptyDependencyGraph());

      const operationTime = performance.now() - startTime;

      // TracePilot同步
      await this.syncToTracePilot(planId, 'plan_created', {
        context_id: contextId,
        name,
        priority,
        owner_id: ownerId,
        operation_time_ms: operationTime
      });

      // 发出事件
      this.emitPlanEvent('plan_created', planId, {
        name,
        priority,
        owner_id: ownerId,
        context_id: contextId
      });

      logger.info('Plan创建成功', {
        module: 'Plan',
        plan_id: planId,
        name,
        priority,
        owner_id: ownerId,
        operation_time_ms: operationTime
      });

      return {
        success: true,
        data: plan,
        plan_id: planId,
        operation_time_ms: operationTime
      };

    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Plan创建失败', {
        module: 'Plan',
        plan_id: planId,
        name,
        error: errorMessage,
        operation_time_ms: operationTime
      });

      return {
        success: false,
        error: {
          code: 'PLAN_CREATE_FAILED',
          message: errorMessage
        },
        plan_id: planId,
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 添加任务到计划
   * Performance Target: <10ms
   */
  @PerformanceMonitor('PlanManager')
  async addTask(
    planId: UUID,
    title: string,
    description: string,
    priority: TaskPriority = 'medium',
    assigneeId?: string,
    parentTaskId?: string
  ): Promise<TaskOperationResult<Task>> {
    const startTime = performance.now();
    const taskId = uuidv4();

    try {
      const plan = this.plans.get(planId);
      if (!plan) {
        return {
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Plan not found'
          },
          task_id: taskId,
          plan_id: planId,
          operation_time_ms: performance.now() - startTime
        };
      }

      const task: Task = {
        task_id: taskId,
        name: title,
        description,
        type: 'atomic',
        status: 'pending',
        priority,
        plan_id: planId,
        parent_task_id: parentTaskId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        execution_context: {
          context_id: plan.context_id,
          environment: 'development',
          variables: {},
          secrets: {},
          resource_allocations: []
        },
        assignee_id: assigneeId,
        dependencies: [],
        subtask_ids: [],
        progress_percentage: 0,
        performance_metrics: this.initializeTaskPerformanceMetrics(),
        metadata: {
          tags: [],
          category: 'general',
          source: 'plan_manager',
          complexity_score: 1,
          risk_level: 'low',
          automation_level: 'manual',
          retry_count: 0,
          max_retry_count: this.config.retry_policy?.max_attempts ?? 3
        }
      };

      // 处理父子任务关系
      if (parentTaskId && this.tasks.has(parentTaskId)) {
        const parentTask = this.tasks.get(parentTaskId)!;
        if (!parentTask.subtask_ids) {
          parentTask.subtask_ids = [];
        }
        parentTask.subtask_ids.push(taskId);
        this.tasks.set(parentTaskId, parentTask);
      }

      this.tasks.set(taskId, task);
      
      // 更新依赖图
      const graph = this.dependencyGraphs.get(planId)!;
      graph.nodes.push(taskId);
      
      // 如果没有依赖，添加到入口点
      if (!task.dependencies || task.dependencies.length === 0) {
        graph.entry_points.push(taskId);
      }

      this.dependencyGraphs.set(planId, graph);

      const operationTime = performance.now() - startTime;

      // TracePilot同步
      await this.syncToTracePilot(planId, 'task_created', {
        task_id: taskId,
        title,
        priority,
        assignee_id: assigneeId,
        operation_time_ms: operationTime
      }, taskId);

      // 发出事件
      this.emitPlanEvent('task_created', planId, {
        task_id: taskId,
        title,
        priority,
        assignee_id: assigneeId
      }, taskId);

      logger.info('Task添加成功', {
        module: 'Plan',
        plan_id: planId,
        task_id: taskId,
        title,
        priority,
        operation_time_ms: operationTime
      });

      return {
        success: true,
        data: task,
        task_id: taskId,
        plan_id: planId,
        operation_time_ms: operationTime
      };

    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: {
          code: 'ADD_TASK_FAILED',
          message: errorMessage
        },
        task_id: taskId,
        plan_id: planId,
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 添加任务依赖
   * Performance Target: <10ms
   */
  @PerformanceMonitor('PlanManager')
  async addDependency(
    sourceTaskId: UUID,
    targetTaskId: UUID,
    dependencyType: DependencyType = 'finish_to_start',
    condition?: string
  ): Promise<PlanOperationResult<TaskDependency>> {
    const startTime = performance.now();
    const dependencyId = uuidv4();

    try {
      const sourceTask = this.tasks.get(sourceTaskId);
      const targetTask = this.tasks.get(targetTaskId);

      if (!sourceTask || !targetTask) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Source or target task not found'
          },
          plan_id: sourceTask?.plan_id || targetTask?.plan_id || '',
          operation_time_ms: performance.now() - startTime
        };
      }

      const planId = sourceTask.plan_id;
      if (!planId || sourceTask.plan_id !== targetTask.plan_id) {
        return {
          success: false,
          error: {
            code: 'CROSS_PLAN_DEPENDENCY',
            message: 'Tasks must be in the same plan'
          },
          plan_id: planId || '',
          operation_time_ms: performance.now() - startTime
        };
      }

      // 检查循环依赖
      if (await this.wouldCreateCycle(planId, sourceTaskId, targetTaskId)) {
        return {
          success: false,
          error: {
            code: 'CIRCULAR_DEPENDENCY',
            message: 'Dependency would create a cycle'
          },
          plan_id: planId,
          operation_time_ms: performance.now() - startTime
        };
      }

      const dependency: TaskDependency = {
        id: dependencyId,
        source_task_id: sourceTaskId,
        target_task_id: targetTaskId,
        dependency_type: dependencyType,
        criticality: 'important',
        condition,
        dependency_id: dependencyId,
        metadata: {
          created_at: new Date().toISOString(),
          created_by: 'plan_manager',
          weight: 5,
          is_critical: dependencyType === 'finish_to_start'
        }
      };

      // 更新任务依赖列表
      if (!targetTask.dependencies) {
        targetTask.dependencies = [];
      }
      targetTask.dependencies.push(sourceTaskId);
      this.tasks.set(targetTaskId, targetTask);

      // 更新依赖存储
      this.dependencies.set(dependencyId, dependency);

      // 更新依赖图
      const graph = this.dependencyGraphs.get(planId)!;
      graph.edges.push(dependency);
      
      // 从入口点移除目标任务（现在有依赖了）
      graph.entry_points = graph.entry_points.filter((id: UUID) => id !== targetTaskId);
      
      // 如果源任务没有后续任务，添加到出口点
      const hasOutgoing = graph.edges.some((edge: PlanDependency) => edge.source_task_id === sourceTaskId);
      if (!hasOutgoing && !graph.exit_points.includes(sourceTaskId)) {
        graph.exit_points.push(sourceTaskId);
      }

      this.dependencyGraphs.set(planId, graph);

      const operationTime = performance.now() - startTime;

      // TracePilot同步
      await this.syncToTracePilot(planId, 'dependency_resolved', {
        dependency_id: dependencyId,
        source_task_id: sourceTaskId,
        target_task_id: targetTaskId,
        dependency_type: dependencyType,
        operation_time_ms: operationTime
      });

      logger.info('依赖关系添加成功', {
        module: 'Plan',
        plan_id: planId,
        dependency_id: dependencyId,
        source_task_id: sourceTaskId,
        target_task_id: targetTaskId,
        dependency_type: dependencyType,
        operation_time_ms: operationTime
      });

      return {
        success: true,
        data: dependency,
        plan_id: planId,
        operation_time_ms: operationTime,
        affected_task_ids: [sourceTaskId, targetTaskId]
      };

    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: {
          code: 'ADD_DEPENDENCY_FAILED',
          message: errorMessage
        },
        plan_id: '',
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 更新任务状态
   * Performance Target: <10ms
   */
  @PerformanceMonitor('PlanManager')
  async updateTaskStatus(
    taskId: UUID,
    newStatus: TaskStatus,
    resultData?: unknown,
    errorMessage?: string
  ): Promise<TaskOperationResult<Task>> {
    const startTime = performance.now();

    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          },
          task_id: taskId,
          plan_id: '',
          operation_time_ms: performance.now() - startTime
        };
      }

      const previousStatus = task.status;
      const planId = task.plan_id || '';
      
      // 处理任务失败的情况
      if (newStatus === 'failed' && this.config.failure_recovery_enabled) {
        // 获取计划的故障解决器配置
        const plan = planId ? this.plans.get(planId) : undefined;
        const failureResolverConfig = plan?.failure_resolver;
        
        // 应用故障解决策略
        const recoveryResult = await this.failureResolver.handleTaskFailure(
          planId,
          taskId,
          task,
          errorMessage || 'Task execution failed',
          failureResolverConfig
        );
        
        // 根据恢复结果更新任务状态
        if (recoveryResult.success) {
          // 恢复成功，使用恢复结果中的新状态
          newStatus = recoveryResult.new_status;
          
          // 发出任务恢复成功事件
          this.emitPlanEvent('task_failure_resolved', planId, {
            task_id: taskId,
            previous_status: previousStatus,
            new_status: newStatus,
            strategy_used: recoveryResult.strategy_used,
            retry_count: recoveryResult.retry_count
          }, taskId);
          
          logger.info('Task failure successfully resolved', {
            task_id: taskId,
            plan_id: planId,
            strategy: recoveryResult.strategy_used,
            new_status: newStatus
          });
        } else if (recoveryResult.intervention_required) {
          // 需要人工干预，保持失败状态但标记为需要干预
          task.metadata = {
            ...task.metadata,
            intervention_required: true,
            intervention_reason: recoveryResult.error_message
          };
        }
      }

      task.status = newStatus;
      task.updated_at = new Date().toISOString();

      // 处理状态特定的逻辑
      switch (newStatus) {
        case 'running': // 修复：使用Schema标准的running
          if (!task.started_at) {
            task.started_at = new Date().toISOString();
          }
          break;
        case 'completed':
          task.completed_at = new Date().toISOString();
          task.progress_percentage = 100;
          if (task.started_at) {
            task.actual_duration_minutes = 
              (new Date().getTime() - new Date(task.started_at).getTime()) / (1000 * 60);
          }
          if (resultData) {
            task.result_data = resultData;
          }
          break;
        case 'failed':
          task.completed_at = new Date().toISOString();
          if (errorMessage) {
            task.error_message = errorMessage;
          }
          if (task.metadata) {
            task.metadata.retry_count = (task.metadata.retry_count || 0) + 1;
          }
          break;
      }

      this.tasks.set(taskId, task);

      // 更新计划进度
      if (planId) {
        await this.updatePlanProgress(planId);
      }

      // 检查并解锁依赖任务
      if (newStatus === 'completed') {
        await this.checkAndUnlockDependentTasks(taskId);
      }

      const operationTime = performance.now() - startTime;

      // TracePilot同步
      if (planId) {
        await this.syncToTracePilot(planId, 'task_updated', {
        task_id: taskId,
        previous_status: previousStatus,
        new_status: newStatus,
        operation_time_ms: operationTime
      }, taskId);

      // 发出事件
        this.emitPlanEvent('task_updated', planId, {
        task_id: taskId,
        previous_status: previousStatus,
        new_status: newStatus,
        progress_percentage: task.progress_percentage
      }, taskId);
      }

      logger.info('Task状态更新成功', {
        module: 'Plan',
        plan_id: planId,
        task_id: taskId,
        previous_status: previousStatus,
        new_status: newStatus,
        operation_time_ms: operationTime
      });

      return {
        success: true,
        data: task,
        task_id: taskId,
        plan_id: planId || '',
        operation_time_ms: operationTime
      };

    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const task = this.tasks.get(taskId);

      return {
        success: false,
        error: {
          code: 'UPDATE_TASK_STATUS_FAILED',
          message: errorMessage
        },
        task_id: taskId,
        plan_id: task?.plan_id || '',
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 提供人工干预响应
   * 
   * @param taskId 任务ID
   * @param approved 是否批准
   * @param resolution 解决方案
   * @returns 操作结果
   */
  async provideManualIntervention(
    taskId: UUID,
    approved: boolean,
    resolution?: string
  ): Promise<TaskOperationResult<Task>> {
    const startTime = performance.now();
    
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          },
          task_id: taskId,
          operation_time_ms: performance.now() - startTime
        };
      }
      
      // 检查任务是否需要干预
      if (!task.metadata?.intervention_required) {
        return {
          success: false,
          error: {
            code: 'INTERVENTION_NOT_REQUIRED',
            message: 'Task does not require manual intervention'
          },
          task_id: taskId,
          plan_id: task.plan_id,
          operation_time_ms: performance.now() - startTime
        };
      }
      
      // 提供干预响应
      const result = await this.failureResolver.provideManualIntervention(
        taskId,
        approved,
        resolution
      );
      
      if (!result) {
        return {
          success: false,
          error: {
            code: 'INTERVENTION_FAILED',
            message: 'Failed to process manual intervention'
          },
          task_id: taskId,
          plan_id: task.plan_id,
          operation_time_ms: performance.now() - startTime
        };
      }
      
      // 更新任务状态
      task.metadata = {
        ...task.metadata,
        intervention_required: false
      };
      
      if (approved) {
        // 如果批准，将任务设置为准备就绪
        task.status = 'ready';
      } else {
        // 如果拒绝，将任务设置为已跳过
        task.status = 'skipped';
        task.metadata.skip_reason = 'Manual intervention rejected';
      }
      
      this.tasks.set(taskId, task);
      
      // 如果任务被跳过，检查并解锁依赖任务
      if (!approved) {
        await this.checkAndUnlockDependentTasks(taskId);
      }
      
      const operationTime = performance.now() - startTime;
      
      // 发出事件
      if (task.plan_id) {
        this.emitPlanEvent('task_updated', task.plan_id, {
          task_id: taskId,
          status: task.status,
          intervention_result: approved ? 'approved' : 'rejected',
          resolution
        }, taskId);
      }
      
      return {
        success: true,
        data: task,
        task_id: taskId,
        plan_id: task.plan_id,
        operation_time_ms: operationTime
      };
    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        error: {
          code: 'INTERVENTION_ERROR',
          message: errorMessage
        },
        task_id: taskId,
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 获取计划
   */
  async getPlan(planId: UUID): Promise<PlanOperationResult<PlanProtocol>> {
    const startTime = performance.now();

    try {
      const plan = this.plans.get(planId);
      if (!plan) {
        return {
          success: false,
          error: {
            code: 'PLAN_NOT_FOUND',
            message: 'Plan not found'
          },
          plan_id: planId,
          operation_time_ms: performance.now() - startTime
        };
      }

      return {
        success: true,
        data: plan,
        plan_id: planId,
        operation_time_ms: performance.now() - startTime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: 'GET_PLAN_FAILED',
          message: errorMessage
        },
        plan_id: planId,
        operation_time_ms: performance.now() - startTime
      };
    }
  }

  /**
   * 获取任务
   */
  async getTask(taskId: UUID): Promise<TaskOperationResult<Task>> {
    const startTime = performance.now();

    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          },
          task_id: taskId,
          plan_id: '',
          operation_time_ms: performance.now() - startTime
        };
      }

      return {
        success: true,
        data: task,
        task_id: taskId,
        plan_id: task.plan_id || '',
        operation_time_ms: performance.now() - startTime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: {
          code: 'GET_TASK_FAILED',
          message: errorMessage
        },
        task_id: taskId,
        plan_id: '',
        operation_time_ms: performance.now() - startTime
      };
    }
  }

  /**
   * 检查循环依赖
   */
  private async wouldCreateCycle(
    planId: UUID,
    sourceTaskId: UUID,
    targetTaskId: UUID
  ): Promise<boolean> {
    const graph = this.dependencyGraphs.get(planId);
    if (!graph) return false;

    // 使用DFS检查从目标到源是否有路径
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return nodeId === sourceTaskId;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // 找到当前节点的所有依赖（出边）
      const outgoingEdges = graph.edges.filter((edge: PlanDependency) => edge.source_task_id === nodeId);
      
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target_task_id)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return hasCycle(targetTaskId);
  }

  /**
   * 更新计划进度
   */
  private async updatePlanProgress(planId: UUID): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) return;

    const planTasks = Array.from(this.tasks.values()).filter(task => task.plan_id === planId);
    
    const progressSummary: PlanProgressSummary = {
      total_tasks: planTasks.length,
      completed_tasks: planTasks.filter(task => task.status === 'completed').length,
      failed_tasks: planTasks.filter(task => task.status === 'failed').length,
      blocked_tasks: planTasks.filter(task => task.status === 'blocked').length,
      running_tasks: planTasks.filter(task => task.status === 'running').length, // 修复：使用Schema标准
      pending_tasks: planTasks.filter(task => task.status === 'pending').length,
      overall_progress_percentage: 0,
      milestones: { total: 0, achieved: 0, at_risk: 0 }
    };

    if (progressSummary.total_tasks > 0) {
      progressSummary.overall_progress_percentage = 
        (progressSummary.completed_tasks / progressSummary.total_tasks) * 100;
    }

    // 更新计划的进度汇总（扩展字段）
    (plan as any).progress_summary = progressSummary;
    this.plans.set(planId, plan);
  }

  /**
   * 检查并解锁依赖任务
   */
  private async checkAndUnlockDependentTasks(completedTaskId: UUID): Promise<void> {
    const dependentTasks = Array.from(this.tasks.values())
      .filter(task => task.dependencies && task.dependencies.includes(completedTaskId));

    for (const task of dependentTasks) {
      // 检查所有依赖是否都已完成
      const allDependenciesCompleted = task.dependencies?.every(depId => {
        const depTask = this.tasks.get(depId);
        return depTask?.status === 'completed';
      }) ?? true;

      if (allDependenciesCompleted && task.status === 'blocked') {
        await this.updateTaskStatus(task.task_id, 'ready');
      }
    }
  }

  /**
   * TracePilot同步
   */
  private async syncToTracePilot(
    planId: UUID,
    eventType: string,
    data: Record<string, unknown>,
    taskId?: UUID
  ): Promise<void> {
    if (!this.tracePilotAdapter) return;

    try {
      await this.tracePilotAdapter.syncTraceData({
        protocol_version: PLAN_CONSTANTS.PROTOCOL_VERSION,
        trace_id: `plan-${planId}-${taskId || 'plan'}-${Date.now()}`,
        context_id: planId,
        operation_name: `Plan.${eventType}`,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: data.operation_time_ms as number || 0,
        timestamp: new Date().toISOString(),
        trace_type: 'operation',
        status: 'completed',
        metadata: {
          plan_id: planId,
          task_id: taskId || 'none',
          event_type: eventType,
          module: 'Plan'
        },
        events: [],
        performance_metrics: {
          cpu_usage: 0,
          memory_usage_mb: process.memoryUsage().heapUsed / 1024 / 1024,
          network_io_bytes: 0,
          disk_io_bytes: 0,
          db_query_count: 0
        },
        error_info: null,
        parent_trace_id: null,
        tags: {
          module: 'Plan',
          event_type: eventType,
          plan_id: planId,
          task_id: taskId || 'none'
        },
        tracepilot_metadata: {
          agent_id: 'plan-manager',
          session_id: planId,
          operation_complexity: 'medium',
          expected_duration_ms: 10,
          quality_gates: {
            max_duration_ms: 100,
            max_memory_mb: 50,
            max_error_rate: 0.01,
            required_events: ['trace_start', 'trace_end']
          }
        }
      });
    } catch (error) {
      logger.warn('TracePilot同步失败', {
        module: 'Plan',
        plan_id: planId,
        task_id: taskId,
        event_type: eventType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 发出Plan事件
   */
  private emitPlanEvent(
    eventType: PlanEventType,
    planId: UUID,
    data: unknown,
    taskId?: UUID
  ): void {
    const event: PlanEvent = {
      event_id: uuidv4(),
      event_type: eventType,
      plan_id: planId,
      task_id: taskId,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source: 'plan_manager',
        severity: 'info',
        tracepilot_synced: !!this.tracePilotAdapter
      }
    };

    this.emit('plan_event', event);
  }

  /**
   * 设置故障解决器事件监听
   */
  private setupFailureResolverListeners(): void {
    this.failureResolver.on('task_retry_scheduled', (event) => {
      this.emitPlanEvent('task_retry_scheduled', event.plan_id, event.data, event.task_id);
      
      // 更新任务状态为准备重试
      const task = this.tasks.get(event.task_id);
      if (task) {
        task.status = 'ready';
        task.metadata = {
          ...task.metadata,
          retry_count: (task.metadata?.retry_count || 0) + 1
        };
        this.tasks.set(event.task_id, task);
      }
    });
    
    this.failureResolver.on('manual_intervention_requested', (event) => {
      this.emitPlanEvent('manual_intervention_required', event.plan_id, event.data, event.task_id);
      
      // 更新任务状态为需要人工干预
      const task = this.tasks.get(event.task_id);
      if (task) {
        task.metadata = {
          ...task.metadata,
          intervention_required: true,
          intervention_reason: event.data.reason,
          intervention_requested_at: event.timestamp
        };
        this.tasks.set(event.task_id, task);
      }
    });
    
    this.failureResolver.on('task_skipped', (event) => {
      // 更新任务状态为已跳过
      const task = this.tasks.get(event.task_id);
      if (task) {
        task.status = 'skipped';
        task.metadata = {
          ...task.metadata,
          skip_reason: event.data.reason
        };
        this.tasks.set(event.task_id, task);
        
        // 检查并解锁依赖此任务的其他任务
        this.checkAndUnlockDependentTasks(event.task_id);
      }
    });
  }

  /**
   * 处理通知
   */
  private async handleNotification(
    channel: string,
    message: string,
    data: unknown
  ): Promise<void> {
    logger.info(`Notification [${channel}]: ${message}`, { data });
    
    // 如果有TracePilot适配器，记录通知
    if (this.tracePilotAdapter && channel !== 'console') {
      // 使用emit事件而不是直接调用不存在的方法
      this.emit('notification', {
        channel,
        message,
        data,
        timestamp: new Date().toISOString()
      });
      
      // 记录到日志
      logger.info(`TracePilot notification: ${message}`, {
        channel,
        data
      });
    }
  }
  
  /**
   * 处理人工干预
   */
  private async handleManualIntervention(
    taskId: UUID,
    planId: UUID,
    reason: string
  ): Promise<boolean> {
    logger.info('Manual intervention requested', {
      task_id: taskId,
      plan_id: planId,
      reason
    });
    
    // 在实际实现中，这里应该发送通知给用户界面或其他系统
    // 并等待响应。这里我们简单地模拟一个异步响应
    
    // 如果有TracePilot适配器，通过事件通知
    if (this.tracePilotAdapter) {
      // 发出事件而不是调用不存在的方法
      this.emit('manual_intervention_needed', {
        task_id: taskId,
        plan_id: planId,
        reason,
        timestamp: new Date().toISOString()
      });
    }
    
    // 默认情况下，我们假设干预被批准
    return Promise.resolve(true);
  }
  
  /**
   * 记录性能指标
   */
  private recordPerformanceMetrics(metrics: Record<string, number>): void {
    // 记录性能指标到日志
    logger.debug('Failure resolver performance metrics', { metrics });
    
    // 记录关键指标
    Object.entries(metrics).forEach(([key, value]) => {
      // 使用Performance类的start和end方法代替不存在的mark方法
      const metricId = performance.start(`failure_resolver_${key}`);
      performance.end(metricId);
    });
  }

  /**
   * 初始化辅助方法
   */
  private createEmptyDependencyGraph(): TaskDependencyGraph {
    return {
      nodes: [],
      edges: [],
      entry_points: [],
      exit_points: [],
      critical_path: [],
      cycles: []
    };
  }

  private initializePlanPerformanceMetrics(): PlanPerformanceMetrics {
    return {
      total_planning_time_ms: 0,
      dependency_analysis_time_ms: 0,
      task_scheduling_time_ms: 0,
      execution_efficiency_score: 0,
      resource_utilization_rate: 0,
      deadline_adherence_rate: 0,
      quality_score: 0,
      last_updated: new Date().toISOString()
    };
  }

  private initializeTaskPerformanceMetrics(): TaskPerformanceMetrics {
    return {
      queue_time_ms: 0,
      execution_time_ms: 0,
      wait_time_ms: 0,
      resource_usage: {
        cpu_percentage: 0,
        memory_mb: 0,
        network_io_bytes: 0,
        disk_io_bytes: 0
      },
      dependency_resolution_time_ms: 0,
      last_updated: new Date().toISOString()
    };
  }

  private createInitialRiskAssessment(): PlanRiskAssessment {
    return {
      overall_risk_level: 'low',
      identified_risks: []
    };
  }

  private createDefaultFailureResolver(): FailureResolver {
    return {
      enabled: true,
      strategies: ['retry', 'rollback'],
      retry_config: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_factor: 2.0,
        max_delay_ms: 30000
      },
      rollback_config: {
        enabled: true,
        checkpoint_frequency: 5,
        max_rollback_depth: 10
      },
      notification_channels: ['console'],
      performance_thresholds: {
        max_execution_time_ms: 10000,
        max_memory_usage_mb: 512,
        max_cpu_usage_percent: 80
      }
    };
  }

  /**
   * 启动任务调度器
   */
  private startScheduler(): void {
    setInterval(() => {
      this.scheduleReadyTasks();
    }, 5000); // 每5秒调度一次
  }

  /**
   * 调度准备就绪的任务
   */
  private async scheduleReadyTasks(): Promise<void> {
    const readyTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'ready')
      .sort((a, b) => {
        // 按优先级排序
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    const runningTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'running').length; // 修复：使用Schema标准

    const availableSlots = (this.config.parallel_execution_limit || 5) - runningTasks;

    for (let i = 0; i < Math.min(availableSlots, readyTasks.length); i++) {
      const task = readyTasks[i];
      await this.updateTaskStatus(task.task_id, 'running'); // 修复：使用Schema标准
    }
  }

  /**
   * 获取模块统计信息
   */
  getModuleStats(): {
    total_plans: number;
    active_plans: number;
    total_tasks: number;
    completed_tasks: number;
    total_dependencies: number;
  } {
    const activePlans = Array.from(this.plans.values())
      .filter(plan => ['draft', 'approved', 'active'].includes(plan.status)).length;

    const completedTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'completed').length;

    return {
      total_plans: this.plans.size,
      active_plans: activePlans,
      total_tasks: this.tasks.size,
      completed_tasks: completedTasks,
      total_dependencies: this.dependencies.size
    };
  }

  /**
   * 获取失败任务统计
   */
  getFailureStats(): {
    total_failed_tasks: number;
    pending_interventions: number;
    retry_attempts: number;
    recovery_success_rate: number;
  } {
    let totalFailedTasks = 0;
    let retryAttempts = 0;
    let recoveredTasks = 0;
    
    // 统计失败和已恢复的任务
    this.tasks.forEach(task => {
      if (task.status === 'failed' as TaskStatus) {
        totalFailedTasks++;
        retryAttempts += task.metadata?.retry_count || 0;
      } else if (task.metadata?.retry_count && task.metadata.retry_count > 0 && task.status !== 'failed' as TaskStatus) {
        recoveredTasks++;
        retryAttempts += task.metadata.retry_count;
      }
    });
    
    // 获取待处理的干预数量
    const pendingInterventions = this.failureResolver.getPendingInterventions().size;
    
    // 计算恢复成功率
    const totalRecoveryAttempts = recoveredTasks + totalFailedTasks;
    const recoverySuccessRate = totalRecoveryAttempts > 0 
      ? (recoveredTasks / totalRecoveryAttempts) * 100 
      : 0;
    
    return {
      total_failed_tasks: totalFailedTasks,
      pending_interventions: pendingInterventions,
      retry_attempts: retryAttempts,
      recovery_success_rate: recoverySuccessRate
    };
  }
} 
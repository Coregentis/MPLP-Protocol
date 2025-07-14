/**
 * MPLP Plan模块管理器 - 完全符合Schema规范
 * 
 * @version v1.0.2
 * @created 2025-07-10T13:30:00+08:00
 * @compliance plan-protocol.json Schema v1.0.2 - 100%合规
 * @architecture Schema-driven development with complete type safety
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
// 移除厂商特定适配器，使用通用类型
interface TaskTracker {
  task_id: string;
  module: string;
  task_name: string;
  expected_completion_time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress_percentage: number;
  dependencies: string[];
  blockers: unknown[];
  quality_checks: unknown[];
}

interface DevelopmentIssue {
  id: string;
  type: string;
  severity: string;
  title: string;
  file_path?: string;
  dependencies?: string[];
}
import { MPLPTraceData } from '@/types/trace'; // Import MPLPTraceData from trace types
// 使用通用适配器接口，而非特定厂商实现
import { ITraceAdapter } from '@/interfaces/trace-adapter.interface';
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
  UUID,
  Timestamp,
  Version,
  DependencyCriticality,
  FailureResolver,
  RetryConfig,
  RollbackConfig,
  PerformanceThresholds,
  RecoveryStrategy,
  ProactiveFailurePrevention,
  SelfLearningRecovery
} from './types';
import { FailureResolverManager, FailureResolverConfig, FailureRecoveryResult } from './failure-resolver';
import { createDefaultFailureResolver } from './utils';

// 添加RoleManager接口，用于权限检查
interface IRoleManager {
  checkPermission(request: {
    user_id: string;
    resource: string;
    action: string;
    context_id?: string;
    resource_id?: string;
  }): Promise<{
    granted: boolean;
    reason?: string;
  }>;
}

// 添加ContextManager接口，用于上下文管理
interface IContextManager {
  getContext(contextId: string): Promise<{
    success: boolean;
    data?: {
      context_id: string;
      [key: string]: any;
    };
  }>;
}

/**
 * Plan模块常量
 */
const PLAN_CONSTANTS = {
  PROTOCOL_VERSION: '1.0.2',
  DEFAULT_TIMEOUT_MS: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BACKOFF_FACTOR: 2,
  DEFAULT_BATCH_SIZE: 10,
  DEFAULT_PARALLEL_LIMIT: 5
};

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
    external_synced: boolean;
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
        
        // 重新抛出错误
        throw error;
      }
    };
    return descriptor;
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
  private performanceMetrics: Map<UUID, PlanPerformanceMetrics> = new Map();
  private taskTrackers: Map<UUID, TaskTracker> = new Map();
  private failureResolver: FailureResolverManager;
  // 厂商中立的集成适配器
  private traceAdapter: ITraceAdapter | null = null;
  private traceService: any = null;
  // 批量追踪队列
  private traceBatchQueue: MPLPTraceData[] = [];
  private batchProcessingInterval: NodeJS.Timeout | null = null;
  // 批量同步限制
  private batchLimit: number = 100; // 例如，每批最多同步100条追踪数据
  
  // 添加角色管理器和上下文管理器引用
  private roleManager: IRoleManager | null = null;
  private contextManager: IContextManager | null = null;

  constructor(config: PlanConfiguration) {
    super();
    this.config = config;
    
    // 初始化故障解决器
    const failureResolverConfig: FailureResolverConfig = {
      default_resolver: {
        ...createDefaultFailureResolver(),
            // 通用故障同步配置
    vendor_integration: {
      enabled: true,
      sync_frequency_ms: 5000,
      data_retention_days: 30,
      sync_detailed_diagnostics: true,
      receive_suggestions: true,
      auto_apply_suggestions: false
    }
      },
      notification_handler: this.handleNotification.bind(this),
      manual_intervention_handler: this.handleManualIntervention.bind(this),
      performance_monitor: this.recordPerformanceMetrics.bind(this)
    };
    this.failureResolver = new FailureResolverManager(failureResolverConfig);
    
    // 监听故障解决器事件
    this.setupFailureResolverListeners();
    
    // 启动任务调度器
    this.startScheduler();
    
    logger.info('PlanManager initialized', {
      config: this.config,
      failure_resolver_enabled: this.config.failure_recovery_enabled
    });
  }

  /**
   * 设置追踪适配器
   */
  setTraceAdapter(adapter: ITraceAdapter): void {
    this.traceAdapter = adapter;
    
    // 记录适配器类型
    const adapterInfo = adapter.getAdapterInfo();
    
    logger.info('Trace adapter set for Plan module', { 
      adapter_type: adapterInfo.type,
      adapter_version: adapterInfo.version
    });

    // 检查适配器是否支持增强功能
    if (adapterInfo.type.includes('enhanced')) {
      logger.info('Enhanced failure tracking enabled for Plan module');
      
      // 更新故障解决器配置，启用AI诊断和自动恢复功能
      this.failureResolver = new FailureResolverManager({
        ...this.failureResolver['config'],
        performance_monitor: (metrics) => this.recordPerformanceMetrics(metrics),
        trace_adapter: adapter // 将追踪适配器传递给故障解决器
      });
      
      // 启用智能诊断功能
      this.enableIntelligentDiagnostics();
    }
  }

  /**
   * 获取当前适配器信息
   */
  getAdapterInfo(): { type: string; version: string } | null {
    if (!this.traceAdapter) {
      return null;
    }
    return this.traceAdapter.getAdapterInfo();
  }

  /**
   * 启用智能诊断功能
   */
  private enableIntelligentDiagnostics(): void {
    // 更新默认解析器配置
    const currentConfig = this.failureResolver['config'].default_resolver;
    
    // 启用智能诊断
    if (!currentConfig.intelligent_diagnostics) {
      currentConfig.intelligent_diagnostics = {
        enabled: true,
        min_confidence_score: 0.7,
        analysis_depth: 'detailed',
        pattern_recognition: true,
        historical_analysis: true,
        max_related_failures: 5
      };
    } else {
      currentConfig.intelligent_diagnostics.enabled = true;
    }
    
    // 启用主动预防
    if (!currentConfig.proactive_prevention) {
      currentConfig.proactive_prevention = {
        enabled: true,
        prediction_confidence_threshold: 0.7,
        auto_prevention_enabled: true,
        prevention_strategies: ['resource_scaling', 'dependency_prefetch'],
        monitoring_interval_ms: 5000
      };
    } else {
      currentConfig.proactive_prevention.enabled = true;
    }
    
    logger.info('Intelligent diagnostics and proactive prevention enabled');
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

      // 外部系统同步
      await this.syncToExternalSystem(planId, 'plan_created', {
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

      // 外部系统同步
      await this.syncToExternalSystem(planId, 'task_created', {
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

      // 外部系统同步
      await this.syncToExternalSystem(planId, 'dependency_resolved', {
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
        
        // 记录故障信息
        logger.info('处理任务故障', {
          task_id: taskId,
          plan_id: planId,
          error_message: errorMessage || 'Task execution failed'
        });
        
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
          
          logger.info('任务故障成功解决', {
            task_id: taskId,
            plan_id: planId,
            strategy: recoveryResult.strategy_used,
            new_status: newStatus
          });
          
          // 同步故障恢复结果到外部系统
          await this.syncToExternalSystem(planId, 'task_failure_resolved', {
            task_id: taskId,
            strategy_used: recoveryResult.strategy_used,
            execution_time_ms: recoveryResult.execution_time_ms,
            new_status: newStatus
          }, taskId);
          
        } else if (recoveryResult.intervention_required) {
          // 需要人工干预，保持失败状态但标记为需要干预
          task.metadata = {
            ...task.metadata,
            intervention_required: true,
            intervention_reason: recoveryResult.error_message
          };
          
          // 如果有增强型追踪适配器，尝试获取恢复建议
          if (this.traceAdapter && typeof this.failureResolver.getRecoverySuggestions === 'function') {
            try {
              const suggestions = await this.failureResolver.getRecoverySuggestions(recoveryResult.task_id);
              
              if (suggestions && suggestions.length > 0) {
                // 将恢复建议添加到任务元数据
                task.metadata = {
                  ...task.metadata,
                  recovery_suggestions: suggestions
                };
                
                logger.info('获取到恢复建议', {
                  task_id: taskId,
                  plan_id: planId,
                  suggestions_count: suggestions.length
                });
              }
            } catch (error) {
              logger.warn('获取恢复建议失败', {
                task_id: taskId,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
          
          // 检测相关开发问题
          if (this.traceAdapter && typeof this.failureResolver.detectDevelopmentIssues === 'function') {
            try {
              // 修复：正确处理返回值结构，使用issuesResult对象而不是直接访问length属性
              const issuesResult = await this.failureResolver.detectDevelopmentIssues();
              
              // 增强：添加详细日志，记录调用结果
              logger.debug('开发问题检测结果', {
                task_id: taskId,
                plan_id: planId,
                has_issues: issuesResult && issuesResult.issues && issuesResult.issues.length > 0,
                issues_count: issuesResult?.issues?.length || 0,
                confidence: issuesResult?.confidence || 0
              });
              
              // 检查issues数组是否存在且有内容
              if (issuesResult && issuesResult.issues && issuesResult.issues.length > 0) {
                // 将开发问题添加到任务元数据
                task.metadata = {
                  ...task.metadata,
                  development_issues: issuesResult.issues
                };
                
                // 将置信度信息添加到执行上下文
                if (!task.execution_context) {
                  task.execution_context = {};
                }
                
                if (!task.execution_context.variables) {
                  task.execution_context.variables = {};
                }
                
                // 在变量中存储置信度信息
                (task.execution_context.variables as Record<string, unknown>).diagnostics_confidence = issuesResult.confidence;
                
                logger.info('检测到相关开发问题', {
                  task_id: taskId,
                  plan_id: planId,
                  issues_count: issuesResult.issues.length,
                  confidence: issuesResult.confidence,
                  // 增强：记录问题类型分布
                  issue_types: issuesResult.issues.reduce((acc, issue) => {
                    acc[issue.type] = (acc[issue.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>),
                  // 增强：记录严重程度分布
                  severity_distribution: issuesResult.issues.reduce((acc, issue) => {
                    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                });
                
                // 同步开发问题到外部系统
                await this.syncToExternalSystem(planId, 'development_issues_detected', {
                  task_id: taskId,
                  issues_count: issuesResult.issues.length,
                  confidence: issuesResult.confidence,
                  issues: issuesResult.issues.map(issue => ({
                    id: issue.id,
                    type: issue.type,
                    severity: issue.severity,
                    title: issue.title,
                    file_path: issue.file_path // 增强：包含文件路径信息
                  }))
                }, taskId);
              } else {
                // 增强：记录没有发现问题的情况
                logger.debug('未检测到开发问题', {
                  task_id: taskId,
                  plan_id: planId
                });
              }
            } catch (error) {
              // 增强：更详细的错误日志
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const errorStack = error instanceof Error ? error.stack : undefined;
              
              logger.warn('检测开发问题失败', {
                task_id: taskId,
                plan_id: planId,
                error: errorMessage,
                error_stack: errorStack,
                adapter_type: this.traceAdapter.getAdapterInfo().type
              });
              
              // 增强：记录错误到任务元数据
              if (task.metadata) {
                // 使用类型断言避免类型错误
                (task.metadata as Record<string, unknown>).development_issues_detection_error = {
                  message: errorMessage,
                  timestamp: new Date().toISOString()
                };
              }
              
              // 增强：同步错误到外部系统
              await this.syncToExternalSystem(planId, 'development_issues_detection_error', {
                task_id: taskId,
                error: errorMessage,
                timestamp: new Date().toISOString()
              }, taskId);
            }
          }
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

      // 外部系统同步
      if (planId) {
        await this.syncToExternalSystem(planId, 'task_updated', {
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
   * 主动预防任务故障
   * 
   * 在任务执行前分析潜在故障风险并采取预防措施
   * Performance Target: <50ms
   * 
   * @param taskId 任务ID
   * @returns 预防结果
   */
  @PerformanceMonitor('PlanManager')
  async preventTaskFailure(taskId: UUID): Promise<TaskOperationResult<{
    potential_failures: string[];
    prevention_actions: string[];
    confidence_score: number;
  }>> {
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

      const planId = task.plan_id || '';
      const plan = planId ? this.plans.get(planId) : undefined;
      
      // 获取故障解决器配置
      const failureResolverConfig = plan?.failure_resolver;
      
      // 如果故障解决器未启用或未配置主动预防，返回空结果
      if (!this.config.failure_recovery_enabled || 
          !failureResolverConfig?.proactive_prevention?.enabled) {
        return {
          success: true,
          data: {
            potential_failures: [],
            prevention_actions: [],
            confidence_score: 0
          },
          task_id: taskId,
          plan_id: planId,
          operation_time_ms: performance.now() - startTime
        };
      }
      
      // 执行主动故障预防
      const preventionResult = await this.failureResolver.preventPotentialFailure(
        planId,
        taskId,
        task,
        failureResolverConfig.proactive_prevention
      );
      
      const operationTime = performance.now() - startTime;
      
      // 如果发现潜在故障，记录到任务元数据
      if (preventionResult.potential_failures.length > 0) {
        // 确保metadata对象存在
        if (!task.metadata) {
          task.metadata = {};
        }
        
        // 更新风险级别（使用已定义的字段）
        task.metadata.risk_level = preventionResult.confidence_score > 0.7 ? 'high' : 
                                  preventionResult.confidence_score > 0.4 ? 'medium' : 'low';
        
        // 将其他预防相关信息存储在自定义字段中
        task.metadata = {
          ...task.metadata,
          tags: [...(task.metadata.tags || []), 'failure_prevention']
        };
        
        // 将预防信息存储在执行上下文中
        if (!task.execution_context) {
          task.execution_context = {};
        }
        
        if (!task.execution_context.variables) {
          task.execution_context.variables = {};
        }
        
        // 在变量中存储预防信息
        (task.execution_context.variables as Record<string, unknown>).prevention_info = {
          potential_failures: preventionResult.potential_failures,
          prevention_actions: preventionResult.prevention_actions,
          confidence_score: preventionResult.confidence_score,
          timestamp: new Date().toISOString()
        };
        
        this.tasks.set(taskId, task);
        
        // 记录到日志
        logger.info('检测到潜在故障风险并应用预防措施', {
          task_id: taskId,
          plan_id: planId,
          potential_failures: preventionResult.potential_failures,
          prevention_actions: preventionResult.prevention_actions,
          confidence_score: preventionResult.confidence_score
        });
      }
      
      // 外部系统同步
      if (planId && preventionResult.potential_failures.length > 0) {
        await this.syncToExternalSystem(planId, 'task_prevention', {
          task_id: taskId,
          potential_failures: preventionResult.potential_failures,
          prevention_actions: preventionResult.prevention_actions,
          confidence_score: preventionResult.confidence_score,
          operation_time_ms: operationTime
        }, taskId);
      }
      
      return {
        success: true,
        data: {
          potential_failures: preventionResult.potential_failures,
          prevention_actions: preventionResult.prevention_actions,
          confidence_score: preventionResult.confidence_score
        },
        task_id: taskId,
        plan_id: planId,
        operation_time_ms: operationTime
      };
      
    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const task = this.tasks.get(taskId);
      
      logger.error('主动故障预防失败', {
        task_id: taskId,
        plan_id: task?.plan_id,
        error: errorMessage
      });
      
      return {
        success: false,
        error: {
          code: 'FAILURE_PREVENTION_FAILED',
          message: errorMessage
        },
        task_id: taskId,
        plan_id: task?.plan_id || '',
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 优化故障恢复策略
   * 
   * 基于历史数据学习最佳恢复策略
   * Performance Target: <100ms
   * 
   * @param planId 计划ID
   * @returns 优化结果
   */
  @PerformanceMonitor('PlanManager')
  async optimizeFailureRecoveryStrategies(planId: UUID): Promise<PlanOperationResult<{
    recommended_strategies: RecoveryStrategy[];
    confidence_scores: Record<string, number>;
    adaptation_applied: boolean;
  }>> {
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
      
      // 获取故障解决器配置
      const failureResolverConfig = plan.failure_resolver;
      
      // 如果故障解决器未启用或未配置自学习，返回空结果
      if (!this.config.failure_recovery_enabled || 
          !failureResolverConfig?.self_learning?.enabled) {
        return {
          success: true,
          data: {
            recommended_strategies: [],
            confidence_scores: {},
            adaptation_applied: false
          },
          plan_id: planId,
          operation_time_ms: performance.now() - startTime
        };
      }
      
      // 获取计划中的失败任务
      const failedTasks = Array.from(this.tasks.values())
        .filter(task => task.plan_id === planId && task.status === 'failed');
      
      // 如果没有失败任务，使用最近的任务
      const targetTask = failedTasks.length > 0 ? 
        failedTasks[0] : 
        Array.from(this.tasks.values())
          .filter(task => task.plan_id === planId)
          .sort((a, b) => {
            const aTime = a.updated_at || a.created_at || '';
            const bTime = b.updated_at || b.created_at || '';
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          })[0];
      
      if (!targetTask) {
        return {
          success: true,
          data: {
            recommended_strategies: [],
            confidence_scores: {},
            adaptation_applied: false
          },
          plan_id: planId,
          operation_time_ms: performance.now() - startTime
        };
      }
      
      // 执行自学习恢复优化
      const learningResult = await this.failureResolver.learnAndOptimizeRecovery(
        targetTask.task_id,
        targetTask,
        targetTask.error_message || 'Unknown error',
        failureResolverConfig.self_learning
      );
      
      const operationTime = performance.now() - startTime;
      
      // 如果有推荐策略，更新计划的故障解决器配置
      if (learningResult.recommended_strategies.length > 0 && learningResult.adaptation_applied) {
        // 更新计划的故障解决器策略
        if (plan.failure_resolver) {
          plan.failure_resolver.strategies = learningResult.recommended_strategies;
          this.plans.set(planId, plan);
          
          logger.info('已优化故障恢复策略', {
            plan_id: planId,
            recommended_strategies: learningResult.recommended_strategies,
            top_confidence: learningResult.confidence_scores[learningResult.recommended_strategies[0]]
          });
        }
      }
      
      // 外部系统同步
      await this.syncToExternalSystem(planId, 'recovery_optimization', {
        recommended_strategies: learningResult.recommended_strategies,
        confidence_scores: learningResult.confidence_scores,
        adaptation_applied: learningResult.adaptation_applied,
        operation_time_ms: operationTime
      });
      
      return {
        success: true,
        data: {
          recommended_strategies: learningResult.recommended_strategies,
          confidence_scores: learningResult.confidence_scores,
          adaptation_applied: learningResult.adaptation_applied
        },
        plan_id: planId,
        operation_time_ms: operationTime
      };
      
    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('故障恢复策略优化失败', {
        plan_id: planId,
        error: errorMessage
      });
      
      return {
        success: false,
        error: {
          code: 'RECOVERY_OPTIMIZATION_FAILED',
          message: errorMessage
        },
        plan_id: planId,
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 启用主动故障预防
   * 
   * @param planId 计划ID
   * @param config 预防配置
   * @returns 操作结果
   */
  @PerformanceMonitor('PlanManager')
  async enableProactiveFailurePrevention(
    planId: UUID,
    config?: Partial<ProactiveFailurePrevention>
  ): Promise<PlanOperationResult<boolean>> {
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
      
      // 确保故障解决器存在
      if (!plan.failure_resolver) {
        plan.failure_resolver = this.createDefaultFailureResolver();
      }
      
      // 更新主动预防配置
      plan.failure_resolver.proactive_prevention = {
        enabled: true,
        prediction_confidence_threshold: 0.7,
        auto_prevention_enabled: false,
        prevention_strategies: ['resource_scaling', 'dependency_prefetch', 'early_checkpoint'],
        monitoring_interval_ms: 5000,
        ...config
      };
      
      this.plans.set(planId, plan);
      
      const operationTime = performance.now() - startTime;
      
      logger.info('已启用主动故障预防', {
        plan_id: planId,
        auto_prevention: plan.failure_resolver.proactive_prevention.auto_prevention_enabled,
        strategies: plan.failure_resolver.proactive_prevention.prevention_strategies
      });
      
      // 外部系统同步
      await this.syncToExternalSystem(planId, 'prevention_enabled', {
        config: plan.failure_resolver.proactive_prevention,
        operation_time_ms: operationTime
      });
      
      return {
        success: true,
        data: true,
        plan_id: planId,
        operation_time_ms: operationTime
      };
      
    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('启用主动故障预防失败', {
        plan_id: planId,
        error: errorMessage
      });
      
      return {
        success: false,
        error: {
          code: 'ENABLE_PREVENTION_FAILED',
          message: errorMessage
        },
        plan_id: planId,
        operation_time_ms: operationTime
      };
    }
  }

  /**
   * 启用自学习恢复机制
   * 
   * @param planId 计划ID
   * @param config 学习配置
   * @returns 操作结果
   */
  @PerformanceMonitor('PlanManager')
  async enableSelfLearningRecovery(
    planId: UUID,
    config?: Partial<SelfLearningRecovery>
  ): Promise<PlanOperationResult<boolean>> {
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
      
      // 确保故障解决器存在
      if (!plan.failure_resolver) {
        plan.failure_resolver = this.createDefaultFailureResolver();
      }
      
      // 更新自学习配置
      plan.failure_resolver.self_learning = {
        enabled: true,
        learning_mode: 'passive',
        min_samples_required: 10,
        adaptation_rate: 0.1,
        strategy_effectiveness_metrics: ['success_rate', 'recovery_time'],
        ...config
      };
      
      this.plans.set(planId, plan);
      
      // 更新故障解决器的自学习配置
      this.failureResolver.updateSelfLearningConfig(plan.failure_resolver.self_learning);
      
      const operationTime = performance.now() - startTime;
      
      logger.info('已启用自学习恢复机制', {
        plan_id: planId,
        learning_mode: plan.failure_resolver.self_learning.learning_mode,
        adaptation_rate: plan.failure_resolver.self_learning.adaptation_rate
      });
      
      // 外部系统同步
      await this.syncToExternalSystem(planId, 'self_learning_enabled', {
        config: plan.failure_resolver.self_learning,
        operation_time_ms: operationTime
      });
      
      return {
        success: true,
        data: true,
        plan_id: planId,
        operation_time_ms: operationTime
      };
      
    } catch (error) {
      const operationTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('启用自学习恢复机制失败', {
        plan_id: planId,
        error: errorMessage
      });
      
      return {
        success: false,
        error: {
          code: 'ENABLE_SELF_LEARNING_FAILED',
          message: errorMessage
        },
        plan_id: planId,
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
   * 外部系统同步 - 厂商中立实现
   */
  private async syncToExternalSystem(
    planId: UUID,
    eventType: string,
    data: Record<string, unknown>,
    taskId?: UUID
  ): Promise<void> {
    if (!this.traceAdapter) return;

    try {
      // 创建标准的追踪数据
      const traceData: MPLPTraceData = {
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
        adapter_metadata: {
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
      };

      // 使用通用适配器接口同步数据
      const syncResult = await this.traceAdapter.syncTraceData(traceData);
      
      if (!syncResult.success) {
        logger.warn('追踪数据同步失败', {
          module: 'Plan',
          event_type: eventType,
          errors: syncResult.errors
        });
      }
      
      // 如果是任务失败相关事件，使用通用接口处理
      if (eventType === 'task_failure' || eventType === 'task_failure_resolved') {
        if (eventType === 'task_failure' && taskId) {
          // 使用通用接口报告故障，不依赖特定厂商实现
          await this.traceAdapter.reportFailure({
            failure_id: `failure-${taskId}-${Date.now()}`,
            task_id: taskId,
            plan_id: planId,
            failure_type: data.failure_type as string || 'task_execution_failure',
            failure_details: data,
            timestamp: new Date().toISOString(),
            recovery_suggestions: data.recovery_suggestions as string[] || []
          });
          
          // 记录性能指标
          this.recordPerformanceMetrics({
            'trace_sync_latency': syncResult.latency_ms,
            'failure_report_time': Date.now()
          });
        }
      }
      
      // 批量处理优化 - 如果有批处理队列，添加到队列
      if (this.traceBatchQueue && this.traceBatchQueue.length < this.batchLimit) {
        this.traceBatchQueue.push(traceData);
      }
      
      // 如果队列达到阈值，执行批量同步
      if (this.traceBatchQueue && this.traceBatchQueue.length >= this.batchLimit) {
        this.processBatchQueue();
      }
    } catch (error) {
      logger.warn('外部系统同步失败', {
        module: 'Plan',
        plan_id: planId,
        task_id: taskId,
        event_type: eventType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 处理批量追踪队列
   * 厂商中立实现 - 使用通用接口
   */
  private async processBatchQueue(): Promise<void> {
    if (!this.traceAdapter || !this.traceBatchQueue || this.traceBatchQueue.length === 0) return;
    
    try {
      const batchToProcess = [...this.traceBatchQueue];
      this.traceBatchQueue = [];
      
      // 使用通用批量同步接口
      const batchResult = await this.traceAdapter.syncBatch(batchToProcess);
      
      if (!batchResult.success) {
        logger.warn('批量追踪同步失败', {
          count: batchToProcess.length,
          errors: batchResult.errors
        });
      } else {
        logger.debug('批量追踪同步成功', {
          count: batchToProcess.length,
          latency_ms: batchResult.latency_ms
        });
      }
    } catch (error) {
      logger.error('批量追踪处理错误', {
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
        external_synced: !!this.traceAdapter
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
    
    // 通用通知处理
    this.emit('notification', {
      channel,
      message,
      data,
      timestamp: new Date().toISOString()
    });
    
    // 记录到日志
    logger.info(`Notification: ${message}`, {
      channel,
      data
    });
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
    
    // 通过事件通知
    this.emit('manual_intervention_needed', {
      task_id: taskId,
      plan_id: planId,
      reason,
      timestamp: new Date().toISOString()
    });
    
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
   * 启动批处理队列
   */
  private startBatchProcessing(): void {
    if (this.batchProcessingInterval) {
      clearInterval(this.batchProcessingInterval);
    }
    this.batchProcessingInterval = setInterval(() => {
      this.processBatchQueue();
    }, 1000); // 每秒处理一次批量队列
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

  /**
   * 设置角色管理器
   * 
   * @param roleManager 角色管理器实例
   */
  setRoleManager(roleManager: IRoleManager): void {
    this.roleManager = roleManager;
    logger.info('RoleManager connected to PlanManager');
  }
  
  /**
   * 设置上下文管理器
   * 
   * @param contextManager 上下文管理器实例
   */
  setContextManager(contextManager: IContextManager): void {
    this.contextManager = contextManager;
    logger.info('ContextManager connected to PlanManager');
  }
  
  /**
   * 设置追踪服务
   * 
   * @param traceService 追踪服务实例
   */
  setTraceService(traceService: any): void {
    this.traceService = traceService;
    logger.info('TraceService connected to PlanManager');
  }
  
  /**
   * 检查用户是否有执行计划的权限
   * 
   * @param userId 用户ID
   * @param planId 计划ID
   * @returns Promise<boolean> 是否有权限
   */
  async checkExecutePermission(userId: string, planId: string): Promise<boolean> {
    if (!this.roleManager) {
      logger.warn('RoleManager not connected, skipping permission check');
      return true; // 如果没有设置角色管理器，默认允许
    }
    
    // 获取计划信息，以便获取上下文ID
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    // 检查权限
    const permissionResult = await this.roleManager.checkPermission({
      user_id: userId,
      resource: 'plan',
      action: 'execute',
      context_id: plan.context_id,
      resource_id: planId
    });
    
    if (!permissionResult.granted) {
      logger.warn(`Permission denied: User ${userId} cannot execute plan ${planId}`, {
        reason: permissionResult.reason
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查用户是否有更新计划的权限
   * 
   * @param userId 用户ID
   * @param planId 计划ID
   * @returns Promise<boolean> 是否有权限
   */
  async checkUpdatePermission(userId: string, planId: string): Promise<boolean> {
    if (!this.roleManager) {
      logger.warn('RoleManager not connected, skipping permission check');
      return true; // 如果没有设置角色管理器，默认允许
    }
    
    // 获取计划信息，以便获取上下文ID
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    // 检查权限
    const permissionResult = await this.roleManager.checkPermission({
      user_id: userId,
      resource: 'plan',
      action: 'write',
      context_id: plan.context_id,
      resource_id: planId
    });
    
    if (!permissionResult.granted) {
      logger.warn(`Permission denied: User ${userId} cannot update plan ${planId}`, {
        reason: permissionResult.reason
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * 检查用户是否有删除计划的权限
   * 
   * @param userId 用户ID
   * @param planId 计划ID
   * @returns Promise<boolean> 是否有权限
   */
  async checkDeletePermission(userId: string, planId: string): Promise<boolean> {
    if (!this.roleManager) {
      logger.warn('RoleManager not connected, skipping permission check');
      return true; // 如果没有设置角色管理器，默认允许
    }
    
    // 获取计划信息，以便获取上下文ID
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    // 检查权限
    const permissionResult = await this.roleManager.checkPermission({
      user_id: userId,
      resource: 'plan',
      action: 'delete',
      context_id: plan.context_id,
      resource_id: planId
    });
    
    if (!permissionResult.granted) {
      logger.warn(`Permission denied: User ${userId} cannot delete plan ${planId}`, {
        reason: permissionResult.reason
      });
      return false;
    }
    
    return true;
  }
  
  // 添加一个方法来记录用户操作的审计日志
  private async recordAuditLog(userId: string, action: string, planId: string, details: Record<string, unknown>): Promise<void> {
    if (this.traceService) {
      try {
        const plan = this.plans.get(planId);
        if (!plan) return;
        
        await this.traceService.recordTrace({
          trace_id: uuidv4(),
          context_id: plan.context_id,
          operation: `plan_${action}`,
          user_id: userId,
          timestamp: new Date().toISOString(),
          data: {
            plan_id: planId,
            ...details
          },
          metadata: {
            source: 'PlanManager',
            type: 'audit_log'
          }
        });
      } catch (error) {
        logger.error('Failed to record audit log', { error });
      }
    }
  }

  /**
   * 批量添加任务
   * 
   * @param planId 计划ID
   * @param tasks 任务列表
   * @returns 批量操作结果
   */
  async batchAddTasks(
    planId: UUID,
    tasks: Array<{
      title: string;
      description: string;
      priority?: TaskPriority;
      assigneeId?: string;
      parentTaskId?: string;
      estimated_duration?: {
        value: number;
        unit: 'minutes' | 'hours' | 'days' | 'weeks';
      };
      metadata?: Record<string, unknown>;
    }>
  ): Promise<BatchOperationResult<Task>> {
    const startTime = performance.now();
    const results: { success: boolean; data?: Task; error?: any }[] = [];
    let successCount = 0;
    let failureCount = 0;

    try {
      // 验证计划存在
      const planResult = await this.getPlan(planId);
      if (!planResult.success || !planResult.data) {
        return {
          success: false,
          error: {
            message: `Plan not found: ${planId}`,
            code: 'PLAN_NOT_FOUND'
          },
          results: [],
          summary: {
            total: tasks.length,
            successful: 0,
            failed: tasks.length
          },
          execution_time_ms: performance.now() - startTime
        };
      }

      const plan = planResult.data;
      
      // 检查计划状态
      if (['completed', 'cancelled', 'failed'].includes(plan.status)) {
        return {
          success: false,
          error: {
            message: `Cannot add tasks to ${plan.status} plan`,
            code: 'INVALID_PLAN_STATUS'
          },
          results: [],
          summary: {
            total: tasks.length,
            successful: 0,
            failed: tasks.length
          },
          execution_time_ms: performance.now() - startTime
        };
      }

      // 批量添加任务
      for (const taskData of tasks) {
        try {
          const result = await this.addTask(
            planId,
            taskData.title,
            taskData.description,
            taskData.priority || 'medium',
            taskData.assigneeId,
            taskData.parentTaskId
          );

          // 如果有额外的元数据或估计时长，更新任务
          if (result.success && result.data && (taskData.metadata || taskData.estimated_duration)) {
            const task = this.tasks.get(result.data.task_id);
            if (task) {
              if (taskData.metadata) {
                task.metadata = { ...task.metadata, ...taskData.metadata };
              }
              if (taskData.estimated_duration) {
                // 将估计时间信息保存在自定义属性中
                task.metadata = {
                  ...task.metadata,
                  // 使用现有的合法属性
                  complexity_score: taskData.estimated_duration.value, // 用复杂度分数存储值
                  category: `duration_${taskData.estimated_duration.unit}` // 使用类别字段存储单位信息
                };
                
                // 如果任务支持 estimated_effort，则也设置该字段
                if (task.estimated_effort === undefined) {
                  task.estimated_effort = {
                    value: taskData.estimated_duration.value,
                    unit: taskData.estimated_duration.unit === 'minutes' || 
                          taskData.estimated_duration.unit === 'hours' ? 
                          'hours' : 'days'
                  };
                }
              }
              this.tasks.set(task.task_id, task);
            }
          }

          results.push(result);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          results.push({
            success: false,
            error: {
              message: error instanceof Error ? error.message : String(error),
              code: 'TASK_CREATION_ERROR'
            }
          });
          failureCount++;
        }
      }

      // 更新计划进度
      await this.updatePlanProgress(planId);

      // 发送批量任务创建事件
      this.emitPlanEvent('plan_updated', planId, {
        action: 'batch_tasks_added',
        task_count: tasks.length,
        success_count: successCount,
        failure_count: failureCount
      });

      // 同步到外部系统
      await this.syncToExternalSystem(planId, 'batch_tasks_added', {
        task_count: tasks.length,
        success_count: successCount,
        failure_count: failureCount
      });

      return {
        success: successCount > 0,
        results,
        summary: {
          total: tasks.length,
          successful: successCount,
          failed: failureCount
        },
        execution_time_ms: performance.now() - startTime
      };
    } catch (error) {
      logger.error('Failed to batch add tasks', {
        plan_id: planId,
        task_count: tasks.length,
        error
      });

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'BATCH_OPERATION_ERROR'
        },
        results,
        summary: {
          total: tasks.length,
          successful: successCount,
          failed: failureCount + (tasks.length - successCount - failureCount)
        },
        execution_time_ms: performance.now() - startTime
      };
    }
  }

  /**
   * 批量添加依赖关系
   * 
   * @param dependencies 依赖关系列表
   * @returns 批量操作结果
   */
  async batchAddDependencies(
    dependencies: Array<{
      sourceTaskId: UUID;
      targetTaskId: UUID;
      dependencyType?: DependencyType;
      condition?: string;
    }>
  ): Promise<BatchOperationResult<TaskDependency>> {
    const startTime = performance.now();
    const results: { success: boolean; data?: TaskDependency; error?: any }[] = [];
    let successCount = 0;
    let failureCount = 0;
    let planId: UUID | null = null;

    try {
      // 批量添加依赖
      for (const dep of dependencies) {
        try {
          const result = await this.addDependency(
            dep.sourceTaskId,
            dep.targetTaskId,
            dep.dependencyType || 'finish_to_start',
            dep.condition
          );

          results.push(result);
          if (result.success) {
            successCount++;
            // 记录计划ID用于后续更新
            if (!planId && result.data) {
              const sourceTask = this.tasks.get(dep.sourceTaskId);
              if (sourceTask && sourceTask.plan_id) {
                planId = sourceTask.plan_id;
              }
            }
          } else {
            failureCount++;
          }
        } catch (error) {
          results.push({
            success: false,
            error: {
              message: error instanceof Error ? error.message : String(error),
              code: 'DEPENDENCY_CREATION_ERROR'
            }
          });
          failureCount++;
        }
      }

      // 如果找到了计划ID，更新依赖图
      if (planId) {
        // 重建依赖图
        const plan = this.plans.get(planId);
        if (plan) {
          // plan.tasks 是任务ID数组，而不是任务对象
          const taskIds = Array.isArray(plan.task_ids) ? plan.task_ids : 
                        (Array.isArray(plan.tasks) ? plan.tasks : []);
          
          // 获取任务对象
          const tasks = taskIds
            .map(taskId => typeof taskId === 'string' ? this.tasks.get(taskId) : null)
            .filter(Boolean) as PlanTask[];
          
          // 收集所有依赖关系
          const deps = tasks.flatMap(task => {
            // 确保 dependencies 存在且是数组
            const dependencies = Array.isArray(task.dependencies) ? task.dependencies : [];
            return dependencies
              .map(depId => this.dependencies.get(depId))
              .filter(Boolean);
          }) as PlanDependency[];
          
          // 更新依赖图
          const graph = this.buildDependencyGraph(tasks, deps);
          this.dependencyGraphs.set(planId, graph);
          
          // 检查循环依赖
          if (graph.cycles.length > 0) {
            logger.warn('Circular dependencies detected in plan', {
              plan_id: planId,
              cycles: graph.cycles
            });
          }
          
          // 发送事件
          this.emitPlanEvent('plan_updated', planId, {
            action: 'dependency_graph_updated',
            has_cycles: graph.cycles.length > 0
          });
        }
      }

      return {
        success: successCount > 0,
        results,
        summary: {
          total: dependencies.length,
          successful: successCount,
          failed: failureCount
        },
        execution_time_ms: performance.now() - startTime
      };
    } catch (error) {
      logger.error('Failed to batch add dependencies', {
        dependency_count: dependencies.length,
        error
      });

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'BATCH_OPERATION_ERROR'
        },
        results,
        summary: {
          total: dependencies.length,
          successful: successCount,
          failed: failureCount + (dependencies.length - successCount - failureCount)
        },
        execution_time_ms: performance.now() - startTime
      };
    }
  }

  /**
   * 批量更新任务状态
   * 
   * @param updates 状态更新列表
   * @returns 批量操作结果
   */
  async batchUpdateTaskStatus(
    updates: Array<{
      taskId: UUID;
      status: TaskStatus;
      resultData?: unknown;
      errorMessage?: string;
    }>
  ): Promise<BatchOperationResult<Task>> {
    const startTime = performance.now();
    const results: { success: boolean; data?: Task; error?: any }[] = [];
    let successCount = 0;
    let failureCount = 0;
    const affectedPlans = new Set<UUID>();

    try {
      // 批量更新状态
      for (const update of updates) {
        try {
          const result = await this.updateTaskStatus(
            update.taskId,
            update.status,
            update.resultData,
            update.errorMessage
          );

          results.push(result);
          if (result.success && result.data) {
            successCount++;
            // 记录受影响的计划
            const task = this.tasks.get(update.taskId);
            if (task && task.plan_id) {
              affectedPlans.add(task.plan_id);
            }
          } else {
            failureCount++;
          }
        } catch (error) {
          results.push({
            success: false,
            error: {
              message: error instanceof Error ? error.message : String(error),
              code: 'STATUS_UPDATE_ERROR'
            }
          });
          failureCount++;
        }
      }

      // 更新受影响计划的进度
      for (const planId of affectedPlans) {
        await this.updatePlanProgress(planId);
        
        // 发送批量更新事件
        this.emitPlanEvent('plan_updated', planId, {
          action: 'batch_status_updated',
          update_count: updates.length,
          success_count: successCount,
          failure_count: failureCount
        });
      }

      return {
        success: successCount > 0,
        results,
        summary: {
          total: updates.length,
          successful: successCount,
          failed: failureCount
        },
        execution_time_ms: performance.now() - startTime
      };
    } catch (error) {
      logger.error('Failed to batch update task status', {
        update_count: updates.length,
        error
      });

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: 'BATCH_OPERATION_ERROR'
        },
        results,
        summary: {
          total: updates.length,
          successful: successCount,
          failed: failureCount + (updates.length - successCount - failureCount)
        },
        execution_time_ms: performance.now() - startTime
      };
    }
  }

  /**
   * 构建依赖图
   * 
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 依赖图
   */
  private buildDependencyGraph(tasks: PlanTask[], dependencies: PlanDependency[]): TaskDependencyGraph {
    const graph: TaskDependencyGraph = {
      nodes: tasks.map(task => task.task_id),
      edges: dependencies,
      entry_points: [],
      exit_points: [],
      critical_path: [],
      cycles: []
    };
    
    // 找出入口点（没有前置依赖的任务）
    const hasDependents = new Set<UUID>();
    dependencies.forEach(dep => hasDependents.add(dep.target_task_id));
    graph.entry_points = tasks
      .filter(task => !hasDependents.has(task.task_id))
      .map(task => task.task_id);
    
    // 找出出口点（没有后续任务的任务）
    const hasDependencies = new Set<UUID>();
    dependencies.forEach(dep => hasDependencies.add(dep.source_task_id));
    graph.exit_points = tasks
      .filter(task => !hasDependencies.has(task.task_id))
      .map(task => task.task_id);
    
    // 检测循环依赖
    graph.cycles = this.detectCycles(tasks, dependencies);
    
    // 计算关键路径（简化版本）
    if (graph.cycles.length === 0) {
      graph.critical_path = this.calculateCriticalPath(tasks, dependencies);
    }
    
    return graph;
  }

  /**
   * 检测循环依赖
   * 
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 循环依赖列表
   */
  private detectCycles(tasks: PlanTask[], dependencies: PlanDependency[]): UUID[][] {
    const cycles: UUID[][] = [];
    
    // 构建邻接表
    const adjacencyList = new Map<UUID, UUID[]>();
    tasks.forEach(task => {
      adjacencyList.set(task.task_id, []);
    });
    
    dependencies.forEach(dep => {
      const targets = adjacencyList.get(dep.source_task_id) || [];
      targets.push(dep.target_task_id);
      adjacencyList.set(dep.source_task_id, targets);
    });
    
    // DFS检测循环
    const visited = new Set<UUID>();
    const recursionStack = new Set<UUID>();
    
    const dfs = (nodeId: UUID, path: UUID[] = []): boolean => {
      if (recursionStack.has(nodeId)) {
        // 找到循环
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart >= 0) {
          cycles.push(path.slice(cycleStart).concat(nodeId));
        }
        return true;
      }
      
      if (visited.has(nodeId)) {
        return false;
      }
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      
      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor, [...path])) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    // 对每个节点运行DFS
    tasks.forEach(task => {
      if (!visited.has(task.task_id)) {
        dfs(task.task_id);
      }
    });
    
    return cycles;
  }

  /**
   * 计算关键路径
   * 
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 关键路径
   */
  private calculateCriticalPath(tasks: PlanTask[], dependencies: PlanDependency[]): UUID[] {
    // 简化版本的关键路径计算
    // 在实际项目中，这里应该实现一个完整的关键路径算法
    // 例如使用拓扑排序和最长路径算法
    
    // 这里只是一个示例实现
    const entryPoints = this.findEntryPoints(tasks, dependencies);
    const exitPoints = this.findExitPoints(tasks, dependencies);
    
    if (entryPoints.length === 0 || exitPoints.length === 0) {
      return [];
    }
    
    // 简单起见，返回第一个入口点到第一个出口点的路径
    return [entryPoints[0], exitPoints[0]];
  }

  /**
   * 查找入口点
   * 
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 入口点列表
   */
  private findEntryPoints(tasks: PlanTask[], dependencies: PlanDependency[]): UUID[] {
    const hasDependents = new Set<UUID>();
    dependencies.forEach(dep => hasDependents.add(dep.target_task_id));
    
    return tasks
      .filter(task => !hasDependents.has(task.task_id))
      .map(task => task.task_id);
  }

  /**
   * 查找出口点
   * 
   * @param tasks 任务列表
   * @param dependencies 依赖关系列表
   * @returns 出口点列表
   */
  private findExitPoints(tasks: PlanTask[], dependencies: PlanDependency[]): UUID[] {
    const hasDependencies = new Set<UUID>();
    dependencies.forEach(dep => hasDependencies.add(dep.source_task_id));
    
    return tasks
      .filter(task => !hasDependencies.has(task.task_id))
      .map(task => task.task_id);
  }
} 
/**
 * Plan模块类型定义
 *
 * 基于MPLP Plan Schema的TypeScript类型定义
 * Schema层使用snake_case，Application层使用camelCase
 *
 * 功能：任务规划和依赖管理
 * - 复杂目标的任务分解
 * - 任务间依赖关系管理
 * - 执行策略优化和调度
 * - 失败恢复和风险管理
 * - 资源约束和时间优化
 *
 * @version 1.0.0
 * @created 2025-08-06
 */

import { UUID, Timestamp, Version } from '../../public/shared/types';
import {
  PlanStatus,
  Priority,
  TaskStatus,
  ExecutionStrategy
} from '../../public/shared/types/plan-types';

// 重新导出共享类型，避免重复定义
export {
  PlanStatus,
  Priority,
  TaskStatus,
  ExecutionStrategy
};

/**
 * 依赖类型
 * 对应Schema: dependency.type
 */
export enum DependencyType {
  FINISH_TO_START = 'finish_to_start',
  START_TO_START = 'start_to_start',
  FINISH_TO_FINISH = 'finish_to_finish',
  START_TO_FINISH = 'start_to_finish'
}

/**
 * 失败恢复策略
 * 对应Schema: failure_resolver.strategies
 */
export enum FailureRecoveryStrategy {
  RETRY = 'retry',
  ROLLBACK = 'rollback',
  SKIP = 'skip',
  MANUAL_INTERVENTION = 'manual_intervention'
}

/**
 * 优化策略
 * 对应Schema: optimization.strategy
 */
export enum OptimizationStrategy {
  TIME_OPTIMAL = 'time_optimal',
  RESOURCE_OPTIMAL = 'resource_optimal',
  COST_OPTIMAL = 'cost_optimal',
  QUALITY_OPTIMAL = 'quality_optimal',
  BALANCED = 'balanced'
}

/**
 * 风险级别
 * 对应Schema: risk_assessment.overall_risk_level
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ===== 核心协议接口 =====

/**
 * MPLP Plan协议接口
 * 对应Schema: mplp-plan.json根对象
 *
 * 功能：定义完整的计划结构，支持复杂任务规划和依赖管理
 */
export interface PlanProtocol {
  /**
   * MPLP协议版本
   * 对应Schema: protocol_version
   */
  protocolVersion: Version;

  /**
   * 协议消息时间戳
   * 对应Schema: timestamp
   */
  timestamp: Timestamp;

  /**
   * 计划唯一标识符
   * 对应Schema: plan_id
   */
  planId: UUID;

  /**
   * 关联的上下文ID
   * 对应Schema: context_id
   */
  contextId: UUID;

  /**
   * 计划名称
   * 对应Schema: name
   */
  name: string;

  /**
   * 计划描述
   * 对应Schema: description
   */
  description?: string;

  /**
   * 计划状态
   * 对应Schema: status
   */
  status: PlanStatus;

  /**
   * 优先级
   * 对应Schema: priority
   */
  priority?: Priority;

  /**
   * 计划目标列表
   * 对应Schema: goals
   */
  goals?: string[];

  /**
   * 任务列表
   * 对应Schema: tasks
   */
  tasks: PlanTask[];

  /**
   * 任务依赖关系
   * 对应Schema: dependencies
   */
  dependencies?: PlanDependency[];

  /**
   * 执行策略
   * 对应Schema: execution_strategy
   */
  executionStrategy?: ExecutionStrategy;

  /**
   * 预估持续时间
   * 对应Schema: estimated_duration
   */
  estimatedDuration?: Duration;

  /**
   * 实际持续时间
   * 对应Schema: actual_duration
   */
  actualDuration?: Duration;

  /**
   * 计划进度 (0-100)
   * 对应Schema: progress
   */
  progress?: number;

  /**
   * 资源需求
   * 对应Schema: resource_requirements
   */
  resourceRequirements?: ResourceRequirement[];

  /**
   * 优化配置
   * 对应Schema: optimization
   */
  optimization?: OptimizationConfig;

  /**
   * 风险评估
   * 对应Schema: risk_assessment
   */
  riskAssessment?: RiskAssessment;

  /**
   * 失败恢复配置
   * 对应Schema: failure_resolver
   */
  failureResolver?: FailureResolver;

  /**
   * 计划配置
   * 对应Schema: configuration
   */
  configuration?: PlanFeatureConfiguration;

  /**
   * 创建时间
   * 对应Schema: created_at
   */
  createdAt: Timestamp;

  /**
   * 更新时间
   * 对应Schema: updated_at
   */
  updatedAt: Timestamp;

  /**
   * 创建者ID
   * 对应Schema: created_by
   */
  createdBy?: string;

  /**
   * 最后更新者ID
   * 对应Schema: updated_by
   */
  updatedBy?: string;

  /**
   * 扩展元数据
   * 对应Schema: metadata
   */
  metadata?: Record<string, unknown>;
}

// ===== 子类型定义 =====

/**
 * 计划任务接口
 * 对应Schema: tasks数组项
 */
export interface PlanTask {
  /**
   * 任务唯一标识符
   * 对应Schema: task.task_id
   */
  taskId: UUID;

  /**
   * 任务名称
   * 对应Schema: task.name
   */
  name: string;

  /**
   * 任务描述
   * 对应Schema: task.description
   */
  description?: string;

  /**
   * 任务状态
   * 对应Schema: task.status
   */
  status?: TaskStatus;

  /**
   * 任务优先级
   * 对应Schema: task.priority
   */
  priority?: Priority;

  /**
   * 任务类型
   * 对应Schema: task.type
   */
  type?: string;

  /**
   * 任务依赖列表
   * 对应Schema: task.dependencies
   */
  dependencies?: UUID[];

  /**
   * 预估持续时间
   * 对应Schema: task.estimated_duration
   */
  estimatedDuration?: Duration;

  /**
   * 实际持续时间
   * 对应Schema: task.actual_duration
   */
  actualDuration?: Duration;

  /**
   * 任务进度 (0-100)
   * 对应Schema: task.progress
   */
  progress?: number;

  /**
   * 资源需求
   * 对应Schema: task.resource_requirements
   */
  resourceRequirements?: ResourceRequirement[];

  /**
   * 失败恢复配置
   * 对应Schema: task.failure_resolver
   */
  failureResolver?: FailureResolver;

  /**
   * 任务参数
   * 对应Schema: task.parameters
   */
  parameters?: Record<string, unknown>;

  /**
   * 任务元数据
   * 对应Schema: task.metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * 任务依赖关系接口
 * 对应Schema: dependencies数组项
 */
export interface PlanDependency {
  /**
   * 依赖唯一标识符
   * 对应Schema: dependency.dependency_id
   */
  dependencyId: UUID;

  /**
   * 源任务ID
   * 对应Schema: dependency.source_task_id
   */
  sourceTaskId: UUID;

  /**
   * 目标任务ID
   * 对应Schema: dependency.target_task_id
   */
  targetTaskId: UUID;

  /**
   * 依赖类型
   * 对应Schema: dependency.type
   */
  type: DependencyType;

  /**
   * 延迟时间（毫秒）
   * 对应Schema: dependency.lag_time_ms
   */
  lagTimeMs?: number;

  /**
   * 依赖条件
   * 对应Schema: dependency.condition
   */
  condition?: string;

  /**
   * 依赖元数据
   * 对应Schema: dependency.metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * 持续时间接口
 * 对应Schema: duration对象
 */
export interface Duration {
  /**
   * 数值
   * 对应Schema: duration.value
   */
  value: number;

  /**
   * 时间单位
   * 对应Schema: duration.unit
   */
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
}

/**
 * 资源需求接口
 * 对应Schema: resource_requirements数组项
 */
export interface ResourceRequirement {
  /**
   * 资源ID
   * 对应Schema: resource.resource_id
   */
  resourceId: UUID;

  /**
   * 资源类型
   * 对应Schema: resource.type
   */
  type: string;

  /**
   * 所需数量
   * 对应Schema: resource.quantity
   */
  quantity: number;

  /**
   * 可用性要求
   * 对应Schema: resource.availability
   */
  availability?: string;

  /**
   * 资源元数据
   * 对应Schema: resource.metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * 失败恢复配置接口
 * 对应Schema: failure_resolver对象
 */
export interface FailureResolver {
  /**
   * 是否启用故障解决器
   * 对应Schema: failure_resolver.enabled
   */
  enabled: boolean;

  /**
   * 恢复策略列表（按优先级排序）
   * 对应Schema: failure_resolver.strategies
   */
  strategies: FailureRecoveryStrategy[];

  /**
   * 重试配置
   * 对应Schema: failure_resolver.retry_config
   */
  retryConfig?: RetryConfig;

  /**
   * 回滚配置
   * 对应Schema: failure_resolver.rollback_config
   */
  rollbackConfig?: RollbackConfig;

  /**
   * 人工干预配置
   * 对应Schema: failure_resolver.manual_intervention_config
   */
  manualInterventionConfig?: ManualInterventionConfig;
}

/**
 * 重试配置接口
 * 对应Schema: retry_config对象
 */
export interface RetryConfig {
  /**
   * 最大重试次数
   * 对应Schema: retry_config.max_attempts
   */
  maxAttempts: number;

  /**
   * 初始重试延迟（毫秒）
   * 对应Schema: retry_config.delay_ms
   */
  delayMs: number;

  /**
   * 退避因子
   * 对应Schema: retry_config.backoff_factor
   */
  backoffFactor: number;

  /**
   * 最大重试延迟（毫秒）
   * 对应Schema: retry_config.max_delay_ms
   */
  maxDelayMs: number;
}

/**
 * 回滚配置接口
 * 对应Schema: rollback_config对象
 */
export interface RollbackConfig {
  /**
   * 是否启用自动回滚
   * 对应Schema: rollback_config.auto_rollback
   */
  autoRollback: boolean;

  /**
   * 回滚策略
   * 对应Schema: rollback_config.strategy
   */
  strategy: 'checkpoint' | 'full' | 'partial';

  /**
   * 检查点间隔
   * 对应Schema: rollback_config.checkpoint_interval
   */
  checkpointInterval?: number;
}

/**
 * 人工干预配置接口
 * 对应Schema: manual_intervention_config对象
 */
export interface ManualInterventionConfig {
  /**
   * 通知渠道
   * 对应Schema: manual_intervention_config.notification_channels
   */
  notificationChannels: string[];

  /**
   * 超时时间（毫秒）
   * 对应Schema: manual_intervention_config.timeout_ms
   */
  timeoutMs: number;

  /**
   * 升级策略
   * 对应Schema: manual_intervention_config.escalation_strategy
   */
  escalationStrategy?: string;
}

/**
 * 优化配置接口
 * 对应Schema: optimization对象
 */
export interface OptimizationConfig {
  /**
   * 优化策略
   * 对应Schema: optimization.strategy
   */
  strategy: OptimizationStrategy;

  /**
   * 优化约束
   * 对应Schema: optimization.constraints
   */
  constraints?: OptimizationConstraints;

  /**
   * 优化参数
   * 对应Schema: optimization.parameters
   */
  parameters?: Record<string, unknown>;
}

/**
 * 优化约束接口
 * 对应Schema: optimization.constraints对象
 */
export interface OptimizationConstraints {
  /**
   * 最大持续时间
   * 对应Schema: constraints.max_duration
   */
  maxDuration?: Duration;

  /**
   * 最大成本
   * 对应Schema: constraints.max_cost
   */
  maxCost?: number;

  /**
   * 最小质量要求
   * 对应Schema: constraints.min_quality
   */
  minQuality?: number;

  /**
   * 可用资源
   * 对应Schema: constraints.available_resources
   */
  availableResources?: Record<string, unknown>;
}

/**
 * 风险评估接口
 * 对应Schema: risk_assessment对象
 */
export interface RiskAssessment {
  /**
   * 整体风险级别
   * 对应Schema: risk_assessment.overall_risk_level
   */
  overallRiskLevel: RiskLevel;

  /**
   * 具体风险列表
   * 对应Schema: risk_assessment.risks
   */
  risks: Risk[];
}

/**
 * 风险接口
 * 对应Schema: risk对象
 */
export interface Risk {
  /**
   * 风险ID
   * 对应Schema: risk.risk_id
   */
  riskId: UUID;

  /**
   * 风险名称
   * 对应Schema: risk.name
   */
  name: string;

  /**
   * 风险描述
   * 对应Schema: risk.description
   */
  description: string;

  /**
   * 风险级别
   * 对应Schema: risk.level
   */
  level: RiskLevel;

  /**
   * 发生概率 (0-1)
   * 对应Schema: risk.probability
   */
  probability: number;

  /**
   * 影响程度 (0-1)
   * 对应Schema: risk.impact
   */
  impact: number;

  /**
   * 缓解措施
   * 对应Schema: risk.mitigation_strategies
   */
  mitigationStrategies?: string[];

  /**
   * 风险元数据
   * 对应Schema: risk.metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * 计划功能配置接口
 * 对应Schema: configuration对象
 */
export interface PlanFeatureConfiguration {
  /**
   * 是否启用自动调度
   * 对应Schema: configuration.auto_scheduling_enabled
   */
  autoSchedulingEnabled?: boolean;

  /**
   * 是否启用依赖验证
   * 对应Schema: configuration.dependency_validation_enabled
   */
  dependencyValidationEnabled?: boolean;

  /**
   * 是否启用风险监控
   * 对应Schema: configuration.risk_monitoring_enabled
   */
  riskMonitoringEnabled?: boolean;

  /**
   * 是否启用失败恢复
   * 对应Schema: configuration.failure_recovery_enabled
   */
  failureRecoveryEnabled?: boolean;

  /**
   * 是否启用性能跟踪
   * 对应Schema: configuration.performance_tracking_enabled
   */
  performanceTrackingEnabled?: boolean;

  /**
   * 通知设置
   * 对应Schema: configuration.notification_settings
   */
  notificationSettings?: NotificationSettings;

  /**
   * 优化设置
   * 对应Schema: configuration.optimization_settings
   */
  optimizationSettings?: OptimizationSettings;

  /**
   * 超时设置
   * 对应Schema: configuration.timeout_settings
   */
  timeoutSettings?: TimeoutSettings;

  /**
   * 并行执行限制
   * 对应Schema: configuration.parallel_execution_limit
   */
  parallelExecutionLimit?: number;
}

/**
 * 通知设置接口
 * 对应Schema: notification_settings对象
 */
export interface NotificationSettings {
  /**
   * 是否启用通知
   * 对应Schema: notification_settings.enabled
   */
  enabled: boolean;

  /**
   * 通知渠道
   * 对应Schema: notification_settings.channels
   */
  channels?: string[];

  /**
   * 通知事件
   * 对应Schema: notification_settings.events
   */
  events?: string[];

  /**
   * 任务完成通知
   * 对应Schema: notification_settings.task_completion
   */
  taskCompletion?: boolean;
}

/**
 * 优化设置接口
 * 对应Schema: optimization_settings对象
 */
export interface OptimizationSettings {
  /**
   * 是否启用优化
   * 对应Schema: optimization_settings.enabled
   */
  enabled: boolean;

  /**
   * 优化策略
   * 对应Schema: optimization_settings.strategy
   */
  strategy: OptimizationStrategy;

  /**
   * 是否自动重新优化
   * 对应Schema: optimization_settings.auto_reoptimize
   */
  autoReoptimize?: boolean;
}

/**
 * 超时设置接口
 * 对应Schema: timeout_settings对象
 */
export interface TimeoutSettings {
  /**
   * 默认任务超时时间（毫秒）
   * 对应Schema: timeout_settings.default_task_timeout_ms
   */
  defaultTaskTimeoutMs?: number;

  /**
   * 计划执行超时时间（毫秒）
   * 对应Schema: timeout_settings.plan_execution_timeout_ms
   */
  planExecutionTimeoutMs?: number;

  /**
   * 依赖解析超时时间（毫秒）
   * 对应Schema: timeout_settings.dependency_resolution_timeout_ms
   */
  dependencyResolutionTimeoutMs?: number;
}

// ===== API数据传输对象 =====

/**
 * 创建计划请求DTO
 * Application层使用camelCase，与Schema的snake_case进行映射
 */
export interface CreatePlanRequest {
  /**
   * 计划名称
   * 对应Schema: name
   */
  name: string;

  /**
   * 关联的上下文ID
   * 对应Schema: context_id
   */
  contextId: UUID;

  /**
   * 计划描述
   * 对应Schema: description
   */
  description?: string;

  /**
   * 计划目标
   * 对应Schema: goals
   */
  goals?: string[];

  /**
   * 优先级
   * 对应Schema: priority
   */
  priority?: Priority;

  /**
   * 执行策略
   * 对应Schema: execution_strategy
   */
  executionStrategy?: ExecutionStrategy;

  /**
   * 预估持续时间
   * 对应Schema: estimated_duration
   */
  estimatedDuration?: Duration;

  /**
   * 计划配置
   * 对应Schema: configuration
   */
  configuration?: PlanFeatureConfiguration;

  /**
   * 扩展元数据
   * 对应Schema: metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * 更新计划请求DTO
 * Application层使用camelCase
 */
export interface UpdatePlanRequest {
  /**
   * 计划名称
   */
  name?: string;

  /**
   * 计划描述
   */
  description?: string;

  /**
   * 计划状态
   */
  status?: PlanStatus;

  /**
   * 优先级
   */
  priority?: Priority;

  /**
   * 计划目标
   */
  goals?: string[];

  /**
   * 执行策略
   */
  executionStrategy?: ExecutionStrategy;

  /**
   * 计划配置
   */
  configuration?: PlanFeatureConfiguration;

  /**
   * 扩展元数据
   */
  metadata?: Record<string, unknown>;
}

// ===== 操作结果类型 =====
// 注意：PlanOperationResult在application/services中已定义
// 这里不重复定义，避免类型冲突

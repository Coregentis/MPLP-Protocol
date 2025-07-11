/**
 * MPLP Plan模块工具函数
 * 
 * Plan模块通用工具和辅助函数
 * 严格按照 plan-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json Schema定义
 * @schema_path src/schemas/plan-protocol.json
 */

import { 
  PlanProtocol,
  PlanStatus,
  PlanTask,
  TaskStatus,
  TaskType,
  PlanDependency,
  DependencyType,
  DependencyCriticality,
  PlanMilestone,
  MilestoneStatus,
  Priority,
  Timeline,
  Duration,
  DurationUnit,
  PlanConfiguration,
  FailureResolver,
  RecoveryStrategy,
  OptimizationStrategy,
  RiskLevel,
  RiskCategory,
  RiskStatus,
  TaskDependencyGraph,
  UUID,
  Timestamp
} from './types';

/**
 * Plan状态转换验证
 */
export function isValidPlanStatusTransition(
  from: PlanStatus,
  to: PlanStatus
): boolean {
  const validTransitions: Record<PlanStatus, PlanStatus[]> = {
    draft: ['approved', 'cancelled'],
    approved: ['active', 'cancelled'],
    active: ['paused', 'completed', 'cancelled', 'failed'],
    paused: ['active', 'cancelled'],
    completed: [], // 完成状态不能转换
    cancelled: [], // 取消状态不能转换
    failed: ['draft', 'cancelled'] // 失败可以重新规划或取消
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Task状态转换验证
 */
export function isValidTaskStatusTransition(
  from: TaskStatus,
  to: TaskStatus
): boolean {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    pending: ['ready', 'blocked', 'skipped'],
    ready: ['running', 'blocked', 'skipped'],
    running: ['completed', 'failed', 'blocked'],
    blocked: ['ready', 'skipped'],
    completed: [], // 完成状态不能转换
    failed: ['pending', 'ready', 'skipped'], // 失败可以重试
    skipped: [] // 跳过状态不能转换
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * 验证Plan配置的完整性
 */
export function validatePlanConfiguration(config: PlanConfiguration): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证notification_settings
  if (config.notification_settings) {
    if (config.notification_settings.enabled) {
      if (!config.notification_settings.channels || config.notification_settings.channels.length === 0) {
        errors.push('notification_settings.channels cannot be empty when notifications are enabled');
      }
      if (!config.notification_settings.events || config.notification_settings.events.length === 0) {
        errors.push('notification_settings.events cannot be empty when notifications are enabled');
      }
    }
  }

  // 验证optimization_settings
  if (config.optimization_settings) {
    const validStrategies: OptimizationStrategy[] = ['time_optimal', 'resource_optimal', 'cost_optimal', 'quality_optimal', 'balanced'];
    if (!validStrategies.includes(config.optimization_settings.strategy)) {
      errors.push(`Invalid optimization strategy: ${config.optimization_settings.strategy}`);
    }
  }

  // 验证timeout_settings
  if (config.timeout_settings) {
    if (config.timeout_settings.default_task_timeout_ms <= 0) {
      errors.push('default_task_timeout_ms must be positive');
    }
    if (config.timeout_settings.plan_execution_timeout_ms <= config.timeout_settings.default_task_timeout_ms) {
      errors.push('plan_execution_timeout_ms must be greater than default_task_timeout_ms');
    }
    if (config.timeout_settings.dependency_resolution_timeout_ms <= 0) {
      errors.push('dependency_resolution_timeout_ms must be positive');
    }
  }

  // 验证parallel_execution_limit
  if (config.parallel_execution_limit <= 0) {
    errors.push('parallel_execution_limit must be positive');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证FailureResolver配置
 */
export function validateFailureResolver(resolver: FailureResolver): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证strategies
  const validStrategies: RecoveryStrategy[] = ['retry', 'rollback', 'skip', 'manual_intervention'];
  if (!resolver.strategies || resolver.strategies.length === 0) {
    errors.push('strategies cannot be empty');
  } else {
    for (const strategy of resolver.strategies) {
      if (!validStrategies.includes(strategy)) {
        errors.push(`Invalid recovery strategy: ${strategy}`);
      }
    }
  }

  // 验证retry_config
  if (resolver.retry_config) {
    if (resolver.retry_config.max_attempts <= 0 || resolver.retry_config.max_attempts > 10) {
      errors.push('retry_config.max_attempts must be between 1 and 10');
    }
    if (resolver.retry_config.delay_ms < 100 || resolver.retry_config.delay_ms > 30000) {
      errors.push('retry_config.delay_ms must be between 100 and 30000');
    }
  }

  // 验证performance_thresholds
  if (resolver.performance_thresholds) {
    if (resolver.performance_thresholds.max_execution_time_ms <= 0) {
      errors.push('performance_thresholds.max_execution_time_ms must be positive');
    }
    if (resolver.performance_thresholds.max_memory_usage_mb <= 0) {
      errors.push('performance_thresholds.max_memory_usage_mb must be positive');
    }
    if (resolver.performance_thresholds.max_cpu_usage_percent <= 0 || resolver.performance_thresholds.max_cpu_usage_percent > 100) {
      errors.push('performance_thresholds.max_cpu_usage_percent must be between 0 and 100');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 创建默认的Plan配置（Schema兼容）
 */
export function createDefaultPlanConfiguration(): PlanConfiguration {
  return {
    auto_scheduling_enabled: true,
    dependency_validation_enabled: true,
    risk_monitoring_enabled: true,
    failure_recovery_enabled: true,
    performance_tracking_enabled: true,
    notification_settings: {
      enabled: false,
      channels: [],
      events: [],
      task_completion: false
    },
    optimization_settings: {
      enabled: false,
      strategy: 'balanced',
      auto_reoptimize: false
    },
    timeout_settings: {
      default_task_timeout_ms: 300000, // 5分钟
      plan_execution_timeout_ms: 3600000, // 1小时
      dependency_resolution_timeout_ms: 30000 // 30秒
    },
    parallel_execution_limit: 5
  };
}

/**
 * 创建默认的失败解决器配置（Schema兼容）
 */
export function createDefaultFailureResolver(): FailureResolver {
  return {
    enabled: true,
    strategies: ['retry', 'rollback', 'skip', 'manual_intervention'],
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
    manual_intervention_config: {
      timeout_ms: 300000, // 5分钟
      escalation_levels: ['team_lead', 'project_manager', 'director'],
      approval_required: true
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
 * 创建默认时间线（Schema兼容）
 */
export function createDefaultTimeline(): Timeline {
  return {
    estimated_duration: {
      value: 1,
      unit: 'days'
    }
  };
}

/**
 * 计算持续时间到毫秒数
 */
export function durationToMilliseconds(duration: Duration): number {
  const multipliers: Record<DurationUnit, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000 // 近似值
  };

  return duration.value * multipliers[duration.unit];
}

/**
 * 从毫秒数创建持续时间
 */
export function millisecondseToDuration(ms: number, preferredUnit: DurationUnit = 'hours'): Duration {
  const multipliers: Record<DurationUnit, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000
  };

  const value = ms / multipliers[preferredUnit];
  
  return {
    value: Math.round(value * 100) / 100, // 保留2位小数
    unit: preferredUnit
  };
}

/**
 * 验证依赖关系不会产生循环
 */
export function validateDependencyGraph(dependencies: PlanDependency[]): {
  valid: boolean;
  cycles: UUID[][];
  errors: string[];
} {
  const errors: string[] = [];
  const cycles: UUID[][] = [];

  // 构建图
  const graph = new Map<UUID, UUID[]>();
  const inDegree = new Map<UUID, number>();
  
  // 初始化图
  for (const dep of dependencies) {
    if (!graph.has(dep.source_task_id)) {
      graph.set(dep.source_task_id, []);
      inDegree.set(dep.source_task_id, 0);
    }
    if (!graph.has(dep.target_task_id)) {
      graph.set(dep.target_task_id, []);
      inDegree.set(dep.target_task_id, 0);
    }
    
    graph.get(dep.source_task_id)!.push(dep.target_task_id);
    inDegree.set(dep.target_task_id, (inDegree.get(dep.target_task_id) || 0) + 1);
  }

  // Kahn算法检测循环
  const queue: UUID[] = [];
  const result: UUID[] = [];

  // 找到所有入度为0的节点
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // 如果拓扑排序的结果不包含所有节点，说明有循环
  const allNodes = Array.from(graph.keys());
  if (result.length !== allNodes.length) {
    const remainingNodes = allNodes.filter(node => !result.includes(node));
    cycles.push(remainingNodes); // 简化的循环检测
    errors.push(`Circular dependency detected involving tasks: ${remainingNodes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    cycles,
    errors
  };
}

/**
 * 计算关键路径
 */
export function calculateCriticalPath(
  tasks: PlanTask[],
  dependencies: PlanDependency[]
): {
  critical_path: UUID[];
  total_duration_ms: number;
  path_tasks: PlanTask[];
} {
  // 简化的关键路径算法
  const taskMap = new Map(tasks.map(task => [task.task_id, task]));
  const graph = new Map<UUID, UUID[]>();
  
  // 构建依赖图
  for (const dep of dependencies) {
    if (!graph.has(dep.source_task_id)) {
      graph.set(dep.source_task_id, []);
    }
    graph.get(dep.source_task_id)!.push(dep.target_task_id);
  }

  // 计算每个任务的最早开始时间和最长路径
  const earliestStart = new Map<UUID, number>();
  const longestPath = new Map<UUID, UUID[]>();

  function calculateEarliestStart(taskId: UUID): number {
    if (earliestStart.has(taskId)) {
      return earliestStart.get(taskId)!;
    }

    let maxEnd = 0;
    const dependencies_of_task = dependencies.filter(dep => dep.target_task_id === taskId);
    
    for (const dep of dependencies_of_task) {
      const predEnd = calculateEarliestStart(dep.source_task_id);
      const predTask = taskMap.get(dep.source_task_id);
      if (predTask?.estimated_effort) {
        const predDuration = predTask.estimated_effort.unit === 'hours' 
          ? predTask.estimated_effort.value * 60 * 60 * 1000
          : predTask.estimated_effort.value * 8 * 60 * 60 * 1000; // 假设1天=8小时
        maxEnd = Math.max(maxEnd, predEnd + predDuration);
      }
    }

    earliestStart.set(taskId, maxEnd);
    return maxEnd;
  }

  // 计算所有任务的最早开始时间
  for (const task of tasks) {
    calculateEarliestStart(task.task_id);
  }

  // 找到关键路径（最长路径）
  let maxDuration = 0;
  let criticalPath: UUID[] = [];
  
  for (const task of tasks) {
    const start = earliestStart.get(task.task_id) || 0;
    const duration = task.estimated_effort?.unit === 'hours'
      ? task.estimated_effort.value * 60 * 60 * 1000
      : (task.estimated_effort?.value || 1) * 8 * 60 * 60 * 1000;
    const totalTime = start + duration;
    
    if (totalTime > maxDuration) {
      maxDuration = totalTime;
      criticalPath = [task.task_id]; // 简化：只返回最耗时的任务
    }
  }

  const pathTasks = criticalPath.map(id => taskMap.get(id)!).filter(Boolean);

  return {
    critical_path: criticalPath,
    total_duration_ms: maxDuration,
    path_tasks: pathTasks
  };
}

/**
 * 验证UUID格式
 */
export function isValidUUID(uuid: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
}

/**
 * 验证ISO 8601时间戳格式
 */
export function isValidTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return date.toISOString() === timestamp;
  } catch {
    return false;
  }
}

/**
 * 验证Plan名称格式
 */
export function validatePlanName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name must be a non-empty string' };
  }

  if (name.length < 1 || name.length > 255) {
    return { valid: false, error: 'Name must be between 1 and 255 characters' };
  }

  return { valid: true };
}

/**
 * 计算Plan对象的内存使用量（字节）
 */
export function calculatePlanMemoryUsage(plan: PlanProtocol): number {
  try {
    const jsonString = JSON.stringify(plan);
    return jsonString.length * 2; // UTF-16字符占用2字节
  } catch (error) {
    // 如果序列化失败，返回估算值
    const taskCount = plan.tasks.length;
    const dependencyCount = plan.dependencies.length;
    const milestoneCount = plan.milestones.length;
    
    return 1024 + taskCount * 512 + dependencyCount * 256 + milestoneCount * 256; // 估算值
  }
}

/**
 * 生成Plan摘要信息
 */
export function generatePlanSummary(plan: PlanProtocol): {
  id: string;
  name: string;
  status: string;
  priority: string;
  tasks_count: number;
  completed_tasks: number;
  dependencies_count: number;
  milestones_count: number;
  estimated_duration_ms: number;
  memory_usage_bytes: number;
  risk_level?: string;
} {
  const completedTasks = plan.tasks.filter(task => task.status === 'completed').length;
  const estimatedDurationMs = durationToMilliseconds(plan.timeline.estimated_duration);

  return {
    id: plan.plan_id,
    name: plan.name,
    status: plan.status,
    priority: plan.priority,
    tasks_count: plan.tasks.length,
    completed_tasks: completedTasks,
    dependencies_count: plan.dependencies.length,
    milestones_count: plan.milestones.length,
    estimated_duration_ms: estimatedDurationMs,
    memory_usage_bytes: calculatePlanMemoryUsage(plan),
    risk_level: plan.risk_assessment?.overall_risk_level
  };
}

/**
 * 清理敏感信息用于日志记录
 */
export function sanitizeForLogging(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'credential',
      'auth', 'authorization', 'private', 'confidential'
    ];
    
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * 深度克隆Plan对象
 */
export function clonePlan(plan: PlanProtocol): PlanProtocol {
  try {
    return JSON.parse(JSON.stringify(plan));
  } catch (error) {
    throw new Error(`Failed to clone plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 合并两个Plan配置
 */
export function mergePlanConfigurations(
  base: PlanConfiguration,
  updates: Partial<PlanConfiguration>
): PlanConfiguration {
  return {
    ...base,
    ...updates,
    notification_settings: {
      ...base.notification_settings,
      ...updates.notification_settings
    },
    optimization_settings: {
      ...base.optimization_settings,
      ...updates.optimization_settings
    },
    timeout_settings: {
      ...base.timeout_settings,
      ...updates.timeout_settings
    }
  };
} 
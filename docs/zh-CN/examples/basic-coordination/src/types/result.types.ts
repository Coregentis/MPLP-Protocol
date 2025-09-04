/**
 * MPLP基础协调示例类型定义
 *
 * 基于MPLP v1.0 Alpha实际Schema的多智能体协调示例
 * 使用Context + Plan + Trace模块展示协调功能
 * 遵循双重命名约定：Schema层(snake_case) ↔ TypeScript层(camelCase)
 *
 * @author MPLP Community
 * @version 1.0.0-alpha
 */

// ===== 基于实际MPLP Schema的类型定义 =====
// 参考: src/schemas/core-modules/mplp-context.json
// 参考: src/schemas/core-modules/mplp-plan.json
// 参考: src/schemas/core-modules/mplp-trace.json

// ===== MPLP Context相关类型 (基于mplp-context.json) =====

/**
 * MPLP上下文信息 (TypeScript层 - camelCase)
 * 对应Schema: mplp-context.json
 */
export interface MPLPContext {
  /** 协议版本 - Schema: protocol_version */
  protocolVersion: string;

  /** 时间戳 */
  timestamp: string;

  /** 上下文ID - Schema: context_id */
  contextId: string;

  /** 上下文名称 */
  name: string;

  /** 描述 */
  description?: string;

  /** 状态 */
  status: 'active' | 'inactive' | 'completed' | 'failed';

  /** 参与者列表 */
  participants: string[];

  /** 目标列表 */
  goals: Array<{
    name: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  }>;
}

// ===== MPLP Plan相关类型 (基于mplp-plan.json) =====

/**
 * MPLP计划信息 (TypeScript层 - camelCase)
 * 对应Schema: mplp-plan.json
 */
export interface MPLPPlan {
  /** 协议版本 - Schema: protocol_version */
  protocolVersion: string;

  /** 时间戳 */
  timestamp: string;

  /** 计划ID - Schema: plan_id */
  planId: string;

  /** 关联的上下文ID - Schema: context_id */
  contextId: string;

  /** 计划名称 */
  name: string;

  /** 描述 */
  description?: string;

  /** 状态 */
  status: 'draft' | 'active' | 'completed' | 'failed' | 'cancelled';

  /** 任务列表 */
  tasks: Array<{
    /** 任务ID - Schema: task_id */
    taskId: string;
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    /** 依赖任务 - Schema: dependencies */
    dependencies: string[];
    /** 估计持续时间 - Schema: estimated_duration */
    estimatedDuration?: number;
  }>;
}

// ===== MPLP Trace相关类型 (基于mplp-trace.json) =====

/**
 * MPLP追踪信息 (TypeScript层 - camelCase)
 * 对应Schema: mplp-trace.json
 */
export interface MPLPTrace {
  /** 协议版本 - Schema: protocol_version */
  protocolVersion: string;

  /** 时间戳 */
  timestamp: string;

  /** 追踪ID - Schema: trace_id */
  traceId: string;

  /** 关联的上下文ID - Schema: context_id */
  contextId?: string;

  /** 关联的计划ID - Schema: plan_id */
  planId?: string;

  /** 执行步骤 */
  steps: Array<{
    /** 步骤ID - Schema: step_id */
    stepId: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    /** 开始时间 - Schema: start_time */
    startTime: string;
    /** 结束时间 - Schema: end_time */
    endTime?: string;
    /** 执行时间(毫秒) - Schema: execution_time_ms */
    executionTimeMs?: number;
    result?: any;
    error?: string;
  }>;
}

// ===== 协调示例结果类型 =====

/**
 * 协调执行结果 (基于MPLP协调功能)
 */
export interface CoordinationResult {
  /** 执行统计 */
  statistics: {
    /** 总任务数 */
    totalTasks: number;
    /** 成功完成的任务数 */
    completedTasks: number;
    /** 失败的任务数 */
    failedTasks: number;
    /** 总执行时间 */
    totalExecutionTime: string;
    /** 平均任务时间 */
    averageTaskTime: string;
  };

  /** 结果摘要 */
  summary: {
    /** 上下文创建结果 */
    contextCreated: boolean;
    /** 计划创建结果 */
    planCreated: boolean;
    /** 追踪启动结果 */
    traceStarted: boolean;
    /** 任务执行结果 */
    tasksExecuted: number;
  };

  /** 详细执行步骤 */
  steps: Array<{
    stepName: string;
    status: 'success' | 'failed' | 'skipped';
    executionTime: number;
    result?: any;
    error?: string;
  }>;

  /** 性能指标 */
  performance?: {
    /** 协调效率 */
    coordinationEfficiency: number;
    /** 资源利用率 */
    resourceUtilization: number;
    /** 平均响应时间 */
    averageResponseTime: number;
  };
}

// ===== MPLP相关枚举 =====

/**
 * MPLP协议状态枚举
 */
export enum MPLPStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 优先级枚举 (基于MPLP Schema)
 */
export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * 协调类型枚举
 */
export enum CoordinationType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  MIXED = 'mixed'
}

/**
 * 模块类型枚举
 */
export enum ModuleType {
  CONTEXT = 'context',
  PLAN = 'plan',
  TRACE = 'trace',
  CONFIRM = 'confirm',
  ROLE = 'role',
  EXTENSION = 'extension',
  CORE = 'core',
  COLLAB = 'collab',
  DIALOG = 'dialog',
  NETWORK = 'network'
}

// ===== 协调配置接口 =====

/**
 * MPLP协调配置接口
 */
export interface CoordinationConfig {
  /** 最大并发任务数 */
  maxConcurrency: number;

  /** 任务超时时间（毫秒） */
  timeout: number;

  /** 重试次数 */
  retryAttempts: number;

  /** 重试延迟（毫秒） */
  retryDelay: number;

  /** 是否启用详细日志 */
  verboseLogging: boolean;

  /** 协调类型 */
  coordinationType: CoordinationType;

  /** 性能监控配置 */
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      memoryUsage: number;
    };
  };
}

/**
 * 协调参与者状态接口
 */
export interface ParticipantStatus {
  /** 参与者ID */
  participantId: string;

  /** 参与者类型 */
  type: ModuleType;

  /** 当前状态 */
  status: 'idle' | 'busy' | 'error' | 'offline';

  /** 当前任务ID */
  currentTaskId?: string;

  /** 处理的任务数量 */
  processedTasks: number;

  /** 错误计数 */
  errorCount: number;

  /** 最后活动时间 */
  lastActivity: Date;

  /** 性能指标 */
  performance: {
    averageProcessingTime: number;
    successRate: number;
    throughput: number;
  };
}

/**
 * 系统健康状态接口
 */
export interface SystemHealth {
  /** 整体状态 */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** 活跃智能体数量 */
  activeAgents: number;
  
  /** 待处理任务数量 */
  pendingTasks: number;
  
  /** 系统负载 */
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
  
  /** 错误率 */
  errorRate: number;
  
  /** 平均响应时间 */
  averageResponseTime: number;
  
  /** 最后检查时间 */
  lastCheck: Date;
}

/**
 * 事件接口
 */
export interface ProcessingEvent {
  /** 事件ID */
  eventId: string;
  
  /** 事件类型 */
  type: 'task_started' | 'task_completed' | 'task_failed' | 'agent_status_changed' | 'system_alert';
  
  /** 事件时间戳 */
  timestamp: Date;
  
  /** 相关的智能体ID */
  agentId?: string;
  
  /** 相关的任务ID */
  taskId?: string;
  
  /** 事件数据 */
  data: Record<string, any>;
  
  /** 事件严重程度 */
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// ===== 类型守卫函数 =====

/**
 * MPLP上下文类型守卫
 */
export function isMPLPContext(obj: any): obj is MPLPContext {
  return obj &&
    typeof obj.protocolVersion === 'string' &&
    typeof obj.contextId === 'string' &&
    typeof obj.name === 'string' &&
    ['active', 'inactive', 'completed', 'failed'].includes(obj.status);
}

/**
 * MPLP计划类型守卫
 */
export function isMPLPPlan(obj: any): obj is MPLPPlan {
  return obj &&
    typeof obj.planId === 'string' &&
    typeof obj.contextId === 'string' &&
    typeof obj.name === 'string' &&
    ['draft', 'active', 'completed', 'failed', 'cancelled'].includes(obj.status) &&
    Array.isArray(obj.tasks);
}

/**
 * MPLP追踪类型守卫
 */
export function isMPLPTrace(obj: any): obj is MPLPTrace {
  return obj &&
    typeof obj.traceId === 'string' &&
    Array.isArray(obj.steps);
}

/**
 * 协调结果类型守卫
 */
export function isCoordinationResult(obj: any): obj is CoordinationResult {
  return obj &&
    obj.statistics &&
    obj.summary &&
    Array.isArray(obj.steps);
}

/**
 * 参与者状态类型守卫
 */
export function isParticipantStatus(obj: any): obj is ParticipantStatus {
  return obj &&
    typeof obj.participantId === 'string' &&
    Object.values(ModuleType).includes(obj.type) &&
    ['idle', 'busy', 'error', 'offline'].includes(obj.status);
}

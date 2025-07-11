/**
 * MPLP Context模块工具函数
 * 
 * Context模块通用工具和辅助函数
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

import { 
  ContextProtocol,
  ContextStatus,
  ContextLifecycleStage,
  ContextConfiguration,
  SharedState,
  AccessControl,
  ContextOwner,
  ContextPermission,
  ContextAction,
  UUID,
  Timestamp
} from './types';

/**
 * Context状态转换验证
 */
export function isValidStatusTransition(
  from: ContextStatus,
  to: ContextStatus
): boolean {
  const validTransitions: Record<ContextStatus, ContextStatus[]> = {
    active: ['suspended', 'completed', 'terminated'],
    suspended: ['active', 'terminated'],
    completed: [], // 完成状态不能转换
    terminated: [] // 终止状态不能转换
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Context生命周期阶段转换验证
 */
export function isValidLifecycleTransition(
  from: ContextLifecycleStage,
  to: ContextLifecycleStage
): boolean {
  const validTransitions: Record<ContextLifecycleStage, ContextLifecycleStage[]> = {
    planning: ['executing', 'completed'],
    executing: ['monitoring', 'completed'],
    monitoring: ['executing', 'completed'],
    completed: [] // 完成阶段不能转换
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * 验证Context配置的完整性
 */
export function validateContextConfiguration(config: ContextConfiguration): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证超时设置
  if (!config.timeout_settings) {
    errors.push('Missing timeout_settings');
  } else {
    if (config.timeout_settings.default_timeout <= 0) {
      errors.push('default_timeout must be positive');
    }
    if (config.timeout_settings.max_timeout <= config.timeout_settings.default_timeout) {
      errors.push('max_timeout must be greater than default_timeout');
    }
    // 修复可能为undefined的属性访问
    if (config.timeout_settings.cleanup_timeout !== undefined && config.timeout_settings.cleanup_timeout <= 0) {
      errors.push('cleanup_timeout must be positive');
    }
  }

  // 验证持久化设置
  if (!config.persistence) {
    errors.push('Missing persistence settings');
  } else {
    const validBackends = ['database', 'file', 'memory', 'redis'];
    if (!validBackends.includes(config.persistence.storage_backend)) {
      errors.push(`Invalid storage_backend: ${config.persistence.storage_backend}`);
    }
    
    if (config.persistence.retention_policy) {
      if (!config.persistence.retention_policy.duration) {
        errors.push('Missing retention_policy.duration');
      }
      // 修复可能为undefined的属性访问
      if (config.persistence.retention_policy.max_versions !== undefined && config.persistence.retention_policy.max_versions <= 0) {
        errors.push('max_versions must be positive');
      }
    }
  }

  // 验证通知设置
  if (config.notification_settings && config.notification_settings.enabled) {
    if (!config.notification_settings.channels || config.notification_settings.channels.length === 0) {
      errors.push('notification_settings.channels cannot be empty when notifications are enabled');
    }
    if (!config.notification_settings.events || config.notification_settings.events.length === 0) {
      errors.push('notification_settings.events cannot be empty when notifications are enabled');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 计算Context对象的内存使用量（字节）
 */
export function calculateContextMemoryUsage(context: ContextProtocol): number {
  try {
    const jsonString = JSON.stringify(context);
    return jsonString.length * 2; // UTF-16字符占用2字节
  } catch (error) {
    // 如果序列化失败，返回估算值
    return 1024; // 1KB 估算值
  }
}

/**
 * 计算SharedState的内存使用量（字节）
 */
export function calculateSharedStateMemoryUsage(sharedState: SharedState): number {
  try {
    const variablesSize = JSON.stringify(sharedState.variables).length * 2;
    const resourcesSize = JSON.stringify(sharedState.resources).length * 2;
    const dependenciesSize = JSON.stringify(sharedState.dependencies).length * 2;
    const goalsSize = JSON.stringify(sharedState.goals).length * 2;
    
    return variablesSize + resourcesSize + dependenciesSize + goalsSize;
  } catch (error) {
    return Object.keys(sharedState.variables).length * 50 + 
           sharedState.dependencies.length * 100 + 
           sharedState.goals.length * 100;
  }
}

/**
 * 检查Context是否接近超时
 */
export function isContextNearTimeout(
  context: ContextProtocol,
  warningThresholdSeconds: number = 300
): boolean {
  if (!context.configuration.timeout_settings) {
    return false;
  }

  const createdAt = new Date(context.timestamp);
  const timeoutSeconds = context.configuration.timeout_settings.default_timeout;
  const expiresAt = new Date(createdAt.getTime() + timeoutSeconds * 1000);
  const warningTime = new Date(expiresAt.getTime() - warningThresholdSeconds * 1000);
  
  return new Date() >= warningTime;
}

/**
 * 检查用户是否具有特定权限
 */
export function hasPermission(
  accessControl: AccessControl,
  userId: string,
  resource: string,
  action: ContextAction // 修复：使用正确的ContextAction类型
): boolean {
  // 检查拥有者权限
  if (accessControl.owner.user_id === userId) {
    return true;
  }

  // 检查显式权限
  for (const permission of accessControl.permissions) {
    if (permission.principal === userId && 
        (permission.resource === '*' || permission.resource === resource) &&
        permission.actions.includes(action)) {
      return true;
    }
  }

  return false;
}

/**
 * 验证操作权限（重载版本，支持string类型action）
 */
export function hasPermissionForAction(
  accessControl: AccessControl,
  userId: string,
  resource: string,
  action: string
): boolean {
  // 验证action是否为有效的ContextAction
  const validActions: ContextAction[] = ['read', 'write', 'execute', 'delete', 'admin'];
  if (!validActions.includes(action as ContextAction)) {
    return false;
  }
  
  return hasPermission(accessControl, userId, resource, action as ContextAction);
}

/**
 * 格式化操作时间
 */
export function formatOperationTime(timeMs: number): string {
  if (timeMs < 1) {
    return `${(timeMs * 1000).toFixed(0)}μs`;
  } else if (timeMs < 1000) {
    return `${timeMs.toFixed(2)}ms`;
  } else {
    return `${(timeMs / 1000).toFixed(2)}s`;
  }
}

/**
 * 生成Context摘要信息
 */
export function generateContextSummary(context: ContextProtocol): {
  id: string;
  name: string;
  status: string;
  stage: string;
  created: string;
  variables_count: number;
  goals_count: number;
  dependencies_count: number;
  memory_usage_bytes: number;
  timeout_in_seconds?: number;
} {
  return {
    id: context.context_id,
    name: context.name,
    status: context.status,
    stage: context.lifecycle_stage,
    created: context.timestamp,
    variables_count: Object.keys(context.shared_state.variables).length,
    goals_count: context.shared_state.goals.length,
    dependencies_count: context.shared_state.dependencies.length,
    memory_usage_bytes: calculateContextMemoryUsage(context),
    timeout_in_seconds: context.configuration.timeout_settings?.default_timeout
  };
}

/**
 * 创建性能报告
 */
export function createPerformanceReport(
  operationTimes: number[],
  operationType: string,
  targetTimeMs: number = 50
): {
  operation_type: string;
  total_operations: number;
  avg_time_ms: number;
  min_time_ms: number;
  max_time_ms: number;
  p95_time_ms: number;
  p99_time_ms: number;
  target_compliance: boolean;
  performance_grade: 'A' | 'B' | 'C' | 'D' | 'F';
} {
  if (operationTimes.length === 0) {
    return {
      operation_type: operationType,
      total_operations: 0,
      avg_time_ms: 0,
      min_time_ms: 0,
      max_time_ms: 0,
      p95_time_ms: 0,
      p99_time_ms: 0,
      target_compliance: true,
      performance_grade: 'A'
    };
  }

  const sortedTimes = [...operationTimes].sort((a, b) => a - b);
  const total = operationTimes.length;
  const sum = operationTimes.reduce((a, b) => a + b, 0);
  
  const avg = sum / total;
  const min = sortedTimes[0];
  const max = sortedTimes[total - 1];
  const p95 = sortedTimes[Math.floor(total * 0.95)];
  const p99 = sortedTimes[Math.floor(total * 0.99)];

  const targetCompliance = p95 <= targetTimeMs;
  
  // 性能等级评定
  let performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (p95 <= targetTimeMs * 0.5) performanceGrade = 'A';
  else if (p95 <= targetTimeMs) performanceGrade = 'B';
  else if (p95 <= targetTimeMs * 2) performanceGrade = 'C';
  else if (p95 <= targetTimeMs * 5) performanceGrade = 'D';
  else performanceGrade = 'F';

  return {
    operation_type: operationType,
    total_operations: total,
    avg_time_ms: parseFloat(avg.toFixed(2)),
    min_time_ms: parseFloat(min.toFixed(2)),
    max_time_ms: parseFloat(max.toFixed(2)),
    p95_time_ms: parseFloat(p95.toFixed(2)),
    p99_time_ms: parseFloat(p99.toFixed(2)),
    target_compliance: targetCompliance,
    performance_grade: performanceGrade
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
    // 敏感字段列表
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
 * 创建空的SharedState对象
 */
export function createEmptySharedState(): SharedState {
  return {
    variables: {},
    resources: {
      allocated: {},
      requirements: {}
    },
    dependencies: [],
    goals: []
  };
}

/**
 * 合并两个SharedState对象
 */
export function mergeSharedStates(base: SharedState, updates: Partial<SharedState>): SharedState {
  return {
    variables: {
      ...base.variables,
      ...updates.variables
    },
    resources: {
      allocated: {
        ...base.resources.allocated,
        ...updates.resources?.allocated
      },
      requirements: {
        ...base.resources.requirements,
        ...updates.resources?.requirements
      }
    },
    dependencies: updates.dependencies ?? base.dependencies,
    goals: updates.goals ?? base.goals
  };
}

/**
 * 深度克隆Context对象
 */
export function cloneContext(context: ContextProtocol): ContextProtocol {
  try {
    return JSON.parse(JSON.stringify(context));
  } catch (error) {
    throw new Error(`Failed to clone context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 验证Context名称格式
 */
export function validateContextName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name must be a non-empty string' };
  }

  if (name.length < 1 || name.length > 255) {
    return { valid: false, error: 'Name must be between 1 and 255 characters' };
  }

  // 检查特殊字符
  const validNamePattern = /^[a-zA-Z0-9\s\-_\.]+$/;
  if (!validNamePattern.test(name)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
} 
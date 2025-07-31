/**
 * 工作流上下文接口
 * @description 定义工作流上下文的详细接口和类型
 * @author MPLP Team
 * @version 1.0.1
 */

import { WorkflowStageType, WorkflowPriority } from '../workflow-types';

/**
 * 工作流上下文接口
 */
export interface IWorkflowContext {
  workflow_id?: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  priority?: WorkflowPriority;
  metadata?: Record<string, any>;
  stage_results?: Record<WorkflowStageType, any>;
  variables?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * 扩展的工作流上下文接口
 */
export interface IExtendedWorkflowContext extends IWorkflowContext {
  definition_id?: string;
  parent_workflow_id?: string;
  child_workflow_ids?: string[];
  tags?: string[];
  environment?: string;
  version?: string;
  timeout?: number;
  retry_policy?: RetryPolicy;
  notifications?: NotificationConfig[];
  security_context?: SecurityContext;
  performance_metrics?: PerformanceMetrics;
}

/**
 * 重试策略
 */
export interface RetryPolicy {
  max_attempts: number;
  initial_delay: number;
  max_delay: number;
  backoff_factor: number;
  retry_on_errors?: string[];
  stop_on_errors?: string[];
}

/**
 * 通知配置
 */
export interface NotificationConfig {
  type: 'email' | 'sms' | 'webhook' | 'slack';
  recipients: string[];
  events: string[];
  template?: string;
  enabled: boolean;
}

/**
 * 安全上下文
 */
export interface SecurityContext {
  user_roles: string[];
  permissions: string[];
  access_token?: string;
  tenant_id?: string;
  security_level: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  start_time?: string;
  end_time?: string;
  duration?: number;
  memory_usage?: number;
  cpu_usage?: number;
  network_calls?: number;
  database_queries?: number;
  cache_operations?: number;
  stage_durations?: Record<WorkflowStageType, number>;
}

/**
 * 工作流上下文构建器
 */
export class WorkflowContextBuilder {
  private context: IExtendedWorkflowContext = {};

  static create(): WorkflowContextBuilder {
    return new WorkflowContextBuilder();
  }

  withWorkflowId(workflow_id: string): WorkflowContextBuilder {
    this.context.workflow_id = workflow_id;
    return this;
  }

  withUserId(user_id: string): WorkflowContextBuilder {
    this.context.user_id = user_id;
    return this;
  }

  withSessionId(session_id: string): WorkflowContextBuilder {
    this.context.session_id = session_id;
    return this;
  }

  withRequestId(request_id: string): WorkflowContextBuilder {
    this.context.request_id = request_id;
    return this;
  }

  withPriority(priority: WorkflowPriority): WorkflowContextBuilder {
    this.context.priority = priority;
    return this;
  }

  withMetadata(metadata: Record<string, any>): WorkflowContextBuilder {
    this.context.metadata = { ...this.context.metadata, ...metadata };
    return this;
  }

  withVariable(key: string, value: any): WorkflowContextBuilder {
    if (!this.context.variables) {
      this.context.variables = {};
    }
    this.context.variables[key] = value;
    return this;
  }

  withVariables(variables: Record<string, any>): WorkflowContextBuilder {
    this.context.variables = { ...this.context.variables, ...variables };
    return this;
  }

  withDefinitionId(definition_id: string): WorkflowContextBuilder {
    this.context.definition_id = definition_id;
    return this;
  }

  withParentWorkflowId(parent_workflow_id: string): WorkflowContextBuilder {
    this.context.parent_workflow_id = parent_workflow_id;
    return this;
  }

  withTags(tags: string[]): WorkflowContextBuilder {
    this.context.tags = [...(this.context.tags || []), ...tags];
    return this;
  }

  withEnvironment(environment: string): WorkflowContextBuilder {
    this.context.environment = environment;
    return this;
  }

  withTimeout(timeout: number): WorkflowContextBuilder {
    this.context.timeout = timeout;
    return this;
  }

  withRetryPolicy(retry_policy: RetryPolicy): WorkflowContextBuilder {
    this.context.retry_policy = retry_policy;
    return this;
  }

  withSecurityContext(security_context: SecurityContext): WorkflowContextBuilder {
    this.context.security_context = security_context;
    return this;
  }

  build(): IExtendedWorkflowContext {
    const now = new Date().toISOString();
    return {
      ...this.context,
      created_at: this.context.created_at || now,
      updated_at: now
    };
  }
}

/**
 * 工作流上下文验证器
 */
export class WorkflowContextValidator {
  /**
   * 验证基础上下文
   */
  static validateBasic(context: IWorkflowContext): ValidationResult {
    const errors: string[] = [];

    if (!context.workflow_id) {
      errors.push('workflow_id is required');
    }

    if (context.priority && !Object.values(WorkflowPriority).includes(context.priority)) {
      errors.push('invalid priority value');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证扩展上下文
   */
  static validateExtended(context: IExtendedWorkflowContext): ValidationResult {
    const basicResult = this.validateBasic(context);
    const errors = [...basicResult.errors];

    if (context.timeout && context.timeout <= 0) {
      errors.push('timeout must be positive');
    }

    if (context.retry_policy) {
      const retryErrors = this.validateRetryPolicy(context.retry_policy);
      errors.push(...retryErrors);
    }

    if (context.security_context) {
      const securityErrors = this.validateSecurityContext(context.security_context);
      errors.push(...securityErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 验证重试策略
   */
  private static validateRetryPolicy(policy: RetryPolicy): string[] {
    const errors: string[] = [];

    if (policy.max_attempts <= 0) {
      errors.push('max_attempts must be positive');
    }

    if (policy.initial_delay < 0) {
      errors.push('initial_delay must be non-negative');
    }

    if (policy.max_delay < policy.initial_delay) {
      errors.push('max_delay must be greater than or equal to initial_delay');
    }

    if (policy.backoff_factor <= 0) {
      errors.push('backoff_factor must be positive');
    }

    return errors;
  }

  /**
   * 验证安全上下文
   */
  private static validateSecurityContext(context: SecurityContext): string[] {
    const errors: string[] = [];

    if (!context.user_roles || context.user_roles.length === 0) {
      errors.push('user_roles cannot be empty');
    }

    if (!context.permissions || context.permissions.length === 0) {
      errors.push('permissions cannot be empty');
    }

    const validSecurityLevels = ['low', 'medium', 'high', 'critical'];
    if (!validSecurityLevels.includes(context.security_level)) {
      errors.push('invalid security_level');
    }

    return errors;
  }
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 工作流上下文工具类
 */
export class WorkflowContextUtils {
  /**
   * 合并上下文
   */
  static merge(base: IWorkflowContext, override: Partial<IWorkflowContext>): IWorkflowContext {
    return {
      ...base,
      ...override,
      metadata: { ...base.metadata, ...override.metadata },
      variables: { ...base.variables, ...override.variables },
      stage_results: { ...base.stage_results, ...override.stage_results } as Record<WorkflowStageType, any>,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * 克隆上下文
   */
  static clone(context: IWorkflowContext): IWorkflowContext {
    return JSON.parse(JSON.stringify(context));
  }

  /**
   * 提取敏感信息
   */
  static sanitize(context: IWorkflowContext): IWorkflowContext {
    const sanitized = this.clone(context);
    
    // 移除敏感字段
    if (sanitized.metadata) {
      delete sanitized.metadata.password;
      delete sanitized.metadata.token;
      delete sanitized.metadata.secret;
      delete sanitized.metadata.api_key;
    }

    return sanitized;
  }

  /**
   * 获取上下文摘要
   */
  static getSummary(context: IWorkflowContext): ContextSummary {
    return {
      workflow_id: context.workflow_id || 'unknown',
      user_id: context.user_id,
      priority: context.priority || WorkflowPriority.NORMAL,
      stage_count: context.stage_results ? Object.keys(context.stage_results).length : 0,
      variable_count: context.variables ? Object.keys(context.variables).length : 0,
      metadata_count: context.metadata ? Object.keys(context.metadata).length : 0,
      created_at: context.created_at,
      updated_at: context.updated_at
    };
  }
}

/**
 * 上下文摘要接口
 */
export interface ContextSummary {
  workflow_id: string;
  user_id?: string;
  priority: WorkflowPriority;
  stage_count: number;
  variable_count: number;
  metadata_count: number;
  created_at?: string;
  updated_at?: string;
}

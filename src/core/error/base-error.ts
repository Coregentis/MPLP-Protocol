/**
 * 基础错误类
 * @description 定义MPLP系统的基础错误类和相关工具
 * @author MPLP Team
 * @version 1.0.1
 */

import { 
  IError, 
  ErrorType, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext 
} from '../../interfaces/error-handling.interface';

/**
 * MPLP基础错误类
 */
export class MPLPError extends Error implements IError {
  public readonly code: string;
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly timestamp: string;
  public readonly correlation_id?: string;
  public readonly user_id?: string;
  public readonly session_id?: string;
  public readonly request_id?: string;
  public readonly details?: Record<string, any>;
  public readonly inner_error?: IError;
  public readonly context?: ErrorContext;
  public readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SERVER,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
      details?: Record<string, any>;
      inner_error?: IError;
      context?: ErrorContext;
      retryable?: boolean;
    } = {}
  ) {
    super(message);
    
    this.name = 'MPLPError';
    this.code = code;
    this.type = type;
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date().toISOString();
    this.correlation_id = options.correlation_id;
    this.user_id = options.user_id;
    this.session_id = options.session_id;
    this.request_id = options.request_id;
    this.details = options.details;
    this.inner_error = options.inner_error;
    this.context = options.context;
    this.retryable = options.retryable ?? false;

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MPLPError);
    }
  }

  /**
   * 转换为JSON对象
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      type: this.type,
      severity: this.severity,
      category: this.category,
      timestamp: this.timestamp,
      correlation_id: this.correlation_id,
      user_id: this.user_id,
      session_id: this.session_id,
      request_id: this.request_id,
      details: this.details,
      inner_error: this.inner_error,
      context: this.context,
      retryable: this.retryable,
      stack: this.stack
    };
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  /**
   * 检查是否为特定类型的错误
   */
  isType(type: ErrorType): boolean {
    return this.type === type;
  }

  /**
   * 检查是否为特定严重级别
   */
  isSeverity(severity: ErrorSeverity): boolean {
    return this.severity === severity;
  }

  /**
   * 检查是否为特定分类
   */
  isCategory(category: ErrorCategory): boolean {
    return this.category === category;
  }

  /**
   * 添加上下文信息
   */
  withContext(context: Partial<ErrorContext>): MPLPError {
    const newContext: ErrorContext = {
      module: this.context?.module || 'unknown',
      component: this.context?.component || 'unknown',
      operation: this.context?.operation || 'unknown',
      version: this.context?.version || '1.0.0',
      environment: this.context?.environment || 'development',
      metadata: this.context?.metadata,
      ...context
    };

    return new MPLPError(
      this.code,
      this.message,
      this.type,
      this.severity,
      this.category,
      {
        correlation_id: this.correlation_id,
        user_id: this.user_id,
        session_id: this.session_id,
        request_id: this.request_id,
        details: this.details,
        inner_error: this.inner_error,
        context: newContext,
        retryable: this.retryable
      }
    );
  }

  /**
   * 添加详细信息
   */
  withDetails(details: Record<string, any>): MPLPError {
    const newDetails = { ...this.details, ...details };
    return new MPLPError(
      this.code,
      this.message,
      this.type,
      this.severity,
      this.category,
      {
        correlation_id: this.correlation_id,
        user_id: this.user_id,
        session_id: this.session_id,
        request_id: this.request_id,
        details: newDetails,
        inner_error: this.inner_error,
        context: this.context,
        retryable: this.retryable
      }
    );
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends MPLPError {
  constructor(
    message: string,
    field?: string,
    value?: any,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'VALIDATION_ERROR',
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      ErrorCategory.CLIENT,
      {
        ...options,
        details: { field, value },
        retryable: false
      }
    );
    this.name = 'ValidationError';
  }
}

/**
 * 认证错误类
 */
export class AuthenticationError extends MPLPError {
  constructor(
    message: string = 'Authentication failed',
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'AUTHENTICATION_ERROR',
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.MEDIUM,
      ErrorCategory.SECURITY,
      {
        ...options,
        retryable: false
      }
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * 授权错误类
 */
export class AuthorizationError extends MPLPError {
  constructor(
    message: string = 'Access denied',
    resource?: string,
    action?: string,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'AUTHORIZATION_ERROR',
      message,
      ErrorType.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      ErrorCategory.SECURITY,
      {
        ...options,
        details: { resource, action },
        retryable: false
      }
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * 资源未找到错误类
 */
export class NotFoundError extends MPLPError {
  constructor(
    resource: string,
    id?: string,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'NOT_FOUND_ERROR',
      `${resource}${id ? ` with id '${id}'` : ''} not found`,
      ErrorType.NOT_FOUND,
      ErrorSeverity.LOW,
      ErrorCategory.CLIENT,
      {
        ...options,
        details: { resource, id },
        retryable: false
      }
    );
    this.name = 'NotFoundError';
  }
}

/**
 * 冲突错误类
 */
export class ConflictError extends MPLPError {
  constructor(
    message: string,
    resource?: string,
    conflictingValue?: any,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'CONFLICT_ERROR',
      message,
      ErrorType.CONFLICT,
      ErrorSeverity.MEDIUM,
      ErrorCategory.CLIENT,
      {
        ...options,
        details: { resource, conflictingValue },
        retryable: false
      }
    );
    this.name = 'ConflictError';
  }
}

/**
 * 速率限制错误类
 */
export class RateLimitError extends MPLPError {
  constructor(
    limit: number,
    window: string,
    retryAfter?: number,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'RATE_LIMIT_ERROR',
      `Rate limit exceeded: ${limit} requests per ${window}`,
      ErrorType.RATE_LIMIT,
      ErrorSeverity.LOW,
      ErrorCategory.CLIENT,
      {
        ...options,
        details: { limit, window, retryAfter },
        retryable: true
      }
    );
    this.name = 'RateLimitError';
  }
}

/**
 * 超时错误类
 */
export class TimeoutError extends MPLPError {
  constructor(
    operation: string,
    timeout: number,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'TIMEOUT_ERROR',
      `Operation '${operation}' timed out after ${timeout}ms`,
      ErrorType.TIMEOUT,
      ErrorSeverity.MEDIUM,
      ErrorCategory.SYSTEM,
      {
        ...options,
        details: { operation, timeout },
        retryable: true
      }
    );
    this.name = 'TimeoutError';
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends MPLPError {
  constructor(
    message: string,
    endpoint?: string,
    statusCode?: number,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      'NETWORK_ERROR',
      message,
      ErrorType.NETWORK,
      ErrorSeverity.MEDIUM,
      ErrorCategory.NETWORK,
      {
        ...options,
        details: { endpoint, statusCode },
        retryable: true
      }
    );
    this.name = 'NetworkError';
  }
}

/**
 * 业务错误类
 */
export class BusinessError extends MPLPError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, any>,
    options: {
      correlation_id?: string;
      user_id?: string;
      session_id?: string;
      request_id?: string;
    } = {}
  ) {
    super(
      code,
      message,
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      ErrorCategory.BUSINESS,
      {
        ...options,
        details,
        retryable: false
      }
    );
    this.name = 'BusinessError';
  }
}

/**
 * 错误工厂函数
 */
export const ErrorFactory = {
  validation: (message: string, field?: string, value?: any) => 
    new ValidationError(message, field, value),
  
  authentication: (message?: string) => 
    new AuthenticationError(message),
  
  authorization: (message?: string, resource?: string, action?: string) => 
    new AuthorizationError(message, resource, action),
  
  notFound: (resource: string, id?: string) => 
    new NotFoundError(resource, id),
  
  conflict: (message: string, resource?: string, conflictingValue?: any) => 
    new ConflictError(message, resource, conflictingValue),
  
  rateLimit: (limit: number, window: string, retryAfter?: number) => 
    new RateLimitError(limit, window, retryAfter),
  
  timeout: (operation: string, timeout: number) => 
    new TimeoutError(operation, timeout),
  
  network: (message: string, endpoint?: string, statusCode?: number) => 
    new NetworkError(message, endpoint, statusCode),
  
  business: (code: string, message: string, details?: Record<string, any>) => 
    new BusinessError(code, message, details),
  
  internal: (message: string, details?: Record<string, any>) => 
    new MPLPError(
      'INTERNAL_ERROR',
      message,
      ErrorType.INTERNAL,
      ErrorSeverity.HIGH,
      ErrorCategory.SERVER,
      { details, retryable: false }
    )
};

/**
 * 错误处理系统
 * @description 提供统一的错误处理机制
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../public/utils/logger';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorHandlingOptions {
  include_stack_trace?: boolean;
  log_errors?: boolean;
  custom_error_handler?: (error: Error, req: any, res: any, next: any) => void;
}

export interface MPLPError extends Error {
  statusCode?: number;
  severity?: ErrorSeverity;
  code?: string;
  details?: any;
}

/**
 * 创建自定义错误
 */
export function createError(
  message: string,
  statusCode: number = 500,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  code?: string,
  details?: any
): MPLPError {
  const error = new Error(message) as MPLPError;
  error.statusCode = statusCode;
  error.severity = severity;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * 创建错误处理系统
 */
export function createErrorHandlingSystem(options: ErrorHandlingOptions = {}) {
  const logger = new Logger('ErrorHandler');
  
  /**
   * HTTP错误处理中间件
   */
  const httpErrorMiddleware = (error: MPLPError, req: any, res: any, next: any) => {
    // 记录错误
    if (options.log_errors !== false) {
      logger.error('HTTP Error occurred', {
        message: error.message,
        statusCode: error.statusCode,
        severity: error.severity,
        code: error.code,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        stack: options.include_stack_trace ? error.stack : undefined
      });
    }

    // 如果有自定义错误处理器，使用它
    if (options.custom_error_handler) {
      return options.custom_error_handler(error, req, res, next);
    }

    // 默认错误响应
    const statusCode = error.statusCode || 500;
    const response: any = {
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
        severity: error.severity || ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString()
      }
    };

    // 在开发环境中包含堆栈跟踪
    if (options.include_stack_trace && error.stack) {
      response.error.stack = error.stack;
    }

    // 包含详细信息
    if (error.details) {
      response.error.details = error.details;
    }

    res.status(statusCode).json(response);
  };

  /**
   * 404错误处理中间件
   */
  const notFoundMiddleware = (req: any, res: any, next: any) => {
    const error = createError(
      `Route not found: ${req.method} ${req.url}`,
      404,
      ErrorSeverity.LOW,
      'ROUTE_NOT_FOUND',
      {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      }
    );

    next(error);
  };

  /**
   * 异步错误包装器
   */
  const asyncWrapper = (fn: Function) => {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * 验证错误处理器
   */
  const validationErrorHandler = (validationErrors: any[]) => {
    return createError(
      'Validation failed',
      400,
      ErrorSeverity.LOW,
      'VALIDATION_ERROR',
      {
        errors: validationErrors,
        count: validationErrors.length
      }
    );
  };

  /**
   * 数据库错误处理器
   */
  const databaseErrorHandler = (dbError: Error) => {
    logger.error('Database error occurred', { error: dbError });
    
    return createError(
      'Database operation failed',
      500,
      ErrorSeverity.HIGH,
      'DATABASE_ERROR',
      {
        originalError: dbError.message
      }
    );
  };

  /**
   * 认证错误处理器
   */
  const authErrorHandler = (message: string = 'Authentication failed') => {
    return createError(
      message,
      401,
      ErrorSeverity.MEDIUM,
      'AUTH_ERROR'
    );
  };

  /**
   * 授权错误处理器
   */
  const authorizationErrorHandler = (message: string = 'Access denied') => {
    return createError(
      message,
      403,
      ErrorSeverity.MEDIUM,
      'AUTHORIZATION_ERROR'
    );
  };

  /**
   * 速率限制错误处理器
   */
  const rateLimitErrorHandler = (message: string = 'Too many requests') => {
    return createError(
      message,
      429,
      ErrorSeverity.LOW,
      'RATE_LIMIT_ERROR'
    );
  };

  return {
    httpErrorMiddleware,
    notFoundMiddleware,
    asyncWrapper,
    validationErrorHandler,
    databaseErrorHandler,
    authErrorHandler,
    authorizationErrorHandler,
    rateLimitErrorHandler,
    createError
  };
}

/**
 * 全局未捕获异常处理器
 */
export function setupGlobalErrorHandlers() {
  const logger = new Logger('GlobalErrorHandler');

  // 未捕获的异常
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  // 未处理的Promise拒绝
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
  });

  // 进程退出
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

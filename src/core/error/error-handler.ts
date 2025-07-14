/**
 * MPLP错误处理器实现
 * 
 * 提供统一的错误处理功能，包括错误转换、日志记录和恢复建议
 * 
 * @version 1.0.0
 * @since 2025-07-23
 */

import { 
  IErrorHandler, 
  ErrorContext, 
  ErrorInformation, 
  ErrorConverter, 
  RecoveryActionItem,
  StackTraceItem,
  ErrorType,
  ErrorSeverity,
  ErrorHandlingConfig
} from '../../interfaces/error-handling.interface';
import { MPLPError, SystemError } from './base-error';
import { ErrorCodes, SystemErrorCodes } from './error-codes';
import { logger } from '../../utils/logger';

/**
 * 默认错误处理配置
 */
const DEFAULT_ERROR_HANDLING_CONFIG: ErrorHandlingConfig = {
  include_stack_trace: true,
  localization_enabled: false,
  default_locale: 'en',
  log_level: ErrorSeverity.ERROR,
  capture_async_errors: true,
  max_stack_depth: 10
};

/**
 * 错误处理器实现
 */
export class ErrorHandler implements IErrorHandler {
  /**
   * 错误转换器映射
   * 用于将不同类型的错误转换为标准错误信息
   */
  private errorConverters: Map<string, ErrorConverter> = new Map();
  
  /**
   * 错误处理配置
   */
  private config: ErrorHandlingConfig;
  
  /**
   * 创建错误处理器实例
   * 
   * @param config 错误处理配置
   */
  constructor(config?: Partial<ErrorHandlingConfig>) {
    this.config = {
      ...DEFAULT_ERROR_HANDLING_CONFIG,
      ...config
    };
    
    // 注册默认错误转换器
    this.registerDefaultConverters();
    
    // 如果启用了异步错误捕获，设置全局未捕获异步错误处理器
    if (this.config.capture_async_errors) {
      this.setupGlobalErrorHandlers();
    }
  }
  
  /**
   * 处理错误
   * 
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 处理后的错误信息
   */
  public handleError(error: unknown, context?: ErrorContext): ErrorInformation {
    try {
      // 记录错误日志
      this.logError(error, context);
      
      // 转换错误为标准错误信息
      const errorInfo = this.convertError(error, context);
      
      // 获取错误恢复建议
      const recoveryActions = this.getRecoveryActions(error, context);
      if (recoveryActions.length > 0) {
        errorInfo.recovery_actions = recoveryActions;
      }
      
      return errorInfo;
    } catch (handlerError) {
      // 处理错误处理器本身的错误
      logger.error('Error in error handler', {
        original_error: error instanceof Error ? error.message : String(error),
        handler_error: handlerError instanceof Error ? handlerError.message : String(handlerError)
      });
      
      // 返回一个基本的错误信息
      return {
        error_code: SystemErrorCodes.INTERNAL_ERROR,
        error_message: 'An error occurred while processing the error',
        error_type: 'system'
      };
    }
  }
  
  /**
   * 注册错误转换器
   * 
   * @param errorType 错误类型
   * @param converter 错误转换器
   */
  public registerErrorConverter(errorType: string, converter: ErrorConverter): void {
    this.errorConverters.set(errorType, converter);
  }
  
  /**
   * 获取错误恢复建议
   * 
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 错误恢复动作列表
   */
  public getRecoveryActions(error: unknown, context?: ErrorContext): RecoveryActionItem[] {
    const recoveryActions: RecoveryActionItem[] = [];
    
    // 如果是MPLP错误，检查是否可重试
    if (error instanceof MPLPError && error.retryable) {
      recoveryActions.push({
        action: 'retry',
        description: 'Retry the operation'
      });
    }
    
    // 根据错误类型添加恢复建议
    if (error instanceof Error) {
      const errorType = this.getErrorType(error);
      
      switch (errorType) {
        case 'network':
          recoveryActions.push({
            action: 'retry',
            description: 'Retry the network request'
          });
          break;
          
        case 'timeout':
          recoveryActions.push({
            action: 'retry',
            description: 'Retry with increased timeout',
            parameters: { timeout_ms: 30000 }
          });
          break;
          
        case 'validation':
          recoveryActions.push({
            action: 'fallback',
            description: 'Use default values where possible'
          });
          break;
      }
    }
    
    // 如果没有恢复建议，添加默认的升级处理建议
    if (recoveryActions.length === 0 && error instanceof Error && error.message.includes('critical')) {
      recoveryActions.push({
        action: 'escalate',
        description: 'Escalate to system administrator'
      });
    }
    
    return recoveryActions;
  }
  
  /**
   * 转换错误为标准错误信息
   * 
   * @private
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 标准错误信息
   */
  private convertError(error: unknown, context?: ErrorContext): ErrorInformation {
    // 如果已经是MPLP错误，直接转换
    if (error instanceof MPLPError) {
      return this.convertMPLPError(error);
    }
    
    // 获取错误类型
    const errorType = this.getErrorType(error);
    
    // 查找对应的错误转换器
    const converter = this.errorConverters.get(errorType) || this.errorConverters.get('default');
    
    // 如果找到转换器，使用转换器转换错误
    if (converter) {
      return converter(error, context);
    }
    
    // 默认转换
    return this.defaultErrorConverter(error, context);
  }
  
  /**
   * 转换MPLP错误为标准错误信息
   * 
   * @private
   * @param error MPLP错误
   * @returns 标准错误信息
   */
  private convertMPLPError(error: MPLPError): ErrorInformation {
    const errorInfo: ErrorInformation = {
      error_code: error.code,
      error_message: error.message,
      error_type: error.type
    };
    
    // 如果配置了包含堆栈跟踪，添加堆栈信息
    if (this.config.include_stack_trace && error.stack) {
      errorInfo.stack_trace = this.parseStackTrace(error.stack);
    }
    
    return errorInfo;
  }
  
  /**
   * 默认错误转换器
   * 
   * @private
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 标准错误信息
   */
  private defaultErrorConverter(error: unknown, context?: ErrorContext): ErrorInformation {
    const errorInfo: ErrorInformation = {
      error_code: SystemErrorCodes.INTERNAL_ERROR,
      error_message: error instanceof Error ? error.message : String(error),
      error_type: 'system'
    };
    
    // 如果配置了包含堆栈跟踪，添加堆栈信息
    if (this.config.include_stack_trace && error instanceof Error && error.stack) {
      errorInfo.stack_trace = this.parseStackTrace(error.stack);
    }
    
    return errorInfo;
  }
  
  /**
   * 获取错误类型
   * 
   * @private
   * @param error 错误对象
   * @returns 错误类型
   */
  private getErrorType(error: unknown): ErrorType {
    if (error instanceof MPLPError) {
      return error.type;
    }
    
    if (error instanceof Error) {
      if (error.name === 'ValidationError' || error.message.includes('validation')) {
        return 'validation';
      }
      
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        return 'timeout';
      }
      
      if (error.name === 'NetworkError' || error.message.includes('network')) {
        return 'network';
      }
      
      if (error.name === 'SecurityError' || error.message.includes('auth') || error.message.includes('permission')) {
        return 'security';
      }
    }
    
    return 'system';
  }
  
  /**
   * 记录错误日志
   * 
   * @private
   * @param error 错误对象
   * @param context 错误上下文
   */
  private logError(error: unknown, context?: ErrorContext): void {
    const logData = {
      error_message: error instanceof Error ? error.message : String(error),
      error_name: error instanceof Error ? error.name : typeof error,
      error_stack: error instanceof Error ? error.stack : undefined,
      ...context
    };
    
    // 根据错误严重级别记录日志
    if (error instanceof MPLPError) {
      switch (error.type) {
        case 'security':
          logger.warn(`Security error: ${error.message}`, logData);
          break;
        case 'validation':
          logger.warn(`Validation error: ${error.message}`, logData);
          break;
        default:
          logger.error(`Error: ${error.message}`, logData);
      }
    } else {
      logger.error('Unhandled error', logData);
    }
  }
  
  /**
   * 解析堆栈跟踪
   * 
   * @private
   * @param stack 堆栈跟踪字符串
   * @returns 堆栈跟踪项数组
   */
  private parseStackTrace(stack: string): StackTraceItem[] {
    const stackLines = stack.split('\n').slice(1); // 跳过第一行，它通常是错误消息
    const stackItems: StackTraceItem[] = [];
    
    // 正则表达式匹配堆栈跟踪行
    const stackRegex = /at\s+(.*)\s+\((.*):(\d+):(\d+)\)/;
    const anonymousStackRegex = /at\s+(.*):(\d+):(\d+)/;
    
    // 解析堆栈跟踪行
    for (let i = 0; i < Math.min(stackLines.length, this.config.max_stack_depth); i++) {
      const line = stackLines[i].trim();
      let match = line.match(stackRegex);
      
      if (match) {
        stackItems.push({
          function: match[1],
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        });
      } else {
        match = line.match(anonymousStackRegex);
        if (match) {
          stackItems.push({
            function: 'anonymous',
            file: match[1],
            line: parseInt(match[2], 10),
            column: parseInt(match[3], 10)
          });
        }
      }
    }
    
    return stackItems;
  }
  
  /**
   * 注册默认错误转换器
   * 
   * @private
   */
  private registerDefaultConverters(): void {
    // 默认错误转换器
    this.registerErrorConverter('default', this.defaultErrorConverter.bind(this));
    
    // 系统错误转换器
    this.registerErrorConverter('system', (error, context) => {
      const code = error instanceof MPLPError ? error.code : SystemErrorCodes.INTERNAL_ERROR;
      const message = error instanceof Error ? error.message : String(error);
      
      const errorInfo: ErrorInformation = {
        error_code: code,
        error_message: message,
        error_type: 'system'
      };
      
      if (this.config.include_stack_trace && error instanceof Error && error.stack) {
        errorInfo.stack_trace = this.parseStackTrace(error.stack);
      }
      
      return errorInfo;
    });
    
    // 验证错误转换器
    this.registerErrorConverter('validation', (error, context) => {
      const code = error instanceof MPLPError ? error.code : 'VALIDATION-3001';
      const message = error instanceof Error ? error.message : String(error);
      const details = error instanceof MPLPError ? error.details : undefined;
      
      const errorInfo: ErrorInformation = {
        error_code: code,
        error_message: message,
        error_type: 'validation'
      };
      
      return errorInfo;
    });
  }
  
  /**
   * 设置全局错误处理器
   * 
   * @private
   */
  private setupGlobalErrorHandlers(): void {
    // 捕获未处理的Promise拒绝
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logger.error('Unhandled Promise rejection', {
        error: error.message,
        stack: error.stack
      });
    });
    
    // 捕获未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
    });
  }
}

/**
 * 错误处理器工厂
 */
export class ErrorHandlerFactory {
  /**
   * 创建错误处理器实例
   * 
   * @param config 错误处理配置
   * @returns 错误处理器实例
   */
  public static createErrorHandler(config?: Partial<ErrorHandlingConfig>): IErrorHandler {
    return new ErrorHandler(config);
  }
} 
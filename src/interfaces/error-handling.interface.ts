/**
 * MPLP错误处理系统接口定义
 * 
 * 定义错误处理系统的核心接口，确保厂商中立性和可扩展性
 * 严格按照trace-protocol.json中的error_information Schema定义
 * 
 * @version 1.0.0
 * @since 2025-07-23
 * @schema_path src/schemas/trace-protocol.json
 */

/**
 * 错误类型枚举
 * 严格匹配Schema定义
 */
export type ErrorType =
  | 'system'        // 系统错误
  | 'business'      // 业务错误
  | 'validation'    // 验证错误
  | 'network'       // 网络错误
  | 'timeout'       // 超时错误
  | 'security';     // 安全错误

/**
 * 错误恢复动作枚举
 * 严格匹配Schema定义
 */
export type RecoveryAction =
  | 'retry'         // 重试操作
  | 'fallback'      // 使用备选方案
  | 'escalate'      // 升级处理
  | 'ignore'        // 忽略错误
  | 'abort';        // 中止操作

/**
 * 错误严重级别枚举
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 堆栈跟踪项接口
 * 严格匹配Schema定义
 */
export interface StackTraceItem {
  file: string;
  function: string;
  line: number;
  column?: number;
}

/**
 * 错误恢复动作接口
 * 严格匹配Schema定义
 */
export interface RecoveryActionItem {
  action: RecoveryAction;
  description: string;
  parameters?: Record<string, unknown>;
}

/**
 * 错误信息接口
 * 严格匹配Schema定义
 */
export interface ErrorInformation {
  error_code: string;
  error_message: string;
  error_type: ErrorType;
  stack_trace?: StackTraceItem[];
  recovery_actions?: RecoveryActionItem[];
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler {
  /**
   * 处理错误
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 处理后的错误信息
   */
  handleError(error: unknown, context?: ErrorContext): ErrorInformation;
  
  /**
   * 注册错误转换器
   * @param errorType 错误类型
   * @param converter 错误转换器
   */
  registerErrorConverter(errorType: string, converter: ErrorConverter): void;
  
  /**
   * 获取错误恢复建议
   * @param error 错误对象
   * @param context 错误上下文
   * @returns 错误恢复动作列表
   */
  getRecoveryActions(error: unknown, context?: ErrorContext): RecoveryActionItem[];
}

/**
 * 错误上下文接口
 */
export interface ErrorContext {
  module?: string;
  component?: string;
  function?: string;
  request_id?: string;
  user_id?: string;
  additional_data?: Record<string, unknown>;
}

/**
 * 错误转换器类型
 */
export type ErrorConverter = (error: unknown, context?: ErrorContext) => ErrorInformation;

/**
 * 错误处理配置接口
 */
export interface ErrorHandlingConfig {
  include_stack_trace: boolean;
  localization_enabled: boolean;
  default_locale: string;
  log_level: ErrorSeverity;
  capture_async_errors: boolean;
  max_stack_depth: number;
}

/**
 * 错误处理器工厂接口
 */
export interface IErrorHandlerFactory {
  /**
   * 创建错误处理器
   * @param config 错误处理配置
   * @returns 错误处理器实例
   */
  createErrorHandler(config?: Partial<ErrorHandlingConfig>): IErrorHandler;
}

/**
 * HTTP错误响应接口
 */
export interface HttpErrorResponse {
  status_code: number;
  error: {
    code: string;
    message: string;
    type: ErrorType;
    details?: unknown;
  };
  trace_id?: string;
  timestamp: string;
} 
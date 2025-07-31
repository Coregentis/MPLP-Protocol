/**
 * 错误处理接口定义
 * @description 定义MPLP系统的错误处理接口和类型
 * @author MPLP Team
 * @version 1.0.1
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 错误分类
 */
export enum ErrorCategory {
  CLIENT = 'client',
  SERVER = 'server',
  NETWORK = 'network',
  BUSINESS = 'business',
  SYSTEM = 'system',
  SECURITY = 'security'
}

/**
 * 基础错误接口
 */
export interface IError {
  code: string;
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: string;
  correlation_id?: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  details?: Record<string, any>;
  stack?: string;
  inner_error?: IError;
  context?: ErrorContext;
}

/**
 * 错误上下文
 */
export interface ErrorContext {
  module: string;
  component: string;
  operation: string;
  version: string;
  environment: string;
  metadata?: Record<string, any>;
}

/**
 * 错误处理器接口
 */
export interface IErrorHandler {
  canHandle(error: IError): boolean;
  handle(error: IError): Promise<ErrorHandlingResult>;
  getHandlerInfo(): ErrorHandlerInfo;
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult {
  handled: boolean;
  action: ErrorAction;
  retry_after?: number;
  recovery_suggestion?: string;
  escalate?: boolean;
  notify?: boolean;
  log_level?: LogLevel;
  metadata?: Record<string, any>;
}

/**
 * 错误处理动作
 */
export enum ErrorAction {
  IGNORE = 'ignore',
  LOG = 'log',
  RETRY = 'retry',
  FALLBACK = 'fallback',
  ESCALATE = 'escalate',
  NOTIFY = 'notify',
  TERMINATE = 'terminate',
  RECOVER = 'recover'
}

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * 错误处理器信息
 */
export interface ErrorHandlerInfo {
  name: string;
  version: string;
  description?: string;
  supported_types: ErrorType[];
  supported_categories: ErrorCategory[];
  priority: number;
}

/**
 * 错误恢复策略接口
 */
export interface IErrorRecoveryStrategy {
  canRecover(error: IError): boolean;
  recover(error: IError, context: any): Promise<RecoveryResult>;
  getRecoveryInfo(): RecoveryStrategyInfo;
}

/**
 * 恢复结果
 */
export interface RecoveryResult {
  recovered: boolean;
  action_taken: string;
  new_state?: any;
  retry_recommended?: boolean;
  recovery_time?: number;
  metadata?: Record<string, any>;
}

/**
 * 恢复策略信息
 */
export interface RecoveryStrategyInfo {
  name: string;
  description?: string;
  supported_errors: ErrorType[];
  recovery_time_estimate: number;
  success_rate: number;
}

/**
 * 错误报告接口
 */
export interface IErrorReporter {
  report(error: IError): Promise<void>;
  reportBatch(errors: IError[]): Promise<void>;
  getReportingConfig(): ErrorReportingConfig;
}

/**
 * 错误报告配置
 */
export interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  api_key?: string;
  batch_size: number;
  flush_interval: number;
  include_stack_trace: boolean;
  include_context: boolean;
  filter_sensitive_data: boolean;
  retry_policy: RetryPolicy;
}

/**
 * 重试策略
 */
export interface RetryPolicy {
  max_attempts: number;
  initial_delay: number;
  max_delay: number;
  backoff_factor: number;
  jitter: boolean;
}

/**
 * 错误监控接口
 */
export interface IErrorMonitor {
  track(error: IError): void;
  getMetrics(): ErrorMetrics;
  getErrorRate(timeWindow: number): number;
  getTopErrors(limit: number): ErrorSummary[];
  reset(): void;
}

/**
 * 错误指标
 */
export interface ErrorMetrics {
  total_errors: number;
  errors_by_type: Record<ErrorType, number>;
  errors_by_severity: Record<ErrorSeverity, number>;
  errors_by_category: Record<ErrorCategory, number>;
  error_rate: number;
  average_resolution_time: number;
  last_error_time?: string;
}

/**
 * 错误摘要
 */
export interface ErrorSummary {
  code: string;
  message: string;
  type: ErrorType;
  count: number;
  first_occurrence: string;
  last_occurrence: string;
  affected_users: number;
}

/**
 * 错误通知接口
 */
export interface IErrorNotifier {
  notify(error: IError, recipients: string[]): Promise<void>;
  notifyBatch(errors: IError[], recipients: string[]): Promise<void>;
  getNotificationConfig(): ErrorNotificationConfig;
}

/**
 * 错误通知配置
 */
export interface ErrorNotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  severity_threshold: ErrorSeverity;
  rate_limit: number;
  template?: string;
  include_context: boolean;
}

/**
 * 通知渠道
 */
export interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'push';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * 错误分析器接口
 */
export interface IErrorAnalyzer {
  analyze(errors: IError[]): ErrorAnalysisResult;
  findPatterns(errors: IError[]): ErrorPattern[];
  predictTrends(errors: IError[]): ErrorTrend[];
  generateRecommendations(analysis: ErrorAnalysisResult): ErrorRecommendation[];
}

/**
 * 错误分析结果
 */
export interface ErrorAnalysisResult {
  total_errors: number;
  unique_errors: number;
  error_distribution: Record<string, number>;
  time_distribution: Record<string, number>;
  patterns: ErrorPattern[];
  trends: ErrorTrend[];
  anomalies: ErrorAnomaly[];
  recommendations: ErrorRecommendation[];
}

/**
 * 错误模式
 */
export interface ErrorPattern {
  id: string;
  description: string;
  frequency: number;
  confidence: number;
  affected_components: string[];
  time_pattern?: string;
  conditions: Record<string, any>;
}

/**
 * 错误趋势
 */
export interface ErrorTrend {
  type: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
  direction: 'up' | 'down' | 'flat';
  rate: number;
  confidence: number;
  time_window: string;
  prediction?: ErrorPrediction;
}

/**
 * 错误预测
 */
export interface ErrorPrediction {
  expected_count: number;
  confidence_interval: [number, number];
  time_horizon: string;
  factors: string[];
}

/**
 * 错误异常
 */
export interface ErrorAnomaly {
  type: 'spike' | 'drop' | 'pattern_break' | 'new_error';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detected_at: string;
  affected_metrics: string[];
  possible_causes: string[];
}

/**
 * 错误建议
 */
export interface ErrorRecommendation {
  id: string;
  type: 'fix' | 'prevention' | 'monitoring' | 'process';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action_items: string[];
  estimated_impact: string;
  implementation_effort: string;
  related_errors: string[];
}

/**
 * 错误上下文构建器接口
 */
export interface IErrorContextBuilder {
  withModule(module: string): IErrorContextBuilder;
  withComponent(component: string): IErrorContextBuilder;
  withOperation(operation: string): IErrorContextBuilder;
  withVersion(version: string): IErrorContextBuilder;
  withEnvironment(environment: string): IErrorContextBuilder;
  withMetadata(metadata: Record<string, any>): IErrorContextBuilder;
  build(): ErrorContext;
}

/**
 * 错误工厂接口
 */
export interface IErrorFactory {
  createError(
    code: string,
    message: string,
    type: ErrorType,
    severity?: ErrorSeverity,
    category?: ErrorCategory
  ): IError;
  
  createValidationError(message: string, field?: string): IError;
  createAuthenticationError(message?: string): IError;
  createAuthorizationError(message?: string): IError;
  createNotFoundError(resource: string): IError;
  createConflictError(message: string): IError;
  createRateLimitError(limit: number, window: string): IError;
  createInternalError(message: string, cause?: Error): IError;
  createTimeoutError(operation: string, timeout: number): IError;
  createNetworkError(message: string, endpoint?: string): IError;
  createBusinessError(code: string, message: string): IError;
}

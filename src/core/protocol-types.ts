/**
 * MPLP Protocol Engine Types
 * @description 协议引擎相关的类型定义
 * @author MPLP Team
 * @version 1.0.0
 */

// 基础协议类型
export type ProtocolType = 'core' | 'collab' | 'extension';

// 协议成熟度级别
export type ProtocolMaturity =
  | 'experimental'
  | 'beta'
  | 'stable'
  | 'deprecated';

// 操作状态
export type OperationStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timeout'
  | 'cancelled';

// 协议状态
export type ProtocolStatus =
  | 'registered'
  | 'active'
  | 'inactive'
  | 'deprecated'
  | 'unregistered';

// 验证模式
export type ValidationMode = 'strict' | 'loose' | 'development';

// 执行模式
export type ExecutionMode = 'sync' | 'async' | 'batch';

// 重试策略
export type RetryStrategy = 'none' | 'linear' | 'exponential' | 'custom';

// 协议标识符
export interface ProtocolIdentifier {
  id: string;
  version: string;
  type: ProtocolType;
}

// 操作标识符
export interface OperationIdentifier {
  protocolId: string;
  operationName: string;
  version?: string;
}

// 协议依赖
export interface ProtocolDependency {
  id: string;
  version: string;
  optional: boolean;
  reason?: string;
}

// 操作参数
export interface OperationParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
  validation?: object;
}

// 操作配置
export interface OperationConfig {
  timeout?: number;
  retries?: number;
  retryStrategy?: RetryStrategy;
  retryDelay?: number;
  enableValidation?: boolean;
  enableCaching?: boolean;
  enableTracing?: boolean;
  priority?: number;
}

// 执行选项
export interface ExecutionOptions {
  mode?: ExecutionMode;
  timeout?: number;
  retries?: number;
  enableValidation?: boolean;
  enableCaching?: boolean;
  enableTracing?: boolean;
  metadata?: Record<string, any>;
}

// 协议事件数据
export interface ProtocolEventData {
  protocolId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// 操作事件数据
export interface OperationEventData {
  protocolId: string;
  operationName: string;
  timestamp: string;
  executionTime?: number;
  context?: any;
  metadata?: Record<string, any>;
}

// 验证错误详情
export interface ValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, any>;
  message: string;
  data?: any;
  schema?: any;
}

// 验证结果
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: any;
}

// 执行统计
export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  lastExecutionTime?: string;
}

// 协议统计
export interface ProtocolStats {
  registrationTime: string;
  operationCount: number;
  executionStats: ExecutionStats;
  errorCount: number;
  lastUsed?: string;
}

// 引擎统计
export interface EngineStats {
  startTime: string;
  uptime: number;
  protocolCount: number;
  totalOperations: number;
  successRate: number;
  averageResponseTime: number;
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// 缓存统计
export interface CacheStats {
  hitCount: number;
  missCount: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictionCount: number;
}

// 协议注册选项
export interface ProtocolRegistrationOptions {
  validateSchema?: boolean;
  checkDependencies?: boolean;
  enableCaching?: boolean;
  overwrite?: boolean;
  metadata?: Record<string, any>;
}

// 批量执行请求
export interface BatchExecutionRequest {
  operations: Array<{
    protocolId: string;
    operationName: string;
    input: any;
    context?: any;
  }>;
  options?: {
    parallel?: boolean;
    failFast?: boolean;
    timeout?: number;
  };
}

// 批量执行结果
export interface BatchExecutionResult {
  results: Array<{
    success: boolean;
    data?: any;
    error?: string;
    executionTime: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
  };
}

// 协议发现结果
export interface ProtocolDiscoveryResult {
  protocols: Array<{
    id: string;
    name: string;
    version: string;
    type: ProtocolType;
    description?: string;
    operations: string[];
    dependencies: string[];
    maturity: ProtocolMaturity;
  }>;
  totalCount: number;
  timestamp: string;
}

// 操作发现结果
export interface OperationDiscoveryResult {
  operations: Array<{
    protocolId: string;
    name: string;
    description?: string;
    inputSchema?: object;
    outputSchema?: object;
    config?: OperationConfig;
  }>;
  totalCount: number;
  timestamp: string;
}

// 健康检查结果
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration: number;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

// 协议兼容性检查结果
export interface CompatibilityCheckResult {
  compatible: boolean;
  version: string;
  targetVersion: string;
  issues: Array<{
    type: 'breaking' | 'warning' | 'info';
    message: string;
    path?: string;
  }>;
  recommendation?: string;
}

// 协议迁移计划
export interface MigrationPlan {
  fromVersion: string;
  toVersion: string;
  steps: Array<{
    id: string;
    description: string;
    type: 'schema' | 'data' | 'operation' | 'config';
    required: boolean;
    automated: boolean;
    script?: string;
  }>;
  estimatedTime: number;
  risks: Array<{
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigation?: string;
  }>;
}

// 协议扩展点
export interface ExtensionPoint {
  id: string;
  name: string;
  type: 'hook' | 'filter' | 'provider' | 'listener';
  description?: string;
  schema?: object;
  multiple?: boolean;
}

// 协议扩展
export interface ProtocolExtension {
  id: string;
  name: string;
  version: string;
  targetProtocol: string;
  extensionPoints: string[];
  implementation: any;
  metadata?: Record<string, any>;
}

// 监控配置
export interface MonitoringConfig {
  enableMetrics: boolean;
  enableTracing: boolean;
  enableLogging: boolean;
  metricsInterval: number;
  traceLevel: 'none' | 'basic' | 'detailed' | 'verbose';
  logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
}

// 安全配置
export interface SecurityConfig {
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableEncryption: boolean;
  authenticationMethod: 'token' | 'certificate' | 'signature';
  encryptionAlgorithm: 'aes256' | 'rsa' | 'ecc';
  accessControlModel: 'rbac' | 'abac' | 'acl';
}

// 性能配置
export interface PerformanceConfig {
  maxConcurrentOperations: number;
  operationTimeout: number;
  retryAttempts: number;
  circuitBreakerThreshold: number;
  rateLimitPerSecond: number;
  memoryLimitMB: number;
}

// 协议引擎完整配置
export interface ProtocolEngineFullConfig {
  core: {
    enableValidation: boolean;
    enableCaching: boolean;
    enableTracing: boolean;
    enableMetrics: boolean;
    defaultTimeout: number;
    maxRetries: number;
    cacheSize: number;
  };
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  extensions: {
    enableExtensions: boolean;
    extensionDirectory: string;
    autoLoadExtensions: boolean;
  };
}

// 导出所有类型的联合类型，便于使用
export type AllProtocolTypes =
  | ProtocolType
  | ProtocolMaturity
  | OperationStatus
  | ProtocolStatus
  | ValidationMode
  | ExecutionMode
  | RetryStrategy;

// 协议定义接口
export interface ProtocolDefinition {
  id: string;
  name: string;
  version: string;
  type: 'core' | 'collab' | 'extension';
  schema: object;
  operations: Record<string, OperationDefinition>;
  dependencies?: string[];
  metadata?: ProtocolMetadata;
}

// 操作定义接口
export interface OperationDefinition {
  name: string;
  description: string;
  inputSchema?: object;
  outputSchema?: object;
  handler?: OperationHandler;
  timeout?: number;
  retries?: number;
}

// 操作处理器类型
export type OperationHandler = (
  input: any,
  context: OperationContext
) => Promise<any>;

// 操作上下文
export interface OperationContext {
  protocolId: string;
  operationName: string;
  sessionId?: string;
  agentId?: string;
  metadata?: Record<string, any>;
  trace?: boolean;
}

// 协议元数据
export interface ProtocolMetadata {
  author?: string;
  description?: string;
  documentation?: string;
  tags?: string[];
  maturity?: 'experimental' | 'beta' | 'stable' | 'deprecated';
}

// 执行结果
export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime: number;
    protocolId: string;
    operationName: string;
    timestamp: string;
  };
}

// 协议引擎配置
export interface ProtocolEngineConfig {
  enableValidation: boolean;
  enableCaching: boolean;
  enableTracing: boolean;
  enableMetrics: boolean;
  defaultTimeout: number;
  maxRetries: number;
  cacheSize: number;
}

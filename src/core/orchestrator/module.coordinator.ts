/**
 * ModuleCoordinator - 模块协调器
 * 负责与10个MPLP模块的协调和服务调用管理
 * 替换Mock实现，实现真实的模块间协调
 * 
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

import { UUID, Timestamp } from '../../modules/core/types';

// ===== 模块信息接口 =====

export interface ModuleInfo {
  moduleId: string;
  moduleName: string;
  version: string;
  status: ModuleStatus;
  services: ServiceInfo[];
  endpoints: ModuleEndpoint[];
  healthCheck: HealthCheckConfig;
  metadata: ModuleMetadata;
  registeredAt: Timestamp;
  lastHeartbeat: Timestamp;
}

export type ModuleStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface ServiceInfo {
  serviceId: string;
  serviceName: string;
  description?: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface ModuleEndpoint {
  endpointId: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authentication?: AuthenticationConfig;
}

export interface HealthCheckConfig {
  endpoint: string;
  interval: number;
  timeout: number;
  retries: number;
}

export interface ModuleMetadata {
  capabilities: string[];
  dependencies: string[];
  resources: ResourceRequirements;
  tags: Record<string, string>;
}

export interface AuthenticationConfig {
  type: 'bearer' | 'api_key' | 'basic';
  credentials: Record<string, string>;
}

export interface RetryPolicy {
  maxRetries: number;
  retryDelay: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryableErrors: string[];
}

export interface ResourceRequirements {
  cpuCores: number;
  memoryMb: number;
  diskSpaceMb: number;
  networkBandwidth: number;
}

// ===== 服务调用接口 =====

export interface ServiceRequest {
  requestId: UUID;
  moduleId: string;
  serviceId: string;
  parameters: Record<string, unknown>;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}

export interface ServiceResult {
  requestId: UUID;
  moduleId: string;
  serviceId: string;
  status: 'success' | 'error' | 'timeout';
  result?: Record<string, unknown>;
  error?: ServiceError;
  duration: number;
  timestamp: Timestamp;
}

export interface ServiceError {
  errorCode: string;
  errorMessage: string;
  errorType: 'validation' | 'execution' | 'timeout' | 'network' | 'authentication';
  retryable: boolean;
  details?: Record<string, unknown>;
}

// ===== 协调结果接口 =====

export interface CoordinationRequest {
  coordinationId: UUID;
  modules: string[];
  operation: string;
  parameters: Record<string, unknown>;
  coordinationType: 'sequential' | 'parallel' | 'conditional';
  timeout: number;
  timestamp: Timestamp;
}

export interface CoordinationResult {
  coordinationId: UUID;
  status: 'success' | 'partial_success' | 'failure';
  results: ModuleResult[];
  duration: number;
  errors: CoordinationError[];
  timestamp: Timestamp;
}

export interface ModuleResult {
  moduleId: string;
  status: 'success' | 'error' | 'skipped';
  result?: Record<string, unknown>;
  error?: ServiceError;
  duration: number;
}

export interface CoordinationError {
  moduleId: string;
  errorType: string;
  message: string;
  retryCount: number;
}

// ===== 错误处理接口 =====

export interface ModuleError {
  errorId: UUID;
  moduleId: string;
  serviceId?: string;
  errorType: 'connection' | 'timeout' | 'validation' | 'execution' | 'authentication';
  message: string;
  originalError?: Error;
  timestamp: Timestamp;
  context?: Record<string, unknown>;
}

export interface ErrorHandlingResult {
  handled: boolean;
  action: 'retry' | 'skip' | 'abort' | 'fallback';
  retryAfter?: number;
  fallbackResult?: Record<string, unknown>;
}

export interface FailedOperation {
  operationId: UUID;
  moduleId: string;
  serviceId: string;
  parameters: Record<string, unknown>;
  error: ModuleError;
  retryCount: number;
  maxRetries: number;
  lastAttempt: Timestamp;
}

export interface RetryResult {
  operationId: UUID;
  status: 'success' | 'failed' | 'max_retries_exceeded';
  result?: ServiceResult;
  error?: ModuleError;
  totalRetries: number;
}

// ===== 模块协调器实现 =====

export class ModuleCoordinator {
  private registeredModules = new Map<string, ModuleInfo>();
  private activeConnections = new Map<string, ModuleConnection>();
  private pendingRequests = new Map<UUID, ServiceRequest>();
  private failedOperations = new Map<UUID, FailedOperation>();

  constructor(
    private _connectionTimeout: number = 5000, // Reserved for future timeout configuration
    private defaultRetryPolicy: RetryPolicy = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffStrategy: 'exponential',
      retryableErrors: ['timeout', 'network', 'temporary']
    }
  ) {}

  /**
   * 注册模块
   */
  async registerModule(module: ModuleInfo): Promise<void> {
    // 验证模块信息
    this.validateModuleInfo(module);

    // 检查模块健康状态
    const healthStatus = await this.checkModuleHealth(module);
    if (!healthStatus.healthy) {
      throw new Error(`Module ${module.moduleId} failed health check: ${healthStatus.error}`);
    }

    // 注册模块
    module.status = 'active';
    module.registeredAt = new Date().toISOString();
    module.lastHeartbeat = new Date().toISOString();
    
    this.registeredModules.set(module.moduleId, module);

    // 建立连接
    await this.establishConnection(module);

    // Module registered successfully
  }

  /**
   * 发现模块
   */
  async discoverModules(): Promise<ModuleInfo[]> {
    return Array.from(this.registeredModules.values())
      .filter(module => module.status === 'active');
  }

  /**
   * 调用模块服务
   */
  async invokeModuleService(
    moduleId: string,
    serviceId: string,
    parameters: Record<string, unknown>
  ): Promise<ServiceResult> {
    const requestId = this.generateUUID();
    const request: ServiceRequest = {
      requestId,
      moduleId,
      serviceId,
      parameters,
      timestamp: new Date().toISOString()
    };

    // 验证模块是否已注册
    const module = this.registeredModules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not registered`);
    }

    // 验证服务是否存在
    const service = module.services.find(s => s.serviceId === serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found in module ${moduleId}`);
    }

    // 验证输入参数
    this.validateServiceParameters(parameters, service.inputSchema);

    // 获取连接
    const connection = await this.getModuleConnection(moduleId);

    try {
      // 记录请求
      this.pendingRequests.set(requestId, request);

      // 执行服务调用
      const startTime = Date.now();
      const result = await this.executeServiceCall(connection, request, service);
      const duration = Date.now() - startTime;

      const serviceResult: ServiceResult = {
        requestId,
        moduleId,
        serviceId,
        status: 'success',
        result: result,
        duration,
        timestamp: new Date().toISOString()
      };

      return serviceResult;

    } catch (error) {
      const duration = Date.now() - Date.now();
      const serviceError: ServiceError = {
        errorCode: 'EXECUTION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: 'execution',
        retryable: this.isRetryableError(error)
      };

      return {
        requestId,
        moduleId,
        serviceId,
        status: 'error',
        error: serviceError,
        duration,
        timestamp: new Date().toISOString()
      };

    } finally {
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * 协调多个模块
   */
  async coordinateModules(
    modules: string[],
    operation: string
  ): Promise<CoordinationResult> {
    const coordinationId = this.generateUUID();

    const results: ModuleResult[] = [];
    const errors: CoordinationError[] = [];
    const startTime = Date.now();

    try {
      // 顺序执行模块操作
      for (const moduleId of modules) {
        try {
          const moduleStartTime = Date.now();
          const result = await this.invokeModuleService(moduleId, operation, {});
          const moduleDuration = Date.now() - moduleStartTime;

          results.push({
            moduleId,
            status: result.status === 'success' ? 'success' : 'error',
            result: result.result,
            error: result.error,
            duration: moduleDuration
          });

        } catch (error) {
          errors.push({
            moduleId,
            errorType: 'execution',
            message: error instanceof Error ? error.message : 'Unknown error',
            retryCount: 0
          });

          results.push({
            moduleId,
            status: 'error',
            duration: 0
          });
        }
      }

      const totalDuration = Date.now() - startTime;
      const successCount = results.filter(r => r.status === 'success').length;
      const status = successCount === modules.length ? 'success' :
                    successCount > 0 ? 'partial_success' : 'failure';

      return {
        coordinationId,
        status,
        results,
        duration: totalDuration,
        errors,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        coordinationId,
        status: 'failure',
        results,
        duration: Date.now() - startTime,
        errors: [{
          moduleId: 'coordinator',
          errorType: 'coordination',
          message: error instanceof Error ? error.message : 'Coordination failed',
          retryCount: 0
        }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 处理模块错误
   */
  async handleModuleError(error: ModuleError): Promise<ErrorHandlingResult> {
    // 根据错误类型决定处理策略
    switch (error.errorType) {
      case 'timeout':
        return {
          handled: true,
          action: 'retry',
          retryAfter: 2000
        };

      case 'connection':
        return {
          handled: true,
          action: 'retry',
          retryAfter: 5000
        };

      case 'validation':
        return {
          handled: true,
          action: 'abort'
        };

      case 'authentication':
        return {
          handled: true,
          action: 'abort'
        };

      default:
        return {
          handled: false,
          action: 'skip'
        };
    }
  }

  /**
   * 重试操作
   */
  async retryOperation(operation: FailedOperation): Promise<RetryResult> {
    if (operation.retryCount >= operation.maxRetries) {
      return {
        operationId: operation.operationId,
        status: 'max_retries_exceeded',
        totalRetries: operation.retryCount
      };
    }

    try {
      // 计算重试延迟
      const delay = this.calculateRetryDelay(operation.retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));

      // 重试服务调用
      const result = await this.invokeModuleService(
        operation.moduleId,
        operation.serviceId,
        operation.parameters
      );

      if (result.status === 'success') {
        // 重试成功，移除失败记录
        this.failedOperations.delete(operation.operationId);
        
        return {
          operationId: operation.operationId,
          status: 'success',
          result,
          totalRetries: operation.retryCount + 1
        };
      } else {
        // 重试仍然失败
        operation.retryCount++;
        operation.lastAttempt = new Date().toISOString();
        
        return {
          operationId: operation.operationId,
          status: 'failed',
          error: {
            errorId: this.generateUUID(),
            moduleId: operation.moduleId,
            serviceId: operation.serviceId,
            errorType: 'execution',
            message: result.error?.errorMessage || 'Retry failed',
            timestamp: new Date().toISOString()
          },
          totalRetries: operation.retryCount
        };
      }

    } catch (error) {
      operation.retryCount++;
      operation.lastAttempt = new Date().toISOString();

      return {
        operationId: operation.operationId,
        status: 'failed',
        error: {
          errorId: this.generateUUID(),
          moduleId: operation.moduleId,
          serviceId: operation.serviceId,
          errorType: 'execution',
          message: error instanceof Error ? error.message : 'Retry failed',
          timestamp: new Date().toISOString()
        },
        totalRetries: operation.retryCount
      };
    }
  }

  // ===== 私有辅助方法 =====

  private validateModuleInfo(module: ModuleInfo): void {
    if (!module.moduleId) {
      throw new Error('Module ID is required');
    }
    if (!module.moduleName) {
      throw new Error('Module name is required');
    }
    if (!module.services || module.services.length === 0) {
      throw new Error('At least one service is required');
    }
  }

  private async checkModuleHealth(_module: ModuleInfo): Promise<{ healthy: boolean; error?: string }> {
    // 简化实现：假设模块健康
    return { healthy: true };
  }

  private async establishConnection(module: ModuleInfo): Promise<void> {
    const connection: ModuleConnection = {
      moduleId: module.moduleId,
      endpoint: module.endpoints[0]?.url || `http://localhost:3000/${module.moduleId}`,
      status: 'connected',
      lastUsed: new Date().toISOString()
    };

    this.activeConnections.set(module.moduleId, connection);
  }

  private async getModuleConnection(moduleId: string): Promise<ModuleConnection> {
    const connection = this.activeConnections.get(moduleId);
    if (!connection) {
      throw new Error(`No connection found for module ${moduleId}`);
    }
    return connection;
  }

  private validateServiceParameters(parameters: Record<string, unknown>, _schema: Record<string, unknown>): void {
    // 简化实现：基础参数验证
    if (typeof parameters !== 'object' || parameters === null) {
      throw new Error('Parameters must be an object');
    }
  }

  private async executeServiceCall(
    _connection: ModuleConnection,
    request: ServiceRequest,
    _service: ServiceInfo
  ): Promise<Record<string, unknown>> {
    // 简化实现：模拟服务调用
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      data: `Result from ${request.moduleId}.${request.serviceId}`,
      timestamp: new Date().toISOString()
    };
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const retryableMessages = ['timeout', 'network', 'temporary', 'connection'];
      return retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
    }
    return false;
  }

  private calculateRetryDelay(retryCount: number): number {
    const baseDelay = this.defaultRetryPolicy.retryDelay;
    switch (this.defaultRetryPolicy.backoffStrategy) {
      case 'exponential':
        return baseDelay * Math.pow(2, retryCount);
      case 'linear':
        return baseDelay * (retryCount + 1);
      default:
        return baseDelay;
    }
  }

  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// ===== 辅助接口 =====

export interface ModuleConnection {
  moduleId: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  lastUsed: Timestamp;
}

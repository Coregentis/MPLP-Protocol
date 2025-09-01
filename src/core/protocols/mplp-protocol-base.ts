/**
 * MPLP协议基础类
 * 
 * @description 所有MPLP模块协议的基础类，提供统一的协议接口和横切关注点集成
 * @version 1.0.0
 * @architecture 统一DDD架构 + L3管理器注入模式
 */

import { MLPPSecurityManager } from './cross-cutting-concerns/security-manager.js';
import { MLPPPerformanceMonitor } from './cross-cutting-concerns/performance-monitor.js';
import { MLPPEventBusManager } from './cross-cutting-concerns/event-bus-manager.js';
import { MLPPErrorHandler } from './cross-cutting-concerns/error-handler.js';
import { MLPPCoordinationManager } from './cross-cutting-concerns/coordination-manager.js';
import { MLPPOrchestrationManager } from './cross-cutting-concerns/orchestration-manager.js';
import { MLPPStateSyncManager } from './cross-cutting-concerns/state-sync-manager.js';
import { MLPPTransactionManager } from './cross-cutting-concerns/transaction-manager.js';
import { MLPPProtocolVersionManager } from './cross-cutting-concerns/protocol-version-manager.js';

/**
 * MPLP协议请求接口
 */
export interface MLPPRequest {
  protocolVersion: string;
  timestamp: string;
  requestId: string;
  operation: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * MPLP协议响应接口
 */
export interface MLPPResponse {
  protocolVersion: string;
  timestamp: string;
  requestId: string;
  status?: 'success' | 'error' | 'pending';
  success?: boolean;
  data?: unknown;
  result?: Record<string, unknown>;
  message?: string;
  error?: string | {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

/**
 * 协议元数据接口
 */
export interface ProtocolMetadata {
  name: string;
  moduleName?: string;
  version: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
  supportedOperations: string[];
  crossCuttingConcerns?: string[];
  slaGuarantees?: Record<string, string>;
}

/**
 * 健康状态接口
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string | Date;
  details?: Record<string, unknown>;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration?: number;
  }>;
  metadata?: Record<string, unknown>;
}

/**
 * MPLP协议接口
 * 
 * @description 所有MPLP模块必须实现的标准协议接口
 */
export interface IMLPPProtocol {
  /**
   * 执行协议操作
   */
  executeOperation(request: MLPPRequest): Promise<MLPPResponse>;

  /**
   * 获取协议元数据
   */
  getProtocolMetadata(): ProtocolMetadata;

  /**
   * 健康检查
   */
  healthCheck(): Promise<HealthStatus>;
}

/**
 * MPLP协议基础类
 * 
 * @description 提供统一的L3管理器注入和基础功能实现
 * @pattern 所有10个模块使用IDENTICAL的继承模式
 */
export abstract class MLPPProtocolBase implements IMLPPProtocol {
  /**
   * 统一的L3管理器注入 (所有模块使用相同的注入模式)
   */
  protected constructor(
    protected readonly securityManager: MLPPSecurityManager,
    protected readonly performanceMonitor: MLPPPerformanceMonitor,
    protected readonly eventBusManager: MLPPEventBusManager,
    protected readonly errorHandler: MLPPErrorHandler,
    protected readonly coordinationManager: MLPPCoordinationManager,
    protected readonly orchestrationManager: MLPPOrchestrationManager,
    protected readonly stateSyncManager: MLPPStateSyncManager,
    protected readonly transactionManager: MLPPTransactionManager,
    protected readonly protocolVersionManager: MLPPProtocolVersionManager
  ) {}

  /**
   * 抽象方法：子类必须实现具体的操作执行逻辑
   */
  abstract executeOperation(request: MLPPRequest): Promise<MLPPResponse>;

  /**
   * 抽象方法：子类必须提供协议元数据
   */
  abstract getProtocolMetadata(): ProtocolMetadata;

  /**
   * 默认健康检查实现
   */
  async healthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const checks: HealthStatus['checks'] = [];

    try {
      // 检查所有L3管理器的健康状态
      const managerChecks = await Promise.all([
        this.checkManagerHealth('security', this.securityManager),
        this.checkManagerHealth('performance', this.performanceMonitor),
        this.checkManagerHealth('eventBus', this.eventBusManager),
        this.checkManagerHealth('errorHandler', this.errorHandler),
        this.checkManagerHealth('coordination', this.coordinationManager),
        this.checkManagerHealth('orchestration', this.orchestrationManager),
        this.checkManagerHealth('stateSync', this.stateSyncManager),
        this.checkManagerHealth('transaction', this.transactionManager),
        this.checkManagerHealth('protocolVersion', this.protocolVersionManager)
      ]);

      checks.push(...managerChecks);

      // 执行模块特定的健康检查
      const moduleChecks = await this.performModuleHealthChecks();
      checks.push(...moduleChecks);

      // 确定整体健康状态
      const hasFailures = checks.some(check => check.status === 'fail');
      const hasWarnings = checks.some(check => check.status === 'warn');

      const status = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

      return {
        status,
        timestamp,
        checks,
        metadata: {
          protocolVersion: '1.0.0',
          moduleName: this.getProtocolMetadata().name
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp,
        checks: [{
          name: 'health_check_execution',
          status: 'fail',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  /**
   * 检查单个管理器的健康状态
   */
  private async checkManagerHealth(
    name: string, 
    manager: { healthCheck?: () => Promise<boolean> }
  ): Promise<HealthStatus['checks'][0]> {
    const startTime = Date.now();
    
    try {
      const isHealthy = manager.healthCheck ? await manager.healthCheck() : true;
      const duration = Date.now() - startTime;

      return {
        name: `${name}_manager`,
        status: isHealthy ? 'pass' : 'fail',
        message: isHealthy ? `${name} manager is healthy` : `${name} manager is unhealthy`,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: `${name}_manager`,
        status: 'fail',
        message: `${name} manager check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration
      };
    }
  }

  /**
   * 抽象方法：子类可以实现模块特定的健康检查
   */
  protected async performModuleHealthChecks(): Promise<HealthStatus['checks']> {
    return [];
  }

  /**
   * 创建标准响应
   */
  protected createResponse(
    request: MLPPRequest,
    status: MLPPResponse['status'],
    result?: Record<string, unknown>,
    error?: MLPPResponse['error']
  ): MLPPResponse {
    return {
      protocolVersion: request.protocolVersion,
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
      status,
      result,
      error,
      metadata: {
        processingTime: Date.now(),
        moduleName: this.getProtocolMetadata().name
      }
    };
  }

  /**
   * 创建错误响应
   */
  protected createErrorResponse(
    request: MLPPRequest,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): MLPPResponse {
    return this.createResponse(request, 'error', undefined, {
      code,
      message,
      details
    });
  }
}

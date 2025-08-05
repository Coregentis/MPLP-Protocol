/**
 * Base Protocol Manager
 * @description 协议管理器基类，提供通用的管理功能
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../../public/utils/logger';
import { EventBus } from '../event-bus';
import { CacheManager } from '../cache/cache-manager';
import { SchemaValidator } from '../schema/schema-validator';
import { ProtocolEngine } from '../protocol-engine';
import {
  ProtocolDefinition,
  OperationDefinition,
  OperationContext,
} from '../protocol-types';

// 管理器配置接口
export interface BaseManagerConfig {
  enableCaching: boolean;
  enableValidation: boolean;
  enableEvents: boolean;
  cacheTimeout: number;
  operationTimeout: number;
  maxRetries: number;
}

// 管理器状态
export interface ManagerState {
  initialized: boolean;
  protocolRegistered: boolean;
  operationCount: number;
  lastActivity: string;
  errorCount: number;
}

// 操作结果
export interface ManagerOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    managerId: string;
    operationName: string;
    executionTime: number;
    timestamp: string;
    cached?: boolean;
  };
}

/**
 * 协议管理器基类
 */
export abstract class BaseProtocolManager {
  protected logger: Logger;
  protected state: ManagerState;
  protected protocolDefinition?: ProtocolDefinition;

  constructor(
    protected managerId: string,
    protected config: BaseManagerConfig,
    protected protocolEngine: ProtocolEngine,
    protected eventBus: EventBus,
    protected cache: CacheManager,
    protected validator: SchemaValidator
  ) {
    this.logger = new Logger(`${managerId}Manager`);
    this.state = {
      initialized: false,
      protocolRegistered: false,
      operationCount: 0,
      lastActivity: new Date().toISOString(),
      errorCount: 0,
    };

    this.setupEventHandlers();
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    if (this.state.initialized) {
      this.logger.warn('Manager already initialized');
      return;
    }

    try {
      // 获取协议定义
      this.protocolDefinition = await this.getProtocolDefinition();

      // 注册协议到引擎
      await this.protocolEngine.registerProtocol(this.protocolDefinition);
      this.state.protocolRegistered = true;

      // 执行子类特定的初始化
      await this.onInitialize();

      this.state.initialized = true;
      this.updateLastActivity();

      this.publishEvent('manager:initialized', {
        managerId: this.managerId,
        protocolId: this.protocolDefinition.id,
      });

      this.logger.info('Manager initialized', {
        managerId: this.managerId,
        protocolId: this.protocolDefinition.id,
        operationCount: Object.keys(this.protocolDefinition.operations).length,
      });
    } catch (error) {
      this.state.errorCount++;
      this.logger.error('Manager initialization failed', { error });
      throw error;
    }
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    if (!this.state.initialized) {
      return;
    }

    try {
      // 执行子类特定的清理
      await this.onDestroy();

      // 从引擎注销协议
      if (this.protocolDefinition && this.state.protocolRegistered) {
        await this.protocolEngine.unregisterProtocol(
          this.protocolDefinition.id
        );
        this.state.protocolRegistered = false;
      }

      this.state.initialized = false;
      this.updateLastActivity();

      this.publishEvent('manager:destroyed', {
        managerId: this.managerId,
      });

      this.logger.info('Manager destroyed', { managerId: this.managerId });
    } catch (error) {
      this.state.errorCount++;
      this.logger.error('Manager destruction failed', { error });
      throw error;
    }
  }

  /**
   * 执行操作
   */
  async executeOperation<T = any>(
    operationName: string,
    input: any,
    context: Partial<OperationContext> = {}
  ): Promise<ManagerOperationResult<T>> {
    if (!this.state.initialized || !this.protocolDefinition) {
      throw new Error('Manager not initialized');
    }

    const startTime = Date.now();
    this.state.operationCount++;
    this.updateLastActivity();

    try {
      // 检查缓存
      let result: T | undefined;
      let cached = false;

      if (this.config.enableCaching) {
        const cacheKey = this.generateCacheKey(operationName, input);
        result = await this.cache.get<T>(cacheKey);
        if (result !== undefined) {
          cached = true;
          this.logger.debug('Operation result retrieved from cache', {
            operationName,
            cacheKey,
          });
        }
      }

      // 如果缓存中没有，执行操作
      if (result === undefined) {
        const executionResult = await this.protocolEngine.executeOperation<T>(
          this.protocolDefinition.id,
          operationName,
          input,
          {
            ...context,
            protocolId: this.protocolDefinition.id,
            operationName,
          }
        );

        if (!executionResult.success) {
          throw new Error(executionResult.error || 'Operation failed');
        }

        result = executionResult.data;

        // 缓存结果
        if (this.config.enableCaching && result !== undefined) {
          const cacheKey = this.generateCacheKey(operationName, input);
          await this.cache.set(cacheKey, result, this.config.cacheTimeout);
        }
      }

      const executionTime = Date.now() - startTime;

      const operationResult: ManagerOperationResult<T> = {
        success: true,
        data: result,
        metadata: {
          managerId: this.managerId,
          operationName,
          executionTime,
          timestamp: new Date().toISOString(),
          cached,
        },
      };

      this.publishEvent('operation:completed', {
        managerId: this.managerId,
        operationName,
        executionTime,
        cached,
      });

      return operationResult;
    } catch (error) {
      this.state.errorCount++;
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.publishEvent('operation:failed', {
        managerId: this.managerId,
        operationName,
        error: errorMessage,
        executionTime,
      });

      this.logger.error('Operation execution failed', {
        operationName,
        error: errorMessage,
        executionTime,
      });

      return {
        success: false,
        error: errorMessage,
        metadata: {
          managerId: this.managerId,
          operationName,
          executionTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * 验证数据
   */
  async validateData(data: any): Promise<boolean> {
    if (!this.config.enableValidation || !this.protocolDefinition) {
      return true;
    }

    return await this.protocolEngine.validateProtocolData(
      this.protocolDefinition.id,
      data
    );
  }

  /**
   * 获取管理器状态
   */
  getState(): ManagerState {
    return { ...this.state };
  }

  /**
   * 获取管理器统计
   */
  getStats() {
    return {
      managerId: this.managerId,
      state: this.getState(),
      protocolId: this.protocolDefinition?.id,
      protocolVersion: this.protocolDefinition?.version,
      config: this.config,
      uptime: this.calculateUptime(),
      cacheStats: this.cache.getMetrics(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.state.operationCount = 0;
    this.state.errorCount = 0;
    this.updateLastActivity();
  }

  /**
   * 检查健康状态
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    timestamp: string;
  }> {
    const issues: string[] = [];

    if (!this.state.initialized) {
      issues.push('Manager not initialized');
    }

    if (!this.state.protocolRegistered) {
      issues.push('Protocol not registered');
    }

    if (this.state.errorCount > 10) {
      issues.push('High error count');
    }

    // 执行子类特定的健康检查
    const customIssues = await this.onHealthCheck();
    issues.push(...customIssues);

    return {
      healthy: issues.length === 0,
      issues,
      timestamp: new Date().toISOString(),
    };
  }

  // 抽象方法，子类必须实现

  /**
   * 获取协议定义
   */
  protected abstract getProtocolDefinition(): Promise<ProtocolDefinition>;

  /**
   * 子类特定的初始化逻辑
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * 子类特定的清理逻辑
   */
  protected abstract onDestroy(): Promise<void>;

  /**
   * 子类特定的健康检查
   */
  protected abstract onHealthCheck(): Promise<string[]>;

  // 受保护的辅助方法

  /**
   * 生成缓存键
   */
  protected generateCacheKey(operationName: string, input: any): string {
    const inputHash = this.hashObject(input);
    return `${this.managerId}:${operationName}:${inputHash}`;
  }

  /**
   * 对象哈希
   */
  protected hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 发布事件
   */
  protected publishEvent(eventType: string, data: any): void {
    if (this.config.enableEvents) {
      this.eventBus.publish(eventType, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 更新最后活动时间
   */
  protected updateLastActivity(): void {
    this.state.lastActivity = new Date().toISOString();
  }

  /**
   * 计算运行时间
   */
  protected calculateUptime(): number {
    if (!this.state.initialized) {
      return 0;
    }
    return Date.now() - new Date(this.state.lastActivity).getTime();
  }

  /**
   * 设置事件处理器
   */
  protected setupEventHandlers(): void {
    // 子类可以重写此方法来设置特定的事件处理器
  }

  /**
   * 创建操作定义
   */
  protected createOperationDefinition(
    name: string,
    description: string,
    handler: (input: any, context: OperationContext) => Promise<any>,
    options: {
      inputSchema?: object;
      outputSchema?: object;
      timeout?: number;
      retries?: number;
    } = {}
  ): OperationDefinition {
    return {
      name,
      description,
      handler,
      inputSchema: options.inputSchema,
      outputSchema: options.outputSchema,
      timeout: options.timeout || this.config.operationTimeout,
      retries: options.retries || this.config.maxRetries,
    };
  }
}

/**
 * 创建默认管理器配置
 */
export function createDefaultManagerConfig(
  overrides: Partial<BaseManagerConfig> = {}
): BaseManagerConfig {
  return {
    enableCaching: true,
    enableValidation: true,
    enableEvents: true,
    cacheTimeout: 300000, // 5 minutes
    operationTimeout: 30000, // 30 seconds
    maxRetries: 3,
    ...overrides,
  };
}

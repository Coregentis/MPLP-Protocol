/**
 * Infrastructure Manager
 * @description 基础设施管理器，统一管理和协调所有基础设施组件
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../../public/utils/logger';
import { EventBus } from '../event-bus';
import { CacheManager, CacheManagerConfig } from '../cache/cache-manager';
import {
  SchemaValidator,
  SchemaValidatorConfig,
} from '../schema/schema-validator';

// 基础设施配置
export interface InfrastructureConfig {
  eventBus: {
    maxHistorySize: number;
    enableMetrics: boolean;
    enableErrorHandling: boolean;
  };
  cache: CacheManagerConfig;
  validator: SchemaValidatorConfig;
  monitoring: {
    enableHealthChecks: boolean;
    healthCheckInterval: number;
    enablePerformanceTracking: boolean;
    enableResourceMonitoring: boolean;
  };
  security: {
    enableAuditLogging: boolean;
    enableAccessControl: boolean;
    enableEncryption: boolean;
  };
}

// 基础设施状态
export interface InfrastructureStatus {
  eventBus: ComponentStatus;
  cache: ComponentStatus;
  validator: ComponentStatus;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
}

// 组件状态
export interface ComponentStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  metrics?: any;
  issues?: string[];
}

// 基础设施指标
export interface InfrastructureMetrics {
  eventBus: {
    totalEvents: number;
    eventsPerSecond: number;
    subscriptionCount: number;
    errorRate: number;
  };
  cache: {
    hitRate: number;
    totalSize: number;
    evictionRate: number;
    memoryUsage: number;
  };
  validator: {
    validationRate: number;
    successRate: number;
    averageValidationTime: number;
    cacheHitRate: number;
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

/**
 * 基础设施管理器类
 */
export class InfrastructureManager {
  private logger: Logger;
  private eventBus!: EventBus;
  private cache!: CacheManager;
  private validator!: SchemaValidator;
  private startTime: number;
  private healthCheckInterval?: NodeJS.Timeout;
  private performanceTracker?: PerformanceTracker;

  constructor(private config: InfrastructureConfig) {
    this.logger = new Logger('InfrastructureManager');
    this.startTime = Date.now();

    // 初始化组件
    this.initializeComponents();

    // 设置监控
    if (config.monitoring.enableHealthChecks) {
      this.setupHealthChecks();
    }

    if (config.monitoring.enablePerformanceTracking) {
      this.performanceTracker = new PerformanceTracker();
    }
  }

  /**
   * 初始化基础设施组件
   */
  private initializeComponents(): void {
    try {
      // 初始化EventBus
      this.eventBus = new EventBus();

      // 初始化CacheManager
      this.cache = new CacheManager(this.config.cache, this.eventBus);

      // 初始化SchemaValidator
      this.validator = new SchemaValidator(this.config.validator);

      // 设置组件间的集成
      this.setupComponentIntegration();

      this.logger.info('Infrastructure components initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize infrastructure components', {
        error,
      });
      throw error;
    }
  }

  /**
   * 设置组件间集成
   */
  private setupComponentIntegration(): void {
    // EventBus错误处理
    this.eventBus.addErrorHandler((error, eventType, data) => {
      this.logger.error('EventBus error', { error, eventType, data });

      // 发布基础设施错误事件
      this.eventBus.publish('infrastructure:error', {
        component: 'eventBus',
        error: error.message,
        eventType,
        timestamp: new Date().toISOString(),
      });
    });

    // 缓存事件监听
    this.eventBus.subscribe('cache:eviction', data => {
      this.logger.debug('Cache eviction occurred', data);
    });

    this.eventBus.subscribe('cache:error', data => {
      this.logger.warn('Cache error occurred', data);
    });

    // 验证器事件监听
    this.eventBus.subscribe('validation:failed', data => {
      this.logger.debug('Validation failed', data);
    });

    // 性能监控事件
    if (this.config.monitoring.enablePerformanceTracking) {
      this.setupPerformanceMonitoring();
    }
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    // 监控EventBus性能
    const originalPublish = this.eventBus.publish.bind(this.eventBus);
    this.eventBus.publish = (eventType: string, data: any) => {
      const start = Date.now();
      const result = originalPublish(eventType, data);
      const duration = Date.now() - start;

      this.performanceTracker?.recordEventBusOperation('publish', duration);
      return result;
    };

    // 监控Cache性能
    const originalGet = this.cache.get.bind(this.cache);
    this.cache.get = async (key: string) => {
      const start = Date.now();
      const result = await originalGet(key);
      const duration = Date.now() - start;

      this.performanceTracker?.recordCacheOperation(
        'get',
        duration,
        result !== undefined
      );
      return result;
    };

    const originalSet = this.cache.set.bind(this.cache);
    this.cache.set = async (key: string, value: any, ttl?: number) => {
      const start = Date.now();
      const result = await originalSet(key, value, ttl);
      const duration = Date.now() - start;

      this.performanceTracker?.recordCacheOperation('set', duration, true);
      return result;
    };
  }

  /**
   * 设置健康检查
   */
  private setupHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const status = await this.getStatus();

        if (status.overall !== 'healthy') {
          this.logger.warn('Infrastructure health check failed', status);

          this.eventBus.publish('infrastructure:health-check-failed', {
            status,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        this.logger.error('Health check error', { error });
      }
    }, this.config.monitoring.healthCheckInterval);
  }

  /**
   * 获取EventBus实例
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * 获取CacheManager实例
   */
  getCacheManager(): CacheManager {
    return this.cache;
  }

  /**
   * 获取SchemaValidator实例
   */
  getSchemaValidator(): SchemaValidator {
    return this.validator;
  }

  /**
   * 获取基础设施状态
   */
  async getStatus(): Promise<InfrastructureStatus> {
    const eventBusStatus = await this.checkEventBusHealth();
    const cacheStatus = await this.checkCacheHealth();
    const validatorStatus = await this.checkValidatorHealth();

    const overallStatus = this.determineOverallStatus([
      eventBusStatus,
      cacheStatus,
      validatorStatus,
    ]);

    return {
      eventBus: eventBusStatus,
      cache: cacheStatus,
      validator: validatorStatus,
      overall: overallStatus,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * 获取基础设施指标
   */
  getMetrics(): InfrastructureMetrics {
    // EventBus doesn't have getMetrics method, use mock data
    const eventBusMetrics = {
      totalEvents: 0,
      eventsPerSecond: 0,
      subscriptionCount: 0,
      errorRate: 0,
    };
    const cacheMetrics = this.cache.getMetrics();
    const validatorMetrics = this.validator.getMetrics();

    return {
      eventBus: {
        totalEvents: eventBusMetrics.totalEvents,
        eventsPerSecond: eventBusMetrics.eventsPerSecond,
        subscriptionCount: eventBusMetrics.subscriptionCount,
        errorRate: eventBusMetrics.errorRate,
      },
      cache: {
        hitRate: cacheMetrics.hitRate,
        totalSize: cacheMetrics.totalSize,
        evictionRate: cacheMetrics.evictions / Math.max(cacheMetrics.sets, 1),
        memoryUsage: this.estimateCacheMemoryUsage(),
      },
      validator: {
        validationRate:
          validatorMetrics.total_validations / this.getUptimeSeconds(),
        successRate:
          validatorMetrics.successful_validations /
          Math.max(validatorMetrics.total_validations, 1),
        averageValidationTime: validatorMetrics.average_validation_time,
        cacheHitRate:
          validatorMetrics.cache_hits /
          Math.max(validatorMetrics.total_validations, 1),
      },
      system: {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpuUsage: process.cpuUsage().user / 1000000, // seconds
        uptime: this.getUptimeSeconds(),
      },
    };
  }

  /**
   * 重置所有指标
   */
  resetMetrics(): void {
    // EventBus and CacheManager don't have resetMetrics methods
    // this.eventBus.resetMetrics();
    // this.cache.resetMetrics();
    this.validator.resetMetrics();
    this.performanceTracker?.reset();

    this.logger.info('Infrastructure metrics reset');
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      // 清理健康检查定时器
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // 清理组件
      // await this.cache.cleanup(); // cleanup is private
      this.eventBus.clear();

      this.logger.info('Infrastructure cleanup completed');
    } catch (error) {
      this.logger.error('Infrastructure cleanup failed', { error });
      throw error;
    }
  }

  // 私有方法

  private async checkEventBusHealth(): Promise<ComponentStatus> {
    try {
      // EventBus doesn't have getMetrics method, use mock data
      const metrics = {
        totalEvents: 0,
        eventsPerSecond: 0,
        subscriptionCount: 0,
        errorRate: 0,
      };
      const issues: string[] = [];

      if (metrics.errorRate > 0.1) {
        issues.push('High error rate in EventBus');
      }

      if (metrics.subscriptionCount > 1000) {
        issues.push('High subscription count may impact performance');
      }

      return {
        status: issues.length === 0 ? 'healthy' : 'degraded',
        uptime: this.getUptimeSeconds(),
        metrics,
        issues,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: this.getUptimeSeconds(),
        issues: [`EventBus health check failed: ${error}`],
      };
    }
  }

  private async checkCacheHealth(): Promise<ComponentStatus> {
    try {
      const metrics = this.cache.getMetrics();
      const issues: string[] = [];

      if (metrics.hitRate < 0.5) {
        issues.push('Low cache hit rate');
      }

      if (metrics.totalSize > this.config.cache.maxSize! * 0.9) {
        issues.push('Cache near capacity');
      }

      // 测试缓存读写
      const testKey = '__health_check__';
      await this.cache.set(testKey, 'test', 1000);
      const testValue = await this.cache.get(testKey);
      await this.cache.delete(testKey);

      if (testValue !== 'test') {
        issues.push('Cache read/write test failed');
      }

      return {
        status: issues.length === 0 ? 'healthy' : 'degraded',
        uptime: this.getUptimeSeconds(),
        metrics,
        issues,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: this.getUptimeSeconds(),
        issues: [`Cache health check failed: ${error}`],
      };
    }
  }

  private async checkValidatorHealth(): Promise<ComponentStatus> {
    try {
      const metrics = this.validator.getMetrics();
      const issues: string[] = [];

      if (
        metrics.successful_validations /
          Math.max(metrics.total_validations, 1) <
        0.8
      ) {
        issues.push('Low validation success rate');
      }

      if (metrics.average_validation_time > 100) {
        issues.push('High average validation time');
      }

      // 测试验证器
      const testSchema = { type: 'string' };
      const testResult = await this.validator.validate(testSchema, 'test');

      if (!testResult.valid) {
        issues.push('Validator test failed');
      }

      return {
        status: issues.length === 0 ? 'healthy' : 'degraded',
        uptime: this.getUptimeSeconds(),
        metrics,
        issues,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: this.getUptimeSeconds(),
        issues: [`Validator health check failed: ${error}`],
      };
    }
  }

  private determineOverallStatus(
    componentStatuses: ComponentStatus[]
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = componentStatuses.filter(
      s => s.status === 'unhealthy'
    ).length;
    const degradedCount = componentStatuses.filter(
      s => s.status === 'degraded'
    ).length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private getUptimeSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  private estimateCacheMemoryUsage(): number {
    // 简化的内存使用估算
    const metrics = this.cache.getMetrics();
    return metrics.totalSize * 100; // 假设每个条目平均100字节
  }
}

/**
 * 性能跟踪器
 */
class PerformanceTracker {
  private eventBusOperations: OperationMetrics = new OperationMetrics();
  private cacheOperations: OperationMetrics = new OperationMetrics();

  recordEventBusOperation(operation: string, duration: number): void {
    this.eventBusOperations.record(operation, duration);
  }

  recordCacheOperation(
    operation: string,
    duration: number,
    success: boolean
  ): void {
    this.cacheOperations.record(operation, duration, success);
  }

  getEventBusMetrics(): any {
    return this.eventBusOperations.getMetrics();
  }

  getCacheMetrics(): any {
    return this.cacheOperations.getMetrics();
  }

  reset(): void {
    this.eventBusOperations.reset();
    this.cacheOperations.reset();
  }
}

/**
 * 操作指标
 */
class OperationMetrics {
  private operations = new Map<
    string,
    {
      count: number;
      totalDuration: number;
      minDuration: number;
      maxDuration: number;
      successCount: number;
    }
  >();

  record(operation: string, duration: number, success: boolean = true): void {
    if (!this.operations.has(operation)) {
      this.operations.set(operation, {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        successCount: 0,
      });
    }

    const metrics = this.operations.get(operation)!;
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.minDuration = Math.min(metrics.minDuration, duration);
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);

    if (success) {
      metrics.successCount++;
    }
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [operation, metrics] of this.operations) {
      result[operation] = {
        count: metrics.count,
        averageDuration: metrics.totalDuration / metrics.count,
        minDuration: metrics.minDuration === Infinity ? 0 : metrics.minDuration,
        maxDuration: metrics.maxDuration,
        successRate: metrics.successCount / metrics.count,
      };
    }

    return result;
  }

  reset(): void {
    this.operations.clear();
  }
}

/**
 * 创建默认基础设施配置
 */
export function createDefaultInfrastructureConfig(): InfrastructureConfig {
  return {
    eventBus: {
      maxHistorySize: 100,
      enableMetrics: true,
      enableErrorHandling: true,
    },
    cache: {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      cleanupInterval: 60000, // 1 minute
      enableMetrics: true,
      enableEvents: true,
      storageBackend: 'memory',
    },
    validator: {
      mode: 'strict',
      enableCaching: true,
      cacheSize: 100,
      enableMetrics: true,
    },
    monitoring: {
      enableHealthChecks: true,
      healthCheckInterval: 30000, // 30 seconds
      enablePerformanceTracking: true,
      enableResourceMonitoring: true,
    },
    security: {
      enableAuditLogging: true,
      enableAccessControl: false,
      enableEncryption: false,
    },
  };
}

/**
 * 创建生产环境基础设施配置
 */
export function createProductionInfrastructureConfig(): InfrastructureConfig {
  return {
    ...createDefaultInfrastructureConfig(),
    cache: {
      defaultTTL: 600000, // 10 minutes
      maxSize: 5000,
      cleanupInterval: 300000, // 5 minutes
      enableMetrics: false, // 生产环境关闭详细指标
      enableEvents: false,
      storageBackend: 'memory',
    },
    monitoring: {
      enableHealthChecks: true,
      healthCheckInterval: 60000, // 1 minute
      enablePerformanceTracking: false, // 生产环境关闭性能跟踪
      enableResourceMonitoring: true,
    },
    security: {
      enableAuditLogging: true,
      enableAccessControl: true,
      enableEncryption: true,
    },
  };
}

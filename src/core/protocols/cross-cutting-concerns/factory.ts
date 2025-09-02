/**
 * 横切关注点工厂
 * 
 * @description 创建和配置所有L3管理器的工厂类
 * @version 1.0.0
 * @pattern 单例模式，确保所有模块使用相同的管理器实例
 */

import { MLPPSecurityManager } from './security-manager';
import { MLPPPerformanceMonitor } from './performance-monitor';
import { MLPPEventBusManager } from './event-bus-manager';
import { MLPPErrorHandler } from './error-handler';
import { MLPPCoordinationManager } from './coordination-manager';
import { MLPPOrchestrationManager } from './orchestration-manager';
import { MLPPStateSyncManager } from './state-sync-manager';
import { MLPPTransactionManager } from './transaction-manager';
import { MLPPProtocolVersionManager } from './protocol-version-manager';

/**
 * 横切关注点配置接口
 */
export interface CrossCuttingConcernsConfig {
  security?: {
    enabled: boolean;
    authenticationMethods?: string[];
    sessionTimeout?: number;
  };
  performance?: {
    enabled: boolean;
    collectionInterval?: number;
    retentionPeriod?: number;
  };
  eventBus?: {
    enabled: boolean;
    maxListeners?: number;
  };
  errorHandler?: {
    enabled: boolean;
    logLevel?: string;
    maxErrors?: number;
  };
  coordination?: {
    enabled: boolean;
    timeout?: number;
  };
  orchestration?: {
    enabled: boolean;
    maxConcurrentWorkflows?: number;
  };
  stateSync?: {
    enabled: boolean;
    syncInterval?: number;
  };
  transaction?: {
    enabled: boolean;
    defaultTimeout?: number;
  };
  protocolVersion?: {
    enabled: boolean;
    strictVersioning?: boolean;
  };
}

/**
 * 横切关注点管理器集合
 */
export interface CrossCuttingManagers {
  security: MLPPSecurityManager;
  performance: MLPPPerformanceMonitor;
  eventBus: MLPPEventBusManager;
  errorHandler: MLPPErrorHandler;
  coordination: MLPPCoordinationManager;
  orchestration: MLPPOrchestrationManager;
  stateSync: MLPPStateSyncManager;
  transaction: MLPPTransactionManager;
  protocolVersion: MLPPProtocolVersionManager;
}

/**
 * 横切关注点工厂类
 * 
 * @description 单例工厂，确保所有模块使用相同的管理器实例
 */
export class CrossCuttingConcernsFactory {
  private static instance: CrossCuttingConcernsFactory;
  private managers: CrossCuttingManagers | null = null;

  private constructor() {}

  /**
   * 获取工厂单例实例
   */
  static getInstance(): CrossCuttingConcernsFactory {
    if (!CrossCuttingConcernsFactory.instance) {
      CrossCuttingConcernsFactory.instance = new CrossCuttingConcernsFactory();
    }
    return CrossCuttingConcernsFactory.instance;
  }

  /**
   * 创建所有横切关注点管理器
   */
  createManagers(config: CrossCuttingConcernsConfig = {}): CrossCuttingManagers {
    if (this.managers) {
      return this.managers;
    }

    this.managers = {
      security: new MLPPSecurityManager(),
      performance: new MLPPPerformanceMonitor(),
      eventBus: new MLPPEventBusManager(),
      errorHandler: new MLPPErrorHandler(),
      coordination: new MLPPCoordinationManager(),
      orchestration: new MLPPOrchestrationManager(),
      stateSync: new MLPPStateSyncManager(),
      transaction: new MLPPTransactionManager(),
      protocolVersion: new MLPPProtocolVersionManager()
    };

    // 应用配置
    this.applyConfiguration(config);

    return this.managers;
  }

  /**
   * 获取已创建的管理器
   */
  getManagers(): CrossCuttingManagers | null {
    return this.managers;
  }

  /**
   * 重置工厂（主要用于测试）
   */
  reset(): void {
    this.managers = null;
  }

  /**
   * 应用配置到管理器
   */
  private applyConfiguration(config: CrossCuttingConcernsConfig): void {
    if (!this.managers) return;

    try {
      // 应用安全管理器配置
      if (config.security && this.managers.security) {
        this.applySecurityConfig(config.security);
      }

      // 应用性能监控配置
      if (config.performance && this.managers.performance) {
        this.applyPerformanceConfig(config.performance);
      }

      // 应用事件总线配置
      if (config.eventBus && this.managers.eventBus) {
        this.applyEventBusConfig(config.eventBus);
      }

      // 应用错误处理配置
      if (config.errorHandler && this.managers.errorHandler) {
        this.applyErrorHandlerConfig(config.errorHandler);
      }

      // 应用协调管理器配置
      if (config.coordination && this.managers.coordination) {
        this.applyCoordinationConfig(config.coordination);
      }

      // 应用编排管理器配置
      if (config.orchestration && this.managers.orchestration) {
        this.applyOrchestrationConfig(config.orchestration);
      }

      // 应用状态同步配置
      if (config.stateSync && this.managers.stateSync) {
        this.applyStateSyncConfig(config.stateSync);
      }

      // 应用事务管理器配置
      if (config.transaction && this.managers.transaction) {
        this.applyTransactionConfig(config.transaction);
      }

      // 应用协议版本管理器配置
      if (config.protocolVersion && this.managers.protocolVersion) {
        this.applyProtocolVersionConfig(config.protocolVersion);
      }
    } catch (error) {
      console.error('Failed to apply cross-cutting concerns configuration:', error);
      throw new Error(`Configuration application failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== 配置应用方法 =====

  /**
   * 应用安全管理器配置
   */
  private applySecurityConfig(config: NonNullable<CrossCuttingConcernsConfig['security']>): void {
    // 安全管理器配置应用
    // 注意：当前MLPPSecurityManager没有configure方法，这里实现基础配置逻辑
    if (!config.enabled) {
      // 如果禁用，可以设置标志或记录日志
      console.log('Security manager disabled by configuration');
    }

    // TODO: 当MLPPSecurityManager添加configure方法时，在这里调用
    // this.managers!.security.configure(config);
  }

  /**
   * 应用性能监控配置
   */
  private applyPerformanceConfig(config: NonNullable<CrossCuttingConcernsConfig['performance']>): void {
    // 性能监控配置应用
    if (!config.enabled) {
      console.log('Performance monitor disabled by configuration');
      return;
    }

    // TODO: 当MLPPPerformanceMonitor添加configure方法时，在这里调用
    // this.managers!.performance.configure(config);
  }

  /**
   * 应用事件总线配置
   */
  private applyEventBusConfig(config: NonNullable<CrossCuttingConcernsConfig['eventBus']>): void {
    // 事件总线配置应用
    if (!config.enabled) {
      console.log('Event bus disabled by configuration');
      return;
    }

    // TODO: 当MLPPEventBusManager添加configure方法时，在这里调用
    // this.managers!.eventBus.configure(config);
  }

  /**
   * 应用错误处理配置
   */
  private applyErrorHandlerConfig(config: NonNullable<CrossCuttingConcernsConfig['errorHandler']>): void {
    // 错误处理配置应用
    if (!config.enabled) {
      console.log('Error handler disabled by configuration');
      return;
    }

    // TODO: 当MLPPErrorHandler添加configure方法时，在这里调用
    // this.managers!.errorHandler.configure(config);
  }

  /**
   * 应用协调管理器配置
   */
  private applyCoordinationConfig(config: NonNullable<CrossCuttingConcernsConfig['coordination']>): void {
    // 协调管理器配置应用
    if (!config.enabled) {
      console.log('Coordination manager disabled by configuration');
      return;
    }

    // TODO: 当MLPPCoordinationManager添加configure方法时，在这里调用
    // this.managers!.coordination.configure(config);
  }

  /**
   * 应用编排管理器配置
   */
  private applyOrchestrationConfig(config: NonNullable<CrossCuttingConcernsConfig['orchestration']>): void {
    // 编排管理器配置应用
    if (!config.enabled) {
      console.log('Orchestration manager disabled by configuration');
      return;
    }

    // TODO: 当MLPPOrchestrationManager添加configure方法时，在这里调用
    // this.managers!.orchestration.configure(config);
  }

  /**
   * 应用状态同步配置
   */
  private applyStateSyncConfig(config: NonNullable<CrossCuttingConcernsConfig['stateSync']>): void {
    // 状态同步配置应用
    if (!config.enabled) {
      console.log('State sync manager disabled by configuration');
      return;
    }

    // TODO: 当MLPPStateSyncManager添加configure方法时，在这里调用
    // this.managers!.stateSync.configure(config);
  }

  /**
   * 应用事务管理器配置
   */
  private applyTransactionConfig(config: NonNullable<CrossCuttingConcernsConfig['transaction']>): void {
    // 事务管理器配置应用
    if (!config.enabled) {
      console.log('Transaction manager disabled by configuration');
      return;
    }

    // TODO: 当MLPPTransactionManager添加configure方法时，在这里调用
    // this.managers!.transaction.configure(config);
  }

  /**
   * 应用协议版本管理器配置
   */
  private applyProtocolVersionConfig(config: NonNullable<CrossCuttingConcernsConfig['protocolVersion']>): void {
    // 协议版本管理器配置应用
    if (!config.enabled) {
      console.log('Protocol version manager disabled by configuration');
      return;
    }

    // TODO: 当MLPPProtocolVersionManager添加configure方法时，在这里调用
    // this.managers!.protocolVersion.configure(config);
  }

  /**
   * 健康检查所有管理器
   */
  async healthCheckAll(): Promise<Record<string, boolean>> {
    if (!this.managers) {
      throw new Error('Managers not initialized. Call createManagers() first.');
    }

    const results: Record<string, boolean> = {};

    try {
      results.security = await this.managers.security.healthCheck();
      results.performance = await this.managers.performance.healthCheck();
      results.eventBus = await this.managers.eventBus.healthCheck();
      results.errorHandler = await this.managers.errorHandler.healthCheck();
      results.coordination = await this.managers.coordination.healthCheck();
      results.orchestration = await this.managers.orchestration.healthCheck();
      results.stateSync = await this.managers.stateSync.healthCheck();
      results.transaction = await this.managers.transaction.healthCheck();
      results.protocolVersion = await this.managers.protocolVersion.healthCheck();
    } catch (error) {
      // TODO: 使用适当的错误处理机制
      void error; // 临时避免未使用变量警告
    }

    return results;
  }
}

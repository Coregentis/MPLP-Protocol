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

    // 应用性能监控配置
    if (config.performance) {
      // TODO: 等待CoreOrchestrator激活 - 实现配置应用逻辑
      void config.performance; // 临时避免未使用变量警告
    }

    // 应用其他配置...
    // TODO: 为每个管理器实现配置应用逻辑
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

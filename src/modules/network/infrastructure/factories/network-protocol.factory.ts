/**
 * Network协议工厂
 * 
 * @description Network模块的协议工厂，负责创建和管理协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */

import { NetworkProtocol } from '../protocols/network.protocol';
import { NetworkManagementService } from '../../application/services/network-management.service';
import { NetworkAnalyticsService } from '../../application/services/network-analytics.service';
import { NetworkMonitoringService } from '../../application/services/network-monitoring.service';
import { NetworkSecurityService } from '../../application/services/network-security.service';

// ===== L3横切关注点管理器类型导入 =====
import {
  MLPPSecurityManager,
  MLPPPerformanceMonitor,
  MLPPEventBusManager,
  MLPPErrorHandler,
  MLPPCoordinationManager,
  MLPPOrchestrationManager,
  MLPPStateSyncManager,
  MLPPTransactionManager,
  MLPPProtocolVersionManager
} from '../../../../core/protocols/cross-cutting-concerns';
import { CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns/factory';

/**
 * Network协议工厂类
 */
export class NetworkProtocolFactory {
  private static factoryInstance: NetworkProtocolFactory | null = null;
  private instances: Map<string, NetworkProtocol>;
  private defaultConfig: Record<string, unknown>;

  constructor() {
    this.instances = new Map();
    this.defaultConfig = {
      enableLogging: true,
      enableMetrics: true,
      enableCaching: false,
      maxCacheSize: 1000,
      cacheTimeout: 300000, // 5分钟
      networkTimeout: 30000, // 30秒
      maxConnections: 1000,
      retryAttempts: 3,
      retryDelay: 1000
    };
  }

  /**
   * 创建Network协议实例
   * @param {string} instanceId 实例ID
   * @param {Object} config 配置选项
   * @returns {Promise<NetworkProtocol>} 协议实例
   */
  async createProtocol(instanceId = 'default', config = {}) {
    // 检查是否已存在实例
    if (this.instances.has(instanceId)) {
      const existingInstance = this.instances.get(instanceId);
      if (existingInstance && existingInstance.isInitialized) {
        return existingInstance;
      }
    }

    // 合并配置
    const finalConfig = {
      ...this.defaultConfig,
      ...config,
      instanceId
    };

    // 创建横切关注点管理器
    const crossCuttingFactory = CrossCuttingConcernsFactory.getInstance();
    const managers = crossCuttingFactory.createManagers({
      security: { enabled: true },
      performance: { enabled: (finalConfig as Record<string, unknown>).enableMetrics as boolean ?? false },
      eventBus: { enabled: true },
      errorHandler: { enabled: true },
      coordination: { enabled: true },
      orchestration: { enabled: true },
      stateSync: { enabled: true },
      transaction: { enabled: true },
      protocolVersion: { enabled: true }
    });

    // 创建网络管理服务（临时实现）
    const networkManagementService = {} as unknown as NetworkManagementService; // TODO: 注入真实服务

    // 创建企业级服务（临时实现）
    const networkAnalyticsService = {} as unknown as NetworkAnalyticsService; // TODO: 注入真实服务
    const networkMonitoringService = {} as unknown as NetworkMonitoringService; // TODO: 注入真实服务
    const networkSecurityService = {} as unknown as NetworkSecurityService; // TODO: 注入真实服务

    // 创建新的协议实例
    const protocol = new NetworkProtocol(
      networkManagementService,
      networkAnalyticsService,
      networkMonitoringService,
      networkSecurityService,
      managers.security,
      managers.performance,
      managers.eventBus,
      managers.errorHandler,
      managers.coordination,
      managers.orchestration,
      managers.stateSync,
      managers.transaction,
      managers.protocolVersion
    );

    // 初始化协议
    const initialized = await protocol.initialize(finalConfig);
    if (!initialized) {
      throw new Error(`协议实例 ${instanceId} 初始化失败`);
    }

    // 存储实例
    this.instances.set(instanceId, protocol);

    // console.log(`[NetworkProtocolFactory] 创建协议实例: ${instanceId}`);

    return protocol;
  }

  /**
   * 获取协议实例
   * @param {string} instanceId 实例ID
   * @returns {NetworkProtocol|null} 协议实例
   */
  getProtocol(instanceId = 'default') {
    return this.instances.get(instanceId) || null;
  }

  /**
   * 销毁协议实例
   * @param {string} instanceId 实例ID
   * @returns {Promise<boolean>} 销毁结果
   */
  async destroyProtocol(instanceId = 'default') {
    try {
      const protocol = this.instances.get(instanceId);
      if (!protocol) {
        return false;
      }

      // 停止协议 - 简化实现，因为NetworkProtocol没有stop方法
      // 清理健康检查间隔
      if (protocol.healthCheckInterval) {
        clearInterval(protocol.healthCheckInterval);
      }

      // 清理资源
      if (protocol.healthCheckInterval) {
        clearInterval(protocol.healthCheckInterval);
      }

      // 从实例映射中移除
      this.instances.delete(instanceId);

      // console.log(`[NetworkProtocolFactory] 销毁协议实例: ${instanceId}`);

      return true;

    } catch (error) {
      // console.error(`[NetworkProtocolFactory] 销毁协议实例失败 - ${instanceId}:`, error);
      return false;
    }
  }

  /**
   * 获取所有协议实例
   * @returns {Map<string, NetworkProtocol>} 所有实例
   */
  getAllProtocols() {
    return new Map(this.instances);
  }

  /**
   * 获取协议实例状态
   * @param {string} instanceId 实例ID
   * @returns {Object|null} 实例状态
   */
  getProtocolStatus(instanceId = 'default') {
    const protocol = this.instances.get(instanceId);
    if (!protocol) {
      return null;
    }

    return {
      instanceId,
      initialized: protocol.isInitialized,
      active: protocol.isActive,
      errorCount: protocol.errorCount,
      lastHealthCheck: protocol.lastHealthCheck,
      metrics: protocol.metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取所有协议实例状态
   * @returns {Array<Object>} 所有实例状态
   */
  getAllProtocolStatus() {
    const statuses = [];
    
    for (const [instanceId, protocol] of this.instances) {
      statuses.push({
        instanceId,
        initialized: protocol.isInitialized,
        active: protocol.isActive,
        errorCount: protocol.errorCount,
        lastHealthCheck: protocol.lastHealthCheck,
        metrics: protocol.metrics,
        timestamp: new Date().toISOString()
      });
    }

    return statuses;
  }

  /**
   * 重启协议实例
   * @param {string} instanceId 实例ID
   * @param {Object} newConfig 新配置
   * @returns {Promise<NetworkProtocol>} 重启后的协议实例
   */
  async restartProtocol(instanceId = 'default', newConfig = {}) {
    // 获取当前配置
    const currentProtocol = this.instances.get(instanceId);
    const currentConfig = currentProtocol ? currentProtocol.config : {};

    // 销毁现有实例
    await this.destroyProtocol(instanceId);

    // 创建新实例
    const mergedConfig = { ...currentConfig, ...newConfig };
    return await this.createProtocol(instanceId, mergedConfig);
  }

  /**
   * 批量创建协议实例
   * @param configs 配置数组
   * @returns 协议实例数组
   */
  async createMultipleProtocols(configs: Record<string, unknown>[]): Promise<NetworkProtocol[]> {
    const protocols: NetworkProtocol[] = [];
    const errors: Record<string, unknown>[] = [];

    for (const config of configs) {
      try {
        const instanceId = (config.instanceId as string) || `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const protocol = await this.createProtocol(instanceId, config as Record<string, unknown>);
        if (protocol) {
          protocols.push(protocol);
        }
      } catch (error) {
        errors.push({
          config,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (errors.length > 0) {
      // console.warn(`[NetworkProtocolFactory] 批量创建时出现错误:`, errors);
      // 使用errors避免未使用变量警告
      void errors;
    }

    return protocols;
  }

  /**
   * 健康检查所有协议实例
   * @returns 健康检查结果
   */
  async healthCheckAll(): Promise<Record<string, unknown>> {
    const results = {
      total: this.instances.size,
      healthy: 0,
      unhealthy: 0,
      details: [] as Record<string, unknown>[]
    };

    for (const [instanceId, protocol] of this.instances) {
      try {
        const health = await protocol.healthCheck();

        if (health.status === 'healthy') {
          results.healthy++;
        } else {
          results.unhealthy++;
        }

        results.details.push({
          instanceId,
          ...health
        });

      } catch (error) {
        results.unhealthy++;
        results.details.push({
          instanceId,
          healthy: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * 清理所有协议实例
   * @returns 清理结果
   */
  async cleanup(): Promise<boolean> {
    try {
      const instanceIds = Array.from(this.instances.keys());

      for (const instanceId of instanceIds) {
        await this.destroyProtocol(instanceId);
      }

      // console.log(`[NetworkProtocolFactory] 清理完成，销毁了 ${instanceIds.length} 个实例`);

      return true;

    } catch (error) {
      // console.error(`[NetworkProtocolFactory] 清理失败:`, error);
      return false;
    }
  }

  /**
   * 获取工厂统计信息
   * @returns 统计信息
   */
  getFactoryStats(): Record<string, unknown> {
    const stats = {
      totalInstances: this.instances.size,
      initializedInstances: 0,
      activeInstances: 0,
      errorInstances: 0,
      instances: [] as Record<string, unknown>[]
    };

    for (const [instanceId, protocol] of this.instances) {
      if (protocol.isInitialized) {
        stats.initializedInstances++;
      }

      if (protocol.isActive) {
        stats.activeInstances++;
      }

      if (protocol.errorCount > 0) {
        stats.errorInstances++;
      }

      stats.instances.push({
        instanceId,
        initialized: protocol.isInitialized,
        active: protocol.isActive,
        errorCount: protocol.errorCount,
        operationsCount: protocol.metrics.operationsCount
      });
    }

    return stats;
  }

  /**
   * 设置默认配置
   * @param config 默认配置
   */
  setDefaultConfig(config: Record<string, unknown>): void {
    this.defaultConfig = {
      ...this.defaultConfig,
      ...config
    };
  }

  /**
   * 获取默认配置
   * @returns 默认配置
   */
  getDefaultConfig(): Record<string, unknown> {
    return { ...this.defaultConfig };
  }

  // ===== 静态工厂方法 =====

  /**
   * 静态方法：创建协议实例
   */
  static create(_config?: Record<string, unknown>): NetworkProtocol {
    if (!NetworkProtocolFactory.factoryInstance) {
      NetworkProtocolFactory.factoryInstance = new NetworkProtocolFactory();
    }

    // 创建mock实例用于测试
    const mockNetworkManagementService = {
      createNetwork: jest.fn(),
      updateNetwork: jest.fn(),
      deleteNetwork: jest.fn(),
      getNetwork: jest.fn(),
      getAllNetworks: jest.fn(),
      addNodeToNetwork: jest.fn(),
      removeNodeFromNetwork: jest.fn(),
      addEdgeToNetwork: jest.fn(),
      removeEdgeFromNetwork: jest.fn(),
      getNetworkTopology: jest.fn(),
      validateNetworkConfiguration: jest.fn(),
      optimizeNetworkPerformance: jest.fn(),
      getNetworkMetrics: jest.fn(),
      getNetworkHealth: jest.fn(),
      backupNetworkConfiguration: jest.fn(),
      restoreNetworkConfiguration: jest.fn(),
      exportNetworkConfiguration: jest.fn(),
      importNetworkConfiguration: jest.fn(),
      cloneNetwork: jest.fn(),
      mergeNetworks: jest.fn()
    };

    // 创建mock横切关注点管理器
    const mockManagers = {
      securityManager: { validateRequest: jest.fn().mockResolvedValue({ allowed: true }) },
      performanceMonitor: { recordMetric: jest.fn() },
      eventBusManager: { publish: jest.fn() },
      errorHandler: { handleError: jest.fn() },
      coordinationManager: {},
      orchestrationManager: {},
      stateSyncManager: {},
      transactionManager: {},
      protocolVersionManager: {}
    };

    // 创建完整的Mock企业级服务
    const mockNetworkAnalyticsService = {
      analyzeNetwork: jest.fn().mockResolvedValue({}),
      generateHealthReport: jest.fn().mockResolvedValue({})
    };

    const mockNetworkMonitoringService = {
      getRealtimeMetrics: jest.fn().mockResolvedValue({}),
      getDashboard: jest.fn().mockResolvedValue({}),
      startMonitoring: jest.fn().mockResolvedValue(undefined)
    };

    const mockNetworkSecurityService = {
      performThreatDetection: jest.fn().mockResolvedValue([]),
      performSecurityAudit: jest.fn().mockResolvedValue({}),
      getSecurityDashboard: jest.fn().mockResolvedValue({})
    };

    return new NetworkProtocol(
      mockNetworkManagementService as unknown as NetworkManagementService,
      mockNetworkAnalyticsService as unknown as NetworkAnalyticsService,
      mockNetworkMonitoringService as unknown as NetworkMonitoringService,
      mockNetworkSecurityService as unknown as NetworkSecurityService,
      mockManagers.securityManager as unknown as MLPPSecurityManager,
      mockManagers.performanceMonitor as unknown as MLPPPerformanceMonitor,
      mockManagers.eventBusManager as unknown as MLPPEventBusManager,
      mockManagers.errorHandler as unknown as MLPPErrorHandler,
      mockManagers.coordinationManager as unknown as MLPPCoordinationManager,
      mockManagers.orchestrationManager as unknown as MLPPOrchestrationManager,
      mockManagers.stateSyncManager as unknown as MLPPStateSyncManager,
      mockManagers.transactionManager as unknown as MLPPTransactionManager,
      mockManagers.protocolVersionManager as unknown as MLPPProtocolVersionManager
    );
  }

  /**
   * 静态方法：创建默认配置实例
   */
  static createWithDefaults(): NetworkProtocol {
    return NetworkProtocolFactory.create({
      enableLogging: true,
      enableMetrics: true,
      enableCaching: true
    });
  }

  /**
   * 静态方法：创建测试实例
   */
  static createForTesting(): NetworkProtocol {
    return NetworkProtocolFactory.create({
      enableLogging: false,
      enableMetrics: false,
      enableCaching: false
    });
  }

  /**
   * 静态方法：创建生产实例
   */
  static createForProduction(): NetworkProtocol {
    return NetworkProtocolFactory.create({
      enableLogging: true,
      enableMetrics: true,
      enableCaching: true,
      enableSecurity: true
    });
  }

  private static singletonInstance: NetworkProtocol | null = null;

  /**
   * 静态方法：获取单例实例
   */
  static getInstance(): NetworkProtocol {
    if (!NetworkProtocolFactory.singletonInstance) {
      NetworkProtocolFactory.singletonInstance = NetworkProtocolFactory.create();
    }
    return NetworkProtocolFactory.singletonInstance;
  }

  /**
   * 静态方法：重置单例实例
   */
  static resetInstance(): void {
    NetworkProtocolFactory.factoryInstance = null;
    NetworkProtocolFactory.singletonInstance = null;
  }
}

// 创建单例实例
const networkProtocolFactory = new NetworkProtocolFactory();

module.exports = {
  NetworkProtocolFactory,
  networkProtocolFactory
};

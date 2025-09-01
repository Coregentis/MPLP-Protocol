/**
 * Dialog Protocol Factory
 * @description Dialog模块协议工厂 - 协议实例创建和管理
 * @version 1.0.0
 */

import { DialogProtocol, type IMLPPProtocol } from '../protocols/dialog.protocol';
import { DialogManagementService, type CrossCuttingConcerns } from '../../application/services/dialog-management.service';
import { DialogAdapter } from '../adapters/dialog.adapter';

/**
 * 协议工厂配置接口
 */
export interface ProtocolFactoryConfig {
  environment: 'development' | 'staging' | 'production';
  enableLogging: boolean;
  enableMetrics: boolean;
  enableHealthCheck: boolean;
  dependencies: {
    database?: unknown;
    cache?: unknown;
    messageQueue?: unknown;
    monitoring?: unknown;
  };
  features: {
    intelligentControl: boolean;
    criticalThinking: boolean;
    knowledgeSearch: boolean;
    multimodal: boolean;
    collaboration: boolean;
  };
}

/**
 * 协议实例配置接口
 */
export interface ProtocolInstanceConfig {
  instanceId: string;
  protocolVersion: string;
  customCapabilities?: string[];
  overrideDefaults?: Record<string, unknown>;
  integrationConfig?: {
    enabledModules: string[];
    orchestrationScenarios: string[];
    adapterSettings: Record<string, unknown>;
  };
}

/**
 * Dialog协议工厂类
 * 负责创建和管理Dialog协议实例
 */
export class DialogProtocolFactory {
  private static _instance: DialogProtocolFactory;
  private _protocolInstances: Map<string, IMLPPProtocol> = new Map();
  private _factoryConfig: ProtocolFactoryConfig;

  private constructor(config: ProtocolFactoryConfig) {
    this._factoryConfig = config;
  }

  /**
   * 获取工厂单例实例
   * @param config 工厂配置
   * @returns 工厂实例
   */
  public static getInstance(config?: ProtocolFactoryConfig): DialogProtocolFactory {
    if (!DialogProtocolFactory._instance) {
      if (!config) {
        throw new Error('ProtocolFactoryConfig is required for first initialization');
      }
      DialogProtocolFactory._instance = new DialogProtocolFactory(config);
    }
    return DialogProtocolFactory._instance;
  }

  /**
   * 创建Dialog协议实例
   * @param instanceConfig 实例配置
   * @returns 协议实例
   */
  async createProtocolInstance(instanceConfig: ProtocolInstanceConfig): Promise<IMLPPProtocol> {
    try {
      // 检查实例是否已存在
      if (this._protocolInstances.has(instanceConfig.instanceId)) {
        throw new Error(`Protocol instance ${instanceConfig.instanceId} already exists`);
      }

      // 创建依赖服务
      const dependencies = await this._createDependencies();

      // 创建协议实例
      const protocolInstance = new DialogProtocol(dependencies.dialogManagementService);

      // 配置协议实例
      await this._configureProtocolInstance(protocolInstance, instanceConfig);

      // 注册实例
      this._protocolInstances.set(instanceConfig.instanceId, protocolInstance);

      // 记录创建事件
      await this._recordFactoryEvent('protocol_created', {
        instanceId: instanceConfig.instanceId,
        protocolVersion: instanceConfig.protocolVersion,
        timestamp: new Date().toISOString()
      });

      return protocolInstance;
    } catch (error) {
      await this._recordFactoryEvent('protocol_creation_failed', {
        instanceId: instanceConfig.instanceId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * 获取协议实例
   * @param instanceId 实例ID
   * @returns 协议实例或null
   */
  getProtocolInstance(instanceId: string): IMLPPProtocol | null {
    return this._protocolInstances.get(instanceId) || null;
  }

  /**
   * 销毁协议实例
   * @param instanceId 实例ID
   */
  async destroyProtocolInstance(instanceId: string): Promise<void> {
    try {
      const instance = this._protocolInstances.get(instanceId);
      if (!instance) {
        throw new Error(`Protocol instance ${instanceId} not found`);
      }

      // 关闭协议实例
      await instance.shutdown();

      // 移除实例
      this._protocolInstances.delete(instanceId);

      // 记录销毁事件
      await this._recordFactoryEvent('protocol_destroyed', {
        instanceId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await this._recordFactoryEvent('protocol_destruction_failed', {
        instanceId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * 获取所有协议实例
   * @returns 协议实例映射
   */
  getAllProtocolInstances(): Map<string, IMLPPProtocol> {
    return new Map(this._protocolInstances);
  }

  /**
   * 获取工厂状态
   * @returns 工厂状态
   */
  getFactoryStatus(): {
    totalInstances: number;
    activeInstances: number;
    factoryConfig: ProtocolFactoryConfig;
    instanceIds: string[];
  } {
    return {
      totalInstances: this._protocolInstances.size,
      activeInstances: this._protocolInstances.size, // TODO: 检查实际活跃状态
      factoryConfig: this._factoryConfig,
      instanceIds: Array.from(this._protocolInstances.keys())
    };
  }

  /**
   * 更新工厂配置
   * @param newConfig 新配置
   */
  async updateFactoryConfig(newConfig: Partial<ProtocolFactoryConfig>): Promise<void> {
    try {
      this._factoryConfig = { ...this._factoryConfig, ...newConfig };

      // 记录配置更新事件
      await this._recordFactoryEvent('factory_config_updated', {
        updatedFields: Object.keys(newConfig),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await this._recordFactoryEvent('factory_config_update_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * 工厂健康检查
   * @returns 健康状态
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    instances: { [instanceId: string]: string };
    factoryMetrics: {
      totalInstances: number;
      healthyInstances: number;
      unhealthyInstances: number;
    };
  }> {
    const instanceHealths: { [instanceId: string]: string } = {};
    let healthyCount = 0;
    let unhealthyCount = 0;

    // 检查所有实例健康状态
    for (const [instanceId, instance] of this._protocolInstances) {
      try {
        const health = await instance.healthCheck();
        instanceHealths[instanceId] = health.status;
        if (health.status === 'healthy') {
          healthyCount++;
        } else {
          unhealthyCount++;
        }
      } catch (error) {
        instanceHealths[instanceId] = 'critical';
        unhealthyCount++;
      }
    }

    // 确定整体健康状态
    const overallStatus = unhealthyCount === 0 ? 'healthy' :
                         healthyCount > unhealthyCount ? 'degraded' : 'unhealthy';

    return {
      status: overallStatus,
      instances: instanceHealths,
      factoryMetrics: {
        totalInstances: this._protocolInstances.size,
        healthyInstances: healthyCount,
        unhealthyInstances: unhealthyCount
      }
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 创建依赖服务
   * @returns 依赖服务对象
   */
  private async _createDependencies(): Promise<{
    dialogManagementService: DialogManagementService;
    dialogAdapter: DialogAdapter;
  }> {
    // TODO: 等待CoreOrchestrator激活依赖注入
    // 预期功能：通过依赖注入容器创建所有必要的服务实例

    const dialogAdapter = new DialogAdapter();

    // 创建DialogManagementService时需要传入依赖
    const dialogManagementService = new DialogManagementService(
      dialogAdapter,
      {} as CrossCuttingConcerns // 等待CoreOrchestrator激活
    );

    return {
      dialogManagementService,
      dialogAdapter
    };
  }

  /**
   * 配置协议实例
   * @param instance 协议实例
   * @param config 实例配置
   */
  private async _configureProtocolInstance(
    instance: IMLPPProtocol,
    config: ProtocolInstanceConfig
  ): Promise<void> {
    // 初始化协议实例
    await instance.initialize({
      instanceId: config.instanceId,
      protocolVersion: config.protocolVersion,
      customCapabilities: config.customCapabilities,
      overrideDefaults: config.overrideDefaults,
      integrationConfig: config.integrationConfig,
      factoryConfig: this._factoryConfig
    });
  }

  /**
   * 记录工厂事件
   * @param eventType 事件类型
   * @param eventData 事件数据
   */
  private async _recordFactoryEvent(_eventType: string, _eventData: unknown): Promise<void> {
    // TODO: 等待CoreOrchestrator激活事件记录
    // 预期功能：记录工厂操作事件到日志系统
    if (this._factoryConfig.enableLogging) {
      // TODO: 使用统一的日志系统替代console.log
      // console.log(`[DialogProtocolFactory] ${eventType}:`, eventData);
    }
  }

  /**
   * 清理工厂资源
   */
  async cleanup(): Promise<void> {
    try {
      // 关闭所有协议实例
      const shutdownPromises = Array.from(this._protocolInstances.entries()).map(
        async ([_instanceId, instance]) => {
          try {
            await instance.shutdown();
          } catch (error) {
            // TODO: 使用统一的日志系统替代console.error
        // console.error(`Failed to shutdown instance ${instanceId}:`, error);
          }
        }
      );

      await Promise.all(shutdownPromises);

      // 清空实例映射
      this._protocolInstances.clear();

      // 记录清理事件
      await this._recordFactoryEvent('factory_cleanup_completed', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await this._recordFactoryEvent('factory_cleanup_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

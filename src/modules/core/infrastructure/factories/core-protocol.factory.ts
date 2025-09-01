/**
 * Core协议工厂
 * 
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，创建Core协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 协议工厂
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的协议工厂模式
 */

import { CoreProtocol, CoreProtocolConfig } from '../protocols/core.protocol';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { MemoryCoreRepository } from '../repositories/core.repository';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';

// ===== L3横切关注点管理器导入 =====
import {
  // MLPPSecurityManager, // 暂未使用
  // MLPPPerformanceMonitor, // 暂未使用
  // MLPPEventBusManager, // 暂未使用
  // MLPPErrorHandler, // 暂未使用
  // MLPPCoordinationManager, // 暂未使用
  // MLPPOrchestrationManager, // 暂未使用
  // MLPPStateSyncManager, // 暂未使用
  // MLPPTransactionManager, // 暂未使用
  // MLPPProtocolVersionManager, // 暂未使用
  CrossCuttingConcernsFactory
} from '../../../../core/protocols/cross-cutting-concerns';

/**
 * Core协议工厂配置
 */
export interface CoreProtocolFactoryConfig extends CoreProtocolConfig {
  repositoryType?: 'memory' | 'database' | 'file';
  customRepository?: ICoreRepository;
}

/**
 * Core协议工厂
 * 
 * @description 单例工厂，负责创建和配置Core协议实例，集成所有必要的服务和横切关注点管理器
 */
export class CoreProtocolFactory {
  private static instance: CoreProtocolFactory | undefined;
  private crossCuttingFactory: CrossCuttingConcernsFactory;

  private constructor() {
    this.crossCuttingFactory = CrossCuttingConcernsFactory.getInstance();
  }

  /**
   * 获取工厂单例实例
   */
  static getInstance(): CoreProtocolFactory {
    if (!CoreProtocolFactory.instance) {
      CoreProtocolFactory.instance = new CoreProtocolFactory();
    }
    return CoreProtocolFactory.instance;
  }

  /**
   * 创建Core协议实例
   */
  async createProtocol(config: CoreProtocolFactoryConfig = {}): Promise<CoreProtocol> {
    // 1. 创建或使用提供的仓库
    const repository = config.customRepository || this.createRepository(config.repositoryType || 'memory');

    // 2. 创建应用服务
    const managementService = new CoreManagementService(repository);
    const monitoringService = new CoreMonitoringService(repository);
    const orchestrationService = new CoreOrchestrationService(repository);
    const resourceService = new CoreResourceService(repository);

    // 3. 创建横切关注点管理器
    const managers = this.crossCuttingFactory.createManagers({
      security: { enabled: true },
      performance: { enabled: config.enableMetrics || false },
      eventBus: { enabled: true },
      errorHandler: { enabled: true },
      coordination: { enabled: true },
      orchestration: { enabled: true },
      stateSync: { enabled: true },
      transaction: { enabled: true },
      protocolVersion: { enabled: true }
    });

    // 4. 创建协议实例
    const protocol = new CoreProtocol(
      managementService,
      monitoringService,
      orchestrationService,
      resourceService,
      repository,
      managers.security,
      managers.performance,
      managers.eventBus,
      managers.errorHandler,
      managers.coordination,
      managers.orchestration,
      managers.stateSync,
      managers.transaction,
      managers.protocolVersion,
      config
    );

    return protocol;
  }

  /**
   * 创建带有自定义服务的协议实例
   */
  async createProtocolWithServices(
    managementService: CoreManagementService,
    monitoringService: CoreMonitoringService,
    orchestrationService: CoreOrchestrationService,
    resourceService: CoreResourceService,
    repository: ICoreRepository,
    config: CoreProtocolConfig = {}
  ): Promise<CoreProtocol> {
    // 创建横切关注点管理器
    const managers = this.crossCuttingFactory.createManagers({
      security: { enabled: true },
      performance: { enabled: config.enableMetrics || false },
      eventBus: { enabled: true },
      errorHandler: { enabled: true },
      coordination: { enabled: true },
      orchestration: { enabled: true },
      stateSync: { enabled: true },
      transaction: { enabled: true },
      protocolVersion: { enabled: true }
    });

    // 创建协议实例
    const protocol = new CoreProtocol(
      managementService,
      monitoringService,
      orchestrationService,
      resourceService,
      repository,
      managers.security,
      managers.performance,
      managers.eventBus,
      managers.errorHandler,
      managers.coordination,
      managers.orchestration,
      managers.stateSync,
      managers.transaction,
      managers.protocolVersion,
      config
    );

    return protocol;
  }

  /**
   * 创建轻量级协议实例（用于测试）
   */
  async createLightweightProtocol(config: CoreProtocolConfig = {}): Promise<CoreProtocol> {
    // 1. 创建内存仓库
    const repository = new MemoryCoreRepository();

    // 2. 创建应用服务
    const managementService = new CoreManagementService(repository);
    const monitoringService = new CoreMonitoringService(repository);
    const orchestrationService = new CoreOrchestrationService(repository);
    const resourceService = new CoreResourceService(repository);

    // 3. 创建最小化的横切关注点管理器
    const managers = this.crossCuttingFactory.createManagers({
      security: { enabled: false },
      performance: { enabled: false },
      eventBus: { enabled: false },
      errorHandler: { enabled: true },
      coordination: { enabled: false },
      orchestration: { enabled: false },
      stateSync: { enabled: false },
      transaction: { enabled: false },
      protocolVersion: { enabled: true }
    });

    // 4. 创建协议实例
    const protocol = new CoreProtocol(
      managementService,
      monitoringService,
      orchestrationService,
      resourceService,
      repository,
      managers.security,
      managers.performance,
      managers.eventBus,
      managers.errorHandler,
      managers.coordination,
      managers.orchestration,
      managers.stateSync,
      managers.transaction,
      managers.protocolVersion,
      config
    );

    return protocol;
  }

  /**
   * 验证协议配置
   */
  validateConfig(config: CoreProtocolFactoryConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证仓库类型
    if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
      errors.push(`Invalid repository type: ${config.repositoryType}`);
    }

    // 验证自定义仓库
    if (config.customRepository && config.repositoryType) {
      warnings.push('Both customRepository and repositoryType provided. customRepository will be used.');
    }

    // 验证缓存配置
    if (config.enableCaching && !config.enableMetrics) {
      warnings.push('Caching enabled without metrics. Consider enabling metrics for better monitoring.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取支持的仓库类型
   */
  getSupportedRepositoryTypes(): string[] {
    return ['memory', 'database', 'file'];
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): CoreProtocolFactoryConfig {
    return {
      enableLogging: true,
      enableCaching: false,
      enableMetrics: false,
      repositoryType: 'memory'
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 创建仓库实例
   */
  private createRepository(type: 'memory' | 'database' | 'file'): ICoreRepository {
    switch (type) {
      case 'memory':
        return new MemoryCoreRepository();
      case 'database':
        // TODO: 实现数据库仓库
        throw new Error('Database repository not implemented yet');
      case 'file':
        // TODO: 实现文件仓库
        throw new Error('File repository not implemented yet');
      default:
        throw new Error(`Unsupported repository type: ${type}`);
    }
  }

  /**
   * 重置工厂实例（用于测试）
   */
  static resetInstance(): void {
    CoreProtocolFactory.instance = undefined;
  }
}

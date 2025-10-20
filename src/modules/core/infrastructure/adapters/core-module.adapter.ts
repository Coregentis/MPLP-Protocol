/**
 * Core模块适配器
 * 
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，提供Core模块的统一访问接口和外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的适配器模式
 */

import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { MemoryCoreRepository } from '../repositories/core.repository';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
import { CoreReservedInterfacesService } from '../../application/services/core-reserved-interfaces.service';
import { CoreServicesCoordinator } from '../../application/coordinators/core-services-coordinator';
import { CoreProtocol } from '../protocols/core.protocol';
import { CoreProtocolFactory } from '../factories/core-protocol.factory';
import { UUID, WorkflowConfig, ExecutionContext, CoreOperation } from '../../types';

// ===== L3横切关注点管理器导入 =====
import {
  MLPPSecurityManager,
  MLPPPerformanceMonitor,
  MLPPEventBusManager,
  MLPPErrorHandler,
  MLPPCoordinationManager,
  MLPPOrchestrationManager,
  MLPPStateSyncManager,
  MLPPTransactionManager,
  MLPPProtocolVersionManager,
  CrossCuttingConcernsFactory
} from '../../../../core/protocols/cross-cutting-concerns';

/**
 * Core模块适配器配置
 */
export interface CoreModuleAdapterConfig {
  enableLogging?: boolean;
  enableCaching?: boolean;
  enableMetrics?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  maxCacheSize?: number;
  cacheTimeout?: number;
  enableCoordination?: boolean;
  enableReservedInterfaces?: boolean;
}

/**
 * Core模块适配器结果
 */
export interface CoreModuleAdapterResult {
  repository: ICoreRepository;
  managementService: CoreManagementService;
  monitoringService: CoreMonitoringService;
  orchestrationService: CoreOrchestrationService;
  resourceService: CoreResourceService;
  reservedInterfacesService: CoreReservedInterfacesService;
  coordinator: CoreServicesCoordinator;
  protocol: CoreProtocol;
  adapter: CoreModuleAdapter;
}

/**
 * Core模块适配器
 * 
 * @description 统一协调Core模块的5个核心服务，实现完整的工作流生命周期管理和MPLP协议集成
 */
export class CoreModuleAdapter {
  private readonly config: Required<CoreModuleAdapterConfig>;
  private initialized = false;

  // ===== 核心组件 =====
  private repository!: ICoreRepository;
  private managementService!: CoreManagementService;
  private monitoringService!: CoreMonitoringService;
  private orchestrationService!: CoreOrchestrationService;
  private resourceService!: CoreResourceService;
  private reservedInterfacesService!: CoreReservedInterfacesService;
  private coordinator!: CoreServicesCoordinator;
  private protocol!: CoreProtocol;

  // ===== L3横切关注点管理器 (Reserved for future use) =====
  private crossCuttingFactory!: CrossCuttingConcernsFactory;
  private _securityManager!: MLPPSecurityManager;
  private _performanceMonitor!: MLPPPerformanceMonitor;
  private _eventBusManager!: MLPPEventBusManager;
  private _errorHandler!: MLPPErrorHandler;
  private _coordinationManager!: MLPPCoordinationManager;
  private _orchestrationManager!: MLPPOrchestrationManager;
  private _stateSyncManager!: MLPPStateSyncManager;
  private _transactionManager!: MLPPTransactionManager;
  private _protocolVersionManager!: MLPPProtocolVersionManager;

  constructor(config: CoreModuleAdapterConfig = {}) {
    this.config = {
      enableLogging: true,
      enableCaching: false,
      enableMetrics: false,
      repositoryType: 'memory',
      maxCacheSize: 1000,
      cacheTimeout: 300000, // 5分钟
      enableCoordination: true,
      enableReservedInterfaces: true,
      ...config
    };

    // 异步初始化
    this.initialize();
  }

  /**
   * 初始化适配器
   */
  private async initialize(): Promise<void> {
    // 初始化横切关注点管理器
    this.crossCuttingFactory = CrossCuttingConcernsFactory.getInstance();
    const managers = this.crossCuttingFactory.createManagers({
      security: { enabled: true },
      performance: { enabled: this.config.enableMetrics },
      eventBus: { enabled: true },
      errorHandler: { enabled: true },
      coordination: { enabled: this.config.enableCoordination },
      orchestration: { enabled: true },
      stateSync: { enabled: true },
      transaction: { enabled: true },
      protocolVersion: { enabled: true }
    });

    this._securityManager = managers.security;
    this._performanceMonitor = managers.performance;
    this._eventBusManager = managers.eventBus;
    this._errorHandler = managers.errorHandler;
    this._coordinationManager = managers.coordination;
    this._orchestrationManager = managers.orchestration;
    this._stateSyncManager = managers.stateSync;
    this._transactionManager = managers.transaction;
    this._protocolVersionManager = managers.protocolVersion;

    // 初始化核心组件
    this.repository = new MemoryCoreRepository();
    this.managementService = new CoreManagementService(this.repository);
    this.monitoringService = new CoreMonitoringService(this.repository);
    this.orchestrationService = new CoreOrchestrationService(this.repository);
    this.resourceService = new CoreResourceService(this.repository);
    
    if (this.config.enableReservedInterfaces) {
      this.reservedInterfacesService = new CoreReservedInterfacesService();
    }

    if (this.config.enableCoordination) {
      this.coordinator = new CoreServicesCoordinator(
        this.managementService,
        this.monitoringService,
        this.orchestrationService,
        this.resourceService,
        this.repository,
        this.config.enableLogging ? console : undefined
      );
    }

    // 初始化协议
    await this.initializeProtocol();
  }

  /**
   * 初始化协议
   */
  private async initializeProtocol(): Promise<void> {
    const protocolFactory = CoreProtocolFactory.getInstance();
    this.protocol = await protocolFactory.createProtocol({
      enableLogging: this.config.enableLogging,
      enableCaching: this.config.enableCaching,
      enableMetrics: this.config.enableMetrics,
      repositoryType: this.config.repositoryType
    });
    this.initialized = true;
  }

  /**
   * 确保适配器已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('CoreModuleAdapter not initialized. Please wait for initialization to complete.');
    }
  }

  /**
   * 获取所有组件
   */
  getComponents(): CoreModuleAdapterResult {
    this.ensureInitialized();
    
    return {
      repository: this.repository,
      managementService: this.managementService,
      monitoringService: this.monitoringService,
      orchestrationService: this.orchestrationService,
      resourceService: this.resourceService,
      reservedInterfacesService: this.reservedInterfacesService,
      coordinator: this.coordinator,
      protocol: this.protocol,
      adapter: this
    };
  }

  /**
   * 获取仓库实例
   */
  getRepository(): ICoreRepository {
    this.ensureInitialized();
    return this.repository;
  }

  /**
   * 获取管理服务
   */
  getManagementService(): CoreManagementService {
    this.ensureInitialized();
    return this.managementService;
  }

  /**
   * 获取服务协调器
   */
  getCoordinator(): CoreServicesCoordinator {
    this.ensureInitialized();
    if (!this.coordinator) {
      throw new Error('Coordinator not enabled. Set enableCoordination: true in config.');
    }
    return this.coordinator;
  }

  /**
   * 获取预留接口服务
   */
  getReservedInterfacesService(): CoreReservedInterfacesService {
    this.ensureInitialized();
    if (!this.reservedInterfacesService) {
      throw new Error('Reserved interfaces not enabled. Set enableReservedInterfaces: true in config.');
    }
    return this.reservedInterfacesService;
  }

  /**
   * 获取协议实例
   */
  getProtocol(): CoreProtocol {
    this.ensureInitialized();
    return this.protocol;
  }

  /**
   * 创建Core工作流
   */
  async createWorkflow(data: {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    coreOperation: CoreOperation;
  }): Promise<CoreEntity> {
    this.ensureInitialized();
    return await this.managementService.createWorkflow(data);
  }

  /**
   * 协调创建工作流（使用协调器）
   */
  async createWorkflowWithCoordination(params: {
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    coreOperation: CoreOperation;
    enableMonitoring?: boolean;
    enableResourceTracking?: boolean;
  }) {
    this.ensureInitialized();
    if (!this.coordinator) {
      throw new Error('Coordinator not enabled');
    }
    return await this.coordinator.createWorkflowWithFullCoordination(params);
  }

  /**
   * 获取健康状态
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      this.ensureInitialized();
      
      const components = {
        repository: await this.checkRepositoryHealth(),
        managementService: true,
        monitoringService: true,
        orchestrationService: true,
        resourceService: true,
        coordinator: !!this.coordinator,
        protocol: !!this.protocol,
        crossCuttingConcerns: !!this.crossCuttingFactory
      };
      
      const healthyCount = Object.values(components).filter(Boolean).length;
      const totalCount = Object.keys(components).length;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthyCount === totalCount) {
        status = 'healthy';
      } else if (healthyCount > totalCount / 2) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }
      
      return {
        status,
        components,
        timestamp
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        components: {
          repository: false,
          managementService: false,
          monitoringService: false,
          orchestrationService: false,
          resourceService: false,
          coordinator: false,
          protocol: false,
          crossCuttingConcerns: false
        },
        timestamp
      };
    }
  }

  /**
   * 获取模块信息
   */
  getModuleInfo(): {
    name: string;
    version: string;
    description: string;
    layer: string;
    status: string;
    features: string[];
    dependencies: string[];
  } {
    return {
      name: 'core',
      version: '1.0.0',
      description: 'MPLP核心工作流协调和执行模块',
      layer: 'L2',
      status: 'implementing',
      features: [
        '工作流管理',
        '执行协调',
        '资源管理',
        '性能监控',
        '模块协作',
        '预留接口',
        '服务协调',
        '审计追踪',
        '版本历史',
        '搜索索引',
        '缓存策略',
        '事件集成'
      ],
      dependencies: [
        'security',
        'performance',
        'eventBus',
        'errorHandler',
        'coordination',
        'orchestration',
        'stateSync',
        'transaction',
        'protocolVersion'
      ]
    };
  }

  // ===== 私有辅助方法 =====

  /**
   * 检查仓库健康状态
   */
  private async checkRepositoryHealth(): Promise<boolean> {
    try {
      await this.repository.count();
      return true;
    } catch (error) {
      return false;
    }
  }
}

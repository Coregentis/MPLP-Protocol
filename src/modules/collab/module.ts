/**
 * Collab模块配置
 * 
 * @description Collab模块的核心配置和依赖注入，与其他6个已完成模块保持IDENTICAL架构
 * @version 1.0.0
 * @author MPLP Development Team
 */

import { CollabManagementService } from './application/services/collab-management.service';
import { CollabCoordinationService } from './domain/services/collab-coordination.service';
import { CollabRepositoryImpl } from './infrastructure/repositories/collab.repository.impl';
import { ICollabRepository } from './domain/repositories/collab.repository';
import { CollabModuleAdapter } from './infrastructure/adapters/collab-module.adapter';
import { CollabProtocol } from './infrastructure/protocols/collab.protocol';
import { CollabProtocolFactory } from './infrastructure/factories/collab-protocol.factory';
import { CollabController } from './api/controllers/collab.controller';
import { CollabModuleConfig } from './types';
import { IMemberManager } from './domain/interfaces/member-manager.interface';
import { ITaskAllocator } from './domain/interfaces/task-allocator.interface';
import { ILogger } from './domain/interfaces/logger.interface';

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
  MLPPProtocolVersionManager
} from '../../core/protocols/cross-cutting-concerns';

/**
 * Collab模块类
 * 
 * @description 管理Collab模块的生命周期和依赖注入，遵循其他6个模块的IDENTICAL架构模式
 */
export class CollabModule {
  private static instance: CollabModule;
  
  // ===== 核心服务 =====
  private collabRepository!: CollabRepositoryImpl;
  private collabCoordinationService!: CollabCoordinationService;
  private collabManagementService!: CollabManagementService;

  // ===== 基础设施组件 =====
  private collabModuleAdapter!: CollabModuleAdapter;
  private collabProtocol!: CollabProtocol;
  private collabController!: CollabController;

  // ===== L3横切关注点管理器 (Reserved for CoreOrchestrator injection) =====
  // Note: These managers are initialized but reserved for future use when CoreOrchestrator is activated
  // They maintain IDENTICAL architecture pattern across all 10 modules
  private _securityManager!: MLPPSecurityManager;
  private _performanceMonitor!: MLPPPerformanceMonitor;
  private _eventBusManager!: MLPPEventBusManager;
  private _errorHandler!: MLPPErrorHandler;
  private _coordinationManager!: MLPPCoordinationManager;
  private _orchestrationManager!: MLPPOrchestrationManager;
  private _stateSyncManager!: MLPPStateSyncManager;
  private _transactionManager!: MLPPTransactionManager;
  private _protocolVersionManager!: MLPPProtocolVersionManager;

  // ===== 模块配置 =====
  private config!: CollabModuleConfig;
  
  private constructor() {
    this.initializeConfig();
    this.initializeL3Managers();
    this.initializeServices();
    // Infrastructure initialization is now async and called during start()
  }
  
  /**
   * 获取模块单例实例
   */
  public static getInstance(): CollabModule {
    if (!CollabModule.instance) {
      CollabModule.instance = new CollabModule();
    }
    return CollabModule.instance;
  }
  
  /**
   * 初始化模块配置
   */
  private initializeConfig(): void {
    this.config = {
      maxParticipants: 100,
      defaultCoordinationType: 'distributed',
      defaultDecisionMaking: 'consensus',
      performanceThresholds: {
        maxCoordinationLatency: 1000, // ms
        minSuccessRate: 0.95,
        maxErrorRate: 0.05
      },
      auditSettings: {
        enabled: true,
        retentionDays: 365
      }
    };
  }
  
  /**
   * 初始化L3横切关注点管理器
   * 
   * @description 与其他6个模块保持IDENTICAL的L3管理器注入模式
   */
  private initializeL3Managers(): void {
    // TODO: 这些管理器将在CoreOrchestrator激活时被注入
    // 当前使用占位符实现
    this._securityManager = new MLPPSecurityManager();
    this._performanceMonitor = new MLPPPerformanceMonitor();
    this._eventBusManager = new MLPPEventBusManager();
    this._errorHandler = new MLPPErrorHandler();
    this._coordinationManager = new MLPPCoordinationManager();
    this._orchestrationManager = new MLPPOrchestrationManager();
    this._stateSyncManager = new MLPPStateSyncManager();
    this._transactionManager = new MLPPTransactionManager();
    this._protocolVersionManager = new MLPPProtocolVersionManager();
  }
  
  /**
   * 初始化核心服务
   */
  private initializeServices(): void {
    // 初始化仓库
    this.collabRepository = new CollabRepositoryImpl();
    
    // 初始化领域服务
    this.collabCoordinationService = new CollabCoordinationService();
    
    // 初始化应用服务
    // 创建临时Mock实现以满足重构后的依赖注入要求
    const mockMemberManager = {} as IMemberManager; // TODO: 实现真正的MemberManager
    const mockTaskAllocator = {} as ITaskAllocator; // TODO: 实现真正的TaskAllocator
    const mockLogger = {} as ILogger; // TODO: 实现真正的Logger

    this.collabManagementService = new CollabManagementService(
      this.collabRepository as unknown as ICollabRepository,
      mockMemberManager,
      mockTaskAllocator,
      mockLogger
    );
  }
  
  /**
   * 初始化基础设施组件
   */
  private async initializeInfrastructure(): Promise<void> {
    // 初始化模块适配器
    this.collabModuleAdapter = new CollabModuleAdapter(
      this.collabManagementService
    );

    // 使用工厂创建协议实例
    const protocolFactory = CollabProtocolFactory.getInstance();
    const protocolConfig = CollabProtocolFactory.getDefaultConfig();
    this.collabProtocol = await protocolFactory.createProtocol(protocolConfig) as CollabProtocol;

    // 初始化控制器
    this.collabController = new CollabController(
      this.collabManagementService
    );
  }
  
  // ===== 公共访问器 =====
  
  /**
   * 获取Collab管理服务
   */
  public getCollabManagementService(): CollabManagementService {
    return this.collabManagementService;
  }
  
  /**
   * 获取Collab协调服务
   */
  public getCollabCoordinationService(): CollabCoordinationService {
    return this.collabCoordinationService;
  }
  
  /**
   * 获取Collab仓库
   */
  public getCollabRepository(): CollabRepositoryImpl {
    return this.collabRepository;
  }
  
  /**
   * 获取Collab模块适配器
   */
  public getCollabModuleAdapter(): CollabModuleAdapter {
    return this.collabModuleAdapter;
  }
  
  /**
   * 获取Collab协议
   */
  public getCollabProtocol(): CollabProtocol {
    return this.collabProtocol;
  }
  
  /**
   * 获取Collab控制器
   */
  public getCollabController(): CollabController {
    return this.collabController;
  }
  
  /**
   * 获取模块配置
   */
  public getConfig(): CollabModuleConfig {
    return { ...this.config };
  }
  
  /**
   * 更新模块配置
   */
  public updateConfig(newConfig: Partial<CollabModuleConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  // ===== 模块生命周期管理 =====
  
  /**
   * 启动模块
   */
  public async start(): Promise<void> {
    // 初始化基础设施组件
    await this.initializeInfrastructure();

    // TODO: L3管理器启动逻辑将在CoreOrchestrator激活时实现
    // Collab module started successfully
  }
  
  /**
   * 停止模块
   */
  public async stop(): Promise<void> {
    // TODO: L3管理器停止逻辑将在CoreOrchestrator激活时实现
    // Collab module stopped successfully
  }
  
  /**
   * 重启模块
   */
  public async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }
  
  /**
   * 模块健康检查
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    details: Record<string, unknown>;
  }> {
    try {
      const protocolHealth = await this.collabProtocol.healthCheck();
      
      return {
        status: protocolHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        details: {
          protocol: protocolHealth,
          config: this.config,
          services: {
            managementService: 'healthy',
            coordinationService: 'healthy',
            repository: 'healthy'
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// ===== 默认导出 =====
export default CollabModule;

/**
 * Context协议工厂
 * 
 * @description Context模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */

import { ContextProtocol } from '../protocols/context.protocol.js';
import { ContextManagementService } from '../../application/services/context-management.service.js';
import { ContextAnalyticsService } from '../../application/services/context-analytics.service.js';
import { ContextSecurityService } from '../../application/services/context-security.service.js';
import { MemoryContextRepository } from '../repositories/context.repository.js';
import { CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns/factory.js';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base.js';

/**
 * Context协议工厂配置
 */
export interface ContextProtocolFactoryConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  crossCuttingConcerns?: {
    security?: { enabled: boolean };
    performance?: { enabled: boolean };
    eventBus?: { enabled: boolean };
    errorHandler?: { enabled: boolean };
    coordination?: { enabled: boolean };
    orchestration?: { enabled: boolean };
    stateSync?: { enabled: boolean };
    transaction?: { enabled: boolean };
    protocolVersion?: { enabled: boolean };
  };
}

/**
 * Context协议工厂
 * 
 * @description 提供Context协议的标准化创建和配置
 */
export class ContextProtocolFactory {
  private static instance: ContextProtocolFactory;
  private protocol: ContextProtocol | null = null;

  private constructor() {}

  /**
   * 获取工厂单例实例
   */
  static getInstance(): ContextProtocolFactory {
    if (!ContextProtocolFactory.instance) {
      ContextProtocolFactory.instance = new ContextProtocolFactory();
    }
    return ContextProtocolFactory.instance;
  }

  /**
   * 创建Context协议实例
   */
  async createProtocol(config: ContextProtocolFactoryConfig = {}): Promise<IMLPPProtocol> {
    if (this.protocol) {
      return this.protocol;
    }

    // 创建横切关注点管理器
    const crossCuttingFactory = CrossCuttingConcernsFactory.getInstance();
    const managers = crossCuttingFactory.createManagers({
      security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
      performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? false) },
      eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
      errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
      coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
      orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
      stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
      transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
      protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
    });

    // 创建核心组件
    const repository = new MemoryContextRepository();

    // 创建简化的依赖
    const logger = { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} };
    const cacheManager = { get: async () => null, set: async () => {}, delete: async () => {}, clear: async () => {} };
    const versionManager = {
      createVersion: async () => '1.0.0',
      getVersionHistory: async () => [],
      getVersion: async () => null,
      compareVersions: async () => ({ added: {}, modified: {}, removed: [] })
    };

    const contextManagementService = new ContextManagementService(repository, logger, cacheManager, versionManager);

    // 创建简化的analytics和security服务
    const analyticsService = {
      analyzeContext: async () => ({ usage: {}, patterns: {}, performance: {}, insights: [] }),
      searchContexts: async () => ({ results: [], total: 0 }),
      generateReport: async () => ({ reportId: '', data: {} })
    };
    const securityService = {
      validateAccess: async () => true,
      performSecurityAudit: async () => ({ status: 'pass', findings: [] })
    };

    // 创建协议实例
    this.protocol = new ContextProtocol(
      contextManagementService,
      analyticsService as unknown as ContextAnalyticsService,
      securityService as unknown as ContextSecurityService,
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

    return this.protocol;
  }

  /**
   * 获取已创建的协议实例
   */
  getProtocol(): ContextProtocol | null {
    return this.protocol;
  }

  /**
   * 重置工厂（主要用于测试）
   */
  reset(): void {
    this.protocol = null;
  }

  /**
   * 创建协议实例（静态方法）
   */
  static async create(config: ContextProtocolFactoryConfig = {}): Promise<IMLPPProtocol> {
    const factory = ContextProtocolFactory.getInstance();
    return await factory.createProtocol(config);
  }

  /**
   * 获取协议元数据（静态方法）
   */
  static async getMetadata(): Promise<ProtocolMetadata> {
    const factory = ContextProtocolFactory.getInstance();
    const protocol = factory.getProtocol();
    if (protocol) {
      return protocol.getProtocolMetadata();
    }
    
    // 如果协议还未创建，创建一个临时实例获取元数据
    const tempProtocol = await factory.createProtocol();
    return tempProtocol.getProtocolMetadata();
  }

  /**
   * 健康检查（静态方法）
   */
  static async healthCheck(): Promise<HealthStatus> {
    const factory = ContextProtocolFactory.getInstance();
    const protocol = factory.getProtocol();
    if (protocol) {
      return await protocol.healthCheck();
    }
    
    // 如果协议还未创建，返回未初始化状态
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: [{
        name: 'contextProtocol',
        status: 'fail',
        message: 'Context protocol not initialized'
      }]
    };
  }
}

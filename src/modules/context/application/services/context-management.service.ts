/**
 * Context管理服务 - MPLP v1.0 支持14个功能域
 *
 * 核心业务逻辑层，处理Context的业务操作
 * 基于完整的mplp-context.json Schema
 *
 * @version 1.0.0
 * @updated 2025-08-14
 */

import { UUID } from '../../../../public/shared/types';
import { Context } from '../../domain/entities/context.entity';
import { IContextRepository, ContextFilter, PaginationParams, PaginatedResult } from '../../domain/repositories/context-repository.interface';
import { ContextEntityData } from '../../api/mappers/context.mapper';
import { EntityStatus, ContextStatus } from '../../types';

/**
 * Context创建请求
 */
export interface CreateContextRequest {
  name: string;
  description?: string;
  status: string;
  lifecycleStage: string;
  
  // 可选的功能域配置
  sharedStateConfig?: Partial<ContextEntityData['sharedState']>;
  accessControlConfig?: Partial<ContextEntityData['accessControl']>;
  configurationConfig?: Partial<ContextEntityData['configuration']>;
  auditConfig?: Partial<ContextEntityData['auditTrail']>;
  monitoringConfig?: Partial<ContextEntityData['monitoringIntegration']>;
  performanceConfig?: Partial<ContextEntityData['performanceMetrics']>;
  versioningConfig?: Partial<ContextEntityData['versionHistory']>;
  searchConfig?: Partial<ContextEntityData['searchMetadata']>;
  cachingConfig?: Partial<ContextEntityData['cachingPolicy']>;
  syncConfig?: Partial<ContextEntityData['syncConfiguration']>;
  errorHandlingConfig?: Partial<ContextEntityData['errorHandling']>;
  integrationConfig?: Partial<ContextEntityData['integrationEndpoints']>;
  eventConfig?: Partial<ContextEntityData['eventIntegration']>;
}

/**
 * Context更新请求
 */
export interface UpdateContextRequest {
  name?: string;
  description?: string;
  status?: EntityStatus;
  lifecycleStage?: string;
  
  // 功能域更新
  sharedStateUpdates?: Partial<ContextEntityData['sharedState']>;
  accessControlUpdates?: Partial<ContextEntityData['accessControl']>;
  configurationUpdates?: Partial<ContextEntityData['configuration']>;
  auditUpdates?: Partial<ContextEntityData['auditTrail']>;
  monitoringUpdates?: Partial<ContextEntityData['monitoringIntegration']>;
  performanceUpdates?: Partial<ContextEntityData['performanceMetrics']>;
  versioningUpdates?: Partial<ContextEntityData['versionHistory']>;
  searchUpdates?: Partial<ContextEntityData['searchMetadata']>;
  cachingUpdates?: Partial<ContextEntityData['cachingPolicy']>;
  syncUpdates?: Partial<ContextEntityData['syncConfiguration']>;
  errorHandlingUpdates?: Partial<ContextEntityData['errorHandling']>;
  integrationUpdates?: Partial<ContextEntityData['integrationEndpoints']>;
  eventUpdates?: Partial<ContextEntityData['eventIntegration']>;
}

/**
 * Context管理服务结果
 */
export interface ContextServiceResult<T = Context> {
  success: boolean;
  data?: T;
  error?: string | Array<{ field: string; message: string }>;
  validationErrors?: string[];
}

/**
 * 验证服务接口
 */
interface ValidationService {
  validateContext(context: Context): Array<{ field: string; message: string }>;
  validateDeletion?(context: Context): { field: string; message: string } | null;
}

/**
 * Context工厂接口
 */
interface ContextFactory {
  createContext(request: CreateContextRequest): Context;
}

/**
 * Context管理服务 v2.0
 */
export class ContextManagementService {
  constructor(
    private readonly repository: IContextRepository,
    private readonly validationService?: ValidationService,
    private readonly contextFactory?: ContextFactory
  ) {}

  /**
   * 创建新的Context
   */
  async createContext(request: CreateContextRequest): Promise<ContextServiceResult> {
    try {
      // 创建Context实例
      let context: Context;
      if (this.contextFactory) {
        context = this.contextFactory.createContext(request);
      } else {
        // 创建Context数据
        const contextData = this.buildContextData(request);
        context = new Context(contextData);
      }

      // 验证Context
      let validationErrors: Array<{ field: string; message: string }> = [];
      if (this.validationService) {
        validationErrors = this.validationService.validateContext(context);
      } else {
        // 使用内置验证
        const validationResult = this.validateCreateRequest(request);
        if (!validationResult.isValid) {
          validationErrors = validationResult.errors.map(error => ({ field: 'general', message: error }));
        }
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors
        };
      }

      // 检查名称唯一性
      const existing = await this.repository.findByName(request.name);
      if (existing) {
        return {
          success: false,
          error: `Context with name "${request.name}" already exists`
        };
      }

      // 保存
      await this.repository.save(context);

      return {
        success: true,
        data: context
      };

    } catch (error) {
      return {
        success: false,
        error: [{
          field: 'system',
          message: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  /**
   * 更新Context
   */
  async updateContext(id: UUID, request: UpdateContextRequest): Promise<ContextServiceResult> {
    try {
      // 查找现有Context
      const existing = await this.repository.findById(id);
      if (!existing) {
        return {
          success: false,
          error: `Context with id "${id}" not found`
        };
      }

      // 应用更新
      this.applyUpdates(existing, request);

      // 验证更新后的实体
      const validation = existing.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Validation failed after update',
          validationErrors: validation.errors
        };
      }

      // 保存更新
      await this.repository.save(existing);

      return {
        success: true,
        data: existing
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }



  /**
   * 获取Context
   */
  async getContext(id: UUID): Promise<ContextServiceResult> {
    try {
      const context = await this.repository.findById(id);
      if (!context) {
        return {
          success: false,
          error: `Context with id "${id}" not found`
        };
      }

      return {
        success: true,
        data: context
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 查询Context列表
   */
  async queryContexts(
    filter?: ContextFilter, 
    pagination?: PaginationParams
  ): Promise<ContextServiceResult<PaginatedResult<Context>>> {
    try {
      const result = await this.repository.findMany(filter, pagination);

      return {
        success: true,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取Context统计信息
   */
  async getContextStatistics(): Promise<ContextServiceResult<{
    total: number;
    statusStats: Record<string, number>;
    lifecycleStats: Record<string, number>;
    featureDomainStats: Record<string, unknown>;
    configurationStats: Record<string, unknown>;
  }>> {
    try {
      const [
        total,
        statusStats,
        lifecycleStats,
        featureDomainStats,
        configurationStats
      ] = await Promise.all([
        this.repository.count(),
        this.repository.getStatusStatistics(),
        this.repository.getLifecycleStageStatistics(),
        this.repository.getFeatureDomainStatistics(),
        this.repository.getConfigurationStatistics()
      ]);

      return {
        success: true,
        data: {
          total,
          statusStats,
          lifecycleStats,
          featureDomainStats,
          configurationStats
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 验证创建请求
   */
  private validateCreateRequest(request: CreateContextRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!request.status) {
      errors.push('Status is required');
    }

    if (!request.lifecycleStage) {
      errors.push('Lifecycle stage is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 构建Context数据
   */
  private buildContextData(request: CreateContextRequest): ContextEntityData {
    const defaultSharedState = this.getDefaultSharedState();
    const defaultAccessControl = this.getDefaultAccessControl();
    const defaultConfiguration = this.getDefaultConfiguration();
    const defaultAuditTrail = this.getDefaultAuditTrail();
    const defaultMonitoringIntegration = this.getDefaultMonitoringIntegration();
    const defaultPerformanceMetrics = this.getDefaultPerformanceMetrics();
    const defaultVersionHistory = this.getDefaultVersionHistory();
    const defaultSearchMetadata = this.getDefaultSearchMetadata();
    const defaultCachingPolicy = this.getDefaultCachingPolicy();
    const defaultSyncConfiguration = this.getDefaultSyncConfiguration();
    const defaultErrorHandling = this.getDefaultErrorHandling();
    const defaultIntegrationEndpoints = this.getDefaultIntegrationEndpoints();
    const defaultEventIntegration = this.getDefaultEventIntegration();

    return {
      protocolVersion: '1.0.0',
      timestamp: new Date(),
      contextId: this.generateUUID(),
      name: request.name,
      description: request.description,
      status: request.status,
      lifecycleStage: request.lifecycleStage,

      // 合并默认配置和请求中的配置
      sharedState: request.sharedStateConfig ? { ...defaultSharedState, ...request.sharedStateConfig } : defaultSharedState,
      accessControl: request.accessControlConfig ? { ...defaultAccessControl, ...request.accessControlConfig } : defaultAccessControl,
      configuration: request.configurationConfig ? { ...defaultConfiguration, ...request.configurationConfig } : defaultConfiguration,
      auditTrail: request.auditConfig ? { ...defaultAuditTrail, ...request.auditConfig } : defaultAuditTrail,
      monitoringIntegration: request.monitoringConfig ? { ...defaultMonitoringIntegration, ...request.monitoringConfig } : defaultMonitoringIntegration,
      performanceMetrics: request.performanceConfig ? { ...defaultPerformanceMetrics, ...request.performanceConfig } : defaultPerformanceMetrics,
      versionHistory: request.versioningConfig ? { ...defaultVersionHistory, ...request.versioningConfig } : defaultVersionHistory,
      searchMetadata: request.searchConfig ? { ...defaultSearchMetadata, ...request.searchConfig } : defaultSearchMetadata,
      cachingPolicy: request.cachingConfig ? { ...defaultCachingPolicy, ...request.cachingConfig } : defaultCachingPolicy,
      syncConfiguration: request.syncConfig ? { ...defaultSyncConfiguration, ...request.syncConfig } : defaultSyncConfiguration,
      errorHandling: request.errorHandlingConfig ? { ...defaultErrorHandling, ...request.errorHandlingConfig } : defaultErrorHandling,
      integrationEndpoints: request.integrationConfig ? { ...defaultIntegrationEndpoints, ...request.integrationConfig } : defaultIntegrationEndpoints,
      eventIntegration: request.eventConfig ? { ...defaultEventIntegration, ...request.eventConfig } : defaultEventIntegration
    };
  }

  /**
   * 应用更新
   */
  private applyUpdates(context: Context, request: UpdateContextRequest): void {
    if (request.name !== undefined) context.name = request.name;
    if (request.description !== undefined) context.description = request.description;
    if (request.status !== undefined) context.status = request.status;
    if (request.lifecycleStage !== undefined) context.lifecycleStage = request.lifecycleStage;

    // 应用功能域更新
    if (request.sharedStateUpdates) {
      const currentSharedState = context.sharedState || {
        variables: {},
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      };
      context.sharedState = { ...currentSharedState, ...request.sharedStateUpdates };
    }
    if (request.accessControlUpdates) {
      const currentAccessControl = context.accessControl || {
        owner: { userId: '', role: '' },
        permissions: []
      };
      context.accessControl = { ...currentAccessControl, ...request.accessControlUpdates };
    }
    if (request.configurationUpdates) {
      context.configuration = { ...context.configuration, ...request.configurationUpdates };
    }
    if (request.auditUpdates) {
      context.auditTrail = { ...context.auditTrail, ...request.auditUpdates };
    }
    if (request.monitoringUpdates) {
      context.monitoringIntegration = { ...context.monitoringIntegration, ...request.monitoringUpdates };
    }
    if (request.performanceUpdates) {
      context.performanceMetrics = { ...context.performanceMetrics, ...request.performanceUpdates };
    }
    if (request.versioningUpdates) {
      context.versionHistory = { ...context.versionHistory, ...request.versioningUpdates };
    }
    if (request.searchUpdates) {
      context.searchMetadata = { ...context.searchMetadata, ...request.searchUpdates };
    }
    if (request.cachingUpdates) {
      context.cachingPolicy = { ...context.cachingPolicy, ...request.cachingUpdates };
    }
    if (request.syncUpdates) {
      context.syncConfiguration = { ...context.syncConfiguration, ...request.syncUpdates };
    }
    if (request.errorHandlingUpdates) {
      context.errorHandling = { ...context.errorHandling, ...request.errorHandlingUpdates };
    }
    if (request.integrationUpdates) {
      context.integrationEndpoints = { ...context.integrationEndpoints, ...request.integrationUpdates };
    }
    if (request.eventUpdates) {
      context.eventIntegration = { ...context.eventIntegration, ...request.eventUpdates };
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ===== 默认配置方法 =====
  
  private getDefaultSharedState(): ContextEntityData['sharedState'] {
    return {
      variables: {},
      resources: { allocated: {}, requirements: {} },
      dependencies: [],
      goals: []
    };
  }

  private getDefaultAccessControl(): ContextEntityData['accessControl'] {
    return {
      owner: { userId: 'system', role: 'owner' },
      permissions: []
    };
  }

  private getDefaultConfiguration(): ContextEntityData['configuration'] {
    return {
      timeoutSettings: { defaultTimeout: 300, maxTimeout: 3600 },
      persistence: { enabled: true, storageBackend: 'memory' }
    };
  }

  private getDefaultAuditTrail(): ContextEntityData['auditTrail'] {
    return {
      enabled: false,
      retentionDays: 30,
      auditEvents: []
    };
  }

  private getDefaultMonitoringIntegration(): ContextEntityData['monitoringIntegration'] {
    return {
      enabled: false,
      supportedProviders: [],
      exportFormats: []
    };
  }

  private getDefaultPerformanceMetrics(): ContextEntityData['performanceMetrics'] {
    return {
      enabled: false,
      collectionIntervalSeconds: 60
    };
  }

  private getDefaultVersionHistory(): ContextEntityData['versionHistory'] {
    return {
      enabled: false,
      maxVersions: 10,
      versions: []
    };
  }

  private getDefaultSearchMetadata(): ContextEntityData['searchMetadata'] {
    return {
      enabled: false,
      indexingStrategy: 'none',
      searchableFields: [],
      searchIndexes: []
    };
  }

  private getDefaultCachingPolicy(): ContextEntityData['cachingPolicy'] {
    return {
      enabled: false,
      cacheStrategy: 'none',
      cacheLevels: []
    };
  }

  private getDefaultSyncConfiguration(): ContextEntityData['syncConfiguration'] {
    return {
      enabled: false,
      syncStrategy: 'none',
      syncTargets: []
    };
  }

  private getDefaultErrorHandling(): ContextEntityData['errorHandling'] {
    return {
      enabled: false,
      errorPolicies: []
    };
  }

  private getDefaultIntegrationEndpoints(): ContextEntityData['integrationEndpoints'] {
    return {
      enabled: false,
      webhooks: [],
      apiEndpoints: []
    };
  }

  private getDefaultEventIntegration(): ContextEntityData['eventIntegration'] {
    return {
      enabled: false,
      publishedEvents: [],
      subscribedEvents: []
    };
  }

  /**
   * 根据ID获取Context
   */
  async getContextById(id: UUID): Promise<Context | null> {
    try {
      const context = await this.repository.findById(id);
      return context;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get context: ${error.message}`);
      }
      throw new Error('Failed to get context: Unknown error');
    }
  }

  /**
   * 删除Context
   */
  async deleteContext(id: UUID): Promise<ContextServiceResult> {
    try {
      // 查找现有Context
      const existing = await this.repository.findById(id);
      if (!existing) {
        return {
          success: false,
          error: [{
            field: 'contextId',
            message: 'Context not found'
          }]
        };
      }

      // 验证是否可以删除
      if (this.validationService && this.validationService.validateDeletion) {
        const deletionValidation = this.validationService.validateDeletion(existing);
        if (deletionValidation) {
          return {
            success: false,
            error: [deletionValidation]
          };
        }
      }

      // 标记为已终止
      if (typeof existing.terminate === 'function') {
        existing.terminate();
      } else {
        // 如果没有terminate方法，设置状态为terminated
        existing.status = ContextStatus.TERMINATED;
      }

      // 保存更改
      await this.repository.save(existing);

      return {
        success: true,
        data: existing
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

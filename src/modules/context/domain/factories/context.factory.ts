/**
 * Context工厂
 * 
 * 负责创建Context领域对象
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { v4 as uuidv4 } from 'uuid';
import { Context } from '../entities/context.entity';
import { ContextLifecycleStage } from '../../../../public/shared/types/context-types';
import { EntityStatus, UUID } from '../../../../public/shared/types';
import { ContextValidationService } from '../services/context-validation.service';

/**
 * Context创建参数
 */
export interface CreateContextParams {
  name: string;
  description?: string | null;
  lifecycleStage?: ContextLifecycleStage;
  status?: EntityStatus;
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Context工厂
 */
export class ContextFactory {
  private validationService: ContextValidationService;

  constructor() {
    this.validationService = new ContextValidationService();
  }

  /**
   * 创建新的Context
   */
  createContext(params: CreateContextParams): Context {
    // 验证输入参数
    const nameError = this.validationService.validateName(params.name);
    if (nameError) {
      throw new Error(`Invalid context name: ${nameError.message}`);
    }

    const descriptionError = this.validationService.validateDescription(params.description ?? null);
    if (descriptionError) {
      throw new Error(`Invalid context description: ${descriptionError.message}`);
    }

    const contextId = uuidv4();
    const now = new Date();

    // 使用默认值或提供的参数
    const name = params.name;
    const description = params.description ?? null;
    const lifecycleStage = params.lifecycleStage ?? ContextLifecycleStage.PLANNING;
    const status = params.status ?? EntityStatus.ACTIVE;
    
    // 创建配置对象
    let _configuration: Record<string, unknown> = {};
    if (params.configuration) {
      _configuration = params.configuration;
    }

    // 创建元数据对象
    let _metadata: Record<string, unknown> = {
      createdBy: 'system',
      version: '1.0.0'
    };
    if (params.metadata) {
      _metadata = {
        ..._metadata,
        ...params.metadata
      };
    }
    
    // 创建Context实例
    return new Context({
      protocolVersion: '1.0.0',
      timestamp: now,
      contextId,
      name,
      description: description || undefined,
      status,
      lifecycleStage,
      sharedState: {
        variables: {},
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      },
      accessControl: {
        owner: { userId: '', role: '' },
        permissions: []
      },
      configuration: {
        timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
        persistence: { enabled: false, storageBackend: 'memory' }
      },
      auditTrail: {
        enabled: false,
        retentionDays: 30,
        auditEvents: []
      },
      monitoringIntegration: {
        enabled: false,
        supportedProviders: [],
        exportFormats: []
      },
      performanceMetrics: {
        enabled: false,
        collectionIntervalSeconds: 60
      },
      versionHistory: {
        enabled: false,
        maxVersions: 10,
        versions: []
      },
      searchMetadata: {
        enabled: false,
        indexingStrategy: 'basic',
        searchableFields: [],
        searchIndexes: []
      },
      cachingPolicy: {
        enabled: false,
        cacheStrategy: 'none',
        cacheLevels: []
      },
      syncConfiguration: {
        enabled: false,
        syncStrategy: 'none',
        syncTargets: []
      },
      errorHandling: {
        enabled: false,
        errorPolicies: []
      },
      integrationEndpoints: {
        enabled: false,
        webhooks: [],
        apiEndpoints: []
      },
      eventIntegration: {
        enabled: false,
        publishedEvents: [],
        subscribedEvents: []
      }
    });
  }
  
  /**
   * 从持久化数据重建Context
   */
  reconstitute(
    contextId: UUID,
    name: string,
    description: string | null,
    lifecycleStage: ContextLifecycleStage,
    status: EntityStatus,
    _createdAt: Date,
    updatedAt: Date,
    _sessionIds: UUID[],
    _sharedStateIds: UUID[],
    _configuration: Record<string, unknown>,
    _metadata: Record<string, unknown>
  ): Context {
    // TODO: 这个方法需要重构以匹配新的Context构造函数
    // 暂时返回一个基本的Context实例
    return new Context({
      protocolVersion: '1.0.0',
      timestamp: updatedAt,
      contextId,
      name,
      description: description || undefined,
      status: status as string,
      lifecycleStage: lifecycleStage as string,
      sharedState: {
        variables: {},
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      },
      accessControl: {
        owner: { userId: '', role: '' },
        permissions: []
      },
      configuration: {
        timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
        persistence: { enabled: false, storageBackend: 'memory' }
      },
      auditTrail: {
        enabled: false,
        retentionDays: 30,
        auditEvents: []
      },
      monitoringIntegration: {
        enabled: false,
        supportedProviders: [],
        exportFormats: []
      },
      performanceMetrics: {
        enabled: false,
        collectionIntervalSeconds: 60
      },
      versionHistory: {
        enabled: false,
        maxVersions: 10,
        versions: []
      },
      searchMetadata: {
        enabled: false,
        indexingStrategy: 'basic',
        searchableFields: [],
        searchIndexes: []
      },
      cachingPolicy: {
        enabled: false,
        cacheStrategy: 'none',
        cacheLevels: []
      },
      syncConfiguration: {
        enabled: false,
        syncStrategy: 'none',
        syncTargets: []
      },
      errorHandling: {
        enabled: false,
        errorPolicies: []
      },
      integrationEndpoints: {
        enabled: false,
        webhooks: [],
        apiEndpoints: []
      },
      eventIntegration: {
        enabled: false,
        publishedEvents: [],
        subscribedEvents: []
      }
    });
  }
  
  /**
   * 创建Context的副本
   */
  cloneContext(context: Context, overrides: Partial<CreateContextParams> = {}): Context {
    // TODO: 这个方法需要重构以匹配新的Context构造函数
    // 暂时返回一个基本的Context实例
    const contextData = context.toData();
    return new Context({
      ...contextData,
      contextId: uuidv4(), // 新ID
      name: overrides.name ?? context.name,
      description: overrides.description ?? context.description,
      lifecycleStage: overrides.lifecycleStage ?? context.lifecycleStage ?? 'planning',
      status: overrides.status ?? context.status,
      timestamp: new Date() // 新时间戳
    });
  }
} 
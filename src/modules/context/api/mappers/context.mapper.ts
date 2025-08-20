/**
 * Context模块Schema-TypeScript映射器
 *
 * 实现MPLP双重命名约定：
 * - Schema层：snake_case
 * - TypeScript层：camelCase
 *
 * @version 1.0.0
 * @created 2025-08-09
 */

// Context entity is available if needed for future use

/**
 * Context Schema接口 (snake_case) - 基于mplp-context.json
 */
export interface ContextSchema {
  // 基础协议字段
  protocol_version: string;
  timestamp: string;
  context_id: string;
  name: string;
  description?: string;
  status: string;
  lifecycle_stage: string;

  // 14个功能域
  shared_state: {
    variables: Record<string, unknown>;
    resources: {
      allocated: Record<string, {
        type: string;
        amount: number;
        unit: string;
        status: string;
      }>;
      requirements: Record<string, {
        minimum: number;
        optimal?: number;
        maximum?: number;
        unit: string;
      }>;
    };
    dependencies: Array<{
      id: string;
      type: string;
      name: string;
      version?: string;
      status: string;
    }>;
    goals: Array<{
      id: string;
      name: string;
      description?: string;
      priority: string;
      status: string;
      success_criteria?: Array<{
        metric: string;
        operator: string;
        value: string | number | boolean;
        unit?: string;
      }>;
    }>;
  };

  access_control: {
    owner: {
      user_id: string;
      role: string;
    };
    permissions: Array<{
      principal: string;
      principal_type: string;
      resource: string;
      actions: string[];
      conditions?: Record<string, unknown>;
    }>;
    policies?: Array<{
      id: string;
      name: string;
      type: string;
      rules: unknown[];
      enforcement: string;
    }>;
  };

  configuration: {
    timeout_settings: {
      default_timeout: number;
      max_timeout: number;
      cleanup_timeout?: number;
    };
    notification_settings?: {
      enabled: boolean;
      channels?: string[];
      events?: string[];
    };
    persistence: {
      enabled: boolean;
      storage_backend: string;
      retention_policy?: {
        duration?: string;
        max_versions?: number;
      };
    };
  };

  audit_trail: {
    enabled: boolean;
    retention_days: number;
    audit_events: unknown[];
    compliance_settings?: Record<string, unknown>;
  };

  monitoring_integration: {
    enabled: boolean;
    supported_providers: string[];
    integration_endpoints?: Record<string, unknown>;
    context_metrics?: Record<string, unknown>;
    export_formats: string[];
  };

  performance_metrics: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: Record<string, unknown>;
    health_status?: Record<string, unknown>;
    alerting?: Record<string, unknown>;
  };

  version_history: {
    enabled: boolean;
    max_versions: number;
    versions: unknown[];
    auto_versioning?: Record<string, unknown>;
  };

  search_metadata: {
    enabled: boolean;
    indexing_strategy: string;
    searchable_fields: string[];
    search_indexes: unknown[];
    context_indexing?: Record<string, unknown>;
    auto_indexing?: Record<string, unknown>;
  };

  caching_policy: {
    enabled: boolean;
    cache_strategy: string;
    cache_levels: unknown[];
    cache_warming?: Record<string, unknown>;
  };

  sync_configuration: {
    enabled: boolean;
    sync_strategy: string;
    sync_targets: unknown[];
    replication?: Record<string, unknown>;
  };

  error_handling: {
    enabled: boolean;
    error_policies: unknown[];
    circuit_breaker?: Record<string, unknown>;
    recovery_strategy?: Record<string, unknown>;
  };

  integration_endpoints: {
    enabled: boolean;
    webhooks: unknown[];
    api_endpoints: unknown[];
  };

  event_integration: {
    enabled: boolean;
    event_bus_connection?: Record<string, unknown>;
    published_events: string[];
    subscribed_events: string[];
    event_routing?: Record<string, unknown>;
  };
}

/**
 * Context TypeScript数据接口 (camelCase) - 对应ContextSchema
 */
export interface ContextEntityData {
  // 基础协议字段
  protocolVersion: string;
  timestamp: Date;
  contextId: string;
  name: string;
  description?: string;
  status: string;
  lifecycleStage: string;

  // 14个功能域 (camelCase)
  sharedState: {
    variables: Record<string, unknown>;
    resources: {
      allocated: Record<string, {
        type: string;
        amount: number;
        unit: string;
        status: string;
      }>;
      requirements: Record<string, {
        minimum: number;
        optimal?: number;
        maximum?: number;
        unit: string;
      }>;
    };
    dependencies: Array<{
      id: string;
      type: string;
      name: string;
      version?: string;
      status: string;
    }>;
    goals: Array<{
      id: string;
      name: string;
      description?: string;
      priority: string;
      status: string;
      successCriteria?: Array<{
        metric: string;
        operator: string;
        value: string | number | boolean;
        unit?: string;
      }>;
    }>;
  };

  accessControl: {
    owner: {
      userId: string;
      role: string;
    };
    permissions: Array<{
      principal: string;
      principalType: string;
      resource: string;
      actions: string[];
      conditions?: Record<string, unknown>;
    }>;
    policies?: Array<{
      id: string;
      name: string;
      type: string;
      rules: unknown[];
      enforcement: string;
    }>;
  };

  configuration: {
    timeoutSettings: {
      defaultTimeout: number;
      maxTimeout: number;
      cleanupTimeout?: number;
    };
    notificationSettings?: {
      enabled: boolean;
      channels?: string[];
      events?: string[];
    };
    persistence: {
      enabled: boolean;
      storageBackend: string;
      retentionPolicy?: {
        duration?: string;
        maxVersions?: number;
      };
    };
  };

  auditTrail: {
    enabled: boolean;
    retentionDays: number;
    auditEvents: unknown[];
    complianceSettings?: Record<string, unknown>;
  };

  monitoringIntegration: {
    enabled: boolean;
    supportedProviders: string[];
    integrationEndpoints?: Record<string, unknown>;
    contextMetrics?: Record<string, unknown>;
    exportFormats: string[];
  };

  performanceMetrics: {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics?: Record<string, unknown>;
    healthStatus?: Record<string, unknown>;
    alerting?: Record<string, unknown>;
  };

  versionHistory: {
    enabled: boolean;
    maxVersions: number;
    versions: unknown[];
    autoVersioning?: Record<string, unknown>;
  };

  searchMetadata: {
    enabled: boolean;
    indexingStrategy: string;
    searchableFields: string[];
    searchIndexes: unknown[];
    contextIndexing?: Record<string, unknown>;
    autoIndexing?: Record<string, unknown>;
  };

  cachingPolicy: {
    enabled: boolean;
    cacheStrategy: string;
    cacheLevels: unknown[];
    cacheWarming?: Record<string, unknown>;
  };

  syncConfiguration: {
    enabled: boolean;
    syncStrategy: string;
    syncTargets: unknown[];
    replication?: Record<string, unknown>;
  };

  errorHandling: {
    enabled: boolean;
    errorPolicies: unknown[];
    circuitBreaker?: Record<string, unknown>;
    recoveryStrategy?: Record<string, unknown>;
  };

  integrationEndpoints: {
    enabled: boolean;
    webhooks: unknown[];
    apiEndpoints: unknown[];
  };

  eventIntegration: {
    enabled: boolean;
    eventBusConnection?: Record<string, unknown>;
    publishedEvents: string[];
    subscribedEvents: string[];
    eventRouting?: Record<string, unknown>;
  };
}

/**
 * Context映射器 - 完整的14个功能域映射
 */
export class ContextMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(entity: ContextEntityData): ContextSchema {
    return {
      // 基础协议字段
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      lifecycle_stage: entity.lifecycleStage,

      // 共享状态映射
      shared_state: {
        variables: entity.sharedState.variables,
        resources: {
          allocated: entity.sharedState.resources.allocated,
          requirements: entity.sharedState.resources.requirements
        },
        dependencies: entity.sharedState.dependencies,
        goals: entity.sharedState.goals.map(goal => ({
          ...goal,
          success_criteria: goal.successCriteria
        }))
      },

      // 访问控制映射
      access_control: {
        owner: {
          user_id: entity.accessControl.owner.userId,
          role: entity.accessControl.owner.role
        },
        permissions: entity.accessControl.permissions.map(perm => ({
          ...perm,
          principal_type: perm.principalType
        })),
        policies: entity.accessControl.policies
      },

      // 配置管理映射
      configuration: {
        timeout_settings: {
          default_timeout: entity.configuration.timeoutSettings.defaultTimeout,
          max_timeout: entity.configuration.timeoutSettings.maxTimeout,
          cleanup_timeout: entity.configuration.timeoutSettings.cleanupTimeout
        },
        notification_settings: entity.configuration.notificationSettings ? {
          enabled: entity.configuration.notificationSettings.enabled,
          channels: entity.configuration.notificationSettings.channels,
          events: entity.configuration.notificationSettings.events
        } : undefined,
        persistence: {
          enabled: entity.configuration.persistence.enabled,
          storage_backend: entity.configuration.persistence.storageBackend,
          retention_policy: entity.configuration.persistence.retentionPolicy ? {
            duration: entity.configuration.persistence.retentionPolicy.duration,
            max_versions: entity.configuration.persistence.retentionPolicy.maxVersions
          } : undefined
        }
      },

      // 审计跟踪映射
      audit_trail: {
        enabled: entity.auditTrail.enabled,
        retention_days: entity.auditTrail.retentionDays,
        audit_events: entity.auditTrail.auditEvents,
        compliance_settings: entity.auditTrail.complianceSettings
      },

      // 监控集成映射
      monitoring_integration: {
        enabled: entity.monitoringIntegration.enabled,
        supported_providers: entity.monitoringIntegration.supportedProviders,
        integration_endpoints: entity.monitoringIntegration.integrationEndpoints,
        context_metrics: entity.monitoringIntegration.contextMetrics,
        export_formats: entity.monitoringIntegration.exportFormats
      },

      // 性能指标映射
      performance_metrics: {
        enabled: entity.performanceMetrics.enabled,
        collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
        metrics: entity.performanceMetrics.metrics,
        health_status: entity.performanceMetrics.healthStatus,
        alerting: entity.performanceMetrics.alerting
      },

      // 版本历史映射
      version_history: {
        enabled: entity.versionHistory.enabled,
        max_versions: entity.versionHistory.maxVersions,
        versions: entity.versionHistory.versions,
        auto_versioning: entity.versionHistory.autoVersioning
      },

      // 搜索元数据映射
      search_metadata: {
        enabled: entity.searchMetadata.enabled,
        indexing_strategy: entity.searchMetadata.indexingStrategy,
        searchable_fields: entity.searchMetadata.searchableFields,
        search_indexes: entity.searchMetadata.searchIndexes,
        context_indexing: entity.searchMetadata.contextIndexing,
        auto_indexing: entity.searchMetadata.autoIndexing
      },

      // 缓存策略映射
      caching_policy: {
        enabled: entity.cachingPolicy.enabled,
        cache_strategy: entity.cachingPolicy.cacheStrategy,
        cache_levels: entity.cachingPolicy.cacheLevels,
        cache_warming: entity.cachingPolicy.cacheWarming
      },

      // 同步配置映射
      sync_configuration: {
        enabled: entity.syncConfiguration.enabled,
        sync_strategy: entity.syncConfiguration.syncStrategy,
        sync_targets: entity.syncConfiguration.syncTargets,
        replication: entity.syncConfiguration.replication
      },

      // 错误处理映射
      error_handling: {
        enabled: entity.errorHandling.enabled,
        error_policies: entity.errorHandling.errorPolicies,
        circuit_breaker: entity.errorHandling.circuitBreaker,
        recovery_strategy: entity.errorHandling.recoveryStrategy
      },

      // 集成端点映射
      integration_endpoints: {
        enabled: entity.integrationEndpoints.enabled,
        webhooks: entity.integrationEndpoints.webhooks,
        api_endpoints: entity.integrationEndpoints.apiEndpoints
      },

      // 事件集成映射
      event_integration: {
        enabled: entity.eventIntegration.enabled,
        event_bus_connection: entity.eventIntegration.eventBusConnection,
        published_events: entity.eventIntegration.publishedEvents,
        subscribed_events: entity.eventIntegration.subscribedEvents,
        event_routing: entity.eventIntegration.eventRouting
      }
    };
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: ContextSchema): ContextEntityData {
    return {
      // 基础协议字段
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      lifecycleStage: schema.lifecycle_stage,

      // 共享状态映射
      sharedState: {
        variables: schema.shared_state.variables,
        resources: {
          allocated: schema.shared_state.resources.allocated,
          requirements: schema.shared_state.resources.requirements
        },
        dependencies: schema.shared_state.dependencies,
        goals: schema.shared_state.goals.map(goal => ({
          ...goal,
          successCriteria: goal.success_criteria
        }))
      },

      // 访问控制映射
      accessControl: {
        owner: {
          userId: schema.access_control.owner.user_id,
          role: schema.access_control.owner.role
        },
        permissions: schema.access_control.permissions.map(perm => ({
          ...perm,
          principalType: perm.principal_type
        })),
        policies: schema.access_control.policies
      },

      // 配置管理映射
      configuration: {
        timeoutSettings: {
          defaultTimeout: schema.configuration.timeout_settings.default_timeout,
          maxTimeout: schema.configuration.timeout_settings.max_timeout,
          cleanupTimeout: schema.configuration.timeout_settings.cleanup_timeout
        },
        notificationSettings: schema.configuration.notification_settings ? {
          enabled: schema.configuration.notification_settings.enabled,
          channels: schema.configuration.notification_settings.channels,
          events: schema.configuration.notification_settings.events
        } : undefined,
        persistence: {
          enabled: schema.configuration.persistence.enabled,
          storageBackend: schema.configuration.persistence.storage_backend,
          retentionPolicy: schema.configuration.persistence.retention_policy ? {
            duration: schema.configuration.persistence.retention_policy.duration,
            maxVersions: schema.configuration.persistence.retention_policy.max_versions
          } : undefined
        }
      },

      // 审计跟踪映射
      auditTrail: {
        enabled: schema.audit_trail.enabled,
        retentionDays: schema.audit_trail.retention_days,
        auditEvents: schema.audit_trail.audit_events,
        complianceSettings: schema.audit_trail.compliance_settings
      },

      // 监控集成映射
      monitoringIntegration: {
        enabled: schema.monitoring_integration.enabled,
        supportedProviders: schema.monitoring_integration.supported_providers,
        integrationEndpoints: schema.monitoring_integration.integration_endpoints,
        contextMetrics: schema.monitoring_integration.context_metrics,
        exportFormats: schema.monitoring_integration.export_formats
      },

      // 性能指标映射
      performanceMetrics: {
        enabled: schema.performance_metrics.enabled,
        collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
        metrics: schema.performance_metrics.metrics,
        healthStatus: schema.performance_metrics.health_status,
        alerting: schema.performance_metrics.alerting
      },

      // 版本历史映射
      versionHistory: {
        enabled: schema.version_history.enabled,
        maxVersions: schema.version_history.max_versions,
        versions: schema.version_history.versions,
        autoVersioning: schema.version_history.auto_versioning
      },

      // 搜索元数据映射
      searchMetadata: {
        enabled: schema.search_metadata.enabled,
        indexingStrategy: schema.search_metadata.indexing_strategy,
        searchableFields: schema.search_metadata.searchable_fields,
        searchIndexes: schema.search_metadata.search_indexes,
        contextIndexing: schema.search_metadata.context_indexing,
        autoIndexing: schema.search_metadata.auto_indexing
      },

      // 缓存策略映射
      cachingPolicy: {
        enabled: schema.caching_policy.enabled,
        cacheStrategy: schema.caching_policy.cache_strategy,
        cacheLevels: schema.caching_policy.cache_levels,
        cacheWarming: schema.caching_policy.cache_warming
      },

      // 同步配置映射
      syncConfiguration: {
        enabled: schema.sync_configuration.enabled,
        syncStrategy: schema.sync_configuration.sync_strategy,
        syncTargets: schema.sync_configuration.sync_targets,
        replication: schema.sync_configuration.replication
      },

      // 错误处理映射
      errorHandling: {
        enabled: schema.error_handling.enabled,
        errorPolicies: schema.error_handling.error_policies,
        circuitBreaker: schema.error_handling.circuit_breaker,
        recoveryStrategy: schema.error_handling.recovery_strategy
      },

      // 集成端点映射
      integrationEndpoints: {
        enabled: schema.integration_endpoints.enabled,
        webhooks: schema.integration_endpoints.webhooks,
        apiEndpoints: schema.integration_endpoints.api_endpoints
      },

      // 事件集成映射
      eventIntegration: {
        enabled: schema.event_integration.enabled,
        eventBusConnection: schema.event_integration.event_bus_connection,
        publishedEvents: schema.event_integration.published_events,
        subscribedEvents: schema.event_integration.subscribed_events,
        eventRouting: schema.event_integration.event_routing
      }
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is ContextSchema {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Record<string, unknown>;

    // 验证基础必需字段
    const hasBasicFields = (
      typeof obj.protocol_version === 'string' &&
      typeof obj.timestamp === 'string' &&
      typeof obj.context_id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.status === 'string' &&
      typeof obj.lifecycle_stage === 'string'
    );

    // 验证必需的复杂对象
    const hasRequiredObjects = (
      obj.shared_state && typeof obj.shared_state === 'object' &&
      obj.access_control && typeof obj.access_control === 'object' &&
      obj.configuration && typeof obj.configuration === 'object' &&
      obj.audit_trail && typeof obj.audit_trail === 'object' &&
      obj.monitoring_integration && typeof obj.monitoring_integration === 'object' &&
      obj.performance_metrics && typeof obj.performance_metrics === 'object' &&
      obj.version_history && typeof obj.version_history === 'object' &&
      obj.search_metadata && typeof obj.search_metadata === 'object' &&
      obj.caching_policy && typeof obj.caching_policy === 'object' &&
      obj.sync_configuration && typeof obj.sync_configuration === 'object' &&
      obj.error_handling && typeof obj.error_handling === 'object' &&
      obj.integration_endpoints && typeof obj.integration_endpoints === 'object' &&
      obj.event_integration && typeof obj.event_integration === 'object'
    );

    return Boolean(hasBasicFields && hasRequiredObjects);
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: ContextEntityData[]): ContextSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: ContextSchema[]): ContextEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }
}

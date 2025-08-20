/**
 * Context模块数据传输对象(DTO)定义
 * 基于MPLP v1.0智能体构建框架协议标准
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

// 重新导出所有DTO类型
export * from './requests/create-context.request';
export * from './requests/update-shared-state.request';
export * from './requests/update-access-control.request';

export * from './responses/context.response';
export * from './responses/shared-state.response';
export * from './responses/access-control.response';

// 基础DTO接口
export interface BaseContextDto {
  contextId: string;
  name: string;
  description?: string;
  status: string;
  lifecycleStage: string;
  timestamp: string;
  protocolVersion: string;
}

// Context创建DTO
export interface CreateContextDto {
  name: string;
  description?: string;
  sharedState?: {
    variables?: Record<string, unknown>;
    resources?: {
      allocated?: Record<string, unknown>;
      requirements?: Record<string, unknown>;
    };
    dependencies?: string[];
    goals?: Array<{
      goalId: string;
      description: string;
      priority: number;
      status: string;
      successCriteria: Array<{
        criteriaId: string;
        description: string;
        type: string;
        value: unknown;
        operator: string;
      }>;
    }>;
  };
  accessControl?: {
    owner: {
      userId: string;
      role: string;
    };
    permissions?: Array<{
      permissionId: string;
      userId: string;
      role: string;
      actions: string[];
      resources: string[];
      conditions?: Record<string, unknown>;
    }>;
  };
  configuration?: {
    timeoutSettings?: {
      defaultTimeout: number;
      maxTimeout: number;
      cleanupTimeout: number;
    };
    notificationSettings?: {
      enabled: boolean;
      channels: string[];
      events: string[];
    };
    persistence?: {
      enabled: boolean;
      storageBackend: string;
      retentionPolicy: {
        duration: string;
        maxVersions: number;
      };
    };
  };
}

// Context更新DTO
export interface UpdateContextDto {
  name?: string;
  description?: string;
  status?: string;
  lifecycleStage?: string;
  sharedState?: {
    variables?: Record<string, unknown>;
    resources?: {
      allocated?: Record<string, unknown>;
      requirements?: Record<string, unknown>;
    };
    dependencies?: string[];
    goals?: Array<{
      goalId: string;
      description: string;
      priority: number;
      status: string;
      successCriteria: Array<{
        criteriaId: string;
        description: string;
        type: string;
        value: unknown;
        operator: string;
      }>;
    }>;
  };
}

// Context查询DTO
export interface ContextQueryDto {
  name?: string;
  status?: string;
  lifecycleStage?: string;
  ownerId?: string;
  variables?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Context响应DTO
export interface ContextResponseDto extends BaseContextDto {
  sharedState: {
    variables: Record<string, unknown>;
    resources: {
      allocated: Record<string, unknown>;
      requirements: Record<string, unknown>;
    };
    dependencies: string[];
    goals: Array<{
      goalId: string;
      description: string;
      priority: number;
      status: string;
      successCriteria: Array<{
        criteriaId: string;
        description: string;
        type: string;
        value: unknown;
        operator: string;
      }>;
    }>;
  };
  accessControl: {
    owner: {
      userId: string;
      role: string;
    };
    permissions: Array<{
      permissionId: string;
      userId: string;
      role: string;
      actions: string[];
      resources: string[];
      conditions?: Record<string, unknown>;
    }>;
  };
  configuration: {
    timeoutSettings: {
      defaultTimeout: number;
      maxTimeout: number;
      cleanupTimeout: number;
    };
    notificationSettings: {
      enabled: boolean;
      channels: string[];
      events: string[];
    };
    persistence: {
      enabled: boolean;
      storageBackend: string;
      retentionPolicy: {
        duration: string;
        maxVersions: number;
      };
    };
  };
  auditTrail: {
    enabled: boolean;
    retentionDays: number;
    auditEvents: Array<{
      eventId: string;
      eventType: string;
      timestamp: string;
      userId: string;
      userRole: string;
      action: string;
      resource: string;
      contextOperation: string;
      contextId: string;
      contextName: string;
      lifecycleStage: string;
      sharedStateKeys: string[];
      accessLevel: string;
      contextDetails: Record<string, unknown>;
      ipAddress: string;
      userAgent: string;
      sessionId: string;
      correlationId: string;
    }>;
    complianceSettings: {
      gdprEnabled: boolean;
      hipaaEnabled: boolean;
      soxEnabled: boolean;
      contextAuditLevel: string;
      contextDataLogging: boolean;
    };
  };
  monitoringIntegration: {
    enabled: boolean;
    supportedProviders: string[];
    integrationEndpoints: Record<string, string>;
    contextMetrics: {
      trackStateChanges: boolean;
      trackCachePerformance: boolean;
      trackSyncOperations: boolean;
      trackAccessPatterns: boolean;
    };
    exportFormats: string[];
  };
  performanceMetrics: {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics: {
      contextAccessLatencyMs: number;
      contextUpdateLatencyMs: number;
      cacheHitRatePercent: number;
      contextSyncSuccessRatePercent: number;
      contextStateConsistencyScore: number;
      activeContextsCount: number;
      contextOperationsPerSecond: number;
      contextMemoryUsageMb: number;
      averageContextSizeBytes: number;
    };
    healthStatus: {
      status: string;
      lastCheck: string;
      checks: Array<{
        checkName: string;
        status: string;
        message: string;
        durationMs: number;
      }>;
    };
    alerting: {
      enabled: boolean;
      thresholds: {
        maxContextAccessLatencyMs: number;
        minCacheHitRatePercent: number;
      };
      notificationChannels: string[];
    };
  };
}

// 批量操作DTO
export interface BulkContextOperationDto {
  operation: 'create' | 'update' | 'delete';
  contexts: Array<CreateContextDto | UpdateContextDto | { contextId: string }>;
}

// Context统计DTO
export interface ContextStatisticsDto {
  totalContexts: number;
  statusStatistics: Record<string, number>;
  lifecycleStageStatistics: Record<string, number>;
  featureStatistics: {
    auditEnabled: number;
    monitoringEnabled: number;
    performanceEnabled: number;
    versioningEnabled: number;
    searchEnabled: number;
    cachingEnabled: number;
    syncEnabled: number;
    errorHandlingEnabled: number;
    integrationEnabled: number;
    eventIntegrationEnabled: number;
  };
  configurationStatistics: {
    storageBackends: Record<string, number>;
    cacheStrategies: Record<string, number>;
    syncStrategies: Record<string, number>;
    indexingStrategies: Record<string, number>;
  };
}

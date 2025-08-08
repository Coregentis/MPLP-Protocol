/**
 * Context模块类型定义
 *
 * 基于MPLP Context Schema的TypeScript类型定义
 * Schema层使用snake_case，Application层使用camelCase
 *
 * 功能：上下文和全局状态管理
 * - 多会话共享状态管理
 * - 上下文生命周期控制
 * - 状态持久化和恢复
 * - 会话关联和隔离
 *
 * @version 1.0.0
 * @created 2025-08-06
 */

import { UUID, Timestamp, Version } from '../../public/shared/types';

// ===== 基础枚举类型 =====

/**
 * 上下文生命周期阶段
 * 对应Schema: lifecycle_stage
 * 必须与mplp-context.json Schema保持一致
 */
export enum ContextLifecycleStage {
  PLANNING = 'planning',
  EXECUTING = 'executing',
  MONITORING = 'monitoring',
  COMPLETED = 'completed'
}

/**
 * 上下文状态
 * 对应Schema: status
 * 必须与mplp-context.json Schema保持一致
 */
export enum ContextStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  TERMINATED = 'terminated'
}

/**
 * 优先级枚举
 * 对应Schema: priority
 */
export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// ===== 核心协议接口 =====

/**
 * MPLP Context协议接口
 * 对应Schema: mplp-context.json根对象
 *
 * 功能：定义完整的上下文结构，支持多会话状态管理
 */
export interface ContextProtocol {
  /**
   * MPLP协议版本
   * 对应Schema: protocol_version
   */
  protocolVersion: Version;

  /**
   * 协议消息时间戳
   * 对应Schema: timestamp
   */
  timestamp: Timestamp;

  /**
   * 上下文唯一标识符
   * 对应Schema: context_id
   */
  contextId: UUID;

  /**
   * 上下文名称
   * 对应Schema: name
   */
  name: string;

  /**
   * 上下文描述
   * 对应Schema: description
   */
  description?: string;

  /**
   * 生命周期阶段
   * 对应Schema: lifecycle_stage
   */
  lifecycleStage: ContextLifecycleStage;

  /**
   * 上下文状态
   * 对应Schema: status
   */
  status: ContextStatus;

  /**
   * 优先级
   * 对应Schema: priority
   */
  priority: Priority;

  /**
   * 创建时间
   * 对应Schema: created_at
   */
  createdAt: Timestamp;

  /**
   * 更新时间
   * 对应Schema: updated_at
   */
  updatedAt: Timestamp;

  /**
   * 过期时间
   * 对应Schema: expires_at
   */
  expiresAt?: Timestamp;

  /**
   * 关联的会话ID列表
   * 对应Schema: session_ids
   */
  sessionIds?: UUID[];

  /**
   * 共享状态数据
   * 对应Schema: shared_state
   *
   * 功能：存储多会话间共享的状态信息
   */
  sharedState?: Record<string, unknown>;

  /**
   * 上下文配置
   * 对应Schema: configuration
   */
  configuration?: ContextConfiguration;

  /**
   * 扩展元数据
   * 对应Schema: metadata
   */
  metadata?: Record<string, unknown>;
}

// ===== 配置和子类型 =====

/**
 * 上下文配置接口（Application层 - camelCase）
 * 对应Schema: configuration对象
 * 严格按照mplp-context.json Schema定义
 */
export interface ContextConfiguration {
  /**
   * 超时设置
   * 对应Schema: configuration.timeout_settings
   */
  timeoutSettings: {
    /** 默认超时时间（秒） */
    defaultTimeout: number;
    /** 最大超时时间（秒） */
    maxTimeout: number;
    /** 清理超时时间（秒） */
    cleanupTimeout?: number;
  };

  /**
   * 通知设置
   * 对应Schema: configuration.notification_settings
   */
  notificationSettings?: {
    /** 是否启用通知 */
    enabled: boolean;
    /** 通知渠道 */
    channels?: Array<'email' | 'webhook' | 'sms' | 'push'>;
    /** 通知事件 */
    events?: Array<'created' | 'updated' | 'completed' | 'failed' | 'timeout'>;
  };

  /**
   * 持久化设置
   * 对应Schema: configuration.persistence
   */
  persistence: {
    /** 是否启用持久化 */
    enabled: boolean;
    /** 存储后端类型 */
    storageBackend: 'memory' | 'database' | 'file' | 'redis';
    /** 保留策略 */
    retentionPolicy?: {
      /** 保留时长 */
      duration: string;
      /** 最大版本数 */
      maxVersions?: number;
    };
  };
}

/**
 * Schema层配置接口（snake_case）
 * 用于与JSON Schema直接交互
 */
export interface ContextConfigurationSchema {
  timeout_settings: {
    default_timeout: number;
    max_timeout: number;
    cleanup_timeout?: number;
  };
  notification_settings?: {
    enabled: boolean;
    channels?: Array<'email' | 'webhook' | 'sms' | 'push'>;
    events?: Array<'created' | 'updated' | 'completed' | 'failed' | 'timeout'>;
  };
  persistence: {
    enabled: boolean;
    storage_backend: 'memory' | 'database' | 'file' | 'redis';
    retention_policy?: {
      duration: string;
      max_versions?: number;
    };
  };
}

// ===== API数据传输对象 =====

/**
 * 创建上下文请求
 * API层使用，对应Schema字段但使用camelCase
 */
export interface CreateContextRequest {
  name: string;
  description?: string;
  type?: ContextType;
  lifecycleStage?: ContextLifecycleStage;
  priority?: Priority;
  sessionIds?: UUID[];
  sharedState?: Record<string, unknown>;
  configuration?: ContextConfiguration;
  metadata?: Record<string, unknown>;
  capabilities?: {
    storage?: {
      persistence?: boolean;
      encryption?: boolean;
    };
    knowledgeBase?: {
      hierarchical?: boolean;
      semantic?: boolean;
    };
    coordination?: {
      multiAgent?: boolean;
      conflictResolution?: boolean;
    };
  };
}

/**
 * 更新上下文请求
 * API层使用，支持部分更新
 */
export interface UpdateContextRequest {
  name?: string;
  description?: string;
  lifecycleStage?: ContextLifecycleStage;
  status?: ContextStatus;
  priority?: Priority;
  sessionIds?: UUID[];
  sharedState?: Record<string, unknown>;
  configuration?: ContextConfiguration;
  metadata?: Record<string, unknown>;
}

/**
 * 上下文查询参数
 * API层使用，支持过滤和分页
 */
export interface ContextQueryParams {
  lifecycleStage?: ContextLifecycleStage;
  status?: ContextStatus;
  priority?: Priority;
  sessionId?: UUID;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 上下文类型枚举
 */
export enum ContextType {
  BASIC = 'basic',
  KNOWLEDGE_BASE = 'knowledge_base',
  MULTI_AGENT = 'multi_agent',
  DISTRIBUTED = 'distributed'
}

/**
 * 上下文同步请求
 */
export interface ContextSyncRequest {
  contextId: UUID;
  targetContexts: UUID[];
  syncMode: 'incremental' | 'full';
  conflictResolution: 'merge' | 'overwrite' | 'manual';
  options?: {
    timeout?: number;
    retryCount?: number;
    validateAfterSync?: boolean;
  };
}

/**
 * 上下文操作请求
 */
export interface ContextOperationRequest {
  contextId: UUID;
  operation: {
    type: 'read' | 'write' | 'delete';
    target: string;
    data?: unknown;
    conditions?: Record<string, unknown>;
  };
  options?: {
    enableAnalysis?: boolean;
    syncMode?: 'immediate' | 'eventual';
  };
}

/**
 * 上下文分析请求
 */
export interface ContextAnalysisRequest {
  contextId: UUID;
  analysisType: 'quality' | 'performance' | 'insights' | 'comprehensive';
  options?: {
    includeRecommendations?: boolean;
    depth?: 'shallow' | 'deep';
    timeRange?: {
      start: Timestamp;
      end: Timestamp;
    };
  };
}

/**
 * 上下文查询过滤器
 * 用于应用层的Context查询操作
 */
export interface ContextQueryFilter {
  type?: ContextType;
  status?: ContextStatus;
  lifecycleStage?: ContextLifecycleStage;
  priority?: Priority;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * 状态选项
 */
export interface StatusOptions {
  includePerformance?: boolean;
  includeMetrics?: boolean;
  includeHistory?: boolean;
}

// ===== 操作结果类型 =====
// 注意：ContextOperationResult在application/services中已定义
// 这里不重复定义，避免类型冲突

// ===== 配置转换函数 =====

/**
 * 将Schema层配置转换为Application层配置
 */
export function mapSchemaToApplicationConfig(
  schemaConfig: ContextConfigurationSchema
): ContextConfiguration {
  return {
    timeoutSettings: {
      defaultTimeout: schemaConfig.timeout_settings.default_timeout,
      maxTimeout: schemaConfig.timeout_settings.max_timeout,
      cleanupTimeout: schemaConfig.timeout_settings.cleanup_timeout
    },
    notificationSettings: schemaConfig.notification_settings ? {
      enabled: schemaConfig.notification_settings.enabled,
      channels: schemaConfig.notification_settings.channels,
      events: schemaConfig.notification_settings.events
    } : undefined,
    persistence: {
      enabled: schemaConfig.persistence.enabled,
      storageBackend: schemaConfig.persistence.storage_backend,
      retentionPolicy: schemaConfig.persistence.retention_policy ? {
        duration: schemaConfig.persistence.retention_policy.duration,
        maxVersions: schemaConfig.persistence.retention_policy.max_versions
      } : undefined
    }
  };
}

/**
 * 将Application层配置转换为Schema层配置
 */
export function mapApplicationToSchemaConfig(
  appConfig: ContextConfiguration
): ContextConfigurationSchema {
  return {
    timeout_settings: {
      default_timeout: appConfig.timeoutSettings.defaultTimeout,
      max_timeout: appConfig.timeoutSettings.maxTimeout,
      cleanup_timeout: appConfig.timeoutSettings.cleanupTimeout
    },
    notification_settings: appConfig.notificationSettings ? {
      enabled: appConfig.notificationSettings.enabled,
      channels: appConfig.notificationSettings.channels,
      events: appConfig.notificationSettings.events
    } : undefined,
    persistence: {
      enabled: appConfig.persistence.enabled,
      storage_backend: appConfig.persistence.storageBackend,
      retention_policy: appConfig.persistence.retentionPolicy ? {
        duration: appConfig.persistence.retentionPolicy.duration,
        max_versions: appConfig.persistence.retentionPolicy.maxVersions
      } : undefined
    }
  };
}

// ===== 重新导出相关类型 =====

// 重新导出Domain实体类型
export * from './domain/entities/context.entity';

// 重新导出API DTO类型
export * from './api/dto/requests/create-context.request';
export * from './api/dto/responses/context.response';

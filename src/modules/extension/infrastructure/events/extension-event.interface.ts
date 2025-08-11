/**
 * Extension Event System 接口定义
 *
 * 企业级事件处理系统接口，支持异步事件发布、订阅和处理
 *
 * @version 1.0.0
 * @created 2025-08-10T22:45:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配mplp-extension.json Schema定义
 * @naming_convention 双重命名约定 - Schema层(snake_case) ↔ Application层(camelCase)
 * @zero_any_policy 严格遵循 - 0个any类型，完全类型安全
 */

import { UUID, Timestamp } from '../../../../public/shared/types';

/**
 * Extension事件类型枚举 (Application层 - camelCase)
 */
export enum ExtensionEventType {
  // 生命周期事件
  EXTENSION_INSTALLED = 'extension.installed',
  EXTENSION_ACTIVATED = 'extension.activated',
  EXTENSION_DEACTIVATED = 'extension.deactivated',
  EXTENSION_UPDATED = 'extension.updated',
  EXTENSION_UNINSTALLED = 'extension.uninstalled',

  // 配置事件
  CONFIGURATION_CHANGED = 'configuration.changed',
  CONFIGURATION_VALIDATED = 'configuration.validated',
  CONFIGURATION_BACKUP_CREATED = 'configuration.backup_created',
  CONFIGURATION_RESTORED = 'configuration.restored',

  // 安全事件
  SECURITY_VIOLATION_DETECTED = 'security.violation_detected',
  PERMISSION_GRANTED = 'security.permission_granted',
  PERMISSION_REVOKED = 'security.permission_revoked',
  SECURITY_SCAN_COMPLETED = 'security.scan_completed',

  // 错误和状态事件
  EXTENSION_ERROR = 'extension.error',
  EXTENSION_WARNING = 'extension.warning',
  HEALTH_CHECK_FAILED = 'extension.health_check_failed',
  DEPENDENCY_CONFLICT = 'extension.dependency_conflict',

  // 性能事件
  PERFORMANCE_THRESHOLD_EXCEEDED = 'performance.threshold_exceeded',
  RESOURCE_LIMIT_REACHED = 'performance.resource_limit_reached',
}

/**
 * 事件优先级枚举 (Application层 - camelCase)
 */
export enum EventPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * 事件处理状态枚举 (Application层 - camelCase)
 */
export enum EventProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
}

/**
 * Extension事件数据接口 (Application层 - camelCase)
 */
export interface ExtensionEventData {
  eventId: UUID;
  eventType: ExtensionEventType;
  extensionId: UUID;
  contextId: UUID;
  priority: EventPriority;
  timestamp: Timestamp;
  payload: Record<string, unknown>;
  metadata: {
    source: string;
    version: string;
    correlationId?: UUID;
    causationId?: UUID;
    userId?: UUID;
    sessionId?: UUID;
  };
  processingStatus: EventProcessingStatus;
  status?: string; // 兼容状态别名
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  result?: Record<string, unknown>; // 处理结果数据
  correlationId?: UUID; // 兼容直接访问correlationId属性
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 事件处理结果接口 (Application层 - camelCase)
 */
export interface EventProcessingResult {
  eventId: UUID;
  success: boolean;
  processingTime: number;
  result?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details: Record<string, unknown>;
    stackTrace?: string;
  };
  nextRetryAt?: Timestamp;
  completedAt: Timestamp;
  processedAt?: Timestamp; // 兼容处理时间别名
}

/**
 * 事件订阅配置接口 (Application层 - camelCase)
 */
export interface EventSubscriptionConfig {
  subscriptionId: UUID;
  extensionId: UUID;
  eventType: ExtensionEventType;
  handlerName: string;
  priority: EventPriority;
  isActive: boolean;
  filterCriteria?: {
    contextIds?: UUID[];
    sourceExtensions?: UUID[];
    payloadFilters?: Record<string, unknown>;
  };
  retryConfig: {
    maxRetries: number;
    retryIntervalMs: number;
    exponentialBackoff: boolean;
    maxRetryIntervalMs: number;
  };
  maxRetries?: number; // 兼容别名，映射到retryConfig.maxRetries
  timeoutMs: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 事件处理器接口 (Application层 - camelCase)
 */
export interface IExtensionEventHandler {
  /**
   * 处理事件
   */
  handle(event: ExtensionEventData): Promise<EventProcessingResult>;

  /**
   * 检查处理器是否可以处理指定事件类型
   */
  canHandle(eventType: ExtensionEventType): boolean;

  /**
   * 获取处理器名称
   */
  getName(): string;

  /**
   * 获取支持的事件类型
   */
  getSupportedEventTypes(): ExtensionEventType[];
}

/**
 * 事件发布器接口 (Application层 - camelCase)
 */
export interface IExtensionEventPublisher {
  /**
   * 发布事件
   */
  publish(event: ExtensionEventData): Promise<void>;

  /**
   * 批量发布事件
   */
  publishBatch(events: ExtensionEventData[]): Promise<void>;

  /**
   * 发布延迟事件
   */
  publishDelayed(event: ExtensionEventData, delayMs: number): Promise<void>;

  /**
   * 检查发布器健康状态
   */
  checkHealth(): Promise<{ status: string; details?: Record<string, unknown> }>;
}

/**
 * 事件订阅器接口 (Application层 - camelCase)
 */
export interface IExtensionEventSubscriber {
  /**
   * 订阅事件
   */
  subscribe(
    config: EventSubscriptionConfig,
    handler: IExtensionEventHandler
  ): Promise<void>;

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: UUID): Promise<void>;

  /**
   * 获取所有订阅
   */
  getSubscriptions(extensionId?: UUID): Promise<EventSubscriptionConfig[]>;

  /**
   * 更新订阅配置
   */
  updateSubscription(
    subscriptionId: UUID,
    config: Partial<EventSubscriptionConfig>
  ): Promise<void>;

  /**
   * 启动事件处理
   */
  start(): Promise<void>;

  /**
   * 停止事件处理
   */
  stop(): Promise<void>;

  /**
   * 检查订阅器健康状态
   */
  checkHealth(): Promise<{ status: string; details?: Record<string, unknown> }>;
}

/**
 * 事件存储接口 (Application层 - camelCase)
 */
export interface IExtensionEventStore {
  /**
   * 保存事件
   */
  saveEvent(event: ExtensionEventData): Promise<void>;

  /**
   * 获取事件
   */
  getEvent(eventId: UUID): Promise<ExtensionEventData | null>;

  /**
   * 查询事件
   */
  queryEvents(criteria: {
    extensionId?: UUID;
    contextId?: UUID;
    eventType?: ExtensionEventType;
    priority?: EventPriority;
    status?: EventProcessingStatus;
    fromTime?: Timestamp;
    toTime?: Timestamp;
    limit?: number;
    offset?: number;
  }): Promise<ExtensionEventData[]>;

  /**
   * 更新事件状态
   */
  updateEventStatus(
    eventId: UUID,
    status: EventProcessingStatus,
    result?: EventProcessingResult
  ): Promise<void>;

  /**
   * 删除过期事件
   */
  deleteExpiredEvents(): Promise<number>;

  /**
   * 获取事件统计
   */
  getEventStatistics(
    extensionId?: UUID,
    timeRange?: { from: Timestamp; to: Timestamp }
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<ExtensionEventType, number>;
    eventsByStatus: Record<EventProcessingStatus, number>;
    averageProcessingTime: number;
    failureRate: number;
  }>;
}

/**
 * 主事件系统管理器接口 (Application层 - camelCase)
 */
export interface IExtensionEventSystem {
  /**
   * 初始化事件系统
   */
  initialize(): Promise<void>;

  /**
   * 获取事件发布器
   */
  getPublisher(): IExtensionEventPublisher;

  /**
   * 获取事件订阅器
   */
  getSubscriber(): IExtensionEventSubscriber;

  /**
   * 获取事件存储
   */
  getEventStore(): IExtensionEventStore;

  /**
   * 注册事件处理器
   */
  registerHandler(handler: IExtensionEventHandler): Promise<void>;

  /**
   * 注销事件处理器
   */
  unregisterHandler(handlerName: string): Promise<void>;

  /**
   * 获取所有注册的处理器
   */
  getRegisteredHandlers(): Promise<IExtensionEventHandler[]>;

  /**
   * 发布事件（便捷方法）
   */
  publishEvent(
    eventType: ExtensionEventType,
    extensionId: UUID,
    payload: Record<string, unknown>,
    options?: {
      priority?: EventPriority;
      correlationId?: UUID;
      timeoutMs?: number;
    }
  ): Promise<void>;

  /**
   * 订阅事件（便捷方法）
   */
  subscribeToEvent(
    eventType: ExtensionEventType,
    extensionId: UUID,
    handler: IExtensionEventHandler,
    options?: {
      priority?: EventPriority;
      maxRetries?: number;
      timeoutMs?: number;
    }
  ): Promise<UUID>;

  /**
   * 重试失败的事件
   */
  retryFailedEvents(maxRetries?: number): Promise<number>;

  /**
   * 清理系统
   */
  cleanup(): Promise<void>;

  /**
   * 获取系统健康状态
   */
  getHealthStatus(): Promise<{
    status: string;
    components: {
      publisher: { status: string; details?: Record<string, unknown> };
      subscriber: { status: string; details?: Record<string, unknown> };
      eventStore: { status: string; details?: Record<string, unknown> };
    };
    statistics: {
      totalEvents: number;
      pendingEvents: number;
      failedEvents: number;
      processingRate: number;
    };
  }>;
}

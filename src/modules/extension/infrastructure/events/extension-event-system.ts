/**
 * Extension Event System - TDD Red阶段基础实现
 *
 * 企业级事件处理系统基础骨架（所有方法抛出未实现错误）
 *
 * @version 1.0.0
 * @created 2025-08-10T23:00:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配mplp-extension.json Schema定义
 * @naming_convention 双重命名约定 - Schema层(snake_case) ↔ Application层(camelCase)
 * @zero_any_policy 严格遵循 - 0个any类型，完全类型安全
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
import {
  ExtensionEventType,
  EventPriority,
  EventProcessingStatus,
  ExtensionEventData,
  EventProcessingResult,
  EventSubscriptionConfig,
  IExtensionEventHandler,
  IExtensionEventPublisher,
  IExtensionEventSubscriber,
  IExtensionEventStore,
  IExtensionEventSystem,
} from './extension-event.interface';

/**
 * Extension Event Publisher - Green阶段企业级实现
 */
export class ExtensionEventPublisher implements IExtensionEventPublisher {
  private readonly eventQueue: ExtensionEventData[] = [];
  private readonly processingStats = {
    published: 0,
    failed: 0,
    totalTime: 0,
  };
  private isInitialized = false;

  async publish(event: ExtensionEventData): Promise<void> {
    const startTime = Date.now();

    try {
      // 企业级事件验证
      this.validateEvent(event);

      // 设置事件时间戳
      if (!event.timestamp) {
        event.timestamp = new Date().toISOString() as Timestamp;
      }

      // 添加到事件队列
      this.eventQueue.push(event);

      // 模拟异步处理
      await this.processEvent(event);

      this.processingStats.published++;
      this.processingStats.totalTime += Date.now() - startTime;
    } catch (error) {
      this.processingStats.failed++;
      throw new Error(
        `Failed to publish event: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async publishBatch(events: ExtensionEventData[]): Promise<void> {
    const startTime = Date.now();

    try {
      // 企业级批量验证
      if (!Array.isArray(events) || events.length === 0) {
        throw new Error('Events array is required and must not be empty');
      }

      // 验证所有事件
      for (const event of events) {
        this.validateEvent(event);
      }

      // 批量处理
      const results = await Promise.allSettled(
        events.map(event => this.publish(event))
      );

      // 检查失败的事件
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(
          `Batch publishing failed for ${failures.length} events`
        );
      }

      this.processingStats.totalTime += Date.now() - startTime;
    } catch (error) {
      this.processingStats.failed++;
      throw new Error(
        `Failed to publish batch events: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async publishDelayed(
    event: ExtensionEventData,
    delayMs: number
  ): Promise<void> {
    if (delayMs < 0) {
      throw new Error('Delay must be non-negative');
    }

    // 模拟延迟发布
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await this.publish(event);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  }

  async checkHealth(): Promise<{
    status: string;
    details?: Record<string, unknown>;
  }> {
    try {
      const health = {
        status: this.isInitialized ? 'healthy' : 'initializing',
        details: {
          eventsPublished: this.processingStats.published,
          eventsFailed: this.processingStats.failed,
          averageProcessingTime:
            this.processingStats.published > 0
              ? Math.round(
                  this.processingStats.totalTime /
                    this.processingStats.published
                )
              : 0,
          queueLength: this.eventQueue.length,
          memoryUsage: process.memoryUsage().heapUsed,
          timestamp: new Date().toISOString(),
        },
      };

      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  private validateEvent(event: ExtensionEventData): void {
    if (!event) {
      throw new Error('Event is required');
    }
    if (!event.eventId) {
      throw new Error('Event ID is required');
    }
    if (!event.eventType) {
      throw new Error('Event type is required');
    }
    if (!event.extensionId) {
      throw new Error('Extension ID is required');
    }
  }

  private async processEvent(event: ExtensionEventData): Promise<void> {
    // 模拟异步事件处理
    await new Promise(resolve => setTimeout(resolve, 1));

    // 事件处理逻辑
    console.log(
      `Processing event: ${event.eventType} for extension: ${event.extensionId}`
    );
  }
}

/**
 * Extension Event Subscriber - Green阶段企业级实现
 */
export class ExtensionEventSubscriber implements IExtensionEventSubscriber {
  private readonly subscriptions = new Map<UUID, EventSubscriptionConfig>();
  private readonly handlers = new Map<UUID, IExtensionEventHandler>();
  private isStarted = false;
  private readonly stats = {
    subscriptions: 0,
    processed: 0,
    failed: 0,
  };

  async subscribe(
    config: EventSubscriptionConfig,
    handler: IExtensionEventHandler
  ): Promise<void> {
    // 企业级配置验证
    this.validateSubscriptionConfig(config);

    if (!config.subscriptionId) {
      config.subscriptionId = `sub-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}` as UUID;
    }

    this.subscriptions.set(config.subscriptionId, config);
    this.handlers.set(config.subscriptionId, handler);
    this.stats.subscriptions++;
  }

  async unsubscribe(subscriptionId: UUID): Promise<void> {
    if (!this.subscriptions.has(subscriptionId)) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    this.subscriptions.delete(subscriptionId);
    this.handlers.delete(subscriptionId);
    this.stats.subscriptions--;
  }

  async getSubscriptions(
    extensionId?: UUID
  ): Promise<EventSubscriptionConfig[]> {
    const result: EventSubscriptionConfig[] = [];

    for (const config of Array.from(this.subscriptions.values())) {
      if (!extensionId || config.extensionId === extensionId) {
        result.push(config);
      }
    }

    return result;
  }

  async updateSubscription(
    subscriptionId: UUID,
    updates: Partial<EventSubscriptionConfig>
  ): Promise<void> {
    const existing = this.subscriptions.get(subscriptionId);
    if (!existing) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    const updated = { ...existing, ...updates };
    this.validateSubscriptionConfig(updated);

    this.subscriptions.set(subscriptionId, updated);
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      throw new Error('Subscriber is already started');
    }

    this.isStarted = true;
    console.log('Extension Event Subscriber started');
  }

  async stop(): Promise<void> {
    if (!this.isStarted) {
      throw new Error('Subscriber is not started');
    }

    this.isStarted = false;
    console.log('Extension Event Subscriber stopped');
  }

  async checkHealth(): Promise<{
    status: string;
    details?: Record<string, unknown>;
  }> {
    try {
      return {
        status: this.isStarted ? 'healthy' : 'stopped',
        details: {
          isStarted: this.isStarted,
          totalSubscriptions: this.stats.subscriptions,
          activeSubscriptions: Array.from(this.subscriptions.values()).filter(
            s => s.isActive
          ).length,
          eventsProcessed: this.stats.processed,
          eventsFailed: this.stats.failed,
          memoryUsage: process.memoryUsage().heapUsed,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  private validateSubscriptionConfig(config: EventSubscriptionConfig): void {
    if (!config.extensionId) {
      throw new Error('Extension ID is required');
    }
    if (!config.eventType) {
      throw new Error('Event type is required');
    }
    if (config.maxRetries !== undefined && config.maxRetries < 0) {
      throw new Error('Max retries must be non-negative');
    }
    if (config.timeoutMs !== undefined && config.timeoutMs < 0) {
      throw new Error('Timeout must be non-negative');
    }
  }
}

/**
 * Extension Event Store - Green阶段企业级实现
 */
export class ExtensionEventStore implements IExtensionEventStore {
  private readonly events = new Map<UUID, ExtensionEventData>();
  private readonly stats = {
    totalEvents: 0,
    eventsByType: {} as Record<ExtensionEventType, number>,
    eventsByStatus: {} as Record<EventProcessingStatus, number>,
    processingTimes: [] as number[],
  };

  async saveEvent(event: ExtensionEventData): Promise<void> {
    // 企业级事件验证
    this.validateEvent(event);

    // 设置默认值
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString() as Timestamp;
    }
    if (!event.status) {
      event.status = EventProcessingStatus.PENDING;
    }
    if (!event.priority) {
      event.priority = EventPriority.MEDIUM;
    }

    // 保存事件
    this.events.set(event.eventId, event);

    // 更新统计
    this.updateStatistics(event);
  }

  async getEvent(eventId: UUID): Promise<ExtensionEventData | null> {
    return this.events.get(eventId) || null;
  }

  async queryEvents(criteria: {
    extensionId?: UUID;
    contextId?: UUID;
    eventType?: ExtensionEventType;
    priority?: EventPriority;
    status?: EventProcessingStatus;
    fromTime?: Timestamp;
    toTime?: Timestamp;
    limit?: number;
    offset?: number;
  }): Promise<ExtensionEventData[]> {
    let results = Array.from(this.events.values());

    // 应用过滤条件
    if (criteria.extensionId) {
      results = results.filter(e => e.extensionId === criteria.extensionId);
    }
    if (criteria.contextId) {
      results = results.filter(e => e.contextId === criteria.contextId);
    }
    if (criteria.eventType) {
      results = results.filter(e => e.eventType === criteria.eventType);
    }
    if (criteria.priority) {
      results = results.filter(e => e.priority === criteria.priority);
    }
    if (criteria.status) {
      results = results.filter(e => e.status === criteria.status);
    }
    if (criteria.fromTime) {
      results = results.filter(e => e.timestamp >= criteria.fromTime!);
    }
    if (criteria.toTime) {
      results = results.filter(e => e.timestamp <= criteria.toTime!);
    }

    // 排序（按时间戳降序）
    results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 分页
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 100;

    return results.slice(offset, offset + limit);
  }

  async updateEventStatus(
    eventId: UUID,
    status: EventProcessingStatus,
    result?: EventProcessingResult
  ): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const oldStatus = event.status;
    event.status = status;

    if (result) {
      event.result = result as unknown as Record<string, unknown>;
      event.updatedAt = new Date().toISOString() as Timestamp;

      // 记录处理时间
      if (result.processedAt && event.timestamp) {
        const processingTime =
          new Date(result.processedAt).getTime() -
          new Date(event.timestamp).getTime();
        this.stats.processingTimes.push(processingTime);
      }
    }

    // 更新统计
    if (oldStatus !== status) {
      this.updateStatusStatistics(oldStatus as EventProcessingStatus, status);
    }
  }

  async deleteExpiredEvents(): Promise<number> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [eventId, event] of Array.from(this.events.entries())) {
      const eventTime = new Date(event.timestamp);
      if (eventTime < oneWeekAgo) {
        this.events.delete(eventId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async getEventStatistics(
    extensionId?: UUID,
    timeRange?: { from: Timestamp; to: Timestamp }
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<ExtensionEventType, number>;
    eventsByStatus: Record<EventProcessingStatus, number>;
    averageProcessingTime: number;
    failureRate: number;
  }> {
    let events = Array.from(this.events.values());

    // 过滤条件
    if (extensionId) {
      events = events.filter(e => e.extensionId === extensionId);
    }
    if (timeRange) {
      events = events.filter(
        e => e.timestamp >= timeRange.from && e.timestamp <= timeRange.to
      );
    }

    // 计算统计
    const eventsByType = {} as Record<ExtensionEventType, number>;
    const eventsByStatus = {} as Record<EventProcessingStatus, number>;

    for (const event of events) {
      if (event.eventType) {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      }
      if (event.status) {
        eventsByStatus[event.status as keyof typeof eventsByStatus] = (eventsByStatus[event.status as keyof typeof eventsByStatus] || 0) + 1;
      }
    }

    // 计算平均处理时间
    const averageProcessingTime =
      this.stats.processingTimes.length > 0
        ? this.stats.processingTimes.reduce((sum, time) => sum + time, 0) /
          this.stats.processingTimes.length
        : 0;

    // 计算失败率
    const failedEvents = eventsByStatus[EventProcessingStatus.FAILED] || 0;
    const failureRate = events.length > 0 ? failedEvents / events.length : 0;

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByStatus,
      averageProcessingTime,
      failureRate,
    };
  }

  private validateEvent(event: ExtensionEventData): void {
    if (!event) {
      throw new Error('Event is required');
    }
    if (!event.eventId) {
      throw new Error('Event ID is required');
    }
    if (!event.eventType) {
      throw new Error('Event type is required');
    }
    if (!event.extensionId) {
      throw new Error('Extension ID is required');
    }
  }

  private updateStatistics(event: ExtensionEventData): void {
    this.stats.totalEvents++;
    if (event.eventType) {
      this.stats.eventsByType[event.eventType] =
        (this.stats.eventsByType[event.eventType] || 0) + 1;
    }
    if (event.status) {
      this.stats.eventsByStatus[event.status as keyof typeof this.stats.eventsByStatus] =
        (this.stats.eventsByStatus[event.status as keyof typeof this.stats.eventsByStatus] || 0) + 1;
    }
  }

  private updateStatusStatistics(
    oldStatus: EventProcessingStatus,
    newStatus: EventProcessingStatus
  ): void {
    if (this.stats.eventsByStatus[oldStatus] > 0) {
      this.stats.eventsByStatus[oldStatus]--;
    }
    this.stats.eventsByStatus[newStatus] =
      (this.stats.eventsByStatus[newStatus] || 0) + 1;
  }
}

/**
 * Extension Event System - TDD Red阶段主实现
 */
export class ExtensionEventSystem implements IExtensionEventSystem {
  private publisher: IExtensionEventPublisher;
  private subscriber: IExtensionEventSubscriber;
  private eventStore: IExtensionEventStore;
  private readonly handlers = new Map<string, IExtensionEventHandler>();
  private isInitialized = false;
  private readonly stats = {
    events: 0,
    errors: 0,
    startTime: Date.now(),
  };

  constructor() {
    this.publisher = new ExtensionEventPublisher();
    this.subscriber = new ExtensionEventSubscriber();
    this.eventStore = new ExtensionEventStore();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Event system is already initialized');
    }

    try {
      // 初始化子系统
      await this.subscriber.start();

      this.isInitialized = true;
      console.log('Extension Event System initialized successfully');
    } catch (error) {
      throw new Error(
        `Failed to initialize event system: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  getPublisher(): IExtensionEventPublisher {
    return this.publisher;
  }

  getSubscriber(): IExtensionEventSubscriber {
    return this.subscriber;
  }

  getEventStore(): IExtensionEventStore {
    return this.eventStore;
  }

  async registerHandler(handler: IExtensionEventHandler): Promise<void> {
    if (!handler) {
      throw new Error('Handler is required');
    }

    const handlerName = handler.constructor.name || `handler-${Date.now()}`;

    if (this.handlers.has(handlerName)) {
      throw new Error(`Handler ${handlerName} is already registered`);
    }

    this.handlers.set(handlerName, handler);
    console.log(`Registered event handler: ${handlerName}`);
  }

  async unregisterHandler(handlerName: string): Promise<void> {
    if (!this.handlers.has(handlerName)) {
      throw new Error(`Handler ${handlerName} not found`);
    }

    this.handlers.delete(handlerName);
    console.log(`Unregistered event handler: ${handlerName}`);
  }

  async getRegisteredHandlers(): Promise<IExtensionEventHandler[]> {
    return Array.from(this.handlers.values());
  }

  async publishEvent(
    eventType: ExtensionEventType,
    extensionId: UUID,
    payload: Record<string, unknown>,
    options?: {
      priority?: EventPriority;
      correlationId?: UUID;
      timeoutMs?: number;
    }
  ): Promise<void> {
    const event: ExtensionEventData = {
      eventId: `evt-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}` as UUID,
      eventType,
      extensionId,
      contextId: 'default-context' as UUID, // 默认上下文
      payload,
      priority: options?.priority || EventPriority.MEDIUM,
      processingStatus: EventProcessingStatus.PENDING,
      status: 'pending', // 兼容状态别名
      timestamp: new Date().toISOString() as Timestamp,
      correlationId: options?.correlationId,
      timeoutMs: options?.timeoutMs || 30000,
      metadata: {
        source: 'extension-event-system',
        version: '1.0.0',
        correlationId: options?.correlationId,
      },
      retryCount: 0,
      maxRetries: 3,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() as Timestamp, // 7天过期
      createdAt: new Date().toISOString() as Timestamp,
      updatedAt: new Date().toISOString() as Timestamp,
    };

    try {
      await this.publisher.publish(event);
      await this.eventStore.saveEvent(event);
      this.stats.events++;
    } catch (error) {
      this.stats.errors++;
      throw new Error(
        `Failed to publish event: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async subscribeToEvent(
    eventType: ExtensionEventType,
    extensionId: UUID,
    handler: IExtensionEventHandler,
    options?: {
      priority?: EventPriority;
      maxRetries?: number;
      timeoutMs?: number;
    }
  ): Promise<UUID> {
    const config: EventSubscriptionConfig = {
      subscriptionId: `sub-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}` as UUID,
      extensionId,
      eventType,
      handlerName: `handler_${eventType}`,
      priority: options?.priority || EventPriority.MEDIUM,
      isActive: true,
      retryConfig: {
        maxRetries: options?.maxRetries || 3,
        retryIntervalMs: 1000,
        exponentialBackoff: true,
        maxRetryIntervalMs: 30000
      },
      maxRetries: options?.maxRetries || 3,
      timeoutMs: options?.timeoutMs || 30000,
      createdAt: new Date().toISOString() as Timestamp,
      updatedAt: new Date().toISOString() as Timestamp,
    };

    await this.subscriber.subscribe(config, handler);
    return config.subscriptionId;
  }

  async retryFailedEvents(maxRetries = 3): Promise<number> {
    const failedEvents = await this.eventStore.queryEvents({
      status: EventProcessingStatus.FAILED,
      limit: 100,
    });

    let retriedCount = 0;
    for (const event of failedEvents) {
      try {
        const retryCount = event.retryCount || 0;
        if (retryCount < maxRetries) {
          event.retryCount = retryCount + 1;
          await this.publisher.publish(event);
          await this.eventStore.updateEventStatus(
            event.eventId,
            EventProcessingStatus.PROCESSING
          );
          retriedCount++;
        }
      } catch (error) {
        console.error(`Failed to retry event ${event.eventId}:`, error);
      }
    }

    return retriedCount;
  }

  async cleanup(): Promise<void> {
    try {
      await this.subscriber.stop();
      this.handlers.clear();

      // Clean up expired events
      await this.eventStore.deleteExpiredEvents();

      this.isInitialized = false;
      console.log('Extension Event System cleaned up successfully');
    } catch (error) {
      throw new Error(
        `Failed to cleanup event system: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getHealthStatus(): Promise<{
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
  }> {
    try {
      // 获取组件健康状态
      const publisherHealth = await this.publisher.checkHealth();
      const subscriberHealth = await this.subscriber.checkHealth();

      // 获取事件统计
      const stats = await this.eventStore.getEventStatistics();
      const pendingEvents =
        stats.eventsByStatus[EventProcessingStatus.PENDING] || 0;
      const failedEvents =
        stats.eventsByStatus[EventProcessingStatus.FAILED] || 0;

      // 计算处理速率
      const uptime = Date.now() - this.stats.startTime;
      const processingRate = this.stats.events / (uptime / 1000); // events per second

      // 确定总体状态
      const isHealthy =
        publisherHealth.status === 'healthy' &&
        subscriberHealth.status === 'healthy' &&
        this.isInitialized;

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        components: {
          publisher: publisherHealth,
          subscriber: subscriberHealth,
          eventStore: {
            status: 'healthy',
            details: { totalEvents: stats.totalEvents },
          },
        },
        statistics: {
          totalEvents: stats.totalEvents,
          pendingEvents,
          failedEvents,
          processingRate,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        components: {
          publisher: { status: 'unknown' },
          subscriber: { status: 'unknown' },
          eventStore: { status: 'unknown' },
        },
        statistics: {
          totalEvents: 0,
          pendingEvents: 0,
          failedEvents: 0,
          processingRate: 0,
        },
      };
    }
  }
}

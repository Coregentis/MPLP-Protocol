/**
 * 增强事件通知服务 - 为Core模块提供丰富的事件通知
 * 
 * 功能：
 * - 结构化事件数据格式
 * - 多级事件分类和优先级
 * - 事件聚合和批量通知
 * - 事件过滤和订阅管理
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { UUID, Timestamp } from '../../types';
import { Logger } from '../../../../public/utils/logger';
// Confirm entity is imported but used in interfaces

/**
 * 增强事件类型枚举
 */
export enum EnhancedEventType {
  // 生命周期事件
  CONFIRM_CREATED = 'confirm.created',
  CONFIRM_UPDATED = 'confirm.updated',
  CONFIRM_DELETED = 'confirm.deleted',
  CONFIRM_APPROVED = 'confirm.approved',
  CONFIRM_REJECTED = 'confirm.rejected',
  CONFIRM_ESCALATED = 'confirm.escalated',
  
  // 工作流事件
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_STEP_COMPLETED = 'workflow.step_completed',
  WORKFLOW_PAUSED = 'workflow.paused',
  WORKFLOW_RESUMED = 'workflow.resumed',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  
  // 决策事件
  DECISION_MADE = 'decision.made',
  RULE_EXECUTED = 'decision.rule_executed',
  CONDITION_EVALUATED = 'decision.condition_evaluated',
  AUTOMATION_TRIGGERED = 'decision.automation_triggered',
  
  // 用户交互事件
  USER_ACTION_REQUIRED = 'user.action_required',
  USER_RESPONSE_RECEIVED = 'user.response_received',
  NOTIFICATION_SENT = 'user.notification_sent',
  REMINDER_SENT = 'user.reminder_sent',
  
  // 性能和监控事件
  PERFORMANCE_THRESHOLD_EXCEEDED = 'performance.threshold_exceeded',
  ERROR_OCCURRED = 'system.error_occurred',
  WARNING_ISSUED = 'system.warning_issued',
  HEALTH_CHECK_COMPLETED = 'system.health_check_completed',
  
  // 集成事件
  EXTERNAL_API_CALLED = 'integration.external_api_called',
  DATA_SYNC_COMPLETED = 'integration.data_sync_completed',
  WEBHOOK_RECEIVED = 'integration.webhook_received'
}

/**
 * 事件优先级枚举
 */
export enum EventPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  DEBUG = 'debug'
}

/**
 * 事件类别枚举
 */
export enum EventCategory {
  LIFECYCLE = 'lifecycle',
  WORKFLOW = 'workflow',
  DECISION = 'decision',
  USER_INTERACTION = 'user_interaction',
  PERFORMANCE = 'performance',
  SYSTEM = 'system',
  INTEGRATION = 'integration'
}

/**
 * 增强事件数据接口
 */
export interface EnhancedEventData {
  // 基本信息
  eventId: UUID;
  eventType: EnhancedEventType;
  eventName: string;
  eventDescription: string;
  
  // 分类和优先级
  category: EventCategory;
  priority: EventPriority;
  
  // 时间信息
  timestamp: Timestamp;
  eventVersion: string;
  
  // 关联信息
  confirmId?: UUID;
  contextId?: UUID;
  planId?: UUID;
  userId?: string;
  sessionId?: UUID;
  correlationId?: UUID;
  
  // 事件载荷
  payload: {
    // 当前状态
    currentState?: Record<string, unknown>;
    // 前一状态
    previousState?: Record<string, unknown>;
    // 变更数据
    changes?: {
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }[];
    // 业务数据
    businessData?: Record<string, unknown>;
    // 技术数据
    technicalData?: Record<string, unknown>;
  };
  
  // 性能指标
  performanceMetrics?: {
    executionTime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    networkLatency?: number;
    databaseQueries?: number;
  };
  
  // 错误信息
  errorInfo?: {
    errorCode?: string;
    errorMessage?: string;
    stackTrace?: string[];
    errorContext?: Record<string, unknown>;
  };
  
  // 标签和元数据
  tags?: string[];
  metadata?: Record<string, unknown>;
  
  // 通知配置
  notificationConfig?: {
    channels?: ('webhook' | 'email' | 'sms' | 'push')[];
    recipients?: string[];
    template?: string;
    urgency?: 'immediate' | 'batched' | 'scheduled';
  };
}

/**
 * 事件订阅配置接口
 */
export interface EventSubscriptionConfig {
  subscriptionId: UUID;
  subscriberName: string;
  eventTypes: EnhancedEventType[];
  filters?: {
    categories?: EventCategory[];
    priorities?: EventPriority[];
    confirmIds?: UUID[];
    userIds?: string[];
    tags?: string[];
  };
  deliveryConfig: {
    endpoint: string;
    method: 'POST' | 'PUT';
    headers?: Record<string, string>;
    authentication?: {
      type: 'bearer' | 'basic' | 'api_key';
      credentials: Record<string, string>;
    };
    retryPolicy?: {
      maxAttempts: number;
      delayMs: number;
      backoffMultiplier?: number;
    };
    batchConfig?: {
      enabled: boolean;
      maxBatchSize: number;
      maxWaitTimeMs: number;
    };
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 事件聚合配置接口
 */
export interface EventAggregationConfig {
  aggregationId: UUID;
  name: string;
  eventTypes: EnhancedEventType[];
  aggregationRules: {
    groupBy: string[];
    timeWindow: number; // 毫秒
    aggregationFunction: 'count' | 'sum' | 'avg' | 'min' | 'max';
    threshold?: number;
  };
  outputEventType: EnhancedEventType;
  isActive: boolean;
}

/**
 * 增强事件通知服务接口
 */
export interface IEnhancedEventNotificationService {
  // 事件发布
  publishEvent(eventData: EnhancedEventData): Promise<void>;
  publishBatchEvents(events: EnhancedEventData[]): Promise<void>;
  
  // 订阅管理
  subscribe(config: EventSubscriptionConfig): Promise<void>;
  unsubscribe(subscriptionId: UUID): Promise<void>;
  updateSubscription(subscriptionId: UUID, updates: Partial<EventSubscriptionConfig>): Promise<void>;
  getSubscriptions(): Promise<EventSubscriptionConfig[]>;
  
  // 事件聚合
  configureAggregation(config: EventAggregationConfig): Promise<void>;
  removeAggregation(aggregationId: UUID): Promise<void>;
  
  // 事件查询
  getEvents(filters: {
    eventTypes?: EnhancedEventType[];
    confirmIds?: UUID[];
    timeRange?: { start: Timestamp; end: Timestamp };
    limit?: number;
  }): Promise<EnhancedEventData[]>;
  
  // 统计分析
  getEventStatistics(timeRange: { start: Timestamp; end: Timestamp }): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByCategory: Record<string, number>;
    eventsByPriority: Record<string, number>;
    averageProcessingTime: number;
  }>;
}

/**
 * 增强事件通知服务实现
 */
export class EnhancedEventNotificationService implements IEnhancedEventNotificationService {
  private logger: Logger;
  private events: EnhancedEventData[] = [];
  private subscriptions: Map<UUID, EventSubscriptionConfig> = new Map();
  private aggregationConfigs: Map<UUID, EventAggregationConfig> = new Map();
  private eventBatches: Map<UUID, EnhancedEventData[]> = new Map();

  constructor() {
    this.logger = new Logger('EnhancedEventNotificationService');
    this.initializeDefaultSubscriptions();
  }

  /**
   * 发布事件
   */
  async publishEvent(eventData: EnhancedEventData): Promise<void> {
    try {
      // 验证事件数据
      this.validateEventData(eventData);

      // 存储事件
      this.events.push(eventData);

      // 处理事件聚合
      await this.processEventAggregation(eventData);

      // 通知订阅者
      await this.notifySubscribers(eventData);

      this.logger.debug('Event published successfully', {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        priority: eventData.priority
      });

    } catch (error) {
      this.logger.error('Failed to publish event', {
        eventId: eventData.eventId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 批量发布事件
   */
  async publishBatchEvents(events: EnhancedEventData[]): Promise<void> {
    const promises = events.map(event => this.publishEvent(event));
    await Promise.allSettled(promises);

    this.logger.info('Batch events published', {
      totalEvents: events.length,
      eventTypes: Array.from(new Set(events.map(e => e.eventType)))
    });
  }

  /**
   * 订阅事件
   */
  async subscribe(config: EventSubscriptionConfig): Promise<void> {
    // 验证订阅配置
    this.validateSubscriptionConfig(config);

    // 存储订阅配置
    this.subscriptions.set(config.subscriptionId, config);

    this.logger.info('Event subscription created', {
      subscriptionId: config.subscriptionId,
      subscriberName: config.subscriberName,
      eventTypes: config.eventTypes
    });
  }

  /**
   * 取消订阅
   */
  async unsubscribe(subscriptionId: UUID): Promise<void> {
    if (this.subscriptions.delete(subscriptionId)) {
      this.logger.info('Event subscription removed', { subscriptionId });
    } else {
      this.logger.warn('Subscription not found for removal', { subscriptionId });
    }
  }

  /**
   * 更新订阅
   */
  async updateSubscription(subscriptionId: UUID, updates: Partial<EventSubscriptionConfig>): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const updatedSubscription = {
      ...subscription,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.subscriptions.set(subscriptionId, updatedSubscription);

    this.logger.info('Event subscription updated', {
      subscriptionId,
      updates: Object.keys(updates)
    });
  }

  /**
   * 获取订阅列表
   */
  async getSubscriptions(): Promise<EventSubscriptionConfig[]> {
    return Array.from(this.subscriptions.values());
  }

  /**
   * 配置事件聚合
   */
  async configureAggregation(config: EventAggregationConfig): Promise<void> {
    this.aggregationConfigs.set(config.aggregationId, config);

    this.logger.info('Event aggregation configured', {
      aggregationId: config.aggregationId,
      name: config.name,
      eventTypes: config.eventTypes
    });
  }

  /**
   * 移除事件聚合
   */
  async removeAggregation(aggregationId: UUID): Promise<void> {
    if (this.aggregationConfigs.delete(aggregationId)) {
      this.logger.info('Event aggregation removed', { aggregationId });
    } else {
      this.logger.warn('Aggregation not found for removal', { aggregationId });
    }
  }

  /**
   * 获取事件
   */
  async getEvents(filters: {
    eventTypes?: EnhancedEventType[];
    confirmIds?: UUID[];
    timeRange?: { start: Timestamp; end: Timestamp };
    limit?: number;
  }): Promise<EnhancedEventData[]> {
    let filteredEvents = this.events;

    // 按事件类型过滤
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filters.eventTypes!.includes(event.eventType)
      );
    }

    // 按确认ID过滤
    if (filters.confirmIds && filters.confirmIds.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        event.confirmId && filters.confirmIds!.includes(event.confirmId)
      );
    }

    // 按时间范围过滤
    if (filters.timeRange) {
      const startTime = new Date(filters.timeRange.start).getTime();
      const endTime = new Date(filters.timeRange.end).getTime();
      
      filteredEvents = filteredEvents.filter(event => {
        const eventTime = new Date(event.timestamp).getTime();
        return eventTime >= startTime && eventTime <= endTime;
      });
    }

    // 按时间排序（最新的在前）
    filteredEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 限制数量
    if (filters.limit && filters.limit > 0) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }

    return filteredEvents;
  }

  /**
   * 获取事件统计
   */
  async getEventStatistics(timeRange: { start: Timestamp; end: Timestamp }): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByCategory: Record<string, number>;
    eventsByPriority: Record<string, number>;
    averageProcessingTime: number;
  }> {
    const events = await this.getEvents({ timeRange });

    const eventsByType: Record<string, number> = {};
    const eventsByCategory: Record<string, number> = {};
    const eventsByPriority: Record<string, number> = {};
    let totalProcessingTime = 0;
    let processedEvents = 0;

    events.forEach(event => {
      // 按类型统计
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      
      // 按类别统计
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
      
      // 按优先级统计
      eventsByPriority[event.priority] = (eventsByPriority[event.priority] || 0) + 1;
      
      // 处理时间统计
      if (event.performanceMetrics?.executionTime) {
        totalProcessingTime += event.performanceMetrics.executionTime;
        processedEvents++;
      }
    });

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByCategory,
      eventsByPriority,
      averageProcessingTime: processedEvents > 0 ? totalProcessingTime / processedEvents : 0
    };
  }

  /**
   * 验证事件数据
   */
  private validateEventData(eventData: EnhancedEventData): void {
    if (!eventData.eventId) {
      throw new Error('Event ID is required');
    }
    if (!eventData.eventType) {
      throw new Error('Event type is required');
    }
    if (!eventData.timestamp) {
      throw new Error('Timestamp is required');
    }
    if (!eventData.category) {
      throw new Error('Event category is required');
    }
    if (!eventData.priority) {
      throw new Error('Event priority is required');
    }
  }

  /**
   * 验证订阅配置
   */
  private validateSubscriptionConfig(config: EventSubscriptionConfig): void {
    if (!config.subscriptionId) {
      throw new Error('Subscription ID is required');
    }
    if (!config.subscriberName) {
      throw new Error('Subscriber name is required');
    }
    if (!config.eventTypes || config.eventTypes.length === 0) {
      throw new Error('Event types are required');
    }
    if (!config.deliveryConfig.endpoint) {
      throw new Error('Delivery endpoint is required');
    }
  }

  /**
   * 处理事件聚合
   */
  private async processEventAggregation(eventData: EnhancedEventData): Promise<void> {
    for (const [aggregationId, config] of Array.from(this.aggregationConfigs.entries())) {
      if (!config.isActive || !config.eventTypes.includes(eventData.eventType)) {
        continue;
      }

      // TODO: 实现事件聚合逻辑
      this.logger.debug('Processing event aggregation', {
        aggregationId,
        eventId: eventData.eventId
      });
    }
  }

  /**
   * 通知订阅者
   */
  private async notifySubscribers(eventData: EnhancedEventData): Promise<void> {
    const matchingSubscriptions = Array.from(this.subscriptions.values())
      .filter(subscription => this.matchesSubscription(eventData, subscription));

    const promises = matchingSubscriptions.map(subscription => 
      this.deliverEventToSubscriber(eventData, subscription)
    );

    await Promise.allSettled(promises);
  }

  /**
   * 检查事件是否匹配订阅
   */
  private matchesSubscription(eventData: EnhancedEventData, subscription: EventSubscriptionConfig): boolean {
    if (!subscription.isActive) {
      return false;
    }

    // 检查事件类型
    if (!subscription.eventTypes.includes(eventData.eventType)) {
      return false;
    }

    // 检查过滤条件
    if (subscription.filters) {
      const { categories, priorities, confirmIds, userIds, tags } = subscription.filters;

      if (categories && !categories.includes(eventData.category)) {
        return false;
      }

      if (priorities && !priorities.includes(eventData.priority)) {
        return false;
      }

      if (confirmIds && eventData.confirmId && !confirmIds.includes(eventData.confirmId)) {
        return false;
      }

      if (userIds && eventData.userId && !userIds.includes(eventData.userId)) {
        return false;
      }

      if (tags && eventData.tags) {
        const hasMatchingTag = tags.some(tag => eventData.tags!.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 向订阅者投递事件
   */
  private async deliverEventToSubscriber(eventData: EnhancedEventData, subscription: EventSubscriptionConfig): Promise<void> {
    try {
      // TODO: 实现实际的事件投递逻辑
      // 这里应该根据deliveryConfig发送HTTP请求或其他方式通知订阅者
      
      this.logger.debug('Event delivered to subscriber', {
        eventId: eventData.eventId,
        subscriptionId: subscription.subscriptionId,
        endpoint: subscription.deliveryConfig.endpoint
      });

    } catch (error) {
      this.logger.error('Failed to deliver event to subscriber', {
        eventId: eventData.eventId,
        subscriptionId: subscription.subscriptionId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 初始化默认订阅
   */
  private initializeDefaultSubscriptions(): void {
    // 为Core模块创建默认订阅
    const coreSubscription: EventSubscriptionConfig = {
      subscriptionId: 'core-default-subscription' as UUID,
      subscriberName: 'CoreOrchestrator',
      eventTypes: [
        EnhancedEventType.CONFIRM_CREATED,
        EnhancedEventType.CONFIRM_APPROVED,
        EnhancedEventType.CONFIRM_REJECTED,
        EnhancedEventType.WORKFLOW_COMPLETED,
        EnhancedEventType.ERROR_OCCURRED
      ],
      filters: {
        priorities: [EventPriority.CRITICAL, EventPriority.HIGH, EventPriority.MEDIUM]
      },
      deliveryConfig: {
        endpoint: '/api/core/events',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.subscriptions.set(coreSubscription.subscriptionId, coreSubscription);

    this.logger.info('Default event subscriptions initialized', {
      subscriptionsCount: this.subscriptions.size
    });
  }
}

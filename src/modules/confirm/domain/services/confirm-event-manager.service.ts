/**
 * 确认事件管理器 - 确认流程事件协调
 * 
 * 功能：
 * - 确认生命周期事件管理
 * - 事件触发和分发
 * - 与Trace模块集成
 * - 事件历史记录
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { UUID, Timestamp, ConfirmStatus } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { 
  NotificationService, 
  NotificationType, 
  NotificationChannel, 
  NotificationPriority,
  NotificationEventData 
} from './notification.service';
import {
  EventPushService,
  EventPushType
} from './event-push.service';

/**
 * 确认事件类型枚举
 */
export enum ConfirmEventType {
  // 生命周期事件
  CONFIRMATION_CREATED = 'confirmation_created',
  CONFIRMATION_SUBMITTED = 'confirmation_submitted',
  CONFIRMATION_APPROVED = 'confirmation_approved',
  CONFIRMATION_REJECTED = 'confirmation_rejected',
  CONFIRMATION_CANCELLED = 'confirmation_cancelled',
  CONFIRMATION_EXPIRED = 'confirmation_expired',
  
  // 审批流程事件
  APPROVAL_REQUESTED = 'approval_requested',
  APPROVAL_SUBMITTED = 'approval_submitted',
  APPROVAL_WITHDRAWN = 'approval_withdrawn',
  APPROVER_ASSIGNED = 'approver_assigned',
  APPROVER_REMOVED = 'approver_removed',
  
  // 状态变更事件
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  DEADLINE_EXTENDED = 'deadline_extended',
  
  // 超时和升级事件
  TIMEOUT_WARNING = 'timeout_warning',
  TIMEOUT_OCCURRED = 'timeout_occurred',
  ESCALATION_TRIGGERED = 'escalation_triggered',
  ESCALATION_COMPLETED = 'escalation_completed',
  
  // 通知事件
  REMINDER_SENT = 'reminder_sent',
  NOTIFICATION_FAILED = 'notification_failed'
}

/**
 * 确认事件数据接口
 */
export interface ConfirmEventData {
  eventType: ConfirmEventType;
  confirmId: UUID;
  contextId?: UUID;
  planId?: UUID;
  userId?: string;
  status?: string;
  previousStatus?: ConfirmStatus;
  newStatus?: ConfirmStatus;
  decision?: string; // 改为string类型以兼容NotificationEventData
  approverUserId?: string;
  escalationLevel?: number;
  timeoutDuration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * 事件处理器接口
 */
export interface EventHandler {
  eventType: ConfirmEventType;
  handler: (eventData: ConfirmEventData) => Promise<void>;
  priority: number;
}

/**
 * 事件历史记录接口
 */
export interface EventHistoryRecord {
  id: UUID;
  eventType: ConfirmEventType;
  confirmId: UUID;
  eventData: ConfirmEventData;
  timestamp: Timestamp;
  processedAt?: Timestamp;
  processingDuration?: number;
  success: boolean;
  error?: string;
}

/**
 * 确认事件管理器接口
 */
export interface IConfirmEventManager {
  // 事件触发
  emitEvent(eventType: ConfirmEventType, eventData: ConfirmEventData): Promise<void>;
  
  // 事件处理器管理
  registerHandler(handler: EventHandler): void;
  unregisterHandler(eventType: ConfirmEventType, handlerId: string): void;
  
  // 事件历史
  getEventHistory(confirmId: UUID): Promise<EventHistoryRecord[]>;
  
  // 批量事件处理
  emitBatchEvents(events: { eventType: ConfirmEventType; eventData: ConfirmEventData }[]): Promise<void>;
}

/**
 * 确认事件管理器实现
 */
export class ConfirmEventManager implements IConfirmEventManager {
  private logger: Logger;
  private notificationService: NotificationService;
  private eventPushService: EventPushService;
  private eventHandlers: Map<ConfirmEventType, EventHandler[]> = new Map();
  private eventHistory: Map<UUID, EventHistoryRecord[]> = new Map();

  constructor(
    notificationService: NotificationService,
    eventPushService: EventPushService
  ) {
    this.logger = new Logger('ConfirmEventManager');
    this.notificationService = notificationService;
    this.eventPushService = eventPushService;
    
    // 注册默认事件处理器
    this.registerDefaultHandlers();
  }

  /**
   * 触发事件
   */
  async emitEvent(eventType: ConfirmEventType, eventData: ConfirmEventData): Promise<void> {
    const startTime = Date.now();
    const eventRecord: EventHistoryRecord = {
      id: this.generateId(),
      eventType,
      confirmId: eventData.confirmId,
      eventData,
      timestamp: new Date().toISOString(),
      success: false
    };

    try {
      this.logger.info('Emitting confirm event', {
        eventType,
        confirmId: eventData.confirmId,
        contextId: eventData.contextId
      });

      // 执行事件处理器
      await this.executeEventHandlers(eventType, eventData);

      // 发送通知
      await this.sendNotifications(eventType, eventData);

      // 推送实时事件
      await this.pushRealtimeEvent(eventType, eventData);

      // 记录成功
      eventRecord.success = true;
      eventRecord.processedAt = new Date().toISOString();
      eventRecord.processingDuration = Date.now() - startTime;

      this.logger.info('Confirm event processed successfully', {
        eventType,
        confirmId: eventData.confirmId,
        processingDuration: eventRecord.processingDuration
      });

    } catch (error) {
      eventRecord.success = false;
      eventRecord.error = error instanceof Error ? error.message : String(error);
      eventRecord.processedAt = new Date().toISOString();
      eventRecord.processingDuration = Date.now() - startTime;

      this.logger.error('Failed to process confirm event', {
        eventType,
        confirmId: eventData.confirmId,
        error: eventRecord.error
      });

      throw error;
    } finally {
      // 保存事件历史
      this.saveEventHistory(eventRecord);
    }
  }

  /**
   * 注册事件处理器
   */
  registerHandler(handler: EventHandler): void {
    if (!this.eventHandlers.has(handler.eventType)) {
      this.eventHandlers.set(handler.eventType, []);
    }

    const handlers = this.eventHandlers.get(handler.eventType)!;
    handlers.push(handler);
    
    // 按优先级排序
    handlers.sort((a, b) => b.priority - a.priority);

    this.logger.info('Event handler registered', {
      eventType: handler.eventType,
      priority: handler.priority,
      totalHandlers: handlers.length
    });
  }

  /**
   * 注销事件处理器
   */
  unregisterHandler(eventType: ConfirmEventType, handlerId: string): void {
    const handlers = this.eventHandlers.get(eventType);
    if (!handlers) {
      return;
    }

    // 注意：这里需要一个方式来识别处理器，可能需要修改EventHandler接口
    // 暂时使用简单的实现
    this.eventHandlers.set(eventType, []);

    this.logger.info('Event handler unregistered', {
      eventType,
      handlerId
    });
  }

  /**
   * 获取事件历史
   */
  async getEventHistory(confirmId: UUID): Promise<EventHistoryRecord[]> {
    return this.eventHistory.get(confirmId) || [];
  }

  /**
   * 批量触发事件
   */
  async emitBatchEvents(
    events: { eventType: ConfirmEventType; eventData: ConfirmEventData }[]
  ): Promise<void> {
    const promises = events.map(({ eventType, eventData }) => 
      this.emitEvent(eventType, eventData)
    );

    await Promise.allSettled(promises);

    this.logger.info('Batch events processed', {
      totalEvents: events.length
    });
  }

  /**
   * 执行事件处理器
   */
  private async executeEventHandlers(eventType: ConfirmEventType, eventData: ConfirmEventData): Promise<void> {
    const handlers = this.eventHandlers.get(eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler.handler(eventData);
      } catch (error) {
        this.logger.error('Event handler failed', {
          eventType,
          error: error instanceof Error ? error.message : String(error)
        });
        // 继续执行其他处理器
      }
    }
  }

  /**
   * 发送通知
   */
  private async sendNotifications(eventType: ConfirmEventType, eventData: ConfirmEventData): Promise<void> {
    const notificationType = this.mapEventToNotificationType(eventType);
    if (!notificationType) {
      return;
    }

    const priority = this.determineNotificationPriority(eventType);
    const channels = this.determineNotificationChannels(eventType, priority);

    // 确定通知接收者
    const recipients = await this.determineNotificationRecipients(eventData);

    for (const recipient of recipients) {
      for (const channel of channels) {
        try {
          await this.notificationService.sendNotification({
            type: notificationType,
            channel,
            priority,
            recipient,
            subject: this.generateNotificationSubject(eventType),
            content: this.generateNotificationContent(eventType, eventData),
            data: eventData as unknown as Record<string, unknown>,
            confirmId: eventData.confirmId,
            contextId: eventData.contextId,
            maxRetries: 3
          });
        } catch (error) {
          this.logger.error('Failed to send notification', {
            eventType,
            notificationType,
            channel,
            recipient,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  /**
   * 推送实时事件
   */
  private async pushRealtimeEvent(eventType: ConfirmEventType, eventData: ConfirmEventData): Promise<void> {
    const pushType = this.mapEventToPushType(eventType);
    if (!pushType) {
      return;
    }

    const priority = this.determinePushPriority(eventType);
    const targetUsers = await this.determinePushTargets(eventData);

    try {
      await this.eventPushService.pushEvent({
        type: pushType,
        data: eventData as NotificationEventData,
        targetUsers,
        priority
      });
    } catch (error) {
      this.logger.error('Failed to push realtime event', {
        eventType,
        pushType,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 注册默认事件处理器
   */
  private registerDefaultHandlers(): void {
    // 状态变更处理器
    this.registerHandler({
      eventType: ConfirmEventType.STATUS_CHANGED,
      priority: 100,
      handler: async (eventData) => {
        this.logger.info('Status changed', {
          confirmId: eventData.confirmId,
          previousStatus: eventData.previousStatus,
          newStatus: eventData.newStatus
        });
      }
    });

    // 审批完成处理器
    this.registerHandler({
      eventType: ConfirmEventType.CONFIRMATION_APPROVED,
      priority: 100,
      handler: async (eventData) => {
        this.logger.info('Confirmation approved', {
          confirmId: eventData.confirmId,
          decision: eventData.decision,
          approverUserId: eventData.approverUserId
        });
      }
    });

    // 超时警告处理器
    this.registerHandler({
      eventType: ConfirmEventType.TIMEOUT_WARNING,
      priority: 90,
      handler: async (eventData) => {
        this.logger.warn('Confirmation timeout warning', {
          confirmId: eventData.confirmId,
          timeoutDuration: eventData.timeoutDuration
        });
      }
    });
  }

  /**
   * 保存事件历史
   */
  private saveEventHistory(eventRecord: EventHistoryRecord): void {
    if (!this.eventHistory.has(eventRecord.confirmId)) {
      this.eventHistory.set(eventRecord.confirmId, []);
    }

    const history = this.eventHistory.get(eventRecord.confirmId)!;
    history.push(eventRecord);

    // 限制历史记录数量
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
  }

  /**
   * 映射事件类型到通知类型
   */
  private mapEventToNotificationType(eventType: ConfirmEventType): NotificationType | null {
    const mapping: Record<ConfirmEventType, NotificationType | null> = {
      [ConfirmEventType.CONFIRMATION_CREATED]: NotificationType.CONFIRMATION_CREATED,
      [ConfirmEventType.APPROVAL_REQUESTED]: NotificationType.APPROVAL_REQUEST,
      [ConfirmEventType.APPROVAL_SUBMITTED]: NotificationType.APPROVAL_SUBMITTED,
      [ConfirmEventType.CONFIRMATION_APPROVED]: NotificationType.CONFIRMATION_APPROVED,
      [ConfirmEventType.CONFIRMATION_REJECTED]: NotificationType.CONFIRMATION_REJECTED,
      [ConfirmEventType.CONFIRMATION_CANCELLED]: NotificationType.CONFIRMATION_CANCELLED,
      [ConfirmEventType.CONFIRMATION_EXPIRED]: NotificationType.CONFIRMATION_EXPIRED,
      [ConfirmEventType.ESCALATION_TRIGGERED]: NotificationType.ESCALATION_TRIGGERED,
      [ConfirmEventType.REMINDER_SENT]: NotificationType.REMINDER_SENT,
      // 其他事件类型不发送通知
      [ConfirmEventType.CONFIRMATION_SUBMITTED]: null,
      [ConfirmEventType.APPROVAL_WITHDRAWN]: null,
      [ConfirmEventType.APPROVER_ASSIGNED]: null,
      [ConfirmEventType.APPROVER_REMOVED]: null,
      [ConfirmEventType.STATUS_CHANGED]: null,
      [ConfirmEventType.PRIORITY_CHANGED]: null,
      [ConfirmEventType.DEADLINE_EXTENDED]: null,
      [ConfirmEventType.TIMEOUT_WARNING]: null,
      [ConfirmEventType.TIMEOUT_OCCURRED]: null,
      [ConfirmEventType.ESCALATION_COMPLETED]: null,
      [ConfirmEventType.NOTIFICATION_FAILED]: null
    };

    return mapping[eventType] || null;
  }

  /**
   * 映射事件类型到推送类型
   */
  private mapEventToPushType(eventType: ConfirmEventType): EventPushType | null {
    const mapping: Record<ConfirmEventType, EventPushType | null> = {
      [ConfirmEventType.CONFIRMATION_CREATED]: EventPushType.CONFIRMATION_UPDATE,
      [ConfirmEventType.APPROVAL_REQUESTED]: EventPushType.APPROVAL_REQUEST,
      [ConfirmEventType.STATUS_CHANGED]: EventPushType.STATUS_CHANGE,
      [ConfirmEventType.TIMEOUT_WARNING]: EventPushType.TIMEOUT_WARNING,
      [ConfirmEventType.ESCALATION_TRIGGERED]: EventPushType.ESCALATION_NOTICE,
      // 其他映射...
      [ConfirmEventType.CONFIRMATION_SUBMITTED]: EventPushType.CONFIRMATION_UPDATE,
      [ConfirmEventType.CONFIRMATION_APPROVED]: EventPushType.STATUS_CHANGE,
      [ConfirmEventType.CONFIRMATION_REJECTED]: EventPushType.STATUS_CHANGE,
      [ConfirmEventType.CONFIRMATION_CANCELLED]: EventPushType.STATUS_CHANGE,
      [ConfirmEventType.CONFIRMATION_EXPIRED]: EventPushType.STATUS_CHANGE,
      [ConfirmEventType.APPROVAL_SUBMITTED]: EventPushType.APPROVAL_REQUEST,
      [ConfirmEventType.APPROVAL_WITHDRAWN]: null,
      [ConfirmEventType.APPROVER_ASSIGNED]: null,
      [ConfirmEventType.APPROVER_REMOVED]: null,
      [ConfirmEventType.PRIORITY_CHANGED]: null,
      [ConfirmEventType.DEADLINE_EXTENDED]: null,
      [ConfirmEventType.TIMEOUT_OCCURRED]: EventPushType.TIMEOUT_WARNING,
      [ConfirmEventType.ESCALATION_COMPLETED]: EventPushType.ESCALATION_NOTICE,
      [ConfirmEventType.REMINDER_SENT]: EventPushType.SYSTEM_NOTIFICATION,
      [ConfirmEventType.NOTIFICATION_FAILED]: null
    };

    return mapping[eventType] || null;
  }

  /**
   * 确定通知优先级
   */
  private determineNotificationPriority(eventType: ConfirmEventType): NotificationPriority {
    const urgentEvents = [
      ConfirmEventType.ESCALATION_TRIGGERED,
      ConfirmEventType.TIMEOUT_OCCURRED,
      ConfirmEventType.CONFIRMATION_EXPIRED
    ];

    const highEvents = [
      ConfirmEventType.APPROVAL_REQUESTED,
      ConfirmEventType.TIMEOUT_WARNING
    ];

    if (urgentEvents.includes(eventType)) {
      return NotificationPriority.URGENT;
    } else if (highEvents.includes(eventType)) {
      return NotificationPriority.HIGH;
    } else {
      return NotificationPriority.MEDIUM;
    }
  }

  /**
   * 确定通知渠道
   */
  private determineNotificationChannels(
    eventType: ConfirmEventType, 
    priority: NotificationPriority
  ): NotificationChannel[] {
    const channels: NotificationChannel[] = [NotificationChannel.WEBSOCKET];

    if (priority === NotificationPriority.URGENT) {
      channels.push(NotificationChannel.EMAIL, NotificationChannel.SMS);
    } else if (priority === NotificationPriority.HIGH) {
      channels.push(NotificationChannel.EMAIL);
    }

    return channels;
  }

  /**
   * 确定推送优先级
   */
  private determinePushPriority(eventType: ConfirmEventType): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentEvents = [ConfirmEventType.ESCALATION_TRIGGERED, ConfirmEventType.TIMEOUT_OCCURRED];
    const highEvents = [ConfirmEventType.APPROVAL_REQUESTED, ConfirmEventType.TIMEOUT_WARNING];

    if (urgentEvents.includes(eventType)) {
      return 'urgent';
    } else if (highEvents.includes(eventType)) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  /**
   * 确定通知接收者
   */
  private async determineNotificationRecipients(eventData: ConfirmEventData): Promise<string[]> {
    const recipients: string[] = [];

    // 添加请求者
    if (eventData.userId) {
      recipients.push(eventData.userId);
    }

    // 添加审批者
    if (eventData.approverUserId) {
      recipients.push(eventData.approverUserId);
    }

    // TODO: 根据确认配置添加其他相关人员

    return Array.from(new Set(recipients)); // 去重
  }

  /**
   * 确定推送目标
   */
  private async determinePushTargets(eventData: ConfirmEventData): Promise<string[]> {
    // 与通知接收者逻辑相同
    return this.determineNotificationRecipients(eventData);
  }

  /**
   * 生成通知主题
   */
  private generateNotificationSubject(eventType: ConfirmEventType): string {
    const subjects: Record<ConfirmEventType, string> = {
      [ConfirmEventType.CONFIRMATION_CREATED]: '新的确认请求已创建',
      [ConfirmEventType.APPROVAL_REQUESTED]: '需要您的审批',
      [ConfirmEventType.CONFIRMATION_APPROVED]: '确认已批准',
      [ConfirmEventType.CONFIRMATION_REJECTED]: '确认已拒绝',
      [ConfirmEventType.TIMEOUT_WARNING]: '确认即将超时',
      [ConfirmEventType.ESCALATION_TRIGGERED]: '确认已升级',
      // 其他主题...
      [ConfirmEventType.CONFIRMATION_SUBMITTED]: '确认已提交',
      [ConfirmEventType.CONFIRMATION_CANCELLED]: '确认已取消',
      [ConfirmEventType.CONFIRMATION_EXPIRED]: '确认已过期',
      [ConfirmEventType.APPROVAL_SUBMITTED]: '审批已提交',
      [ConfirmEventType.APPROVAL_WITHDRAWN]: '审批已撤回',
      [ConfirmEventType.APPROVER_ASSIGNED]: '审批者已分配',
      [ConfirmEventType.APPROVER_REMOVED]: '审批者已移除',
      [ConfirmEventType.STATUS_CHANGED]: '状态已变更',
      [ConfirmEventType.PRIORITY_CHANGED]: '优先级已变更',
      [ConfirmEventType.DEADLINE_EXTENDED]: '截止时间已延长',
      [ConfirmEventType.TIMEOUT_OCCURRED]: '确认已超时',
      [ConfirmEventType.ESCALATION_COMPLETED]: '升级已完成',
      [ConfirmEventType.REMINDER_SENT]: '提醒已发送',
      [ConfirmEventType.NOTIFICATION_FAILED]: '通知发送失败'
    };

    return subjects[eventType] || '确认通知';
  }

  /**
   * 生成通知内容
   */
  private generateNotificationContent(eventType: ConfirmEventType, eventData: ConfirmEventData): string {
    return `确认ID: ${eventData.confirmId}\n事件类型: ${eventType}\n时间: ${new Date().toLocaleString()}`;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): UUID {
    return `event_${Date.now()}_${Math.random().toString(36).substring(2, 11)}` as UUID;
  }
}

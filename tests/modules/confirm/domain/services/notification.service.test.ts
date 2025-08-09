/**
 * NotificationService 协议级测试
 * 
 * 测试范围：
 * - 通知发送功能
 * - 批量通知处理
 * - 通知订阅管理
 * - 通知历史记录
 * - 边界条件和错误处理
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import {
  NotificationService,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationMessage,
  NotificationSubscription,
  NotificationConfig,
  INotificationService
} from '../../../../../src/modules/confirm/domain/services/notification.service';
import { TestDataFactory } from '../../../../test-utils/test-data-factory';

describe('NotificationService - 协议级测试', () => {
  let notificationService: NotificationService;
  let defaultConfig: NotificationConfig;

  beforeEach(() => {
    defaultConfig = {
      enableRealtime: true,
      enableEmail: true,
      enableSMS: false,
      enablePush: true,
      enableWebhook: false,
      defaultChannels: [NotificationChannel.WEBSOCKET, NotificationChannel.EMAIL],
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      templates: {
        [NotificationType.CONFIRMATION_CREATED]: {
          subject: '确认请求已创建',
          content: '您有一个新的确认请求需要处理'
        },
        [NotificationType.APPROVAL_REQUEST]: {
          subject: '审批请求',
          content: '请审批确认请求'
        },
        [NotificationType.APPROVAL_SUBMITTED]: {
          subject: '审批已提交',
          content: '审批已提交，等待处理'
        },
        [NotificationType.CONFIRMATION_APPROVED]: {
          subject: '确认已批准',
          content: '您的确认请求已被批准'
        },
        [NotificationType.CONFIRMATION_REJECTED]: {
          subject: '确认已拒绝',
          content: '您的确认请求已被拒绝'
        },
        [NotificationType.CONFIRMATION_CANCELLED]: {
          subject: '确认已取消',
          content: '确认请求已被取消'
        },
        [NotificationType.CONFIRMATION_EXPIRED]: {
          subject: '确认已过期',
          content: '确认请求已过期'
        },
        [NotificationType.ESCALATION_TRIGGERED]: {
          subject: '升级触发',
          content: '确认请求已升级'
        },
        [NotificationType.REMINDER_SENT]: {
          subject: '提醒通知',
          content: '这是一个提醒通知'
        }
      }
    };

    notificationService = new NotificationService(defaultConfig);
  });

  describe('通知发送功能', () => {
    it('应该成功发送单个通知', async () => {
      const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
        type: NotificationType.CONFIRMATION_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipient: 'test@example.com',
        subject: '测试通知',
        content: '这是一个测试通知',
        confirmId: TestDataFactory.generateUUID(),
        contextId: TestDataFactory.generateUUID(),
        maxRetries: 3,
        sentAt: undefined,
        deliveredAt: undefined,
        failureReason: undefined,
        data: {
          testData: 'value'
        }
      };

      const result = await notificationService.sendNotification(messageData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe(NotificationType.CONFIRMATION_CREATED);
      expect(result.channel).toBe(NotificationChannel.EMAIL);
      expect(result.recipient).toBe('test@example.com');
      expect(result.status).toBe(NotificationStatus.SENT);
      expect(result.retryCount).toBe(0);
      expect(result.createdAt).toBeDefined();
      expect(result.sentAt).toBeDefined();
    });

    it('应该处理不同的通知类型', async () => {
      const types = [
        NotificationType.APPROVAL_REQUEST,
        NotificationType.CONFIRMATION_APPROVED,
        NotificationType.CONFIRMATION_REJECTED
      ];

      for (const type of types) {
        const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
          type,
          channel: NotificationChannel.WEBSOCKET,
          priority: NotificationPriority.HIGH,
          recipient: 'user@example.com',
          subject: `测试${type}`,
          content: `测试内容${type}`,
          maxRetries: 3,
          sentAt: undefined,
          deliveredAt: undefined,
          failureReason: undefined
        };

        const result = await notificationService.sendNotification(messageData);
        expect(result.type).toBe(type);
        expect(result.status).toBe(NotificationStatus.SENT);
      }
    });

    it('应该处理不同的通知渠道', async () => {
      const channels = [
        NotificationChannel.WEBSOCKET,
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.PUSH,
        NotificationChannel.WEBHOOK
      ];

      for (const channel of channels) {
        const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
          type: NotificationType.CONFIRMATION_CREATED,
          channel,
          priority: NotificationPriority.MEDIUM,
          recipient: 'test@example.com',
          subject: `测试${channel}`,
          content: `测试内容${channel}`,
          maxRetries: 3,
          sentAt: undefined,
          deliveredAt: undefined,
          failureReason: undefined
        };

        const result = await notificationService.sendNotification(messageData);
        expect(result.channel).toBe(channel);
        expect(result.status).toBe(NotificationStatus.SENT);
      }
    });
  });

  describe('批量通知处理', () => {
    it('应该批量发送多个通知', async () => {
      const messages: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'>[] = [
        {
          type: NotificationType.CONFIRMATION_CREATED,
          channel: NotificationChannel.EMAIL,
          priority: NotificationPriority.MEDIUM,
          recipient: 'user1@example.com',
          subject: '通知1',
          content: '内容1',
          maxRetries: 3,
          sentAt: undefined,
          deliveredAt: undefined,
          failureReason: undefined
        },
        {
          type: NotificationType.APPROVAL_REQUEST,
          channel: NotificationChannel.WEBSOCKET,
          priority: NotificationPriority.HIGH,
          recipient: 'user2@example.com',
          subject: '通知2',
          content: '内容2',
          maxRetries: 3,
          sentAt: undefined,
          deliveredAt: undefined,
          failureReason: undefined
        }
      ];

      const results = await notificationService.sendBatchNotifications(messages);

      expect(results).toHaveLength(2);
      expect(results[0].recipient).toBe('user1@example.com');
      expect(results[1].recipient).toBe('user2@example.com');
      expect(results[0].status).toBe(NotificationStatus.SENT);
      expect(results[1].status).toBe(NotificationStatus.SENT);
    });

    it('应该处理空通知列表', async () => {
      const results = await notificationService.sendBatchNotifications([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('通知订阅管理', () => {
    it('应该创建通知订阅', async () => {
      const subscriptionData: Omit<NotificationSubscription, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'test-user',
        confirmId: TestDataFactory.generateUUID(),
        contextId: TestDataFactory.generateUUID(),
        types: [NotificationType.CONFIRMATION_CREATED, NotificationType.APPROVAL_REQUEST],
        channels: [NotificationChannel.EMAIL, NotificationChannel.WEBSOCKET],
        isActive: true
      };

      const subscription = await notificationService.subscribe(subscriptionData);

      expect(subscription).toBeDefined();
      expect(subscription.id).toBeDefined();
      expect(subscription.userId).toBe('test-user');
      expect(subscription.types).toContain(NotificationType.CONFIRMATION_CREATED);
      expect(subscription.channels).toContain(NotificationChannel.EMAIL);
      expect(subscription.isActive).toBe(true);
      expect(subscription.createdAt).toBeDefined();
      expect(subscription.updatedAt).toBeDefined();
    });

    it('应该取消通知订阅', async () => {
      const subscriptionData: Omit<NotificationSubscription, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'test-user',
        types: [NotificationType.CONFIRMATION_APPROVED],
        channels: [NotificationChannel.EMAIL],
        isActive: true
      };

      const subscription = await notificationService.subscribe(subscriptionData);
      const unsubscribed = await notificationService.unsubscribe(subscription.id);

      expect(unsubscribed).toBe(true);
    });

    it('应该处理不存在的订阅取消', async () => {
      const nonExistentId = TestDataFactory.generateUUID();
      const unsubscribed = await notificationService.unsubscribe(nonExistentId);

      expect(unsubscribed).toBe(false);
    });
  });

  describe('通知历史记录', () => {
    it('应该获取用户通知历史', async () => {
      const userId = 'test-user';
      
      // 先发送一些通知
      const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
        type: NotificationType.CONFIRMATION_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipient: userId,
        subject: '历史测试通知',
        content: '这是历史测试通知',
        maxRetries: 3,
        sentAt: undefined,
        deliveredAt: undefined,
        failureReason: undefined
      };

      await notificationService.sendNotification(messageData);

      const history = await notificationService.getNotificationHistory(userId);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].recipient).toBe(userId);
    });

    it('应该限制历史记录数量', async () => {
      const userId = 'test-user-limit';
      
      // 发送多个通知
      for (let i = 0; i < 5; i++) {
        const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
          type: NotificationType.CONFIRMATION_CREATED,
          channel: NotificationChannel.EMAIL,
          priority: NotificationPriority.MEDIUM,
          recipient: userId,
          subject: `通知${i}`,
          content: `内容${i}`,
          maxRetries: 3,
          sentAt: undefined,
          deliveredAt: undefined,
          failureReason: undefined
        };
        await notificationService.sendNotification(messageData);
      }

      const history = await notificationService.getNotificationHistory(userId, 3);

      expect(history).toHaveLength(3); // 限制为3个
    });
  });

  describe('通知状态管理', () => {
    it('应该标记通知为已读', async () => {
      const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
        type: NotificationType.CONFIRMATION_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipient: 'test@example.com',
        subject: '已读测试',
        content: '已读测试内容',
        maxRetries: 3,
        sentAt: undefined,
        deliveredAt: undefined,
        failureReason: undefined
      };

      const notification = await notificationService.sendNotification(messageData);
      const marked = await notificationService.markAsRead(notification.id);

      expect(marked).toBe(true);
    });

    it('应该处理不存在的通知标记', async () => {
      const nonExistentId = TestDataFactory.generateUUID();
      const marked = await notificationService.markAsRead(nonExistentId);

      expect(marked).toBe(false);
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理空收件人', async () => {
      const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
        type: NotificationType.CONFIRMATION_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipient: '', // 空收件人
        subject: '测试',
        content: '测试内容',
        maxRetries: 3,
        sentAt: undefined,
        deliveredAt: undefined,
        failureReason: undefined
      };

      const result = await notificationService.sendNotification(messageData);
      expect(result).toBeDefined();
      expect(result.recipient).toBe('');
    });

    it('应该处理空主题和内容', async () => {
      const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
        type: NotificationType.CONFIRMATION_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipient: 'test@example.com',
        subject: '', // 空主题
        content: '', // 空内容
        maxRetries: 3,
        sentAt: undefined,
        deliveredAt: undefined,
        failureReason: undefined
      };

      const result = await notificationService.sendNotification(messageData);
      expect(result).toBeDefined();
      expect(result.subject).toBe('');
      expect(result.content).toBe('');
    });

    it('应该处理重试失败的通知', async () => {
      // 先创建一个通知
      const messageData: Omit<NotificationMessage, 'id' | 'createdAt' | 'status' | 'retryCount'> = {
        type: NotificationType.CONFIRMATION_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.MEDIUM,
        recipient: 'test@example.com',
        subject: '重试测试',
        content: '重试测试内容',
        maxRetries: 3,
        sentAt: undefined,
        deliveredAt: undefined,
        failureReason: undefined
      };

      const notification = await notificationService.sendNotification(messageData);
      
      // 尝试重试一个成功的通知（应该返回false，因为状态不是FAILED）
      const retried = await notificationService.retryFailedNotification(notification.id);
      expect(retried).toBe(false);
    });

    it('应该处理不存在的通知重试', async () => {
      const nonExistentId = TestDataFactory.generateUUID();
      const retried = await notificationService.retryFailedNotification(nonExistentId);

      expect(retried).toBe(false);
    });
  });
});

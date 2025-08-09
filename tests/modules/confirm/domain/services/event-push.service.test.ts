/**
 * EventPushService 协议级测试
 * 
 * 测试范围：
 * - WebSocket连接管理
 * - 事件订阅管理
 * - 事件推送功能
 * - 连接监控和统计
 * - 边界条件和错误处理
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import {
  EventPushService,
  ConnectionStatus,
  EventPushType,
  WebSocketConnection,
  EventSubscription,
  PushEvent,
  PushResult,
  IEventPushService
} from '../../../../../src/modules/confirm/domain/services/event-push.service';
import { NotificationEventData } from '../../../../../src/modules/confirm/domain/services/notification.service';
import { TestDataFactory } from '../../../../test-utils/test-data-factory';

describe('EventPushService - 协议级测试', () => {
  let eventPushService: EventPushService;

  beforeEach(() => {
    eventPushService = new EventPushService();
  });

  afterEach(() => {
    // 停止清理定时器
    eventPushService.stopCleanupTimer();
  });

  describe('WebSocket连接管理', () => {
    it('应该成功添加WebSocket连接', async () => {
      const userId = 'test-user-1';
      const mockSocket = { readyState: 1 }; // 模拟WebSocket
      const metadata = { userAgent: 'test-browser' };

      const connection = await eventPushService.addConnection(userId, mockSocket, metadata);

      expect(connection).toBeDefined();
      expect(connection.userId).toBe(userId);
      expect(connection.status).toBe(ConnectionStatus.CONNECTED);
      expect(connection.id).toBeDefined();
      expect(connection.metadata).toEqual(metadata);
      expect(connection.connectedAt).toBeDefined();
      expect(connection.lastActivity).toBeDefined();
      expect(Array.isArray(connection.subscriptions)).toBe(true);
    });

    it('应该获取WebSocket连接', async () => {
      const userId = 'test-user-2';
      const mockSocket = { readyState: 1 };

      const connection = await eventPushService.addConnection(userId, mockSocket);
      const retrievedConnection = eventPushService.getConnection(connection.id);

      expect(retrievedConnection).toBeDefined();
      expect(retrievedConnection?.id).toBe(connection.id);
      expect(retrievedConnection?.userId).toBe(userId);
    });

    it('应该移除WebSocket连接', async () => {
      const userId = 'test-user-3';
      const mockSocket = { readyState: 1 };

      const connection = await eventPushService.addConnection(userId, mockSocket);
      const removed = await eventPushService.removeConnection(connection.id);

      expect(removed).toBe(true);
      expect(eventPushService.getConnection(connection.id)).toBeUndefined();
    });

    it('应该获取用户的所有连接', async () => {
      const userId = 'test-user-4';
      const mockSocket1 = { readyState: 1 };
      const mockSocket2 = { readyState: 1 };

      await eventPushService.addConnection(userId, mockSocket1);
      await eventPushService.addConnection(userId, mockSocket2);

      const connections = eventPushService.getUserConnections(userId);

      expect(connections).toHaveLength(2);
      expect(connections[0].userId).toBe(userId);
      expect(connections[1].userId).toBe(userId);
    });

    it('应该获取连接统计信息', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const mockSocket1 = { readyState: 1 };
      const mockSocket2 = { readyState: 1 };

      await eventPushService.addConnection(userId1, mockSocket1);
      await eventPushService.addConnection(userId2, mockSocket2);

      const stats = eventPushService.getConnectionStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalConnections).toBe('number');
      expect(typeof stats.activeConnections).toBe('number');
      expect(typeof stats.userCount).toBe('number');
      expect(typeof stats.averageConnectionTime).toBe('number');
      expect(stats.totalConnections).toBeGreaterThanOrEqual(2);
    });
  });

  describe('事件订阅管理', () => {
    it('应该创建事件订阅', async () => {
      const userId = 'subscriber-1';
      const mockSocket = { readyState: 1 };
      await eventPushService.addConnection(userId, mockSocket);

      const subscriptionData: Omit<EventSubscription, 'id' | 'createdAt'> = {
        userId,
        eventTypes: [EventPushType.CONFIRMATION_UPDATE, EventPushType.STATUS_CHANGE],
        confirmIds: [TestDataFactory.generateUUID()],
        contextIds: [TestDataFactory.generateUUID()],
        filters: {
          priority: 'high'
        },
        isActive: true
      };

      const subscription = await eventPushService.subscribe(subscriptionData);

      expect(subscription).toBeDefined();
      expect(subscription.id).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.eventTypes).toContain(EventPushType.CONFIRMATION_UPDATE);
      expect(subscription.isActive).toBe(true);
      expect(subscription.createdAt).toBeDefined();
    });

    it('应该取消事件订阅', async () => {
      const userId = 'subscriber-2';
      const mockSocket = { readyState: 1 };
      await eventPushService.addConnection(userId, mockSocket);

      const subscriptionData: Omit<EventSubscription, 'id' | 'createdAt'> = {
        userId,
        eventTypes: [EventPushType.APPROVAL_REQUEST],
        isActive: true
      };

      const subscription = await eventPushService.subscribe(subscriptionData);
      const unsubscribed = await eventPushService.unsubscribe(subscription.id);

      expect(unsubscribed).toBe(true);
    });

    it('应该处理不存在的订阅取消', async () => {
      const nonExistentId = TestDataFactory.generateUUID();
      const unsubscribed = await eventPushService.unsubscribe(nonExistentId);

      expect(unsubscribed).toBe(false);
    });
  });

  describe('事件推送功能', () => {
    it('应该推送事件到指定用户', async () => {
      const userId = 'push-user-1';
      const mockSocket = { readyState: 1 };
      await eventPushService.addConnection(userId, mockSocket);

      const eventData: Omit<PushEvent, 'id' | 'timestamp' | 'targetUsers'> = {
        type: EventPushType.CONFIRMATION_UPDATE,
        data: {
          confirmId: TestDataFactory.generateUUID(),
          contextId: TestDataFactory.generateUUID(),
          status: 'approved'
        } as NotificationEventData,
        priority: 'high'
      };

      const result = await eventPushService.pushToUser(userId, eventData);

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
      expect(result.totalTargets).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
      expect(result.timestamp).toBeDefined();
    });

    it('应该推送事件到指定连接', async () => {
      const userId = 'push-user-2';
      const mockSocket = { readyState: 1 };
      const connection = await eventPushService.addConnection(userId, mockSocket);

      const eventData: Omit<PushEvent, 'id' | 'timestamp' | 'targetConnections'> = {
        type: EventPushType.STATUS_CHANGE,
        data: {
          confirmId: TestDataFactory.generateUUID(),
          status: 'rejected'
        } as NotificationEventData,
        priority: 'medium'
      };

      const result = await eventPushService.pushToConnection(connection.id, eventData);

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
      expect(result.totalTargets).toBe(1);
      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
    });

    it('应该广播事件到所有相关订阅者', async () => {
      const userId1 = 'broadcast-user-1';
      const userId2 = 'broadcast-user-2';
      const mockSocket1 = { readyState: 1 };
      const mockSocket2 = { readyState: 1 };

      await eventPushService.addConnection(userId1, mockSocket1);
      await eventPushService.addConnection(userId2, mockSocket2);

      // 创建订阅
      await eventPushService.subscribe({
        userId: userId1,
        eventTypes: [EventPushType.SYSTEM_NOTIFICATION],
        isActive: true
      });

      await eventPushService.subscribe({
        userId: userId2,
        eventTypes: [EventPushType.SYSTEM_NOTIFICATION],
        isActive: true
      });

      const eventData: Omit<PushEvent, 'id' | 'timestamp'> = {
        type: EventPushType.SYSTEM_NOTIFICATION,
        data: {
          message: '系统维护通知'
        } as NotificationEventData,
        priority: 'urgent'
      };

      const result = await eventPushService.pushEvent(eventData);

      expect(result).toBeDefined();
      expect(result.totalTargets).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('应该处理推送到多个用户', async () => {
      const userId1 = 'multi-user-1';
      const userId2 = 'multi-user-2';
      const mockSocket1 = { readyState: 1 };
      const mockSocket2 = { readyState: 1 };

      await eventPushService.addConnection(userId1, mockSocket1);
      await eventPushService.addConnection(userId2, mockSocket2);

      const eventData: Omit<PushEvent, 'id' | 'timestamp'> = {
        type: EventPushType.APPROVAL_REQUEST,
        data: {
          confirmId: TestDataFactory.generateUUID(),
          message: '您有新的审批请求'
        } as NotificationEventData,
        targetUsers: [userId1, userId2],
        priority: 'high'
      };

      const result = await eventPushService.pushEvent(eventData);

      expect(result.totalTargets).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });
  });

  describe('连接清理功能', () => {
    it('应该清理过期连接', async () => {
      const userId = 'cleanup-user';
      const mockSocket = { readyState: 3 }; // WebSocket.CLOSED
      const connection = await eventPushService.addConnection(userId, mockSocket);

      // 手动设置过期时间
      connection.lastActivity = new Date(Date.now() - 40 * 60 * 1000).toISOString(); // 40分钟前

      const cleanedCount = await eventPushService.cleanupExpiredConnections();

      expect(cleanedCount).toBeGreaterThanOrEqual(1);
      expect(eventPushService.getConnection(connection.id)).toBeUndefined();
    });

    it('应该保留活跃连接', async () => {
      const userId = 'active-user';
      const mockSocket = { readyState: 1 };
      const connection = await eventPushService.addConnection(userId, mockSocket);

      const cleanedCount = await eventPushService.cleanupExpiredConnections();

      expect(eventPushService.getConnection(connection.id)).toBeDefined();
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该处理无效的连接ID', async () => {
      const invalidConnectionId = 'invalid-connection-id';
      const removed = await eventPushService.removeConnection(invalidConnectionId);

      expect(removed).toBe(false);
    });

    it('应该处理不存在的连接获取', () => {
      const nonExistentId = TestDataFactory.generateUUID();
      const connection = eventPushService.getConnection(nonExistentId);

      expect(connection).toBeUndefined();
    });

    it('应该处理空用户ID的连接查询', () => {
      const connections = eventPushService.getUserConnections('non-existent-user');

      expect(connections).toHaveLength(0);
    });

    it('应该处理推送到不存在的用户', async () => {
      const eventData: Omit<PushEvent, 'id' | 'timestamp' | 'targetUsers'> = {
        type: EventPushType.CONFIRMATION_UPDATE,
        data: {
          confirmId: TestDataFactory.generateUUID()
        } as NotificationEventData,
        priority: 'medium'
      };

      const result = await eventPushService.pushToUser('non-existent-user', eventData);

      expect(result.totalTargets).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    it('应该处理推送到不存在的连接', async () => {
      const nonExistentConnectionId = TestDataFactory.generateUUID();
      const eventData: Omit<PushEvent, 'id' | 'timestamp' | 'targetConnections'> = {
        type: EventPushType.STATUS_CHANGE,
        data: {
          confirmId: TestDataFactory.generateUUID()
        } as NotificationEventData,
        priority: 'low'
      };

      const result = await eventPushService.pushToConnection(nonExistentConnectionId, eventData);

      expect(result.totalTargets).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
    });

    it('应该处理重复的用户连接', async () => {
      const userId = 'duplicate-user';
      const mockSocket1 = { readyState: 1 };
      const mockSocket2 = { readyState: 1 };

      const connection1 = await eventPushService.addConnection(userId, mockSocket1);
      const connection2 = await eventPushService.addConnection(userId, mockSocket2);

      expect(connection1.id).not.toBe(connection2.id);
      expect(connection1.userId).toBe(connection2.userId);

      const userConnections = eventPushService.getUserConnections(userId);
      expect(userConnections).toHaveLength(2);
    });

    it('应该处理订阅不活跃的事件类型', async () => {
      const userId = 'inactive-subscriber';
      const mockSocket = { readyState: 1 };
      await eventPushService.addConnection(userId, mockSocket);

      const subscriptionData: Omit<EventSubscription, 'id' | 'createdAt'> = {
        userId,
        eventTypes: [EventPushType.TIMEOUT_WARNING],
        isActive: false // 不活跃的订阅
      };

      const subscription = await eventPushService.subscribe(subscriptionData);

      expect(subscription.isActive).toBe(false);

      // 推送事件，不活跃的订阅不应该收到
      const eventData: Omit<PushEvent, 'id' | 'timestamp'> = {
        type: EventPushType.TIMEOUT_WARNING,
        data: {
          confirmId: TestDataFactory.generateUUID()
        } as NotificationEventData,
        priority: 'medium'
      };

      const result = await eventPushService.pushEvent(eventData);

      // 由于订阅不活跃，应该没有目标
      expect(result.totalTargets).toBe(0);
    });
  });
});

/**
 * 事件推送服务 - 实时事件推送管理
 * 
 * 功能：
 * - WebSocket连接管理
 * - 实时事件推送
 * - 连接状态监控
 * - 事件订阅管理
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { UUID, Timestamp } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { NotificationEventData } from './notification.service';

/**
 * WebSocket连接状态枚举
 */
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * 事件推送类型枚举
 */
export enum EventPushType {
  CONFIRMATION_UPDATE = 'confirmation_update',
  APPROVAL_REQUEST = 'approval_request',
  STATUS_CHANGE = 'status_change',
  TIMEOUT_WARNING = 'timeout_warning',
  ESCALATION_NOTICE = 'escalation_notice',
  SYSTEM_NOTIFICATION = 'system_notification'
}

/**
 * WebSocket连接接口
 */
export interface WebSocketConnection {
  id: UUID;
  userId: string;
  socket: unknown; // WebSocket实例，类型待具体实现时确定
  status: ConnectionStatus;
  connectedAt: Timestamp;
  lastActivity: Timestamp;
  subscriptions: EventSubscription[];
  metadata?: Record<string, unknown>;
}

/**
 * 事件订阅接口
 */
export interface EventSubscription {
  id: UUID;
  userId: string;
  eventTypes: EventPushType[];
  confirmIds?: UUID[];
  contextIds?: UUID[];
  filters?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Timestamp;
}

/**
 * 推送事件接口
 */
export interface PushEvent {
  id: UUID;
  type: EventPushType;
  data: NotificationEventData;
  targetUsers?: string[];
  targetConnections?: UUID[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Timestamp;
  expiresAt?: Timestamp;
}

/**
 * 推送结果接口
 */
export interface PushResult {
  eventId: UUID;
  totalTargets: number;
  successCount: number;
  failureCount: number;
  failures: {
    connectionId: UUID;
    userId: string;
    error: string;
  }[];
  timestamp: Timestamp;
}

/**
 * 事件推送服务接口
 */
export interface IEventPushService {
  // 连接管理
  addConnection(userId: string, socket: unknown, metadata?: Record<string, unknown>): Promise<WebSocketConnection>;
  removeConnection(connectionId: UUID): Promise<boolean>;
  getConnection(connectionId: UUID): WebSocketConnection | undefined;
  getUserConnections(userId: string): WebSocketConnection[];
  
  // 订阅管理
  subscribe(subscription: Omit<EventSubscription, 'id' | 'createdAt'>): Promise<EventSubscription>;
  unsubscribe(subscriptionId: UUID): Promise<boolean>;
  
  // 事件推送
  pushEvent(event: Omit<PushEvent, 'id' | 'timestamp'>): Promise<PushResult>;
  pushToUser(userId: string, event: Omit<PushEvent, 'id' | 'timestamp' | 'targetUsers'>): Promise<PushResult>;
  pushToConnection(connectionId: UUID, event: Omit<PushEvent, 'id' | 'timestamp' | 'targetConnections'>): Promise<PushResult>;
  
  // 连接监控
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    userCount: number;
    averageConnectionTime: number;
  };
  
  // 清理过期连接
  cleanupExpiredConnections(): Promise<number>;
}

/**
 * 事件推送服务实现
 */
export class EventPushService implements IEventPushService {
  private logger: Logger;
  private connections: Map<UUID, WebSocketConnection> = new Map();
  private userConnections: Map<string, Set<UUID>> = new Map();
  private subscriptions: Map<UUID, EventSubscription> = new Map();
  private events: Map<UUID, PushEvent> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.logger = new Logger('EventPushService');
    this.startCleanupTimer();
  }

  /**
   * 添加WebSocket连接
   */
  async addConnection(
    userId: string, 
    socket: unknown, 
    metadata?: Record<string, unknown>
  ): Promise<WebSocketConnection> {
    const connection: WebSocketConnection = {
      id: this.generateId(),
      userId,
      socket,
      status: ConnectionStatus.CONNECTED,
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      subscriptions: [],
      metadata
    };

    this.connections.set(connection.id, connection);
    
    // 更新用户连接映射
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connection.id);

    this.logger.info('WebSocket connection added', {
      connectionId: connection.id,
      userId,
      totalConnections: this.connections.size
    });

    return connection;
  }

  /**
   * 移除WebSocket连接
   */
  async removeConnection(connectionId: UUID): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    // 更新连接状态
    connection.status = ConnectionStatus.DISCONNECTED;
    
    // 从映射中移除
    this.connections.delete(connectionId);
    
    const userConnections = this.userConnections.get(connection.userId);
    if (userConnections) {
      userConnections.delete(connectionId);
      if (userConnections.size === 0) {
        this.userConnections.delete(connection.userId);
      }
    }

    this.logger.info('WebSocket connection removed', {
      connectionId,
      userId: connection.userId,
      totalConnections: this.connections.size
    });

    return true;
  }

  /**
   * 获取连接
   */
  getConnection(connectionId: UUID): WebSocketConnection | undefined {
    return this.connections.get(connectionId);
  }

  /**
   * 获取用户的所有连接
   */
  getUserConnections(userId: string): WebSocketConnection[] {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) {
      return [];
    }

    return Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is WebSocketConnection => conn !== undefined);
  }

  /**
   * 订阅事件
   */
  async subscribe(
    subscription: Omit<EventSubscription, 'id' | 'createdAt'>
  ): Promise<EventSubscription> {
    const newSubscription: EventSubscription = {
      ...subscription,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    this.subscriptions.set(newSubscription.id, newSubscription);

    // 将订阅添加到用户的连接中
    const userConnections = this.getUserConnections(subscription.userId);
    userConnections.forEach(conn => {
      conn.subscriptions.push(newSubscription);
    });

    this.logger.info('Event subscription created', {
      subscriptionId: newSubscription.id,
      userId: subscription.userId,
      eventTypes: subscription.eventTypes
    });

    return newSubscription;
  }

  /**
   * 取消订阅
   */
  async unsubscribe(subscriptionId: UUID): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    // 从订阅映射中移除
    this.subscriptions.delete(subscriptionId);

    // 从用户连接中移除订阅
    const userConnections = this.getUserConnections(subscription.userId);
    userConnections.forEach(conn => {
      conn.subscriptions = conn.subscriptions.filter(sub => sub.id !== subscriptionId);
    });

    this.logger.info('Event subscription removed', {
      subscriptionId,
      userId: subscription.userId
    });

    return true;
  }

  /**
   * 推送事件
   */
  async pushEvent(event: Omit<PushEvent, 'id' | 'timestamp'>): Promise<PushResult> {
    const pushEvent: PushEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };

    this.events.set(pushEvent.id, pushEvent);

    const result: PushResult = {
      eventId: pushEvent.id,
      totalTargets: 0,
      successCount: 0,
      failureCount: 0,
      failures: [],
      timestamp: pushEvent.timestamp
    };

    // 确定目标连接
    let targetConnections: WebSocketConnection[] = [];

    if (pushEvent.targetUsers) {
      // 推送给指定用户
      for (const userId of pushEvent.targetUsers) {
        targetConnections.push(...this.getUserConnections(userId));
      }
    } else if (pushEvent.targetConnections) {
      // 推送给指定连接
      targetConnections = pushEvent.targetConnections
        .map(id => this.connections.get(id))
        .filter((conn): conn is WebSocketConnection => conn !== undefined);
    } else {
      // 推送给所有相关订阅者
      targetConnections = this.findSubscribedConnections(pushEvent);
    }

    result.totalTargets = targetConnections.length;

    // 执行推送
    for (const connection of targetConnections) {
      try {
        await this.sendEventToConnection(connection, pushEvent);
        result.successCount++;
        
        // 更新连接活动时间
        connection.lastActivity = new Date().toISOString();
      } catch (error) {
        result.failureCount++;
        result.failures.push({
          connectionId: connection.id,
          userId: connection.userId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.logger.info('Event pushed', {
      eventId: pushEvent.id,
      type: pushEvent.type,
      totalTargets: result.totalTargets,
      successCount: result.successCount,
      failureCount: result.failureCount
    });

    return result;
  }

  /**
   * 推送事件给指定用户
   */
  async pushToUser(
    userId: string, 
    event: Omit<PushEvent, 'id' | 'timestamp' | 'targetUsers'>
  ): Promise<PushResult> {
    return this.pushEvent({
      ...event,
      targetUsers: [userId]
    });
  }

  /**
   * 推送事件给指定连接
   */
  async pushToConnection(
    connectionId: UUID, 
    event: Omit<PushEvent, 'id' | 'timestamp' | 'targetConnections'>
  ): Promise<PushResult> {
    return this.pushEvent({
      ...event,
      targetConnections: [connectionId]
    });
  }

  /**
   * 获取连接统计信息
   */
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    userCount: number;
    averageConnectionTime: number;
  } {
    const now = Date.now();
    let totalConnectionTime = 0;
    let activeConnections = 0;

    for (const connection of Array.from(this.connections.values())) {
      if (connection.status === ConnectionStatus.CONNECTED) {
        activeConnections++;
        totalConnectionTime += now - new Date(connection.connectedAt).getTime();
      }
    }

    return {
      totalConnections: this.connections.size,
      activeConnections,
      userCount: this.userConnections.size,
      averageConnectionTime: activeConnections > 0 ? totalConnectionTime / activeConnections : 0
    };
  }

  /**
   * 清理过期连接
   */
  async cleanupExpiredConnections(): Promise<number> {
    const now = Date.now();
    const expiredThreshold = 30 * 60 * 1000; // 30分钟无活动
    let cleanedCount = 0;

    for (const [connectionId, connection] of Array.from(this.connections.entries())) {
      const lastActivity = new Date(connection.lastActivity).getTime();
      if (now - lastActivity > expiredThreshold) {
        await this.removeConnection(connectionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('Cleaned up expired connections', {
        cleanedCount,
        remainingConnections: this.connections.size
      });
    }

    return cleanedCount;
  }

  /**
   * 查找订阅了特定事件的连接
   */
  private findSubscribedConnections(event: PushEvent): WebSocketConnection[] {
    const subscribedConnections: WebSocketConnection[] = [];

    for (const connection of Array.from(this.connections.values())) {
      if (connection.status !== ConnectionStatus.CONNECTED) {
        continue;
      }

      for (const subscription of connection.subscriptions) {
        if (!subscription.isActive) {
          continue;
        }

        // 检查事件类型匹配
        if (!subscription.eventTypes.includes(event.type)) {
          continue;
        }

        // 检查确认ID过滤
        if (subscription.confirmIds && event.data.confirmId) {
          if (!subscription.confirmIds.includes(event.data.confirmId)) {
            continue;
          }
        }

        // 检查上下文ID过滤
        if (subscription.contextIds && event.data.contextId) {
          if (!subscription.contextIds.includes(event.data.contextId)) {
            continue;
          }
        }

        subscribedConnections.push(connection);
        break; // 一个连接只需要添加一次
      }
    }

    return subscribedConnections;
  }

  /**
   * 发送事件到指定连接
   */
  private async sendEventToConnection(connection: WebSocketConnection, event: PushEvent): Promise<void> {
    // TODO: 实现实际的WebSocket发送逻辑
    // 这里需要根据具体的WebSocket库实现
    this.logger.debug('Sending event to connection (placeholder)', {
      connectionId: connection.id,
      userId: connection.userId,
      eventType: event.type,
      eventId: event.id
    });

    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredConnections().catch(error => {
        this.logger.error('Error during connection cleanup', { error });
      });
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 停止清理定时器
   */
  public stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): UUID {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }
}

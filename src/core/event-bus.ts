/**
 * 事件总线
 * @description 提供发布订阅模式的事件系统
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../public/utils/logger';

export interface EventSubscriptionOptions {
  once?: boolean;
  priority?: number;
  timeout?: number;
}

export interface IEventBus {
  subscribe<T = unknown>(eventType: string, handler: (data: T) => void | Promise<void>, options?: EventSubscriptionOptions): string;
  unsubscribe(subscriptionId: string): boolean;
  publish<T = unknown>(eventType: string, data: T): number;
  publishAsync<T = unknown>(eventType: string, data: T): Promise<number>;
  clear(): void;
}

interface Subscription<T = unknown> {
  id: string;
  eventType: string;
  handler: (data: T) => void | Promise<void>;
  options: EventSubscriptionOptions;
}

interface EventHistory {
  eventType: string;
  data: unknown;
  timestamp: string;
  handlerCount: number;
}

/**
 * 事件总线实现
 */
export class EventBus implements IEventBus {
  private subscriptions = new Map<string, Subscription[]>();
  private subscriptionCounter = 0;
  private logger: Logger;
  private errorHandlers: Array<(error: Error, eventType: string, data: any) => void> = [];
  private eventHistory: EventHistory[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.logger = new Logger('EventBus');
  }

  /**
   * 订阅事件
   */
  subscribe<T = any>(
    eventType: string, 
    handler: (data: T) => void | Promise<void>, 
    options: EventSubscriptionOptions = {}
  ): string {
    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    
    const subscription: Subscription = {
      id: subscriptionId,
      eventType,
      handler,
      options: {
        once: false,
        priority: 0,
        timeout: 5000,
        ...options
      }
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const eventSubscriptions = this.subscriptions.get(eventType)!;
    eventSubscriptions.push(subscription);

    // 按优先级排序
    eventSubscriptions.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0));

    this.logger.debug('Event subscription added', { 
      eventType, 
      subscriptionId, 
      options 
    });

    return subscriptionId;
  }

  /**
   * 取消订阅
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of Array.from(this.subscriptions.entries())) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        
        // 如果没有订阅者了，删除事件类型
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }

        this.logger.debug('Event subscription removed', { 
          eventType, 
          subscriptionId 
        });

        return true;
      }
    }

    return false;
  }

  /**
   * 发布事件（同步）
   */
  publish<T = any>(eventType: string, data: T): number {
    const subscriptions = this.subscriptions.get(eventType);

    if (!subscriptions || subscriptions.length === 0) {
      this.logger.debug('No subscribers for event', { eventType });
      this.addToHistory(eventType, data, 0);
      return 0;
    }

    // 保存原始订阅者数量
    const originalSubscriberCount = subscriptions.length;

    this.logger.debug('Publishing event', {
      eventType,
      subscriberCount: originalSubscriberCount
    });

    // 同步执行处理器
    const subscriptionsToRemove: string[] = [];

    for (const subscription of subscriptions) {
      try {
        const result = subscription.handler(data);

        // 如果返回Promise，不等待
        if (result instanceof Promise) {
          result.catch(error => {
            this.logger.error('Async event handler error', {
              subscriptionId: subscription.id,
              eventType: subscription.eventType,
              error
            });
            this.handleError(error, eventType, data);
          });
        }

        // 如果是一次性订阅，标记为删除
        if (subscription.options.once) {
          subscriptionsToRemove.push(subscription.id);
        }
      } catch (error) {
        this.logger.error('Event handler error', {
          subscriptionId: subscription.id,
          eventType: subscription.eventType,
          error
        });
        this.handleError(error as Error, eventType, data);
      }
    }

    // 删除一次性订阅
    for (const subscriptionId of subscriptionsToRemove) {
      this.unsubscribe(subscriptionId);
    }

    this.addToHistory(eventType, data, originalSubscriberCount);
    return originalSubscriberCount;
  }

  /**
   * 执行事件处理器
   */
  private async executeHandler(subscription: Subscription, data: any): Promise<void> {
    const { handler, options } = subscription;
    const timeout = options.timeout || 5000;

    try {
      const handlerPromise = Promise.resolve(handler(data));
      
      if (timeout > 0) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Handler timeout')), timeout);
        });

        await Promise.race([handlerPromise, timeoutPromise]);
      } else {
        await handlerPromise;
      }
    } catch (error) {
      this.logger.error('Event handler error', { 
        subscriptionId: subscription.id,
        eventType: subscription.eventType,
        error 
      });
      throw error;
    }
  }

  /**
   * 清空所有订阅
   */
  clear(): void {
    this.subscriptions.clear();
    this.subscriptionCounter = 0;
    this.logger.debug('Event bus cleared');
  }

  /**
   * 移除所有监听器（兼容标准EventEmitter接口）
   */
  removeAllListeners(): void {
    this.clear();
  }

  /**
   * 获取事件类型列表
   */
  getEventTypes(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * 获取指定事件的订阅者数量
   */
  getSubscriberCount(eventType: string): number {
    const subscriptions = this.subscriptions.get(eventType);
    return subscriptions ? subscriptions.length : 0;
  }

  /**
   * 获取总订阅数
   */
  getTotalSubscriptions(): number {
    let total = 0;
    for (const subscriptions of Array.from(this.subscriptions.values())) {
      total += subscriptions.length;
    }
    return total;
  }

  /**
   * 检查是否有指定事件的订阅者
   */
  hasSubscribers(eventType: string): boolean {
    return this.getSubscriberCount(eventType) > 0;
  }

  /**
   * 添加错误处理器
   */
  addErrorHandler(handler: (error: Error, eventType: string, data: any) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * 移除错误处理器
   */
  removeErrorHandler(handler: (error: Error, eventType: string, data: any) => void): boolean {
    const index = this.errorHandlers.indexOf(handler);
    if (index >= 0) {
      this.errorHandlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 异步发布事件
   */
  async publishAsync<T = any>(eventType: string, data: T): Promise<number> {
    const subscriptions = this.subscriptions.get(eventType);

    if (!subscriptions || subscriptions.length === 0) {
      this.logger.debug('No subscribers for event', { eventType });
      this.addToHistory(eventType, data, 0);
      return 0;
    }

    this.logger.debug('Publishing async event', {
      eventType,
      subscriberCount: subscriptions.length
    });

    const promises: Promise<void>[] = [];

    for (const subscription of subscriptions) {
      const promise = this.executeHandler(subscription, data);
      promises.push(promise);

      // 如果是一次性订阅，标记为删除
      if (subscription.options.once) {
        this.unsubscribe(subscription.id);
      }
    }

    try {
      await Promise.all(promises);
      this.addToHistory(eventType, data, subscriptions.length);
      return subscriptions.length;
    } catch (error) {
      this.logger.error('Error in async event handlers', { eventType, error });
      this.handleError(error as Error, eventType, data);
      this.addToHistory(eventType, data, subscriptions.length);
      throw error;
    }
  }

  /**
   * 获取事件历史
   */
  getEventHistory(): EventHistory[] {
    return [...this.eventHistory];
  }

  /**
   * 清除事件历史
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 添加事件到历史记录
   */
  private addToHistory(eventType: string, data: any, handlerCount: number): void {
    const historyEntry: EventHistory = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      handlerCount
    };

    this.eventHistory.push(historyEntry);

    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: Error, eventType: string, data: any): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error, eventType, data);
      } catch (handlerError) {
        this.logger.error('Error in error handler', { handlerError });
      }
    });
  }
}

// 默认事件总线实例
export const defaultEventBus = new EventBus();

/**
 * MPLP事件总线 - 厂商中立设计
 * 
 * 提供模块间通信的事件发布/订阅机制，支持类型安全的事件处理。
 * 
 * @version v1.1.0
 * @created 2025-07-15T11:30:00+08:00
 * @updated 2025-07-18T10:30:00+08:00
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { EventType, EventData, EventHandler, EventDataMap } from './event-types';

/**
 * 事件订阅选项
 */
export interface EventSubscriptionOptions {
  /**
   * 订阅者名称
   */
  subscriberName?: string;
  
  /**
   * 是否只触发一次
   */
  once?: boolean;
  
  /**
   * 事件过滤器
   */
  filter?: (data: EventData) => boolean;
  
  /**
   * 优先级（数字越小优先级越高）
   */
  priority?: number;
  
  /**
   * 是否异步处理
   */
  async?: boolean;
  
  /**
   * 超时时间（毫秒）
   */
  timeoutMs?: number;
}

/**
 * 事件订阅信息
 */
interface EventSubscription {
  id: string;
  eventType: EventType | string;
  handler: EventHandler;
  subscriberName?: string;
  once: boolean;
  filter?: (data: EventData) => boolean;
  priority: number;
  async: boolean;
  timeoutMs?: number;
}

/**
 * 事件总线接口
 */
export interface IEventBus {
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   * @param options 订阅选项
   * @returns 订阅ID
   */
  subscribe<T extends EventType>(
    eventType: T, 
    handler: EventHandler<EventDataMap[T]>, 
    options?: EventSubscriptionOptions
  ): string;
  
  /**
   * 取消订阅
   * @param subscriptionId 订阅ID
   * @returns 是否成功取消
   */
  unsubscribe(subscriptionId: string): boolean;
  
  /**
   * 发布事件
   * @param eventType 事件类型
   * @param data 事件数据
   * @returns 处理事件的订阅者数量
   */
  publish<T extends EventType>(eventType: T, data: EventDataMap[T]): number;
  
  /**
   * 异步发布事件
   * @param eventType 事件类型
   * @param data 事件数据
   * @returns Promise，解析为处理事件的订阅者数量
   */
  publishAsync<T extends EventType>(eventType: T, data: EventDataMap[T]): Promise<number>;
  
  /**
   * 清空所有订阅
   */
  clear(): void;
  
  /**
   * 获取指定事件类型的订阅者数量
   * @param eventType 事件类型
   * @returns 订阅者数量
   */
  getSubscriberCount(eventType: EventType | string): number;
}

/**
 * 事件总线实现
 */
export class EventBus implements IEventBus {
  private subscriptions: Map<EventType | string, EventSubscription[]> = new Map();
  private subscriptionCounter: number = 0;
  private eventHistory: Array<{eventType: EventType | string, data: EventData, timestamp: string}> = [];
  private maxHistorySize: number = 100;
  private errorHandlers: Array<(error: Error, eventType: EventType | string, data: EventData) => void> = [];
  
  /**
   * 创建事件总线
   * @param options 配置选项
   */
  constructor(options?: {maxHistorySize?: number}) {
    if (options?.maxHistorySize) {
      this.maxHistorySize = options.maxHistorySize;
    }
  }
  
  /**
   * 订阅事件
   */
  public subscribe<T extends EventType>(
    eventType: T, 
    handler: EventHandler<EventDataMap[T]>, 
    options: EventSubscriptionOptions = {}
  ): string {
    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler: handler as EventHandler,
      subscriberName: options.subscriberName,
      once: options.once || false,
      filter: options.filter,
      priority: options.priority !== undefined ? options.priority : 10,
      async: options.async || false,
      timeoutMs: options.timeoutMs
    };
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    
    const eventSubscriptions = this.subscriptions.get(eventType)!;
    
    // 按优先级插入
    const insertIndex = eventSubscriptions.findIndex(sub => sub.priority > subscription.priority);
    if (insertIndex === -1) {
      eventSubscriptions.push(subscription);
    } else {
      eventSubscriptions.splice(insertIndex, 0, subscription);
    }
    
    return subscriptionId;
  }
  
  /**
   * 取消订阅
   */
  public unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        
        // 如果没有订阅者了，删除事件类型
        if (subscriptions.length === 0) {
          this.subscriptions.delete(eventType);
        }
        
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 发布事件
   */
  public publish<T extends EventType>(eventType: T, data: EventDataMap[T]): number {
    // 确保数据包含时间戳
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // 添加到事件历史
    this.addToHistory(eventType, data);
    
    const subscriptions = this.subscriptions.get(eventType) || [];
    let handlerCount = 0;
    
    // 创建要移除的订阅列表（一次性订阅）
    const toRemove: string[] = [];
    
    // 执行事件处理函数
    for (const subscription of subscriptions) {
      // 应用过滤器
      if (subscription.filter && !subscription.filter(data)) {
        continue;
      }
      
      try {
        if (subscription.async) {
          // 异步处理
          this.executeAsyncHandler(subscription, data, eventType);
        } else {
          // 同步处理
          subscription.handler(data);
        }
        
        handlerCount++;
        
        // 如果是一次性订阅，添加到移除列表
        if (subscription.once) {
          toRemove.push(subscription.id);
        }
      } catch (error) {
        this.handleError(error as Error, eventType, data);
      }
    }
    
    // 移除一次性订阅
    for (const id of toRemove) {
      this.unsubscribe(id);
    }
    
    return handlerCount;
  }
  
  /**
   * 异步发布事件
   */
  public async publishAsync<T extends EventType>(eventType: T, data: EventDataMap[T]): Promise<number> {
    // 确保数据包含时间戳
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // 添加到事件历史
    this.addToHistory(eventType, data);
    
    const subscriptions = this.subscriptions.get(eventType) || [];
    const promises: Promise<void>[] = [];
    let handlerCount = 0;
    
    // 创建要移除的订阅列表（一次性订阅）
    const toRemove: string[] = [];
    
    // 执行事件处理函数
    for (const subscription of subscriptions) {
      // 应用过滤器
      if (subscription.filter && !subscription.filter(data)) {
        continue;
      }
      
      const promise = (async () => {
        try {
          // 创建处理函数的Promise
          const handlerPromise = Promise.resolve().then(() => subscription.handler(data));
          
          // 如果设置了超时，添加超时处理
          if (subscription.timeoutMs) {
            await Promise.race([
              handlerPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Event handler timeout (${subscription.timeoutMs}ms)`)), 
                subscription.timeoutMs)
              )
            ]);
          } else {
            await handlerPromise;
          }
          
          handlerCount++;
          
          // 如果是一次性订阅，添加到移除列表
          if (subscription.once) {
            toRemove.push(subscription.id);
          }
        } catch (error) {
          this.handleError(error as Error, eventType, data);
        }
      })();
      
      promises.push(promise);
    }
    
    // 等待所有处理函数完成
    await Promise.all(promises);
    
    // 移除一次性订阅
    for (const id of toRemove) {
      this.unsubscribe(id);
    }
    
    return handlerCount;
  }
  
  /**
   * 清空所有订阅
   */
  public clear(): void {
    this.subscriptions.clear();
  }
  
  /**
   * 获取指定事件类型的订阅者数量
   */
  public getSubscriberCount(eventType: EventType | string): number {
    return this.subscriptions.get(eventType)?.length || 0;
  }
  
  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  public getAllEventTypes(): Array<EventType | string> {
    return Array.from(this.subscriptions.keys());
  }
  
  /**
   * 获取事件历史
   * @returns 事件历史数组
   */
  public getEventHistory(): Array<{eventType: EventType | string, data: EventData, timestamp: string}> {
    return [...this.eventHistory];
  }
  
  /**
   * 添加错误处理函数
   * @param handler 错误处理函数
   */
  public addErrorHandler(handler: (error: Error, eventType: EventType | string, data: EventData) => void): void {
    this.errorHandlers.push(handler);
  }
  
  /**
   * 移除错误处理函数
   * @param handler 错误处理函数
   * @returns 是否成功移除
   */
  public removeErrorHandler(handler: (error: Error, eventType: EventType | string, data: EventData) => void): boolean {
    const index = this.errorHandlers.indexOf(handler);
    if (index !== -1) {
      this.errorHandlers.splice(index, 1);
      return true;
    }
    return false;
  }
  
  /**
   * 添加到事件历史
   * @private
   */
  private addToHistory(eventType: EventType | string, data: EventData): void {
    this.eventHistory.push({
      eventType,
      data: { ...data },
      timestamp: data.timestamp
    });
    
    // 限制历史大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  /**
   * 执行异步处理函数
   * @private
   */
  private executeAsyncHandler(
    subscription: EventSubscription, 
    data: EventData, 
    eventType: EventType | string
  ): void {
    Promise.resolve().then(() => {
      const handlerPromise = Promise.resolve().then(() => subscription.handler(data));
      
      // 如果设置了超时，添加超时处理
      if (subscription.timeoutMs) {
        return Promise.race([
          handlerPromise,
          new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error(`Event handler timeout (${subscription.timeoutMs}ms)`)), 
            subscription.timeoutMs)
          )
        ]);
      }
      
      return handlerPromise;
    }).catch(error => {
      this.handleError(error, eventType, data);
    });
  }
  
  /**
   * 处理错误
   * @private
   */
  private handleError(error: Error, eventType: EventType | string, data: EventData): void {
    // 如果没有错误处理函数，输出到控制台
    if (this.errorHandlers.length === 0) {
      console.error(`Error in event handler for ${eventType}:`, error);
      return;
    }
    
    // 调用所有错误处理函数
    for (const handler of this.errorHandlers) {
      try {
        handler(error, eventType, data);
      } catch (handlerError) {
        console.error('Error in event error handler:', handlerError);
      }
    }
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus(); 
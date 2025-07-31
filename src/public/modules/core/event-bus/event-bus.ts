/**
 * 事件总线
 * 
 * 提供发布-订阅模式的事件通信机制
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { EventEmitter } from 'events';
import { Logger } from '../../../utils/logger';

export interface EventData {
  eventType: string;
  timestamp: string;
  data: any;
  source?: string;
}

export interface EventSubscriber {
  (data: EventData): void | Promise<void>;
}

/**
 * 事件总线类
 */
export class EventBus {
  private emitter: EventEmitter;
  private logger: Logger;
  private subscribers: Map<string, Set<EventSubscriber>>;

  constructor() {
    this.emitter = new EventEmitter();
    this.logger = new Logger('EventBus');
    this.subscribers = new Map();
    
    // 设置最大监听器数量
    this.emitter.setMaxListeners(100);
  }

  /**
   * 订阅事件
   */
  subscribe(eventType: string, subscriber: EventSubscriber): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(subscriber);
    
    this.emitter.on(eventType, subscriber);
    
    this.logger.debug('事件订阅成功', {
      eventType,
      subscriberCount: this.subscribers.get(eventType)!.size
    });
  }

  /**
   * 取消订阅事件
   */
  unsubscribe(eventType: string, subscriber: EventSubscriber): void {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
      }
    }
    
    this.emitter.off(eventType, subscriber);
    
    this.logger.debug('取消事件订阅', {
      eventType,
      remainingSubscribers: subscribers?.size || 0
    });
  }

  /**
   * 发布事件
   */
  async publish(eventType: string, data: any, source?: string): Promise<void> {
    const eventData: EventData = {
      eventType,
      timestamp: new Date().toISOString(),
      data,
      source
    };

    try {
      this.emitter.emit(eventType, eventData);
      
      this.logger.debug('事件发布成功', {
        eventType,
        source,
        subscriberCount: this.subscribers.get(eventType)?.size || 0
      });
    } catch (error) {
      this.logger.error('事件发布失败', {
        eventType,
        source,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * 获取事件订阅者数量
   */
  getSubscriberCount(eventType: string): number {
    return this.subscribers.get(eventType)?.size || 0;
  }

  /**
   * 获取所有事件类型
   */
  getEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * 清理所有订阅
   */
  clear(): void {
    this.emitter.removeAllListeners();
    this.subscribers.clear();
    
    this.logger.info('事件总线已清理');
  }
}

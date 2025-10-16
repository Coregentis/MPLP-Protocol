/**
 * MPLP事件管理器 - 基于V1.0 Alpha架构
 * 
 * @description 继承MPLP V1.0 Alpha的成功事件架构，提供EventEmitter兼容的API
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha MLPPEventBusManager
 */

/**
 * MPLP事件接口 - 继承V1.0 Alpha标准
 */
export interface MPLPEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  payload: Record<string, unknown>;
}

/**
 * 事件处理器类型
 */
export type MPLPEventHandler = (event: MPLPEvent) => Promise<void> | void;

/**
 * EventEmitter兼容的事件处理器
 */
export type EventEmitterHandler = (...args: any[]) => void;

/**
 * MPLP事件管理器 - EventEmitter兼容版本
 * 
 * @description 基于MPLP V1.0 Alpha的MLPPEventBusManager，提供EventEmitter兼容的API
 */
export class MPLPEventManager {
  private handlers = new Map<string, EventEmitterHandler[]>();
  private mplpHandlers = new Map<string, MPLPEventHandler[]>();
  private eventIdCounter = 0;

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: EventEmitterHandler): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    const handlers = this.handlers.get(event);
    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
      return true;
    }
    return false;
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: EventEmitterHandler): this {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(listener);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    if (event) {
      this.handlers.delete(event);
      this.mplpHandlers.delete(event);
    } else {
      this.handlers.clear();
      this.mplpHandlers.clear();
    }
    return this;
  }

  /**
   * MPLP V1.0 Alpha兼容的subscribe方法
   */
  public subscribe(eventType: string, handler: MPLPEventHandler): void {
    if (!this.mplpHandlers.has(eventType)) {
      this.mplpHandlers.set(eventType, []);
    }
    this.mplpHandlers.get(eventType)!.push(handler);
  }

  /**
   * MPLP V1.0 Alpha兼容的publish方法
   */
  public async publish(event: MPLPEvent): Promise<void> {
    const handlers = this.mplpHandlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  /**
   * MPLP V1.0 Alpha兼容的unsubscribe方法
   */
  public unsubscribe(eventType: string, handler: MPLPEventHandler): void {
    const handlers = this.mplpHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 创建MPLP事件
   */
  public createMPLPEvent(type: string, source: string, payload: Record<string, unknown>): MPLPEvent {
    return {
      id: `event_${++this.eventIdCounter}_${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      source,
      payload
    };
  }

  /**
   * 混合发布 - 同时支持EventEmitter和MPLP事件
   */
  public emitMPLP(type: string, source: string, payload: Record<string, unknown>): void {
    // EventEmitter风格
    this.emit(type, payload);
    
    // MPLP风格
    const mplpEvent = this.createMPLPEvent(type, source, payload);
    this.publish(mplpEvent).catch(error => {
      console.error(`Error publishing MPLP event '${type}':`, error);
    });
  }

  /**
   * 健康检查 - 继承V1.0 Alpha标准
   */
  public async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * 获取事件统计
   */
  public getEventStats(): { eventEmitterEvents: number; mplpEvents: number } {
    return {
      eventEmitterEvents: this.handlers.size,
      mplpEvents: this.mplpHandlers.size
    };
  }
}

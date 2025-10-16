/**
 * MPLP事件管理器 - Dev Tools包版本
 * 
 * @description 继承MPLP V1.0 Alpha的成功事件架构，提供EventEmitter兼容的API
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha MLPPEventBusManager
 */

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
    const listeners = this.handlers.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
    
    return true;
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: EventEmitterHandler): this {
    const listeners = this.handlers.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
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
    } else {
      this.handlers.clear();
    }
    return this;
  }

  /**
   * 获取事件监听器数量
   */
  public listenerCount(event: string): number {
    const listeners = this.handlers.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * 获取所有事件名称
   */
  public eventNames(): string[] {
    return Array.from(this.handlers.keys());
  }
}

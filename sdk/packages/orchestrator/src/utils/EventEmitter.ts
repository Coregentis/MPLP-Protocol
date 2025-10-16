/**
 * @fileoverview MPLP Event Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

/**
 * EventEmitter兼容接口 - 基于MPLP V1.0 Alpha架构
 */
export interface MPLPEventEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  off(event: string, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: string): this;
}

/**
 * MPLP Event Manager - 统一事件管理系统
 * 基于MPLP V1.0 Alpha的MLPPEventBusManager架构设计
 */
export class MPLPEventManager implements MPLPEventEmitter {
  private handlers = new Map<string, Array<(...args: any[]) => void>>();

  public on(event: string, listener: (...args: any[]) => void): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(listener);
    return this;
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.handlers.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    const listeners = this.handlers.get(event);
    if (listeners && listeners.length > 0) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
      return true;
    }
    return false;
  }

  public removeAllListeners(event?: string): this {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
    return this;
  }

  public listenerCount(event: string): number {
    const listeners = this.handlers.get(event);
    return listeners ? listeners.length : 0;
  }

  public eventNames(): string[] {
    return Array.from(this.handlers.keys());
  }
}

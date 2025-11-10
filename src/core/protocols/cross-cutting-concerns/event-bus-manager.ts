/**
 * MPLP事件总线管理器
 * 
 * @description L3层统一事件管理，提供发布订阅和事件路由功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */

/**
 * 事件接口
 */
export interface MLPPEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  payload: Record<string, unknown>;
}

/**
 * 事件处理器类型
 */
export type EventHandler = (event: MLPPEvent) => Promise<void> | void;

/**
 * MPLP事件总线管理器
 * 
 * @description 统一的事件管理实现，所有模块使用相同的事件机制
 */
export class MLPPEventBusManager {
  private handlers = new Map<string, EventHandler[]>();

  /**
   * 订阅事件
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * 发布事件
   */
  async publish(event: MLPPEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(handler => handler(event)));
  }

  /**
   * 取消订阅
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    return true;
  }
}

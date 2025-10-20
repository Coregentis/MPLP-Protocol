"use strict";
/**
 * MPLP事件总线管理器
 *
 * @description L3层统一事件管理，提供发布订阅和事件路由功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPEventBusManager = void 0;
/**
 * MPLP事件总线管理器
 *
 * @description 统一的事件管理实现，所有模块使用相同的事件机制
 */
class MLPPEventBusManager {
    constructor() {
        this.handlers = new Map();
    }
    /**
     * 订阅事件
     */
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
    }
    /**
     * 发布事件
     */
    async publish(event) {
        const handlers = this.handlers.get(event.type) || [];
        await Promise.all(handlers.map(handler => handler(event)));
    }
    /**
     * 取消订阅
     */
    unsubscribe(eventType, handler) {
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
    async healthCheck() {
        return true;
    }
}
exports.MLPPEventBusManager = MLPPEventBusManager;
//# sourceMappingURL=event-bus-manager.js.map
"use strict";
/**
 * MPLP事件管理器 - 基于V1.0 Alpha架构
 *
 * @description 继承MPLP V1.0 Alpha的成功事件架构，提供EventEmitter兼容的API
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha MLPPEventBusManager
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPLPEventManager = void 0;
/**
 * MPLP事件管理器 - EventEmitter兼容版本
 *
 * @description 基于MPLP V1.0 Alpha的MLPPEventBusManager，提供EventEmitter兼容的API
 */
class MPLPEventManager {
    constructor() {
        this.handlers = new Map();
        this.mplpHandlers = new Map();
        this.eventIdCounter = 0;
    }
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        const handlers = this.handlers.get(event);
        if (handlers && handlers.length > 0) {
            handlers.forEach(handler => {
                try {
                    handler(...args);
                }
                catch (error) {
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
    off(event, listener) {
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
    removeAllListeners(event) {
        if (event) {
            this.handlers.delete(event);
            this.mplpHandlers.delete(event);
        }
        else {
            this.handlers.clear();
            this.mplpHandlers.clear();
        }
        return this;
    }
    /**
     * MPLP V1.0 Alpha兼容的subscribe方法
     */
    subscribe(eventType, handler) {
        if (!this.mplpHandlers.has(eventType)) {
            this.mplpHandlers.set(eventType, []);
        }
        this.mplpHandlers.get(eventType).push(handler);
    }
    /**
     * MPLP V1.0 Alpha兼容的publish方法
     */
    async publish(event) {
        const handlers = this.mplpHandlers.get(event.type) || [];
        await Promise.all(handlers.map(handler => handler(event)));
    }
    /**
     * MPLP V1.0 Alpha兼容的unsubscribe方法
     */
    unsubscribe(eventType, handler) {
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
    createMPLPEvent(type, source, payload) {
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
    emitMPLP(type, source, payload) {
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
    async healthCheck() {
        return true;
    }
    /**
     * 获取事件统计
     */
    getEventStats() {
        return {
            eventEmitterEvents: this.handlers.size,
            mplpEvents: this.mplpHandlers.size
        };
    }
}
exports.MPLPEventManager = MPLPEventManager;
//# sourceMappingURL=MPLPEventManager.js.map
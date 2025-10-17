"use strict";
/**
 * @fileoverview MPLP Event Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPLPEventManager = void 0;
/**
 * MPLP Event Manager - 统一事件管理系统
 * 基于MPLP V1.0 Alpha的MLPPEventBusManager架构设计
 */
class MPLPEventManager {
    constructor() {
        this.handlers = new Map();
    }
    on(event, listener) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(listener);
        return this;
    }
    off(event, listener) {
        const listeners = this.handlers.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }
    emit(event, ...args) {
        const listeners = this.handlers.get(event);
        if (listeners && listeners.length > 0) {
            listeners.forEach(listener => {
                try {
                    listener(...args);
                }
                catch (error) {
                    console.error(`Error in event listener for '${event}':`, error);
                }
            });
            return true;
        }
        return false;
    }
    removeAllListeners(event) {
        if (event) {
            this.handlers.delete(event);
        }
        else {
            this.handlers.clear();
        }
        return this;
    }
    listenerCount(event) {
        const listeners = this.handlers.get(event);
        return listeners ? listeners.length : 0;
    }
    eventNames() {
        return Array.from(this.handlers.keys());
    }
}
exports.MPLPEventManager = MPLPEventManager;
//# sourceMappingURL=EventEmitter.js.map
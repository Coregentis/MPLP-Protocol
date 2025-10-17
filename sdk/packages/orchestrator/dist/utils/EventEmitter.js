"use strict";
/**
 * @fileoverview Simple EventEmitter implementation
 * Temporary implementation until eventemitter3 dependency is resolved
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleEventEmitter = void 0;
class SimpleEventEmitter {
    constructor() {
        this.events = new Map();
    }
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return this;
    }
    off(event, listener) {
        const listeners = this.events.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
        return this;
    }
    emit(event, ...args) {
        const listeners = this.events.get(event);
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
            this.events.delete(event);
        }
        else {
            this.events.clear();
        }
        return this;
    }
    listenerCount(event) {
        const listeners = this.events.get(event);
        return listeners ? listeners.length : 0;
    }
    eventNames() {
        return Array.from(this.events.keys());
    }
}
exports.SimpleEventEmitter = SimpleEventEmitter;
//# sourceMappingURL=EventEmitter.js.map
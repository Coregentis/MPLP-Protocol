"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPEventBusManager = void 0;
class MLPPEventBusManager {
    handlers = new Map();
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
    }
    async publish(event) {
        const handlers = this.handlers.get(event.type) || [];
        await Promise.all(handlers.map(handler => handler(event)));
    }
    unsubscribe(eventType, handler) {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    async healthCheck() {
        return true;
    }
}
exports.MLPPEventBusManager = MLPPEventBusManager;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPStateSyncManager = void 0;
class MLPPStateSyncManager {
    state = new Map();
    subscribers = new Map();
    syncEvents = [];
    async setState(_module, _stateKey, _value) {
        const fullKey = `${_module}.${_stateKey}`;
        const currentState = this.state.get(fullKey);
        const oldValue = currentState?.value;
        const newVersion = (currentState?.version || 0) + 1;
        this.state.set(fullKey, { value: _value, version: newVersion });
        const syncEvent = {
            id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sourceModule: _module,
            stateKey: _stateKey,
            oldValue,
            newValue: _value,
            timestamp: new Date().toISOString(),
            version: newVersion
        };
        this.syncEvents.push(syncEvent);
        await this.notifySubscribers(fullKey, syncEvent);
    }
    getState(_module, _stateKey) {
        const fullKey = `${_module}.${_stateKey}`;
        return this.state.get(fullKey)?.value;
    }
    subscribeToState(_module, _stateKey, _callback) {
        const fullKey = `${_module}.${_stateKey}`;
        if (!this.subscribers.has(fullKey)) {
            this.subscribers.set(fullKey, []);
        }
        this.subscribers.get(fullKey).push({
            module: _module,
            stateKey: _stateKey,
            callback: _callback
        });
    }
    getSyncEvents(_filter) {
        if (!_filter)
            return this.syncEvents;
        return this.syncEvents.filter(event => {
            if (_filter.module && event.sourceModule !== _filter.module)
                return false;
            if (_filter.stateKey && event.stateKey !== _filter.stateKey)
                return false;
            return true;
        });
    }
    async notifySubscribers(fullKey, event) {
        const subscribers = this.subscribers.get(fullKey) || [];
        await Promise.all(subscribers.map(subscriber => subscriber.callback(event)));
    }
    async validateStateConsistency() {
        return true;
    }
    async healthCheck() {
        return true;
    }
}
exports.MLPPStateSyncManager = MLPPStateSyncManager;

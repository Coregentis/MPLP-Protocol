"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryKeyValueStore = void 0;
class InMemoryKeyValueStore {
    constructor() {
        this.store = new Map();
    }
    async set(key, value) {
        this.store.set(key, value);
    }
    async get(key) {
        return this.store.get(key) ?? null;
    }
    async delete(key) {
        this.store.delete(key);
    }
}
exports.InMemoryKeyValueStore = InMemoryKeyValueStore;

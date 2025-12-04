/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
export interface KeyValueStore {
    set<T>(key: string, value: T): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
}

export class InMemoryKeyValueStore implements KeyValueStore {
    private store = new Map<string, unknown>();

    async set<T>(key: string, value: T): Promise<void> {
        this.store.set(key, value);
    }

    async get<T>(key: string): Promise<T | null> {
        return (this.store.get(key) as T) ?? null;
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }
}

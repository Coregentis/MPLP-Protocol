/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
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

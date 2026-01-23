/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2026 Bangshi Beijing Network Technology Limited Company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { describe, it, expect } from "vitest";
import { InMemoryKeyValueStore } from "../src/kv-storage";

describe("InMemoryKeyValueStore", () => {
    it("should set, get and delete values", async () => {
        const store = new InMemoryKeyValueStore();
        const key = "test-key";
        const value = { a: 1 };

        await store.set(key, value);
        const read1 = await store.get(key);
        expect(read1).toEqual(value);

        await store.delete(key);
        const read2 = await store.get(key);
        expect(read2).toBeNull();
    });
});

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

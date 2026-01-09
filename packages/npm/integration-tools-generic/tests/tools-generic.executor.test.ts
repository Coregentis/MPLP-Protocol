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
import { InMemoryToolExecutor } from "../src/executor";

describe("InMemoryToolExecutor", () => {
    it("should execute registered tool", async () => {
        const executor = new InMemoryToolExecutor({
            echo: async (payload: any) => payload
        });

        const result = await executor.invoke({
            toolName: "echo",
            payload: "hello"
        });

        expect(result.success).toBe(true);
        expect(result.output).toBe("hello");
    });

    it("should fail for unregistered tool", async () => {
        const executor = new InMemoryToolExecutor({});
        const result = await executor.invoke({
            toolName: "unknown",
            payload: {}
        });

        expect(result.success).toBe(false);
        expect(result.errorMessage).toContain("not registered");
    });
});

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

import { describe, it, expect, vi } from "vitest";
import { HttpLlmClient, type FetchLike } from "../src/client";

describe("HttpLlmClient", () => {
    it("should send request to baseUrl with correct body", async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ output: "Hello World" })
        });

        const client = new HttpLlmClient(
            { baseUrl: "https://api.example.com/v1/generate" },
            mockFetch as unknown as FetchLike
        );

        const result = await client.generate({ input: "Hi" });

        expect(mockFetch).toHaveBeenCalledWith(
            "https://api.example.com/v1/generate",
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ input: "Hi" })
            })
        );
        expect(result.output).toBe("Hello World");
    });
});

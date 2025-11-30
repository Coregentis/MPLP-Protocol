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

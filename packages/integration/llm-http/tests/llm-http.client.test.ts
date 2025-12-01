/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

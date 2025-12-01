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

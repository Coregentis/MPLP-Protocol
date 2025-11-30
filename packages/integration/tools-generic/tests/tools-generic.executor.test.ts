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

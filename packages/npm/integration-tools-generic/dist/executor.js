"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryToolExecutor = void 0;
class InMemoryToolExecutor {
    constructor(registry = {}) {
        this.registry = registry;
    }
    async invoke(invocation) {
        const handler = this.registry[invocation.toolName];
        if (!handler) {
            return {
                toolName: invocation.toolName,
                success: false,
                errorMessage: "Tool not registered"
            };
        }
        try {
            const output = await handler(invocation.payload);
            return {
                toolName: invocation.toolName,
                success: true,
                output
            };
        }
        catch (err) {
            return {
                toolName: invocation.toolName,
                success: false,
                errorMessage: String(err?.message ?? err)
            };
        }
    }
}
exports.InMemoryToolExecutor = InMemoryToolExecutor;

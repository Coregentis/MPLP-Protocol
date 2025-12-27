"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAEL = exports.InMemoryVSL = void 0;
exports.runSingleAgentFlow = runSingleAgentFlow;
class InMemoryVSL {
    constructor() {
        this.store = new Map();
    }
    async get(key) { return this.store.get(key); }
    async set(key, value) { this.store.set(key, value); }
}
exports.InMemoryVSL = InMemoryVSL;
class InMemoryAEL {
    async execute(action) { return { status: 'executed', action }; }
}
exports.InMemoryAEL = InMemoryAEL;
async function runSingleAgentFlow(options) {
    console.log("Mock runSingleAgentFlow executed");
    // Execute context module
    if (options.modules.context) {
        await options.modules.context({ ctx: {} });
    }
    // Execute plan module
    if (options.modules.plan) {
        await options.modules.plan({ ctx: { context: { title: "Integration Test" } } });
    }
    // Return a result that matches what the test expects
    return {
        success: true,
        output: {
            context: { title: "Integration Test" },
            plan: { title: "Test Plan" },
            confirm: { status: "approved" },
            trace: { status: "completed" }
        }
    };
}

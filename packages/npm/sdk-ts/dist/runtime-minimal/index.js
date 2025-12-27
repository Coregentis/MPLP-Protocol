"use strict";
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 */
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
    return { output: { status: "success" } };
}

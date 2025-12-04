/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAEL = void 0;
/**
 * InMemoryAEL
 *
 * Reference implementation used for tests and examples.
 * It does NOT call any real external systems.
 */
class InMemoryAEL {
    async executeAction(params) {
        // For now, simply echo the input as output.
        return {
            output: params.input,
            events: []
        };
    }
}
exports.InMemoryAEL = InMemoryAEL;

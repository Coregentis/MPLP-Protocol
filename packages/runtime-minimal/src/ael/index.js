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

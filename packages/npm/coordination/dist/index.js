"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleAgentFlowContract = void 0;
exports.createMplpEvent = createMplpEvent;
/**
 * The canonical Single Agent Flow Contract.
 */
exports.SingleAgentFlowContract = {
    id: 'single-agent-flow',
    name: 'SingleAgentFlow',
    description: 'Standard 4-module single agent flow: Context → Plan → Confirm → Trace',
    version: '1.0.0',
    modules: ['context', 'plan', 'confirm', 'trace']
};
/** Create an MPLP event with current timestamp. */
function createMplpEvent(type, runId, payload, module) {
    return {
        type,
        timestamp: new Date().toISOString(),
        runId,
        module,
        payload
    };
}

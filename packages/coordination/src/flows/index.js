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
exports.ErrorRecoveryFlowContract = exports.RiskConfirmationFlowContract = exports.MultiAgentCollabFlowContract = exports.SingleAgentFlowContract = void 0;
/**
 * SingleAgentFlowContract
 * Defines the standard four-module workflow for a single agent
 */
exports.SingleAgentFlowContract = {
    flowId: "single-agent-v1",
    description: "Standard single-agent workflow: Context �?Plan �?Confirm �?Trace",
    steps: [
        { module: "context", input: {} },
        { module: "plan", input: {} },
        { module: "confirm", input: {} },
        { module: "trace", input: {} }
    ]
};
/**
 * Placeholder for MultiAgentCollabFlowContract
 */
exports.MultiAgentCollabFlowContract = {
    flowId: "multi-agent-collab-v1",
    description: "Multi-agent collaboration flow (placeholder)",
    steps: []
};
/**
 * Placeholder for RiskConfirmationFlowContract
 */
exports.RiskConfirmationFlowContract = {
    flowId: "risk-confirmation-v1",
    description: "Risk confirmation flow (placeholder)",
    steps: []
};
/**
 * Placeholder for ErrorRecoveryFlowContract
 */
exports.ErrorRecoveryFlowContract = {
    flowId: "error-recovery-v1",
    description: "Error recovery flow (placeholder)",
    steps: []
};

"use strict";
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

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

import type { MplpEvent } from "../events/events";

/**
 * Descriptor for a single step in a flow
 */
export interface FlowStepDescriptor {
    module: string;
    input?: any;
}

/**
 * Generic flow contract interface
 */
export interface FlowContract<TOutput = unknown> {
    flowId: string;
    description: string;
    steps: FlowStepDescriptor[];
}

/**
 * Output type for SingleAgentFlowContract
 */
export interface SingleAgentFlowOutput {
    context: any;
    plan: any;
    confirm: any;
    trace: any;
}

/**
 * SingleAgentFlowContract
 * Defines the standard four-module workflow for a single agent
 */
export const SingleAgentFlowContract: FlowContract<SingleAgentFlowOutput> = {
    flowId: "single-agent-v1",
    description: "Standard single-agent workflow: Context → Plan → Confirm → Trace",
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
export const MultiAgentCollabFlowContract: FlowContract = {
    flowId: "multi-agent-collab-v1",
    description: "Multi-agent collaboration flow (placeholder)",
    steps: []
};

/**
 * Placeholder for RiskConfirmationFlowContract
 */
export const RiskConfirmationFlowContract: FlowContract = {
    flowId: "risk-confirmation-v1",
    description: "Risk confirmation flow (placeholder)",
    steps: []
};

/**
 * Placeholder for ErrorRecoveryFlowContract
 */
export const ErrorRecoveryFlowContract: FlowContract = {
    flowId: "error-recovery-v1",
    description: "Error recovery flow (placeholder)",
    steps: []
};

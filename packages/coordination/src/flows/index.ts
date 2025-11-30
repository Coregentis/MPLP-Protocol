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

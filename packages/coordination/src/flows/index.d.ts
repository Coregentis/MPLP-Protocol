/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
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
export declare const SingleAgentFlowContract: FlowContract<SingleAgentFlowOutput>;
/**
 * Placeholder for MultiAgentCollabFlowContract
 */
export declare const MultiAgentCollabFlowContract: FlowContract;
/**
 * Placeholder for RiskConfirmationFlowContract
 */
export declare const RiskConfirmationFlowContract: FlowContract;
/**
 * Placeholder for ErrorRecoveryFlowContract
 */
export declare const ErrorRecoveryFlowContract: FlowContract;

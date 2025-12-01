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

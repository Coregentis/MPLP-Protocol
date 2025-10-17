/**
 * @fileoverview Workflow Execution Engine
 * Handles the execution of workflow steps with parallel processing and error handling
 */
import { SimpleEventEmitter } from '../utils/EventEmitter';
import { WorkflowDefinition, WorkflowResult, ExecutionOptions } from '../types';
import { IAgent } from '../types';
/**
 * Workflow execution engine
 */
export declare class ExecutionEngine extends SimpleEventEmitter {
    private readonly agents;
    private readonly executions;
    private readonly contexts;
    /**
     * Register an agent for workflow execution
     */
    registerAgent(agent: IAgent): void;
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId: string): void;
    /**
     * Get registered agent
     */
    getAgent(agentId: string): IAgent | undefined;
    /**
     * Execute a workflow
     */
    executeWorkflow(workflow: WorkflowDefinition, parameters?: Record<string, unknown>, options?: ExecutionOptions): Promise<WorkflowResult>;
    /**
     * Get execution result
     */
    getExecution(executionId: string): WorkflowResult | undefined;
    /**
     * List all executions
     */
    listExecutions(): WorkflowResult[];
    private executeSteps;
    private executeSingleStep;
    private executeAgentStep;
    private executeParallelStep;
    private executeSequentialStep;
    private executeConditionalStep;
    private executeLoopStep;
    private buildDependencyGraph;
    private emitProgress;
}
//# sourceMappingURL=ExecutionEngine.d.ts.map
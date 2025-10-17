/**
 * @fileoverview Workflow Builder implementation
 * Provides fluent API for building complex multi-agent workflows
 */
import { IWorkflowBuilder, WorkflowDefinition, AgentStepConfig, ParallelStepConfig, SequentialStepConfig, ConditionalStepConfig, LoopStepConfig } from '../types';
/**
 * Fluent workflow builder implementation
 */
export declare class WorkflowBuilder implements IWorkflowBuilder {
    private readonly _id;
    private _name;
    private _description?;
    private _version?;
    private _steps;
    private _timeout?;
    private _retries?;
    private _metadata?;
    constructor(name: string, id?: string);
    /**
     * Create a new workflow builder
     */
    static create(name: string, id?: string): WorkflowBuilder;
    /**
     * Set workflow description
     */
    description(description: string): WorkflowBuilder;
    /**
     * Set workflow version
     */
    version(version: string): WorkflowBuilder;
    /**
     * Add an agent step
     */
    step(id: string, config: Omit<AgentStepConfig, 'id' | 'type'>): WorkflowBuilder;
    /**
     * Add a parallel execution step
     */
    parallel(id: string, config: Omit<ParallelStepConfig, 'id' | 'type'>): WorkflowBuilder;
    /**
     * Add a sequential execution step
     */
    sequential(id: string, config: Omit<SequentialStepConfig, 'id' | 'type'>): WorkflowBuilder;
    /**
     * Add a conditional step
     */
    condition(id: string, config: Omit<ConditionalStepConfig, 'id' | 'type'>): WorkflowBuilder;
    /**
     * Add a loop step
     */
    loop(id: string, config: Omit<LoopStepConfig, 'id' | 'type'>): WorkflowBuilder;
    /**
     * Set workflow timeout
     */
    timeout(timeout: number): WorkflowBuilder;
    /**
     * Set workflow retries
     */
    retries(retries: number): WorkflowBuilder;
    /**
     * Set workflow metadata
     */
    metadata(metadata: Record<string, unknown>): WorkflowBuilder;
    /**
     * Build the workflow definition
     */
    build(): WorkflowDefinition;
    private validateStepId;
    private validateAgentStepConfig;
    private validateParallelStepConfig;
    private validateSequentialStepConfig;
    private validateConditionalStepConfig;
    private validateLoopStepConfig;
    private validateCommonStepConfig;
    private validateWorkflow;
    private validateStepDependencies;
    private validateNoCycles;
}
//# sourceMappingURL=WorkflowBuilder.d.ts.map
"use strict";
/**
 * @fileoverview Workflow Execution Engine
 * Handles the execution of workflow steps with parallel processing and error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngine = void 0;
const EventEmitter_1 = require("../utils/EventEmitter");
const uuid_1 = require("uuid");
const types_1 = require("../types");
/**
 * Workflow execution engine
 */
class ExecutionEngine extends EventEmitter_1.SimpleEventEmitter {
    constructor() {
        super(...arguments);
        this.agents = new Map();
        this.executions = new Map();
        this.contexts = new Map();
    }
    /**
     * Register an agent for workflow execution
     */
    registerAgent(agent) {
        this.agents.set(agent.id, agent);
    }
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId) {
        this.agents.delete(agentId);
    }
    /**
     * Get registered agent
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * Execute a workflow
     */
    async executeWorkflow(workflow, parameters = {}, options = {}) {
        const executionId = (0, uuid_1.v4)();
        const startTime = new Date();
        // Create execution context
        const context = {
            workflowId: workflow.id,
            executionId,
            startTime,
            variables: new Map(Object.entries(parameters)),
            results: new Map(),
            metadata: { ...workflow.metadata, ...options.metadata }
        };
        // Initialize workflow result
        const result = {
            workflowId: workflow.id,
            executionId,
            status: types_1.WorkflowStatus.RUNNING,
            startTime,
            steps: [],
            metadata: context.metadata
        };
        this.contexts.set(executionId, context);
        this.executions.set(executionId, result);
        try {
            // Execute workflow steps
            await this.executeSteps(workflow.steps, context, options);
            // Update final result
            result.status = types_1.WorkflowStatus.COMPLETED;
            result.endTime = new Date();
            result.duration = result.endTime.getTime() - result.startTime.getTime();
            result.steps = Array.from(context.results.values());
            this.emit('workflowCompleted', result);
            return result;
        }
        catch (error) {
            // Handle execution error
            result.status = types_1.WorkflowStatus.FAILED;
            result.endTime = new Date();
            result.duration = result.endTime.getTime() - result.startTime.getTime();
            result.error = error;
            result.steps = Array.from(context.results.values());
            this.emit('workflowFailed', result, error);
            throw error;
        }
        finally {
            this.contexts.delete(executionId);
        }
    }
    /**
     * Get execution result
     */
    getExecution(executionId) {
        return this.executions.get(executionId);
    }
    /**
     * List all executions
     */
    listExecutions() {
        return Array.from(this.executions.values());
    }
    // ============================================================================
    // Step Execution Methods
    // ============================================================================
    async executeSteps(steps, context, options) {
        // Build dependency graph
        const dependencyGraph = this.buildDependencyGraph(steps);
        const executed = new Set();
        const executing = new Set();
        // Execute steps in dependency order
        const executeStep = async (stepId) => {
            if (executed.has(stepId) || executing.has(stepId)) {
                return;
            }
            const step = steps.find(s => s.id === stepId);
            if (!step) {
                throw new types_1.WorkflowExecutionError(`Step not found: ${stepId}`);
            }
            // Wait for dependencies
            if (step.dependencies) {
                await Promise.all(step.dependencies.map(dep => executeStep(dep)));
            }
            executing.add(stepId);
            try {
                await this.executeSingleStep(step, context, options);
                executed.add(stepId);
            }
            finally {
                executing.delete(stepId);
            }
        };
        // Execute all steps
        await Promise.all(steps.map(step => executeStep(step.id)));
    }
    async executeSingleStep(step, context, options) {
        const startTime = new Date();
        // Create step result
        const stepResult = {
            stepId: step.id,
            status: types_1.StepStatus.RUNNING,
            startTime,
            metadata: step.metadata || undefined
        };
        context.results.set(step.id, stepResult);
        this.emitProgress(context);
        try {
            // Check step condition
            if (step.condition && !(await step.condition.predicate(context))) {
                stepResult.status = types_1.StepStatus.SKIPPED;
                stepResult.endTime = new Date();
                stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
                return;
            }
            // Execute step based on type
            let result;
            switch (step.type) {
                case 'agent':
                    result = await this.executeAgentStep(step, context, options);
                    break;
                case 'parallel':
                    result = await this.executeParallelStep(step, context, options);
                    break;
                case 'sequential':
                    result = await this.executeSequentialStep(step, context, options);
                    break;
                case 'conditional':
                    result = await this.executeConditionalStep(step, context, options);
                    break;
                case 'loop':
                    result = await this.executeLoopStep(step, context, options);
                    break;
                default:
                    throw new types_1.StepExecutionError(`Unknown step type: ${step.type}`);
            }
            // Update step result
            stepResult.status = types_1.StepStatus.COMPLETED;
            stepResult.endTime = new Date();
            stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
            stepResult.result = result;
            this.emit('stepCompleted', stepResult);
        }
        catch (error) {
            // Handle step error
            stepResult.status = types_1.StepStatus.FAILED;
            stepResult.endTime = new Date();
            stepResult.duration = stepResult.endTime.getTime() - stepResult.startTime.getTime();
            stepResult.error = error;
            this.emit('stepFailed', stepResult, error);
            // Retry logic
            const retries = step.retries ?? options.retries ?? 0;
            if (retries > 0) {
                // TODO: Implement retry logic
            }
            throw error;
        }
    }
    async executeAgentStep(step, context, options) {
        const agent = this.agents.get(step.agentId);
        if (!agent) {
            throw new types_1.StepExecutionError(`Agent not found: ${step.agentId}`);
        }
        // Execute agent action
        const parameters = { ...step.parameters };
        // Add context variables to parameters
        context.variables.forEach((value, key) => {
            parameters[`context_${key}`] = value;
        });
        // For now, we'll simulate agent execution
        // In a real implementation, this would call the agent's specific action
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
        return {
            agentId: step.agentId,
            action: step.action,
            parameters,
            timestamp: new Date().toISOString()
        };
    }
    async executeParallelStep(step, context, options) {
        const concurrency = step.concurrency ?? options.concurrency ?? step.steps.length;
        const results = [];
        // Execute steps in parallel with concurrency limit
        const executeWithConcurrency = async (steps) => {
            const executing = [];
            const stepResults = [];
            for (let i = 0; i < steps.length; i++) {
                const currentStep = steps[i];
                if (currentStep) {
                    const stepPromise = this.executeSingleStep(currentStep, context, options);
                    executing.push(stepPromise);
                    if (executing.length >= concurrency || i === steps.length - 1) {
                        const batchResults = await Promise.all(executing);
                        stepResults.push(...batchResults);
                        executing.length = 0;
                    }
                }
            }
            return stepResults;
        };
        if (step.failFast) {
            // Fail fast: stop on first error
            return await executeWithConcurrency(step.steps);
        }
        else {
            // Continue on error: collect all results
            const promises = step.steps.map(async (subStep) => {
                try {
                    await this.executeSingleStep(subStep, context, options);
                    return { success: true, stepId: subStep.id };
                }
                catch (error) {
                    return { success: false, stepId: subStep.id, error };
                }
            });
            return await Promise.all(promises);
        }
    }
    async executeSequentialStep(step, context, options) {
        const results = [];
        for (const subStep of step.steps) {
            const result = await this.executeSingleStep(subStep, context, options);
            results.push(result);
        }
        return results;
    }
    async executeConditionalStep(step, context, options) {
        const conditionResult = await step.condition.predicate(context);
        if (conditionResult) {
            return await this.executeSingleStep(step.thenStep, context, options);
        }
        else if (step.elseStep) {
            return await this.executeSingleStep(step.elseStep, context, options);
        }
        return null;
    }
    async executeLoopStep(step, context, options) {
        const results = [];
        const maxIterations = step.maxIterations ?? 1000;
        let iteration = 0;
        while (iteration < maxIterations && await step.condition.predicate(context)) {
            const result = await this.executeSingleStep(step.body, context, options);
            results.push(result);
            iteration++;
        }
        return results;
    }
    // ============================================================================
    // Utility Methods
    // ============================================================================
    buildDependencyGraph(steps) {
        const graph = new Map();
        for (const step of steps) {
            graph.set(step.id, step.dependencies ?? []);
        }
        return graph;
    }
    emitProgress(context) {
        const totalSteps = context.results.size;
        const completedSteps = Array.from(context.results.values())
            .filter(r => r.status === types_1.StepStatus.COMPLETED).length;
        const failedSteps = Array.from(context.results.values())
            .filter(r => r.status === types_1.StepStatus.FAILED).length;
        const skippedSteps = Array.from(context.results.values())
            .filter(r => r.status === types_1.StepStatus.SKIPPED).length;
        const progress = {
            workflowId: context.workflowId,
            executionId: context.executionId,
            totalSteps,
            completedSteps,
            failedSteps,
            skippedSteps,
            progress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
        };
        this.emit('progress', progress);
    }
}
exports.ExecutionEngine = ExecutionEngine;
//# sourceMappingURL=ExecutionEngine.js.map
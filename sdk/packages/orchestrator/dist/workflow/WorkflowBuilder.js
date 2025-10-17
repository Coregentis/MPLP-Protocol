"use strict";
/**
 * @fileoverview Workflow Builder implementation
 * Provides fluent API for building complex multi-agent workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowBuilder = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
/**
 * Fluent workflow builder implementation
 */
class WorkflowBuilder {
    constructor(name, id) {
        this._steps = [];
        this._id = id ?? (0, uuid_1.v4)();
        this._name = name;
    }
    /**
     * Create a new workflow builder
     */
    static create(name, id) {
        return new WorkflowBuilder(name, id);
    }
    /**
     * Set workflow description
     */
    description(description) {
        this._description = description;
        return this;
    }
    /**
     * Set workflow version
     */
    version(version) {
        this._version = version;
        return this;
    }
    /**
     * Add an agent step
     */
    step(id, config) {
        this.validateStepId(id);
        const stepConfig = {
            ...config,
            id,
            type: 'agent'
        };
        this.validateAgentStepConfig(stepConfig);
        this._steps.push(stepConfig);
        return this;
    }
    /**
     * Add a parallel execution step
     */
    parallel(id, config) {
        this.validateStepId(id);
        const stepConfig = {
            ...config,
            id,
            type: 'parallel'
        };
        this.validateParallelStepConfig(stepConfig);
        this._steps.push(stepConfig);
        return this;
    }
    /**
     * Add a sequential execution step
     */
    sequential(id, config) {
        this.validateStepId(id);
        const stepConfig = {
            ...config,
            id,
            type: 'sequential'
        };
        this.validateSequentialStepConfig(stepConfig);
        this._steps.push(stepConfig);
        return this;
    }
    /**
     * Add a conditional step
     */
    condition(id, config) {
        this.validateStepId(id);
        const stepConfig = {
            ...config,
            id,
            type: 'conditional'
        };
        this.validateConditionalStepConfig(stepConfig);
        this._steps.push(stepConfig);
        return this;
    }
    /**
     * Add a loop step
     */
    loop(id, config) {
        this.validateStepId(id);
        const stepConfig = {
            ...config,
            id,
            type: 'loop'
        };
        this.validateLoopStepConfig(stepConfig);
        this._steps.push(stepConfig);
        return this;
    }
    /**
     * Set workflow timeout
     */
    timeout(timeout) {
        if (timeout <= 0) {
            throw new types_1.WorkflowDefinitionError('Timeout must be positive');
        }
        this._timeout = timeout;
        return this;
    }
    /**
     * Set workflow retries
     */
    retries(retries) {
        if (retries < 0) {
            throw new types_1.WorkflowDefinitionError('Retries must be non-negative');
        }
        this._retries = retries;
        return this;
    }
    /**
     * Set workflow metadata
     */
    metadata(metadata) {
        this._metadata = { ...this._metadata, ...metadata };
        return this;
    }
    /**
     * Build the workflow definition
     */
    build() {
        this.validateWorkflow();
        return {
            id: this._id,
            name: this._name,
            description: this._description || undefined,
            version: this._version || undefined,
            steps: [...this._steps],
            timeout: this._timeout || undefined,
            retries: this._retries || undefined,
            metadata: this._metadata ? { ...this._metadata } : undefined
        };
    }
    // ============================================================================
    // Validation Methods
    // ============================================================================
    validateStepId(id) {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new types_1.WorkflowDefinitionError('Step ID must be a non-empty string');
        }
        if (this._steps.some(step => step.id === id)) {
            throw new types_1.WorkflowDefinitionError(`Step ID '${id}' already exists`);
        }
    }
    validateAgentStepConfig(config) {
        if (!config.agentId || typeof config.agentId !== 'string') {
            throw new types_1.WorkflowDefinitionError('Agent step must have a valid agentId');
        }
        if (!config.action || typeof config.action !== 'string') {
            throw new types_1.WorkflowDefinitionError('Agent step must have a valid action');
        }
        this.validateCommonStepConfig(config);
    }
    validateParallelStepConfig(config) {
        if (!Array.isArray(config.steps) || config.steps.length === 0) {
            throw new types_1.WorkflowDefinitionError('Parallel step must have at least one sub-step');
        }
        if (config.concurrency !== undefined && config.concurrency <= 0) {
            throw new types_1.WorkflowDefinitionError('Parallel step concurrency must be positive');
        }
        this.validateCommonStepConfig(config);
    }
    validateSequentialStepConfig(config) {
        if (!Array.isArray(config.steps) || config.steps.length === 0) {
            throw new types_1.WorkflowDefinitionError('Sequential step must have at least one sub-step');
        }
        this.validateCommonStepConfig(config);
    }
    validateConditionalStepConfig(config) {
        if (!config.condition || typeof config.condition.predicate !== 'function') {
            throw new types_1.WorkflowDefinitionError('Conditional step must have a valid condition');
        }
        if (!config.thenStep) {
            throw new types_1.WorkflowDefinitionError('Conditional step must have a thenStep');
        }
        this.validateCommonStepConfig(config);
    }
    validateLoopStepConfig(config) {
        if (!config.condition || typeof config.condition.predicate !== 'function') {
            throw new types_1.WorkflowDefinitionError('Loop step must have a valid condition');
        }
        if (!config.body) {
            throw new types_1.WorkflowDefinitionError('Loop step must have a body');
        }
        if (config.maxIterations !== undefined && config.maxIterations <= 0) {
            throw new types_1.WorkflowDefinitionError('Loop step maxIterations must be positive');
        }
        this.validateCommonStepConfig(config);
    }
    validateCommonStepConfig(config) {
        if (!config.name || typeof config.name !== 'string') {
            throw new types_1.WorkflowDefinitionError('Step must have a valid name');
        }
        if (config.timeout !== undefined && config.timeout <= 0) {
            throw new types_1.WorkflowDefinitionError('Step timeout must be positive');
        }
        if (config.retries !== undefined && config.retries < 0) {
            throw new types_1.WorkflowDefinitionError('Step retries must be non-negative');
        }
        if (config.dependencies) {
            if (!Array.isArray(config.dependencies)) {
                throw new types_1.WorkflowDefinitionError('Step dependencies must be an array');
            }
            for (const dep of config.dependencies) {
                if (typeof dep !== 'string') {
                    throw new types_1.WorkflowDefinitionError('Step dependency must be a string');
                }
            }
        }
    }
    validateWorkflow() {
        if (!this._name || typeof this._name !== 'string' || this._name.trim().length === 0) {
            throw new types_1.WorkflowDefinitionError('Workflow must have a valid name');
        }
        if (this._steps.length === 0) {
            throw new types_1.WorkflowDefinitionError('Workflow must have at least one step');
        }
        // Validate step dependencies
        this.validateStepDependencies();
        // Validate no circular dependencies
        this.validateNoCycles();
    }
    validateStepDependencies() {
        const stepIds = new Set(this._steps.map(step => step.id));
        for (const step of this._steps) {
            if (step.dependencies) {
                for (const dep of step.dependencies) {
                    if (!stepIds.has(dep)) {
                        throw new types_1.WorkflowDefinitionError(`Step '${step.id}' depends on non-existent step '${dep}'`);
                    }
                }
            }
        }
    }
    validateNoCycles() {
        const visited = new Set();
        const recursionStack = new Set();
        const hasCycle = (stepId) => {
            if (recursionStack.has(stepId)) {
                return true;
            }
            if (visited.has(stepId)) {
                return false;
            }
            visited.add(stepId);
            recursionStack.add(stepId);
            const step = this._steps.find(s => s.id === stepId);
            if (step?.dependencies) {
                for (const dep of step.dependencies) {
                    if (hasCycle(dep)) {
                        return true;
                    }
                }
            }
            recursionStack.delete(stepId);
            return false;
        };
        for (const step of this._steps) {
            if (hasCycle(step.id)) {
                throw new types_1.WorkflowDefinitionError('Workflow contains circular dependencies');
            }
        }
    }
}
exports.WorkflowBuilder = WorkflowBuilder;
//# sourceMappingURL=WorkflowBuilder.js.map
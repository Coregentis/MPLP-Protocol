"use strict";
/**
 * @fileoverview Multi-Agent Orchestrator
 * Main orchestrator class for managing agents and executing workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAgentOrchestrator = void 0;
const EventEmitter_1 = require("../utils/EventEmitter");
const types_1 = require("../types");
const ExecutionEngine_1 = require("../execution/ExecutionEngine");
const WorkflowBuilder_1 = require("../workflow/WorkflowBuilder");
/**
 * Multi-agent orchestrator implementation - 基于MPLP V1.0 Alpha架构
 */
class MultiAgentOrchestrator extends EventEmitter_1.MPLPEventManager {
    constructor() {
        super();
        this.agents = new Map();
        this.workflows = new Map();
        this.executionEngine = new ExecutionEngine_1.ExecutionEngine();
        this.setupExecutionEngineEvents();
    }
    // ============================================================================
    // Agent Management
    // ============================================================================
    /**
     * Register an agent with the orchestrator
     */
    async registerAgent(agent) {
        if (!agent || !agent.id) {
            throw new types_1.OrchestratorError('Invalid agent: agent must have an ID');
        }
        if (this.agents.has(agent.id)) {
            throw new types_1.OrchestratorError(`Agent already registered: ${agent.id}`);
        }
        this.agents.set(agent.id, agent);
        this.executionEngine.registerAgent(agent);
        this.emit('agentRegistered', agent);
    }
    /**
     * Unregister an agent from the orchestrator
     */
    async unregisterAgent(agentId) {
        if (!agentId || typeof agentId !== 'string') {
            throw new types_1.OrchestratorError('Invalid agent ID');
        }
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new types_1.AgentNotFoundError(agentId);
        }
        this.agents.delete(agentId);
        this.executionEngine.unregisterAgent(agentId);
        this.emit('agentUnregistered', agent);
    }
    /**
     * Get a registered agent
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * List all registered agents
     */
    listAgents() {
        return Array.from(this.agents.values());
    }
    // ============================================================================
    // Workflow Management
    // ============================================================================
    /**
     * Register a workflow definition
     */
    async registerWorkflow(workflow) {
        if (!workflow || !workflow.id) {
            throw new types_1.WorkflowDefinitionError('Invalid workflow: workflow must have an ID');
        }
        if (this.workflows.has(workflow.id)) {
            throw new types_1.WorkflowDefinitionError(`Workflow already registered: ${workflow.id}`);
        }
        // Validate workflow
        this.validateWorkflow(workflow);
        this.workflows.set(workflow.id, workflow);
        this.emit('workflowRegistered', workflow);
    }
    /**
     * Unregister a workflow definition
     */
    async unregisterWorkflow(workflowId) {
        if (!workflowId || typeof workflowId !== 'string') {
            throw new types_1.WorkflowDefinitionError('Invalid workflow ID');
        }
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new types_1.WorkflowNotFoundError(workflowId);
        }
        this.workflows.delete(workflowId);
        this.emit('workflowUnregistered', workflow);
    }
    /**
     * Get a registered workflow
     */
    getWorkflow(workflowId) {
        return this.workflows.get(workflowId);
    }
    /**
     * List all registered workflows
     */
    listWorkflows() {
        return Array.from(this.workflows.values());
    }
    // ============================================================================
    // Execution Management
    // ============================================================================
    /**
     * Execute a workflow
     */
    async executeWorkflow(workflowId, parameters = {}, options = {}) {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new types_1.WorkflowNotFoundError(workflowId);
        }
        // Validate that all required agents are registered
        this.validateWorkflowAgents(workflow);
        try {
            const result = await this.executionEngine.executeWorkflow(workflow, parameters, options);
            this.emit('workflowExecuted', result);
            return result;
        }
        catch (error) {
            this.emit('workflowExecutionFailed', workflowId, error);
            throw error;
        }
    }
    /**
     * Pause workflow execution
     */
    async pauseExecution(executionId) {
        // TODO: Implement pause functionality
        throw new types_1.OrchestratorError('Pause functionality not yet implemented');
    }
    /**
     * Resume workflow execution
     */
    async resumeExecution(executionId) {
        // TODO: Implement resume functionality
        throw new types_1.OrchestratorError('Resume functionality not yet implemented');
    }
    /**
     * Cancel workflow execution
     */
    async cancelExecution(executionId) {
        // TODO: Implement cancel functionality
        throw new types_1.OrchestratorError('Cancel functionality not yet implemented');
    }
    /**
     * Get execution status
     */
    getExecutionStatus(executionId) {
        return this.executionEngine.getExecution(executionId);
    }
    /**
     * List all executions
     */
    listExecutions() {
        return this.executionEngine.listExecutions();
    }
    // ============================================================================
    // Event Handlers
    // ============================================================================
    /**
     * Register progress handler
     */
    onProgress(handler) {
        this.on('progress', handler);
    }
    /**
     * Register error handler
     */
    onError(handler) {
        this.on('error', handler);
    }
    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        return super.listenerCount(event);
    }
    // ============================================================================
    // Static Factory Methods
    // ============================================================================
    /**
     * Create a new orchestrator instance
     */
    static create() {
        return new MultiAgentOrchestrator();
    }
    /**
     * Create a workflow builder
     */
    static createWorkflow(name, id) {
        return WorkflowBuilder_1.WorkflowBuilder.create(name, id);
    }
    // ============================================================================
    // Private Methods
    // ============================================================================
    setupExecutionEngineEvents() {
        this.executionEngine.on('progress', (progress) => {
            this.emit('progress', progress);
        });
        this.executionEngine.on('stepCompleted', (stepResult) => {
            this.emit('stepCompleted', stepResult);
        });
        this.executionEngine.on('stepFailed', (stepResult, error) => {
            this.emit('stepFailed', stepResult, error);
        });
        this.executionEngine.on('workflowCompleted', (result) => {
            this.emit('workflowCompleted', result);
        });
        this.executionEngine.on('workflowFailed', (result, error) => {
            this.emit('workflowFailed', result, error);
        });
    }
    validateWorkflow(workflow) {
        if (!workflow.name || typeof workflow.name !== 'string') {
            throw new types_1.WorkflowDefinitionError('Workflow must have a valid name');
        }
        if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
            throw new types_1.WorkflowDefinitionError('Workflow must have at least one step');
        }
        // Validate step IDs are unique
        const stepIds = new Set();
        for (const step of workflow.steps) {
            if (stepIds.has(step.id)) {
                throw new types_1.WorkflowDefinitionError(`Duplicate step ID: ${step.id}`);
            }
            stepIds.add(step.id);
        }
        // Validate dependencies exist
        for (const step of workflow.steps) {
            if (step.dependencies) {
                for (const dep of step.dependencies) {
                    if (!stepIds.has(dep)) {
                        throw new types_1.WorkflowDefinitionError(`Step '${step.id}' depends on non-existent step '${dep}'`);
                    }
                }
            }
        }
    }
    validateWorkflowAgents(workflow) {
        const requiredAgents = new Set();
        // Collect all agent IDs from workflow steps
        const collectAgentIds = (steps) => {
            for (const step of steps) {
                if (step.type === 'agent' && step.agentId) {
                    requiredAgents.add(step.agentId);
                }
                else if (step.steps) {
                    collectAgentIds(step.steps);
                }
                else if (step.thenStep) {
                    collectAgentIds([step.thenStep]);
                    if (step.elseStep) {
                        collectAgentIds([step.elseStep]);
                    }
                }
                else if (step.body) {
                    collectAgentIds([step.body]);
                }
            }
        };
        collectAgentIds(workflow.steps);
        // Check that all required agents are registered
        requiredAgents.forEach(agentId => {
            if (!this.agents.has(agentId)) {
                throw new types_1.AgentNotFoundError(agentId);
            }
        });
    }
}
exports.MultiAgentOrchestrator = MultiAgentOrchestrator;
//# sourceMappingURL=MultiAgentOrchestrator.js.map
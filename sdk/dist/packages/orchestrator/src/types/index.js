"use strict";
/**
 * @fileoverview Core type definitions for MPLP Orchestrator
 * Defines interfaces and types for multi-agent workflow orchestration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowNotFoundError = exports.AgentNotFoundError = exports.StepExecutionError = exports.WorkflowExecutionError = exports.WorkflowDefinitionError = exports.OrchestratorError = exports.StepPriority = exports.StepStatus = exports.WorkflowStatus = void 0;
// ============================================================================
// Core Orchestrator Types
// ============================================================================
/**
 * Workflow execution status
 */
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["IDLE"] = "idle";
    WorkflowStatus["RUNNING"] = "running";
    WorkflowStatus["PAUSED"] = "paused";
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["FAILED"] = "failed";
    WorkflowStatus["CANCELLED"] = "cancelled";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
/**
 * Step execution status
 */
var StepStatus;
(function (StepStatus) {
    StepStatus["PENDING"] = "pending";
    StepStatus["RUNNING"] = "running";
    StepStatus["COMPLETED"] = "completed";
    StepStatus["FAILED"] = "failed";
    StepStatus["SKIPPED"] = "skipped";
    StepStatus["CANCELLED"] = "cancelled";
})(StepStatus || (exports.StepStatus = StepStatus = {}));
/**
 * Step execution priority
 */
var StepPriority;
(function (StepPriority) {
    StepPriority[StepPriority["LOW"] = 1] = "LOW";
    StepPriority[StepPriority["NORMAL"] = 2] = "NORMAL";
    StepPriority[StepPriority["HIGH"] = 3] = "HIGH";
    StepPriority[StepPriority["CRITICAL"] = 4] = "CRITICAL";
})(StepPriority || (exports.StepPriority = StepPriority = {}));
// ============================================================================
// Error Types
// ============================================================================
/**
 * Base orchestrator error
 */
class OrchestratorError extends Error {
    constructor(message, code = 'ORCHESTRATOR_ERROR', details) {
        super(message);
        this.name = 'OrchestratorError';
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, OrchestratorError);
    }
}
exports.OrchestratorError = OrchestratorError;
/**
 * Workflow definition error
 */
class WorkflowDefinitionError extends OrchestratorError {
    constructor(message, details) {
        super(message, 'WORKFLOW_DEFINITION_ERROR', details);
        this.name = 'WorkflowDefinitionError';
    }
}
exports.WorkflowDefinitionError = WorkflowDefinitionError;
/**
 * Workflow execution error
 */
class WorkflowExecutionError extends OrchestratorError {
    constructor(message, details) {
        super(message, 'WORKFLOW_EXECUTION_ERROR', details);
        this.name = 'WorkflowExecutionError';
    }
}
exports.WorkflowExecutionError = WorkflowExecutionError;
/**
 * Step execution error
 */
class StepExecutionError extends OrchestratorError {
    constructor(message, details) {
        super(message, 'STEP_EXECUTION_ERROR', details);
        this.name = 'StepExecutionError';
    }
}
exports.StepExecutionError = StepExecutionError;
/**
 * Agent not found error
 */
class AgentNotFoundError extends OrchestratorError {
    constructor(agentId) {
        super(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND_ERROR', { agentId });
        this.name = 'AgentNotFoundError';
    }
}
exports.AgentNotFoundError = AgentNotFoundError;
/**
 * Workflow not found error
 */
class WorkflowNotFoundError extends OrchestratorError {
    constructor(workflowId) {
        super(`Workflow not found: ${workflowId}`, 'WORKFLOW_NOT_FOUND_ERROR', { workflowId });
        this.name = 'WorkflowNotFoundError';
    }
}
exports.WorkflowNotFoundError = WorkflowNotFoundError;
//# sourceMappingURL=index.js.map
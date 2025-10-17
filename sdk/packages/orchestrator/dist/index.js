"use strict";
/**
 * @fileoverview MPLP Orchestrator - Main Entry Point
 * Multi-Agent Protocol Lifecycle Platform Orchestrator
 *
 * Provides advanced multi-agent workflow orchestration and execution capabilities
 * for the MPLP ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_NAME = exports.VERSION = exports.withTimeout = exports.createTimeout = exports.retryWithBackoff = exports.generateStepId = exports.sanitizeStepName = exports.validateStepConfig = exports.formatDuration = exports.getFailedSteps = exports.isExecutionSuccessful = exports.getExecutionSummary = exports.calculateProgress = exports.hasCircularDependencies = exports.getWorkflowAgentIds = exports.getWorkflowStepIds = exports.validateWorkflowStructure = exports.cloneWorkflow = exports.WorkflowNotFoundError = exports.AgentNotFoundError = exports.StepExecutionError = exports.WorkflowExecutionError = exports.WorkflowDefinitionError = exports.OrchestratorError = exports.StepPriority = exports.StepStatus = exports.WorkflowStatus = exports.ExecutionEngine = exports.WorkflowBuilder = exports.MultiAgentOrchestrator = void 0;
exports.createOrchestrator = createOrchestrator;
exports.createWorkflow = createWorkflow;
// ============================================================================
// Core Exports
// ============================================================================
// Main orchestrator class
var MultiAgentOrchestrator_1 = require("./orchestrator/MultiAgentOrchestrator");
Object.defineProperty(exports, "MultiAgentOrchestrator", { enumerable: true, get: function () { return MultiAgentOrchestrator_1.MultiAgentOrchestrator; } });
const MultiAgentOrchestrator_2 = require("./orchestrator/MultiAgentOrchestrator");
// Workflow builder
var WorkflowBuilder_1 = require("./workflow/WorkflowBuilder");
Object.defineProperty(exports, "WorkflowBuilder", { enumerable: true, get: function () { return WorkflowBuilder_1.WorkflowBuilder; } });
const WorkflowBuilder_2 = require("./workflow/WorkflowBuilder");
// Execution engine
var ExecutionEngine_1 = require("./execution/ExecutionEngine");
Object.defineProperty(exports, "ExecutionEngine", { enumerable: true, get: function () { return ExecutionEngine_1.ExecutionEngine; } });
// Enum exports
var types_1 = require("./types");
Object.defineProperty(exports, "WorkflowStatus", { enumerable: true, get: function () { return types_1.WorkflowStatus; } });
Object.defineProperty(exports, "StepStatus", { enumerable: true, get: function () { return types_1.StepStatus; } });
Object.defineProperty(exports, "StepPriority", { enumerable: true, get: function () { return types_1.StepPriority; } });
// Error exports
var types_2 = require("./types");
Object.defineProperty(exports, "OrchestratorError", { enumerable: true, get: function () { return types_2.OrchestratorError; } });
Object.defineProperty(exports, "WorkflowDefinitionError", { enumerable: true, get: function () { return types_2.WorkflowDefinitionError; } });
Object.defineProperty(exports, "WorkflowExecutionError", { enumerable: true, get: function () { return types_2.WorkflowExecutionError; } });
Object.defineProperty(exports, "StepExecutionError", { enumerable: true, get: function () { return types_2.StepExecutionError; } });
Object.defineProperty(exports, "AgentNotFoundError", { enumerable: true, get: function () { return types_2.AgentNotFoundError; } });
Object.defineProperty(exports, "WorkflowNotFoundError", { enumerable: true, get: function () { return types_2.WorkflowNotFoundError; } });
// ============================================================================
// Utility Exports
// ============================================================================
var utils_1 = require("./utils");
// Workflow utilities
Object.defineProperty(exports, "cloneWorkflow", { enumerable: true, get: function () { return utils_1.cloneWorkflow; } });
Object.defineProperty(exports, "validateWorkflowStructure", { enumerable: true, get: function () { return utils_1.validateWorkflowStructure; } });
Object.defineProperty(exports, "getWorkflowStepIds", { enumerable: true, get: function () { return utils_1.getWorkflowStepIds; } });
Object.defineProperty(exports, "getWorkflowAgentIds", { enumerable: true, get: function () { return utils_1.getWorkflowAgentIds; } });
Object.defineProperty(exports, "hasCircularDependencies", { enumerable: true, get: function () { return utils_1.hasCircularDependencies; } });
// Execution utilities
Object.defineProperty(exports, "calculateProgress", { enumerable: true, get: function () { return utils_1.calculateProgress; } });
Object.defineProperty(exports, "getExecutionSummary", { enumerable: true, get: function () { return utils_1.getExecutionSummary; } });
Object.defineProperty(exports, "isExecutionSuccessful", { enumerable: true, get: function () { return utils_1.isExecutionSuccessful; } });
Object.defineProperty(exports, "getFailedSteps", { enumerable: true, get: function () { return utils_1.getFailedSteps; } });
Object.defineProperty(exports, "formatDuration", { enumerable: true, get: function () { return utils_1.formatDuration; } });
// Validation utilities
Object.defineProperty(exports, "validateStepConfig", { enumerable: true, get: function () { return utils_1.validateStepConfig; } });
Object.defineProperty(exports, "sanitizeStepName", { enumerable: true, get: function () { return utils_1.sanitizeStepName; } });
Object.defineProperty(exports, "generateStepId", { enumerable: true, get: function () { return utils_1.generateStepId; } });
// Retry utilities
Object.defineProperty(exports, "retryWithBackoff", { enumerable: true, get: function () { return utils_1.retryWithBackoff; } });
Object.defineProperty(exports, "createTimeout", { enumerable: true, get: function () { return utils_1.createTimeout; } });
Object.defineProperty(exports, "withTimeout", { enumerable: true, get: function () { return utils_1.withTimeout; } });
// ============================================================================
// Convenience Factory Functions
// ============================================================================
/**
 * Create a new multi-agent orchestrator instance
 */
function createOrchestrator() {
    return MultiAgentOrchestrator_2.MultiAgentOrchestrator.create();
}
/**
 * Create a new workflow builder
 */
function createWorkflow(name, id) {
    return WorkflowBuilder_2.WorkflowBuilder.create(name, id);
}
// ============================================================================
// Version Information
// ============================================================================
exports.VERSION = '1.1.0-beta';
exports.PACKAGE_NAME = '@mplp/orchestrator';
// ============================================================================
// Default Export
// ============================================================================
exports.default = MultiAgentOrchestrator_2.MultiAgentOrchestrator;
//# sourceMappingURL=index.js.map
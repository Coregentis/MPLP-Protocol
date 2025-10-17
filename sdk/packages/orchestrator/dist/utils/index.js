"use strict";
/**
 * @fileoverview Utility functions for MPLP Orchestrator
 * Common utilities for workflow management and execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneWorkflow = cloneWorkflow;
exports.validateWorkflowStructure = validateWorkflowStructure;
exports.getWorkflowStepIds = getWorkflowStepIds;
exports.getWorkflowAgentIds = getWorkflowAgentIds;
exports.hasCircularDependencies = hasCircularDependencies;
exports.calculateProgress = calculateProgress;
exports.getExecutionSummary = getExecutionSummary;
exports.isExecutionSuccessful = isExecutionSuccessful;
exports.getFailedSteps = getFailedSteps;
exports.formatDuration = formatDuration;
exports.validateStepConfig = validateStepConfig;
exports.sanitizeStepName = sanitizeStepName;
exports.generateStepId = generateStepId;
exports.retryWithBackoff = retryWithBackoff;
exports.createTimeout = createTimeout;
exports.withTimeout = withTimeout;
const types_1 = require("../types");
// ============================================================================
// Workflow Utilities
// ============================================================================
/**
 * Deep clone a workflow definition
 */
function cloneWorkflow(workflow) {
    return JSON.parse(JSON.stringify(workflow));
}
/**
 * Validate workflow definition structure
 */
function validateWorkflowStructure(workflow) {
    if (!workflow || typeof workflow !== 'object') {
        return false;
    }
    if (!workflow.id || typeof workflow.id !== 'string') {
        return false;
    }
    if (!workflow.name || typeof workflow.name !== 'string') {
        return false;
    }
    if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
        return false;
    }
    return true;
}
/**
 * Get all step IDs from a workflow
 */
function getWorkflowStepIds(workflow) {
    const stepIds = [];
    const collectStepIds = (steps) => {
        for (const step of steps) {
            stepIds.push(step.id);
            if ('steps' in step && step.steps) {
                collectStepIds(step.steps);
            }
            if ('thenStep' in step && step.thenStep) {
                collectStepIds([step.thenStep]);
            }
            if ('elseStep' in step && step.elseStep) {
                collectStepIds([step.elseStep]);
            }
            if ('body' in step && step.body) {
                collectStepIds([step.body]);
            }
        }
    };
    collectStepIds(workflow.steps);
    return stepIds;
}
/**
 * Get all agent IDs referenced in a workflow
 */
function getWorkflowAgentIds(workflow) {
    const agentIds = [];
    const collectAgentIds = (steps) => {
        for (const step of steps) {
            if (step.type === 'agent' && 'agentId' in step) {
                agentIds.push(step.agentId);
            }
            if ('steps' in step && step.steps) {
                collectAgentIds(step.steps);
            }
            if ('thenStep' in step && step.thenStep) {
                collectAgentIds([step.thenStep]);
            }
            if ('elseStep' in step && step.elseStep) {
                collectAgentIds([step.elseStep]);
            }
            if ('body' in step && step.body) {
                collectAgentIds([step.body]);
            }
        }
    };
    collectAgentIds(workflow.steps);
    return Array.from(new Set(agentIds)); // Remove duplicates
}
/**
 * Check if workflow has circular dependencies
 */
function hasCircularDependencies(workflow) {
    const stepIds = new Set(workflow.steps.map(step => step.id));
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
        const step = workflow.steps.find(s => s.id === stepId);
        if (step?.dependencies) {
            for (const dep of step.dependencies) {
                if (stepIds.has(dep) && hasCycle(dep)) {
                    return true;
                }
            }
        }
        recursionStack.delete(stepId);
        return false;
    };
    for (const step of workflow.steps) {
        if (hasCycle(step.id)) {
            return true;
        }
    }
    return false;
}
// ============================================================================
// Execution Utilities
// ============================================================================
/**
 * Calculate workflow execution progress
 */
function calculateProgress(results) {
    const totalSteps = results.length;
    const completedSteps = results.filter(r => r.status === types_1.StepStatus.COMPLETED).length;
    const failedSteps = results.filter(r => r.status === types_1.StepStatus.FAILED).length;
    const skippedSteps = results.filter(r => r.status === types_1.StepStatus.SKIPPED).length;
    return {
        workflowId: results[0]?.stepId.split('-')[0] ?? 'unknown',
        executionId: 'unknown',
        totalSteps,
        completedSteps,
        failedSteps,
        skippedSteps,
        progress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
    };
}
/**
 * Get execution summary statistics
 */
function getExecutionSummary(result) {
    const steps = result.steps;
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === types_1.StepStatus.COMPLETED).length;
    const failedSteps = steps.filter(s => s.status === types_1.StepStatus.FAILED).length;
    const skippedSteps = steps.filter(s => s.status === types_1.StepStatus.SKIPPED).length;
    const totalDuration = result.duration ?? 0;
    const stepDurations = steps
        .filter(s => s.duration !== undefined)
        .map(s => s.duration);
    const averageStepDuration = stepDurations.length > 0
        ? stepDurations.reduce((sum, duration) => sum + duration, 0) / stepDurations.length
        : 0;
    return {
        totalSteps,
        completedSteps,
        failedSteps,
        skippedSteps,
        totalDuration,
        averageStepDuration
    };
}
/**
 * Check if workflow execution is successful
 */
function isExecutionSuccessful(result) {
    return result.status === types_1.WorkflowStatus.COMPLETED &&
        result.steps.every(step => step.status === types_1.StepStatus.COMPLETED ||
            step.status === types_1.StepStatus.SKIPPED);
}
/**
 * Get failed steps from execution result
 */
function getFailedSteps(result) {
    return result.steps.filter(step => step.status === types_1.StepStatus.FAILED);
}
/**
 * Get execution duration in human-readable format
 */
function formatDuration(milliseconds) {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    }
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}
// ============================================================================
// Validation Utilities
// ============================================================================
/**
 * Validate step configuration
 */
function validateStepConfig(step) {
    const errors = [];
    if (!step.id || typeof step.id !== 'string') {
        errors.push('Step must have a valid ID');
    }
    if (!step.name || typeof step.name !== 'string') {
        errors.push('Step must have a valid name');
    }
    if (step.timeout !== undefined && (typeof step.timeout !== 'number' || step.timeout <= 0)) {
        errors.push('Step timeout must be a positive number');
    }
    if (step.retries !== undefined && (typeof step.retries !== 'number' || step.retries < 0)) {
        errors.push('Step retries must be a non-negative number');
    }
    if (step.dependencies && !Array.isArray(step.dependencies)) {
        errors.push('Step dependencies must be an array');
    }
    // Type-specific validation
    switch (step.type) {
        case 'agent':
            if (!('agentId' in step) || !step.agentId) {
                errors.push('Agent step must have a valid agentId');
            }
            if (!('action' in step) || !step.action) {
                errors.push('Agent step must have a valid action');
            }
            break;
        case 'parallel':
        case 'sequential':
            if (!('steps' in step) || !Array.isArray(step.steps) || step.steps.length === 0) {
                errors.push(`${step.type} step must have at least one sub-step`);
            }
            break;
        case 'conditional':
            if (!('condition' in step) || !step.condition) {
                errors.push('Conditional step must have a condition');
            }
            if (!('thenStep' in step) || !step.thenStep) {
                errors.push('Conditional step must have a thenStep');
            }
            break;
        case 'loop':
            if (!('condition' in step) || !step.condition) {
                errors.push('Loop step must have a condition');
            }
            if (!('body' in step) || !step.body) {
                errors.push('Loop step must have a body');
            }
            break;
    }
    return errors;
}
/**
 * Sanitize step name for use as identifier
 */
function sanitizeStepName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 50);
}
/**
 * Generate unique step ID
 */
function generateStepId(name, existingIds = new Set()) {
    const baseName = sanitizeStepName(name);
    let id = baseName;
    let counter = 1;
    while (existingIds.has(id)) {
        id = `${baseName}_${counter}`;
        counter++;
    }
    return id;
}
// ============================================================================
// Retry Utilities
// ============================================================================
/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                break;
            }
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * Create a timeout promise
 */
function createTimeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    });
}
/**
 * Race a promise against a timeout
 */
async function withTimeout(promise, timeoutMs) {
    return Promise.race([promise, createTimeout(timeoutMs)]);
}
//# sourceMappingURL=index.js.map
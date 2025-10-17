"use strict";
/**
 * @fileoverview Workflow Debugger - Debug workflow execution
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowDebugger = void 0;
const events_1 = require("events");
/**
 * Workflow debugger for debugging workflow execution
 */
class WorkflowDebugger extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.debuggedWorkflows = new Map();
        this.isActive = false;
        this.config = config;
    }
    /**
     * Start workflow debugging
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.emit('started');
    }
    /**
     * Stop workflow debugging
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        this.debuggedWorkflows.clear();
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Start debugging workflow
     */
    startWorkflowDebugging(workflowId, name) {
        const debugInfo = {
            workflowId,
            name,
            status: 'pending',
            steps: [],
            startTime: new Date()
        };
        this.debuggedWorkflows.set(workflowId, debugInfo);
        this.emit('workflowStarted', debugInfo);
    }
    /**
     * Update workflow status
     */
    updateWorkflowStatus(workflowId, status) {
        const debugInfo = this.debuggedWorkflows.get(workflowId);
        if (debugInfo) {
            debugInfo.status = status;
            if (status === 'completed' || status === 'failed') {
                debugInfo.endTime = new Date();
                debugInfo.duration = debugInfo.endTime.getTime() - debugInfo.startTime.getTime();
            }
            this.emit('workflowStatusUpdated', debugInfo);
        }
    }
    /**
     * Add workflow step
     */
    addWorkflowStep(workflowId, stepInfo) {
        const debugInfo = this.debuggedWorkflows.get(workflowId);
        if (debugInfo) {
            const step = {
                stepId: `step_${debugInfo.steps.length + 1}`,
                ...stepInfo
            };
            debugInfo.steps.push(step);
            this.emit('stepAdded', { workflowId, step });
        }
    }
    /**
     * Update workflow step
     */
    updateWorkflowStep(workflowId, stepId, updates) {
        const debugInfo = this.debuggedWorkflows.get(workflowId);
        if (debugInfo) {
            const step = debugInfo.steps.find(s => s.stepId === stepId);
            if (step) {
                Object.assign(step, updates);
                if (updates.status === 'completed' || updates.status === 'failed') {
                    step.endTime = new Date();
                    if (step.startTime) {
                        step.duration = step.endTime.getTime() - step.startTime.getTime();
                    }
                }
                this.emit('stepUpdated', { workflowId, step });
            }
        }
    }
    /**
     * Get workflow debug info
     */
    getWorkflowInfo(workflowId) {
        return this.debuggedWorkflows.get(workflowId);
    }
    /**
     * Get all debugged workflows
     */
    getAllWorkflows() {
        return Array.from(this.debuggedWorkflows.values());
    }
    /**
     * Get debugging statistics
     */
    getStatistics() {
        const workflows = Array.from(this.debuggedWorkflows.values());
        return {
            isActive: this.isActive,
            totalWorkflows: workflows.length,
            completedWorkflows: workflows.filter(w => w.status === 'completed').length,
            failedWorkflows: workflows.filter(w => w.status === 'failed').length,
            runningWorkflows: workflows.filter(w => w.status === 'running').length,
            averageDuration: this.calculateAverageDuration(workflows)
        };
    }
    /**
     * Calculate average workflow duration
     */
    calculateAverageDuration(workflows) {
        const completedWorkflows = workflows.filter(w => w.duration !== undefined);
        if (completedWorkflows.length === 0) {
            return 0;
        }
        const totalDuration = completedWorkflows.reduce((sum, w) => sum + (w.duration || 0), 0);
        return totalDuration / completedWorkflows.length;
    }
}
exports.WorkflowDebugger = WorkflowDebugger;
//# sourceMappingURL=WorkflowDebugger.js.map
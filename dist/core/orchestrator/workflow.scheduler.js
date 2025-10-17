"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowScheduler = void 0;
class WorkflowScheduler {
    activeExecutions = new Map();
    maxConcurrentExecutions;
    constructor(maxConcurrentExecutions = 100) {
        this.maxConcurrentExecutions = maxConcurrentExecutions;
    }
    async parseWorkflow(definition) {
        const syntaxValidation = this.validateSyntax(definition);
        const semanticValidation = this.validateSemantics(definition);
        const dependencyGraph = this.buildDependencyGraph(definition);
        const cycles = this.detectCycles(dependencyGraph);
        const optimizedStages = this.optimizeStages(definition.stages, dependencyGraph);
        const validationResult = {
            isValid: syntaxValidation.isValid && semanticValidation.isValid && cycles.length === 0,
            errors: [...syntaxValidation.errors, ...semanticValidation.errors],
            warnings: [...syntaxValidation.warnings, ...semanticValidation.warnings]
        };
        if (cycles.length > 0) {
            validationResult.errors.push({
                errorType: 'dependency',
                message: `Circular dependencies detected: ${cycles.map(cycle => cycle.join(' -> ')).join(', ')}`,
                location: 'dependencies'
            });
        }
        return {
            definition,
            validationResult,
            optimizedStages,
            dependencyGraph
        };
    }
    async validateWorkflow(workflow) {
        return workflow.validationResult;
    }
    async scheduleExecution(workflow) {
        if (!workflow.validationResult.isValid) {
            throw new Error(`Cannot schedule invalid workflow: ${workflow.validationResult.errors.map(e => e.message).join(', ')}`);
        }
        const executionOrder = this.createExecutionGroups(workflow.dependencyGraph, workflow.optimizedStages);
        const resourceRequirements = this.calculateResourceRequirements(workflow.optimizedStages);
        const estimatedDuration = this.estimateExecutionDuration(workflow.optimizedStages, executionOrder);
        const executionPlan = {
            planId: this.generateUUID(),
            workflowId: workflow.definition.workflowId,
            executionOrder,
            resourceRequirements,
            estimatedDuration,
            createdAt: new Date().toISOString()
        };
        return executionPlan;
    }
    async executeWorkflow(plan) {
        if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
            throw new Error('Maximum concurrent executions reached');
        }
        const executionId = this.generateUUID();
        const executionStatus = {
            executionId,
            workflowId: plan.workflowId,
            status: 'running',
            completedStages: [],
            failedStages: [],
            startTime: new Date().toISOString(),
            progress: {
                totalStages: plan.executionOrder.reduce((total, group) => total + group.stages.length, 0),
                completedStages: 0,
                failedStages: 0,
                progressPercentage: 0
            },
            errors: []
        };
        this.activeExecutions.set(executionId, executionStatus);
        try {
            for (const group of plan.executionOrder) {
                await this.executeGroup(group, executionStatus);
            }
            executionStatus.status = 'completed';
            executionStatus.endTime = new Date().toISOString();
            executionStatus.duration = new Date(executionStatus.endTime).getTime() - new Date(executionStatus.startTime).getTime();
            return {
                executionId,
                workflowId: plan.workflowId,
                status: 'completed',
                result: { success: true },
                duration: executionStatus.duration,
                completedStages: executionStatus.completedStages.length,
                failedStages: executionStatus.failedStages.length
            };
        }
        catch (error) {
            executionStatus.status = 'failed';
            executionStatus.endTime = new Date().toISOString();
            throw error;
        }
    }
    async manageConcurrency(executions) {
        const activeCount = executions.filter(e => e.status === 'running').length;
        if (activeCount > this.maxConcurrentExecutions) {
            const toSuspend = executions
                .filter(e => e.status === 'running')
                .slice(this.maxConcurrentExecutions);
            for (const execution of toSuspend) {
                await this.pauseExecution(execution.executionId);
            }
        }
    }
    async trackExecution(executionId) {
        const status = this.activeExecutions.get(executionId);
        if (!status) {
            throw new Error(`Execution not found: ${executionId}`);
        }
        return status;
    }
    async pauseExecution(executionId) {
        const status = this.activeExecutions.get(executionId);
        if (status) {
            status.status = 'paused';
        }
    }
    async resumeExecution(executionId) {
        const status = this.activeExecutions.get(executionId);
        if (status && status.status === 'paused') {
            status.status = 'running';
        }
    }
    async cancelExecution(executionId) {
        const status = this.activeExecutions.get(executionId);
        if (status) {
            status.status = 'cancelled';
            status.endTime = new Date().toISOString();
            this.activeExecutions.delete(executionId);
        }
    }
    validateSyntax(definition) {
        const errors = [];
        const warnings = [];
        if (!definition.workflowId) {
            errors.push({ errorType: 'syntax', message: 'workflowId is required' });
        }
        if (!definition.name) {
            errors.push({ errorType: 'syntax', message: 'name is required' });
        }
        if (!definition.stages || definition.stages.length === 0) {
            errors.push({ errorType: 'syntax', message: 'at least one stage is required' });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    validateSemantics(definition) {
        const errors = [];
        const warnings = [];
        const stageIds = new Set();
        for (const stage of definition.stages) {
            if (stageIds.has(stage.stageId)) {
                errors.push({
                    errorType: 'semantic',
                    message: `Duplicate stage ID: ${stage.stageId}`
                });
            }
            stageIds.add(stage.stageId);
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    buildDependencyGraph(definition) {
        const nodes = definition.stages.map((stage, _index) => ({
            nodeId: stage.stageId,
            stageId: stage.stageId,
            level: 0,
            dependencies: []
        }));
        const edges = definition.dependencies.map(dep => ({
            from: dep.sourceStage,
            to: dep.targetStage,
            type: dep.dependencyType
        }));
        return { nodes, edges, cycles: [] };
    }
    detectCycles(graph) {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        const dfs = (nodeId, path) => {
            visited.add(nodeId);
            recursionStack.add(nodeId);
            path.push(nodeId);
            const outgoingEdges = graph.edges.filter(edge => edge.from === nodeId);
            for (const edge of outgoingEdges) {
                if (recursionStack.has(edge.to)) {
                    const cycleStart = path.indexOf(edge.to);
                    cycles.push([...path.slice(cycleStart), edge.to]);
                }
                else if (!visited.has(edge.to)) {
                    dfs(edge.to, [...path]);
                }
            }
            recursionStack.delete(nodeId);
        };
        for (const node of graph.nodes) {
            if (!visited.has(node.nodeId)) {
                dfs(node.nodeId, []);
            }
        }
        return cycles;
    }
    optimizeStages(stages, _graph) {
        return [...stages];
    }
    createExecutionGroups(_graph, stages) {
        const groups = [];
        groups.push({
            groupId: this.generateUUID(),
            stages: stages.map(s => s.stageId),
            executionType: 'sequential',
            dependencies: []
        });
        return groups;
    }
    calculateResourceRequirements(stages) {
        return {
            cpuCores: Math.max(1, Math.ceil(stages.length / 4)),
            memoryMb: stages.length * 64,
            maxConnections: stages.length * 2,
            estimatedDuration: stages.length * 1000
        };
    }
    estimateExecutionDuration(stages, _groups) {
        return stages.reduce((total, stage) => total + (stage.timeout || 5000), 0);
    }
    async executeGroup(group, status) {
        for (const stageId of group.stages) {
            status.currentStage = stageId;
            await new Promise(resolve => setTimeout(resolve, 100));
            status.completedStages.push(stageId);
            status.progress.completedStages++;
            status.progress.progressPercentage = (status.progress.completedStages / status.progress.totalStages) * 100;
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.WorkflowScheduler = WorkflowScheduler;

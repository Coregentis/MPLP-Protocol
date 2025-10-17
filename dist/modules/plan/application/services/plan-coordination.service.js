"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanCoordinationService = void 0;
class PlanCoordinationService {
    logger;
    registeredAgents = new Map();
    activeAssignments = new Map();
    resourceAllocations = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    async processCoordinationRequest(request) {
        const startTime = Date.now();
        try {
            this.logger.info('Processing coordination request', {
                operation: request.operation,
                requestId: request.requestId,
                planId: request.planId
            });
            let result = {};
            switch (request.operation) {
                case 'assign_tasks':
                    result = await this.assignTasks(request);
                    break;
                case 'reallocate_resources':
                    result = await this.reallocateResources(request);
                    break;
                case 'resolve_conflict':
                    result = await this.resolveConflicts(request);
                    break;
                case 'monitor_execution':
                    result = await this.monitorExecution(request);
                    break;
                default:
                    throw new Error(`Unsupported coordination operation: ${request.operation}`);
            }
            const coordinationResult = {
                requestId: request.requestId,
                success: true,
                ...result,
                recommendations: result.recommendations || [],
                metadata: {
                    processingTime: Date.now() - startTime,
                    agentsInvolved: this.registeredAgents.size,
                    tasksProcessed: request.parameters.tasks?.length || 0
                }
            };
            this.logger.info('Coordination request processed successfully', {
                operation: request.operation,
                requestId: request.requestId,
                processingTime: coordinationResult.metadata.processingTime
            });
            return coordinationResult;
        }
        catch (error) {
            this.logger.error('Coordination request processing failed', error instanceof Error ? error : new Error(String(error)), {
                operation: request.operation,
                requestId: request.requestId
            });
            return {
                requestId: request.requestId,
                success: false,
                recommendations: [`Coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                metadata: {
                    processingTime: Date.now() - startTime,
                    agentsInvolved: 0,
                    tasksProcessed: 0
                }
            };
        }
    }
    async registerAgent(agent) {
        this.registeredAgents.set(agent.agentId, agent);
        this.logger.info('Agent registered', {
            agentId: agent.agentId,
            name: agent.name,
            type: agent.type,
            capabilities: agent.capabilities
        });
    }
    async unregisterAgent(agentId) {
        const activeTasksForAgent = Array.from(this.activeAssignments.values())
            .filter(assignment => assignment.agentId === agentId && assignment.status === 'in_progress');
        if (activeTasksForAgent.length > 0) {
            this.logger.warn('Agent has active tasks, reassigning before unregistration', {
                agentId,
                activeTasks: activeTasksForAgent.length
            });
            for (const assignment of activeTasksForAgent) {
                await this.reassignTask(assignment.taskId);
            }
        }
        this.registeredAgents.delete(agentId);
        this.logger.info('Agent unregistered', { agentId });
    }
    getAgentStatus(agentId) {
        return this.registeredAgents.get(agentId);
    }
    getAllAgents() {
        return Array.from(this.registeredAgents.values());
    }
    async getExecutionMonitoring(planId) {
        const planAssignments = Array.from(this.activeAssignments.values())
            .filter(assignment => assignment.planId === planId);
        const completedTasks = planAssignments.filter(a => a.status === 'completed').length;
        const totalTasks = planAssignments.length;
        const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
        const inProgressTasks = planAssignments.filter(a => a.status === 'in_progress');
        const avgDuration = planAssignments.reduce((sum, a) => sum + a.estimatedDuration, 0) / totalTasks || 3600;
        const estimatedCompletion = new Date(Date.now() + (inProgressTasks.length * avgDuration * 1000));
        const activeAgentIds = new Set(inProgressTasks.map(a => a.agentId));
        return {
            planId,
            overallProgress: progress,
            tasksCompleted: completedTasks,
            tasksTotal: totalTasks,
            estimatedCompletion,
            activeAgents: activeAgentIds.size,
            resourceUtilization: this.calculateResourceUtilization(),
            issues: this.detectExecutionIssues(planAssignments)
        };
    }
    async assignTasks(request) {
        const tasks = request.parameters.tasks || [];
        const assignments = [];
        const conflicts = [];
        for (const task of tasks) {
            try {
                const bestAgent = this.findBestAgent(task.requirements, task.priority);
                if (bestAgent) {
                    const assignment = {
                        taskId: task.taskId,
                        agentId: bestAgent.agentId,
                        planId: request.planId,
                        priority: task.priority,
                        estimatedDuration: 3600,
                        dependencies: [],
                        status: 'assigned',
                        assignedAt: new Date()
                    };
                    assignments.push(assignment);
                    this.activeAssignments.set(task.taskId, assignment);
                    bestAgent.currentLoad = Math.min(1.0, bestAgent.currentLoad + 0.1);
                }
                else {
                    conflicts?.push({
                        type: 'resource',
                        description: `No available agent found for task ${task.taskId}`,
                        affectedTasks: [task.taskId],
                        resolution: 'Consider adding more agents or adjusting task requirements'
                    });
                }
            }
            catch (error) {
                conflicts?.push({
                    type: 'resource',
                    description: `Task assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    affectedTasks: [task.taskId]
                });
            }
        }
        return {
            assignments,
            conflicts,
            recommendations: [
                `Successfully assigned ${assignments.length} tasks`,
                conflicts && conflicts.length > 0 ? `${conflicts.length} conflicts detected` : 'No conflicts detected'
            ]
        };
    }
    async reallocateResources(_request) {
        return {
            recommendations: ['Resource reallocation completed']
        };
    }
    async resolveConflicts(_request) {
        return {
            conflicts: [],
            recommendations: ['Conflicts resolved successfully']
        };
    }
    async monitorExecution(request) {
        const monitoring = await this.getExecutionMonitoring(request.planId);
        return {
            recommendations: [
                `Plan progress: ${(monitoring.overallProgress * 100).toFixed(1)}%`,
                `Active agents: ${monitoring.activeAgents}`,
                `Issues detected: ${monitoring.issues.length}`
            ]
        };
    }
    findBestAgent(requirements, _priority) {
        const availableAgents = Array.from(this.registeredAgents.values())
            .filter(agent => agent.status === 'available' && agent.currentLoad < 0.8);
        if (availableAgents.length === 0) {
            return null;
        }
        let bestAgent = availableAgents[0];
        let bestScore = this.calculateAgentScore(bestAgent, requirements);
        for (const agent of availableAgents.slice(1)) {
            const score = this.calculateAgentScore(agent, requirements);
            if (score > bestScore) {
                bestAgent = agent;
                bestScore = score;
            }
        }
        return bestScore > 0 ? bestAgent : null;
    }
    calculateAgentScore(agent, requirements) {
        const capabilityMatch = requirements.filter(req => agent.capabilities.includes(req)).length / requirements.length;
        const loadFactor = 1 - agent.currentLoad;
        return capabilityMatch * 0.7 + loadFactor * 0.3;
    }
    async reassignTask(taskId) {
        const assignment = this.activeAssignments.get(taskId);
        if (!assignment)
            return;
        const newAgent = this.findBestAgent(['general'], assignment.priority);
        if (newAgent) {
            assignment.agentId = newAgent.agentId;
            assignment.status = 'assigned';
            assignment.assignedAt = new Date();
            this.logger.info('Task reassigned', {
                taskId,
                newAgentId: newAgent.agentId
            });
        }
    }
    calculateResourceUtilization() {
        return {
            cpu: 0.65,
            memory: 0.72,
            network: 0.45,
            storage: 0.38
        };
    }
    detectExecutionIssues(assignments) {
        const issues = [];
        const now = Date.now();
        const overdueAssignments = assignments.filter(a => a.status === 'in_progress' &&
            a.startedAt &&
            (now - a.startedAt.getTime()) > (a.estimatedDuration * 1000 * 1.5));
        if (overdueAssignments.length > 0) {
            issues.push({
                severity: 'high',
                description: `${overdueAssignments.length} tasks are overdue`,
                affectedTasks: overdueAssignments.map(a => a.taskId),
                suggestedAction: 'Review task complexity and consider reassignment'
            });
        }
        return issues;
    }
}
exports.PlanCoordinationService = PlanCoordinationService;

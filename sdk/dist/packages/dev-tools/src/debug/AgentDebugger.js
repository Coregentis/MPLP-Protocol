"use strict";
/**
 * @fileoverview Agent Debugger - Debug individual agents
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDebugger = void 0;
const events_1 = require("events");
/**
 * Agent debugger for debugging individual agents
 */
class AgentDebugger extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.debuggedAgents = new Map();
        this.isActive = false;
        this.config = config;
    }
    /**
     * Start agent debugging
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.emit('started');
    }
    /**
     * Stop agent debugging
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        this.debuggedAgents.clear();
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Attach debugger to agent
     */
    attachToAgent(agentId) {
        if (!this.debuggedAgents.has(agentId)) {
            const debugInfo = {
                agentId,
                name: `Agent-${agentId}`,
                status: 'idle',
                capabilities: [],
                state: {},
                metrics: {
                    totalActions: 0,
                    successfulActions: 0,
                    failedActions: 0,
                    averageResponseTime: 0
                }
            };
            this.debuggedAgents.set(agentId, debugInfo);
            this.emit('agentAttached', { agentId, debugInfo });
        }
    }
    /**
     * Detach debugger from agent
     */
    detachFromAgent(agentId) {
        if (this.debuggedAgents.has(agentId)) {
            const debugInfo = this.debuggedAgents.get(agentId);
            this.debuggedAgents.delete(agentId);
            this.emit('agentDetached', { agentId, debugInfo });
        }
    }
    /**
     * Get agent debug info
     */
    getAgentInfo(agentId) {
        return this.debuggedAgents.get(agentId);
    }
    /**
     * Get all debugged agents
     */
    getAllAgents() {
        return Array.from(this.debuggedAgents.values());
    }
    /**
     * Update agent state
     */
    updateAgentState(agentId, state) {
        const debugInfo = this.debuggedAgents.get(agentId);
        if (debugInfo) {
            debugInfo.state = { ...debugInfo.state, ...state };
            this.emit('agentStateUpdated', { agentId, state: debugInfo.state });
        }
    }
    /**
     * Record agent action
     */
    recordAction(agentId, action, success, responseTime) {
        const debugInfo = this.debuggedAgents.get(agentId);
        if (debugInfo) {
            debugInfo.currentAction = action;
            debugInfo.metrics.totalActions++;
            if (success) {
                debugInfo.metrics.successfulActions++;
            }
            else {
                debugInfo.metrics.failedActions++;
            }
            // Update average response time
            const totalTime = debugInfo.metrics.averageResponseTime * (debugInfo.metrics.totalActions - 1) + responseTime;
            debugInfo.metrics.averageResponseTime = totalTime / debugInfo.metrics.totalActions;
            this.emit('actionRecorded', { agentId, action, success, responseTime });
        }
    }
    /**
     * Get debugging statistics
     */
    getStatistics() {
        return {
            isActive: this.isActive,
            totalAgents: this.debuggedAgents.size,
            activeAgents: Array.from(this.debuggedAgents.values()).filter(a => a.status === 'running').length,
            totalActions: Array.from(this.debuggedAgents.values()).reduce((sum, a) => sum + a.metrics.totalActions, 0),
            successRate: this.calculateSuccessRate()
        };
    }
    /**
     * Calculate overall success rate
     */
    calculateSuccessRate() {
        const agents = Array.from(this.debuggedAgents.values());
        const totalActions = agents.reduce((sum, a) => sum + a.metrics.totalActions, 0);
        const successfulActions = agents.reduce((sum, a) => sum + a.metrics.successfulActions, 0);
        return totalActions > 0 ? successfulActions / totalActions : 0;
    }
}
exports.AgentDebugger = AgentDebugger;
//# sourceMappingURL=AgentDebugger.js.map
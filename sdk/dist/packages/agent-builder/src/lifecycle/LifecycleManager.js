"use strict";
/**
 * @fileoverview Lifecycle Manager for managing multiple agents - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifecycleManager = void 0;
const MPLPEventManager_1 = require("../core/MPLPEventManager");
const types_1 = require("../types");
const errors_1 = require("../types/errors");
/**
 * Manager for handling multiple agent lifecycles - 基于MPLP V1.0 Alpha事件架构
 */
class LifecycleManager {
    constructor() {
        this.agents = new Map();
        this.agentStartTimes = new Map();
        this._destroyed = false;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
    }
    // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * EventEmitter兼容的off方法
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    /**
     * Add an agent to the lifecycle manager
     */
    addAgent(agent) {
        if (this._destroyed) {
            throw new errors_1.AgentLifecycleError('Cannot add agent to destroyed lifecycle manager');
        }
        if (this.agents.has(agent.id)) {
            throw new errors_1.AgentLifecycleError(`Agent with ID '${agent.id}' is already managed`);
        }
        // Set up event listeners for the agent
        agent.on('started', () => {
            this.agentStartTimes.set(agent.id, new Date());
            this.emit('agent-started', agent);
            // Check if all agents are now running
            if (this._areAllAgentsRunning()) {
                this.emit('all-agents-started');
            }
        });
        agent.on('stopped', () => {
            this.agentStartTimes.delete(agent.id);
            this.emit('agent-stopped', agent);
            // Check if all agents are now stopped
            if (this._areAllAgentsStopped()) {
                this.emit('all-agents-stopped');
            }
        });
        agent.on('error', (error) => {
            this.emit('agent-error', agent, error);
        });
        this.agents.set(agent.id, agent);
        this.emit('agent-added', agent);
    }
    /**
     * Remove an agent from the lifecycle manager
     */
    async removeAgent(agentId) {
        if (this._destroyed) {
            throw new errors_1.AgentLifecycleError('Cannot remove agent from destroyed lifecycle manager');
        }
        const agent = this.agents.get(agentId);
        if (!agent) {
            return false;
        }
        // Stop the agent if it's running
        if (agent.status === types_1.AgentStatus.RUNNING) {
            await agent.stop();
        }
        // Remove event listeners
        agent.removeAllListeners();
        // Remove from maps
        this.agents.delete(agentId);
        this.agentStartTimes.delete(agentId);
        this.emit('agent-removed', agentId);
        return true;
    }
    /**
     * Get an agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * Get all managed agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get agents by status
     */
    getAgentsByStatus(status) {
        return Array.from(this.agents.values()).filter(agent => agent.status === status);
    }
    /**
     * Start all agents
     */
    async startAll() {
        if (this._destroyed) {
            throw new errors_1.AgentLifecycleError('Cannot start agents from destroyed lifecycle manager');
        }
        const agents = Array.from(this.agents.values());
        const errors = [];
        // Start all agents in parallel
        const startPromises = agents.map(async (agent) => {
            try {
                if (agent.status !== types_1.AgentStatus.RUNNING) {
                    await agent.start();
                }
            }
            catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        });
        await Promise.all(startPromises);
        if (errors.length > 0) {
            throw new errors_1.AgentLifecycleError(`Failed to start ${errors.length} agents: ${errors.map(e => e.message).join(', ')}`);
        }
    }
    /**
     * Stop all agents
     */
    async stopAll() {
        if (this._destroyed) {
            return; // Already destroyed
        }
        const agents = Array.from(this.agents.values());
        const errors = [];
        // Stop all agents in parallel
        const stopPromises = agents.map(async (agent) => {
            try {
                if (agent.status === types_1.AgentStatus.RUNNING) {
                    await agent.stop();
                }
            }
            catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        });
        await Promise.all(stopPromises);
        if (errors.length > 0) {
            throw new errors_1.AgentLifecycleError(`Failed to stop ${errors.length} agents: ${errors.map(e => e.message).join(', ')}`);
        }
    }
    /**
     * Restart all agents
     */
    async restartAll() {
        await this.stopAll();
        await this.startAll();
    }
    /**
     * Get lifecycle statistics
     */
    getStats() {
        const agents = Array.from(this.agents.values());
        const runningAgents = agents.filter(a => a.status === types_1.AgentStatus.RUNNING);
        const stoppedAgents = agents.filter(a => a.status === types_1.AgentStatus.STOPPED || a.status === types_1.AgentStatus.IDLE);
        const errorAgents = agents.filter(a => a.status === types_1.AgentStatus.ERROR);
        let totalErrors = 0;
        let totalMessages = 0;
        let earliestStartTime;
        for (const agent of agents) {
            const status = agent.getStatus();
            totalErrors += status.errorCount;
            totalMessages += status.messageCount;
            if (status.startTime && (!earliestStartTime || status.startTime < earliestStartTime)) {
                earliestStartTime = status.startTime;
            }
        }
        return {
            totalAgents: agents.length,
            runningAgents: runningAgents.length,
            stoppedAgents: stoppedAgents.length,
            errorAgents: errorAgents.length,
            totalStartTime: earliestStartTime,
            totalUptime: earliestStartTime ? Date.now() - earliestStartTime.getTime() : undefined,
            totalErrors,
            totalMessages
        };
    }
    /**
     * Check if all agents are running
     */
    areAllAgentsRunning() {
        return this._areAllAgentsRunning();
    }
    /**
     * Check if all agents are stopped
     */
    areAllAgentsStopped() {
        return this._areAllAgentsStopped();
    }
    /**
     * Get the number of managed agents
     */
    size() {
        return this.agents.size;
    }
    /**
     * Check if manager has any agents
     */
    isEmpty() {
        return this.agents.size === 0;
    }
    /**
     * Destroy the lifecycle manager and all managed agents
     */
    async destroy() {
        if (this._destroyed) {
            return; // Already destroyed
        }
        const agents = Array.from(this.agents.values());
        const errors = [];
        // Destroy all agents
        const destroyPromises = agents.map(async (agent) => {
            try {
                await agent.destroy();
            }
            catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        });
        await Promise.all(destroyPromises);
        // Clear all maps
        this.agents.clear();
        this.agentStartTimes.clear();
        // Remove all listeners
        this.removeAllListeners();
        this._destroyed = true;
        if (errors.length > 0) {
            throw new errors_1.AgentLifecycleError(`Failed to destroy ${errors.length} agents: ${errors.map(e => e.message).join(', ')}`);
        }
    }
    /**
     * Check if manager is destroyed
     */
    isDestroyed() {
        return this._destroyed;
    }
    /**
     * Private method to check if all agents are running
     */
    _areAllAgentsRunning() {
        if (this.agents.size === 0) {
            return false;
        }
        return Array.from(this.agents.values()).every(agent => agent.status === types_1.AgentStatus.RUNNING);
    }
    /**
     * Private method to check if all agents are stopped
     */
    _areAllAgentsStopped() {
        if (this.agents.size === 0) {
            return true;
        }
        return Array.from(this.agents.values()).every(agent => agent.status === types_1.AgentStatus.STOPPED || agent.status === types_1.AgentStatus.IDLE);
    }
}
exports.LifecycleManager = LifecycleManager;
//# sourceMappingURL=LifecycleManager.js.map
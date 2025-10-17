/**
 * @fileoverview Agent Debugger - Debug individual agents
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { DebugConfig, AgentDebugInfo } from '../types/debug';
/**
 * Agent debugger for debugging individual agents
 */
export declare class AgentDebugger extends EventEmitter {
    private config;
    private debuggedAgents;
    private isActive;
    constructor(config: DebugConfig);
    /**
     * Start agent debugging
     */
    start(): Promise<void>;
    /**
     * Stop agent debugging
     */
    stop(): Promise<void>;
    /**
     * Attach debugger to agent
     */
    attachToAgent(agentId: string): void;
    /**
     * Detach debugger from agent
     */
    detachFromAgent(agentId: string): void;
    /**
     * Get agent debug info
     */
    getAgentInfo(agentId: string): AgentDebugInfo | undefined;
    /**
     * Get all debugged agents
     */
    getAllAgents(): AgentDebugInfo[];
    /**
     * Update agent state
     */
    updateAgentState(agentId: string, state: any): void;
    /**
     * Record agent action
     */
    recordAction(agentId: string, action: string, success: boolean, responseTime: number): void;
    /**
     * Get debugging statistics
     */
    getStatistics(): any;
    /**
     * Calculate overall success rate
     */
    private calculateSuccessRate;
}
//# sourceMappingURL=AgentDebugger.d.ts.map
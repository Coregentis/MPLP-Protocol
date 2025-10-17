/**
 * @fileoverview Lifecycle Manager for managing multiple agents - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
import { IAgent, AgentStatus } from '../types';
/**
 * Lifecycle events for the manager
 */
export interface LifecycleManagerEvents {
    'agent-added': (agent: IAgent) => void;
    'agent-removed': (agentId: string) => void;
    'agent-started': (agent: IAgent) => void;
    'agent-stopped': (agent: IAgent) => void;
    'agent-error': (agent: IAgent, error: Error) => void;
    'all-agents-started': () => void;
    'all-agents-stopped': () => void;
}
/**
 * Agent lifecycle statistics
 */
export interface LifecycleStats {
    totalAgents: number;
    runningAgents: number;
    stoppedAgents: number;
    errorAgents: number;
    totalStartTime?: Date | undefined;
    totalUptime?: number | undefined;
    totalErrors: number;
    totalMessages: number;
}
/**
 * Manager for handling multiple agent lifecycles - 基于MPLP V1.0 Alpha事件架构
 */
export declare class LifecycleManager {
    private eventManager;
    private readonly agents;
    private readonly agentStartTimes;
    private _destroyed;
    constructor();
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * Add an agent to the lifecycle manager
     */
    addAgent(agent: IAgent): void;
    /**
     * Remove an agent from the lifecycle manager
     */
    removeAgent(agentId: string): Promise<boolean>;
    /**
     * Get an agent by ID
     */
    getAgent(agentId: string): IAgent | undefined;
    /**
     * Get all managed agents
     */
    getAllAgents(): IAgent[];
    /**
     * Get agents by status
     */
    getAgentsByStatus(status: AgentStatus): IAgent[];
    /**
     * Start all agents
     */
    startAll(): Promise<void>;
    /**
     * Stop all agents
     */
    stopAll(): Promise<void>;
    /**
     * Restart all agents
     */
    restartAll(): Promise<void>;
    /**
     * Get lifecycle statistics
     */
    getStats(): LifecycleStats;
    /**
     * Check if all agents are running
     */
    areAllAgentsRunning(): boolean;
    /**
     * Check if all agents are stopped
     */
    areAllAgentsStopped(): boolean;
    /**
     * Get the number of managed agents
     */
    size(): number;
    /**
     * Check if manager has any agents
     */
    isEmpty(): boolean;
    /**
     * Destroy the lifecycle manager and all managed agents
     */
    destroy(): Promise<void>;
    /**
     * Check if manager is destroyed
     */
    isDestroyed(): boolean;
    /**
     * Private method to check if all agents are running
     */
    private _areAllAgentsRunning;
    /**
     * Private method to check if all agents are stopped
     */
    private _areAllAgentsStopped;
}
//# sourceMappingURL=LifecycleManager.d.ts.map
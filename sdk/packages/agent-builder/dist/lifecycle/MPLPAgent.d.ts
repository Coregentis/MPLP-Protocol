/**
 * @fileoverview MPLPAgent implementation with lifecycle management
 * @version 1.1.0-beta
 */
import { EventEmitter } from 'events';
import { IAgent, AgentConfig, AgentStatus, AgentStatusInfo, AgentCapability, IPlatformAdapter } from '../types';
import { PlatformAdapterRegistry } from '../adapters/PlatformAdapterRegistry';
/**
 * MPLP Agent implementation with complete lifecycle management
 */
export declare class MPLPAgent extends EventEmitter implements IAgent {
    readonly id: string;
    readonly name: string;
    readonly capabilities: AgentCapability[];
    private _status;
    private _startTime?;
    private _lastActivity?;
    private _errorCount;
    private _messageCount;
    private _config;
    private _platformAdapter?;
    private readonly _registry;
    private _destroyed;
    constructor(config: AgentConfig, registry?: PlatformAdapterRegistry);
    /**
     * Get current agent status
     */
    get status(): AgentStatus;
    /**
     * Start the agent
     */
    start(): Promise<void>;
    /**
     * Stop the agent
     */
    stop(): Promise<void>;
    /**
     * Get current agent status information
     */
    getStatus(): AgentStatusInfo;
    /**
     * Send a message through the agent
     */
    sendMessage(message: unknown): Promise<void>;
    /**
     * Update agent configuration
     */
    updateConfig(config: Partial<AgentConfig>): Promise<void>;
    /**
     * Cleanup and destroy the agent
     */
    destroy(): Promise<void>;
    /**
     * Check if agent is destroyed
     */
    isDestroyed(): boolean;
    /**
     * Get agent configuration (read-only)
     */
    getConfig(): Readonly<AgentConfig>;
    /**
     * Get platform adapter (if any)
     */
    getPlatformAdapter(): IPlatformAdapter | undefined;
    /**
     * Set agent status and emit event
     */
    private _setStatus;
    /**
     * Initialize platform adapter
     */
    private _initializePlatformAdapter;
    /**
     * Reinitialize platform adapter with new configuration
     */
    private _reinitializePlatformAdapter;
}
//# sourceMappingURL=MPLPAgent.d.ts.map
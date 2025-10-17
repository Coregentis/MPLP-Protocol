/**
 * @fileoverview MPLPAgent implementation with lifecycle management - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
import { IAgent, AgentConfig, AgentStatus, AgentStatusInfo, AgentCapability, IPlatformAdapter } from '../types';
import { PlatformAdapterRegistry } from '../adapters/PlatformAdapterRegistry';
/**
 * MPLP Agent implementation with complete lifecycle management - 基于MPLP V1.0 Alpha事件架构
 */
export declare class MPLPAgent implements IAgent {
    private eventManager;
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
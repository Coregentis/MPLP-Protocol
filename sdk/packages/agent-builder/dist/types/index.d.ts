/**
 * @fileoverview Core type definitions for MPLP Agent Builder
 * @version 1.1.0-beta
 */
import { EventEmitter } from 'events';
/**
 * Agent status enumeration
 */
export declare enum AgentStatus {
    IDLE = "idle",
    STARTING = "starting",
    RUNNING = "running",
    STOPPING = "stopping",
    STOPPED = "stopped",
    ERROR = "error",
    DESTROYED = "destroyed"
}
/**
 * Agent capability types
 */
export type AgentCapability = 'social_media_posting' | 'content_generation' | 'data_analysis' | 'task_automation' | 'communication' | 'monitoring' | 'custom';
/**
 * Platform configuration interface
 */
export interface PlatformConfig {
    [key: string]: unknown;
    apiKey?: string;
    apiSecret?: string;
    token?: string;
    endpoint?: string;
    timeout?: number;
    retries?: number;
}
/**
 * Agent behavior configuration
 */
export interface AgentBehavior extends Record<string, ((data?: unknown) => Promise<void> | void) | undefined> {
    onStart?: (() => Promise<void> | void) | undefined;
    onStop?: (() => Promise<void> | void) | undefined;
    onMessage?: ((message: unknown) => Promise<void> | void) | undefined;
    onMention?: ((mention: unknown) => Promise<void> | void) | undefined;
}
/**
 * Agent configuration interface
 */
export interface AgentConfig {
    id?: string | undefined;
    name: string;
    description?: string | undefined;
    capabilities: AgentCapability[];
    platform?: string | undefined;
    platformConfig?: PlatformConfig | undefined;
    behavior?: AgentBehavior | undefined;
    metadata?: Record<string, unknown> | undefined;
}
/**
 * Agent status information
 */
export interface AgentStatusInfo {
    status: AgentStatus;
    startTime?: Date | undefined;
    uptime?: number | undefined;
    lastActivity?: Date | undefined;
    errorCount: number;
    messageCount: number;
    metadata?: Record<string, unknown> | undefined;
}
/**
 * Platform adapter interface
 */
export interface IPlatformAdapter extends EventEmitter {
    readonly name: string;
    readonly version: string;
    readonly status: 'disconnected' | 'connecting' | 'connected' | 'error';
    /**
     * Initialize the platform adapter
     */
    initialize(config: PlatformConfig): Promise<void>;
    /**
     * Connect to the platform
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the platform
     */
    disconnect(): Promise<void>;
    /**
     * Send a message through the platform
     */
    sendMessage(message: unknown): Promise<void>;
    /**
     * Get current adapter status
     */
    getStatus(): {
        status: string;
        connected: boolean;
        lastActivity?: Date | undefined;
        errorCount: number;
        messageCount: number;
    };
    /**
     * Cleanup resources
     */
    destroy(): Promise<void>;
}
/**
 * Agent interface
 */
export interface IAgent extends EventEmitter {
    readonly id: string;
    readonly name: string;
    readonly capabilities: AgentCapability[];
    readonly status: AgentStatus;
    /**
     * Start the agent
     */
    start(): Promise<void>;
    /**
     * Stop the agent
     */
    stop(): Promise<void>;
    /**
     * Get current agent status
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
}
/**
 * Agent builder interface
 */
export interface IAgentBuilder {
    /**
     * Set agent name
     */
    withName(name: string): IAgentBuilder;
    /**
     * Add agent capability
     */
    withCapability(capability: AgentCapability): IAgentBuilder;
    /**
     * Add multiple capabilities
     */
    withCapabilities(capabilities: AgentCapability[]): IAgentBuilder;
    /**
     * Set platform and configuration
     */
    withPlatform(platform: string, config: PlatformConfig): IAgentBuilder;
    /**
     * Set agent behavior
     */
    withBehavior(behavior: AgentBehavior): IAgentBuilder;
    /**
     * Set agent description
     */
    withDescription(description: string): IAgentBuilder;
    /**
     * Set agent metadata
     */
    withMetadata(metadata: Record<string, unknown>): IAgentBuilder;
    /**
     * Set agent ID
     */
    withId(id: string): IAgentBuilder;
    /**
     * Build and return the agent
     */
    build(): IAgent;
    /**
     * Reset the builder
     */
    reset(): IAgentBuilder;
    /**
     * Get current configuration
     */
    getConfig(): Readonly<Partial<AgentConfig>>;
    /**
     * Clone the builder
     */
    clone(): IAgentBuilder;
}
/**
 * Platform adapter registry interface
 */
export interface IPlatformAdapterRegistry {
    /**
     * Register a platform adapter
     */
    register(name: string, adapterClass: new () => IPlatformAdapter): void;
    /**
     * Get a platform adapter by name
     */
    get(name: string): (new () => IPlatformAdapter) | undefined;
    /**
     * Check if a platform adapter is registered
     */
    has(name: string): boolean;
    /**
     * Get all registered platform names
     */
    getRegisteredPlatforms(): string[];
    /**
     * Unregister a platform adapter
     */
    unregister(name: string): boolean;
}
/**
 * Agent lifecycle events
 */
export interface AgentLifecycleEvents {
    'status-changed': (status: AgentStatus, previousStatus: AgentStatus) => void;
    'started': () => void;
    'stopped': () => void;
    'error': (error: Error) => void;
    'message-sent': (message: unknown) => void;
    'message-received': (message: unknown) => void;
    'destroyed': () => void;
}
/**
 * Platform adapter events
 */
export interface PlatformAdapterEvents {
    'connected': () => void;
    'disconnected': () => void;
    'message': (message: unknown) => void;
    'error': (error: Error) => void;
    'status-changed': (status: string) => void;
}
//# sourceMappingURL=index.d.ts.map
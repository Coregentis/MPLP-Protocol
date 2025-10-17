/**
 * @fileoverview AgentBuilder implementation with fluent API
 * @version 1.1.0-beta
 */
import { IAgentBuilder, IAgent, AgentConfig, AgentCapability, PlatformConfig, AgentBehavior } from '../types';
import { PlatformAdapterRegistry } from '../adapters/PlatformAdapterRegistry';
/**
 * Fluent API builder for creating MPLP agents
 */
export declare class AgentBuilder implements IAgentBuilder {
    private config;
    private readonly registry;
    constructor(name?: string, registry?: PlatformAdapterRegistry);
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
     * Set agent ID (optional, will be auto-generated if not provided)
     */
    withId(id: string): IAgentBuilder;
    /**
     * Build and return the agent
     */
    build(): IAgent;
    /**
     * Reset the builder to initial state
     */
    reset(): IAgentBuilder;
    /**
     * Get current configuration (for debugging)
     */
    getConfig(): Readonly<Partial<AgentConfig>>;
    /**
     * Create a new builder instance with the same registry
     */
    clone(): IAgentBuilder;
    /**
     * Static factory method to create a new builder
     */
    static create(name?: string): IAgentBuilder;
    /**
     * Static factory method to create a new builder with custom registry
     */
    static createWithRegistry(registry: PlatformAdapterRegistry, name?: string): IAgentBuilder;
}
//# sourceMappingURL=AgentBuilder.d.ts.map
/**
 * @fileoverview AgentBuilder implementation with fluent API
 * @version 1.1.0-beta
 */

import { 
  IAgentBuilder, 
  IAgent, 
  AgentConfig, 
  AgentCapability, 
  PlatformConfig, 
  AgentBehavior 
} from '../types';
import { 
  AgentConfigurationError, 
  AgentBuildError, 
  PlatformAdapterNotFoundError 
} from '../types/errors';
import { 
  generateAgentId, 
  validateAgentConfig, 
  validatePlatformConfig, 
  deepClone 
} from '../utils';
import { MPLPAgent } from '../lifecycle/MPLPAgent';
import { PlatformAdapterRegistry } from '../adapters/PlatformAdapterRegistry';

/**
 * Fluent API builder for creating MPLP agents
 */
export class AgentBuilder implements IAgentBuilder {
  private config: Partial<AgentConfig> = {
    capabilities: []
  };

  private readonly registry: PlatformAdapterRegistry;

  constructor(name?: string, registry?: PlatformAdapterRegistry) {
    if (name) {
      this.config.name = name;
    }
    this.registry = registry || PlatformAdapterRegistry.getInstance();
  }

  /**
   * Set agent name
   */
  public withName(name: string): IAgentBuilder {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new AgentConfigurationError('Agent name must be a non-empty string');
    }

    this.config.name = name.trim();
    return this;
  }

  /**
   * Add agent capability
   */
  public withCapability(capability: AgentCapability): IAgentBuilder {
    if (!this.config.capabilities) {
      this.config.capabilities = [];
    }

    if (!this.config.capabilities.includes(capability)) {
      this.config.capabilities.push(capability);
    }

    return this;
  }

  /**
   * Add multiple capabilities
   */
  public withCapabilities(capabilities: AgentCapability[]): IAgentBuilder {
    if (!Array.isArray(capabilities)) {
      throw new AgentConfigurationError('Capabilities must be an array');
    }

    for (const capability of capabilities) {
      this.withCapability(capability);
    }

    return this;
  }

  /**
   * Set platform and configuration
   */
  public withPlatform(platform: string, config: PlatformConfig): IAgentBuilder {
    validatePlatformConfig(platform, config);

    // Check if platform adapter is registered
    if (!this.registry.has(platform)) {
      throw new PlatformAdapterNotFoundError(platform);
    }

    this.config.platform = platform;
    this.config.platformConfig = deepClone(config);
    return this;
  }

  /**
   * Set agent behavior
   */
  public withBehavior(behavior: AgentBehavior): IAgentBuilder {
    if (!behavior || typeof behavior !== 'object') {
      throw new AgentConfigurationError('Agent behavior must be an object');
    }

    this.config.behavior = { ...this.config.behavior, ...behavior };
    return this;
  }

  /**
   * Set agent description
   */
  public withDescription(description: string): IAgentBuilder {
    if (typeof description !== 'string') {
      throw new AgentConfigurationError('Agent description must be a string');
    }

    this.config.description = description;
    return this;
  }

  /**
   * Set agent metadata
   */
  public withMetadata(metadata: Record<string, unknown>): IAgentBuilder {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new AgentConfigurationError('Agent metadata must be an object');
    }

    this.config.metadata = { ...this.config.metadata, ...metadata };
    return this;
  }

  /**
   * Set agent ID (optional, will be auto-generated if not provided)
   */
  public withId(id: string): IAgentBuilder {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new AgentConfigurationError('Agent ID must be a non-empty string');
    }

    this.config.id = id.trim();
    return this;
  }

  /**
   * Build and return the agent
   */
  public build(): IAgent {
    try {
      // Ensure required fields are set
      if (!this.config.name) {
        throw new AgentBuildError('Agent name is required. Use withName() to set it.');
      }

      if (!this.config.capabilities || this.config.capabilities.length === 0) {
        throw new AgentBuildError('Agent must have at least one capability. Use withCapability() to add capabilities.');
      }

      // Generate ID if not provided
      if (!this.config.id) {
        this.config.id = generateAgentId();
      }

      // Create complete config
      const completeConfig: AgentConfig = {
        id: this.config.id,
        name: this.config.name,
        description: this.config.description,
        capabilities: [...this.config.capabilities],
        platform: this.config.platform,
        platformConfig: this.config.platformConfig ? deepClone(this.config.platformConfig) : undefined,
        behavior: this.config.behavior ? { ...this.config.behavior } : undefined,
        metadata: this.config.metadata ? { ...this.config.metadata } : undefined
      };

      // Validate the complete configuration
      validateAgentConfig(completeConfig);

      // Create and return the agent
      return new MPLPAgent(completeConfig, this.registry);

    } catch (error) {
      if (error instanceof AgentConfigurationError || error instanceof AgentBuildError) {
        throw error;
      }
      throw new AgentBuildError(
        `Failed to build agent: ${error instanceof Error ? error.message : String(error)}`,
        { originalError: error }
      );
    }
  }

  /**
   * Reset the builder to initial state
   */
  public reset(): IAgentBuilder {
    this.config = {
      capabilities: []
    };
    return this;
  }

  /**
   * Get current configuration (for debugging)
   */
  public getConfig(): Readonly<Partial<AgentConfig>> {
    return deepClone(this.config);
  }

  /**
   * Create a new builder instance with the same registry
   */
  public clone(): IAgentBuilder {
    const newBuilder = new AgentBuilder(undefined, this.registry);
    newBuilder.config = deepClone(this.config);
    return newBuilder;
  }

  /**
   * Static factory method to create a new builder
   */
  public static create(name?: string): IAgentBuilder {
    return new AgentBuilder(name);
  }

  /**
   * Static factory method to create a new builder with custom registry
   */
  public static createWithRegistry(registry: PlatformAdapterRegistry, name?: string): IAgentBuilder {
    return new AgentBuilder(name, registry);
  }
}

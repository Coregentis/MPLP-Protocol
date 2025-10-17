"use strict";
/**
 * @fileoverview AgentBuilder implementation with fluent API
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBuilder = void 0;
const errors_1 = require("../types/errors");
const utils_1 = require("../utils");
const MPLPAgent_1 = require("../lifecycle/MPLPAgent");
const PlatformAdapterRegistry_1 = require("../adapters/PlatformAdapterRegistry");
/**
 * Fluent API builder for creating MPLP agents
 */
class AgentBuilder {
    config = {
        capabilities: []
    };
    registry;
    constructor(name, registry) {
        if (name) {
            this.config.name = name;
        }
        this.registry = registry || PlatformAdapterRegistry_1.PlatformAdapterRegistry.getInstance();
    }
    /**
     * Set agent name
     */
    withName(name) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new errors_1.AgentConfigurationError('Agent name must be a non-empty string');
        }
        this.config.name = name.trim();
        return this;
    }
    /**
     * Add agent capability
     */
    withCapability(capability) {
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
    withCapabilities(capabilities) {
        if (!Array.isArray(capabilities)) {
            throw new errors_1.AgentConfigurationError('Capabilities must be an array');
        }
        for (const capability of capabilities) {
            this.withCapability(capability);
        }
        return this;
    }
    /**
     * Set platform and configuration
     */
    withPlatform(platform, config) {
        (0, utils_1.validatePlatformConfig)(platform, config);
        // Check if platform adapter is registered
        if (!this.registry.has(platform)) {
            throw new errors_1.PlatformAdapterNotFoundError(platform);
        }
        this.config.platform = platform;
        this.config.platformConfig = (0, utils_1.deepClone)(config);
        return this;
    }
    /**
     * Set agent behavior
     */
    withBehavior(behavior) {
        if (!behavior || typeof behavior !== 'object') {
            throw new errors_1.AgentConfigurationError('Agent behavior must be an object');
        }
        this.config.behavior = { ...this.config.behavior, ...behavior };
        return this;
    }
    /**
     * Set agent description
     */
    withDescription(description) {
        if (typeof description !== 'string') {
            throw new errors_1.AgentConfigurationError('Agent description must be a string');
        }
        this.config.description = description;
        return this;
    }
    /**
     * Set agent metadata
     */
    withMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            throw new errors_1.AgentConfigurationError('Agent metadata must be an object');
        }
        this.config.metadata = { ...this.config.metadata, ...metadata };
        return this;
    }
    /**
     * Set agent ID (optional, will be auto-generated if not provided)
     */
    withId(id) {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new errors_1.AgentConfigurationError('Agent ID must be a non-empty string');
        }
        this.config.id = id.trim();
        return this;
    }
    /**
     * Build and return the agent
     */
    build() {
        try {
            // Ensure required fields are set
            if (!this.config.name) {
                throw new errors_1.AgentBuildError('Agent name is required. Use withName() to set it.');
            }
            if (!this.config.capabilities || this.config.capabilities.length === 0) {
                throw new errors_1.AgentBuildError('Agent must have at least one capability. Use withCapability() to add capabilities.');
            }
            // Generate ID if not provided
            if (!this.config.id) {
                this.config.id = (0, utils_1.generateAgentId)();
            }
            // Create complete config
            const completeConfig = {
                id: this.config.id,
                name: this.config.name,
                description: this.config.description,
                capabilities: [...this.config.capabilities],
                platform: this.config.platform,
                platformConfig: this.config.platformConfig ? (0, utils_1.deepClone)(this.config.platformConfig) : undefined,
                behavior: this.config.behavior ? { ...this.config.behavior } : undefined,
                metadata: this.config.metadata ? { ...this.config.metadata } : undefined
            };
            // Validate the complete configuration
            (0, utils_1.validateAgentConfig)(completeConfig);
            // Create and return the agent
            return new MPLPAgent_1.MPLPAgent(completeConfig, this.registry);
        }
        catch (error) {
            if (error instanceof errors_1.AgentConfigurationError || error instanceof errors_1.AgentBuildError) {
                throw error;
            }
            throw new errors_1.AgentBuildError(`Failed to build agent: ${error instanceof Error ? error.message : String(error)}`, { originalError: error });
        }
    }
    /**
     * Reset the builder to initial state
     */
    reset() {
        this.config = {
            capabilities: []
        };
        return this;
    }
    /**
     * Get current configuration (for debugging)
     */
    getConfig() {
        return (0, utils_1.deepClone)(this.config);
    }
    /**
     * Create a new builder instance with the same registry
     */
    clone() {
        const newBuilder = new AgentBuilder(undefined, this.registry);
        newBuilder.config = (0, utils_1.deepClone)(this.config);
        return newBuilder;
    }
    /**
     * Static factory method to create a new builder
     */
    static create(name) {
        return new AgentBuilder(name);
    }
    /**
     * Static factory method to create a new builder with custom registry
     */
    static createWithRegistry(registry, name) {
        return new AgentBuilder(name, registry);
    }
}
exports.AgentBuilder = AgentBuilder;
//# sourceMappingURL=AgentBuilder.js.map
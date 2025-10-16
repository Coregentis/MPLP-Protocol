# @mplp/agent-builder API Reference

## Overview

The `@mplp/agent-builder` package provides a fluent API for building and managing intelligent agents with platform adapter support and lifecycle management.

## Core Classes

### AgentBuilder

The main class for building agent configurations using a fluent API pattern.

#### Constructor

```typescript
constructor(registry?: PlatformAdapterRegistry)
```

#### Methods

##### `withName(name: string): IAgentBuilder`
Sets the agent name.

**Parameters:**
- `name` - The agent name (must be non-empty string)

**Returns:** The builder instance for chaining

**Example:**
```typescript
const builder = new AgentBuilder().withName('MyBot');
```

##### `withCapability(capability: AgentCapability): IAgentBuilder`
Adds a single capability to the agent.

**Parameters:**
- `capability` - The capability to add

**Returns:** The builder instance for chaining

##### `withCapabilities(capabilities: AgentCapability[]): IAgentBuilder`
Adds multiple capabilities to the agent.

**Parameters:**
- `capabilities` - Array of capabilities to add

**Returns:** The builder instance for chaining

##### `withPlatform(platform: string, config: Record<string, unknown>): IAgentBuilder`
Configures the platform adapter for the agent.

**Parameters:**
- `platform` - Platform name (must be registered)
- `config` - Platform-specific configuration

**Returns:** The builder instance for chaining

##### `withBehavior(behavior: AgentBehavior): IAgentBuilder`
Sets the agent behavior handlers.

**Parameters:**
- `behavior` - Object containing behavior handlers

**Returns:** The builder instance for chaining

##### `withMetadata(metadata: Record<string, unknown>): IAgentBuilder`
Sets agent metadata.

**Parameters:**
- `metadata` - Metadata object

**Returns:** The builder instance for chaining

##### `build(): IAgent`
Builds and returns the configured agent instance.

**Returns:** The configured agent

**Throws:** `AgentConfigurationError` if configuration is invalid

#### Static Methods

##### `create(): AgentBuilder`
Creates a new builder instance with default registry.

##### `createWithRegistry(registry: PlatformAdapterRegistry): AgentBuilder`
Creates a new builder instance with custom registry.

### MPLPAgent

The main agent implementation providing lifecycle management and platform integration.

#### Properties

- `id: string` - Unique agent identifier
- `name: string` - Agent name
- `status: AgentStatus` - Current agent status

#### Methods

##### `start(): Promise<void>`
Starts the agent and initializes platform adapter if configured.

##### `stop(): Promise<void>`
Stops the agent and disconnects platform adapter.

##### `destroy(): Promise<void>`
Destroys the agent and cleans up all resources.

##### `sendMessage(message: unknown): Promise<void>`
Sends a message through the platform adapter.

##### `getStatus(): AgentStatusInfo`
Returns detailed status information.

##### `getConfig(): Readonly<AgentConfig>`
Returns read-only agent configuration.

##### `updateConfig(config: Partial<AgentConfig>): Promise<void>`
Updates agent configuration (excluding name and id).

##### `isDestroyed(): boolean`
Checks if agent is destroyed.

#### Events

The agent emits the following events:

- `started` - Agent has started
- `stopped` - Agent has stopped
- `destroyed` - Agent has been destroyed
- `error` - An error occurred
- `message` - Message received from platform
- `statusChanged` - Agent status changed

### PlatformAdapterRegistry

Singleton registry for managing platform adapters.

#### Methods

##### `getInstance(): PlatformAdapterRegistry`
Gets the singleton instance.

##### `register(name: string, adapterClass: new () => IPlatformAdapter): void`
Registers a platform adapter.

##### `create(name: string, config?: Record<string, unknown>): IPlatformAdapter`
Creates an adapter instance.

##### `has(name: string): boolean`
Checks if adapter is registered.

##### `getRegisteredPlatforms(): string[]`
Gets list of registered platform names.

##### `unregister(name: string): boolean`
Unregisters a platform adapter.

##### `clear(): void`
Clears all registered adapters.

## Interfaces

### IAgent

Core agent interface defining the contract for all agents.

```typescript
interface IAgent extends EventEmitter {
  readonly id: string;
  readonly name: string;
  readonly status: AgentStatus;
  
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  sendMessage(message: unknown): Promise<void>;
  getStatus(): AgentStatusInfo;
  getConfig(): Readonly<AgentConfig>;
  updateConfig(config: Partial<AgentConfig>): Promise<void>;
  isDestroyed(): boolean;
}
```

### IPlatformAdapter

Interface for platform adapters.

```typescript
interface IPlatformAdapter extends EventEmitter {
  readonly name: string;
  
  connect(config: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(message: unknown): Promise<void>;
  destroy(): Promise<void>;
  getStatus(): {
    status: string;
    connected: boolean;
    lastActivity?: Date | undefined;
    errorCount: number;
    messageCount: number;
  };
}
```

## Types

### AgentStatus

```typescript
enum AgentStatus {
  IDLE = 'idle',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}
```

### AgentCapability

```typescript
enum AgentCapability {
  TEXT_PROCESSING = 'text_processing',
  IMAGE_PROCESSING = 'image_processing',
  VOICE_PROCESSING = 'voice_processing',
  SOCIAL_MEDIA = 'social_media',
  WEB_SCRAPING = 'web_scraping',
  API_INTEGRATION = 'api_integration',
  DATABASE_ACCESS = 'database_access',
  FILE_PROCESSING = 'file_processing',
  SCHEDULING = 'scheduling',
  NOTIFICATION = 'notification'
}
```

### AgentConfig

```typescript
interface AgentConfig {
  id?: string | undefined;
  name: string;
  capabilities: AgentCapability[];
  platform?: string | undefined;
  platformConfig?: Record<string, unknown> | undefined;
  behavior?: AgentBehavior | undefined;
  metadata?: Record<string, unknown> | undefined;
}
```

### AgentBehavior

```typescript
interface AgentBehavior extends Record<string, ((data?: unknown) => Promise<void> | void) | undefined> {
  onStart?: (() => Promise<void> | void) | undefined;
  onStop?: (() => Promise<void> | void) | undefined;
  onMessage?: ((message: unknown) => Promise<void> | void) | undefined;
  onMention?: ((mention: unknown) => Promise<void> | void) | undefined;
}
```

## Error Types

### AgentBuilderError
Base error class for all agent builder errors.

### AgentConfigurationError
Thrown when agent configuration is invalid.

### AgentLifecycleError
Thrown when agent lifecycle operations fail.

### AgentStateError
Thrown when operations are performed on agents in invalid states.

### PlatformAdapterError
Base error class for platform adapter errors.

### PlatformAdapterNotFoundError
Thrown when requested platform adapter is not registered.

### PlatformAdapterRegistrationError
Thrown when platform adapter registration fails.

### PlatformConnectionError
Thrown when platform connection operations fail.

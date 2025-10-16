# @mplp/agent-builder Best Practices

## Agent Design Principles

### 1. Single Responsibility Principle

Design agents with a clear, focused purpose. Each agent should have a well-defined role and set of capabilities.

```typescript
// ✅ Good: Focused agent
const textProcessor = new AgentBuilder()
  .withName('TextAnalyzer')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .build();

// ❌ Avoid: Overly broad agent
const everythingAgent = new AgentBuilder()
  .withName('DoEverything')
  .withCapabilities([
    AgentCapability.TEXT_PROCESSING,
    AgentCapability.IMAGE_PROCESSING,
    AgentCapability.DATABASE_ACCESS,
    AgentCapability.WEB_SCRAPING,
    // ... too many capabilities
  ])
  .build();
```

### 2. Proper Error Handling

Always implement comprehensive error handling for agent operations.

```typescript
// ✅ Good: Proper error handling
const agent = new AgentBuilder()
  .withName('RobustAgent')
  .withCapability(AgentCapability.API_INTEGRATION)
  .withBehavior({
    onStart: async () => {
      try {
        // Initialization logic
        await initializeResources();
      } catch (error) {
        console.error('Failed to initialize:', error);
        throw new AgentLifecycleError('Initialization failed', { originalError: error });
      }
    },
    onMessage: async (message) => {
      try {
        await processMessage(message);
      } catch (error) {
        console.error('Message processing failed:', error);
        // Don't throw here to avoid stopping the agent
      }
    }
  })
  .build();
```

### 3. Resource Management

Properly manage resources and ensure cleanup on agent destruction.

```typescript
// ✅ Good: Resource cleanup
const agent = new AgentBuilder()
  .withName('ResourceAwareAgent')
  .withCapability(AgentCapability.DATABASE_ACCESS)
  .withBehavior({
    onStart: async () => {
      // Acquire resources
      this.dbConnection = await createDatabaseConnection();
      this.fileWatcher = createFileWatcher();
    },
    onStop: async () => {
      // Clean up resources
      if (this.dbConnection) {
        await this.dbConnection.close();
      }
      if (this.fileWatcher) {
        this.fileWatcher.close();
      }
    }
  })
  .build();
```

## Platform Adapter Best Practices

### 1. Implement Proper Connection Management

```typescript
class RobustPlatformAdapter extends BasePlatformAdapter {
  private connectionRetries = 0;
  private maxRetries = 3;
  private reconnectDelay = 5000;

  async connect(config: Record<string, unknown>): Promise<void> {
    try {
      await this.establishConnection(config);
      this.connectionRetries = 0;
      this._connected = true;
      this.emit('connected');
    } catch (error) {
      this.connectionRetries++;
      if (this.connectionRetries < this.maxRetries) {
        setTimeout(() => this.connect(config), this.reconnectDelay);
      } else {
        throw new PlatformConnectionError('Max connection retries exceeded');
      }
    }
  }

  async sendMessage(message: unknown): Promise<void> {
    if (!this._connected) {
      throw new PlatformConnectionError('Not connected to platform');
    }

    try {
      await this.doSendMessage(message);
      this._messageCount++;
      this._lastActivity = new Date();
    } catch (error) {
      this._errorCount++;
      if (this.isConnectionError(error)) {
        this._connected = false;
        this.emit('disconnected');
      }
      throw error;
    }
  }
}
```

### 2. Use Configuration Validation

```typescript
class ValidatingAdapter extends BasePlatformAdapter {
  async connect(config: Record<string, unknown>): Promise<void> {
    // Validate required configuration
    const requiredFields = ['apiKey', 'apiSecret', 'baseUrl'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new PlatformConnectionError(`Missing required field: ${field}`);
      }
    }

    // Validate field types
    if (typeof config.apiKey !== 'string') {
      throw new PlatformConnectionError('apiKey must be a string');
    }

    // Proceed with connection
    await this.establishConnection(config);
  }
}
```

## Testing Best Practices

### 1. Use Test Registries

Always use isolated test registries to avoid interference between tests.

```typescript
describe('Agent Tests', () => {
  let testRegistry: PlatformAdapterRegistry;

  beforeEach(() => {
    // Create isolated test registry
    testRegistry = PlatformAdapterRegistry.createTestInstance();
    testRegistry.register('mock', MockPlatformAdapter);
  });

  afterEach(() => {
    // Clean up
    testRegistry.clear();
  });

  it('should work with test registry', async () => {
    const agent = AgentBuilder.createWithRegistry(testRegistry)
      .withName('TestAgent')
      .withCapability(AgentCapability.TEXT_PROCESSING)
      .withPlatform('mock', {})
      .build();

    await agent.start();
    // ... test logic
    await agent.destroy();
  });
});
```

### 2. Test Agent Lifecycle

```typescript
describe('Agent Lifecycle', () => {
  it('should handle complete lifecycle', async () => {
    const agent = new AgentBuilder()
      .withName('LifecycleTestAgent')
      .withCapability(AgentCapability.TEXT_PROCESSING)
      .build();

    // Test initial state
    expect(agent.status).toBe(AgentStatus.IDLE);

    // Test start
    await agent.start();
    expect(agent.status).toBe(AgentStatus.RUNNING);

    // Test stop
    await agent.stop();
    expect(agent.status).toBe(AgentStatus.STOPPED);

    // Test destroy
    await agent.destroy();
    expect(agent.status).toBe(AgentStatus.DESTROYED);
    expect(agent.isDestroyed()).toBe(true);
  });
});
```

### 3. Test Error Conditions

```typescript
describe('Error Handling', () => {
  it('should handle configuration errors', () => {
    expect(() => {
      new AgentBuilder()
        .withName('') // Invalid name
        .build();
    }).toThrow(AgentConfigurationError);
  });

  it('should handle platform errors', async () => {
    const agent = new AgentBuilder()
      .withName('ErrorTestAgent')
      .withCapability(AgentCapability.TEXT_PROCESSING)
      .withPlatform('nonexistent', {})
      .build();

    await expect(agent.start()).rejects.toThrow(PlatformAdapterNotFoundError);
  });
});
```

## Performance Optimization

### 1. Efficient Event Handling

```typescript
// ✅ Good: Efficient event handling
const agent = new AgentBuilder()
  .withName('EfficientAgent')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .build();

// Use specific event handlers
agent.on('message', handleMessage);
agent.on('error', handleError);

// ❌ Avoid: Generic event handling
agent.on('*', (event, ...args) => {
  // This creates overhead for all events
  switch (event) {
    case 'message': handleMessage(...args); break;
    case 'error': handleError(...args); break;
  }
});
```

### 2. Batch Operations

```typescript
// ✅ Good: Batch message sending
async function sendBatchMessages(agent: IAgent, messages: unknown[]) {
  const promises = messages.map(message => agent.sendMessage(message));
  await Promise.all(promises);
}

// ❌ Avoid: Sequential message sending
async function sendSequentialMessages(agent: IAgent, messages: unknown[]) {
  for (const message of messages) {
    await agent.sendMessage(message); // Inefficient
  }
}
```

## Security Considerations

### 1. Secure Configuration

```typescript
// ✅ Good: Secure configuration handling
const agent = new AgentBuilder()
  .withName('SecureAgent')
  .withCapability(AgentCapability.API_INTEGRATION)
  .withPlatform('secure-platform', {
    apiKey: process.env.API_KEY, // Use environment variables
    timeout: 30000,
    retries: 3
  })
  .build();

// ❌ Avoid: Hardcoded secrets
const insecureAgent = new AgentBuilder()
  .withName('InsecureAgent')
  .withPlatform('platform', {
    apiKey: 'hardcoded-secret-key', // Never do this
  })
  .build();
```

### 2. Input Validation

```typescript
const agent = new AgentBuilder()
  .withName('ValidatingAgent')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .withBehavior({
    onMessage: async (message) => {
      // Validate input
      if (!message || typeof message !== 'string') {
        console.warn('Invalid message received:', message);
        return;
      }

      // Sanitize input
      const sanitizedMessage = sanitizeInput(message);
      
      // Process safely
      await processMessage(sanitizedMessage);
    }
  })
  .build();
```

## Monitoring and Observability

### 1. Status Monitoring

```typescript
class MonitoredAgent {
  private agent: IAgent;
  private statusInterval?: NodeJS.Timeout;

  constructor(agent: IAgent) {
    this.agent = agent;
    this.setupMonitoring();
  }

  private setupMonitoring() {
    // Monitor status periodically
    this.statusInterval = setInterval(() => {
      const status = this.agent.getStatus();
      
      // Log metrics
      console.log('Agent Metrics:', {
        name: this.agent.name,
        status: status.status,
        uptime: status.uptime,
        errorCount: status.errorCount,
        messageCount: status.messageCount
      });

      // Alert on high error rate
      if (status.errorCount > 10) {
        console.warn(`High error count for agent ${this.agent.name}`);
      }
    }, 60000); // Every minute
  }

  destroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }
}
```

### 2. Structured Logging

```typescript
import { createLogger } from 'winston';

const logger = createLogger({
  // Configure structured logging
});

const agent = new AgentBuilder()
  .withName('LoggedAgent')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .withBehavior({
    onStart: async () => {
      logger.info('Agent starting', { 
        agentId: agent.id, 
        agentName: agent.name 
      });
    },
    onMessage: async (message) => {
      logger.info('Message received', { 
        agentId: agent.id, 
        messageType: typeof message 
      });
    },
    onError: async (error) => {
      logger.error('Agent error', { 
        agentId: agent.id, 
        error: error.message,
        stack: error.stack 
      });
    }
  })
  .build();
```

## Common Pitfalls to Avoid

### 1. Memory Leaks

```typescript
// ❌ Avoid: Not removing event listeners
const agent = new AgentBuilder().withName('LeakyAgent').build();
agent.on('message', handleMessage); // Never removed

// ✅ Good: Proper cleanup
const agent = new AgentBuilder().withName('CleanAgent').build();
const messageHandler = handleMessage;
agent.on('message', messageHandler);

// Later, when done:
agent.off('message', messageHandler);
await agent.destroy();
```

### 2. Blocking Operations

```typescript
// ❌ Avoid: Blocking operations in event handlers
const agent = new AgentBuilder()
  .withBehavior({
    onMessage: (message) => {
      // Synchronous blocking operation
      const result = heavyComputationSync(message);
      return result;
    }
  })
  .build();

// ✅ Good: Async operations
const agent = new AgentBuilder()
  .withBehavior({
    onMessage: async (message) => {
      // Non-blocking async operation
      const result = await heavyComputationAsync(message);
      return result;
    }
  })
  .build();
```

### 3. Improper State Management

```typescript
// ❌ Avoid: Operating on destroyed agents
const agent = new AgentBuilder().withName('StateAgent').build();
await agent.destroy();
await agent.start(); // This will throw an error

// ✅ Good: Check agent state
if (!agent.isDestroyed()) {
  await agent.start();
}
```

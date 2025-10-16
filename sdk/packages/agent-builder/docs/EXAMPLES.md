# @mplp/agent-builder Examples

## Basic Usage

### Creating a Simple Agent

```typescript
import { AgentBuilder, AgentCapability } from '@mplp/agent-builder';

// Create a basic text processing agent
const agent = new AgentBuilder()
  .withName('TextProcessor')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .build();

// Start the agent
await agent.start();

console.log(`Agent ${agent.name} is now ${agent.status}`);
```

### Agent with Multiple Capabilities

```typescript
import { AgentBuilder, AgentCapability } from '@mplp/agent-builder';

const multiCapabilityAgent = new AgentBuilder()
  .withName('MultiBot')
  .withCapabilities([
    AgentCapability.TEXT_PROCESSING,
    AgentCapability.IMAGE_PROCESSING,
    AgentCapability.API_INTEGRATION
  ])
  .withMetadata({
    version: '1.0.0',
    author: 'MPLP Team'
  })
  .build();

await multiCapabilityAgent.start();
```

## Platform Integration

### Creating a Platform Adapter

```typescript
import { BasePlatformAdapter, IPlatformAdapter } from '@mplp/agent-builder';

class TwitterAdapter extends BasePlatformAdapter implements IPlatformAdapter {
  public readonly name = 'twitter';

  async connect(config: Record<string, unknown>): Promise<void> {
    // Implement Twitter API connection
    const { apiKey, apiSecret } = config;
    // ... connection logic
    this._connected = true;
    this.emit('connected');
  }

  async sendMessage(message: unknown): Promise<void> {
    if (!this._connected) {
      throw new Error('Not connected to Twitter');
    }
    
    // Send tweet
    console.log('Sending tweet:', message);
    this._messageCount++;
    this._lastActivity = new Date();
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this.emit('disconnected');
  }
}
```

### Registering and Using Platform Adapter

```typescript
import { PlatformAdapterRegistry, AgentBuilder, AgentCapability } from '@mplp/agent-builder';

// Register the Twitter adapter
const registry = PlatformAdapterRegistry.getInstance();
registry.register('twitter', TwitterAdapter);

// Create agent with Twitter platform
const twitterBot = new AgentBuilder()
  .withName('TwitterBot')
  .withCapability(AgentCapability.SOCIAL_MEDIA)
  .withPlatform('twitter', {
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret'
  })
  .build();

await twitterBot.start();
await twitterBot.sendMessage('Hello from MPLP!');
```

## Behavior Handling

### Agent with Custom Behaviors

```typescript
import { AgentBuilder, AgentCapability } from '@mplp/agent-builder';

const behaviorAgent = new AgentBuilder()
  .withName('BehaviorBot')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .withBehavior({
    onStart: async () => {
      console.log('Agent is starting up...');
    },
    onStop: async () => {
      console.log('Agent is shutting down...');
    },
    onMessage: async (message) => {
      console.log('Received message:', message);
      // Process the message
    },
    onMention: async (mention) => {
      console.log('Agent was mentioned:', mention);
      // Handle mention
    }
  })
  .build();

await behaviorAgent.start();
```

## Event Handling

### Listening to Agent Events

```typescript
import { AgentBuilder, AgentCapability, AgentStatus } from '@mplp/agent-builder';

const agent = new AgentBuilder()
  .withName('EventAgent')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .build();

// Listen to agent events
agent.on('started', () => {
  console.log('Agent has started');
});

agent.on('stopped', () => {
  console.log('Agent has stopped');
});

agent.on('error', (error) => {
  console.error('Agent error:', error);
});

agent.on('statusChanged', (oldStatus, newStatus) => {
  console.log(`Status changed from ${oldStatus} to ${newStatus}`);
});

await agent.start();
```

## Advanced Usage

### Custom Registry and Multiple Agents

```typescript
import { 
  PlatformAdapterRegistry, 
  AgentBuilder, 
  AgentCapability,
  MockPlatformAdapter 
} from '@mplp/agent-builder';

// Create custom registry
const customRegistry = PlatformAdapterRegistry.createTestInstance();
customRegistry.register('mock', MockPlatformAdapter);

// Create multiple agents with custom registry
const agents = [];

for (let i = 0; i < 3; i++) {
  const agent = AgentBuilder.createWithRegistry(customRegistry)
    .withName(`Agent-${i}`)
    .withCapability(AgentCapability.TEXT_PROCESSING)
    .withPlatform('mock', { id: i })
    .build();
  
  agents.push(agent);
}

// Start all agents
await Promise.all(agents.map(agent => agent.start()));

// Send messages through all agents
for (const agent of agents) {
  await agent.sendMessage(`Hello from ${agent.name}`);
}
```

### Agent Configuration Updates

```typescript
import { AgentBuilder, AgentCapability } from '@mplp/agent-builder';

const agent = new AgentBuilder()
  .withName('ConfigurableAgent')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .withMetadata({ version: '1.0.0' })
  .build();

await agent.start();

// Update agent configuration
await agent.updateConfig({
  capabilities: [
    AgentCapability.TEXT_PROCESSING,
    AgentCapability.IMAGE_PROCESSING
  ],
  metadata: {
    version: '1.1.0',
    updated: new Date().toISOString()
  }
});

console.log('Updated config:', agent.getConfig());
```

### Error Handling and Recovery

```typescript
import { 
  AgentBuilder, 
  AgentCapability,
  AgentLifecycleError,
  PlatformConnectionError 
} from '@mplp/agent-builder';

const agent = new AgentBuilder()
  .withName('ResilientAgent')
  .withCapability(AgentCapability.API_INTEGRATION)
  .withBehavior({
    onStart: async () => {
      // Might throw an error
      throw new Error('Startup failed');
    }
  })
  .build();

try {
  await agent.start();
} catch (error) {
  if (error instanceof AgentLifecycleError) {
    console.error('Lifecycle error:', error.message);
    console.error('Context:', error.context);
  }
  
  // Attempt recovery
  console.log('Attempting recovery...');
  
  // Update behavior to remove failing handler
  await agent.updateConfig({
    behavior: {
      onStart: async () => {
        console.log('Agent started successfully');
      }
    }
  });
  
  // Retry start
  await agent.start();
}
```

### Agent Status Monitoring

```typescript
import { AgentBuilder, AgentCapability, AgentStatus } from '@mplp/agent-builder';

const agent = new AgentBuilder()
  .withName('MonitoredAgent')
  .withCapability(AgentCapability.TEXT_PROCESSING)
  .build();

// Monitor agent status
const statusMonitor = setInterval(() => {
  const status = agent.getStatus();
  console.log('Agent Status:', {
    status: status.status,
    uptime: status.uptime,
    errorCount: status.errorCount,
    messageCount: status.messageCount
  });
}, 5000);

await agent.start();

// Simulate some activity
setTimeout(async () => {
  await agent.sendMessage('Test message');
}, 2000);

// Stop monitoring after 30 seconds
setTimeout(() => {
  clearInterval(statusMonitor);
  agent.destroy();
}, 30000);
```

## Testing

### Testing Agents with Mock Adapters

```typescript
import { 
  AgentBuilder, 
  AgentCapability,
  MockPlatformAdapter,
  PlatformAdapterRegistry 
} from '@mplp/agent-builder';

describe('Agent Tests', () => {
  let registry: PlatformAdapterRegistry;
  
  beforeEach(() => {
    registry = PlatformAdapterRegistry.createTestInstance();
    registry.register('mock', MockPlatformAdapter);
  });
  
  it('should send messages through mock adapter', async () => {
    const agent = AgentBuilder.createWithRegistry(registry)
      .withName('TestAgent')
      .withCapability(AgentCapability.TEXT_PROCESSING)
      .withPlatform('mock', {})
      .build();
    
    await agent.start();
    await agent.sendMessage('Test message');
    
    const status = agent.getStatus();
    expect(status.messageCount).toBe(1);
    
    await agent.destroy();
  });
});
```

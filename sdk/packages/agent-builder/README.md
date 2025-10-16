# @mplp/agent-builder

Multi-Agent Protocol Lifecycle Platform (MPLP) Agent Builder - A powerful framework for constructing and managing intelligent agents with platform adapters and lifecycle management.

## Features

- 🤖 **Fluent Agent Builder API** - Chain-based configuration for easy agent construction
- 🔌 **Platform Adapter System** - Unified interface for different platforms (Twitter, Discord, Slack, etc.)
- 🔄 **Lifecycle Management** - Complete agent lifecycle with start, stop, monitoring, and cleanup
- 📊 **Status Monitoring** - Real-time agent status tracking and reporting
- 🛡️ **Error Handling** - Robust error handling and recovery mechanisms
- 🧪 **100% Test Coverage** - Comprehensive test suite with enterprise-grade quality

## Installation

```bash
npm install @mplp/agent-builder
```

## Quick Start

```typescript
import { AgentBuilder } from '@mplp/agent-builder';

// Create an agent with fluent API
const agent = new AgentBuilder('TwitterBot')
  .withCapability('social_media_posting')
  .withPlatform('twitter', { 
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret' 
  })
  .withBehavior({ 
    onMention: async (mention) => {
      console.log('Received mention:', mention);
    }
  })
  .build();

// Start the agent
await agent.start();

// Monitor status
console.log('Agent status:', agent.getStatus());

// Stop the agent when done
await agent.stop();
```

## Architecture

The Agent Builder follows a modular architecture:

- **AgentBuilder**: Fluent API for agent configuration
- **MPLPAgent**: Core agent implementation with lifecycle management
- **PlatformAdapter**: Abstraction layer for different platforms
- **LifecycleManager**: Handles agent startup, shutdown, and monitoring

## Agent Capabilities

Agents can be configured with various capabilities:

```typescript
import { AgentCapability } from '@mplp/agent-builder';

const capabilities = [
  AgentCapability.TEXT_PROCESSING,    // Process text content
  AgentCapability.IMAGE_PROCESSING,   // Handle images
  AgentCapability.SOCIAL_MEDIA,       // Social media integration
  AgentCapability.API_INTEGRATION,    // External API calls
  AgentCapability.WEB_SCRAPING,       // Web content extraction
  AgentCapability.DATABASE_ACCESS,    // Database operations
  AgentCapability.FILE_PROCESSING,    // File handling
  AgentCapability.SCHEDULING,         // Task scheduling
  AgentCapability.NOTIFICATION,       // Send notifications
  AgentCapability.VOICE_PROCESSING    // Voice/audio processing
];
```

## Platform Adapters

Create custom platform adapters:

```typescript
import { BasePlatformAdapter, IPlatformAdapter } from '@mplp/agent-builder';

class CustomPlatformAdapter extends BasePlatformAdapter implements IPlatformAdapter {
  public readonly name = 'custom';

  async connect(config: Record<string, unknown>): Promise<void> {
    // Implement connection logic
    this._connected = true;
    this.emit('connected');
  }

  async sendMessage(message: unknown): Promise<void> {
    // Implement message sending
    console.log('Sending message:', message);
    this._messageCount++;
    this._lastActivity = new Date();
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this.emit('disconnected');
  }
}
```

## Testing

The package includes comprehensive testing utilities:

```typescript
import {
  PlatformAdapterRegistry,
  MockPlatformAdapter,
  AgentBuilder,
  AgentCapability
} from '@mplp/agent-builder';

describe('Agent Tests', () => {
  let testRegistry: PlatformAdapterRegistry;

  beforeEach(() => {
    testRegistry = PlatformAdapterRegistry.createTestInstance();
    testRegistry.register('mock', MockPlatformAdapter);
  });

  it('should create and manage agent lifecycle', async () => {
    const agent = AgentBuilder.createWithRegistry(testRegistry)
      .withName('TestAgent')
      .withCapability(AgentCapability.TEXT_PROCESSING)
      .withPlatform('mock', {})
      .build();

    await agent.start();
    expect(agent.status).toBe('running');

    await agent.sendMessage('test message');
    const status = agent.getStatus();
    expect(status.messageCount).toBe(1);

    await agent.destroy();
    expect(agent.isDestroyed()).toBe(true);
  });
});
```

## Documentation

📚 **[API Reference](./docs/API.md)** - Complete API documentation
📖 **[Usage Examples](./docs/EXAMPLES.md)** - Practical examples and patterns
🎯 **[Best Practices](./docs/BEST-PRACTICES.md)** - Guidelines and recommendations

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run linting
npm run lint
```

## License

MIT © MPLP Team

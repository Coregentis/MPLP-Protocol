# @mplp/agent-builder API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/sdk-api/agent-builder/README.md)


> **Package**: @mplp/agent-builder  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Package Overview**

The `@mplp/agent-builder` package provides a powerful fluent API for constructing and managing intelligent agents with platform adapters and comprehensive lifecycle management. It enables developers to build sophisticated multi-agent systems with minimal code complexity.

### **🎯 Key Features**

- **Fluent Builder API**: Chain-based configuration for intuitive agent construction
- **Platform Adapter System**: Unified interface for different platforms (Twitter, Discord, Slack, etc.)
- **Lifecycle Management**: Complete agent lifecycle with start, stop, monitoring, and cleanup
- **Capability System**: Modular capability registration and execution
- **Status Monitoring**: Real-time agent status tracking and reporting
- **Error Handling**: Robust error handling and recovery mechanisms
- **Event-Driven Architecture**: Event-based agent communication and coordination
- **TypeScript Support**: 100% type safety with comprehensive interfaces

### **📦 Installation**

```bash
npm install @mplp/agent-builder
```

### **🏗️ Architecture**

```
┌─────────────────────────────────────────┐
│            AgentBuilder                 │
│     (Fluent Configuration API)         │
├─────────────────────────────────────────┤
│  MPLPAgent | PlatformAdapterRegistry   │
│  CapabilityManager | LifecycleManager  │
├─────────────────────────────────────────┤
│         Platform Adapters               │
│  Twitter | Discord | Slack | GitHub... │
└─────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **Basic Agent Creation**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';

// Create a simple greeting agent
const greetingAgent = new AgentBuilder('GreetingBot')
  .withName('Friendly Greeting Bot')
  .withDescription('Handles greeting and welcome messages')
  .withCapability('greet', async (params: { name: string }) => {
    return { message: `Hello, ${params.name}! Welcome!` };
  })
  .build();

// Start the agent
await greetingAgent.start();
```

### **Multi-Platform Agent**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, DiscordAdapter } from '@mplp/adapters';

const socialAgent = new AgentBuilder('SocialBot')
  .withName('Multi-Platform Social Bot')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!
  }))
  .withPlatform('discord', new DiscordAdapter({
    token: process.env.DISCORD_TOKEN!
  }))
  .withCapability('post', async (content: string) => {
    // Post to all connected platforms
    return await this.postToAllPlatforms(content);
  })
  .build();
```

## 📋 **Core Classes**

### **AgentBuilder**

The main builder class for creating agents with a fluent API.

#### **Constructor**

```typescript
constructor(id: string)
```

**Parameters:**
- `id`: Unique identifier for the agent

**Example:**
```typescript
const builder = new AgentBuilder('my-agent-001');
```

#### **Configuration Methods**

##### `withName(name: string): AgentBuilder`

Sets the agent's display name.

```typescript
const agent = new AgentBuilder('bot-1')
  .withName('Customer Support Bot')
  .build();
```

##### `withDescription(description: string): AgentBuilder`

Sets the agent's description.

```typescript
const agent = new AgentBuilder('analyzer')
  .withDescription('Analyzes customer feedback and sentiment')
  .build();
```

##### `withCapability(name: string, handler: CapabilityHandler): AgentBuilder`

Adds a capability to the agent.

```typescript
const agent = new AgentBuilder('processor')
  .withCapability('process-data', async (data: any[]) => {
    // Process the data
    return { processed: data.length, results: processedData };
  })
  .withCapability('validate-data', async (data: any) => {
    // Validate the data
    return { valid: true, errors: [] };
  })
  .build();
```

##### `withCapabilities(capabilities: Record<string, CapabilityHandler>): AgentBuilder`

Adds multiple capabilities at once.

```typescript
const capabilities = {
  'analyze': async (text: string) => ({ sentiment: 'positive', score: 0.8 }),
  'summarize': async (text: string) => ({ summary: 'Brief summary...' }),
  'translate': async (text: string, lang: string) => ({ translated: '...' })
};

const agent = new AgentBuilder('nlp-agent')
  .withCapabilities(capabilities)
  .build();
```

##### `withPlatform(name: string, adapter: IPlatformAdapter): AgentBuilder`

Connects the agent to a platform.

```typescript
import { TwitterAdapter } from '@mplp/adapters';

const agent = new AgentBuilder('social-bot')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!
  }))
  .build();
```

##### `withBehavior(behavior: AgentBehavior): AgentBuilder`

Sets agent behavior configuration.

```typescript
const agent = new AgentBuilder('worker-bot')
  .withBehavior({
    autoStart: true,
    retryAttempts: 3,
    retryDelay: 1000,
    maxConcurrentTasks: 5,
    healthCheckInterval: 30000
  })
  .build();
```

##### `withConfig(config: Partial<AgentConfig>): AgentBuilder`

Sets additional configuration options.

```typescript
const agent = new AgentBuilder('enterprise-bot')
  .withConfig({
    logging: { level: 'info', enableFile: true },
    monitoring: { enableMetrics: true, metricsPort: 9091 },
    security: { enableAuth: true, tokenExpiry: 3600 }
  })
  .build();
```

#### **Build Method**

##### `build(): Promise<IAgent>`

Builds and returns the configured agent.

```typescript
const agent = await new AgentBuilder('my-bot')
  .withName('My Bot')
  .withCapability('hello', async () => ({ message: 'Hello!' }))
  .build();
```

### **IAgent Interface**

The main interface for interacting with built agents.

#### **Properties**

```typescript
interface IAgent {
  readonly id: string;
  readonly name: string;
  readonly capabilities: AgentCapability[];
  readonly status: AgentStatus;
}
```

#### **Methods**

##### `start(): Promise<void>`

Starts the agent and initializes all platforms.

```typescript
await agent.start();
console.log('Agent started successfully');
```

##### `stop(): Promise<void>`

Stops the agent and cleans up resources.

```typescript
await agent.stop();
console.log('Agent stopped');
```

##### `getStatus(): AgentStatusInfo`

Returns detailed status information.

```typescript
const status = agent.getStatus();
console.log(`Status: ${status.state}`); // 'idle' | 'running' | 'stopped' | 'error'
console.log(`Uptime: ${status.uptime}ms`);
console.log(`Tasks completed: ${status.tasksCompleted}`);
```

##### `executeCapability(name: string, ...args: any[]): Promise<any>`

Executes a specific capability.

```typescript
const result = await agent.executeCapability('greet', { name: 'Alice' });
console.log(result.message); // "Hello, Alice! Welcome!"
```

##### `sendMessage(message: unknown): Promise<void>`

Sends a message through the agent's platforms.

```typescript
await agent.sendMessage({
  content: 'Hello from the agent!',
  platforms: ['twitter', 'discord']
});
```

##### `updateConfig(config: Partial<AgentConfig>): Promise<void>`

Updates the agent's configuration at runtime.

```typescript
await agent.updateConfig({
  behavior: { maxConcurrentTasks: 10 }
});
```

##### `destroy(): Promise<void>`

Completely destroys the agent and frees all resources.

```typescript
await agent.destroy();
```

#### **Events**

Agents emit various events during their lifecycle:

```typescript
agent.on('started', () => {
  console.log('Agent has started');
});

agent.on('stopped', () => {
  console.log('Agent has stopped');
});

agent.on('capability-executed', (name, result) => {
  console.log(`Capability ${name} executed:`, result);
});

agent.on('error', (error) => {
  console.error('Agent error:', error);
});

agent.on('platform-connected', (platformName) => {
  console.log(`Connected to ${platformName}`);
});

agent.on('platform-disconnected', (platformName) => {
  console.log(`Disconnected from ${platformName}`);
});
```

### **PlatformAdapterRegistry**

Manages platform adapter registration and discovery.

#### **Methods**

##### `register(name: string, adapter: IPlatformAdapter): void`

Registers a platform adapter.

```typescript
import { PlatformAdapterRegistry } from '@mplp/agent-builder';
import { CustomAdapter } from './CustomAdapter';

PlatformAdapterRegistry.register('custom', new CustomAdapter());
```

##### `get(name: string): IPlatformAdapter | undefined`

Gets a registered adapter.

```typescript
const twitterAdapter = PlatformAdapterRegistry.get('twitter');
```

##### `getAll(): Map<string, IPlatformAdapter>`

Gets all registered adapters.

```typescript
const allAdapters = PlatformAdapterRegistry.getAll();
for (const [name, adapter] of allAdapters) {
  console.log(`Available adapter: ${name}`);
}
```

##### `unregister(name: string): void`

Unregisters an adapter.

```typescript
PlatformAdapterRegistry.unregister('custom');
```

## 🔧 **Type Definitions**

### **AgentConfig**

```typescript
interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  capabilities: Record<string, CapabilityHandler>;
  platforms: Record<string, IPlatformAdapter>;
  behavior: AgentBehavior;
  logging?: LoggingConfig;
  monitoring?: MonitoringConfig;
  security?: SecurityConfig;
}
```

### **AgentCapability**

```typescript
interface AgentCapability {
  name: string;
  description?: string;
  handler: CapabilityHandler;
  metadata?: Record<string, any>;
}

type CapabilityHandler = (...args: any[]) => Promise<any>;
```

### **AgentBehavior**

```typescript
interface AgentBehavior {
  autoStart?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  maxConcurrentTasks?: number;
  healthCheckInterval?: number;
  gracefulShutdownTimeout?: number;
}
```

### **AgentStatus**

```typescript
type AgentStatus = 'idle' | 'running' | 'stopped' | 'error';

interface AgentStatusInfo {
  state: AgentStatus;
  uptime: number;
  tasksCompleted: number;
  tasksInProgress: number;
  lastError?: Error;
  platformStatuses: Record<string, PlatformStatus>;
  memoryUsage: NodeJS.MemoryUsage;
}
```

## 🎯 **Advanced Usage Examples**

### **Enterprise Agent with Full Configuration**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, SlackAdapter } from '@mplp/adapters';

const enterpriseAgent = new AgentBuilder('enterprise-support-bot')
  .withName('Enterprise Support Bot')
  .withDescription('Handles customer support across multiple channels')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  }))
  .withPlatform('slack', new SlackAdapter({
    token: process.env.SLACK_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!
  }))
  .withCapability('handle-support-ticket', async (ticket: SupportTicket) => {
    // AI-powered ticket analysis and response
    const analysis = await analyzeTicket(ticket);
    const response = await generateResponse(analysis);
    
    return {
      ticketId: ticket.id,
      priority: analysis.priority,
      response: response.text,
      estimatedResolutionTime: analysis.eta
    };
  })
  .withCapability('escalate-ticket', async (ticketId: string, reason: string) => {
    // Escalate to human agent
    await notifyHumanAgent(ticketId, reason);
    return { escalated: true, timestamp: new Date().toISOString() };
  })
  .withBehavior({
    autoStart: true,
    retryAttempts: 3,
    maxConcurrentTasks: 10,
    healthCheckInterval: 15000
  })
  .withConfig({
    logging: { level: 'info', enableFile: true, filePath: './logs/support-bot.log' },
    monitoring: { enableMetrics: true, metricsPort: 9092 },
    security: { enableAuth: true, tokenExpiry: 7200 }
  })
  .build();

// Set up event handlers
enterpriseAgent.on('capability-executed', (name, result) => {
  if (name === 'handle-support-ticket') {
    console.log(`Ticket ${result.ticketId} handled with priority ${result.priority}`);
  }
});

// Start the agent
await enterpriseAgent.start();
```

### **AI-Powered Content Creation Agent**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, LinkedInAdapter, MediumAdapter } from '@mplp/adapters';

const contentAgent = new AgentBuilder('ai-content-creator')
  .withName('AI Content Creator')
  .withDescription('Creates and publishes AI-generated content across platforms')
  .withPlatform('twitter', new TwitterAdapter({ /* config */ }))
  .withPlatform('linkedin', new LinkedInAdapter({ /* config */ }))
  .withPlatform('medium', new MediumAdapter({ /* config */ }))
  .withCapability('generate-content', async (topic: string, style: string) => {
    // AI content generation
    const content = await generateAIContent(topic, style);
    return {
      title: content.title,
      body: content.body,
      tags: content.tags,
      estimatedReadTime: content.readTime
    };
  })
  .withCapability('optimize-for-platform', async (content: any, platform: string) => {
    // Platform-specific optimization
    const optimized = await optimizeContent(content, platform);
    return optimized;
  })
  .withCapability('schedule-post', async (content: any, platforms: string[], scheduleTime: Date) => {
    // Schedule content across platforms
    const scheduled = await scheduleAcrossPlatforms(content, platforms, scheduleTime);
    return { scheduled: true, postIds: scheduled.ids };
  })
  .withBehavior({
    maxConcurrentTasks: 3, // Limit concurrent content generation
    retryAttempts: 2
  })
  .build();
```

### **Monitoring and Analytics Agent**

```typescript
const monitoringAgent = new AgentBuilder('system-monitor')
  .withName('System Monitoring Agent')
  .withCapability('collect-metrics', async () => {
    const metrics = await collectSystemMetrics();
    return metrics;
  })
  .withCapability('analyze-performance', async (metrics: SystemMetrics) => {
    const analysis = await analyzePerformance(metrics);
    return analysis;
  })
  .withCapability('send-alerts', async (alerts: Alert[]) => {
    for (const alert of alerts) {
      await sendAlert(alert);
    }
    return { sent: alerts.length };
  })
  .withBehavior({
    autoStart: true,
    healthCheckInterval: 10000 // Check every 10 seconds
  })
  .build();

// Set up periodic monitoring
setInterval(async () => {
  const metrics = await monitoringAgent.executeCapability('collect-metrics');
  const analysis = await monitoringAgent.executeCapability('analyze-performance', metrics);
  
  if (analysis.alerts.length > 0) {
    await monitoringAgent.executeCapability('send-alerts', analysis.alerts);
  }
}, 60000); // Every minute
```

## 🔗 **Related Documentation**

- [SDK Core API](../sdk-core/README.md) - Application framework and lifecycle
- [Orchestrator API](../orchestrator/README.md) - Multi-agent workflow management
- [Platform Adapters API](../adapters/README.md) - Platform integration details
- [CLI Tools](../cli/README.md) - Development and deployment tools

---

**Package Maintainer**: MPLP Agent Builder Team  
**Last Review**: 2025-09-20  
**Test Coverage**: >90% with comprehensive integration tests  
**Status**: ✅ Production Ready

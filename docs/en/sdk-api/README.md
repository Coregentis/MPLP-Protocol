# MPLP SDK v1.1.0 API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../zh-CN/sdk-api/README.md)


> **Documentation Category**: SDK API Reference  
> **SDK Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Complete SDK API Documentation Suite  

## 📚 **SDK API Documentation Overview**

Welcome to the comprehensive API reference for the MPLP (Multi-Agent Protocol Lifecycle Platform) SDK v1.1.0. This documentation provides detailed information about all classes, interfaces, methods, and types available in the MPLP SDK ecosystem built on top of the MPLP V1.0 Alpha protocol stack.

### **🎯 Documentation Purpose**

The SDK API reference serves as the definitive guide for:
- **Application Developers**: Complete API specifications for building multi-agent applications
- **Platform Integration**: Detailed interface documentation for platform adapters
- **Type Safety**: Comprehensive TypeScript type definitions and usage patterns
- **Best Practices**: Recommended implementation approaches and patterns
- **Enterprise Development**: Production-ready APIs with enterprise-grade features

## 🏗️ **SDK Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│              (Your Multi-Agent Apps)                       │
├─────────────────────────────────────────────────────────────┤
│                   MPLP SDK Layer                           │
│  @mplp/sdk-core | @mplp/agent-builder | @mplp/orchestrator │
│  @mplp/adapters | @mplp/cli | @mplp/dev-tools | @mplp/studio│
├─────────────────────────────────────────────────────────────┤
│              MPLP V1.0 Alpha Protocol Stack                │
│  L3: CoreOrchestrator | L2: Context,Plan,Role,Confirm...   │
│  L1: Schema Validation & Cross-cutting Concerns            │
└─────────────────────────────────────────────────────────────┘
```

## 📦 **SDK Packages API Reference**

### **Core SDK Packages**

#### **[@mplp/sdk-core](./sdk-core/README.md)** ✅ **Production Ready**
- **Purpose**: Foundation application framework and lifecycle management
- **Main Classes**: `MPLPApplication`, `ConfigManager`, `ModuleManager`, `HealthChecker`
- **Key Features**: Application lifecycle, configuration management, health monitoring, event system
- **Test Coverage**: 100% (45/45 tests passing)
- **Installation**: `npm install @mplp/sdk-core`

#### **[@mplp/agent-builder](./agent-builder/README.md)** ✅ **Production Ready**
- **Purpose**: Fluent API for building and managing intelligent agents
- **Main Classes**: `AgentBuilder`, `MPLPAgent`, `PlatformAdapterRegistry`
- **Key Features**: Agent construction, lifecycle management, platform integration, capability system
- **Test Coverage**: >90% with comprehensive integration tests
- **Installation**: `npm install @mplp/agent-builder`

#### **[@mplp/orchestrator](./orchestrator/README.md)** ✅ **Production Ready**
- **Purpose**: Multi-agent workflow orchestration and coordination
- **Main Classes**: `MultiAgentOrchestrator`, `WorkflowBuilder`, `ExecutionEngine`
- **Key Features**: Workflow management, agent coordination, execution monitoring, performance analytics
- **Test Coverage**: 100% (117/117 tests passing)
- **Installation**: `npm install @mplp/orchestrator`

#### **[@mplp/adapters](./adapters/README.md)** ✅ **Production Ready**
- **Purpose**: Platform-specific adapters for social media and communication platforms
- **Main Classes**: `AdapterManager`, `TwitterAdapter`, `DiscordAdapter`, `SlackAdapter`, etc.
- **Key Features**: 7 platform adapters, unified API, error handling, rate limiting
- **Platform Coverage**: Twitter, LinkedIn, GitHub, Discord, Slack, Reddit, Medium
- **Installation**: `npm install @mplp/adapters`

### **Development Tools**

#### **[@mplp/cli](./cli/README.md)** ✅ **Enterprise Grade**
- **Purpose**: Command-line interface for MPLP development workflow
- **Main Features**: Project scaffolding, build tools, deployment utilities, testing framework
- **Commands**: `create`, `build`, `dev`, `test`, `deploy`, `validate`, `doctor`
- **Test Coverage**: 100% (193/193 tests passing)
- **Installation**: `npm install -g @mplp/cli`

#### **[@mplp/dev-tools](./dev-tools/README.md)** ✅ **Enterprise Grade**
- **Purpose**: Development and debugging utilities for MPLP applications
- **Main Features**: Real-time monitoring, performance profiling, debugging tools, analytics
- **Test Coverage**: 100% (40/40 tests passing)
- **Installation**: `npm install --save-dev @mplp/dev-tools`

#### **[@mplp/studio](./studio/README.md)** ✅ **Production Ready**
- **Purpose**: Visual development environment for agent workflows
- **Main Features**: Drag-and-drop interface, code generation, real-time preview, collaboration
- **Test Coverage**: 100% (58/58 tests passing)
- **Installation**: `npm install @mplp/studio`

## 🚀 **Quick Start Examples**

### **Basic Multi-Agent Application**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { AgentBuilder } from '@mplp/agent-builder';
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

// Create MPLP application
const app = new MPLPApplication({
  name: 'MyFirstApp',
  version: '1.0.0',
  description: 'My first multi-agent application'
});

// Build an intelligent agent
const greetingAgent = new AgentBuilder('GreetingAgent')
  .withName('Greeting Assistant')
  .withDescription('Handles greeting and welcome messages')
  .withCapability('greet', async (params: { name: string }) => {
    return { 
      message: `Hello, ${params.name}! Welcome to MPLP!`,
      timestamp: new Date().toISOString()
    };
  })
  .withCapability('farewell', async (params: { name: string }) => {
    return { 
      message: `Goodbye, ${params.name}! Thanks for using MPLP!`,
      timestamp: new Date().toISOString()
    };
  })
  .build();

// Create orchestrator and register agent
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(greetingAgent);

// Initialize and start the application
await app.initialize();
await app.start();

console.log('MPLP application started successfully!');
```

### **Multi-Platform Social Media Agent**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, DiscordAdapter, SlackAdapter } from '@mplp/adapters';

// Create multi-platform social media agent
const socialAgent = new AgentBuilder('SocialMediaBot')
  .withName('Multi-Platform Social Bot')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  }))
  .withPlatform('discord', new DiscordAdapter({
    token: process.env.DISCORD_TOKEN!,
    guildId: process.env.DISCORD_GUILD_ID!
  }))
  .withPlatform('slack', new SlackAdapter({
    token: process.env.SLACK_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!
  }))
  .withCapability('post', async (content: { message: string; platforms?: string[] }) => {
    const results = new Map();
    const targetPlatforms = content.platforms || ['twitter', 'discord', 'slack'];
    
    for (const platform of targetPlatforms) {
      try {
        const adapter = this.getPlatformAdapter(platform);
        const result = await adapter.post({
          content: content.message,
          type: 'text'
        });
        results.set(platform, { success: true, result });
      } catch (error) {
        results.set(platform, { success: false, error: error.message });
      }
    }
    
    return { results: Object.fromEntries(results) };
  })
  .withCapability('monitor', async (params: { keywords: string[]; platforms?: string[] }) => {
    // Start monitoring across platforms
    const monitoringResults = await this.startMonitoring(params);
    return monitoringResults;
  })
  .build();
```

### **Advanced Workflow Orchestration**

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';
import { AgentBuilder } from '@mplp/agent-builder';

// Create specialized agents
const contentAgent = new AgentBuilder('ContentCreator')
  .withCapability('generate', async (topic: string) => {
    // AI-powered content generation
    return { content: `Generated content about ${topic}` };
  })
  .build();

const reviewAgent = new AgentBuilder('ContentReviewer')
  .withCapability('review', async (content: string) => {
    // Content review and approval
    return { approved: true, feedback: 'Content looks good!' };
  })
  .build();

const publishAgent = new AgentBuilder('ContentPublisher')
  .withCapability('publish', async (content: string, platforms: string[]) => {
    // Multi-platform publishing
    return { published: true, platforms };
  })
  .build();

// Create orchestrator and register agents
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(contentAgent);
await orchestrator.registerAgent(reviewAgent);
await orchestrator.registerAgent(publishAgent);

// Build complex workflow
const contentWorkflow = new WorkflowBuilder('content-pipeline')
  .step('generate', async (input: { topic: string }) => {
    const result = await contentAgent.executeCapability('generate', input.topic);
    return { content: result.content, topic: input.topic };
  })
  .step('review', async (input: { content: string }) => {
    const result = await reviewAgent.executeCapability('review', input.content);
    if (!result.approved) {
      throw new Error(`Content review failed: ${result.feedback}`);
    }
    return { ...input, reviewResult: result };
  })
  .step('publish', async (input: { content: string; topic: string }) => {
    const platforms = ['twitter', 'linkedin', 'medium'];
    const result = await publishAgent.executeCapability('publish', input.content, platforms);
    return { ...input, publishResult: result };
  })
  .onError(async (error, context) => {
    console.error('Workflow error:', error.message);
    // Implement error recovery logic
  })
  .build();

// Execute workflow
const result = await orchestrator.executeWorkflow(contentWorkflow, {
  topic: 'Multi-Agent Systems in 2025'
});

console.log('Content pipeline completed:', result);
```

## 🔧 **Development Guidelines**

### **TypeScript Best Practices**

```typescript
// Always use strict typing - avoid 'any'
interface AgentConfig {
  name: string;
  description?: string;
  capabilities: Record<string, CapabilityFunction>;
  platforms?: Record<string, IPlatformAdapter>;
}

// Use proper error handling
import { AgentBuildError, PlatformAdapterError } from '@mplp/agent-builder';

const createAgent = async (config: AgentConfig): Promise<IAgent> => {
  try {
    return await new AgentBuilder(config.name)
      .withDescription(config.description)
      .withCapabilities(config.capabilities)
      .build();
  } catch (error) {
    if (error instanceof AgentBuildError) {
      throw new Error(`Failed to build agent: ${error.message}`);
    }
    throw error;
  }
};
```

### **Performance Optimization**

```typescript
// Use connection pooling for platform adapters
const twitterAdapter = new TwitterAdapter({
  apiKey: process.env.TWITTER_API_KEY!,
  // ... other config
  connectionPool: {
    maxConnections: 10,
    keepAlive: true,
    timeout: 30000
  }
});

// Implement proper resource cleanup
class MyApplication {
  private orchestrator: MultiAgentOrchestrator;
  
  async shutdown(): Promise<void> {
    try {
      await this.orchestrator.stopAllAgents();
      await this.orchestrator.cleanup();
    } catch (error) {
      console.error('Shutdown error:', error);
    }
  }
}

// Handle process signals for graceful shutdown
process.on('SIGTERM', async () => {
  await app.shutdown();
  process.exit(0);
});
```

## 📊 **SDK Quality Metrics**

### **Test Coverage and Quality**
```markdown
✅ Overall SDK Quality:
- Total Tests: 584 tests across all packages
- Test Pass Rate: 100% (584/584 tests passing)
- Code Coverage: >90% across all core packages
- TypeScript Compliance: 100% strict mode
- ESLint Compliance: Zero errors/warnings
- Security Vulnerabilities: Zero critical issues

✅ Package-Specific Metrics:
- @mplp/sdk-core: 45/45 tests passing
- @mplp/agent-builder: >90% coverage with integration tests
- @mplp/orchestrator: 117/117 tests passing
- @mplp/cli: 193/193 tests passing
- @mplp/dev-tools: 40/40 tests passing
- @mplp/studio: 58/58 tests passing
```

### **Performance Benchmarks**
```markdown
⚡ SDK Performance:
- Application Startup: <100ms
- Agent Creation: <50ms per agent
- Workflow Execution: <200ms (P95)
- Platform Adapter Response: <500ms (P95)
- Memory Usage: <50MB for typical applications
- CPU Usage: <5% during normal operations
```

## 🔗 **Related Documentation**

### **Getting Started**
- [SDK Installation Guide](../getting-started/installation.md) - Complete setup instructions
- [First Application Tutorial](../getting-started/first-app.md) - Step-by-step tutorial
- [Platform Integration Guide](../getting-started/platform-integration.md) - Connect to social platforms

### **Advanced Topics**
- Best Practices (开发中) - Recommended patterns and approaches
- Performance Optimization (开发中) - Optimization techniques
- Security Guidelines (开发中) - Security best practices

### **Examples and Tutorials**
- Example Applications (开发中) - Real-world implementation examples
- [Platform Adapter Examples](../examples/adapters.md) - Platform-specific examples
- [Workflow Patterns](../examples/workflows.md) - Common workflow patterns

---

**SDK API Documentation Team**: MPLP SDK Development Team  
**Technical Writers**: SDK API Reference Specialists  
**Last Review**: 2025-09-20  
**Status**: ✅ Complete and Production-Ready SDK API Reference Suite

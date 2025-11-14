# Building Your First Agent

> **🎯 Goal**: Build a complete MPLP Agent application in 30 minutes
> **📚 Prerequisites**: Completed [Installation Guide](installation.md)
> **🌐 Language**: English | [中文](../../docs-sdk/getting-started/first-agent.md)

---

## 📋 **Overview**

This tutorial will guide you through creating a simple but fully functional MPLP Agent, covering:
- ✅ Basic Agent configuration
- ✅ Module integration (Context, Plan, Role)
- ✅ Workflow orchestration
- ✅ Running and testing

---

## 🚀 **Step 1: Project Initialization**

### **Create Project Directory**

```bash
# Create project directory
mkdir my-first-agent
cd my-first-agent

# Initialize npm project
npm init -y

# Install MPLP
npm install mplp@beta

# Install TypeScript (recommended)
npm install -D typescript @types/node ts-node
npx tsc --init
```

### **Project Structure**

```
my-first-agent/
├── src/
│   ├── index.ts          # Main entry file
│   ├── agent.ts          # Agent definition
│   └── config.ts         # Configuration file
├── package.json
└── tsconfig.json
```

---

## 💻 **Step 2: Create Basic Agent**

### **src/config.ts - Configuration File**

```typescript
import { MPLPConfig } from 'mplp';

export const agentConfig: MPLPConfig = {
  // Protocol version
  protocolVersion: '1.1.0',
  
  // Runtime environment
  environment: 'development',
  
  // Log level
  logLevel: 'info',
  
  // Modules to load
  modules: ['context', 'plan', 'role'],
  
  // Custom configuration
  customConfig: {
    agentName: 'MyFirstAgent',
    agentType: 'assistant',
    capabilities: ['greeting', 'task-execution']
  }
};
```

### **src/agent.ts - Agent Definition**

```typescript
import { MPLP, MPLPConfig } from 'mplp';
import { agentConfig } from './config';

/**
 * MyFirstAgent Class
 * A simple MPLP Agent example
 */
export class MyFirstAgent {
  private mplp: MPLP;
  private initialized: boolean = false;

  constructor(config: MPLPConfig = agentConfig) {
    this.mplp = new MPLP(config);
  }

  /**
   * Initialize Agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Agent already initialized');
      return;
    }

    console.log('🚀 Initializing Agent...');
    await this.mplp.initialize();
    this.initialized = true;
    console.log('✅ Agent initialized successfully');
  }

  /**
   * Execute greeting task
   */
  async greet(name: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Agent not initialized, please call initialize() first');
    }

    // Use Context module to create context
    const contextModule = this.mplp.getModule('context');
    if (!contextModule) {
      throw new Error('Context module not loaded');
    }

    console.log(`👋 Hello, ${name}!`);
    return `Hello, ${name}! I'm MyFirstAgent, powered by MPLP v1.1.0`;
  }

  /**
   * Execute simple task
   */
  async executeTask(taskDescription: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Agent not initialized');
    }

    console.log(`📋 Executing task: ${taskDescription}`);
    
    // Use Plan module to create plan
    const planModule = this.mplp.getModule('plan');
    if (!planModule) {
      throw new Error('Plan module not loaded');
    }

    console.log('✅ Task execution completed');
  }

  /**
   * Get Agent information
   */
  getInfo(): object {
    return {
      name: 'MyFirstAgent',
      version: this.mplp.getVersion(),
      status: this.initialized ? 'ready' : 'not-initialized',
      modules: this.mplp.getLoadedModules()
    };
  }

  /**
   * Shutdown Agent
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Agent...');
    // Clean up resources
    this.initialized = false;
    console.log('✅ Agent shutdown complete');
  }
}
```

### **src/index.ts - Main Entry**

```typescript
import { MyFirstAgent } from './agent';

/**
 * Main function
 */
async function main() {
  // Create Agent instance
  const agent = new MyFirstAgent();

  try {
    // Initialize Agent
    await agent.initialize();

    // Display Agent info
    console.log('\n📊 Agent Information:');
    console.log(JSON.stringify(agent.getInfo(), null, 2));

    // Execute greeting
    console.log('\n👋 Executing Greeting:');
    const greeting = await agent.greet('Developer');
    console.log(greeting);

    // Execute task
    console.log('\n📋 Executing Task:');
    await agent.executeTask('Process user request');

    // Shutdown Agent
    await agent.shutdown();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
```

---

## 🏃 **Step 3: Run Agent**

### **Add Run Scripts**

Add to `package.json`:

```json
{
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "dev": "ts-node --watch src/index.ts"
  }
}
```

### **Run Agent**

```bash
# Run in development mode
npm run dev

# Or run directly
npm start
```

### **Expected Output**

```
🚀 Initializing Agent...
✅ Agent initialized successfully

📊 Agent Information:
{
  "name": "MyFirstAgent",
  "version": "1.1.0",
  "status": "ready",
  "modules": ["context", "plan", "role"]
}

👋 Executing Greeting:
👋 Hello, Developer!
Hello, Developer! I'm MyFirstAgent, powered by MPLP v1.1.0

📋 Executing Task:
📋 Executing task: Process user request
✅ Task execution completed

🛑 Shutting down Agent...
✅ Agent shutdown complete
```

---

## 🎯 **Step 4: Extend Agent Functionality**

### **Add More Modules**

```typescript
// Add more modules in config.ts
export const agentConfig: MPLPConfig = {
  modules: [
    'context',   // Context management
    'plan',      // Plan orchestration
    'role',      // Role permissions
    'confirm',   // Confirmation approval
    'trace'      // Execution tracing
  ]
};
```

### **Quick Creation with Factory Functions**

```typescript
import { quickStart } from 'mplp';

async function quickDemo() {
  // Use quickStart to quickly create MPLP instance
  const mplp = await quickStart();
  
  console.log('MPLP Version:', mplp.getVersion());
  console.log('Loaded Modules:', mplp.getLoadedModules());
}
```

---

## 📚 **Next Steps**

Congratulations! You've successfully created your first MPLP Agent. Next, you can:

1. **Deep Dive**: Read [API Reference](../api-reference/sdk-core.md)
2. **Advanced Tutorials**: Learn [Multi-Agent Collaboration](../tutorials/multi-agent-workflow.md)
3. **Best Practices**: Check [Development Best Practices](../guides/best-practices.md)
4. **Example Code**: Browse [Complete Examples](../examples/)

---

## 🔗 **Related Resources**

- [MPLP Core API](../api-reference/sdk-core.md)
- [Module Documentation](../../docs/en/modules/)
- [GitHub Repository](https://github.com/Coregentis/MPLP-Protocol)
- [Issue Tracker](https://github.com/Coregentis/MPLP-Protocol/issues)

---

**Version**: v1.1.0  
**Last Updated**: 2025-10-22  
**Author**: MPLP Team


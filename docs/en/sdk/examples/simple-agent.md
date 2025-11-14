# Simple Agent Example

> **🎯 Goal**: Learn MPLP Agent development through complete example  
> **⏱️ Completion Time**: 20 minutes  
> **🌐 Language**: English | [中文](../../docs-sdk/examples/simple-agent.md)

---

## 📋 **Example Overview**

This example demonstrates a simple but complete MPLP Agent with the following features:
- ✅ Greet users
- ✅ Execute simple tasks
- ✅ Manage task status
- ✅ Error handling

---

## 🚀 **Complete Code**

### **Project Structure**

```
simple-agent-example/
├── src/
│   ├── index.ts
│   └── SimpleAgent.ts
├── package.json
└── tsconfig.json
```

### **package.json**

```json
{
  "name": "simple-agent-example",
  "version": "1.0.0",
  "description": "Simple MPLP Agent Example",
  "main": "dist/index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "dev": "ts-node --watch src/index.ts"
  },
  "dependencies": {
    "mplp": "^1.1.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0"
  }
}
```

### **tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **src/SimpleAgent.ts**

```typescript
import { MPLP, MPLPConfig, createMPLP } from 'mplp';

/**
 * Simple Agent Example
 * Demonstrates basic MPLP usage
 */
export class SimpleAgent {
  private mplp?: MPLP;
  private initialized: boolean = false;
  private taskCount: number = 0;

  /**
   * Initialize Agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Agent already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing SimpleAgent...');
      
      // Create MPLP instance, load only needed modules
      this.mplp = await createMPLP({
        environment: 'development',
        logLevel: 'info',
        modules: ['context', 'plan', 'role']
      });

      this.initialized = true;
      console.log('✅ SimpleAgent initialized successfully');
      console.log(`📦 Loaded modules: ${this.mplp.getLoadedModules().join(', ')}`);
      
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Greet user
   */
  async greet(name: string): Promise<string> {
    this.ensureInitialized();

    console.log(`\n👋 Greeting: ${name}`);
    
    // Use Context module (if available)
    const contextModule = this.mplp!.getModule('context');
    if (contextModule) {
      console.log('🔧 Using Context module to create context');
    }

    const greeting = `Hello, ${name}! I'm SimpleAgent, built on MPLP v${this.mplp!.getVersion()}.`;
    console.log(`💬 ${greeting}`);
    
    return greeting;
  }

  /**
   * Execute task
   */
  async executeTask(taskName: string, taskData?: any): Promise<{
    success: boolean;
    taskId: number;
    result?: any;
    error?: string;
  }> {
    this.ensureInitialized();

    const taskId = ++this.taskCount;
    console.log(`\n📋 Executing task #${taskId}: ${taskName}`);

    try {
      // Use Plan module to create execution plan
      const planModule = this.mplp!.getModule('plan');
      if (planModule) {
        console.log('📝 Using Plan module to create execution plan');
      }

      // Simulate task execution
      console.log('⏳ Processing...');
      await this.delay(1000);

      const result = {
        taskName,
        taskData,
        completedAt: new Date().toISOString()
      };

      console.log('✅ Task completed');
      
      return {
        success: true,
        taskId,
        result
      };

    } catch (error) {
      console.error('❌ Task failed:', error);
      
      return {
        success: false,
        taskId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get Agent status
   */
  getStatus(): {
    initialized: boolean;
    version: string;
    modules: string[];
    tasksExecuted: number;
  } {
    return {
      initialized: this.initialized,
      version: this.mplp?.getVersion() || 'N/A',
      modules: this.mplp?.getLoadedModules() || [],
      tasksExecuted: this.taskCount
    };
  }

  /**
   * Shutdown Agent
   */
  async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down SimpleAgent...');
    
    this.initialized = false;
    this.taskCount = 0;
    
    console.log('✅ SimpleAgent shutdown complete');
  }

  /**
   * Ensure initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.mplp) {
      throw new Error('Agent not initialized, please call initialize() first');
    }
  }

  /**
   * Delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **src/index.ts**

```typescript
import { SimpleAgent } from './SimpleAgent';

/**
 * Main function - Demonstrates SimpleAgent usage
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🎯 SimpleAgent Example');
  console.log('='.repeat(60));

  // Create Agent instance
  const agent = new SimpleAgent();

  try {
    // 1. Initialize Agent
    await agent.initialize();

    // 2. Display Agent status
    console.log('\n📊 Agent Status:');
    const status = agent.getStatus();
    console.log(JSON.stringify(status, null, 2));

    // 3. Greet users
    await agent.greet('Developer');
    await agent.greet('MPLP User');

    // 4. Execute tasks
    const task1 = await agent.executeTask('Data Processing', {
      type: 'process',
      data: [1, 2, 3, 4, 5]
    });
    console.log('Task 1 Result:', task1);

    const task2 = await agent.executeTask('Report Generation', {
      type: 'report',
      format: 'PDF'
    });
    console.log('Task 2 Result:', task2);

    const task3 = await agent.executeTask('Email Sending', {
      to: 'user@example.com',
      subject: 'Test Email'
    });
    console.log('Task 3 Result:', task3);

    // 5. Display final status
    console.log('\n📊 Final Status:');
    const finalStatus = agent.getStatus();
    console.log(JSON.stringify(finalStatus, null, 2));

    // 6. Shutdown Agent
    await agent.shutdown();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Example execution complete');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## 🏃 **Running the Example**

### **1. Install Dependencies**

```bash
npm install
```

### **2. Run Example**

```bash
# Development mode (auto-reload)
npm run dev

# Or run directly
npm start

# Or build and run
npm run build
node dist/index.js
```

### **3. Expected Output**

```
============================================================
🎯 SimpleAgent Example
============================================================
🚀 Initializing SimpleAgent...
✅ SimpleAgent initialized successfully
📦 Loaded modules: context, plan, role

📊 Agent Status:
{
  "initialized": true,
  "version": "1.1.0",
  "modules": ["context", "plan", "role"],
  "tasksExecuted": 0
}

👋 Greeting: Developer
🔧 Using Context module to create context
💬 Hello, Developer! I'm SimpleAgent, built on MPLP v1.1.0.

👋 Greeting: MPLP User
🔧 Using Context module to create context
💬 Hello, MPLP User! I'm SimpleAgent, built on MPLP v1.1.0.

📋 Executing task #1: Data Processing
📝 Using Plan module to create execution plan
⏳ Processing...
✅ Task completed
Task 1 Result: {
  success: true,
  taskId: 1,
  result: {
    taskName: 'Data Processing',
    taskData: { type: 'process', data: [1, 2, 3, 4, 5] },
    completedAt: '2025-10-22T...'
  }
}

📋 Executing task #2: Report Generation
📝 Using Plan module to create execution plan
⏳ Processing...
✅ Task completed
Task 2 Result: {
  success: true,
  taskId: 2,
  result: {
    taskName: 'Report Generation',
    taskData: { type: 'report', format: 'PDF' },
    completedAt: '2025-10-22T...'
  }
}

📋 Executing task #3: Email Sending
📝 Using Plan module to create execution plan
⏳ Processing...
✅ Task completed
Task 3 Result: {
  success: true,
  taskId: 3,
  result: {
    taskName: 'Email Sending',
    taskData: { to: 'user@example.com', subject: 'Test Email' },
    completedAt: '2025-10-22T...'
  }
}

📊 Final Status:
{
  "initialized": true,
  "version": "1.1.0",
  "modules": ["context", "plan", "role"],
  "tasksExecuted": 3
}

🛑 Shutting down SimpleAgent...
✅ SimpleAgent shutdown complete

============================================================
✅ Example execution complete
============================================================
```

---

## 🎓 **Key Learning Points**

### **1. Agent Initialization**
```typescript
const agent = new SimpleAgent();
await agent.initialize();
```

### **2. Module Usage**
```typescript
const contextModule = this.mplp!.getModule('context');
const planModule = this.mplp!.getModule('plan');
```

### **3. Error Handling**
```typescript
try {
  // Perform operation
} catch (error) {
  console.error('Error:', error);
  return { success: false, error: error.message };
}
```

### **4. State Management**
```typescript
getStatus() {
  return {
    initialized: this.initialized,
    version: this.mplp?.getVersion(),
    modules: this.mplp?.getLoadedModules(),
    tasksExecuted: this.taskCount
  };
}
```

---

## 🔧 **Extension Suggestions**

### **1. Add More Modules**
```typescript
modules: ['context', 'plan', 'role', 'trace', 'confirm']
```

### **2. Implement Real Business Logic**
```typescript
async executeTask(taskName: string, taskData?: any) {
  // Replace simulation with real business logic
  const result = await this.processRealTask(taskData);
  return result;
}
```

### **3. Add Persistence**
```typescript
async saveTaskResult(result: TaskResult) {
  // Save to database
  await database.save(result);
}
```

---

## 📚 **Next Steps**

- [Basic Agent Tutorial](../tutorials/basic-agent.md)
- [Multi-Agent Collaboration](../tutorials/multi-agent-workflow.md)
- [Best Practices](../guides/best-practices.md)
- [API Reference](../api-reference/sdk-core.md)

---

**Version**: v1.1.0  
**Last Updated**: 2025-10-22  
**Author**: MPLP Team


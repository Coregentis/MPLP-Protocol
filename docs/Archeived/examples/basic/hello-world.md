# Hello World - Your First MPLP Workflow

## 📋 Overview

This is the simplest possible MPLP workflow example. It demonstrates the basic concepts of initializing MPLP modules and executing a minimal workflow.

**Difficulty**: Beginner  
**Topics**: Module initialization, Basic workflow execution, Core orchestrator  
**Estimated Time**: 10 minutes

## 🎯 What You'll Learn

- How to initialize MPLP modules
- How to create a basic workflow
- How to execute workflows using the Core orchestrator
- Understanding workflow results and status

## 📦 Prerequisites

- Node.js 18 or higher
- MPLP v1.0 installed
- Basic TypeScript/JavaScript knowledge

## 🚀 Quick Start

### 1. Installation

```bash
npm install mplp
```

### 2. Basic Hello World

Create a file `hello-world.ts`:

```typescript
import {
  initializeContextModule,
  initializePlanModule,
  initializeConfirmModule,
  initializeTraceModule,
  initializeRoleModule,
  initializeExtensionModule,
  initializeCoreModule
} from 'mplp';

async function helloWorld() {
  try {
    console.log('🚀 Starting MPLP Hello World example...');
    
    // Step 1: Initialize all required modules
    console.log('📦 Initializing modules...');
    
    const contextModule = await initializeContextModule();
    const planModule = await initializePlanModule();
    const confirmModule = await initializeConfirmModule();
    const traceModule = await initializeTraceModule();
    const roleModule = await initializeRoleModule();
    const extensionModule = await initializeExtensionModule();
    
    console.log('✅ All modules initialized successfully!');
    
    // Step 2: Prepare module services for Core
    const moduleServices = {
      contextService: contextModule.contextManagementService,
      planService: planModule.planManagementService,
      confirmService: confirmModule.confirmManagementService,
      traceService: traceModule.traceManagementService,
      roleService: roleModule.roleManagementService,
      extensionService: extensionModule.extensionManagementService
    };
    
    // Step 3: Initialize Core orchestrator
    console.log('🎯 Initializing Core orchestrator...');
    const core = await initializeCoreModule(moduleServices);
    console.log('✅ Core orchestrator ready!');
    
    // Step 4: Execute a simple workflow
    console.log('🔄 Executing Hello World workflow...');
    
    const result = await core.orchestrator.executeWorkflow('hello-world-context', {
      stages: ['context', 'trace'],
      parallel_execution: false,
      timeout_ms: 30000
    });
    
    // Step 5: Check results
    if (result.status === 'completed') {
      console.log('🎉 Hello World workflow completed successfully!');
      console.log(`📊 Execution time: ${result.total_duration_ms}ms`);
      console.log(`📋 Stages executed: ${result.stages.length}`);
      
      // Display stage results
      result.stages.forEach(stage => {
        console.log(`  • ${stage.stage}: ${stage.status} (${stage.duration_ms}ms)`);
      });
    } else {
      console.log('❌ Workflow failed:', result.error?.message);
    }
    
  } catch (error) {
    console.error('💥 Error in Hello World example:', error);
  }
}

// Run the example
if (require.main === module) {
  helloWorld();
}

export { helloWorld };
```

### 3. Run the Example

```bash
npx ts-node hello-world.ts
```

**Expected Output:**
```
🚀 Starting MPLP Hello World example...
📦 Initializing modules...
✅ All modules initialized successfully!
🎯 Initializing Core orchestrator...
✅ Core orchestrator ready!
🔄 Executing Hello World workflow...
🎉 Hello World workflow completed successfully!
📊 Execution time: 1234ms
📋 Stages executed: 2
  • context: completed (567ms)
  • trace: completed (123ms)
```

## 🔍 Understanding the Code

### Module Initialization

```typescript
// Each module must be initialized before use
const contextModule = await initializeContextModule();
const planModule = await initializePlanModule();
// ... other modules
```

**Why?** Each module sets up its internal dependencies, database connections, and configuration.

### Core Orchestrator

```typescript
const core = await initializeCoreModule(moduleServices);
```

**What it does:** The Core orchestrator coordinates workflow execution across all modules.

### Workflow Execution

```typescript
const result = await core.orchestrator.executeWorkflow('hello-world-context', {
  stages: ['context', 'trace'],
  parallel_execution: false,
  timeout_ms: 30000
});
```

**Parameters:**
- `'hello-world-context'` - Unique identifier for this workflow execution
- `stages` - Which modules to include in the workflow
- `parallel_execution` - Whether to run stages in parallel or sequence
- `timeout_ms` - Maximum execution time in milliseconds

## 🎨 Variations

### 1. Minimal Workflow (Context Only)

```typescript
const result = await core.orchestrator.executeWorkflow('minimal-context', {
  stages: ['context'],
  timeout_ms: 10000
});
```

### 2. Full MPLP Workflow

```typescript
const result = await core.orchestrator.executeWorkflow('full-workflow', {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 60000
});
```

### 3. Parallel Execution

```typescript
const result = await core.orchestrator.executeWorkflow('parallel-workflow', {
  stages: ['context', 'plan', 'trace'],
  parallel_execution: true,
  timeout_ms: 30000
});
```

### 4. With Event Monitoring

```typescript
// Listen to workflow events
core.orchestrator.addEventListener((event) => {
  console.log(`📡 Event: ${event.event_type} at ${event.timestamp}`);
  
  switch (event.event_type) {
    case 'stage_started':
      console.log(`🏁 Stage ${event.stage} started`);
      break;
    case 'stage_completed':
      console.log(`✅ Stage ${event.stage} completed`);
      break;
    case 'workflow_completed':
      console.log(`🎉 Workflow ${event.execution_id} completed`);
      break;
  }
});

// Execute workflow with monitoring
const result = await core.orchestrator.executeWorkflow('monitored-workflow', {
  stages: ['context', 'plan', 'trace']
});
```

## 🛠️ Configuration Options

### Environment Variables

```bash
# Optional: Set log level for more detailed output
MPLP_LOG_LEVEL=debug

# Optional: Configure timeouts
MPLP_DEFAULT_TIMEOUT=30000
```

### Custom Configuration

```typescript
const core = await initializeCoreModule(moduleServices, {
  orchestrator_config: {
    module_timeout_ms: 15000,
    max_concurrent_executions: 5,
    enable_performance_monitoring: true,
    enable_event_logging: true
  }
});
```

## 🧪 Testing Your Understanding

Try these exercises to test your understanding:

### Exercise 1: Custom Context ID
Modify the example to use a dynamic context ID based on the current timestamp.

### Exercise 2: Error Handling
Add proper error handling for each initialization step.

### Exercise 3: Performance Monitoring
Add code to measure and display the performance of each stage.

### Exercise 4: Multiple Workflows
Execute multiple workflows in sequence and compare their performance.

## 🚨 Common Issues

### Issue: Module Initialization Fails
**Solution:** Check that all dependencies are installed and environment variables are set correctly.

### Issue: Workflow Timeout
**Solution:** Increase the timeout value or check for blocking operations.

### Issue: Permission Errors
**Solution:** Ensure proper file permissions and database access.

## 📚 Next Steps

After completing this example, try:

1. [Context Management](./context-management.md) - Learn to create and manage contexts
2. [Simple Planning](./simple-planning.md) - Add planning to your workflows
3. [Event Monitoring](./event-monitoring.md) - Monitor workflow execution in detail

## 🔗 Related Documentation

- [Quick Start Guide](../../guides/quick-start.md)
- [Core API Reference](../../api/core-api.md)
- [Configuration Guide](../../configuration/configuration.md)

---

Congratulations! You've successfully executed your first MPLP workflow. This foundation will help you build more complex multi-agent applications. 🎉

# Quick Start Guide

Get up and running with MPLP v1.0 in minutes! This guide will walk you through the basic setup and your first workflow execution.

## 🚀 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **TypeScript**: Version 5.0 or higher (optional, for development)

## 📦 Installation

### Option 1: NPM Package (Recommended)
```bash
npm install mplp
```

### Option 2: From Source
```bash
git clone https://github.com/your-org/mplp.git
cd MPLP-Protocol
npm install
npm run build
```

## 🏃‍♂️ Your First MPLP Application

### 1. Basic Setup

Create a new file `app.ts`:

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

async function main() {
  try {
    // Initialize all modules
    console.log('🚀 Initializing MPLP modules...');
    
    const contextModule = await initializeContextModule();
    const planModule = await initializePlanModule();
    const confirmModule = await initializeConfirmModule();
    const traceModule = await initializeTraceModule();
    const roleModule = await initializeRoleModule();
    const extensionModule = await initializeExtensionModule();

    // Prepare module services
    const moduleServices = {
      contextService: contextModule.contextManagementService,
      planService: planModule.planManagementService,
      confirmService: confirmModule.confirmManagementService,
      traceService: traceModule.traceManagementService,
      roleService: roleModule.roleManagementService,
      extensionService: extensionModule.extensionManagementService
    };

    // Initialize Core orchestrator
    const core = await initializeCoreModule(moduleServices);
    
    console.log('✅ MPLP initialized successfully!');
    
    // Your application logic here
    await runWorkflowExample(core);
    
  } catch (error) {
    console.error('❌ Failed to initialize MPLP:', error);
  }
}

main();
```

### 2. Execute Your First Workflow

Add this function to your `app.ts`:

```typescript
async function runWorkflowExample(core: any) {
  console.log('\n🔄 Executing workflow example...');
  
  try {
    // Execute a simple workflow
    const result = await core.orchestrator.executeWorkflow('demo-context-123', {
      stages: ['context', 'plan', 'trace'],
      parallel_execution: false,
      timeout_ms: 60000
    });

    if (result.status === 'completed') {
      console.log('✅ Workflow completed successfully!');
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
    console.error('❌ Workflow execution error:', error);
  }
}
```

### 3. Run Your Application

```bash
npx ts-node app.ts
```

Expected output:
```
🚀 Initializing MPLP modules...
✅ MPLP initialized successfully!

🔄 Executing workflow example...
✅ Workflow completed successfully!
📊 Execution time: 1234ms
📋 Stages executed: 3
  • context: completed (123ms)
  • plan: completed (456ms)
  • trace: completed (78ms)
```

## 🎯 Common Use Cases

### 1. Using Workflow Templates

```typescript
// Use predefined templates
const standardWorkflow = core.workflowManager.getTemplate('standard');
const fastWorkflow = core.workflowManager.getTemplate('fast');

// Execute with template
const result = await core.orchestrator.executeWorkflow('ctx-456', standardWorkflow);
```

### 2. Custom Workflow Configuration

```typescript
// Create custom workflow
const customWorkflow = core.workflowManager.createCustomWorkflow(
  ['context', 'plan', 'trace'],
  {
    parallel: true,
    timeout_ms: 120000,
    retry_policy: {
      max_attempts: 3,
      delay_ms: 1000
    }
  }
);

const result = await core.orchestrator.executeWorkflow('ctx-789', customWorkflow);
```

### 3. Event Monitoring

```typescript
// Listen to workflow events
core.orchestrator.addEventListener((event) => {
  console.log(`📡 Event: ${event.event_type}`);
  
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
```

### 4. Module Health Monitoring

```typescript
// Check module health
const healthStatus = core.moduleCoordinator.getModuleHealthStatus();
for (const [moduleName, isHealthy] of healthStatus) {
  console.log(`${moduleName}: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
}

// Check dependencies
const depCheck = core.moduleCoordinator.checkModuleDependencies();
if (!depCheck.satisfied) {
  console.log('⚠️ Missing dependencies:', depCheck.missing);
}
```

## 🔧 Configuration Options

### Basic Configuration

```typescript
const core = await initializeCoreModule(moduleServices, {
  default_workflow_template: 'standard',
  enable_performance_monitoring: true,
  enable_event_logging: true,
  orchestrator_config: {
    module_timeout_ms: 30000,
    max_concurrent_executions: 10
  }
});
```

### Advanced Configuration

```typescript
const advancedConfig = {
  orchestrator_config: {
    default_workflow: {
      stages: ['context', 'plan', 'confirm', 'trace'],
      parallel_execution: false,
      timeout_ms: 300000,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_multiplier: 2
      },
      error_handling: {
        continue_on_error: false,
        rollback_on_failure: true,
        notification_enabled: true
      }
    },
    lifecycle_hooks: {
      beforeWorkflow: async (context) => {
        console.log(`🚀 Starting workflow ${context.execution_id}`);
      },
      afterWorkflow: async (result) => {
        console.log(`🏁 Workflow ${result.execution_id} finished: ${result.status}`);
      }
    }
  }
};

const core = await initializeCoreModule(moduleServices, advancedConfig);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Module Initialization Fails
```typescript
// Check if all dependencies are available
try {
  const contextModule = await initializeContextModule();
} catch (error) {
  console.error('Context module failed to initialize:', error.message);
  // Handle specific initialization errors
}
```

#### 2. Workflow Execution Timeout
```typescript
// Increase timeout for complex workflows
const result = await core.orchestrator.executeWorkflow('ctx-123', {
  stages: ['context', 'plan', 'confirm', 'trace'],
  timeout_ms: 600000  // 10 minutes
});
```

#### 3. Module Health Issues
```typescript
// Monitor module status
const moduleStatuses = core.orchestrator.getModuleStatuses();
for (const [moduleName, status] of moduleStatuses) {
  if (status.status === 'error') {
    console.error(`Module ${moduleName} has errors:`, status.error_count);
  }
}
```

### Debug Mode

Enable detailed logging:

```typescript
// Set environment variable
process.env.MPLP_LOG_LEVEL = 'debug';

// Or configure programmatically
const core = await initializeCoreModule(moduleServices, {
  enable_event_logging: true,
  orchestrator_config: {
    enable_performance_monitoring: true
  }
});
```

## 📚 Next Steps

1. **Explore Modules**: Learn about individual module capabilities
   - [Context Module](../modules/context/README.md)
   - [Plan Module](../modules/plan/README.md)
   - [Trace Module](../modules/trace/README.md)

2. **Advanced Features**: Dive into advanced functionality
   - [Workflow Examples](./workflow-examples.md)
   - [Configuration Guide](../configuration/configuration.md)
   - [API Reference](../api/)

3. **Development**: Set up development environment
   - [Development Setup](./development-setup.md)
   - [Testing Guide](./testing.md)
   - [Contributing](../../CONTRIBUTING.md)

4. **Production**: Deploy to production
   - [Deployment Guide](../deployment/deployment.md)
   - [Monitoring](../deployment/monitoring.md)
   - [Performance Tuning](../configuration/performance.md)

---

🎉 **Congratulations!** You've successfully set up and run your first MPLP workflow. The system is now ready for building sophisticated multi-agent applications.

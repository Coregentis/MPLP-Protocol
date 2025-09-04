# MPLP v1.0 Troubleshooting Guide

## 📋 Overview

This comprehensive troubleshooting guide helps you diagnose and resolve common issues when working with MPLP v1.0. It covers installation problems, runtime errors, performance issues, and configuration problems.

## 🚨 Common Issues

### 1. Installation and Setup Issues

#### Issue: Module Installation Fails

**Symptoms:**
```bash
npm ERR! peer dep missing: typescript@^5.0.0
npm ERR! Could not resolve dependency
```

**Solutions:**
```bash
# Install TypeScript globally
npm install -g typescript@^5.0.0

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific Node.js version
nvm use 18
npm install
```

#### Issue: Database Connection Fails

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Database connection failed
```

**Solutions:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection settings
psql -h localhost -p 5432 -U mplp_user -d mplp

# Check environment variables
echo $MPLP_DB_HOST
echo $MPLP_DB_PORT
echo $MPLP_DB_USER
```

**Configuration Check:**
```typescript
// Verify database configuration
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.MPLP_DB_HOST || 'localhost',
  port: parseInt(process.env.MPLP_DB_PORT || '5432'),
  username: process.env.MPLP_DB_USER,
  password: process.env.MPLP_DB_PASSWORD,
  database: process.env.MPLP_DB_NAME,
  logging: true // Enable for debugging
});

try {
  await dataSource.initialize();
  console.log('Database connected successfully');
} catch (error) {
  console.error('Database connection failed:', error);
}
```

### 2. Module Initialization Issues

#### Issue: Module Dependencies Not Satisfied

**Symptoms:**
```
Error: Module dependencies not satisfied
Missing dependencies: [context, plan]
```

**Solutions:**
```typescript
// Ensure all modules are initialized in correct order
async function initializeModules() {
  try {
    // Initialize modules with error handling
    const contextModule = await initializeContextModule();
    console.log('✅ Context module initialized');
    
    const planModule = await initializePlanModule();
    console.log('✅ Plan module initialized');
    
    const confirmModule = await initializeConfirmModule();
    console.log('✅ Confirm module initialized');
    
    const traceModule = await initializeTraceModule();
    console.log('✅ Trace module initialized');
    
    const roleModule = await initializeRoleModule();
    console.log('✅ Role module initialized');
    
    const extensionModule = await initializeExtensionModule();
    console.log('✅ Extension module initialized');
    
    // Prepare module services
    const moduleServices = {
      contextService: contextModule.contextManagementService,
      planService: planModule.planManagementService,
      confirmService: confirmModule.confirmManagementService,
      traceService: traceModule.traceManagementService,
      roleService: roleModule.roleManagementService,
      extensionService: extensionModule.extensionManagementService
    };
    
    // Initialize Core last
    const core = await initializeCoreModule(moduleServices);
    console.log('✅ Core module initialized');
    
    return core;
  } catch (error) {
    console.error('❌ Module initialization failed:', error);
    throw error;
  }
}
```

#### Issue: Module Health Check Fails

**Symptoms:**
```
Module health check failed: context module unhealthy
Error: Repository not initialized
```

**Solutions:**
```typescript
// Check module health status
async function checkModuleHealth(core: any) {
  const healthStatus = core.moduleCoordinator.getModuleHealthStatus();
  
  for (const [moduleName, isHealthy] of healthStatus) {
    if (!isHealthy) {
      console.error(`❌ Module ${moduleName} is unhealthy`);
      
      // Get detailed status
      const moduleStatuses = core.orchestrator.getModuleStatuses();
      const moduleStatus = moduleStatuses.get(moduleName);
      
      console.error('Module status:', moduleStatus);
      
      // Attempt to reinitialize unhealthy module
      await reinitializeModule(moduleName);
    } else {
      console.log(`✅ Module ${moduleName} is healthy`);
    }
  }
}

async function reinitializeModule(moduleName: string) {
  console.log(`🔄 Reinitializing ${moduleName} module...`);
  
  try {
    switch (moduleName) {
      case 'context':
        await initializeContextModule();
        break;
      case 'plan':
        await initializePlanModule();
        break;
      // Add other modules as needed
    }
    console.log(`✅ ${moduleName} module reinitialized successfully`);
  } catch (error) {
    console.error(`❌ Failed to reinitialize ${moduleName} module:`, error);
  }
}
```

### 3. Workflow Execution Issues

#### Issue: Workflow Timeout

**Symptoms:**
```
WorkflowTimeoutError: Workflow execution exceeded timeout of 300000ms
Execution ID: exec-123
```

**Solutions:**
```typescript
// Increase timeout for complex workflows
const result = await core.orchestrator.executeWorkflow('complex-context', {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 600000, // 10 minutes instead of 5
  retry_policy: {
    max_attempts: 3,
    delay_ms: 2000,
    backoff_multiplier: 2
  }
});

// Monitor workflow progress
core.orchestrator.addEventListener((event) => {
  if (event.event_type === 'stage_started') {
    console.log(`Stage ${event.stage} started at ${event.timestamp}`);
  }
  if (event.event_type === 'stage_completed') {
    console.log(`Stage ${event.stage} completed in ${event.duration_ms}ms`);
  }
});

// Check for bottlenecks
const activeExecutions = core.orchestrator.getActiveExecutions();
console.log('Active executions:', activeExecutions.length);

activeExecutions.forEach(execution => {
  console.log(`Execution ${execution.execution_id}:`);
  console.log(`  Current stage: ${execution.current_stage}`);
  console.log(`  Started: ${execution.started_at}`);
  console.log(`  Duration: ${Date.now() - new Date(execution.started_at).getTime()}ms`);
});
```

#### Issue: Stage Execution Fails

**Symptoms:**
```
StageExecutionError: Plan stage failed
Error: Plan validation failed - missing required fields
```

**Solutions:**
```typescript
// Add comprehensive error handling
async function executeWorkflowWithErrorHandling(contextId: string) {
  try {
    const result = await core.orchestrator.executeWorkflow(contextId, {
      stages: ['context', 'plan', 'confirm', 'trace'],
      error_handling: {
        continue_on_error: false,
        rollback_on_failure: true,
        notification_enabled: true,
        max_retries: 3
      }
    });
    
    if (result.status === 'failed') {
      console.error('Workflow failed:', result.error);
      
      // Analyze failed stages
      result.stages.forEach(stage => {
        if (stage.status === 'failed') {
          console.error(`Stage ${stage.stage} failed:`, stage.error);
          console.error('Stage data:', stage.data);
        }
      });
      
      // Attempt recovery
      await attemptWorkflowRecovery(contextId, result);
    }
    
    return result;
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

async function attemptWorkflowRecovery(contextId: string, failedResult: any) {
  console.log('🔄 Attempting workflow recovery...');
  
  // Identify successful stages
  const successfulStages = failedResult.stages
    .filter(stage => stage.status === 'completed')
    .map(stage => stage.stage);
  
  // Retry only failed stages
  const failedStages = failedResult.stages
    .filter(stage => stage.status === 'failed')
    .map(stage => stage.stage);
  
  if (failedStages.length > 0) {
    console.log(`Retrying failed stages: ${failedStages.join(', ')}`);
    
    const recoveryResult = await core.orchestrator.executeWorkflow(contextId, {
      stages: failedStages,
      timeout_ms: 120000,
      retry_policy: {
        max_attempts: 2,
        delay_ms: 5000
      }
    });
    
    return recoveryResult;
  }
}
```

### 4. Performance Issues

#### Issue: Slow Workflow Execution

**Symptoms:**
```
Workflow taking longer than expected
Average execution time: 45 seconds (expected: 10 seconds)
```

**Solutions:**
```typescript
// Enable performance monitoring
const core = await initializeCoreModule(moduleServices, {
  orchestrator_config: {
    enable_performance_monitoring: true,
    enable_event_logging: true,
    max_concurrent_executions: 10
  }
});

// Analyze performance metrics
async function analyzePerformance() {
  const metrics = core.orchestrator.getPerformanceMetrics();
  
  console.log('Performance Metrics:');
  console.log(`Average execution time: ${metrics.averageExecutionTime}ms`);
  console.log(`Success rate: ${metrics.successRate * 100}%`);
  console.log(`Concurrent executions: ${metrics.concurrentExecutions}`);
  console.log(`Bottlenecks: ${metrics.bottlenecks.join(', ')}`);
  
  // Identify slow stages
  metrics.stageMetrics.forEach(stage => {
    if (stage.averageTime > 10000) { // > 10 seconds
      console.warn(`⚠️ Slow stage detected: ${stage.name} (${stage.averageTime}ms)`);
    }
  });
}

// Optimize workflow configuration
const optimizedConfig = {
  stages: ['context', 'plan', 'trace'], // Remove unnecessary stages
  parallel_execution: true, // Enable parallel execution
  timeout_ms: 30000,
  retry_policy: {
    max_attempts: 2, // Reduce retry attempts
    delay_ms: 1000
  }
};

// Use workflow templates for better performance
const fastWorkflow = core.workflowManager.getTemplate('fast');
const result = await core.orchestrator.executeWorkflow(contextId, fastWorkflow);
```

#### Issue: Memory Leaks

**Symptoms:**
```
Memory usage continuously increasing
Process killed due to out of memory
```

**Solutions:**
```typescript
// Monitor memory usage
function monitorMemoryUsage() {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log('Memory Usage:');
    console.log(`RSS: ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
    console.log(`Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    console.log(`Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`);
    
    // Alert if memory usage is high
    if (memUsage.heapUsed > 500 * 1024 * 1024) { // > 500MB
      console.warn('⚠️ High memory usage detected');
    }
  }, 30000); // Check every 30 seconds
}

// Cleanup resources properly
async function cleanupResources(core: any) {
  try {
    // Cancel active executions
    const activeExecutions = core.orchestrator.getActiveExecutions();
    for (const execution of activeExecutions) {
      await core.orchestrator.cancelExecution(execution.execution_id);
    }
    
    // Cleanup modules
    await core.cleanup();
    
    console.log('✅ Resources cleaned up successfully');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...');
  await cleanupResources(core);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  await cleanupResources(core);
  process.exit(0);
});
```

### 5. Configuration Issues

#### Issue: Invalid Configuration

**Symptoms:**
```
ConfigurationError: Invalid workflow configuration
Missing required field: stages
```

**Solutions:**
```typescript
// Validate configuration before use
function validateWorkflowConfig(config: any): boolean {
  const requiredFields = ['stages'];
  const validStages = ['context', 'plan', 'confirm', 'trace'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate stages
  if (!Array.isArray(config.stages)) {
    console.error('❌ Stages must be an array');
    return false;
  }
  
  for (const stage of config.stages) {
    if (!validStages.includes(stage)) {
      console.error(`❌ Invalid stage: ${stage}`);
      return false;
    }
  }
  
  // Validate timeout
  if (config.timeout_ms && (config.timeout_ms < 1000 || config.timeout_ms > 3600000)) {
    console.error('❌ Timeout must be between 1 second and 1 hour');
    return false;
  }
  
  return true;
}

// Use configuration validation
const workflowConfig = {
  stages: ['context', 'plan', 'trace'],
  parallel_execution: false,
  timeout_ms: 60000
};

if (validateWorkflowConfig(workflowConfig)) {
  const result = await core.orchestrator.executeWorkflow(contextId, workflowConfig);
} else {
  console.error('❌ Invalid workflow configuration');
}
```

## 🔧 Debugging Tools

### 1. Enable Debug Logging

```bash
# Set environment variable
export MPLP_LOG_LEVEL=debug

# Or in code
process.env.MPLP_LOG_LEVEL = 'debug';
```

### 2. Health Check Endpoint

```typescript
// Add health check to your application
app.get('/health', async (req, res) => {
  try {
    const healthStatus = core.moduleCoordinator.getModuleHealthStatus();
    const allHealthy = Array.from(healthStatus.values()).every(status => status);
    
    if (allHealthy) {
      res.status(200).json({
        status: 'healthy',
        modules: Object.fromEntries(healthStatus),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        modules: Object.fromEntries(healthStatus),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 3. Performance Profiling

```typescript
// Profile workflow execution
async function profileWorkflow(contextId: string) {
  const startTime = process.hrtime.bigint();
  
  const result = await core.orchestrator.executeWorkflow(contextId, {
    stages: ['context', 'plan', 'trace']
  });
  
  const endTime = process.hrtime.bigint();
  const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  
  console.log(`Workflow execution time: ${executionTime}ms`);
  
  // Analyze stage performance
  result.stages.forEach(stage => {
    console.log(`Stage ${stage.stage}: ${stage.duration_ms}ms`);
  });
  
  return result;
}
```

## 📞 Getting Help

### 1. Check Logs
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Debug logs: Enable with `MPLP_LOG_LEVEL=debug`

### 2. Community Support
- [GitHub Issues](https://github.com/your-org/mplp/issues)
- [GitHub Discussions](https://github.com/your-org/mplp/discussions)
- [Documentation](https://docs.mplp.com)

### 3. Reporting Bugs
When reporting bugs, include:
- MPLP version
- Node.js version
- Operating system
- Complete error message
- Steps to reproduce
- Configuration (without sensitive data)

---

This troubleshooting guide covers the most common issues you might encounter with MPLP v1.0. For additional help, please refer to the community resources or file an issue on GitHub.

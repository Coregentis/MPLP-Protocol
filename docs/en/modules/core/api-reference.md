# Core Module API Reference

> **��� Language Navigation**: [English](api-reference.md) | [中文](../../../zh-CN/modules/core/api-reference.md)

**MPLP Ecosystem Central Orchestrator - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Core%20Module-blue.svg)](./README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--core.json-green.svg)](../../schemas/README.md)
[![Status](https://img.shields.io/badge/status-production%20ready-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/core/api-reference.md)

---

## ��� Overview

The Core API provides central coordination functionality for the MPLP ecosystem. CoreOrchestrator, as the core component of the L3 execution layer, is responsible for coordinating all L2 modules, managing workflow execution, allocating system resources, and ensuring overall system health.

## ��� Imports

```typescript
import { 
  initializeCoreOrchestrator,
  CoreOrchestrator,
  CoreOrchestratorOptions,
  WorkflowConfig,
  WorkflowResult
} from 'mplp/modules/core';

// Or use module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const coreModule = mplp.getModule('core');
```

## ���️ Core Interfaces

### **CoreOrchestratorOptions** (Initialization Options)

```typescript
interface CoreOrchestratorOptions {
  // Environment configuration
  environment?: 'development' | 'production' | 'testing';
  
  // Feature toggles
  enableLogging?: boolean;           // Enable logging
  enableMetrics?: boolean;           // Enable performance metrics
  enableCaching?: boolean;           // Enable caching
  
  // Performance configuration
  maxConcurrentWorkflows?: number;   // Maximum concurrent workflows
  workflowTimeout?: number;          // Workflow timeout (ms)
  
  // Module coordination
  enableReservedInterfaces?: boolean; // Enable reserved interfaces
  enableModuleCoordination?: boolean; // Enable module coordination
  
  // Custom configuration
  customConfig?: CoreOrchestratorFactoryConfig;
}
```

### **WorkflowConfig** (Workflow Configuration)

```typescript
interface WorkflowConfig {
  // Workflow stages
  stages: WorkflowStageType[];       // List of execution stages

  // Execution mode
  executionMode: ExecutionModeType;  // 'sequential' | 'parallel' | 'hybrid'
  parallelExecution?: boolean;       // Whether to execute in parallel

  // Priority and timeout
  priority?: Priority;               // 'low' | 'medium' | 'high' | 'critical'
  timeout?: number;                  // Timeout (ms)

  // Error handling
  retryPolicy?: RetryPolicy;         // Retry policy
  errorHandling?: ErrorHandlingConfig; // Error handling configuration
}
```

### **WorkflowResult** (Workflow Result)

```typescript
interface WorkflowResult {
  // Basic information
  workflowId: string;                // Workflow ID
  status: WorkflowStatusType;        // Execution status

  // Execution results
  results: Record<string, any>;      // Results from each stage
  errors?: Error[];                  // List of errors

  // Performance metrics
  executionTime: number;             // Execution time (ms)
  resourceUsage: ResourceUsage;      // Resource usage

  // Metadata
  startTime: Date;                   // Start time
  endTime: Date;                     // End time
  metadata?: Record<string, any>;    // Custom metadata
}
```

## 🚀 Main APIs

### **initializeCoreOrchestrator()**

Initialize a CoreOrchestrator instance.

```typescript
async function initializeCoreOrchestrator(
  options?: CoreOrchestratorOptions
): Promise<CoreOrchestratorResult>
```

**Parameters**:
- `options`: Optional initialization options

**Return Value**:
```typescript
interface CoreOrchestratorResult {
  orchestrator: CoreOrchestrator;           // Orchestrator instance
  interfaceActivator: ReservedInterfaceActivator; // Interface activator
  healthCheck: () => Promise<HealthStatus>; // Health check
  shutdown: () => Promise<void>;            // Shutdown function
  getStatistics: () => Statistics;          // Get statistics
  getModuleInfo: () => ModuleInfo;          // Get module information
}
```

**Example**:
```typescript
const coreResult = await initializeCoreOrchestrator({
  environment: 'production',
  enableLogging: true,
  enableMetrics: true,
  maxConcurrentWorkflows: 1000,
  workflowTimeout: 300000
});

const orchestrator = coreResult.orchestrator;
```

### **CoreOrchestrator.executeWorkflow()**

Execute a complete multi-module workflow.

```typescript
async executeWorkflow(
  requestOrWorkflowId: WorkflowExecutionRequest | string
): Promise<WorkflowResult>
```

**Parameters**:
- `requestOrWorkflowId`: Workflow execution request or workflow ID

**Example**:
```typescript
const result = await orchestrator.executeWorkflow({
  workflowId: 'workflow-001',
  contextId: 'context-001',
  workflowConfig: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    executionMode: 'sequential',
    priority: 'high',
    timeout: 300000
  },
  executionContext: {
    userId: 'user-001',
    sessionId: 'session-001'
  }
});

console.log('Workflow status:', result.status);
console.log('Execution time:', result.executionTime, 'ms');
```

### **CoreOrchestrator.coordinateModules()**

Coordinate operations across multiple modules.

```typescript
async coordinateModules(
  modules: string[],
  operation: string,
  parameters: Record<string, unknown>
): Promise<CoordinationResult>
```

**Parameters**:
- `modules`: List of modules to coordinate
- `operation`: Operation type
- `parameters`: Operation parameters

**Example**:
```typescript
const coordination = await orchestrator.coordinateModules(
  ['context', 'plan', 'role'],
  'sync_state',
  {
    contextId: 'context-001',
    syncMode: 'full'
  }
);
```

### **CoreOrchestrator.manageResources()**

Manage system resource allocation.

```typescript
async manageResources(
  requirements: ResourceRequirements
): Promise<ResourceAllocation>
```

**Parameters**:
- `requirements`: Resource requirements

**Example**:
```typescript
const allocation = await orchestrator.manageResources({
  cpu: { cores: 4, priority: 'high' },
  memory: { size: 8192, unit: 'MB' },
  network: { bandwidth: 1000, unit: 'Mbps' }
});
```

## 📊 Utility APIs

### **Health Check**

```typescript
const health = await coreResult.healthCheck();
console.log('System status:', health.status);
console.log('Active workflows:', health.activeWorkflows);
```

### **Get Statistics**

```typescript
const stats = coreResult.getStatistics();
console.log('Total workflows:', stats.totalWorkflows);
console.log('Success rate:', stats.successRate);
```

### **Get Module Information**

```typescript
const info = coreResult.getModuleInfo();
console.log('Module name:', info.name);
console.log('Supported modules:', info.supportedModules);
```

### **Shutdown Orchestrator**

```typescript
await coreResult.shutdown();
console.log('CoreOrchestrator safely shut down');
```

## 🔧 Advanced Features

### **Reserved Interface Activation**

```typescript
// Activate reserved interfaces with other modules
await coreResult.interfaceActivator.activateInterface('context');
await coreResult.interfaceActivator.activateInterface('plan');
```

### **Custom Workflow Stages**

```typescript
const customWorkflow = await orchestrator.executeWorkflow({
  workflowId: 'custom-001',
  contextId: 'context-001',
  workflowConfig: {
    stages: ['context', 'plan', 'role', 'confirm', 'trace'],
    executionMode: 'hybrid',
    parallelExecution: true,
    priority: 'critical'
  }
});
```

## 📝 Type Definitions

### **WorkflowStageType**

```typescript
type WorkflowStageType =
  | 'context' | 'plan' | 'role' | 'confirm'
  | 'trace' | 'extension' | 'dialog'
  | 'collab' | 'network';
```

### **ExecutionModeType**

```typescript
type ExecutionModeType =
  | 'sequential'  // Sequential execution
  | 'parallel'    // Parallel execution
  | 'hybrid';     // Hybrid mode
```

### **WorkflowStatusType**

```typescript
type WorkflowStatusType =
  | 'pending'     // Pending
  | 'running'     // Running
  | 'completed'   // Completed
  | 'failed'      // Failed
  | 'cancelled';  // Cancelled
```

## 🎯 Best Practices

1. **Production Environment Configuration**
   ```typescript
   const coreResult = await initializeCoreOrchestrator({
     environment: 'production',
     enableMetrics: true,
     enableCaching: true,
     maxConcurrentWorkflows: 1000
   });
   ```

2. **Error Handling**
   ```typescript
   try {
     const result = await orchestrator.executeWorkflow(request);
   } catch (error) {
     console.error('Workflow execution failed:', error);
     // Implement error recovery strategy
   }
   ```

3. **Resource Management**
   ```typescript
   // Release resources after execution
   await coreResult.shutdown();
   ```

---

**Related Documentation**:
- [Configuration Guide](./configuration-guide.md)
- [Implementation Guide](./implementation-guide.md)
- [Integration Examples](./integration-examples.md)
- [Performance Guide](./performance-guide.md)
- [Testing Guide](./testing-guide.md)

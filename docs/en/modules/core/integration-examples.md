# Core Module Integration Examples

> **🌐 Language Navigation**: [English](integration-examples.md) | [中文](../../../zh-CN/modules/core/integration-examples.md)

**CoreOrchestrator Integration with Other Modules - MPLP v1.0 Alpha**

[![Integration](https://img.shields.io/badge/guide-integration%20examples-blue.svg)](./README.md)
[![Version](https://img.shields.io/badge/version-1.0.0--alpha-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)

---

## 🎯 Overview

This document provides complete examples of CoreOrchestrator integration with the other 9 MPLP modules.

## 🔄 Integration with Context Module

### **Create and Manage Context**

```typescript
import { initializeCoreOrchestrator } from 'mplp/modules/core';
import { ContextController } from 'mplp/modules/context';

// 1. Initialize Core and Context
const coreResult = await initializeCoreOrchestrator();
const contextController = new ContextController();

// 2. Create context
const context = await contextController.createContext({
  name: 'Multi-Agent Collaboration Context',
  description: 'Shared context for multi-agent collaboration',
  type: 'collaboration'
});

// 3. Use Core to coordinate context operations
const workflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'context-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context'],
    executionMode: 'sequential'
  },
  executionContext: {
    userId: 'user-001',
    operation: 'context_management'
  }
});
```

## 📋 Integration with Plan Module

### **Planning and Workflow Execution**

```typescript
import { PlanController } from 'mplp/modules/plan';

// 1. Create plan
const planController = new PlanController();
const plan = await planController.createPlan({
  contextId: context.contextId,
  name: 'Multi-Stage Workflow Plan',
  description: 'Complex plan with multiple execution stages',
  planType: 'workflow'
});

// 2. Use Core to execute planning workflow
const planWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'plan-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'plan'],
    executionMode: 'sequential',
    priority: 'high'
  },
  executionContext: {
    userId: 'user-001',
    planId: plan.planId
  }
});
```

## 👥 Integration with Role Module

### **Role Permission Management**

```typescript
import { RoleController } from 'mplp/modules/role';

// 1. Create role
const roleController = new RoleController();
const role = await roleController.createRole({
  contextId: context.contextId,
  name: 'Workflow Administrator',
  description: 'Responsible for managing and executing workflows',
  roleType: 'admin'
});

// 2. Use Core to coordinate role verification
const roleWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'role-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'role'],
    executionMode: 'sequential',
    security: {
      requireAuthorization: true,
      allowedRoles: ['admin']
    }
  },
  executionContext: {
    userId: 'user-001',
    userRoles: ['admin']
  }
});
```

## ✅ Integration with Confirm Module

### **Approval Workflow**

```typescript
import { ConfirmController } from 'mplp/modules/confirm';

// 1. Create approval request
const confirmController = new ConfirmController();
const confirm = await confirmController.createConfirm({
  contextId: context.contextId,
  planId: plan.planId,
  requesterId: 'user-001',
  confirmType: 'approval',
  priority: 'high'
});

// 2. Use Core to execute approval workflow
const approvalWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'approval-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'plan', 'role', 'confirm'],
    executionMode: 'sequential',
    priority: 'high'
  },
  executionContext: {
    userId: 'user-001',
    confirmId: confirm.confirmId
  }
});
```

## 📊 Integration with Trace Module

### **Execution Monitoring and Tracking**

```typescript
import { TraceController } from 'mplp/modules/trace';

// 1. Create trace record
const traceController = new TraceController();
const trace = await traceController.createTrace({
  contextId: context.contextId,
  planId: plan.planId,
  traceType: 'workflow_execution',
  status: 'active'
});

// 2. Use Core to execute complete monitoring workflow
const monitoringWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'monitoring-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    executionMode: 'sequential',
    monitoring: {
      enabled: true,
      collectMetrics: true
    }
  },
  executionContext: {
    userId: 'user-001',
    traceId: trace.traceId
  }
});
```

## 🔌 Integration with Extension Module

### **Extension Management**

```typescript
import { ExtensionController } from 'mplp/modules/extension';

// 1. Register extension
const extensionController = new ExtensionController();
const extension = await extensionController.registerExtension({
  contextId: context.contextId,
  name: 'Custom Workflow Extension',
  extensionType: 'workflow',
  version: '1.0.0'
});

// 2. Use Core to coordinate extension
const extensionWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'extension-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'extension'],
    executionMode: 'sequential'
  },
  executionContext: {
    userId: 'user-001',
    extensionId: extension.extensionId
  }
});
```

## 💬 Integration with Dialog Module

### **Dialog-Driven Workflow**

```typescript
import { DialogController } from 'mplp/modules/dialog';

// 1. Create dialog
const dialogController = new DialogController();
const dialog = await dialogController.createDialog({
  contextId: context.contextId,
  dialogType: 'workflow_interaction',
  participants: ['user-001', 'agent-001']
});

// 2. Use Core to execute dialog-driven workflow
const dialogWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'dialog-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'dialog'],
    executionMode: 'sequential'
  },
  executionContext: {
    userId: 'user-001',
    dialogId: dialog.dialogId
  }
});
```

## 🤝 Integration with Collab Module

### **Multi-Agent Collaboration**

```typescript
import { CollabController } from 'mplp/modules/collab';

// 1. Create collaboration session
const collabController = new CollabController();
const collab = await collabController.createCollaboration({
  contextId: context.contextId,
  collabType: 'multi_agent',
  participants: ['agent-001', 'agent-002', 'agent-003']
});

// 2. Use Core to coordinate multi-agent collaboration
const collabWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'collab-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'collab'],
    executionMode: 'parallel',
    parallelExecution: true
  },
  executionContext: {
    userId: 'user-001',
    collabId: collab.collabId
  }
});
```

## 🌐 Integration with Network Module

### **Distributed Communication**

```typescript
import { NetworkController } from 'mplp/modules/network';

// 1. Establish network connection
const networkController = new NetworkController();
const network = await networkController.createNetwork({
  contextId: context.contextId,
  networkType: 'distributed',
  nodes: ['node-001', 'node-002', 'node-003']
});

// 2. Use Core to coordinate distributed workflow
const networkWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'network-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'network'],
    executionMode: 'parallel',
    distributed: true
  },
  executionContext: {
    userId: 'user-001',
    networkId: network.networkId
  }
});
```

## 🎯 Complete Integration Example

### **End-to-End Multi-Module Workflow**

```typescript
// 1. Initialize all modules
const coreResult = await initializeCoreOrchestrator({
  environment: 'production',
  enableLogging: true,
  enableMetrics: true,
  maxConcurrentWorkflows: 1000
});

// 2. Create complete multi-module workflow
const fullWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'full-workflow-001',
  contextId: 'context-001',
  workflowConfig: {
    // Include all 9 modules
    stages: [
      'context',
      'plan',
      'role',
      'confirm',
      'trace',
      'extension',
      'dialog',
      'collab',
      'network'
    ],
    executionMode: 'hybrid',
    parallelExecution: true,
    priority: 'critical',
    timeout: 600000,
    retryPolicy: {
      maxRetries: 3,
      backoffMs: 1000
    }
  },
  executionContext: {
    userId: 'user-001',
    sessionId: 'session-001',
    metadata: {
      source: 'api',
      version: '1.0.0',
      environment: 'production'
    }
  }
});

// 3. Check execution results
console.log('Workflow status:', fullWorkflow.status);
console.log('Execution time:', fullWorkflow.executionTime, 'ms');
console.log('Stage results:', fullWorkflow.results);

// 4. Get statistics
const stats = coreResult.getStatistics();
console.log('Total workflows:', stats.totalWorkflows);
console.log('Success rate:', stats.successRate);
```

## 🔄 Module Coordination Examples

### **Batch Module Coordination**

```typescript
// Coordinate state synchronization across multiple modules
const coordination = await coreResult.orchestrator.coordinateModules(
  ['context', 'plan', 'role', 'confirm', 'trace'],
  'sync_state',
  {
    contextId: 'context-001',
    syncMode: 'full',
    priority: 'high',
    timeout: 60000
  }
);

console.log('Coordination status:', coordination.status);
console.log('Coordination results:', coordination.results);
```

### **Batch Reserved Interface Activation**

```typescript
// Activate reserved interfaces for all modules
const modules = [
  'context', 'plan', 'role', 'confirm', 'trace',
  'extension', 'dialog', 'collab', 'network'
];

for (const module of modules) {
  await coreResult.interfaceActivator.activateInterface(module);
  console.log(`${module} module reserved interface activated`);
}
```

---

**Related Documentation**:
- [API Reference](./api-reference.md)
- [Configuration Guide](./configuration-guide.md)
- [Implementation Guide](./implementation-guide.md)
- [Performance Guide](./performance-guide.md)
- [Testing Guide](./testing-guide.md)


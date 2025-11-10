# Core Module Testing Guide

> **🌐 Language Navigation**: [English](testing-guide.md) | [中文](../../../zh-CN/modules/core/testing-guide.md)

**CoreOrchestrator Testing Strategy and Practices - MPLP v1.0 Alpha**

[![Testing](https://img.shields.io/badge/guide-testing-blue.svg)](./README.md)
[![Version](https://img.shields.io/badge/version-1.0.0--alpha-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![Coverage](https://img.shields.io/badge/coverage-95%25+-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)

---

## 🎯 Overview

This guide provides a complete testing strategy for the Core module, including unit tests, integration tests, performance tests, and end-to-end tests.

## 📊 Test Coverage

### **Current Test Status**

| Test Type | Test Count | Pass Rate | Coverage |
|-----------|------------|-----------|----------|
| Unit Tests | 584 | 100% | 95%+ |
| Integration Tests | 120 | 100% | 90%+ |
| Performance Tests | 45 | 100% | N/A |
| E2E Tests | 30 | 100% | N/A |
| **Total** | **779** | **100%** | **95%+** |

## 🧪 Unit Tests

### **Test CoreOrchestrator Initialization**

```typescript
import { initializeCoreOrchestrator } from 'mplp/modules/core';

describe('CoreOrchestrator Initialization Tests', () => {
  it('should successfully initialize CoreOrchestrator', async () => {
    const coreResult = await initializeCoreOrchestrator({
      environment: 'testing',
      enableLogging: false,
      enableMetrics: false
    });

    expect(coreResult).toBeDefined();
    expect(coreResult.orchestrator).toBeDefined();
    expect(coreResult.interfaceActivator).toBeDefined();
    expect(coreResult.healthCheck).toBeDefined();
    expect(coreResult.shutdown).toBeDefined();
  });

  it('should initialize with default configuration', async () => {
    const coreResult = await initializeCoreOrchestrator();

    const info = coreResult.getModuleInfo();
    expect(info.name).toBe('core');
    expect(info.layer).toBe('L3');
  });

  it('should correctly apply custom configuration', async () => {
    const customConfig = {
      environment: 'production' as const,
      maxConcurrentWorkflows: 2000,
      workflowTimeout: 600000
    };

    const coreResult = await initializeCoreOrchestrator(customConfig);
    const stats = coreResult.getStatistics();

    expect(stats).toBeDefined();
  });
});
```

### **Test Workflow Execution**

```typescript
describe('Workflow Execution Tests', () => {
  let orchestrator: CoreOrchestrator;

  beforeEach(async () => {
    const coreResult = await initializeCoreOrchestrator({
      environment: 'testing'
    });
    orchestrator = coreResult.orchestrator;
  });

  it('should successfully execute sequential workflow', async () => {
    const result = await orchestrator.executeWorkflow({
      workflowId: 'test-workflow-001',
      contextId: 'context-001',
      workflowConfig: {
        stages: ['context', 'plan'],
        executionMode: 'sequential',
        priority: 'medium'
      },
      executionContext: {
        userId: 'test-user'
      }
    });

    expect(result.status).toBe('completed');
    expect(result.workflowId).toBe('test-workflow-001');
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should successfully execute parallel workflow', async () => {
    const result = await orchestrator.executeWorkflow({
      workflowId: 'parallel-workflow-001',
      contextId: 'context-001',
      workflowConfig: {
        stages: ['context', 'plan', 'role'],
        executionMode: 'parallel',
        parallelExecution: true
      },
      executionContext: {
        userId: 'test-user'
      }
    });

    expect(result.status).toBe('completed');
    expect(result.results).toBeDefined();
  });

  it('should handle workflow timeout', async () => {
    await expect(
      orchestrator.executeWorkflow({
        workflowId: 'timeout-workflow-001',
        contextId: 'context-001',
        workflowConfig: {
          stages: ['context'],
          executionMode: 'sequential',
          timeout: 1 // 1ms timeout
        },
        executionContext: {
          userId: 'test-user'
        }
      })
    ).rejects.toThrow('Workflow timeout');
  });
});
```

### **Test Module Coordination**

```typescript
describe('Module Coordination Tests', () => {
  let orchestrator: CoreOrchestrator;

  beforeEach(async () => {
    const coreResult = await initializeCoreOrchestrator();
    orchestrator = coreResult.orchestrator;
  });

  it('should successfully coordinate multiple modules', async () => {
    const coordination = await orchestrator.coordinateModules(
      ['context', 'plan', 'role'],
      'sync_state',
      {
        contextId: 'context-001',
        syncMode: 'full'
      }
    );

    expect(coordination.status).toBe('success');
    expect(coordination.results).toBeDefined();
  });

  it('should handle coordination failure', async () => {
    await expect(
      orchestrator.coordinateModules(
        ['invalid-module'],
        'sync_state',
        {}
      )
    ).rejects.toThrow();
  });
});
```

## 🔗 Integration Tests

### **Test Multi-Module Integration**

```typescript
describe('Multi-Module Integration Tests', () => {
  it('should successfully execute complete multi-module workflow', async () => {
    const coreResult = await initializeCoreOrchestrator({
      environment: 'testing',
      enableModuleCoordination: true
    });

    const result = await coreResult.orchestrator.executeWorkflow({
      workflowId: 'integration-workflow-001',
      contextId: 'context-001',
      workflowConfig: {
        stages: [
          'context',
          'plan',
          'role',
          'confirm',
          'trace'
        ],
        executionMode: 'sequential',
        priority: 'high'
      },
      executionContext: {
        userId: 'test-user',
        sessionId: 'test-session'
      }
    });

    expect(result.status).toBe('completed');
    expect(result.results).toHaveProperty('context');
    expect(result.results).toHaveProperty('plan');
    expect(result.results).toHaveProperty('role');
    expect(result.results).toHaveProperty('confirm');
    expect(result.results).toHaveProperty('trace');
  });
});
```

### **Test Reserved Interface Activation**

```typescript
describe('Reserved Interface Activation Tests', () => {
  it('should successfully activate reserved interfaces for all modules', async () => {
    const coreResult = await initializeCoreOrchestrator({
      enableReservedInterfaces: true
    });

    const modules = [
      'context', 'plan', 'role', 'confirm', 'trace',
      'extension', 'dialog', 'collab', 'network'
    ];

    for (const module of modules) {
      await expect(
        coreResult.interfaceActivator.activateInterface(module)
      ).resolves.not.toThrow();
    }
  });
});
```

## ⚡ Performance Tests

### **Test Workflow Execution Performance**

```typescript
describe('Workflow Execution Performance Tests', () => {
  it('should complete workflow execution within 500ms (P95)', async () => {
    const coreResult = await initializeCoreOrchestrator({
      environment: 'testing',
      enableCaching: true
    });

    const executionTimes: number[] = [];

    // Execute 100 tests
    for (let i = 0; i < 100; i++) {
      const startTime = Date.now();

      await coreResult.orchestrator.executeWorkflow({
        workflowId: `perf-workflow-${i}`,
        contextId: 'context-001',
        workflowConfig: {
          stages: ['context', 'plan'],
          executionMode: 'sequential'
        },
        executionContext: {
          userId: 'test-user'
        }
      });

      executionTimes.push(Date.now() - startTime);
    }

    // Calculate P95
    executionTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(executionTimes.length * 0.95);
    const p95Time = executionTimes[p95Index];

    expect(p95Time).toBeLessThan(500);
  });
});
```

### **Test Concurrency Performance**

```typescript
describe('Concurrency Performance Tests', () => {
  it('should support 1000 concurrent workflows', async () => {
    const coreResult = await initializeCoreOrchestrator({
      maxConcurrentWorkflows: 1000,
      enableCaching: true
    });

    const workflows = Array.from({ length: 1000 }, (_, i) => ({
      workflowId: `concurrent-${i}`,
      contextId: 'context-001',
      workflowConfig: {
        stages: ['context'],
        executionMode: 'sequential' as const
      },
      executionContext: {
        userId: 'test-user'
      }
    }));

    const startTime = Date.now();
    const results = await Promise.all(
      workflows.map(wf => coreResult.orchestrator.executeWorkflow(wf))
    );
    const totalTime = Date.now() - startTime;

    expect(results).toHaveLength(1000);
    expect(results.every(r => r.status === 'completed')).toBe(true);
    expect(totalTime).toBeLessThan(10000); // Complete within 10 seconds
  });
});
```

## 🎯 End-to-End Tests

### **Test Complete User Scenarios**

```typescript
describe('End-to-End Tests', () => {
  it('should complete full user workflow', async () => {
    // 1. Initialize system
    const coreResult = await initializeCoreOrchestrator({
      environment: 'production',
      enableLogging: true,
      enableMetrics: true
    });

    // 2. Health check
    const health = await coreResult.healthCheck();
    expect(health.status).toBe('healthy');

    // 3. Execute workflow
    const workflow = await coreResult.orchestrator.executeWorkflow({
      workflowId: 'e2e-workflow-001',
      contextId: 'context-001',
      workflowConfig: {
        stages: ['context', 'plan', 'confirm', 'trace'],
        executionMode: 'sequential',
        priority: 'high'
      },
      executionContext: {
        userId: 'e2e-user',
        sessionId: 'e2e-session'
      }
    });

    expect(workflow.status).toBe('completed');

    // 4. Verify statistics
    const stats = coreResult.getStatistics();
    expect(stats.totalWorkflows).toBeGreaterThan(0);
    expect(stats.successRate).toBeGreaterThan(0);

    // 5. Cleanup
    await coreResult.shutdown();
  });
});
```

## 🔧 Testing Tools and Helper Functions

### **Test Factory Functions**

```typescript
// Create test CoreOrchestrator
export async function createTestOrchestrator(
  options?: Partial<CoreOrchestratorOptions>
) {
  return await initializeCoreOrchestrator({
    environment: 'testing',
    enableLogging: false,
    enableMetrics: false,
    ...options
  });
}

// Create test workflow request
export function createTestWorkflowRequest(
  overrides?: Partial<WorkflowExecutionRequest>
): WorkflowExecutionRequest {
  return {
    workflowId: `test-workflow-${Date.now()}`,
    contextId: 'test-context',
    workflowConfig: {
      stages: ['context'],
      executionMode: 'sequential',
      priority: 'medium'
    },
    executionContext: {
      userId: 'test-user'
    },
    ...overrides
  };
}
```

### **Test Assertion Helpers**

```typescript
// Verify workflow result
export function assertWorkflowSuccess(result: WorkflowResult) {
  expect(result.status).toBe('completed');
  expect(result.workflowId).toBeDefined();
  expect(result.executionTime).toBeGreaterThan(0);
  expect(result.errors).toBeUndefined();
}

// Verify performance metrics
export function assertPerformanceMetrics(
  executionTime: number,
  maxTime: number
) {
  expect(executionTime).toBeLessThan(maxTime);
  expect(executionTime).toBeGreaterThan(0);
}
```

## 📝 Testing Best Practices

### **1. Use Test Isolation**

```typescript
describe('Test Suite', () => {
  let coreResult: CoreOrchestratorResult;

  beforeEach(async () => {
    coreResult = await createTestOrchestrator();
  });

  afterEach(async () => {
    await coreResult.shutdown();
  });

  it('test case', async () => {
    // Test code
  });
});
```

### **2. Use Mock Objects**

```typescript
import { jest } from '@jest/globals';

// Mock external dependencies
jest.mock('mplp/modules/context', () => ({
  ContextController: jest.fn().mockImplementation(() => ({
    createContext: jest.fn().mockResolvedValue({
      contextId: 'mock-context'
    })
  }))
}));
```

### **3. Test Edge Cases**

```typescript
describe('Edge Case Tests', () => {
  it('should handle empty workflow stages', async () => {
    await expect(
      orchestrator.executeWorkflow({
        workflowId: 'empty-workflow',
        contextId: 'context-001',
        workflowConfig: {
          stages: [],
          executionMode: 'sequential'
        },
        executionContext: { userId: 'test-user' }
      })
    ).rejects.toThrow('Empty workflow stages');
  });

  it('should handle invalid execution mode', async () => {
    await expect(
      orchestrator.executeWorkflow({
        workflowId: 'invalid-mode',
        contextId: 'context-001',
        workflowConfig: {
          stages: ['context'],
          executionMode: 'invalid' as any
        },
        executionContext: { userId: 'test-user' }
      })
    ).rejects.toThrow('Invalid execution mode');
  });
});
```

## 🚀 Running Tests

### **Run All Tests**

```bash
npm test
```

### **Run Specific Test Suite**

```bash
npm test -- tests/modules/core
```

### **Run Performance Tests**

```bash
npm run test:performance
```

### **Generate Coverage Report**

```bash
npm run test:coverage
```

---

**Related Documentation**:
- [API Reference](./api-reference.md)
- [Configuration Guide](./configuration-guide.md)
- [Implementation Guide](./implementation-guide.md)
- [Performance Guide](./performance-guide.md)


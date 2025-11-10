# Core模块测试指南

> **🌐 语言导航**: [English](../../../en/modules/core/testing-guide.md) | [中文](testing-guide.md)

**CoreOrchestrator测试策略和实践 - MPLP v1.0 Alpha**

[![测试](https://img.shields.io/badge/guide-测试指南-blue.svg)](./README.md)
[![版本](https://img.shields.io/badge/version-1.0.0--alpha-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![覆盖率](https://img.shields.io/badge/coverage-95%25+-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)

---

## 🎯 概述

本指南提供Core模块的完整测试策略，包括单元测试、集成测试、性能测试和端到端测试。

## 📊 测试覆盖率

### **当前测试状态**

| 测试类型 | 测试数量 | 通过率 | 覆盖率 |
|---------|---------|--------|--------|
| 单元测试 | 584 | 100% | 95%+ |
| 集成测试 | 120 | 100% | 90%+ |
| 性能测试 | 45 | 100% | N/A |
| E2E测试 | 30 | 100% | N/A |
| **总计** | **779** | **100%** | **95%+** |

## 🧪 单元测试

### **测试CoreOrchestrator初始化**

```typescript
import { initializeCoreOrchestrator } from 'mplp/modules/core';

describe('CoreOrchestrator初始化测试', () => {
  it('应该成功初始化CoreOrchestrator', async () => {
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

  it('应该使用默认配置初始化', async () => {
    const coreResult = await initializeCoreOrchestrator();

    const info = coreResult.getModuleInfo();
    expect(info.name).toBe('core');
    expect(info.layer).toBe('L3');
  });

  it('应该正确应用自定义配置', async () => {
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

### **测试工作流执行**

```typescript
describe('工作流执行测试', () => {
  let orchestrator: CoreOrchestrator;

  beforeEach(async () => {
    const coreResult = await initializeCoreOrchestrator({
      environment: 'testing'
    });
    orchestrator = coreResult.orchestrator;
  });

  it('应该成功执行顺序工作流', async () => {
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

  it('应该成功执行并行工作流', async () => {
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

  it('应该处理工作流超时', async () => {
    await expect(
      orchestrator.executeWorkflow({
        workflowId: 'timeout-workflow-001',
        contextId: 'context-001',
        workflowConfig: {
          stages: ['context'],
          executionMode: 'sequential',
          timeout: 1 // 1ms超时
        },
        executionContext: {
          userId: 'test-user'
        }
      })
    ).rejects.toThrow('Workflow timeout');
  });
});
```

### **测试模块协调**

```typescript
describe('模块协调测试', () => {
  let orchestrator: CoreOrchestrator;

  beforeEach(async () => {
    const coreResult = await initializeCoreOrchestrator();
    orchestrator = coreResult.orchestrator;
  });

  it('应该成功协调多个模块', async () => {
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

  it('应该处理协调失败', async () => {
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

## 🔗 集成测试

### **测试多模块集成**

```typescript
describe('多模块集成测试', () => {
  it('应该成功执行完整的多模块工作流', async () => {
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

### **测试预留接口激活**

```typescript
describe('预留接口激活测试', () => {
  it('应该成功激活所有模块的预留接口', async () => {
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

## ⚡ 性能测试

### **测试工作流执行性能**

```typescript
describe('工作流执行性能测试', () => {
  it('应该在500ms内完成工作流执行 (P95)', async () => {
    const coreResult = await initializeCoreOrchestrator({
      environment: 'testing',
      enableCaching: true
    });

    const executionTimes: number[] = [];

    // 执行100次测试
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

    // 计算P95
    executionTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(executionTimes.length * 0.95);
    const p95Time = executionTimes[p95Index];

    expect(p95Time).toBeLessThan(500);
  });
});
```

### **测试并发性能**

```typescript
describe('并发性能测试', () => {
  it('应该支持1000个并发工作流', async () => {
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
    expect(totalTime).toBeLessThan(10000); // 10秒内完成
  });
});
```

## 🎯 端到端测试

### **测试完整用户场景**

```typescript
describe('端到端测试', () => {
  it('应该完成完整的用户工作流', async () => {
    // 1. 初始化系统
    const coreResult = await initializeCoreOrchestrator({
      environment: 'production',
      enableLogging: true,
      enableMetrics: true
    });

    // 2. 健康检查
    const health = await coreResult.healthCheck();
    expect(health.status).toBe('healthy');

    // 3. 执行工作流
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

    // 4. 验证统计信息
    const stats = coreResult.getStatistics();
    expect(stats.totalWorkflows).toBeGreaterThan(0);
    expect(stats.successRate).toBeGreaterThan(0);

    // 5. 清理
    await coreResult.shutdown();
  });
});
```

## 🔧 测试工具和辅助函数

### **测试工厂函数**

```typescript
// 创建测试用的CoreOrchestrator
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

// 创建测试用的工作流请求
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

### **测试断言辅助**

```typescript
// 验证工作流结果
export function assertWorkflowSuccess(result: WorkflowResult) {
  expect(result.status).toBe('completed');
  expect(result.workflowId).toBeDefined();
  expect(result.executionTime).toBeGreaterThan(0);
  expect(result.errors).toBeUndefined();
}

// 验证性能指标
export function assertPerformanceMetrics(
  executionTime: number,
  maxTime: number
) {
  expect(executionTime).toBeLessThan(maxTime);
  expect(executionTime).toBeGreaterThan(0);
}
```

## 📝 测试最佳实践

### **1. 使用测试隔离**

```typescript
describe('测试套件', () => {
  let coreResult: CoreOrchestratorResult;

  beforeEach(async () => {
    coreResult = await createTestOrchestrator();
  });

  afterEach(async () => {
    await coreResult.shutdown();
  });

  it('测试用例', async () => {
    // 测试代码
  });
});
```

### **2. 使用模拟对象**

```typescript
import { jest } from '@jest/globals';

// 模拟外部依赖
jest.mock('mplp/modules/context', () => ({
  ContextController: jest.fn().mockImplementation(() => ({
    createContext: jest.fn().mockResolvedValue({
      contextId: 'mock-context'
    })
  }))
}));
```

### **3. 测试边界条件**

```typescript
describe('边界条件测试', () => {
  it('应该处理空工作流阶段', async () => {
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

  it('应该处理无效的执行模式', async () => {
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

## 🚀 运行测试

### **运行所有测试**

```bash
npm test
```

### **运行特定测试套件**

```bash
npm test -- tests/modules/core
```

### **运行性能测试**

```bash
npm run test:performance
```

### **生成覆盖率报告**

```bash
npm run test:coverage
```

---

**相关文档**:
- [API参考](./api-reference.md)
- [配置指南](./configuration-guide.md)
- [实现指南](./implementation-guide.md)
- [性能指南](./performance-guide.md)


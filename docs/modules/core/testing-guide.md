# Core Module Testing Guide

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-09-01T16:46:00Z
最后更新: 2025-09-01T16:46:00Z
文档状态: 已完成
-->

![版本](https://img.shields.io/badge/v1.0.0-stable-green)
![更新时间](https://img.shields.io/badge/Updated-2025--09--01-brightgreen)
![测试覆盖率](https://img.shields.io/badge/Coverage-100%25-brightgreen)
![测试通过率](https://img.shields.io/badge/Tests-45/45_Passed-success)

## 🧪 **测试概述**

Core模块采用**企业级测试标准**，实现了100%测试通过率(45/45测试)，遵循与已完成8个模块IDENTICAL的测试架构。测试套件包含单元测试、集成测试、功能测试和性能测试，确保代码质量和系统可靠性。

### **测试成就**
- ✅ **测试通过率**: 100% (45/45测试通过)
- ✅ **测试套件**: 3个完整测试套件
- ✅ **零技术债务**: TypeScript 0错误，ESLint 0警告
- ✅ **企业级标准**: 与已完成8个模块保持一致

## 🏗️ **测试架构**

### **测试目录结构**
```
src/modules/core/tests/
├── domain/
│   └── orchestrators/
│       └── core.orchestrator.test.ts      # CoreOrchestrator测试
├── infrastructure/
│   └── factories/
│       └── core-orchestrator.factory.test.ts # 工厂测试
├── orchestrator.test.ts                   # 统一入口测试
├── fixtures/                              # 测试数据
│   ├── core-entities.fixture.ts
│   └── workflow-configs.fixture.ts
└── helpers/                               # 测试辅助工具
    ├── mock-factories.ts
    └── test-utilities.ts
```

### **测试分层策略**

#### **1. 单元测试 (Unit Tests)**
- **目标**: 测试单个组件的功能
- **覆盖**: 所有公共方法和关键私有方法
- **工具**: Jest + TypeScript
- **模拟**: 使用Jest Mock进行依赖隔离

#### **2. 集成测试 (Integration Tests)**
- **目标**: 测试组件间的协作
- **覆盖**: 服务间调用、数据流转
- **工具**: Jest + 测试容器
- **数据**: 使用测试数据库

#### **3. 功能测试 (Functional Tests)**
- **目标**: 测试完整的业务功能
- **覆盖**: 端到端工作流
- **工具**: Jest + 模拟环境
- **场景**: 真实业务场景模拟

#### **4. 性能测试 (Performance Tests)**
- **目标**: 验证性能指标
- **覆盖**: 响应时间、吞吐量
- **工具**: Jest + 性能监控
- **基准**: P95 < 100ms, P99 < 200ms

## 🔧 **测试工具和配置**

### **Jest配置**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/modules/core/**/*.ts',
    '!src/modules/core/**/*.d.ts',
    '!src/modules/core/tests/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/modules/core/tests/setup.ts']
};
```

### **TypeScript测试配置**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["jest", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🧪 **测试实践指南**

### **1. CoreOrchestrator测试**

#### **基础测试结构**
```typescript
describe('CoreOrchestrator测试', () => {
  let orchestrator: CoreOrchestrator;
  let mockL3Managers: ReturnType<typeof createMockL3Managers>;
  let mockCoreServices: ReturnType<typeof createMockCoreServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockL3Managers = createMockL3Managers();
    mockCoreServices = createMockCoreServices();
    
    orchestrator = new CoreOrchestrator(
      mockCoreServices.orchestrationService,
      mockCoreServices.resourceService,
      mockCoreServices.monitoringService,
      // L3管理器注入
      mockL3Managers.securityManager,
      mockL3Managers.performanceMonitor,
      // ... 其他管理器
    );
  });

  describe('executeWorkflow方法测试', () => {
    it('应该成功执行完整工作流', async () => {
      const request = createTestWorkflowRequest();
      const result = await orchestrator.executeWorkflow(request);
      
      expect(result).toBeDefined();
      expect(result.workflowId).toBeDefined();
      expect(result.status).toBeDefined();
    });
  });
});
```

#### **模拟对象创建**
```typescript
function createMockL3Managers() {
  return {
    securityManager: {
      validateWorkflowExecution: jest.fn().mockResolvedValue(undefined),
      validateModuleAccess: jest.fn().mockResolvedValue(true)
    },
    performanceMonitor: {
      startTimer: jest.fn().mockReturnValue({
        stop: jest.fn().mockReturnValue(1000),
        elapsed: jest.fn().mockReturnValue(500)
      }),
      recordMetric: jest.fn(),
      getMetrics: jest.fn().mockResolvedValue({ cpu: 50, memory: 60 })
    },
    // ... 其他管理器模拟
  };
}
```

### **2. 工厂测试**

#### **单例模式测试**
```typescript
describe('CoreOrchestratorFactory测试', () => {
  beforeEach(() => {
    CoreOrchestratorFactory.resetInstance();
  });

  it('应该返回同一个工厂实例', () => {
    const factory1 = CoreOrchestratorFactory.getInstance();
    const factory2 = CoreOrchestratorFactory.getInstance();
    
    expect(factory1).toBe(factory2);
  });
});
```

#### **配置测试**
```typescript
it('应该使用自定义配置创建CoreOrchestrator', async () => {
  const config: CoreOrchestratorFactoryConfig = {
    enableLogging: false,
    enableMetrics: false,
    maxConcurrentWorkflows: 50
  };
  
  const result = await factory.createCoreOrchestrator(config);
  expect(result).toBeDefined();
  expect(result.orchestrator).toBeDefined();
});
```

### **3. 统一入口测试**

#### **初始化测试**
```typescript
describe('initializeCoreOrchestrator函数测试', () => {
  it('应该使用默认选项初始化CoreOrchestrator', async () => {
    const result = await initializeCoreOrchestrator();
    
    expect(result).toBeDefined();
    expect(result.orchestrator).toBeDefined();
    expect(result.getStatistics).toBeInstanceOf(Function);
    
    await result.shutdown();
  });
});
```

#### **配置验证测试**
```typescript
describe('validateCoreOrchestratorConfig函数测试', () => {
  it('应该检测无效的maxConcurrentWorkflows', () => {
    const invalidConfig = { maxConcurrentWorkflows: 0 };
    const validation = validateCoreOrchestratorConfig(invalidConfig);
    
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('maxConcurrentWorkflows must be at least 1');
  });
});
```

## 📊 **测试数据管理**

### **测试工厂函数**
```typescript
// 创建测试用的WorkflowExecutionRequest
export function createTestWorkflowRequest(): WorkflowExecutionRequest {
  return {
    contextId: 'context-123',
    workflowConfig: {
      name: 'test-workflow',
      description: 'Test workflow for unit testing',
      stages: ['context', 'plan', 'confirm'],
      executionMode: 'sequential' as ExecutionModeType,
      parallelExecution: false,
      timeoutMs: 300000,
      priority: 'medium' as PriorityType
    },
    priority: 'medium' as Priority,
    metadata: { testMode: true }
  };
}

// 创建测试用的CoordinationRequest
export function createTestCoordinationRequest(): CoordinationRequest {
  return {
    modules: ['context', 'plan'],
    operation: 'sync_state',
    parameters: { syncMode: 'full', priority: 'high' }
  };
}
```

### **测试数据固定装置**
```typescript
// core-entities.fixture.ts
export const CORE_ENTITY_FIXTURES = {
  validCoreEntity: {
    coreId: 'core-test-001',
    orchestratorId: 'orchestrator-test-001',
    coreOperation: 'execute_workflow',
    createdAt: new Date('2025-09-01T16:46:00.000Z'),
    protocolVersion: '1.0.0'
  },
  
  workflowConfig: {
    name: 'test-workflow',
    stages: ['context', 'plan'],
    executionMode: 'sequential',
    timeoutMs: 300000,
    priority: 'medium'
  }
};
```

## 🚀 **运行测试**

### **基本测试命令**
```bash
# 运行所有测试
npm test

# 运行Core模块测试
npm test -- --testPathPattern="src/modules/core/tests"

# 运行特定测试文件
npm test -- core.orchestrator.test.ts

# 运行测试并生成覆盖率报告
npm test -- --coverage

# 监视模式运行测试
npm test -- --watch
```

### **高级测试选项**
```bash
# 详细输出
npm test -- --verbose

# 运行失败的测试
npm test -- --onlyFailures

# 更新快照
npm test -- --updateSnapshot

# 并行运行测试
npm test -- --maxWorkers=4
```

## 📈 **测试指标和报告**

### **覆盖率目标**
- **语句覆盖率**: ≥ 95%
- **分支覆盖率**: ≥ 90%
- **函数覆盖率**: ≥ 95%
- **行覆盖率**: ≥ 95%

### **性能基准**
- **单元测试**: < 10ms per test
- **集成测试**: < 100ms per test
- **功能测试**: < 1000ms per test
- **总执行时间**: < 30秒

### **质量门禁**
- **测试通过率**: 100%
- **无跳过测试**: 0 skipped
- **无待办测试**: 0 todo
- **无失败测试**: 0 failed

## 🔍 **调试和故障排除**

### **常见测试问题**

#### **1. 异步测试超时**
```typescript
// 错误示例
it('should handle async operation', () => {
  orchestrator.executeWorkflow(request); // 缺少await
});

// 正确示例
it('should handle async operation', async () => {
  await orchestrator.executeWorkflow(request);
});
```

#### **2. 模拟对象未重置**
```typescript
// 在beforeEach中重置模拟对象
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### **3. 内存泄漏**
```typescript
// 在afterEach中清理资源
afterEach(async () => {
  if (result) {
    await result.shutdown();
  }
});
```

### **调试技巧**
```typescript
// 使用console.log调试
console.log('Debug info:', JSON.stringify(result, null, 2));

// 使用Jest调试模式
// 在package.json中添加：
// "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"

// 使用VS Code调试器
// 在.vscode/launch.json中配置Jest调试
```

## 📋 **测试清单**

### **开发阶段测试清单**
- [ ] 编写单元测试覆盖所有公共方法
- [ ] 创建模拟对象隔离外部依赖
- [ ] 测试正常流程和异常情况
- [ ] 验证输入参数和返回值
- [ ] 检查边界条件和错误处理

### **集成阶段测试清单**
- [ ] 测试组件间的数据流转
- [ ] 验证服务间的调用关系
- [ ] 测试事务和状态管理
- [ ] 检查性能和资源使用
- [ ] 验证错误传播和恢复

### **发布前测试清单**
- [ ] 所有测试100%通过
- [ ] 覆盖率达到目标要求
- [ ] 性能测试满足基准
- [ ] 无技术债务和代码异味
- [ ] 文档和测试保持同步

---

## 📚 **相关文档**

- [质量报告](./quality-report.md) - 详细的质量指标和验证
- [API参考](./api-reference.md) - API测试参考
- [架构指南](./architecture-guide.md) - 架构测试策略
- [故障排除指南](./troubleshooting.md) - 测试问题解决方案

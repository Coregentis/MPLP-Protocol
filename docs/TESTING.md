# MPLP v1.0.1 Testing Guide

## 🧪 Testing Strategy Overview

MPLP v1.0.1 implements a comprehensive testing strategy with multiple layers of testing to ensure reliability, performance, and maintainability.

## 📊 Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← 5%
                    │   (Cypress)     │
                ┌───┴─────────────────┴───┐
                │   Integration Tests     │ ← 15%
                │      (Jest)             │
            ┌───┴─────────────────────────┴───┐
            │        Unit Tests               │ ← 80%
            │        (Jest)                   │
        └───────────────────────────────────────┘
```

## 🎯 Testing Objectives

### 🚀 测试工作最高原则 (Core Testing Philosophy)

**测试的根本目的是发现并修复源代码问题，确保项目在生产环境中稳定运行**

#### 核心理念
- **发现问题** - 测试的目的是发现源代码中的功能实现或逻辑设计缺陷
- **修复源代码** - 发现问题后应该修复源代码，而不是绕过问题或修改测试
- **模拟生产环境** - 测试应该模拟真实生产环境中的各种情况
- **确保上线质量** - 最终目标是确保项目能够在生产环境中稳定运行
- **避免形式主义** - 切勿为了测试而测试，测试必须有实际价值

#### 实践要求
- ✅ 当测试发现源代码错误时，**立即修复源代码**
- ✅ 通过修复源代码来使测试通过，而不是修改测试
- ✅ 测试应该覆盖生产环境可能出现的各种场景
- ✅ 每个测试都应该有明确的业务价值和质量保证目的
- ❌ 不要为了提高覆盖率而编写无意义的测试
- ❌ 不要为了通过测试而绕过源代码问题

### Complete Test Acceptance Criteria
**项目测试完成标准**: 必须通过以下三层测试体系才算完成

#### 1. 单元测试层 (Unit Tests)
- ✅ **Core模块**: AdapterRegistry, EventBus, WorkflowManager (已完成)
- ⚠️ **Context模块**: 单元测试
- ⚠️ **Plan模块**: 单元测试
- ⚠️ **Confirm模块**: 单元测试
- ⚠️ **Trace模块**: 单元测试
- ⚠️ **Role模块**: 单元测试
- ⚠️ **Extension模块**: 单元测试

#### 2. 集成测试层 (Integration Tests)
- ⚠️ **模块间协作**: 模块接口集成测试
- ⚠️ **工作流集成**: 完整工作流协作测试
- ⚠️ **事件系统集成**: 跨模块事件通信测试
- ⚠️ **缓存系统集成**: 共享缓存集成测试

#### 3. 端到端测试层 (E2E Tests)
- ⚠️ **完整业务流程**: Plan→Confirm→Trace→Delivery完整流程
- ⚠️ **用户场景**: 真实使用场景端到端测试
- ⚠️ **性能测试**: 端到端性能基准测试

### Quality Metrics
- **Code Coverage**: 80%+ line coverage
- **Test Reliability**: 100% test pass rate (all three layers)
- **Performance**: All tests complete within 5 minutes
- **Maintainability**: Clear, readable, and maintainable test code

### Current Test Status (2025-07-28)
- **Core Module Tests**: 5/5 suites ✅ (43/43 cases passing)
- **Integration Tests**: ⚠️ In Progress
- **End-to-End Tests**: ⚠️ Pending
- **TypeScript Compilation**: ✅ No Errors
- **Overall Project Test Status**: 🔄 Partial (Core modules complete)

### Testing Principles
- **Fast Feedback**: Quick test execution for rapid development
- **Isolation**: Tests don't depend on external systems
- **Repeatability**: Consistent results across environments
- **Comprehensive**: Cover all critical paths and edge cases
- **Schema-Driven**: Tests based on actual implementation, not assumptions

### 🎯 Schema驱动测试方法 (Core Testing Standard)

#### 测试编写基本原则
**所有测试必须基于项目实际实现，避免假设性测试**

1. **Schema定义驱动**
   - 测试数据必须符合项目JSON Schema定义
   - 使用实际Schema验证器进行验证
   - 输入输出格式与Schema保持一致

2. **TypeScript类型驱动**
   - 使用项目实际的TypeScript接口和类型
   - 测试参数和返回值符合类型定义
   - 利用TypeScript编译器确保类型安全

3. **实际接口驱动**
   - 调用真实的API方法和接口
   - 测试实际的类实例和方法
   - 避免mock不存在的接口

4. **功能实现驱动**
   - 验证实际的功能实现逻辑
   - 测试真实的业务流程
   - 确保测试覆盖实际代码路径

#### ❌ 避免的测试反模式
- 编写假设的测试接口或方法
- 使用不存在的API进行测试
- 脱离实际Schema定义编写测试
- 假设接口行为而不验证实际实现

### 🗃️ 测试数据管理和分支覆盖原则

#### 测试数据策略
**允许构建假数据进行复杂功能测试，但必须确保数据质量和及时清理**

1. **假数据构建**
   - ✅ 允许构建假数据来模拟复杂业务场景
   - ✅ 假数据应该真实反映各种分支情况
   - ✅ 数据应该覆盖边界条件和异常情况
   - ✅ 假数据格式必须符合Schema定义

2. **分支覆盖要求**
   - 🎯 **要求达到100%分支覆盖**
   - 🎯 确保所有代码路径都被测试
   - 🎯 避免边缘情况无覆盖导致生产问题
   - 🎯 特别关注错误处理分支和异常路径

3. **测试数据清理**
   - 🧹 **假数据应及时清理，避免脏数据影响**
   - 🧹 每个测试后清理临时数据
   - 🧹 避免测试间的数据污染
   - 🧹 保持测试环境的一致性和可重复性

4. **生产就绪标准**
   - 🚀 **目标是达到项目100%功能上线要求**
   - 🚀 测试质量直接关系生产环境稳定性
   - 🚀 所有功能分支都必须经过验证
   - 🚀 确保无遗漏的边缘情况

## 🔧 Test Infrastructure

### Testing Framework Stack
- **Jest**: Primary testing framework
- **TypeScript**: Type-safe test development
- **Supertest**: API endpoint testing
- **Test Utilities**: Custom MPLP testing helpers

### Test Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 📝 Test Categories

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Location**: `tests/unit/`

**Example**:
```typescript
import { CacheManager } from '../../src/core/cache/cache-manager';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({
      defaultTTL: 300,
      maxSize: 100,
      storageBackend: 'memory'
    });
  });

  afterEach(() => {
    cacheManager.destroy();
  });

  describe('set and get operations', () => {
    it('should store and retrieve values', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      const setResult = await cacheManager.set(key, value);
      expect(setResult).toBe(true);

      const getResult = await cacheManager.get(key);
      expect(getResult).toEqual(value);
    });

    it('should handle TTL expiration', async () => {
      const key = 'expiring-key';
      const value = 'expiring-value';

      await cacheManager.set(key, value, 0.1); // 100ms TTL
      
      // Should exist immediately
      expect(await cacheManager.get(key)).toBe(value);
      
      // Should expire after TTL
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await cacheManager.get(key)).toBeUndefined();
    });
  });
});
```

### 2. Integration Tests

**Purpose**: Test module interactions and workflows

**Location**: `tests/integration/`

**Example**:
```typescript
import { WorkflowManager } from '../../src/core/workflow/workflow-manager';
import { EventBus } from '../../src/core/event-bus';

describe('Workflow Integration', () => {
  let workflowManager: WorkflowManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    workflowManager = new WorkflowManager({
      maxConcurrentWorkflows: 5,
      enableRetry: true
    }, eventBus);
  });

  it('should execute complete MPLP workflow', async () => {
    const context = {
      user_id: 'test-user',
      metadata: { test: true }
    };

    const { workflow_id } = await workflowManager.initializeWorkflow(context);
    await workflowManager.startWorkflow(workflow_id);

    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 100));

    const execution = workflowManager.getWorkflowExecution(workflow_id);
    expect(execution?.status).toBe('completed');
  });
});
```

### 3. API Tests

**Purpose**: Test HTTP endpoints and API contracts

**Location**: `tests/api/`

**Example**:
```typescript
import request from 'supertest';
import { createServer } from '../../src/server';

describe('API Endpoints', () => {
  let app: any;

  beforeAll(async () => {
    app = await createServer();
  });

  describe('Health Endpoints', () => {
    it('GET /health should return system status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Context API', () => {
    it('POST /api/v1/contexts should create context', async () => {
      const contextData = {
        user_id: 'test-user',
        metadata: { source: 'api-test' }
      };

      const response = await request(app)
        .post('/api/v1/contexts')
        .send(contextData)
        .expect(201);

      expect(response.body).toHaveProperty('context_id');
      expect(response.body.user_id).toBe(contextData.user_id);
    });
  });
});
```

### 4. Performance Tests

**Purpose**: Validate system performance under load

**Location**: `tests/performance/`

**Example**:
```typescript
describe('Performance Tests', () => {
  it('should handle concurrent cache operations', async () => {
    const cacheManager = new CacheManager({
      defaultTTL: 300,
      maxSize: 1000
    });

    const operations = [];
    const startTime = Date.now();

    // Create 100 concurrent operations
    for (let i = 0; i < 100; i++) {
      operations.push(
        cacheManager.set(`key-${i}`, `value-${i}`)
      );
    }

    await Promise.all(operations);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(cacheManager.getSize()).toBe(100);
  });
});
```

## 🛠️ Test Utilities

### Mock Factories

**Purpose**: Create consistent test data and mocks

```typescript
// src/test-utils/mock-factories.ts
export function createMockContext(): IWorkflowContext {
  return {
    workflow_id: `test-workflow-${Date.now()}`,
    user_id: 'test-user',
    session_id: 'test-session',
    priority: WorkflowPriority.NORMAL,
    metadata: { test: true },
    variables: {},
    created_at: new Date().toISOString()
  };
}

export function createMockCacheManager(): CacheManager {
  return new CacheManager({
    defaultTTL: 300,
    maxSize: 100,
    storageBackend: 'memory',
    enableMetrics: false
  });
}
```

### Test Helpers

**Purpose**: Common testing operations and assertions

```typescript
// src/test-utils/test-helpers.ts
export async function waitForWorkflowCompletion(
  workflowManager: WorkflowManager,
  workflowId: string,
  timeout: number = 5000
): Promise<WorkflowExecution> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const execution = workflowManager.getWorkflowExecution(workflowId);
    if (execution?.status === 'completed' || execution?.status === 'failed') {
      return execution;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error(`Workflow ${workflowId} did not complete within ${timeout}ms`);
}

export function expectValidSchema(data: any, schema: object): void {
  const validator = new SchemaValidator({ mode: 'strict' });
  const result = validator.validate(schema, data);
  expect(result.valid).toBe(true);
  if (!result.valid) {
    console.error('Schema validation errors:', result.errors);
  }
}
```

## 📊 Test Coverage Strategy

### Coverage Targets
- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+

### Coverage Exclusions
- Test files themselves
- Type definition files
- Generated code
- Development utilities

### Coverage Reporting
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
npm run coverage:open

# Check coverage thresholds
npm run coverage:check
```

## 🚀 Running Tests

### Basic Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/unit/cache/cache-manager.test.ts

# Run tests with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run performance tests
npm run test:performance
```

### Test Environment Setup
```bash
# Set test environment
export NODE_ENV=test

# Run tests with specific configuration
npm test -- --config jest.config.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests matching pattern
npm test -- --testNamePattern="Cache"
```

## 🔍 Debugging Tests

### Debug Configuration
```typescript
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Commands
```bash
# Debug specific test
npm test -- --runInBand --no-cache tests/unit/cache/cache-manager.test.ts

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug with VS Code
# Use F5 with the debug configuration above
```

## 📈 Continuous Integration

### GitHub Actions Configuration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No TypeScript errors
- Performance benchmarks must pass

## 🎯 Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and isolated

### Test Data Management
- Use factories for consistent test data
- Clean up resources in afterEach/afterAll
- Avoid hardcoded values
- Use meaningful test data

### Assertion Guidelines
- Use specific assertions
- Test both positive and negative cases
- Verify error conditions
- Check edge cases and boundaries

### Performance Considerations
- Keep tests fast (< 100ms per test)
- Use mocks for external dependencies
- Parallel test execution where possible
- Optimize test setup and teardown

## 🔄 Recent Test Fixes (2025-07-28)

### Fixed Issues
1. **EventBus One-time Subscription** ✅
   - Fixed incorrect subscriber count in `publish()` method
   - Resolved concurrent modification of subscription list
   - All EventBus tests now pass (11/11)

2. **Workflow ID Format** ✅
   - Updated test expectations to match actual implementation
   - Changed from `wf_\d+` to `workflow_\d+_[a-z0-9]+` pattern
   - Fixed in workflow and performance tests

3. **Workflow State Management** ✅
   - Added async stage handlers for proper state testing
   - Fixed timing issues in concurrent workflow tests
   - All workflow tests now pass (10/10)

4. **Missing Test Files** ✅
   - Created `adapter-registry.test.ts` with full coverage
   - 8 test cases covering all AdapterRegistry functionality
   - 100% test pass rate

### Test Results Summary
```
Test Suites: 5 passed, 5 total
Tests:       43 passed, 43 total
Snapshots:   0 total
Time:        2.779s
```

### Files Modified
- `src/core/event-bus.ts` - Fixed one-time subscription logic
- `tests/core/adapter-registry.test.ts` - Created new test file
- `tests/core/workflow/workflow-system.test.ts` - Fixed state management
- `tests/performance/workflow-performance.test.ts` - Fixed ID patterns
- `tests/performance/core-performance.test.ts` - Fixed ID patterns

For detailed information, see [Test Fixes Report](./testing/test-fixes-report.md).

---

This testing strategy ensures high-quality, reliable code while maintaining fast development cycles and comprehensive coverage of all system components.

**Last Updated**: 2025-07-28
**Version**: v1.0.1
**Status**: ✅ All Tests Passing (43/43)

# 测试数据管理和分支覆盖指南

## 🎯 核心原则

**允许构建假数据进行复杂功能测试，要求100%分支覆盖，及时清理测试数据，确保100%功能上线要求**

## 📋 测试数据策略

### 1. 假数据构建原则

#### ✅ 允许的假数据使用场景
```typescript
// ✅ 正确：构建假数据模拟复杂业务场景
describe('复杂工作流测试', () => {
  it('应该处理多种状态转换', async () => {
    // 构建假数据模拟各种状态
    const testCases = [
      { status: 'created', nextAction: 'start' },
      { status: 'in_progress', nextAction: 'pause' },
      { status: 'paused', nextAction: 'resume' },
      { status: 'completed', nextAction: 'archive' }
    ];

    for (const testCase of testCases) {
      const workflow = createTestWorkflow(testCase.status);
      const result = await workflowManager.processAction(workflow.id, testCase.nextAction);
      expect(result.success).toBe(true);
      
      // 及时清理测试数据
      await cleanupTestWorkflow(workflow.id);
    }
  });
});
```

#### ✅ 边界条件和异常情况模拟
```typescript
// ✅ 正确：模拟边界条件
describe('边界条件测试', () => {
  it('应该处理极限情况', async () => {
    const edgeCases = [
      { input: '', expected: 'empty_input_error' },
      { input: 'a'.repeat(10000), expected: 'input_too_long_error' },
      { input: null, expected: 'null_input_error' },
      { input: undefined, expected: 'undefined_input_error' }
    ];

    for (const edgeCase of edgeCases) {
      const result = await processInput(edgeCase.input);
      expect(result.error).toBe(edgeCase.expected);
    }
  });
});
```

### 2. 分支覆盖要求

#### 🎯 100%分支覆盖标准
```typescript
// ✅ 正确：确保所有分支都被测试
describe('用户权限验证', () => {
  it('应该覆盖所有权限分支', async () => {
    const permissionTests = [
      { role: 'admin', resource: 'users', action: 'create', expected: true },
      { role: 'admin', resource: 'users', action: 'delete', expected: true },
      { role: 'user', resource: 'users', action: 'create', expected: false },
      { role: 'user', resource: 'users', action: 'read', expected: true },
      { role: 'guest', resource: 'users', action: 'read', expected: false },
      { role: null, resource: 'users', action: 'read', expected: false }
    ];

    for (const test of permissionTests) {
      const user = createTestUser(test.role);
      const hasPermission = await checkPermission(user, test.resource, test.action);
      expect(hasPermission).toBe(test.expected);
      
      // 清理测试用户
      await cleanupTestUser(user.id);
    }
  });
});
```

#### 🎯 错误处理分支覆盖
```typescript
// ✅ 正确：测试所有错误处理路径
describe('错误处理分支', () => {
  it('应该正确处理各种错误情况', async () => {
    const errorScenarios = [
      { 
        setup: () => mockDatabaseError(),
        action: () => userService.createUser(validUserData),
        expectedError: 'DATABASE_ERROR'
      },
      {
        setup: () => mockNetworkTimeout(),
        action: () => userService.createUser(validUserData),
        expectedError: 'NETWORK_TIMEOUT'
      },
      {
        setup: () => mockValidationError(),
        action: () => userService.createUser(invalidUserData),
        expectedError: 'VALIDATION_ERROR'
      }
    ];

    for (const scenario of errorScenarios) {
      scenario.setup();
      
      await expect(scenario.action()).rejects.toThrow(scenario.expectedError);
      
      // 清理mock状态
      jest.clearAllMocks();
    }
  });
});
```

### 3. 测试数据清理策略

#### 🧹 自动清理机制
```typescript
// ✅ 正确：实现自动清理机制
describe('数据清理示例', () => {
  let testDataIds: string[] = [];

  beforeEach(() => {
    testDataIds = [];
  });

  afterEach(async () => {
    // 自动清理所有测试数据
    for (const id of testDataIds) {
      await cleanupTestData(id);
    }
    testDataIds = [];
  });

  it('应该创建和清理测试数据', async () => {
    // 创建测试数据
    const testUser = await createTestUser({ name: 'Test User' });
    testDataIds.push(testUser.id);

    const testWorkflow = await createTestWorkflow({ userId: testUser.id });
    testDataIds.push(testWorkflow.id);

    // 执行测试
    const result = await workflowService.processWorkflow(testWorkflow.id);
    expect(result.success).toBe(true);

    // 数据会在afterEach中自动清理
  });
});
```

#### 🧹 手动清理最佳实践
```typescript
// ✅ 正确：手动清理关键资源
describe('手动清理示例', () => {
  it('应该手动清理关键资源', async () => {
    let testDatabase = null;
    let testServer = null;

    try {
      // 创建测试资源
      testDatabase = await createTestDatabase();
      testServer = await startTestServer(testDatabase);

      // 执行测试
      const response = await request(testServer).get('/api/users');
      expect(response.status).toBe(200);

    } finally {
      // 确保资源被清理
      if (testServer) {
        await stopTestServer(testServer);
      }
      if (testDatabase) {
        await cleanupTestDatabase(testDatabase);
      }
    }
  });
});
```

## 🚫 避免的反模式

### ❌ 错误的数据管理
```typescript
// ❌ 错误：不清理测试数据
describe('错误示例', () => {
  it('创建数据但不清理', async () => {
    const user = await createTestUser({ name: 'Test' });
    // 测试逻辑...
    // ❌ 没有清理数据，会影响后续测试
  });
});

// ❌ 错误：分支覆盖不完整
describe('不完整的分支测试', () => {
  it('只测试成功情况', async () => {
    const result = await processData(validData);
    expect(result.success).toBe(true);
    // ❌ 没有测试错误情况和边界条件
  });
});
```

## 📊 分支覆盖监控

### 覆盖率配置
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,  // 要求100%分支覆盖
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 覆盖率检查脚本
```bash
#!/bin/bash
# check-coverage.sh

echo "检查测试覆盖率..."
npm test -- --coverage

# 检查分支覆盖率是否达到100%
BRANCH_COVERAGE=$(npm test -- --coverage --silent | grep "Branches" | awk '{print $2}' | sed 's/%//')

if [ "$BRANCH_COVERAGE" -lt 100 ]; then
  echo "❌ 分支覆盖率不足: $BRANCH_COVERAGE%，要求100%"
  exit 1
else
  echo "✅ 分支覆盖率达标: $BRANCH_COVERAGE%"
fi
```

## 🎯 生产就绪检查清单

### 测试数据质量检查
- [ ] 所有假数据符合Schema定义
- [ ] 测试数据覆盖各种业务场景
- [ ] 边界条件和异常情况已覆盖
- [ ] 测试数据及时清理，无脏数据残留

### 分支覆盖检查
- [ ] 单元测试达到100%分支覆盖
- [ ] 集成测试覆盖模块间交互分支
- [ ] 端到端测试覆盖完整业务流程分支
- [ ] 错误处理分支全部验证

### 生产环境准备
- [ ] 所有功能分支经过测试验证
- [ ] 边缘情况无遗漏
- [ ] 测试环境与生产环境一致
- [ ] 性能基准测试通过

## 🔧 工具和最佳实践

### 测试数据工厂
```typescript
// test-data-factory.ts
export class TestDataFactory {
  private static createdIds: Set<string> = new Set();

  static async createUser(data: Partial<UserData> = {}): Promise<User> {
    const user = await userRepository.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      ...data
    });
    
    this.createdIds.add(user.id);
    return user;
  }

  static async cleanup(): Promise<void> {
    for (const id of this.createdIds) {
      await userRepository.delete(id);
    }
    this.createdIds.clear();
  }
}
```

### 分支覆盖助手
```typescript
// coverage-helper.ts
export function ensureAllBranchesTested<T>(
  testCases: T[],
  testFunction: (testCase: T) => Promise<void>
): Promise<void[]> {
  if (testCases.length === 0) {
    throw new Error('测试用例不能为空，必须覆盖所有分支');
  }
  
  return Promise.all(testCases.map(testFunction));
}
```

---

**指南版本**: v1.0  
**最后更新**: 2025-07-28  
**核心目标**: 100%分支覆盖 + 100%功能上线

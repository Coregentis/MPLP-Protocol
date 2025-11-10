# MPLP测试指南

> **🎯 目标**: 掌握MPLP应用的测试策略和方法  
> **📚 适用对象**: 所有开发者  
> **🌐 语言**: [English](../../docs-sdk-en/guides/testing.md) | 中文

---

## 📋 **目录**

1. [测试策略](#测试策略)
2. [单元测试](#单元测试)
3. [集成测试](#集成测试)
4. [端到端测试](#端到端测试)
5. [性能测试](#性能测试)
6. [测试工具](#测试工具)

---

## 🎯 **测试策略**

### **1.1 测试金字塔**

```
        /\
       /E2E\        10% - 端到端测试 (慢，全面)
      /------\
     /  集成  \      20% - 集成测试 (中速，关键路径)
    /----------\
   /    单元    \    70% - 单元测试 (快，细粒度)
  /--------------\
```

### **1.2 测试覆盖率目标**

| 测试类型 | 覆盖率目标 | 执行频率 |
|---------|-----------|---------|
| 单元测试 | ≥90% | 每次提交 |
| 集成测试 | ≥80% | 每次提交 |
| E2E测试 | ≥60% | 每日/发布前 |
| 性能测试 | 关键路径 | 每周/发布前 |

---

## 🧪 **单元测试**

### **2.1 测试框架配置**

**package.json**:
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### **2.2 Agent单元测试**

**tests/unit/SimpleAgent.test.ts**:
```typescript
import { SimpleAgent } from '../../src/SimpleAgent';
import { MPLP } from 'mplp';

// Mock MPLP
jest.mock('mplp');

describe('SimpleAgent', () => {
  let agent: SimpleAgent;
  let mockMPLP: jest.Mocked<MPLP>;

  beforeEach(() => {
    // 创建Mock对象
    mockMPLP = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getModule: jest.fn(),
      getVersion: jest.fn().mockReturnValue('1.1.0-beta'),
      getLoadedModules: jest.fn().mockReturnValue(['context', 'plan']),
      isInitialized: jest.fn().mockReturnValue(true),
      getConfig: jest.fn()
    } as any;

    // 注入Mock
    (MPLP as jest.MockedClass<typeof MPLP>).mockImplementation(() => mockMPLP);

    agent = new SimpleAgent();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('应该成功初始化Agent', async () => {
      await agent.initialize();

      expect(mockMPLP.initialize).toHaveBeenCalled();
      expect(agent.getStatus().initialized).toBe(true);
    });

    it('应该防止重复初始化', async () => {
      await agent.initialize();
      await agent.initialize();

      expect(mockMPLP.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('greet', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('应该返回问候消息', async () => {
      const greeting = await agent.greet('测试用户');

      expect(greeting).toContain('测试用户');
      expect(greeting).toContain('SimpleAgent');
    });

    it('未初始化时应该抛出错误', async () => {
      const uninitializedAgent = new SimpleAgent();

      await expect(uninitializedAgent.greet('用户'))
        .rejects.toThrow('Agent未初始化');
    });
  });

  describe('executeTask', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('应该成功执行任务', async () => {
      const result = await agent.executeTask('测试任务', { data: 'test' });

      expect(result.success).toBe(true);
      expect(result.taskId).toBeGreaterThan(0);
      expect(result.result).toBeDefined();
    });

    it('应该处理任务执行错误', async () => {
      // 模拟错误
      mockMPLP.getModule.mockImplementation(() => {
        throw new Error('模块错误');
      });

      const result = await agent.executeTask('失败任务');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('应该返回正确的状态', async () => {
      await agent.initialize();

      const status = agent.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.version).toBe('1.1.0-beta');
      expect(status.modules).toEqual(['context', 'plan']);
      expect(status.tasksExecuted).toBe(0);
    });
  });

  describe('shutdown', () => {
    it('应该正确关闭Agent', async () => {
      await agent.initialize();
      await agent.shutdown();

      const status = agent.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.tasksExecuted).toBe(0);
    });
  });
});
```

### **2.3 模块Mock策略**

**创建Mock工厂**:
```typescript
// tests/mocks/mplp.mock.ts
export function createMockMPLP(overrides?: Partial<MPLP>): jest.Mocked<MPLP> {
  return {
    initialize: jest.fn().mockResolvedValue(undefined),
    getModule: jest.fn(),
    getVersion: jest.fn().mockReturnValue('1.1.0-beta'),
    getLoadedModules: jest.fn().mockReturnValue([]),
    isInitialized: jest.fn().mockReturnValue(true),
    getConfig: jest.fn().mockReturnValue({}),
    ...overrides
  } as any;
}

// 使用
const mockMPLP = createMockMPLP({
  getModule: jest.fn().mockReturnValue(mockContextModule)
});
```

---

## 🔗 **集成测试**

### **3.1 集成测试配置**

**tests/integration/setup.ts**:
```typescript
import { createTestMPLP } from 'mplp';

export async function setupTestEnvironment() {
  const mplp = await createTestMPLP();
  return { mplp };
}

export async function teardownTestEnvironment(env: any) {
  // 清理资源
}
```

### **3.2 Agent集成测试**

**tests/integration/SimpleAgent.integration.test.ts**:
```typescript
import { SimpleAgent } from '../../src/SimpleAgent';
import { createTestMPLP } from 'mplp';

describe('SimpleAgent Integration', () => {
  let agent: SimpleAgent;

  beforeAll(async () => {
    // 使用真实的MPLP实例
    agent = new SimpleAgent();
    await agent.initialize();
  });

  afterAll(async () => {
    await agent.shutdown();
  });

  it('应该完整执行任务流程', async () => {
    // 创建任务
    const result = await agent.executeTask('集成测试任务', {
      type: 'integration',
      data: [1, 2, 3]
    });

    // 验证结果
    expect(result.success).toBe(true);
    expect(result.taskId).toBeGreaterThan(0);
    expect(result.result).toBeDefined();
    expect(result.result.taskName).toBe('集成测试任务');
  });

  it('应该正确使用Context模块', async () => {
    const greeting = await agent.greet('集成测试用户');

    expect(greeting).toContain('集成测试用户');
    expect(greeting).toContain('MPLP');
  });

  it('应该处理多个并发任务', async () => {
    const tasks = [
      agent.executeTask('任务1'),
      agent.executeTask('任务2'),
      agent.executeTask('任务3')
    ];

    const results = await Promise.all(tasks);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

---

## 🌐 **端到端测试**

### **4.1 E2E测试示例**

**tests/e2e/workflow.e2e.test.ts**:
```typescript
import { MasterAgent } from '../../src/agents/MasterAgent';

describe('Multi-Agent Workflow E2E', () => {
  let master: MasterAgent;

  beforeAll(async () => {
    master = new MasterAgent(3);
    await master.initialize();
  });

  afterAll(async () => {
    await master.shutdown();
  });

  it('应该完整执行多Agent协作流程', async () => {
    const tasks = [
      { id: 1, name: '数据收集', data: 'source1' },
      { id: 2, name: '数据处理', data: 'source2' },
      { id: 3, name: '数据存储', data: 'source3' }
    ];

    await master.processBatch(tasks);

    // 等待所有任务完成
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 验证结果
    // ...
  }, 10000); // 10秒超时
});
```

---

## ⚡ **性能测试**

### **5.1 性能基准测试**

**tests/performance/agent.perf.test.ts**:
```typescript
import { SimpleAgent } from '../../src/SimpleAgent';

describe('Agent Performance', () => {
  let agent: SimpleAgent;

  beforeAll(async () => {
    agent = new SimpleAgent();
    await agent.initialize();
  });

  afterAll(async () => {
    await agent.shutdown();
  });

  it('初始化应该在100ms内完成', async () => {
    const newAgent = new SimpleAgent();
    
    const start = Date.now();
    await newAgent.initialize();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);

    await newAgent.shutdown();
  });

  it('任务执行应该在合理时间内完成', async () => {
    const start = Date.now();
    await agent.executeTask('性能测试');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(2000);
  });

  it('应该支持高并发任务', async () => {
    const taskCount = 100;
    const tasks = Array.from({ length: taskCount }, (_, i) =>
      agent.executeTask(`任务${i}`)
    );

    const start = Date.now();
    const results = await Promise.all(tasks);
    const duration = Date.now() - start;

    expect(results).toHaveLength(taskCount);
    expect(results.every(r => r.success)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5秒内完成100个任务
  });
});
```

---

## 🛠️ **测试工具**

### **6.1 推荐工具**

- **Jest** - 测试框架
- **ts-jest** - TypeScript支持
- **@testing-library** - UI测试
- **supertest** - API测试
- **artillery** - 负载测试

### **6.2 测试命令**

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 覆盖率报告
npm run test:coverage

# 只运行单元测试
npm test -- tests/unit

# 只运行集成测试
npm test -- tests/integration

# 运行特定测试文件
npm test -- SimpleAgent.test.ts
```

---

## 📚 **总结**

遵循本指南可以：
- ✅ 建立完整的测试体系
- ✅ 提高代码质量和可靠性
- ✅ 快速发现和修复问题
- ✅ 支持持续集成和部署

## 🔗 **相关资源**

- [最佳实践](best-practices.md)
- [架构指南](architecture.md)
- [部署指南](deployment.md)

---

**版本**: v1.1.0-beta  
**更新时间**: 2025-10-22  
**维护者**: MPLP Team


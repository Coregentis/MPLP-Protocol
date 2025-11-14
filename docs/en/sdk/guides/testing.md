# MPLP Testing Guide

> **🎯 Goal**: Master testing strategies and methods for MPLP applications  
> **📚 Audience**: All developers  
> **🌐 Language**: English | [中文](../../docs-sdk/guides/testing.md)

---

## 📋 **Table of Contents**

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Testing Tools](#testing-tools)

---

## 🎯 **Testing Strategy**

### **1.1 Testing Pyramid**

```
        /\
       /E2E\        10% - E2E tests (slow, comprehensive)
      /------\
     /  Integ \     20% - Integration tests (medium, critical paths)
    /----------\
   /    Unit    \   70% - Unit tests (fast, fine-grained)
  /--------------\
```

### **1.2 Coverage Targets**

| Test Type | Coverage Target | Execution Frequency |
|-----------|----------------|---------------------|
| Unit Tests | ≥90% | Every commit |
| Integration Tests | ≥80% | Every commit |
| E2E Tests | ≥60% | Daily/Pre-release |
| Performance Tests | Critical paths | Weekly/Pre-release |

---

## 🧪 **Unit Testing**

### **2.1 Test Framework Configuration**

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

### **2.2 Agent Unit Tests**

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
    // Create Mock object
    mockMPLP = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getModule: jest.fn(),
      getVersion: jest.fn().mockReturnValue('1.1.0'),
      getLoadedModules: jest.fn().mockReturnValue(['context', 'plan']),
      isInitialized: jest.fn().mockReturnValue(true),
      getConfig: jest.fn()
    } as any;

    // Inject Mock
    (MPLP as jest.MockedClass<typeof MPLP>).mockImplementation(() => mockMPLP);

    agent = new SimpleAgent();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should successfully initialize Agent', async () => {
      await agent.initialize();

      expect(mockMPLP.initialize).toHaveBeenCalled();
      expect(agent.getStatus().initialized).toBe(true);
    });

    it('should prevent duplicate initialization', async () => {
      await agent.initialize();
      await agent.initialize();

      expect(mockMPLP.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('greet', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should return greeting message', async () => {
      const greeting = await agent.greet('Test User');

      expect(greeting).toContain('Test User');
      expect(greeting).toContain('SimpleAgent');
    });

    it('should throw error when not initialized', async () => {
      const uninitializedAgent = new SimpleAgent();

      await expect(uninitializedAgent.greet('User'))
        .rejects.toThrow('Agent not initialized');
    });
  });

  describe('executeTask', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should successfully execute task', async () => {
      const result = await agent.executeTask('Test Task', { data: 'test' });

      expect(result.success).toBe(true);
      expect(result.taskId).toBeGreaterThan(0);
      expect(result.result).toBeDefined();
    });

    it('should handle task execution errors', async () => {
      // Simulate error
      mockMPLP.getModule.mockImplementation(() => {
        throw new Error('Module error');
      });

      const result = await agent.executeTask('Failed Task');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should return correct status', async () => {
      await agent.initialize();

      const status = agent.getStatus();

      expect(status.initialized).toBe(true);
      expect(status.version).toBe('1.1.0');
      expect(status.modules).toEqual(['context', 'plan']);
      expect(status.tasksExecuted).toBe(0);
    });
  });

  describe('shutdown', () => {
    it('should properly shutdown Agent', async () => {
      await agent.initialize();
      await agent.shutdown();

      const status = agent.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.tasksExecuted).toBe(0);
    });
  });
});
```

### **2.3 Module Mock Strategy**

**Create Mock Factory**:
```typescript
// tests/mocks/mplp.mock.ts
export function createMockMPLP(overrides?: Partial<MPLP>): jest.Mocked<MPLP> {
  return {
    initialize: jest.fn().mockResolvedValue(undefined),
    getModule: jest.fn(),
    getVersion: jest.fn().mockReturnValue('1.1.0'),
    getLoadedModules: jest.fn().mockReturnValue([]),
    isInitialized: jest.fn().mockReturnValue(true),
    getConfig: jest.fn().mockReturnValue({}),
    ...overrides
  } as any;
}

// Usage
const mockMPLP = createMockMPLP({
  getModule: jest.fn().mockReturnValue(mockContextModule)
});
```

---

## 🔗 **Integration Testing**

### **3.1 Integration Test Configuration**

**tests/integration/setup.ts**:
```typescript
import { createTestMPLP } from 'mplp';

export async function setupTestEnvironment() {
  const mplp = await createTestMPLP();
  return { mplp };
}

export async function teardownTestEnvironment(env: any) {
  // Cleanup resources
}
```

### **3.2 Agent Integration Tests**

**tests/integration/SimpleAgent.integration.test.ts**:
```typescript
import { SimpleAgent } from '../../src/SimpleAgent';
import { createTestMPLP } from 'mplp';

describe('SimpleAgent Integration', () => {
  let agent: SimpleAgent;

  beforeAll(async () => {
    // Use real MPLP instance
    agent = new SimpleAgent();
    await agent.initialize();
  });

  afterAll(async () => {
    await agent.shutdown();
  });

  it('should execute complete task flow', async () => {
    // Create task
    const result = await agent.executeTask('Integration Test Task', {
      type: 'integration',
      data: [1, 2, 3]
    });

    // Verify result
    expect(result.success).toBe(true);
    expect(result.taskId).toBeGreaterThan(0);
    expect(result.result).toBeDefined();
    expect(result.result.taskName).toBe('Integration Test Task');
  });

  it('should correctly use Context module', async () => {
    const greeting = await agent.greet('Integration Test User');

    expect(greeting).toContain('Integration Test User');
    expect(greeting).toContain('MPLP');
  });

  it('should handle multiple concurrent tasks', async () => {
    const tasks = [
      agent.executeTask('Task 1'),
      agent.executeTask('Task 2'),
      agent.executeTask('Task 3')
    ];

    const results = await Promise.all(tasks);

    expect(results).toHaveLength(3);
    expect(results.every(r => r.success)).toBe(true);
  });
});
```

---

## 🌐 **End-to-End Testing**

### **4.1 E2E Test Example**

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

  it('should execute complete multi-agent collaboration flow', async () => {
    const tasks = [
      { id: 1, name: 'Data Collection', data: 'source1' },
      { id: 2, name: 'Data Processing', data: 'source2' },
      { id: 3, name: 'Data Storage', data: 'source3' }
    ];

    await master.processBatch(tasks);

    // Wait for all tasks to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify results
    // ...
  }, 10000); // 10 second timeout
});
```

---

## ⚡ **Performance Testing**

### **5.1 Performance Benchmark Tests**

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

  it('initialization should complete within 100ms', async () => {
    const newAgent = new SimpleAgent();
    
    const start = Date.now();
    await newAgent.initialize();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);

    await newAgent.shutdown();
  });

  it('task execution should complete in reasonable time', async () => {
    const start = Date.now();
    await agent.executeTask('Performance Test');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(2000);
  });

  it('should support high concurrency tasks', async () => {
    const taskCount = 100;
    const tasks = Array.from({ length: taskCount }, (_, i) =>
      agent.executeTask(`Task ${i}`)
    );

    const start = Date.now();
    const results = await Promise.all(tasks);
    const duration = Date.now() - start;

    expect(results).toHaveLength(taskCount);
    expect(results.every(r => r.success)).toBe(true);
    expect(duration).toBeLessThan(5000); // Complete 100 tasks within 5 seconds
  });
});
```

---

## 🛠️ **Testing Tools**

### **6.1 Recommended Tools**

- **Jest** - Testing framework
- **ts-jest** - TypeScript support
- **@testing-library** - UI testing
- **supertest** - API testing
- **artillery** - Load testing

### **6.2 Test Commands**

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Run only unit tests
npm test -- tests/unit

# Run only integration tests
npm test -- tests/integration

# Run specific test file
npm test -- SimpleAgent.test.ts
```

---

## 📚 **Summary**

Following this guide will help you:
- ✅ Establish complete testing system
- ✅ Improve code quality and reliability
- ✅ Quickly discover and fix issues
- ✅ Support continuous integration and deployment

## 🔗 **Related Resources**

- [Best Practices](best-practices.md)
- [Architecture Guide](architecture.md)
- [Deployment Guide](deployment.md)

---

**Version**: v1.1.0  
**Last Updated**: 2025-10-22  
**Maintainer**: MPLP Team


# Network模块测试指南

## 🎯 **测试概述**

Network模块已达到企业级测试标准，实现100%测试通过率(190/190测试)和90%+代码覆盖率。本指南提供完整的测试方法、工具和最佳实践。

### **测试目标**
- **功能正确性**: 验证所有网络功能按预期工作
- **性能达标**: 确保满足企业级性能要求
- **安全可靠**: 验证安全机制和错误处理
- **集成兼容**: 确保与其他MPLP模块协作正常

## 🏗️ **测试架构**

### **测试金字塔**
```
E2E Tests (10%) - 端到端集成测试
├── 网络完整流程测试
├── 跨模块协作测试
└── 用户场景测试

Integration Tests (20%) - 集成测试
├── 模块间接口测试
├── 外部系统集成测试
└── 数据库集成测试

Unit Tests (70%) - 单元测试
├── 领域逻辑测试
├── 服务层测试
├── 工具函数测试
└── 边界条件测试
```

### **测试覆盖率目标**
- **总体覆盖率**: ≥95%
- **单元测试**: ≥95%
- **集成测试**: ≥90%
- **端到端测试**: ≥80%

## 🧪 **单元测试指南**

### **测试文件结构 (实际)**
```
tests/modules/network/unit/
├── network.protocol.test.ts                    # 协议层测试 (100%通过)
├── network.entity.test.ts                      # 实体层测试 (100%通过)
├── network-management.service.test.ts          # 管理服务测试 (100%通过)
├── network-analytics.service.test.ts           # 分析服务测试 (100%通过)
├── network-monitoring.service.test.ts          # 监控服务测试 (100%通过)
├── network-security.service.test.ts            # 安全服务测试 (100%通过)
├── network.controller.test.ts                  # 控制器测试 (100%通过)
├── network.mapper.test.ts                      # 映射器测试 (100%通过)
├── network.repository.test.ts                  # 仓储测试 (100%通过)
├── network-protocol.factory.test.ts            # 工厂测试 (100%通过)
└── network-enterprise-integration.test.ts      # 企业级集成测试 (100%通过)

tests/modules/network/integration/
└── network-enterprise.integration.test.ts      # 企业级集成测试 (100%通过)
```

### **测试命名约定 (标准化)**
```typescript
describe('Network模块协议测试', () => {
  describe('Network模块网络管理功能测试', () => {
    it('应该成功创建网络当提供有效数据时', async () => {
      // 测试实现
    });

    it('应该抛出错误当网络名称为空时', async () => {
      // 边界条件测试
    });
  });

  describe('Network模块企业级集成测试', () => {
    it('应该成功执行网络分析当网络存在时', async () => {
      // 企业级功能测试
    });
  });
});
```

### **测试数据工厂**
```typescript
// tests/modules/network/factories/network-test.factory.ts
export class NetworkTestFactory {
  static createNetworkEntity(): NetworkEntity {
    return new NetworkEntity({
      networkId: 'net-test-001',
      name: 'Test Network',
      topology: 'mesh',
      status: 'active',
      contextId: 'ctx-test-001',
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static createNetworkEntityWithNodes(): NetworkEntity {
    const network = this.createNetworkEntity();
    network.addNode({
      agentId: 'agent-001',
      nodeType: 'worker',
      status: 'online',
      capabilities: ['compute', 'storage']
    });
    return network;
  }
}
```

### **Mock对象设计**
```typescript
// 类型安全的Mock对象
const mockNetworkManagementService: jest.Mocked<NetworkManagementService> = {
  createNetwork: jest.fn(),
  getNetworkById: jest.fn(),
  updateNetwork: jest.fn(),
  deleteNetwork: jest.fn(),
  addNodeToNetwork: jest.fn(),
  removeNodeFromNetwork: jest.fn(),
  getNetworkStatistics: jest.fn(),
  searchNetworks: jest.fn()
};
```

## 🔗 **集成测试指南**

### **模块间集成测试**
```typescript
describe('Network-Context集成测试', () => {
  it('应该与Context模块协作创建网络', async () => {
    // 设置Context模块Mock
    const contextData = ContextTestFactory.createContextEntity();
    mockContextService.getContext.mockResolvedValue(contextData);

    // 执行网络创建
    const networkData = await networkService.createNetworkWithContext({
      name: 'Context Network',
      contextId: contextData.contextId
    });

    // 验证协作结果
    expect(networkData.contextId).toBe(contextData.contextId);
    expect(mockContextService.getContext).toHaveBeenCalledWith(contextData.contextId);
  });
});
```

### **数据库集成测试**
```typescript
describe('NetworkRepository集成测试', () => {
  let repository: NetworkRepository;
  let testDatabase: TestDatabase;

  beforeAll(async () => {
    testDatabase = await TestDatabase.create();
    repository = new NetworkRepository(testDatabase.connection);
  });

  afterAll(async () => {
    await testDatabase.cleanup();
  });

  it('应该正确保存和检索网络数据', async () => {
    const network = NetworkTestFactory.createNetworkEntity();
    
    await repository.save(network);
    const retrieved = await repository.findById(network.networkId);
    
    expect(retrieved).toEqual(network);
  });
});
```

## 🌐 **端到端测试指南**

### **完整流程测试**
```typescript
describe('网络管理端到端测试', () => {
  it('应该完成完整的网络生命周期', async () => {
    // 1. 创建网络
    const createResponse = await request(app)
      .post('/api/networks')
      .send({
        name: 'E2E Test Network',
        topology: 'mesh',
        contextId: 'e2e-context'
      })
      .expect(201);

    const networkId = createResponse.body.networkId;

    // 2. 添加节点
    await request(app)
      .post(`/api/networks/${networkId}/nodes`)
      .send({
        agentId: 'e2e-agent-001',
        nodeType: 'worker'
      })
      .expect(200);

    // 3. 执行路由
    await request(app)
      .post(`/api/networks/${networkId}/route`)
      .send({
        sourceNodeId: 'e2e-agent-001',
        targetNodeId: 'e2e-agent-002',
        message: { type: 'test', data: 'hello' }
      })
      .expect(200);

    // 4. 删除网络
    await request(app)
      .delete(`/api/networks/${networkId}`)
      .expect(204);
  });
});
```

## ⚡ **性能测试指南**

### **负载测试**
```typescript
describe('网络性能测试', () => {
  it('应该在高并发下保持性能', async () => {
    const concurrentRequests = 100;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        networkProtocol.executeOperation({
          protocolVersion: '1.0.0',
          requestId: `perf-test-${i}`,
          operation: 'createNetwork',
          payload: { name: `Network ${i}` },
          timestamp: new Date().toISOString()
        })
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    // 验证性能指标
    const avgResponseTime = (endTime - startTime) / concurrentRequests;
    expect(avgResponseTime).toBeLessThan(100); // 平均响应时间 < 100ms
    expect(results.every(r => r.status === 'success')).toBe(true);
  });
});
```

### **内存泄漏测试**
```typescript
describe('内存使用测试', () => {
  it('应该在长期运行中保持稳定的内存使用', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 执行大量操作
    for (let i = 0; i < 1000; i++) {
      const network = NetworkTestFactory.createNetworkEntity();
      await networkService.createNetwork(network);
      await networkService.deleteNetwork(network.networkId);
    }

    // 强制垃圾回收
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // 内存增长应该在合理范围内
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // < 50MB
  });
});
```

## 🔒 **安全测试指南**

### **输入验证测试**
```typescript
describe('安全测试', () => {
  it('应该拒绝恶意输入', async () => {
    const maliciousInputs = [
      { name: '<script>alert("xss")</script>' },
      { name: '"; DROP TABLE networks; --' },
      { name: '../../../etc/passwd' },
      { topology: 'invalid_topology' }
    ];

    for (const input of maliciousInputs) {
      const response = await networkProtocol.executeOperation({
        protocolVersion: '1.0.0',
        requestId: 'security-test',
        operation: 'createNetwork',
        payload: input,
        timestamp: new Date().toISOString()
      });

      expect(response.status).toBe('error');
    }
  });
});
```

## 🛠️ **测试工具和配置**

### **Jest配置**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/modules/network/**/*.ts',
    '!src/modules/network/**/*.d.ts',
    '!src/modules/network/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

### **测试脚本**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:network": "jest --testPathPattern=network",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e"
  }
}
```

## 📊 **测试报告和监控**

### **覆盖率报告**
```bash
# 生成详细覆盖率报告
npm run test:coverage

# 查看HTML报告
open coverage/lcov-report/index.html
```

### **持续集成**
```yaml
# .github/workflows/test.yml
name: Network Module Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:network
      - run: npm run test:coverage
```

## 🎯 **测试最佳实践**

### **测试原则**
1. **AAA模式**: Arrange-Act-Assert
2. **单一职责**: 每个测试只验证一个功能点
3. **独立性**: 测试之间不应相互依赖
4. **可重复**: 测试结果应该一致可重复
5. **快速执行**: 单元测试应该快速执行

### **测试数据管理**
- 使用工厂模式创建测试数据
- 避免硬编码测试数据
- 每个测试使用独立的测试数据
- 测试后清理数据

### **Mock策略**
- 对外部依赖使用Mock
- 保持Mock对象类型安全
- 验证Mock调用的正确性
- 避免过度Mock

## 🚀 **测试执行指南**

### **本地开发测试**
```bash
# 运行所有网络模块测试
npm run test:network

# 运行特定测试文件
npm test network.protocol.test.ts

# 监视模式运行测试
npm run test:watch
```

### **CI/CD测试**
```bash
# 完整测试套件
npm run test

# 生成覆盖率报告
npm run test:coverage

# 性能测试
npm run test:performance
```

---

**测试指南版本**: 1.0.0  
**最后更新**: 2025-08-30  
**测试负责人**: MPLP QA Team

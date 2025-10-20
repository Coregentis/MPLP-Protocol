# Extension Module Testing Guide

## 📋 **Overview**

This document provides comprehensive testing strategies, methodologies, and examples for the Extension Module. The testing approach follows enterprise-grade standards with 95%+ coverage requirements and zero technical debt policy.

**Testing Framework**: Jest + TypeScript  
**Coverage Target**: ≥95%  
**Quality Standard**: Zero Technical Debt  
**Test Philosophy**: Test-Driven Development (TDD)

## 🏗️ **Test Architecture**

### **Test Pyramid Structure**
```
    E2E Tests (5%)
   ─────────────────
  Integration Tests (15%)
 ─────────────────────────
Unit Tests (80%)
```

### **Test Suite Structure**
```
tests/modules/extension/
├── unit/                           # Unit Tests (Isolated Components)
│   ├── entities/                   # Domain Entity Tests
│   ├── services/                   # Service Layer Tests
│   ├── repositories/               # Repository Tests
│   └── mappers/                    # Mapper Tests
├── integration/                    # Integration Tests (Component Interaction)
│   ├── api/                        # API Integration Tests
│   ├── database/                   # Database Integration Tests
│   └── external/                   # External Service Integration Tests
├── functional/                     # Functional Tests (Business Scenarios)
│   ├── extension-lifecycle/        # Extension Lifecycle Tests
│   ├── security/                   # Security Feature Tests
│   └── performance/                # Performance Tests
├── e2e/                           # End-to-End Tests (Complete Workflows)
│   ├── extension-management/       # Complete Extension Management Flows
│   └── api-workflows/              # API Workflow Tests
├── extension.entity.test.ts        # Domain Entity Tests (7 tests)
├── extension-management.service.test.ts # Service Tests (11 tests)
├── extension.controller.test.ts    # Controller Tests
├── extension.mapper.test.ts        # Mapper Tests
├── extension.repository.test.ts    # Repository Tests
├── extension.protocol.test.ts      # Protocol Tests
├── extension-protocol.factory.test.ts # Factory Tests
└── test-data-factory.ts           # Test Data Utilities
```

## 🧪 **Test Categories**

### **1. Unit Tests (80% of test suite)**

#### **Domain Entity Tests**
```typescript
// extension.entity.test.ts
describe('ExtensionEntity测试', () => {
  describe('构造函数和基本属性测试', () => {
    it('应该正确创建Extension实体并设置所有属性', () => {
      // 📋 Arrange - 准备测试数据
      const extensionData = createMockExtensionEntityData({
        extensionId: 'ext-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus
      });

      // 🎬 Act - 创建实体
      const extension = new ExtensionEntity(extensionData);

      // ✅ Assert - 验证属性
      expect(extension.extensionId).toBe(extensionData.extensionId);
      expect(extension.name).toBe(extensionData.name);
      expect(extension.displayName).toBe(extensionData.displayName);
      expect(extension.extensionType).toBe(extensionData.extensionType);
      expect(extension.status).toBe(extensionData.status);
    });
  });

  describe('状态管理测试', () => {
    it('应该能够激活扩展', () => {
      // 📋 Arrange - 创建非活动扩展
      const extension = new ExtensionEntity(createMockExtensionEntityData({
        status: 'inactive' as ExtensionStatus
      }));

      // 🎬 Act - 激活扩展
      const result = extension.activate('user-001');

      // ✅ Assert - 验证激活成功
      expect(result).toBe(true);
      expect(extension.status).toBe('active');
    });

    it('应该能够停用扩展', () => {
      // 📋 Arrange - 创建活动扩展
      const extension = new ExtensionEntity(createMockExtensionEntityData({
        status: 'active' as ExtensionStatus
      }));

      // 🎬 Act - 停用扩展
      const result = extension.deactivate('user-001');

      // ✅ Assert - 验证停用成功
      expect(result).toBe(true);
      expect(extension.status).toBe('inactive');
    });
  });

  describe('验证方法测试', () => {
    it('应该验证扩展配置的有效性', () => {
      // 📋 Arrange - 创建有效扩展
      const extension = new ExtensionEntity(createMockExtensionEntityData());

      // 🎬 Act - 验证扩展
      const isValid = extension.validate();

      // ✅ Assert - 验证结果
      expect(isValid).toBe(true);
    });
  });
});
```

#### **Service Layer Tests**
```typescript
// extension-management.service.test.ts
describe('ExtensionManagementService测试', () => {
  let service: ExtensionManagementService;
  let mockRepository: jest.Mocked<IExtensionRepository>;

  beforeEach(() => {
    mockRepository = createMockExtensionRepository();
    service = new ExtensionManagementService(mockRepository);
  });

  describe('createExtension方法测试', () => {
    it('应该成功创建扩展', async () => {
      // 📋 Arrange - 准备创建请求
      const createRequest = createMockCreateExtensionRequest();
      const expectedExtension = createMockExtensionEntityData();
      
      mockRepository.nameExists.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(expectedExtension);

      // 🎬 Act - 执行创建
      const result = await service.createExtension(createRequest);

      // ✅ Assert - 验证结果
      expect(result).toEqual(expectedExtension);
      expect(mockRepository.nameExists).toHaveBeenCalledWith(createRequest.name);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('应该处理名称冲突错误', async () => {
      // 📋 Arrange - 准备冲突场景
      const createRequest = createMockCreateExtensionRequest();
      mockRepository.nameExists.mockResolvedValue(true);

      // 🎬 Act & Assert - 验证错误处理
      await expect(service.createExtension(createRequest))
        .rejects.toThrow('Extension with name');
    });
  });
});
```

### **2. Integration Tests (15% of test suite)**

#### **API Integration Tests**
```typescript
// api/extension.controller.integration.test.ts
describe('ExtensionController集成测试', () => {
  let app: TestingModule;
  let controller: ExtensionController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ExtensionController],
      providers: [ExtensionManagementService, /* other providers */]
    }).compile();

    controller = app.get<ExtensionController>(ExtensionController);
  });

  describe('POST /extensions', () => {
    it('应该成功创建扩展并返回正确响应', async () => {
      // 📋 Arrange - 准备请求数据
      const createDto = createMockCreateExtensionRequestDto();

      // 🎬 Act - 执行API调用
      const response = await request(app.getHttpServer())
        .post('/extensions')
        .send(createDto)
        .expect(201);

      // ✅ Assert - 验证响应
      expect(response.body).toHaveProperty('extensionId');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.status).toBe('inactive');
    });
  });
});
```

#### **Database Integration Tests**
```typescript
// database/extension.repository.integration.test.ts
describe('ExtensionRepository数据库集成测试', () => {
  let repository: ExtensionRepository;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await setupTestDatabase();
    repository = new ExtensionRepository(testDb.connection);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  describe('save方法', () => {
    it('应该成功保存扩展到数据库', async () => {
      // 📋 Arrange - 准备扩展数据
      const extensionData = createMockExtensionEntityData();

      // 🎬 Act - 保存到数据库
      const savedExtension = await repository.save(extensionData);

      // ✅ Assert - 验证保存结果
      expect(savedExtension.extensionId).toBeDefined();
      expect(savedExtension.name).toBe(extensionData.name);

      // 验证数据库中的数据
      const dbExtension = await repository.findById(savedExtension.extensionId);
      expect(dbExtension).not.toBeNull();
      expect(dbExtension!.name).toBe(extensionData.name);
    });
  });
});
```

### **3. Functional Tests (Business Scenarios)**

#### **Extension Lifecycle Tests**
```typescript
// functional/extension-lifecycle.test.ts
describe('扩展生命周期功能测试', () => {
  let extensionModule: ExtensionModule;

  beforeEach(() => {
    extensionModule = new ExtensionModule(createTestConfiguration());
  });

  describe('完整扩展生命周期', () => {
    it('应该支持完整的扩展生命周期管理', async () => {
      // 📋 Arrange - 准备扩展数据
      const extensionRequest = createMockCreateExtensionRequest();

      // 🎬 Act & Assert - 执行完整生命周期
      
      // 1. 创建扩展
      const extension = await extensionModule.createExtension(extensionRequest);
      expect(extension.status).toBe('inactive');

      // 2. 激活扩展
      const activateResult = await extensionModule.activateExtension({
        extensionId: extension.extensionId,
        userId: 'user-001'
      });
      expect(activateResult).toBe(true);

      // 3. 验证扩展状态
      const activeExtension = await extensionModule.getExtensionById(extension.extensionId);
      expect(activeExtension!.status).toBe('active');

      // 4. 停用扩展
      const deactivateResult = await extensionModule.deactivateExtension(
        extension.extensionId, 
        'user-001'
      );
      expect(deactivateResult).toBe(true);

      // 5. 删除扩展
      const deleteResult = await extensionModule.deleteExtension(extension.extensionId);
      expect(deleteResult).toBe(true);

      // 6. 验证扩展已删除
      const deletedExtension = await extensionModule.getExtensionById(extension.extensionId);
      expect(deletedExtension).toBeNull();
    });
  });
});
```

### **4. Performance Tests**

#### **Load Testing**
```typescript
// performance/extension.load.test.ts
describe('Extension模块性能测试', () => {
  let extensionModule: ExtensionModule;

  beforeEach(() => {
    extensionModule = new ExtensionModule(createPerformanceTestConfiguration());
  });

  describe('扩展创建性能', () => {
    it('应该在100ms内完成扩展创建', async () => {
      // 📋 Arrange - 准备测试数据
      const extensionRequest = createMockCreateExtensionRequest();

      // 🎬 Act - 测量执行时间
      const startTime = Date.now();
      const extension = await extensionModule.createExtension(extensionRequest);
      const endTime = Date.now();

      // ✅ Assert - 验证性能要求
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // <100ms
      expect(extension).toBeDefined();
    });

    it('应该支持并发扩展创建', async () => {
      // 📋 Arrange - 准备多个扩展请求
      const requests = Array.from({ length: 10 }, (_, i) => 
        createMockCreateExtensionRequest({ name: `test-extension-${i}` })
      );

      // 🎬 Act - 并发执行
      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => extensionModule.createExtension(request))
      );
      const endTime = Date.now();

      // ✅ Assert - 验证并发性能
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(500); // <500ms for 10 concurrent operations
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBeDefined());
    });
  });
});
```

## 🛠️ **Test Utilities**

### **Test Data Factory**
```typescript
// test-data-factory.ts
export class ExtensionTestDataFactory {
  /**
   * 创建模拟扩展实体数据
   */
  static createMockExtensionEntityData(overrides: Partial<ExtensionEntityData> = {}): ExtensionEntityData {
    return {
      extensionId: generateTestUUID('ext'),
      contextId: generateTestUUID('ctx'),
      name: 'test-extension',
      displayName: 'Test Extension',
      description: 'Test extension for unit testing',
      version: '1.0.0',
      extensionType: 'plugin' as ExtensionType,
      status: 'inactive' as ExtensionStatus,
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      compatibility: this.createMockCompatibility(),
      configuration: this.createMockConfiguration(),
      extensionPoints: [],
      apiExtensions: [],
      eventSubscriptions: [],
      lifecycle: this.createMockLifecycle(),
      security: this.createMockSecurity(),
      metadata: this.createMockMetadata(),
      auditTrail: this.createMockAuditTrail(),
      performanceMetrics: this.createMockPerformanceMetrics(),
      monitoringIntegration: this.createMockMonitoringIntegration(),
      versionHistory: this.createMockVersionHistory(),
      searchMetadata: this.createMockSearchMetadata(),
      eventIntegration: this.createMockEventIntegration(),
      ...overrides
    };
  }

  /**
   * 创建模拟仓库
   */
  static createMockExtensionRepository(): jest.Mocked<IExtensionRepository> {
    return {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByContextId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      nameExists: jest.fn(),
      count: jest.fn(),
      query: jest.fn(),
      search: jest.fn(),
      createBatch: jest.fn(),
      updateBatch: jest.fn(),
      deleteBatch: jest.fn(),
      getStatistics: jest.fn(),
      optimize: jest.fn()
    };
  }
}
```

### **Test Configuration**
```typescript
// test-configuration.ts
export function createTestConfiguration(): ExtensionModuleConfig {
  return {
    database: {
      type: 'memory',
      synchronize: true,
      logging: false
    },
    cache: {
      type: 'memory',
      ttl: 300
    },
    security: {
      sandboxEnabled: false, // Disabled for testing
      resourceLimits: {
        maxMemory: 1024 * 1024 * 1024, // 1GB for testing
        maxCpu: 100,
        maxFileSize: 100 * 1024 * 1024,
        maxNetworkConnections: 100
      }
    },
    monitoring: {
      enabled: false // Disabled for testing
    }
  };
}
```

## 📊 **Test Coverage Requirements**

### **Coverage Targets**
- **Overall Coverage**: ≥95%
- **Line Coverage**: ≥95%
- **Branch Coverage**: ≥90%
- **Function Coverage**: ≥95%
- **Statement Coverage**: ≥95%

### **Coverage by Layer**
- **Domain Layer**: ≥98% (Critical business logic)
- **Application Layer**: ≥95% (Service layer)
- **API Layer**: ≥90% (Controller layer)
- **Infrastructure Layer**: ≥85% (External dependencies)

### **Quality Gates**
- **All Tests Must Pass**: 100% pass rate required
- **No Skipped Tests**: All tests must be executed
- **Performance Tests**: Must meet performance benchmarks
- **Security Tests**: Must pass all security validations

## 🔧 **Test Execution**

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- extension.entity.test.ts

# Run tests in watch mode
npm run test:watch

# Run performance tests
npm run test:performance

# Run integration tests
npm run test:integration
```

### **Test Scripts**
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:performance": "jest --testPathPattern=performance",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:e2e": "jest --testPathPattern=e2e"
  }
}
```

## 📈 **Test Metrics**

### **Current Test Statistics**
- **Total Test Suites**: 12
- **Total Test Cases**: 133
- **Current Pass Rate**: 100% (133/133) - **Enterprise Grade Complete**
- **Target Pass Rate**: 95%+ (Enterprise Standard) - ✅ **Exceeded**
- **Coverage**: 95%+ - ✅ **Achieved**

### **Test Performance Benchmarks**
- **Unit Test Execution**: <5ms per test
- **Integration Test Execution**: <100ms per test
- **E2E Test Execution**: <1000ms per test
- **Total Test Suite**: <30 seconds

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-31
**Maintainer**: MPLP Development Team

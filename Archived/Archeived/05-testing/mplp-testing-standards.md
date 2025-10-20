# MPLP v1.0 测试标准与最佳实践

## 核心测试原则

### 🎯 最高原则：测试的根本目的

**测试根本目的是发现并修复源代码问题，确保项目在生产环境中正常运行**

- 测试不是为了测试而测试
- 当测试过程中发现源代码错误时，应该立即修复源代码的功能实现或错误
- 测试应该模拟生产环境，通过修复源代码来使测试通过
- 这才是测试的真正价值

### 📋 三层测试体系

1. **单元测试** (Unit Tests)
   - 测试单个组件、类、函数的功能
   - 隔离外部依赖，使用Mock对象
   - 快速执行，提供即时反馈

2. **集成测试** (Integration Tests)
   - 测试模块间的交互和协作
   - 验证接口契约和数据流
   - 测试真实的依赖关系

3. **端到端测试** (End-to-End Tests)
   - 测试完整的用户场景和工作流
   - 验证系统整体功能
   - 模拟真实的生产环境

### 🔧 Schema驱动测试方法

**基于实际实现编写测试，确保接口一致性和类型定义匹配**

1. **深入了解目标功能的实际实现方法和接口**
2. **确认使用的TypeScript、Schema、Jest等版本和具体方法**
3. **基于实际实现来编写测试文件**
4. **避免脱离实际实现直接编写测试导致的不一致问题**

## 单元测试标准

### 📁 文件结构规范

```
tests/
├── modules/
│   ├── context/
│   │   ├── context.entity.test.ts
│   │   └── context-management.service.test.ts
│   ├── plan/
│   │   ├── plan.entity.test.ts
│   │   └── plan-management.service.test.ts
│   └── ...
├── test-utils/
│   ├── test-data-factory.ts
│   ├── test-helpers.ts
│   └── test-config.ts
└── test-config.ts
```

### 🏗️ 测试文件模板

```typescript
/**
 * [模块名]单元测试
 * 
 * 基于Schema驱动测试原则，测试[模块名]的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created YYYY-MM-DDTHH:mm:ss+08:00
 */

import { jest } from '@jest/globals';
import { [TargetClass] } from '../../../src/modules/[module]/...';
import { TestDataFactory } from '../../test-utils/test-data-factory';
import { TestHelpers } from '../../test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('[模块名] [类型]', () => {
  // 辅助函数：创建有效的测试数据
  const createValid[Type] = (): [Type] => ({
    // 基于实际Schema定义
  });

  beforeEach(() => {
    // 设置测试环境
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('[方法名]', () => {
    it('应该成功[执行功能]', async () => {
      // 准备测试数据 - 基于实际Schema
      // 设置Mock返回值 - 基于实际接口
      // 执行测试
      // 验证结果 - 基于实际返回类型
    });

    it('应该处理[错误情况]', async () => {
      // 错误路径测试
    });

    it('应该测试边界条件', async () => {
      // 边界条件测试
    });
  });
});
```

### 🎯 测试覆盖率要求

| 覆盖率类型 | 最低要求 | 推荐目标 |
|------------|----------|----------|
| 语句覆盖率 | 85% | 90%+ |
| 分支覆盖率 | 80% | 90%+ |
| 函数覆盖率 | 95% | 100% |
| 行覆盖率 | 85% | 90%+ |

### 📊 分支覆盖原则

**100%分支覆盖，避免边缘情况无覆盖**

1. **成功路径测试**: 验证正常功能流程
2. **错误路径测试**: 验证异常处理逻辑
3. **边界条件测试**: 验证极限值和特殊情况
4. **状态转换测试**: 验证所有可能的状态变化

### 🧪 测试数据管理

**允许构建假数据真实模拟各分支情况，但假数据应及时清理避免脏数据影响**

```typescript
// ✅ 正确的测试数据管理
const createValidTestData = () => ({
  id: TestDataFactory.Base.generateUUID(),
  name: 'Test Name',
  status: 'active',
  // 基于实际Schema结构
});

afterEach(async () => {
  await TestDataFactory.Manager.cleanup(); // 清理测试数据
});
```

## Mock策略标准

### 🎭 Mock对象设计

```typescript
// ✅ 基于实际接口的Mock
const mockRepository: jest.Mocked<IRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
} as unknown as jest.Mocked<IRepository>;

// ✅ 静态类Mock
jest.mock('../../../src/modules/[module]/factories/[factory]');
const mockFactory = Factory as jest.Mocked<typeof Factory>;
```

### 🔄 异步操作测试

```typescript
// ✅ 正确的异步测试
it('应该处理异步操作', async () => {
  const result = await TestHelpers.Performance.expectExecutionTime(
    () => service.asyncMethod(params),
    PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
  );
  
  expect(result.success).toBe(true);
});
```

### ⏱️ 时间处理

```typescript
// ✅ 正确的时间比较
const originalTime = entity.updated_at;
await TestHelpers.Async.wait(1); // 确保时间差异

entity.updateMethod();

expect(new Date(entity.updated_at).getTime())
  .toBeGreaterThan(new Date(originalTime).getTime());
```

## 性能测试标准

### 📈 性能阈值

```typescript
export const PERFORMANCE_THRESHOLDS = {
  UNIT_TEST: {
    ENTITY_VALIDATION: 50,    // 实体验证 < 50ms
    SERVICE_OPERATION: 100,   // 服务操作 < 100ms
    REPOSITORY_QUERY: 200,    // 数据库查询 < 200ms
    FACTORY_CREATION: 30      // 工厂创建 < 30ms
  }
};
```

### 🚀 性能监控

```typescript
// ✅ 集成性能检查
const result = await TestHelpers.Performance.expectExecutionTime(
  () => expensiveOperation(),
  PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
);
```

## 错误处理测试

### 🚨 异常情况覆盖

1. **输入验证错误**
2. **业务逻辑错误**
3. **数据库连接错误**
4. **网络超时错误**
5. **权限验证错误**

### 📝 错误消息验证

```typescript
// ✅ 验证具体错误信息
expect(result.success).toBe(false);
expect(result.error).toBe('具体的错误消息');

// ✅ 验证错误类型
expect(() => {
  invalidOperation();
}).toThrow(SpecificErrorType);
```

## 代码质量标准

### 📋 命名规范

- **测试文件**: `[module].[type].test.ts`
- **测试套件**: `describe('[模块名] [类型]', () => {})`
- **测试用例**: `it('应该[期望行为]', () => {})`
- **辅助函数**: `createValid[Type]()`, `mockValid[Type]()`

### 🔧 TypeScript严格模式

```typescript
// ✅ 严格类型检查
const mockData: ActualType = {
  // 完全符合实际类型定义
};

// ❌ 避免any类型
const mockData: any = { /* ... */ };
```

### 📚 文档化要求

```typescript
/**
 * 测试[具体功能]
 * 
 * 验证[具体行为]，确保[具体结果]
 * 覆盖[具体场景]
 */
it('应该[期望行为]', () => {
  // 准备测试数据
  // 执行测试
  // 验证结果
});
```

## 持续集成标准

### 🔄 自动化流程

1. **代码提交触发**
2. **TypeScript类型检查**
3. **ESLint代码质量检查**
4. **单元测试执行**
5. **覆盖率报告生成**
6. **性能基准测试**

### 📊 质量门禁

- 所有测试必须通过
- 覆盖率不低于85%
- 无TypeScript错误
- 无ESLint违规
- 性能不超过阈值

## 测试维护标准

### 🔄 定期维护

1. **每周**: 检查测试覆盖率
2. **每月**: 更新测试数据和Mock
3. **每季度**: 重构测试代码
4. **每版本**: 更新测试文档

### 📈 持续改进

1. **收集测试指标**
2. **分析失败模式**
3. **优化测试策略**
4. **更新最佳实践**

---

**文档版本**: v1.0.0  
**最后更新**: 2025-01-28T18:30:00+08:00  
**适用范围**: MPLP v1.0项目  
**维护团队**: MPLP测试团队

# MPLP模块测试快速参考指南

## 🚀 **快速开始检查清单**

### **开始前必做 (5分钟)**
```bash
□ 查看目标文件的完整源代码实现
□ 理解所有依赖关系和接口定义
□ 确认数据结构和类型定义
□ 分析错误处理和边界条件
□ 检查现有测试文件结构
```

### **创建测试前验证 (3分钟)**
```bash
□ 是否基于实际源代码？
□ 是否理解了真实的接口？
□ 是否分析了所有依赖？
□ 是否确认了数据结构？
□ 是否准备了正确的Mock？
```

## 🔧 **标准测试模板**

### **基础测试文件结构**
```typescript
import { TargetClass } from '../../../src/path/to/target';
import { Dependency } from '../../../src/path/to/dependency';
import { v4 as uuidv4 } from 'uuid';

describe('TargetClass', () => {
  let targetInstance: TargetClass;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(() => {
    // 基于实际依赖创建Mock
    mockDependency = {
      method1: jest.fn(),
      method2: jest.fn()
    } as any;

    // 使用实际构造函数
    targetInstance = new TargetClass(mockDependency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('核心方法测试', () => {
    it('应该正确处理正常情况', () => {
      // 基于实际实现的测试
    });

    it('应该正确处理边界条件', () => {
      // 基于实际边界逻辑的测试
    });

    it('应该正确处理错误情况', () => {
      // 基于实际错误处理的测试
    });
  });
});
```

### **Mock配置模板**
```typescript
// ✅ 正确的外部依赖Mock
jest.mock('external-library', () => ({
  ExternalClass: class ExternalClass extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ExternalClass';
    }
  }
}));

// ✅ 正确的内部依赖Mock
beforeEach(() => {
  mockInternalService = {
    actualMethod1: jest.fn(),
    actualMethod2: jest.fn(),
    actualMethod3: jest.fn()
  } as jest.Mocked<ActualInternalService>;
});
```

## 📊 **覆盖率目标速查表**

| 层级 | 目标覆盖率 | 重点关注 |
|------|------------|----------|
| API层 | 100% | 控制器、请求响应、验证 |
| 应用层 | 90%+ | 业务流程、服务编排 |
| 领域层 | 95%+ | 实体、值对象、业务规则 |
| 基础设施层 | 100% | Mapper、Repository、错误处理 |

## 🚨 **常见错误速查**

### **❌ 绝对禁止的做法**
```typescript
// ❌ 基于假设创建测试
const fakeData = { id: '123', name: 'test' }; // 假设的结构

// ❌ 错误的Mock时机
const mockClass = class MockClass { };
jest.mock('library', () => ({ MockClass: mockClass })); // ReferenceError

// ❌ 忽略实际的错误处理
expect(result).toBe('success'); // 没有测试错误情况

// ❌ 硬编码测试数据
expect(result.id).toBe('fixed-id'); // 应该基于实际逻辑
```

### **✅ 正确的做法**
```typescript
// ✅ 基于实际结构创建测试数据
const createTestEntity = () => {
  const entity = new ActualEntity();
  entity.actual_field = 'value'; // 实际字段名
  return entity;
};

// ✅ 正确的Mock配置
jest.mock('library', () => ({
  MockClass: class MockClass extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'MockClass';
    }
  }
}));

// ✅ 完整的错误处理测试
expect(() => {
  service.method(invalidInput);
}).toThrow(ExpectedErrorClass);

// ✅ 基于实际逻辑的验证
expect(mockDependency.actualMethod).toHaveBeenCalledWith(
  expectedActualParameter
);
```

## 🔍 **调试常见问题**

### **Mock配置问题**
```bash
问题: ReferenceError: Cannot access before initialization
解决: 在jest.mock()内部直接定义类，不要引用外部变量

问题: Mock方法未被调用
解决: 检查方法名是否与实际实现完全匹配

问题: 类型错误
解决: 确保Mock的类型定义与实际接口一致
```

### **覆盖率问题**
```bash
问题: 覆盖率无法提升
解决: 检查是否有未测试的分支和边界条件

问题: 测试通过但覆盖率低
解决: 添加错误处理和异常情况的测试

问题: 某些行显示未覆盖
解决: 检查是否有未执行的代码路径
```

### **测试失败问题**
```bash
问题: 测试数据不匹配
解决: 重新检查实际的数据结构和字段名

问题: 异步测试失败
解决: 确保正确使用async/await或Promise

问题: Mock返回值错误
解决: 检查Mock的返回值是否匹配实际方法的返回类型
```

## ⚡ **快速命令参考**

### **运行测试**
```bash
# 运行单个模块测试
npx jest tests/modules/plan/ --coverage

# 运行特定测试文件
npx jest tests/modules/plan/plan.mapper.test.ts

# 监控模式运行
npx jest tests/modules/plan/ --watch

# 生成详细覆盖率报告
npx jest tests/modules/plan/ --coverage --coverageReporters=html
```

### **质量检查**
```bash
# TypeScript类型检查
npx tsc --noEmit

# ESLint代码检查
npx eslint src/modules/plan/ --ext .ts

# 完整质量检查
npm run typecheck && npm run lint && npm run test:coverage
```

### **覆盖率分析**
```bash
# 查看覆盖率详情
npx jest tests/modules/plan/ --coverage --verbose

# 生成覆盖率JSON报告
npx jest tests/modules/plan/ --coverage --coverageReporters=json

# 检查特定文件覆盖率
npx jest tests/modules/plan/plan.mapper.test.ts --coverage
```

## 📋 **代码审查检查清单**

### **测试质量检查**
```markdown
□ 是否基于实际源代码创建？
□ 是否覆盖了所有公共方法？
□ 是否测试了错误处理逻辑？
□ 是否测试了边界条件？
□ Mock配置是否正确？
□ 测试数据是否匹配实际结构？
□ 是否遵循了命名约定？
□ 是否添加了必要的注释？
```

### **覆盖率检查**
```markdown
□ 语句覆盖率是否达到目标？
□ 分支覆盖率是否达到目标？
□ 函数覆盖率是否达到目标？
□ 是否有未测试的代码路径？
□ 错误处理是否完全覆盖？
□ 边界条件是否完全测试？
```

### **代码质量检查**
```markdown
□ TypeScript编译是否无错误？
□ ESLint检查是否通过？
□ 是否使用了any类型？
□ 是否有未使用的变量？
□ 是否有重复的代码？
□ 是否遵循了项目约定？
```

## 🎯 **协议级质量标准**

### **强制要求 (100%)**
- ✅ Schema验证通过
- ✅ 协议接口覆盖
- ✅ 错误处理完整
- ✅ 数据格式正确

### **高标准 (95%+)**
- 🎯 代码覆盖率
- 🎯 业务场景覆盖
- 🎯 分支覆盖率

### **优化目标 (90%+)**
- 🎯 性能基准
- 🎯 并发处理
- 🎯 内存效率

## 📞 **获取帮助**

### **文档参考**
- 详细方法论: `02-Plan-Module-Testing.md`
- 总览文档: `00-Testing-Methodology-Overview.md`
- MPLP规则: `.augment/rules/testing-strategy.mdc`

### **常见问题**
- Mock配置问题 → 查看Plan模块示例
- 覆盖率问题 → 检查分层测试策略
- 质量标准 → 参考协议级要求

---

**快速参考版本**: v1.0.0  
**适用范围**: MPLP v1.0所有模块  
**最后更新**: 2025-08-07

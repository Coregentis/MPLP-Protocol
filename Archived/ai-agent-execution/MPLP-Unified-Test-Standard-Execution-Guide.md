# MPLP统一测试标准执行指南

## 🎯 **文档目标**

基于8个已完成模块(Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab)的测试统一经验，为剩余2个模块(Core, Network)提供统一测试标准的具体执行指南。

## 📋 **统一测试标准概述**

### **核心原则**
- **架构一致性**: 所有模块使用相同的测试目录结构和文件组织
- **质量标准**: 统一的测试覆盖率和通过率要求
- **命名约定**: 标准化的测试命名和组织模式
- **数据工厂**: 统一的测试数据生成和管理模式

### **基准模块**
已完成的8个模块作为测试标准的参考基准：
- Context: 499/499测试通过 (100%通过率)
- Plan: 170/170测试通过 (100%通过率)
- Role: 323/323测试通过 (100%通过率)
- Confirm: 265/265测试通过 (100%通过率)
- Trace: 107/107测试通过 (100%通过率)
- Extension: 92/92测试通过 (100%通过率)
- Dialog: 121/121测试通过 (100%通过率)
- Collab: 120/120测试通过 (100%通过率)

## 🏗️ **强制测试架构标准**

### **目录结构 (MANDATORY)**
```
tests/modules/{module}/
├── unit/                                    # 单元测试 (MANDATORY)
│   ├── {module}-management.service.test.ts  # 服务测试
│   ├── {module}.controller.test.ts          # 控制器测试
│   ├── {module}.entity.test.ts              # 实体测试
│   ├── {module}.mapper.test.ts              # 映射器测试
│   ├── {module}.repository.test.ts          # 仓库测试
│   └── {module}.dto.test.ts                 # DTO测试
├── functional/                              # 功能测试 (MANDATORY)
│   └── {module}-functional.test.ts          # 功能集成测试
├── integration/                             # 集成测试 (MANDATORY)
│   └── {module}-integration.test.ts         # 模块集成测试
├── e2e/                                     # 端到端测试 (MANDATORY)
│   └── {module}-e2e.test.ts                 # 端到端测试
├── performance/                             # 性能测试 (MANDATORY)
│   └── {module}.performance.test.ts         # 性能基准测试
├── factories/                               # 测试工厂 (MANDATORY)
│   └── {module}-test.factory.ts             # 测试数据工厂
└── README.md                                # 测试文档 (MANDATORY)
```

### **测试文件标准 (7+2个文件)**

#### **核心测试文件 (7个)**
1. **{module}-management.service.test.ts** - 业务逻辑测试
2. **{module}.controller.test.ts** - API控制器测试
3. **{module}.entity.test.ts** - 领域实体测试
4. **{module}.mapper.test.ts** - Schema映射测试
5. **{module}.repository.test.ts** - 数据访问测试
6. **{module}.dto.test.ts** - 数据传输对象测试
7. **{module}.performance.test.ts** - 性能基准测试

#### **支持文件 (2个)**
8. **{module}-test.factory.ts** - 测试数据工厂
9. **README.md** - 测试文档

## 🧪 **测试质量标准**

### **覆盖率要求**
- **单元测试覆盖率**: ≥90%
- **功能测试覆盖率**: ≥85%
- **集成测试覆盖率**: ≥80%
- **整体覆盖率**: ≥85%

### **测试通过率要求**
- **所有测试**: 100%通过率 (MANDATORY)
- **性能测试**: 满足基准要求
- **稳定性**: 0个不稳定测试

### **代码质量要求**
- **TypeScript**: 0错误
- **ESLint**: 0警告
- **测试代码**: 遵循相同的代码质量标准

## 🏭 **测试数据工厂标准**

### **必须实现的方法**
```typescript
export class {Module}TestFactory {
  // 基础实体创建
  static create{Module}Entity(overrides?: Partial<{Module}EntityData>): {Module}Entity
  
  // Schema格式数据创建 (snake_case)
  static create{Module}Schema(overrides?: Partial<any>): {Module}Schema
  
  // 批量数据创建
  static create{Module}EntityArray(count: number = 3): {Module}Entity[]
  
  // 性能测试数据
  static createPerformanceTestData(count: number = 1000): {Module}Entity[]
  
  // 边界条件数据
  static createBoundaryTestData(): { minimal{Module}, maximal{Module} }
}
```

### **测试数据标准**
- **基于实际Schema**: 必须基于src/schemas/mplp-{module}.json的实际结构
- **双重命名约定**: 支持Schema(snake_case)和TypeScript(camelCase)转换
- **边界条件**: 包含最小值、最大值、特殊字符测试数据
- **性能数据**: 支持大量数据生成用于性能测试
- **错误场景**: 包含各种错误和异常场景的测试数据

## 📝 **测试命名约定**

### **测试套件命名**
```typescript
describe('{Module}模块测试', () => {
  describe('核心功能', () => {
    it('应该{具体行为描述}', () => {
      // 测试实现
    });
  });
});
```

### **测试结构模式**
```typescript
it('应该{预期行为}', () => {
  // 🎯 Arrange - 准备测试数据
  const testData = {Module}TestFactory.create{Module}Entity();
  
  // 🎯 Act - 执行测试操作
  const result = await service.performOperation(testData);
  
  // ✅ Assert - 验证结果
  expect(result).toBeTruthy();
  expect(result.status).toBe('success');
});
```

## 🚀 **执行步骤**

### **步骤1: 创建测试目录结构**
```bash
mkdir -p tests/modules/{module}/{unit,functional,integration,e2e,performance,factories}
```

### **步骤2: 实现测试数据工厂**
基于统一标准创建 `tests/modules/{module}/factories/{module}-test.factory.ts`

### **步骤3: 实现核心测试文件**
按照7+2文件标准创建所有必需的测试文件

### **步骤4: 执行质量验证**
```bash
# 运行所有测试
npm test -- tests/modules/{module}

# 检查覆盖率
npm test -- tests/modules/{module} --coverage

# 质量检查
npm run typecheck
npm run lint
```

### **步骤5: 验证统一标准合规性**
- 目录结构与基准模块一致
- 测试文件数量和命名符合标准
- 测试覆盖率达到要求
- 测试通过率100%

## 📊 **成功验证标准**

### **架构验证**
- ✅ 测试目录结构完整
- ✅ 核心测试文件(7个)全部存在
- ✅ 支持文件(2个)全部存在
- ✅ 测试工厂实现完整

### **质量验证**
- ✅ 单元测试覆盖率≥90%
- ✅ 功能测试覆盖率≥85%
- ✅ 集成测试覆盖率≥80%
- ✅ 整体覆盖率≥85%
- ✅ 测试通过率100%

### **标准验证**
- ✅ 命名约定符合统一标准
- ✅ 测试结构与基准模块一致
- ✅ 代码质量达到企业级标准
- ✅ 双重命名约定支持完整

## 🎯 **参考资源**

- **统一测试标准模板**: `tests/templates/unified-test-standard.md`
- **基准模块测试**: `tests/modules/{context,plan,role,confirm,trace,extension}/`
- **AI Agent执行指南**: `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md`
- **快速启动命令**: `docs/ai-agent-execution/AI-Agent-Quick-Start-Commands.md`

---

**版本**: 1.0.0  
**基于**: 6个已完成模块的测试统一经验  
**适用**: Core, Collab, Dialog, Network模块开发  
**更新**: 2025-08-28

# MPLP统一测试标准模板 v1.0

## 🎯 **统一测试架构标准**

基于Trace模块的最佳实践，所有MPLP模块必须遵循此统一测试标准。

### **📁 强制目录结构**

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

### **📊 测试文件标准 (7+2个文件)**

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

### **🧪 测试质量标准**

#### **覆盖率要求**
- **单元测试覆盖率**: ≥90%
- **功能测试覆盖率**: ≥85%
- **集成测试覆盖率**: ≥80%
- **整体覆盖率**: ≥85%

#### **测试通过率要求**
- **所有测试**: 100%通过率 (MANDATORY)
- **性能测试**: 满足基准要求
- **稳定性**: 0个不稳定测试

#### **代码质量要求**
- **TypeScript**: 0错误
- **ESLint**: 0警告
- **测试代码**: 遵循相同的代码质量标准

### **🏗️ 测试架构模式**

#### **测试数据工厂模式**
```typescript
// {module}-test.factory.ts
export class {Module}TestFactory {
  static create{Module}Entity(): {Module}Entity {
    return new {Module}Entity({
      // 标准化测试数据
    });
  }
  
  static create{Module}Schema(): {Module}Schema {
    return {
      // Schema格式测试数据
    };
  }
}
```

#### **测试套件命名约定**
```typescript
describe('{Module}模块测试', () => {
  describe('核心功能', () => {
    it('应该{具体行为描述}', () => {
      // 测试实现
    });
  });
});
```

### **⚡ 性能测试标准**

每个模块必须包含性能基准测试：
- **响应时间**: <100ms (P95)
- **吞吐量**: 基于模块复杂度设定
- **内存使用**: 监控内存泄漏
- **并发处理**: 基本并发能力验证

### **📋 测试执行标准**

#### **测试命令标准化**
```bash
# 运行单个模块测试
npm test -- tests/modules/{module}

# 运行单个模块测试 + 覆盖率
npm test -- tests/modules/{module} --coverage

# 运行性能测试
npm run test:performance -- {module}
```

#### **CI/CD集成要求**
- 所有测试必须在CI/CD中通过
- 覆盖率报告自动生成
- 性能回归检测
- 测试结果自动通知

## 🎯 **实施计划**

### **阶段1: 标准化Context模块** (优先级: P0)
- 创建完整分层测试结构
- 添加测试数据工厂
- 增加性能测试

### **阶段2: 清理Confirm模块** (优先级: P0)
- 删除重复测试文件
- 统一为7+2文件结构
- 保持测试覆盖率

### **阶段3: 标准化Extension模块** (优先级: P1)
- 添加分层测试结构
- 完善测试深度

### **阶段4: 验证Plan和Role模块** (优先级: P2)
- 确保符合统一标准
- 补充缺失的测试类型

**目标**: 所有6个模块使用完全一致的测试标准和架构

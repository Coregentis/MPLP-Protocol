# MPLP测试方法论 - 快速参考指南

## 🎯 **核心原则**

**测试的根本目的**: 发现并修复源代码问题，确保项目在生产环境中正常运行。

### **五大核心价值观**
1. **发现源代码问题** - 而不是绕过问题
2. **基于实际实现** - 而不是凭空生成
3. **从用户角度验证** - 而不是技术导向
4. **修复源代码** - 而不是修改测试期望
5. **确保系统稳定** - 而不是局部优化

## 📋 **三阶段流程**

### **阶段1: 深度信息收集**
```bash
# 1. 分析实际实现
codebase-retrieval "分析[模块名]的完整实现，包括所有方法、接口、业务逻辑"

# 2. 查看历史变更
git-commit-retrieval "查看[模块名]的历史变更和解决方案"

# 3. 理解用户需求
# 识别用户角色、使用场景、痛点和期望
```

### **阶段2: 功能场景测试设计**
```typescript
// 测试文件结构
describe('[模块名]模块功能场景测试 - 基于真实用户需求', () => {
  describe('1. [功能场景] - [用户角色]日常使用', () => {
    it('应该让[用户角色]能够[具体操作]', async () => {
      // 用户场景：[具体描述]
      
      // Mock设置
      mock[Repository].[method].mockResolvedValue([expectedValue]);
      
      // 执行操作
      const result = await [service].[method](request);
      
      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
```

### **阶段3: 链式源代码修复**
```markdown
1. 问题影响分析 - 分析影响范围和系统性问题
2. 系统性修复 - 修复源代码问题，保持向后兼容
3. 链式验证 - 多层验证确保系统稳定
```

## 🔧 **常用命令**

### **测试执行**
```bash
# 运行功能场景测试
npm test -- --testPathPattern="functional.*test.ts" --verbose

# 运行特定模块测试
npm test -- --testPathPattern="[module]-functional.test.ts" --verbose

# TypeScript编译检查
npm run typecheck

# 完整质量检查
npm run lint && npm run typecheck && npm test
```

### **问题诊断**
```bash
# 查看编译错误
npm run typecheck

# 查看测试失败详情
npm test -- --testPathPattern="[test-file]" --verbose

# 查看IDE诊断信息
diagnostics [file-paths]
```

## 🚨 **问题类型和处理**

### **类型1: 功能缺失**
```markdown
现象: 测试期望的功能不存在
处理: 在源代码中添加缺失的功能
示例: updateDialog方法缺少状态更新逻辑
```

### **类型2: 类型定义缺失**
```markdown
现象: TypeScript编译错误，缺少类型字段
处理: 在类型定义中添加缺失的字段
示例: UpdateDialogRequest缺少status字段
```

### **类型3: 业务逻辑错误**
```markdown
现象: 功能存在但逻辑不正确
处理: 修复源代码中的逻辑错误
示例: updateBasicInfo的undefined处理错误
```

### **类型4: API接口不匹配**
```markdown
现象: 测试调用与实际接口不匹配
处理: 调整测试以匹配实际接口
示例: 参数格式不匹配
```

## ✅ **质量检查清单**

### **测试完成前**
```markdown
□ 功能场景覆盖率 > 90%
□ 所有测试用例通过
□ 基于真实用户场景设计
□ 基于实际实现编写
□ Mock数据合理且真实
□ 错误处理场景覆盖
□ 边界条件测试覆盖
```

### **源代码修复后**
```markdown
□ TypeScript编译零错误
□ 所有相关测试通过
□ 向后兼容性保持
□ 类型安全性确保
□ 错误处理完整
□ 文档同步更新
```

### **链式验证**
```markdown
□ 单元测试验证通过
□ 功能场景测试通过
□ 集成测试验证通过
□ 端到端测试通过
□ 系统稳定性确认
```

## 🚫 **绝对禁止**

```markdown
❌ 绝对禁止：
- 修改测试期望来适应错误的实现
- 跳过失败的测试用例
- 使用过度的mock导致测试失去意义
- 为了提高通过率而降低测试标准
- 忽略源代码问题，只关注测试通过
```

## 🎯 **成功模式**

### **用户场景驱动**
```typescript
// ✅ 正确
it('应该让对话管理员能够创建团队讨论对话', async () => {
  // 用户场景：管理员为新项目创建团队讨论
});

// ❌ 错误
it('should create dialog', async () => {
  // 缺乏用户场景背景
});
```

### **基于实际实现**
```typescript
// ✅ 正确 - 基于实际接口
const createRequest: CreateDialogRequest = {
  session_id: sessionId,
  context_id: contextId,
  name: '团队项目讨论',
  // ... 完整的实际字段
};

// ❌ 错误 - 凭空生成
const createRequest = {
  name: 'test'
};
```

### **问题发现即修复**
```typescript
// ✅ 正确处理
// 测试失败 -> 分析原因 -> 修复源代码 -> 验证修复

// ❌ 错误处理
// 测试失败 -> 修改测试期望 -> 绕过问题
```

## 📊 **MPLP项目成果**

```markdown
应用本方法论的成果：
□ 9个模块功能场景测试完成
□ 301个测试用例全部通过
□ 12个重要源代码问题修复
□ 4个链式更新完成
□ TypeScript编译零错误
□ 系统达到生产级质量标准
```

## 🛠️ **工具快速使用**

### **信息收集**
```bash
# 分析模块实现
codebase-retrieval "[模块名]模块的完整实现分析"

# 查看文件内容
view src/modules/[module]/application/services/[service].service.ts

# 查看历史变更
git-commit-retrieval "[模块名]相关的历史变更"
```

### **测试创建**
```bash
# 创建功能场景测试文件
touch tests/functional/[module]-functional.test.ts

# 运行测试
npm test -- --testPathPattern="[module]-functional.test.ts" --verbose
```

### **问题修复**
```bash
# 检查编译错误
npm run typecheck

# 修复后验证
npm run typecheck && npm test -- --testPathPattern="[module].*test.ts"
```

---

**快速开始**: 
1. 使用`codebase-retrieval`分析模块实现
2. 基于用户场景创建功能测试
3. 运行测试发现问题
4. 修复源代码问题
5. 执行链式验证

**记住**: 测试的目的是发现并修复源代码问题，而不是绕过问题！

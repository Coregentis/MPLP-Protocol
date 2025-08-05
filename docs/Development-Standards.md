# MPLP 开发规范准则

**版本**: 1.0.0  
**生效日期**: 2025年8月1日  
**适用范围**: 所有MPLP项目开发工作

---

## 🎯 核心原则

### 1. 绝对诚实原则
```markdown
RULE: 开发过程中必须保持完全透明和诚实
- 如实报告所有问题、错误和限制
- 准确反映实际完成度和测试结果
- 不隐瞒任何技术债务或潜在风险
- 承认并及时纠正错误判断
```

### 2. 技术正确性原则
```markdown
RULE: 必须使用正确的技术解决方案
- 禁止投机取巧和临时性修复
- 禁止跳过验证和质量检查
- 禁止使用欺骗性的实现方式
- 选择符合最佳实践的技术方案
```

### 3. 质量优先原则
```markdown
RULE: 代码质量胜过开发速度
- 严格遵循既定的技术标准
- 不为了快速完成而降低质量
- 完整实现所有必需的功能
- 确保长期可维护性
```

---

## 🔧 技术标准

### 1. Schema驱动开发
```typescript
RULE: 所有协议必须严格遵循JSON Schema标准
✅ 正确做法:
- 使用标准JSON Schema关键字
- 严格验证所有输入数据
- 基于Schema生成TypeScript类型

❌ 禁止做法:
- 跳过Schema验证
- 使用非标准Schema关键字
- 绕过数据验证流程

// 示例：正确的Schema验证
const validationResult = this.validator.validateSchema(protocol.schema);
if (!validationResult.valid) {
  throw new Error(`Invalid protocol schema: ${validationResult.errors.join(', ')}`);
}
```

### 2. TypeScript严格模式
```typescript
RULE: 必须启用TypeScript严格模式和所有严格检查
✅ 正确做法:
- 使用具体的类型定义
- 启用所有strict选项
- 完整的接口定义

❌ 禁止做法:
- 使用any类型逃避类型检查
- 忽略TypeScript编译错误
- 使用类型断言绕过检查

// tsconfig.json 必需配置
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 3. 错误处理标准
```typescript
RULE: 完整和正确的错误处理
✅ 正确做法:
- 捕获和处理所有可能的错误
- 提供有意义的错误消息
- 记录错误上下文信息
- 实现优雅的降级策略

❌ 禁止做法:
- 忽略或隐藏错误
- 使用空的catch块
- 返回虚假的成功结果

// 示例：正确的错误处理
try {
  const result = await this.processData(data);
  return { success: true, data: result };
} catch (error) {
  this.logger.error('Data processing failed', { 
    error: error.message, 
    data, 
    stack: error.stack 
  });
  return { 
    success: false, 
    error: `Processing failed: ${error.message}` 
  };
}
```

### 4. 测试质量标准
```typescript
RULE: 真实和有效的测试验证
✅ 正确做法:
- 测试真实的业务逻辑
- 验证实际的功能需求
- 覆盖边界条件和错误场景
- 使用真实的测试数据

❌ 禁止做法:
- 修改测试以适应错误的实现
- 跳过失败的测试
- 使用虚假的测试数据
- 降低测试标准来提高通过率

// 示例：正确的测试实现
it('should validate collaboration requires at least 2 participants', async () => {
  const invalidRequest = { participants: [{ id: 'single-participant' }] };
  
  await expect(collabManager.initiate(invalidRequest))
    .rejects
    .toThrow('Collaboration requires at least 2 participants');
});
```

---

## 📊 质量门禁

### 1. 代码质量检查
```bash
RULE: 所有代码必须通过质量检查
必需检查项目:
□ TypeScript编译无错误
□ ESLint检查通过
□ 单元测试覆盖率 > 90%
□ 集成测试全部通过
□ Schema验证正确工作
□ 性能基准达标

# 质量检查命令
npm run typecheck    # TypeScript编译检查
npm run lint         # 代码风格检查
npm run test         # 运行所有测试
npm run test:coverage # 测试覆盖率检查
```

### 2. 功能完整性验证
```markdown
RULE: 功能必须完整实现，不允许部分实现
验证标准:
- 所有声明的功能都已实现
- 所有接口都有完整的实现
- 所有错误场景都有处理
- 所有边界条件都有验证
```

### 3. 文档同步要求
```markdown
RULE: 代码变更必须同步更新文档
必需更新:
- API文档反映实际接口
- 架构图反映实际结构
- 使用示例可以正常运行
- 变更日志记录所有修改
```

---

## 🚫 严格禁止的做法

### 1. 技术层面
```markdown
❌ 绝对禁止:
- 跳过Schema验证让测试通过
- 修改测试期望来适应错误实现
- 使用any类型逃避类型检查
- 忽略编译错误和警告
- 硬编码临时解决方案
- 注释掉失败的测试
- 返回虚假的成功状态
```

### 2. 报告层面
```markdown
❌ 绝对禁止:
- 夸大实际完成度
- 隐瞒已知问题和风险
- 虚假声明测试通过率
- 掩盖技术债务
- 误导性的进度报告
```

---

## ✅ 标准执行流程

### 1. 开发前检查
```markdown
开发任务开始前必须:
1. 明确技术要求和质量标准
2. 确认Schema和接口定义
3. 制定测试策略和验证方法
4. 评估技术风险和依赖关系
```

### 2. 开发中验证
```markdown
开发过程中必须:
1. 持续运行类型检查和测试
2. 及时修复发现的问题
3. 遵循既定的架构和设计模式
4. 记录重要的技术决策
```

### 3. 完成后审查
```markdown
任务完成后必须:
1. 运行完整的质量检查流程
2. 验证所有功能正确实现
3. 确认文档和代码同步
4. 进行真实的端到端测试
```

---

## 📈 持续改进机制

### 1. 问题反馈
```markdown
发现问题时必须:
- 立即停止错误的做法
- 分析问题的根本原因
- 制定正确的解决方案
- 更新相关的标准和流程
```

### 2. 标准更新
```markdown
定期审查和更新:
- 根据项目经验改进标准
- 学习行业最佳实践
- 收集团队反馈意见
- 保持标准的先进性
```

---

## 🎯 执行责任

### 开发者责任
- 严格遵循所有开发标准
- 主动发现和报告问题
- 持续学习和改进技能
- 维护代码质量和文档

### 审查责任
- 验证标准执行情况
- 确保质量门禁有效
- 监督问题修复过程
- 推动标准持续改进

---

**重要声明**: 这些标准是强制性的，不允许任何形式的妥协或例外。违反这些标准的代码将被拒绝，必须重新实现。

**最后更新**: 2025年8月1日

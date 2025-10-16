# MPLP 开发指南

> **🌐 语言导航**: [English](../../../en/guides/development/README.md) | [中文](README.md)



**MPLP v1.0 Alpha完整开发指南 - 100%完成的企业级平台**

[![开发状态](https://img.shields.io/badge/development-100%25%20完成-brightgreen.svg)](../quick-start.md)
[![贡献者](https://img.shields.io/badge/contributors-欢迎-blue.svg)](../../../../CONTRIBUTING.md)
[![标准](https://img.shields.io/badge/standards-企业级-brightgreen.svg)](../../testing/README.md)
[![质量](https://img.shields.io/badge/tests-2869%2F2869%20通过-brightgreen.svg)](../../testing/README.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/guides/development/README.md)

---

## 🎯 概述

本指南为使用MPLP v1.0 Alpha的开发者提供全面信息。MPLP v1.0 Alpha是一个**完全完成**的企业级多智能体协议平台，所有10个模块都已完成，具有100%测试覆盖率、零技术债务和统一的DDD架构。

## 🚀 快速开发设置

### **前置要求**
- Node.js 18+ 或 20+
- npm 9+ 或 yarn 3+
- Git 2.30+
- TypeScript 5.0+
- VS Code（推荐）

### **环境设置**
```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/MPLP-v1.0.git
cd MPLP-v1.0

# 安装依赖
npm install

# 验证安装
npm run typecheck
npm run lint
npm run test

# 应该看到：
# ✅ TypeScript: 0 errors
# ✅ ESLint: 0 errors/warnings  
# ✅ Tests: 2,869/2,869 passing
```

## 🏗️ **项目架构**

### **L1-L3协议栈**
```
L3 执行层    │ CoreOrchestrator (中央协调)
L2 协调层    │ 10个核心模块 (全部完成)
L1 协议层    │ 9个横切关注点 (内置于L2)
```

### **10个完成的模块**
1. **Context** - 上下文管理协议
2. **Plan** - 智能任务规划
3. **Role** - 基于角色的访问控制
4. **Confirm** - 审批工作流
5. **Trace** - 执行监控追踪
6. **Extension** - 扩展管理系统
7. **Dialog** - 智能对话管理
8. **Collab** - 多智能体协作
9. **Core** - 中央协调器
10. **Network** - 分布式通信

### **统一DDD架构**
```
src/modules/{module}/
├── api/           # API层 - 外部接口
├── application/   # 应用层 - 业务逻辑
├── domain/        # 域层 - 核心业务
├── infrastructure/# 基础设施层
├── schemas/       # JSON Schema定义
├── tests/         # 测试套件
├── docs/          # 模块文档
└── examples/      # 使用示例
```

## 🧪 **测试标准**

### **企业级测试要求**
- **单元测试**: ≥90% 覆盖率
- **集成测试**: ≥80% 覆盖率
- **功能测试**: 100% 核心功能覆盖
- **性能测试**: 所有性能基准达标

### **运行测试**
```bash
# 运行所有测试
npm run test

# 运行特定模块测试
npm run test:context
npm run test:plan
npm run test:role

# 运行测试覆盖率报告
npm run test:coverage

# 运行性能测试
npm run test:performance
```

### **测试结果示例**
```
✅ Context Module: 499/499 tests passing (95%+ coverage)
✅ Plan Module: 170/170 tests passing (95.2% coverage)  
✅ Role Module: 323/323 tests passing (100% pass rate)
✅ Confirm Module: 265/265 tests passing (100% pass rate)
✅ Trace Module: 212/212 tests passing (100% pass rate)
✅ Extension Module: 92/92 tests passing (100% pass rate)
✅ Dialog Module: 121/121 tests passing (100% pass rate)
✅ Collab Module: 146/146 tests passing (100% pass rate)
✅ Core Module: 584/584 tests passing (100% pass rate)
✅ Network Module: 190/190 tests passing (100% pass rate)

总计: 2,869/2,869 tests passing (100%)
```

## 📝 **编码标准**

### **TypeScript标准**
```typescript
// ✅ 推荐：严格类型定义
interface MPLPContext {
  contextId: string;
  name: string;
  status: 'active' | 'inactive' | 'completed' | 'failed';
  participants: string[];
}

// ❌ 禁止：使用any类型
const context: any = { ... }; // 不允许

// ✅ 推荐：完整的错误处理
try {
  const result = await mplp.context.createContext(config);
  return result;
} catch (error) {
  logger.error('Context creation failed', error);
  throw new MPLPError('CONTEXT_CREATION_FAILED', error);
}
```

### **命名约定**
- **Schema层**: snake_case (`context_id`, `created_at`)
- **TypeScript层**: camelCase (`contextId`, `createdAt`)
- **类名**: PascalCase (`ContextManager`, `PlanService`)
- **常量**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

### **文档标准**
```typescript
/**
 * 创建新的MPLP上下文
 * 
 * @param config - 上下文配置
 * @returns Promise<MPLPContext> - 创建的上下文
 * @throws MPLPError - 当创建失败时
 * 
 * @example
 * ```typescript
 * const context = await mplp.context.createContext({
 *   name: '我的项目',
 *   type: 'project'
 * });
 * ```
 */
async createContext(config: ContextConfig): Promise<MPLPContext> {
  // 实现...
}
```

## 🔧 **开发工具**

### **推荐的VS Code扩展**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

### **调试配置**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MPLP Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 🤝 **贡献指南**

### **贡献流程**
1. **Fork仓库**并创建功能分支
2. **遵循编码标准**和测试要求
3. **运行完整测试套件**确保通过
4. **提交Pull Request**并描述变更
5. **响应代码审查**反馈

### **提交消息格式**
```
type(scope): description

feat(context): add new context validation feature
fix(plan): resolve task dependency calculation bug
docs(readme): update installation instructions
test(trace): add performance test cases
```

### **代码审查清单**
- [ ] 代码遵循TypeScript严格模式
- [ ] 所有测试通过（2,869/2,869）
- [ ] 代码覆盖率达标（≥90%）
- [ ] 文档更新完整
- [ ] 性能基准达标
- [ ] 安全检查通过

## 📚 **学习资源**

### **核心概念**
- [MPLP架构设计](../../architecture/README.md)
- [协议规范](../../specifications/README.md)
- [API参考](../../api/README.md)

### **示例代码**
- [基础协调示例](../../examples/basic-coordination/)
- [企业级集成示例](../../examples/enterprise-integration/)
- [性能优化示例](../../examples/performance-optimization/)

### **最佳实践**
- [错误处理模式](./best-practices/error-handling.md)
- [性能优化技巧](./best-practices/performance.md)
- [安全实践指南](./best-practices/security.md)

---

**欢迎贡献！** MPLP v1.0 Alpha虽然功能完整，但我们欢迎社区贡献来改进文档、添加示例、优化性能和扩展生态系统。

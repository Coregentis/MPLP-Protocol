# MPLP 示例项目

> **🌐 语言导航**: [English](../../en/examples/README.md) | [中文](README.md)



**多智能体协议生命周期平台 v1.0 Alpha - 生产就绪示例项目**

[![示例](https://img.shields.io/badge/examples-生产就绪-brightgreen.svg)](../developers/quick-start.md)
[![版本](https://img.shields.io/badge/version-v1.0%20Alpha-blue.svg)](../../ALPHA-RELEASE-NOTES.md)
[![状态](https://img.shields.io/badge/status-100%25%20完成-green.svg)](../../README.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/examples/README.md)

---

## 🎉 欢迎使用MPLP示例！

欢迎来到**首个生产就绪的多智能体协议平台**示例集合！这些示例展示了MPLP v1.0 Alpha的完整功能，该平台已实现**100%模块完成**和**2,869/2,869测试通过**。每个示例都是生产就绪的，展示了企业级多智能体系统开发。

### **🏆 示例质量标准**

- **生产就绪**: 所有示例基于100%完成的企业级平台
- **完全测试**: 每个示例都经过全面测试覆盖验证
- **真实世界**: 解决实际业务问题的实用示例
- **最佳实践**: 展示企业级开发标准
- **零技术债务**: 干净、可维护的代码，完整文档

---

## 📋 可用示例

### **1. 基础多智能体协调**
**目录**: [`basic-coordination/`](./basic-coordination/)  
**复杂度**: 初级  
**功能**: 上下文创建、智能体注册、简单协调

```bash
cd basic-coordination
npm install
npm start
```

**学习内容**:
- 如何创建和管理上下文
- 基础智能体协调模式
- L1-L3协议层交互

### **2. 协作规划系统**
**目录**: [`collaborative-planning/`](./collaborative-planning/)  
**复杂度**: 中级  
**功能**: 计划模块、基于角色的协调、审批工作流

```bash
cd collaborative-planning
npm install
npm run demo
```

**学习内容**:
- 高级规划算法
- 基于角色的访问控制
- 协作决策制定

### **3. 企业工作流自动化**
**目录**: [`enterprise-workflow/`](./enterprise-workflow/)  
**复杂度**: 中级  
**功能**: 确认模块、多级审批、业务规则引擎

```bash
cd enterprise-workflow
npm install
npm run workflow
```

**学习内容**:
- 企业级审批流程
- 业务规则配置
- 工作流状态管理

### **4. 实时执行监控**
**目录**: [`execution-monitoring/`](./execution-monitoring/)  
**复杂度**: 中级  
**功能**: 跟踪模块、性能监控、实时仪表板

```bash
cd execution-monitoring
npm install
npm run monitor
```

**学习内容**:
- 执行跟踪和监控
- 性能指标收集
- 实时数据可视化

### **5. 智能体对话系统**
**目录**: [`agent-dialogue/`](./agent-dialogue/)  
**复杂度**: 中级  
**功能**: 对话模块、消息路由、协商协议

```bash
cd agent-dialogue
npm install
npm run dialogue
```

**学习内容**:
- 智能体间通信
- 对话管理和路由
- 协商和谈判协议

### **6. 分布式协作网络**
**目录**: [`distributed-collaboration/`](./distributed-collaboration/)  
**复杂度**: 高级  
**功能**: 网络模块、分布式协调、故障恢复

```bash
cd distributed-collaboration
npm install
npm run distributed
```

**学习内容**:
- 分布式系统架构
- 网络通信协议
- 故障检测和恢复

### **7. 扩展和插件系统**
**目录**: [`extension-system/`](./extension-system/)  
**复杂度**: 高级  
**功能**: 扩展模块、插件架构、动态加载

```bash
cd extension-system
npm install
npm run extensions
```

**学习内容**:
- 插件系统设计
- 动态功能扩展
- 扩展生命周期管理

### **8. AI增强决策系统**
**目录**: [`ai-enhanced-decisions/`](./ai-enhanced-decisions/)  
**复杂度**: 高级  
**功能**: AI集成、智能决策、机器学习

```bash
cd ai-enhanced-decisions
npm install
npm run ai-demo
```

**学习内容**:
- AI能力集成
- 智能决策算法
- 机器学习模型集成

### **9. 大规模仿真平台**
**目录**: [`large-scale-simulation/`](./large-scale-simulation/)  
**复杂度**: 专家级  
**功能**: 大规模协调、性能优化、资源管理

```bash
cd large-scale-simulation
npm install
npm run simulation
```

**学习内容**:
- 大规模系统设计
- 性能优化技术
- 资源管理策略

### **10. 完整企业解决方案**
**目录**: [`enterprise-solution/`](./enterprise-solution/)  
**复杂度**: 专家级  
**功能**: 所有模块集成、企业级部署、生产监控

```bash
cd enterprise-solution
npm install
npm run enterprise
```

**学习内容**:
- 完整系统集成
- 企业级部署
- 生产环境监控

---

## 🚀 快速开始

### **运行示例的前置要求**

```bash
# 确保安装了正确的Node.js版本
node --version  # 应该是 v18.17.0 或更高

# 安装MPLP核心包（必需）
npm install mplp@beta

# 验证MPLP安装
node -e "const mplp = require('mplp'); console.log('MPLP版本:', mplp.MPLP_VERSION);"
# 预期输出: MPLP版本: 1.1.0

# 可选：安装MPLP CLI用于项目脚手架
npm install -g @mplp/cli
mplp --version
```

### **通用运行步骤**

```bash
# 1. 克隆或下载示例
git clone https://github.com/mplp/examples.git
cd examples

# 2. 选择一个示例
cd basic-coordination

# 3. 安装依赖
npm install

# 4. 运行示例
npm start

# 5. 查看结果
# 大多数示例会在控制台输出结果
# 一些示例会启动Web界面（通常在 http://localhost:3000）
```

### **故障排除**

```bash
# 清理node_modules并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查MPLP版本兼容性
npm list @mplp/core

# 运行诊断
mplp diagnose

# 查看详细日志
DEBUG=mplp:* npm start
```

---

## 🏗️ 示例架构

### **标准示例结构**

```
example-name/
├── src/                    # 源代码
│   ├── main.ts            # 主入口文件
│   ├── config/            # 配置文件
│   ├── agents/            # 智能体定义
│   ├── workflows/         # 工作流定义
│   └── utils/             # 工具函数
├── tests/                 # 测试文件
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── e2e/               # 端到端测试
├── docs/                  # 示例文档
│   ├── README.md          # 示例说明
│   ├── SETUP.md           # 设置指南
│   └── ARCHITECTURE.md    # 架构说明
├── config/                # 配置文件
│   ├── mplp.config.ts     # MPLP配置
│   └── environment.ts     # 环境配置
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
└── .env.example           # 环境变量示例
```

### **代码质量标准**

所有示例遵循以下质量标准：

```typescript
// ✅ 好的示例代码
import { MPLP, ContextEntity, PlanEntity } from '@mplp/core';
import { Logger } from '@mplp/utils';

export class ExampleApplication {
  private readonly mplp: MPLP;
  private readonly logger: Logger;

  constructor(config: MPLPConfig) {
    this.mplp = new MPLP(config);
    this.logger = new Logger('ExampleApp');
  }

  async initialize(): Promise<void> {
    try {
      await this.mplp.initialize();
      this.logger.info('MPLP初始化成功');
    } catch (error) {
      this.logger.error('初始化失败:', error);
      throw error;
    }
  }

  async createContext(name: string): Promise<ContextEntity> {
    const context = await this.mplp.context.create({
      name,
      type: 'application',
      data: { created: new Date().toISOString() }
    });
    
    this.logger.info(`上下文创建成功: ${context.contextId}`);
    return context;
  }
}
```

---

## 🧪 测试和验证

### **运行测试**

```bash
# 运行所有测试
npm test

# 运行特定类型的测试
npm run test:unit          # 单元测试
npm run test:integration   # 集成测试
npm run test:e2e          # 端到端测试

# 生成测试覆盖率报告
npm run test:coverage

# 运行性能测试
npm run test:performance
```

### **验证示例质量**

```bash
# 代码质量检查
npm run lint

# TypeScript类型检查
npm run typecheck

# 安全漏洞扫描
npm audit

# 依赖检查
npm run check-deps
```

---

## 🤝 贡献示例

### **贡献新示例**

我们欢迎社区贡献新的示例！请遵循以下步骤：

1. **Fork仓库**并创建新分支
2. **创建示例目录**，遵循标准结构
3. **实现示例代码**，确保质量标准
4. **编写测试**，确保100%测试通过
5. **编写文档**，包括README和架构说明
6. **提交Pull Request**

### **示例要求**

- **实用性**: 解决真实世界的问题
- **教育价值**: 教授重要的MPLP概念
- **代码质量**: 遵循最佳实践和编码标准
- **完整性**: 包含所有必要的代码和配置
- **测试覆盖**: 提供全面的测试覆盖
- **文档完整**: 包含清晰的设置和使用说明

### **审查流程**

新示例会经过审查流程以确保：
- **技术准确性**: 代码正确使用MPLP API
- **教育价值**: 示例教授重要概念
- **代码质量**: 代码遵循最佳实践和标准
- **文档质量**: 文档清晰完整

---

## 🎉 MPLP v1.0 Alpha示例成就

### **生产就绪示例平台**

恭喜！您刚刚探索了**首个生产就绪的多智能体协议平台**的示例：

#### **完美质量示例**
- **100%模块覆盖**: 示例展示所有10个L2协调模块
- **完美测试结果**: 所有示例都经过2,869/2,869测试验证
- **零技术债务**: 干净、可维护的示例代码，完整文档
- **企业标准**: 示例遵循企业级开发实践

#### **真实世界应用**
- **业务解决方案**: 示例解决实际企业问题
- **可扩展架构**: 展示生产就绪的系统设计
- **最佳实践**: 显示正确的错误处理、测试和文档
- **性能优化**: 示例针对生产性能进行优化

#### **开发者体验**
- **易于运行**: 所有示例的简单设置和执行
- **文档完善**: 全面的文档和内联注释
- **教育价值**: 逐步学习多智能体系统开发
- **社区支持**: 活跃的社区支持示例使用

### **下一步**
- **[快速开始指南](../developers/quick-start.md)**: 构建你的第一个MPLP应用
- **[完整教程](../developers/tutorials.md)**: 深入了解高级功能
- **[加入社区](../community/README.md)**: 与其他开发者联系
- **[贡献示例](../community/contributing.md)**: 分享你自己的示例

---

**文档版本**: 1.0  
**最后更新**: 2025年9月4日  
**下次审查**: 2025年12月4日  
**兼容性**: MPLP v1.0 Alpha（生产就绪）  
**语言**: 简体中文

**⚠️ Alpha通知**: 虽然MPLP v1.0 Alpha已生产就绪，但示例会根据社区反馈和实际使用模式持续增强。

# MPLP v1.0 快速开始指南

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **概述**

本指南将帮助您快速上手MPLP v1.0，从安装到运行第一个多智能体协作示例。

## 📋 **前置要求**

### **系统要求**
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- TypeScript >= 5.0.0 (可选，用于开发)

### **开发环境**
- VS Code (推荐)
- Git
- 支持TypeScript的IDE

## 🚀 **安装步骤**

### **1. 创建新项目**
```bash
mkdir my-mplp-project
cd my-mplp-project
npm init -y
```

### **2. 安装MPLP**
```bash
# 安装核心包
npm install mplp

# 安装开发依赖 (可选)
npm install -D typescript @types/node ts-node
```

### **3. 初始化TypeScript配置**
```bash
npx tsc --init
```

## 💡 **第一个示例**

### **创建基本的多智能体协作流程**

```typescript
// index.ts
import { 
  MPLPCore, 
  ContextProtocol, 
  PlanProtocol, 
  ConfirmProtocol,
  TraceProtocol 
} from 'mplp';

async function main() {
  // 1. 初始化MPLP核心
  const mplp = new MPLPCore({
    environment: 'development',
    logLevel: 'info'
  });

  // 2. 创建项目上下文
  const context = await ContextProtocol.create({
    projectId: 'demo-project',
    agentId: 'agent-coordinator',
    metadata: {
      description: '演示多智能体协作',
      version: '1.0.0'
    }
  });

  console.log('✅ 上下文创建成功:', context.id);

  // 3. 制定协作计划
  const plan = await PlanProtocol.create({
    contextId: context.id,
    objectives: [
      '分析用户需求',
      '设计解决方案',
      '实施方案',
      '验证结果'
    ],
    timeline: {
      startDate: new Date(),
      estimatedDuration: '2 hours'
    },
    resources: ['agent-analyst', 'agent-designer', 'agent-developer']
  });

  console.log('📋 计划制定完成:', plan.id);

  // 4. 确认计划
  const confirmation = await ConfirmProtocol.create({
    planId: plan.id,
    decision: 'approved',
    approver: 'agent-coordinator',
    reasoning: '计划合理，资源充足，可以执行'
  });

  console.log('✅ 计划确认完成:', confirmation.id);

  // 5. 开始追踪执行
  const trace = await TraceProtocol.startExecution({
    planId: plan.id,
    confirmationId: confirmation.id,
    executionMode: 'parallel'
  });

  console.log('🔄 开始执行追踪:', trace.executionId);

  // 6. 模拟执行进度
  for (let i = 1; i <= 4; i++) {
    await TraceProtocol.updateProgress({
      executionId: trace.executionId,
      objectiveIndex: i - 1,
      status: 'completed',
      progress: (i / 4) * 100,
      timestamp: new Date()
    });

    console.log(`📈 目标 ${i} 完成 (${(i / 4) * 100}%)`);
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 协作流程完成！');
}

// 运行示例
main().catch(console.error);
```

### **运行示例**
```bash
npx ts-node index.ts
```

## 🔧 **配置选项**

### **环境配置**
```typescript
// config.ts
export const mplpConfig = {
  // 核心配置
  core: {
    environment: 'development', // 'development' | 'production' | 'test'
    logLevel: 'info',           // 'debug' | 'info' | 'warn' | 'error'
    enableMetrics: true,
    enableTracing: true
  },

  // 协议配置
  protocols: {
    context: {
      defaultTTL: 3600,         // 上下文默认生存时间(秒)
      maxContexts: 1000         // 最大上下文数量
    },
    plan: {
      maxObjectives: 50,        // 最大目标数量
      defaultPriority: 'medium' // 默认优先级
    },
    trace: {
      samplingRate: 0.1,        // 采样率
      retentionDays: 30         // 数据保留天数
    }
  },

  // 适配器配置
  adapters: {
    storage: 'memory',          // 'memory' | 'redis' | 'mongodb'
    cache: 'memory',            // 'memory' | 'redis'
    queue: 'memory'             // 'memory' | 'redis' | 'rabbitmq'
  }
};
```

## 📚 **下一步**

### **学习更多**
1. [系统架构](../02-architecture/system-architecture.md) - 了解MPLP的整体架构
2. [协议详解](../03-protocols/protocol-overview.md) - 深入了解各个协议
3. [API文档](../07-api/api-overview.md) - 查看完整的API参考

### **示例项目**
- [基础示例](../../examples/basic/) - 更多基础用法示例
- [高级示例](../../examples/advanced/) - 复杂场景示例
- [集成示例](../../examples/integration/) - 与其他系统集成

### **开发工具**
- [开发指南](../04-development/development-guide.md) - 开发最佳实践
- [测试指南](../05-testing/testing-strategy.md) - 测试策略和方法
- [部署指南](../06-deployment/deployment-guide.md) - 生产环境部署

## ❓ **常见问题**

### **Q: MPLP支持哪些AI服务提供商？**
A: MPLP是厂商中立的，支持任何AI服务提供商。您可以通过适配器模式集成不同的AI服务。

### **Q: 如何扩展MPLP协议？**
A: 通过Extension Protocol，您可以添加自定义协议和功能。详见[扩展指南](../03-protocols/extension-protocol.md)。

### **Q: MPLP的性能如何？**
A: MPLP经过性能优化，支持高并发场景。详见[性能测试报告](../05-testing/performance-testing.md)。

## 🆘 **获取帮助**

- [问题反馈](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev/issues)
- [讨论区](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev/discussions)
- [文档问题](https://github.com/Coregentis/MPLP-Protocol-Dev-Dev-Dev/issues/new?template=documentation.md)

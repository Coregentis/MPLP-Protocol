# MPLP Workflow Automation Example

这个示例展示了如何使用MPLP SDK构建一个完整的工作流自动化系统，包括多个智能体协作处理复杂的业务流程。

## 🎯 示例概述

### **业务场景**
一个企业级的客户支持工作流自动化系统，包含：
- 客户请求分类和路由
- 自动回复和问题解决
- 人工客服升级机制
- 工作流监控和分析

### **涉及的智能体**
1. **分类智能体** (ClassificationAgent) - 分析和分类客户请求
2. **回复智能体** (ResponseAgent) - 生成自动回复
3. **升级智能体** (EscalationAgent) - 处理复杂问题升级
4. **监控智能体** (MonitoringAgent) - 监控工作流性能

## 🏗️ 架构设计

```
客户请求 → 分类智能体 → 回复智能体 → 客户
                ↓
            升级智能体 → 人工客服
                ↓
            监控智能体 → 分析报告
```

## 📦 项目结构

```
workflow-automation/
├── src/
│   ├── agents/                 # 智能体实现
│   │   ├── ClassificationAgent.ts
│   │   ├── ResponseAgent.ts
│   │   ├── EscalationAgent.ts
│   │   └── MonitoringAgent.ts
│   ├── workflows/              # 工作流定义
│   │   ├── CustomerSupportWorkflow.ts
│   │   └── WorkflowOrchestrator.ts
│   ├── services/               # 业务服务
│   │   ├── TicketService.ts
│   │   ├── KnowledgeBaseService.ts
│   │   └── NotificationService.ts
│   ├── config/                 # 配置文件
│   │   ├── AppConfig.ts
│   │   └── WorkflowConfig.ts
│   ├── types/                  # 类型定义
│   │   ├── Ticket.ts
│   │   ├── Agent.ts
│   │   └── Workflow.ts
│   └── index.ts                # 主入口
├── tests/                      # 测试文件
├── data/                       # 示例数据
├── docs/                       # 文档
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 快速开始

### **1. 安装依赖**
```bash
cd workflow-automation
npm install
```

### **2. 配置环境**
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置
nano .env
```

### **3. 运行示例**
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start

# 运行测试
npm test
```

## 🔧 核心功能

### **1. 智能分类**
```typescript
// 客户请求自动分类
const classification = await classificationAgent.classify({
  content: "我的订单还没有收到",
  metadata: {
    customerId: "12345",
    channel: "email"
  }
});

// 分类结果
console.log(classification);
// {
//   category: "order_inquiry",
//   priority: "medium",
//   confidence: 0.95,
//   suggestedActions: ["check_order_status", "provide_tracking"]
// }
```

### **2. 自动回复**
```typescript
// 基于分类结果生成回复
const response = await responseAgent.generateResponse({
  classification,
  customerHistory: await ticketService.getCustomerHistory(customerId),
  knowledgeBase: await knowledgeBaseService.search(classification.category)
});

console.log(response.message);
// "您好！我查看了您的订单状态，您的订单正在配送中，预计明天送达。"
```

### **3. 工作流编排**
```typescript
// 完整的客户支持工作流
const workflow = new CustomerSupportWorkflow({
  agents: {
    classification: classificationAgent,
    response: responseAgent,
    escalation: escalationAgent,
    monitoring: monitoringAgent
  }
});

// 处理客户请求
const result = await workflow.processTicket({
  ticketId: "TICKET-001",
  content: "产品有质量问题，需要退款",
  customer: {
    id: "CUST-12345",
    tier: "premium"
  }
});
```

## 📊 监控和分析

### **实时监控**
```typescript
// 启动监控
const monitor = new WorkflowMonitor({
  metrics: ['throughput', 'latency', 'success_rate'],
  alerts: {
    highLatency: { threshold: 5000, action: 'notify' },
    lowSuccessRate: { threshold: 0.9, action: 'escalate' }
  }
});

await monitor.start();
```

### **性能指标**
- **吞吐量**: 每分钟处理的请求数
- **延迟**: 平均响应时间
- **成功率**: 自动解决的请求比例
- **升级率**: 需要人工干预的请求比例

## 🎓 学习要点

### **1. 多智能体协作**
- 智能体间的消息传递和状态同步
- 工作流的并行和串行执行
- 错误处理和恢复机制

### **2. 业务逻辑封装**
- 领域驱动设计 (DDD) 的应用
- 服务层的抽象和实现
- 配置管理和环境适配

### **3. 性能优化**
- 异步处理和并发控制
- 缓存策略和数据预加载
- 资源池管理和连接复用

## 🔗 相关资源

- [MPLP SDK文档](../../README.md)
- [工作流设计指南](../../docs/guides/workflow-design.md)
- [智能体开发教程](../../docs/tutorials/agent-development.md)
- [性能优化最佳实践](../../docs/guides/performance-optimization.md)

## 📝 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

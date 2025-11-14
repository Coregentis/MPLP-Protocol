# MPLP 营销自动化示例

## 🎯 **30分钟快速体验**

这个示例展示了如何使用MPLP SDK v1.1.0构建一个完整的营销自动化系统。**预计完成时间：30分钟**

### **业务场景**
一个智能营销自动化系统，包含：
- 内容创建和优化
- 多平台发布管理
- 用户互动分析
- 营销效果监控

### **核心智能体**
1. **内容智能体** (ContentAgent) - 创建和优化营销内容
2. **发布智能体** (PublishAgent) - 管理多平台发布
3. **分析智能体** (AnalyticsAgent) - 分析用户互动数据
4. **优化智能体** (OptimizationAgent) - 优化营销策略

### **技术栈**
- **MPLP SDK**: v1.1.0
- **Node.js**: 18+
- **TypeScript**: 5.0+
- **平台适配器**: Twitter, LinkedIn, GitHub

## 🏗️ **架构设计**

```
营销内容 → 内容智能体 → 发布智能体 → 多平台发布
                ↓
            分析智能体 → 优化智能体 → 策略优化
                ↓
            营销效果监控 → 自动化报告
```

## ⏱️ **30分钟快速开始**

### **第0步: 安装MPLP（1分钟）** ⚡

在运行此示例之前，先安装MPLP：

```bash
# 安装MPLP核心包（必需）
npm install mplp@beta

# 验证安装
node -e "const mplp = require('mplp'); console.log('MPLP版本:', mplp.MPLP_VERSION);"
# 预期输出: MPLP版本: 1.1.0
```

### **第1步: 环境准备（5分钟）**
```bash
# 克隆项目
git clone https://github.com/Coregentis/MPLP-Protocol.git
cd MPLP-Protocol/examples/marketing-automation

# 安装依赖（MPLP将自动安装）
npm install

# 验证安装
npm run verify
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

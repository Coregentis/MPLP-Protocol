# MPLP AI Coordination Example

这个示例展示了如何使用MPLP SDK构建一个AI智能体协调系统，实现多个AI智能体之间的智能协作和决策。

## 🎯 示例概述

### **业务场景**
一个智能内容创作平台，多个AI智能体协作完成复杂的内容创作任务：
- 内容策划和主题生成
- 多语言内容创作
- 内容审核和优化
- 发布渠道协调

### **涉及的AI智能体**
1. **策划智能体** (PlannerAgent) - 内容策划和主题生成
2. **创作智能体** (CreatorAgent) - 内容创作和编写
3. **审核智能体** (ReviewerAgent) - 内容质量审核
4. **发布智能体** (PublisherAgent) - 多渠道内容发布
5. **协调智能体** (CoordinatorAgent) - 整体流程协调

## 🧠 AI协调架构

```
用户需求 → 协调智能体 → 策划智能体 → 创作智能体
                ↓              ↓           ↓
            决策中心 ←    审核智能体 ←  发布智能体
                ↓
            结果反馈 → 用户
```

## 📦 项目结构

```
ai-coordination/
├── src/
│   ├── agents/                 # AI智能体实现
│   │   ├── PlannerAgent.ts
│   │   ├── CreatorAgent.ts
│   │   ├── ReviewerAgent.ts
│   │   ├── PublisherAgent.ts
│   │   └── CoordinatorAgent.ts
│   ├── coordination/           # 协调机制
│   │   ├── DecisionEngine.ts
│   │   ├── ConsensusManager.ts
│   │   └── ConflictResolver.ts
│   ├── ai/                     # AI集成
│   │   ├── OpenAIIntegration.ts
│   │   ├── ClaudeIntegration.ts
│   │   └── AIProviderManager.ts
│   ├── memory/                 # 共享记忆
│   │   ├── SharedMemory.ts
│   │   ├── ContextManager.ts
│   │   └── KnowledgeGraph.ts
│   ├── communication/          # 智能体通信
│   │   ├── MessageBus.ts
│   │   ├── ProtocolHandler.ts
│   │   └── EventDispatcher.ts
│   └── index.ts
├── config/                     # AI配置
│   ├── ai-models.json
│   ├── coordination-rules.json
│   └── workflow-templates.json
├── tests/
├── examples/
└── docs/
```

## 🚀 快速开始

### **1. 环境配置**
```bash
# 安装依赖
npm install

# 配置AI服务密钥
cp .env.example .env
# 编辑 .env 文件，添加：
# OPENAI_API_KEY=your_openai_key
# CLAUDE_API_KEY=your_claude_key
```

### **2. 运行示例**
```bash
# 启动AI协调系统
npm run start:coordination

# 运行特定场景
npm run scenario:content-creation
npm run scenario:multi-language
npm run scenario:quality-review
```

## 🤖 核心功能

### **1. 智能协调**
```typescript
// 创建协调系统
const coordinator = new CoordinatorAgent({
  decisionEngine: new DecisionEngine({
    strategy: 'consensus',
    timeout: 30000,
    minAgreement: 0.8
  }),
  agents: [plannerAgent, creatorAgent, reviewerAgent, publisherAgent]
});

// 处理复杂任务
const result = await coordinator.processTask({
  type: 'content_creation',
  requirements: {
    topic: '人工智能的未来发展',
    length: 2000,
    style: 'professional',
    languages: ['zh-CN', 'en-US'],
    channels: ['blog', 'social_media']
  }
});
```

### **2. AI决策引擎**
```typescript
// 多智能体决策
const decision = await decisionEngine.makeDecision({
  question: '应该采用哪种内容风格？',
  options: ['formal', 'casual', 'technical'],
  participants: [plannerAgent, creatorAgent, reviewerAgent],
  criteria: {
    audience_fit: 0.4,
    engagement: 0.3,
    brand_consistency: 0.3
  }
});

console.log(decision);
// {
//   choice: 'technical',
//   confidence: 0.85,
//   reasoning: '基于目标受众和内容主题，技术风格最适合',
//   votes: { formal: 1, casual: 0, technical: 2 }
// }
```

### **3. 共享记忆系统**
```typescript
// 智能体间共享知识
const sharedMemory = new SharedMemory({
  persistence: true,
  syncInterval: 1000,
  conflictResolution: 'latest_wins'
});

// 存储和检索知识
await sharedMemory.store('content_guidelines', {
  tone: 'professional',
  keywords: ['AI', 'technology', 'innovation'],
  avoid: ['jargon', 'overly_technical']
});

const guidelines = await sharedMemory.retrieve('content_guidelines');
```

### **4. 智能冲突解决**
```typescript
// 处理智能体间的分歧
const conflictResolver = new ConflictResolver({
  strategies: ['voting', 'expertise_weighted', 'compromise'],
  escalation: {
    threshold: 3,
    handler: 'human_intervention'
  }
});

// 解决创作分歧
const resolution = await conflictResolver.resolve({
  conflict: 'content_direction',
  positions: [
    { agent: 'planner', position: 'focus_on_benefits', confidence: 0.8 },
    { agent: 'creator', position: 'focus_on_challenges', confidence: 0.7 },
    { agent: 'reviewer', position: 'balanced_approach', confidence: 0.9 }
  ]
});
```

## 🧪 AI集成示例

### **多模型协作**
```typescript
// 不同AI模型的专长分工
const aiProviders = {
  planning: new OpenAIIntegration({ model: 'gpt-4', temperature: 0.7 }),
  creation: new ClaudeIntegration({ model: 'claude-3', creativity: 0.8 }),
  review: new OpenAIIntegration({ model: 'gpt-4', temperature: 0.2 })
};

// 智能体使用不同AI模型
const creatorAgent = new CreatorAgent({
  aiProvider: aiProviders.creation,
  specialization: 'creative_writing',
  capabilities: ['storytelling', 'technical_writing', 'copywriting']
});
```

### **动态模型选择**
```typescript
// 根据任务类型动态选择最适合的AI模型
const modelSelector = new AIModelSelector({
  models: {
    'gpt-4': { strengths: ['reasoning', 'analysis'], cost: 'high' },
    'claude-3': { strengths: ['creativity', 'writing'], cost: 'medium' },
    'gpt-3.5': { strengths: ['speed', 'general'], cost: 'low' }
  },
  selectionCriteria: ['task_type', 'quality_requirement', 'budget']
});

const selectedModel = await modelSelector.selectBestModel({
  taskType: 'creative_writing',
  qualityRequirement: 'high',
  budget: 'medium'
});
```

## 📊 协调性能监控

### **智能体协作指标**
```typescript
const coordinationMetrics = {
  consensus_rate: 0.92,        // 达成共识的比例
  decision_time: 2.3,          // 平均决策时间(秒)
  conflict_resolution: 0.88,   // 冲突解决成功率
  task_completion: 0.95,       // 任务完成率
  quality_score: 4.2           // 输出质量评分(1-5)
};
```

### **AI使用效率**
```typescript
const aiEfficiencyMetrics = {
  token_usage: {
    total: 125000,
    by_agent: {
      planner: 25000,
      creator: 60000,
      reviewer: 30000,
      publisher: 10000
    }
  },
  cost_optimization: 0.78,     // 成本优化率
  model_switching: 15,         // 模型切换次数
  cache_hit_rate: 0.65        // 缓存命中率
};
```

## 🎓 学习要点

### **1. AI智能体协调**
- 多AI模型的协作机制
- 决策共识算法
- 冲突检测和解决

### **2. 智能记忆管理**
- 共享知识库构建
- 上下文传递和维护
- 学习和适应机制

### **3. 性能优化**
- AI调用成本控制
- 响应时间优化
- 质量与效率平衡

## 🔗 相关资源

- [AI集成指南](../../docs/guides/ai-integration.md)
- [智能体协调模式](../../docs/patterns/agent-coordination.md)
- [性能监控最佳实践](../../docs/guides/performance-monitoring.md)

## 📝 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

# Dialog协议统一标准接口设计

## 🎯 **设计目标**

### **协议统一性原则**
重新设计Dialog协议的完整统一标准接口，确保：
- ✅ **只有一套标准接口**：不存在"基础接口"和"高级接口"的区分
- ✅ **参数化配置**：通过配置参数支持从简单到复杂的所有对话需求
- ✅ **厂商中立性**：接口抽象通用，不绑定特定AI模型或实现
- ✅ **向后兼容性**：现有功能通过新接口的基础配置实现

### **支持的应用场景**
通过统一接口和参数配置支持：
- **简单对话**：基础问答、对话记录（现有功能）
- **智能对话**：弹性轮次、动态策略（TracePilot需求）
- **分析对话**：批判性思维、深度分析（TracePilot需求）
- **知识对话**：实时搜索、验证更新（TracePilot需求）
- **多模态对话**：文本、语音、图像交互（TracePilot需求）

## 📋 **Dialog协议统一标准接口**

### **核心对话管理接口**

```typescript
/**
 * Dialog协议统一标准接口
 * 通过配置参数支持所有类型的对话需求
 */
export interface DialogProtocol {
  
  /**
   * 创建对话会话
   * 支持从简单到复杂的所有对话类型
   */
  createDialog(request: CreateDialogRequest): Promise<DialogResponse>;
  
  /**
   * 更新对话配置
   * 支持动态调整对话策略和能力
   */
  updateDialog(request: UpdateDialogRequest): Promise<DialogResponse>;
  
  /**
   * 对话交互
   * 统一的交互接口，根据配置提供不同能力
   */
  interactWithDialog(request: DialogInteractionRequest): Promise<DialogInteractionResponse>;
  
  /**
   * 查询对话状态
   * 获取对话进度、分析结果、知识状态等
   */
  getDialogStatus(dialogId: string, options?: StatusOptions): Promise<DialogStatusResponse>;
  
  /**
   * 删除对话
   * 标准的对话删除接口
   */
  deleteDialog(dialogId: string): Promise<DeleteResponse>;
  
  /**
   * 查询对话列表
   * 支持多种过滤和排序条件
   */
  queryDialogs(filter: DialogFilter): Promise<QueryDialogResponse>;
}
```

### **统一数据类型定义**

```typescript
/**
 * 对话创建请求
 * 通过capabilities配置控制对话能力
 */
export interface CreateDialogRequest {
  name: string;
  description?: string;
  participants: string[];
  
  // 对话能力配置 - 核心参数化设计
  capabilities: DialogCapabilities;
  
  // 对话策略配置
  strategy?: DialogStrategy;
  
  // 上下文配置
  context?: DialogContext;
  
  metadata?: Record<string, any>;
}

/**
 * 对话能力配置
 * 通过布尔值和配置对象控制不同能力的启用
 */
export interface DialogCapabilities {
  // 基础对话能力（默认启用）
  basic: {
    enabled: true;
    messageHistory: boolean;
    participantManagement: boolean;
  };
  
  // 智能对话控制（可选）
  intelligentControl?: {
    enabled: boolean;
    adaptiveRounds: boolean;
    dynamicStrategy: boolean;
    completenessEvaluation: boolean;
  };
  
  // 批判性思维分析（可选）
  criticalThinking?: {
    enabled: boolean;
    analysisDepth: 'surface' | 'moderate' | 'deep';
    questionGeneration: boolean;
    logicValidation: boolean;
  };
  
  // 知识搜索集成（可选）
  knowledgeSearch?: {
    enabled: boolean;
    realTimeSearch: boolean;
    knowledgeValidation: boolean;
    sourceVerification: boolean;
  };
  
  // 多模态交互（可选）
  multimodal?: {
    enabled: boolean;
    supportedModalities: ('text' | 'audio' | 'image' | 'video' | 'file')[];
    crossModalTranslation: boolean;
  };
}

/**
 * 对话策略配置
 */
export interface DialogStrategy {
  type: 'fixed' | 'adaptive' | 'goal_driven' | 'exploratory';
  
  // 轮次控制
  rounds?: {
    min?: number;
    max?: number;
    target?: number;
  };
  
  // 退出条件
  exitCriteria?: {
    completenessThreshold?: number;
    userSatisfactionThreshold?: number;
    timeLimit?: number;
  };
  
  // 适应规则
  adaptationRules?: AdaptationRule[];
}

/**
 * 对话交互请求
 * 统一的交互接口，根据能力配置提供不同功能
 */
export interface DialogInteractionRequest {
  dialogId: string;
  
  // 交互内容
  content: DialogContent;
  
  // 交互选项
  options?: {
    // 是否需要批判性思维分析
    applyCriticalThinking?: boolean;
    
    // 是否需要知识搜索
    performKnowledgeSearch?: boolean;
    
    // 分析深度
    analysisDepth?: 'surface' | 'moderate' | 'deep';
    
    // 响应格式
    responseFormat?: 'text' | 'structured' | 'multimodal';
  };
  
  metadata?: Record<string, any>;
}

/**
 * 对话内容定义
 * 支持多模态内容
 */
export interface DialogContent {
  // 文本内容
  text?: string;
  
  // 多模态内容（如果启用）
  multimodal?: {
    audio?: AudioData;
    image?: ImageData;
    video?: VideoData;
    file?: FileData;
  };
  
  // 内容类型
  type: 'message' | 'question' | 'command' | 'feedback';
  
  // 优先级
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}
```

### **响应类型定义**

```typescript
/**
 * 对话交互响应
 * 根据启用的能力返回相应的分析结果
 */
export interface DialogInteractionResponse {
  success: boolean;
  
  // 基础响应内容
  content: DialogContent;
  
  // 智能分析结果（如果启用）
  analysis?: {
    // 批判性思维分析
    criticalThinking?: CriticalAnalysisResult;
    
    // 知识搜索结果
    knowledgeSearch?: KnowledgeSearchResult;
    
    // 对话完成度评估
    completeness?: CompletenessEvaluation;
  };
  
  // 对话状态更新
  dialogState?: {
    currentRound: number;
    completenessScore: number;
    nextSuggestions: string[];
  };
  
  // 元数据
  metadata: {
    processingTime: number;
    capabilitiesUsed: string[];
    confidence: number;
  };
  
  error?: string;
}

/**
 * 批判性分析结果
 */
export interface CriticalAnalysisResult {
  assumptions: string[];
  logicalGaps: string[];
  alternatives: string[];
  deepQuestions: string[];
  confidence: number;
}

/**
 * 知识搜索结果
 */
export interface KnowledgeSearchResult {
  results: KnowledgeItem[];
  sources: string[];
  validation: {
    timeliness: number;
    accuracy: number;
    relevance: number;
  };
  recommendations: string[];
}

/**
 * 对话完成度评估
 */
export interface CompletenessEvaluation {
  overallScore: number; // 0-1
  dimensions: {
    informationGathering: number;
    goalClarity: number;
    stakeholderAlignment: number;
    riskAssessment: number;
  };
  recommendations: string[];
  shouldContinue: boolean;
}
```

## 🔧 **使用示例**

### **简单对话应用示例**

```typescript
// 简单应用只需要基础对话功能
const simpleDialogRequest: CreateDialogRequest = {
  name: "客服对话",
  participants: ["user", "support_agent"],
  capabilities: {
    basic: {
      enabled: true,
      messageHistory: true,
      participantManagement: true
    }
    // 其他高级能力不启用
  }
};

const dialog = await dialogProtocol.createDialog(simpleDialogRequest);
```

### **TracePilot智能对话示例**

```typescript
// TracePilot需要完整的智能对话能力
const intelligentDialogRequest: CreateDialogRequest = {
  name: "DDSC项目需求对话",
  participants: ["user", "product_owner_agent", "architect_agent"],
  capabilities: {
    basic: {
      enabled: true,
      messageHistory: true,
      participantManagement: true
    },
    intelligentControl: {
      enabled: true,
      adaptiveRounds: true,
      dynamicStrategy: true,
      completenessEvaluation: true
    },
    criticalThinking: {
      enabled: true,
      analysisDepth: 'deep',
      questionGeneration: true,
      logicValidation: true
    },
    knowledgeSearch: {
      enabled: true,
      realTimeSearch: true,
      knowledgeValidation: true,
      sourceVerification: true
    },
    multimodal: {
      enabled: true,
      supportedModalities: ['text', 'image', 'file'],
      crossModalTranslation: false
    }
  },
  strategy: {
    type: 'adaptive',
    rounds: { min: 3, max: 7, target: 5 },
    exitCriteria: {
      completenessThreshold: 0.85,
      userSatisfactionThreshold: 0.8
    }
  }
};

const intelligentDialog = await dialogProtocol.createDialog(intelligentDialogRequest);
```

## 🔗 **链式影响分析**

### **直接影响的组件**
1. **Dialog协议Schema** - 需要更新为统一接口的数据结构
2. **Dialog协议类型定义** - 需要重新定义统一的TypeScript类型
3. **DialogController** - 需要实现统一接口的API端点
4. **DialogService** - 需要实现统一接口的业务逻辑
5. **Dialog测试用例** - 需要更新为统一接口的测试

### **间接影响的协议**
1. **Context协议** - 需要支持Dialog的知识库集成
2. **Extension协议** - 需要支持Dialog的能力插件
3. **Trace协议** - 需要追踪Dialog的智能分析过程
4. **Core协议** - 需要协调Dialog与其他协议的交互

## 📝 **文档更新清单**

### **必须同步更新的文档**
- [ ] `schemas/dialog-protocol.json` - 更新为统一接口Schema
- [ ] `src/modules/dialog/types.ts` - 更新为统一接口类型定义
- [ ] `docs/protocols/dialog-protocol-specification.md` - 更新协议规范
- [ ] `docs/api/dialog-api-reference.md` - 更新API文档
- [ ] `tests/dialog/unified-interface.test.ts` - 新增统一接口测试

---

**设计版本**: v1.0.0  
**设计状态**: 设计完成  
**下一步**: Role协议统一标准接口设计  
**负责人**: MPLP协议完善团队  
**最后更新**: 2025年8月3日

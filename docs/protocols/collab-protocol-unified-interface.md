# Collab协议统一标准接口设计

## 🎯 **设计目标**

### **协议统一性原则**
重新设计Collab协议的完整统一标准接口，确保：
- ✅ **只有一套标准接口**：整合基础协作和高级决策为统一接口
- ✅ **参数化配置**：通过配置参数支持从简单协作到复杂决策议会的所有需求
- ✅ **厂商中立性**：接口抽象通用，不绑定特定决策算法或实现
- ✅ **向后兼容性**：现有协作功能通过新接口的基础配置实现

### **支持的应用场景**
通过统一接口和参数配置支持：
- **基础协作**：任务分配、状态同步（现有功能）
- **决策议会**：多Agent投票、共识达成（TracePilot需求）
- **冲突解决**：争议处理、仲裁机制（TracePilot需求）
- **智能协调**：动态负载均衡、资源优化（TracePilot需求）

## 📋 **Collab协议统一标准接口**

### **核心协作管理接口**

```typescript
/**
 * Collab协议统一标准接口
 * 整合协作管理和决策制定为一套完整接口
 */
export interface CollabProtocol {
  
  /**
   * 创建协作会话
   * 支持从简单协作到复杂决策议会的所有类型
   */
  createCollaboration(request: CreateCollaborationRequest): Promise<CollaborationResponse>;
  
  /**
   * 更新协作配置
   * 支持动态调整协作策略和决策机制
   */
  updateCollaboration(request: UpdateCollaborationRequest): Promise<CollaborationResponse>;
  
  /**
   * 参与协作
   * 统一的参与接口，支持任务执行、投票、讨论等
   */
  participateInCollaboration(request: ParticipationRequest): Promise<ParticipationResponse>;
  
  /**
   * 协作决策
   * 统一的决策接口，根据配置提供不同决策机制
   */
  makeCollaborativeDecision(request: DecisionRequest): Promise<DecisionResponse>;
  
  /**
   * 获取协作状态
   * 查询协作进度、决策结果、参与者状态等
   */
  getCollaborationStatus(collabId: string, options?: StatusOptions): Promise<CollaborationStatusResponse>;
  
  /**
   * 解决协作冲突
   * 统一的冲突解决接口
   */
  resolveConflict(request: ConflictResolutionRequest): Promise<ConflictResolutionResponse>;
  
  /**
   * 结束协作
   * 标准的协作结束接口
   */
  endCollaboration(collabId: string, options?: EndOptions): Promise<EndResponse>;
  
  /**
   * 查询协作列表
   * 支持多种过滤和排序条件
   */
  queryCollaborations(filter: CollaborationFilter): Promise<QueryCollaborationResponse>;
}
```

### **统一数据类型定义**

```typescript
/**
 * 协作创建请求
 * 通过type和mechanisms配置控制协作类型和决策机制
 */
export interface CreateCollaborationRequest {
  name: string;
  description?: string;
  participants: string[];
  
  // 协作类型 - 核心区分参数
  type: CollaborationType;
  
  // 协作机制配置
  mechanisms: CollaborationMechanisms;
  
  // 协作目标
  objectives: CollaborationObjective[];
  
  // 协作配置
  configuration?: CollaborationConfiguration;
  
  metadata?: Record<string, any>;
}

/**
 * 协作类型
 */
export type CollaborationType = 
  | 'task_coordination'    // 任务协调
  | 'decision_making'      // 决策制定
  | 'problem_solving'      // 问题解决
  | 'consensus_building'   // 共识构建
  | 'conflict_resolution'  // 冲突解决
  | 'resource_allocation'  // 资源分配
  | 'knowledge_sharing';   // 知识共享

/**
 * 协作机制配置
 * 根据协作类型提供不同的机制配置
 */
export interface CollaborationMechanisms {
  // 基础协作机制（所有类型都有）
  basic: {
    communication: 'synchronous' | 'asynchronous' | 'hybrid';
    coordination: 'centralized' | 'distributed' | 'hierarchical';
    monitoring: boolean;
  };
  
  // 决策机制（决策相关类型启用）
  decisionMaking?: {
    // 决策算法
    algorithm: 'majority_vote' | 'consensus' | 'weighted_vote' | 'pbft' | 'custom';
    
    // 投票配置
    voting: {
      anonymity: boolean;
      transparency: boolean;
      revisionAllowed: boolean;
      timeLimit?: number;
    };
    
    // 权重配置
    weighting?: {
      strategy: 'equal' | 'expertise_based' | 'role_based' | 'performance_based';
      weights?: Record<string, number>;
    };
    
    // 共识要求
    consensus: {
      threshold: number; // 0-1
      quorum: number;    // 最小参与者数量
      unanimityRequired?: boolean;
    };
  };
  
  // 冲突解决机制（冲突解决类型启用）
  conflictResolution?: {
    // 解决策略
    strategy: 'negotiation' | 'mediation' | 'arbitration' | 'escalation';
    
    // 仲裁配置
    arbitration?: {
      arbitratorSelection: 'random' | 'expertise' | 'neutral' | 'designated';
      bindingDecision: boolean;
      appealProcess: boolean;
    };
    
    // 升级机制
    escalation?: {
      levels: EscalationLevel[];
      triggers: EscalationTrigger[];
      timeouts: number[];
    };
  };
  
  // 资源分配机制（资源分配类型启用）
  resourceAllocation?: {
    algorithm: 'fair_share' | 'priority_based' | 'auction' | 'optimization';
    constraints: ResourceConstraint[];
    optimization: OptimizationCriteria[];
  };
}

/**
 * 协作配置
 */
export interface CollaborationConfiguration {
  // 时间配置
  timing: {
    startTime?: Date;
    deadline?: Date;
    timeZone?: string;
    workingHours?: TimeRange[];
  };
  
  // 参与者配置
  participants: {
    minParticipants: number;
    maxParticipants: number;
    requiredRoles?: string[];
    optionalRoles?: string[];
  };
  
  // 质量控制
  qualityControl: {
    reviewRequired: boolean;
    approvalThreshold: number;
    qualityMetrics: string[];
  };
  
  // 安全配置
  security: {
    accessControl: boolean;
    auditLogging: boolean;
    encryption: boolean;
  };
}

/**
 * 参与请求
 */
export interface ParticipationRequest {
  collabId: string;
  participantId: string;
  
  // 参与类型
  participationType: 'contribute' | 'vote' | 'review' | 'observe';
  
  // 参与内容
  content?: {
    // 任务贡献
    taskContribution?: TaskContribution;
    
    // 投票内容
    vote?: Vote;
    
    // 评审意见
    review?: Review;
    
    // 讨论发言
    discussion?: Discussion;
  };
  
  metadata?: Record<string, any>;
}

/**
 * 决策请求
 */
export interface DecisionRequest {
  collabId: string;
  initiatorId: string;
  
  // 决策主题
  subject: {
    title: string;
    description: string;
    options: DecisionOption[];
    context?: any;
  };
  
  // 决策配置
  decisionConfig?: {
    mechanism?: string;
    deadline?: Date;
    requiredParticipants?: string[];
    customRules?: any;
  };
  
  metadata?: Record<string, any>;
}

/**
 * 冲突解决请求
 */
export interface ConflictResolutionRequest {
  collabId: string;
  conflictId: string;
  
  // 冲突描述
  conflict: {
    type: 'resource' | 'priority' | 'approach' | 'timeline' | 'quality';
    parties: string[];
    description: string;
    evidence?: any[];
  };
  
  // 解决偏好
  resolutionPreference?: {
    strategy?: string;
    arbitrator?: string;
    timeline?: Date;
  };
  
  metadata?: Record<string, any>;
}
```

### **响应类型定义**

```typescript
/**
 * 协作响应
 */
export interface CollaborationResponse {
  success: boolean;
  
  data?: {
    collabId: string;
    name: string;
    type: CollaborationType;
    status: CollaborationStatus;
    participants: ParticipantInfo[];
    mechanisms: CollaborationMechanisms;
    createdAt: string;
    updatedAt: string;
  };
  
  error?: string;
}

/**
 * 协作状态响应
 */
export interface CollaborationStatusResponse {
  success: boolean;
  
  data?: {
    collabId: string;
    status: CollaborationStatus;
    progress: ProgressInfo;
    participants: ParticipantStatus[];
    
    // 决策状态（如果适用）
    decisionStatus?: {
      activeDecisions: DecisionInfo[];
      completedDecisions: DecisionResult[];
      pendingVotes: number;
    };
    
    // 冲突状态（如果适用）
    conflictStatus?: {
      activeConflicts: ConflictInfo[];
      resolvedConflicts: ConflictResolution[];
    };
    
    // 性能指标
    metrics: {
      efficiency: number;
      satisfaction: number;
      qualityScore: number;
    };
  };
  
  error?: string;
}

/**
 * 决策响应
 */
export interface DecisionResponse {
  success: boolean;
  
  data?: {
    decisionId: string;
    status: 'initiated' | 'voting' | 'completed' | 'failed';
    result?: DecisionResult;
    votingSummary?: VotingSummary;
    timeline: DecisionTimeline;
  };
  
  error?: string;
}

/**
 * 决策结果
 */
export interface DecisionResult {
  selectedOption: DecisionOption;
  confidence: number;
  consensus: number;
  rationale: string;
  dissenting?: DissentingView[];
}

/**
 * 冲突解决响应
 */
export interface ConflictResolutionResponse {
  success: boolean;
  
  data?: {
    resolutionId: string;
    status: 'initiated' | 'in_progress' | 'resolved' | 'escalated';
    resolution?: ConflictResolution;
    timeline: ResolutionTimeline;
  };
  
  error?: string;
}
```

## 🔧 **使用示例**

### **基础任务协作示例**

```typescript
// 简单任务协作，只需要基础协调功能
const taskCollabRequest: CreateCollaborationRequest = {
  name: "项目开发协作",
  participants: ["dev1", "dev2", "qa1"],
  type: "task_coordination",
  mechanisms: {
    basic: {
      communication: "asynchronous",
      coordination: "centralized",
      monitoring: true
    }
    // 不启用复杂决策机制
  },
  objectives: [
    { type: "task_completion", description: "完成功能开发", priority: "high" }
  ]
};

const taskCollab = await collabProtocol.createCollaboration(taskCollabRequest);
```

### **TracePilot决策议会示例**

```typescript
// TracePilot需要完整的决策议会能力
const decisionCollabRequest: CreateCollaborationRequest = {
  name: "架构决策议会",
  participants: ["product_owner", "architect", "tech_lead", "qa_lead"],
  type: "decision_making",
  mechanisms: {
    basic: {
      communication: "synchronous",
      coordination: "distributed",
      monitoring: true
    },
    decisionMaking: {
      algorithm: "weighted_vote",
      voting: {
        anonymity: false,
        transparency: true,
        revisionAllowed: true,
        timeLimit: 3600000 // 1小时
      },
      weighting: {
        strategy: "expertise_based",
        weights: {
          "architect": 0.4,
          "tech_lead": 0.3,
          "product_owner": 0.2,
          "qa_lead": 0.1
        }
      },
      consensus: {
        threshold: 0.75,
        quorum: 3,
        unanimityRequired: false
      }
    },
    conflictResolution: {
      strategy: "mediation",
      arbitration: {
        arbitratorSelection: "expertise",
        bindingDecision: true,
        appealProcess: false
      }
    }
  },
  objectives: [
    { type: "decision", description: "选择技术架构方案", priority: "critical" }
  ],
  configuration: {
    timing: { deadline: new Date(Date.now() + 86400000) }, // 24小时内
    participants: { minParticipants: 3, maxParticipants: 6 },
    qualityControl: { reviewRequired: true, approvalThreshold: 0.8, qualityMetrics: ["feasibility", "maintainability"] },
    security: { accessControl: true, auditLogging: true, encryption: true }
  }
};

const decisionCollab = await collabProtocol.createCollaboration(decisionCollabRequest);
```

## 🔗 **链式影响分析**

### **直接影响的组件**
1. **Collab协议Schema** - 需要更新为统一接口的数据结构
2. **Collab协议类型定义** - 需要重新定义统一的TypeScript类型
3. **CollabController** - 需要实现统一接口的API端点
4. **CollabService** - 需要实现统一接口的业务逻辑
5. **Collab测试用例** - 需要更新为统一接口的测试

### **间接影响的协议**
1. **Role协议** - 需要支持协作中的参与者管理
2. **Dialog协议** - 需要支持协作中的对话交互
3. **Confirm协议** - 需要支持协作决策的确认流程
4. **Trace协议** - 需要追踪协作过程和决策历史

## 📝 **文档更新清单**

### **必须同步更新的文档**
- [ ] `schemas/collab-protocol.json` - 更新为统一接口Schema
- [ ] `src/modules/collab/types.ts` - 更新为统一接口类型定义
- [ ] `docs/protocols/collab-protocol-specification.md` - 更新协议规范
- [ ] `docs/api/collab-api-reference.md` - 更新API文档
- [ ] `tests/collab/unified-interface.test.ts` - 新增统一接口测试

---

**设计版本**: v1.0.0  
**设计状态**: 设计完成  
**下一步**: Context协议统一标准接口设计  
**负责人**: MPLP协议完善团队  
**最后更新**: 2025年8月3日

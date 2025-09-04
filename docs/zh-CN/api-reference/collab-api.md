# Collab API 参考

**多智能体协作和协调 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Collab%20模块-blue.svg)](../modules/collab/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--collab.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-146%2F146%20通过-green.svg)](../modules/collab/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/collab-api.md)

---

## 🎯 概述

Collab API为多智能体系统提供全面的多智能体协作和协调功能。它支持协作决策、任务分配、冲突解决和大规模协作管理。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  CollabController,
  CollabManagementService,
  CreateCollabDto,
  UpdateCollabDto,
  CollabResponseDto
} from 'mplp/modules/collab';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const collabModule = mplp.getModule('collab');
```

## 🏗️ 核心接口

### **CollabResponseDto** (响应接口)

```typescript
interface CollabResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  collabId: string;               // 唯一协作标识符
  contextId: string;              // 关联的上下文ID
  name: string;                   // 协作名称
  status: CollabStatus;           // 协作状态
  type: CollabType;               // 协作类型
  
  // 参与者和角色
  participants: CollabParticipant[];
  coordinators: string[];         // 协调者智能体ID
  
  // 协作结构
  objectives: CollabObjective[];
  tasks: CollabTask[];
  decisions: CollabDecision[];
  
  // 协调机制
  coordinationPatterns: CoordinationPattern[];
  conflictResolution: ConflictResolutionConfig;
  
  // 性能和指标
  performanceMetrics: CollabMetrics;
  
  // 元数据
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateCollabDto** (创建请求接口)

```typescript
interface CreateCollabDto {
  contextId: string;              // 必需：关联的上下文ID
  name: string;                   // 必需：协作名称
  type: CollabType;               // 必需：协作类型
  
  // 参与者
  participants: Array<{
    agentId: string;
    role: ParticipantRole;
    capabilities: string[];
    weight?: number;              // 决策权重
  }>;
  
  // 目标
  objectives: Array<{
    id: string;
    description: string;
    priority: Priority;
    metrics?: ObjectiveMetric[];
  }>;
  
  // 配置
  configuration?: CollabConfiguration;
  
  // 元数据
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **CollabStatus** (协作状态)

```typescript
enum CollabStatus {
  INITIALIZING = 'initializing',  // 初始化协作
  ACTIVE = 'active',              // 活跃协作
  PAUSED = 'paused',              // 暂停协作
  COMPLETED = 'completed',        // 已完成协作
  FAILED = 'failed',              // 失败协作
  CANCELLED = 'cancelled'         // 已取消协作
}
```

### **CollabType** (协作类型)

```typescript
enum CollabType {
  TASK_ORIENTED = 'task_oriented',        // 任务导向协作
  DECISION_MAKING = 'decision_making',    // 决策制定协作
  PROBLEM_SOLVING = 'problem_solving',    // 问题解决协作
  RESOURCE_SHARING = 'resource_sharing',  // 资源共享
  KNOWLEDGE_EXCHANGE = 'knowledge_exchange', // 知识交换
  COMPETITIVE = 'competitive'             // 竞争性协作
}
```

### **CoordinationPattern** (协调模式)

```typescript
enum CoordinationPattern {
  CENTRALIZED = 'centralized',    // 集中式协调
  DECENTRALIZED = 'decentralized', // 分散式协调
  HIERARCHICAL = 'hierarchical',  // 分层协调
  PEER_TO_PEER = 'peer_to_peer',  // 点对点协调
  MARKET_BASED = 'market_based',  // 基于市场的协调
  CONSENSUS = 'consensus'         // 基于共识的协调
}
```

## 🎮 控制器API

### **CollabController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建协作**
```typescript
async createCollab(dto: CreateCollabDto): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "多智能体数据分析协作",
  "type": "task_oriented",
  "participants": [
    {
      "agentId": "data-analyst-001",
      "role": "coordinator",
      "capabilities": ["data_analysis", "visualization", "reporting"],
      "weight": 0.4
    },
    {
      "agentId": "ml-specialist-002",
      "role": "specialist",
      "capabilities": ["machine_learning", "model_training"],
      "weight": 0.3
    },
    {
      "agentId": "domain-expert-003",
      "role": "advisor",
      "capabilities": ["domain_knowledge", "validation"],
      "weight": 0.3
    }
  ],
  "objectives": [
    {
      "id": "obj-001",
      "description": "分析客户行为模式",
      "priority": "high",
      "metrics": [
        {
          "name": "accuracy",
          "target": 0.95,
          "weight": 0.6
        },
        {
          "name": "completion_time",
          "target": 3600,
          "weight": 0.4
        }
      ]
    }
  ],
  "configuration": {
    "coordinationPattern": "hierarchical",
    "decisionMaking": "weighted_voting",
    "conflictResolution": "escalation"
  }
}
```

#### **加入协作**
```typescript
async joinCollab(collabId: string, participantInfo: JoinCollabDto): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs/{collabId}/join`

#### **离开协作**
```typescript
async leaveCollab(collabId: string, agentId: string): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs/{collabId}/leave`

#### **做出决策**
```typescript
async makeDecision(collabId: string, decision: CollabDecisionDto): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs/{collabId}/decisions`

#### **分配任务**
```typescript
async allocateTask(collabId: string, task: TaskAllocationDto): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs/{collabId}/tasks/allocate`

#### **解决冲突**
```typescript
async resolveConflict(collabId: string, conflict: ConflictResolutionDto): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs/{collabId}/conflicts/resolve`

#### **获取协作**
```typescript
async getCollab(collabId: string): Promise<CollabResponseDto>
```

**HTTP端点**: `GET /api/collabs/{collabId}`

#### **更新协作**
```typescript
async updateCollab(collabId: string, dto: UpdateCollabDto): Promise<CollabOperationResult>
```

**HTTP端点**: `PUT /api/collabs/{collabId}`

#### **结束协作**
```typescript
async endCollab(collabId: string, reason?: string): Promise<CollabOperationResult>
```

**HTTP端点**: `POST /api/collabs/{collabId}/end`

## 🔧 服务层API

### **CollabManagementService**

核心业务逻辑服务，提供协作管理功能。

#### **主要方法**

```typescript
class CollabManagementService {
  // 基础CRUD操作
  async createCollab(request: CreateCollabRequest): Promise<CollabEntity>;
  async getCollabById(collabId: string): Promise<CollabEntity | null>;
  async updateCollab(collabId: string, request: UpdateCollabRequest): Promise<CollabEntity>;
  async deleteCollab(collabId: string): Promise<boolean>;
  
  // 参与者管理
  async addParticipant(collabId: string, participant: CollabParticipant): Promise<CollabEntity>;
  async removeParticipant(collabId: string, agentId: string): Promise<CollabEntity>;
  async updateParticipantRole(collabId: string, agentId: string, role: ParticipantRole): Promise<CollabEntity>;
  
  // 任务管理
  async allocateTask(collabId: string, task: CollabTask): Promise<TaskAllocationResult>;
  async completeTask(collabId: string, taskId: string, result: TaskResult): Promise<CollabEntity>;
  async reassignTask(collabId: string, taskId: string, newAssignee: string): Promise<CollabEntity>;
  
  // 决策制定
  async proposeDecision(collabId: string, proposal: DecisionProposal): Promise<CollabDecision>;
  async voteOnDecision(collabId: string, decisionId: string, vote: DecisionVote): Promise<CollabDecision>;
  async finalizeDecision(collabId: string, decisionId: string): Promise<CollabDecision>;
  
  // 冲突解决
  async detectConflicts(collabId: string): Promise<ConflictDetectionResult>;
  async resolveConflict(collabId: string, conflictId: string, resolution: ConflictResolution): Promise<ConflictResolutionResult>;
  
  // 分析和监控
  async getCollabMetrics(collabId: string): Promise<CollabMetrics>;
  async getCollabHealth(collabId: string): Promise<CollabHealth>;
}
```

## 📊 数据结构

### **CollabParticipant** (协作参与者)

```typescript
interface CollabParticipant {
  agentId: string;                // 智能体标识符
  role: ParticipantRole;          // 参与者角色
  capabilities: string[];         // 智能体能力
  status: ParticipantStatus;      // 参与状态
  weight: number;                 // 决策权重（0-1）
  joinedAt: Date;                 // 加入时间戳
  contribution: ContributionMetrics; // 贡献指标
}
```

### **CollabTask** (协作任务)

```typescript
interface CollabTask {
  taskId: string;                 // 任务标识符
  name: string;                   // 任务名称
  description: string;            // 任务描述
  assignedTo: string[];           // 分配的智能体ID
  status: TaskStatus;             // 任务状态
  priority: Priority;             // 任务优先级
  dependencies: string[];         // 任务依赖
  deadline?: Date;                // 任务截止日期
  resources: TaskResource[];      // 所需资源
  progress: TaskProgress;         // 任务进度
}
```

### **CollabDecision** (协作决策)

```typescript
interface CollabDecision {
  decisionId: string;             // 决策标识符
  title: string;                  // 决策标题
  description: string;            // 决策描述
  proposedBy: string;             // 提议者智能体ID
  status: DecisionStatus;         // 决策状态
  options: DecisionOption[];      // 决策选项
  votes: DecisionVote[];          // 投票记录
  deadline?: Date;                // 投票截止日期
  result?: DecisionResult;        // 最终决策结果
}
```

### **ConflictResolutionConfig** (冲突解决配置)

```typescript
interface ConflictResolutionConfig {
  strategy: ConflictResolutionStrategy;
  escalationLevels: Array<{
    level: number;
    threshold: number;            // 冲突严重程度阈值
    resolvers: string[];          // 解决者智能体ID
    timeout: number;              // 解决超时时间
  }>;
  votingMechanism?: VotingMechanism;
  mediationRules?: MediationRule[];
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/collab/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/collab/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/collab/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/collab/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文

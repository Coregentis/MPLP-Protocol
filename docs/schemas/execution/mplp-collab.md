# MPLP Collab Protocol Schema

## 📋 **概述**

Collab协议Schema定义了MPLP系统中多Agent协作调度和协调的标准数据结构，实现智能体间的高效协作和决策机制。经过最新企业级功能增强，现已包含完整的协作协调监控、团队协作分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-collab.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 67.4%
**功能完整性**: ✅ 100% (基础功能 + 协作监控 + 企业级功能)
**企业级特性**: ✅ 协作协调监控、团队协作分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **协作调度**: 管理多个智能体的协作任务分配和调度
- **决策协调**: 实现分布式决策和共识机制
- **冲突解决**: 处理智能体间的资源冲突和优先级冲突
- **团队管理**: 动态组建和管理智能体团队

### **协作监控功能**
- **协作协调监控**: 实时监控协作协调延迟、团队协作效率、协作质量
- **团队协作分析**: 详细的参与者满意度分析和协作管理效率评估
- **协作状态监控**: 监控协作的协调状态、参与者管理、团队协作质量
- **协作管理审计**: 监控协作管理过程的合规性和可靠性
- **团队协作保证**: 监控协作系统的团队协作和协调管理质量

### **企业级功能**
- **协作管理审计**: 完整的协作管理和团队记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **性能监控**: 协作协调系统的详细监控和健康检查，包含关键协作指标
- **版本控制**: 协作配置的版本历史、变更追踪和快照管理
- **搜索索引**: 协作数据的全文搜索、语义搜索和自动索引
- **事件集成**: 协作事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和协作事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension ← [Collab] → Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `collab_id` | string | ✅ | UUID v4格式的协作标识符 |
| `context_id` | string | ✅ | 关联的上下文ID |
| `collaboration_type` | string | ✅ | 协作类型枚举值 |
| `status` | string | ✅ | 协作状态枚举值 |
| `participants` | array | ✅ | 参与者列表 |

### **协作类型枚举**
```json
{
  "collaboration_type": {
    "enum": [
      "task_distribution",    // 任务分发协作
      "decision_making",      // 决策制定协作
      "resource_sharing",     // 资源共享协作
      "knowledge_exchange",   // 知识交换协作
      "problem_solving",      // 问题解决协作
      "consensus_building"    // 共识构建协作
    ]
  }
}
```

### **决策算法枚举**
```json
{
  "decision_algorithm": {
    "enum": [
      "majority_vote",    // 多数投票
      "consensus",        // 共识算法
      "weighted_vote",    // 加权投票
      "pbft",            // 拜占庭容错
      "custom"           // 自定义算法
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "collab_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "550e8400-e29b-41d4-a716-446655440001",
  "collaboration_type": "decision_making",
  "status": "active",
  "title": "项目架构决策协作",
  "description": "多个架构师协作制定系统架构决策",
  "created_by": "coordinator-123",
  "created_at": "2025-08-13T10:30:00.000Z",
  "updated_at": "2025-08-13T10:35:00.000Z",
  "participants": [
    {
      "agent_id": "agent-001",
      "role": "lead_architect",
      "weight": 0.4,
      "status": "active",
      "joined_at": "2025-08-13T10:30:00.000Z"
    },
    {
      "agent_id": "agent-002", 
      "role": "senior_developer",
      "weight": 0.3,
      "status": "active",
      "joined_at": "2025-08-13T10:31:00.000Z"
    }
  ],
  "decision_making": {
    "algorithm": "weighted_vote",
    "threshold": 0.7,
    "timeout_ms": 300000,
    "voting_mechanism": {
      "anonymity": false,
      "transparency": true,
      "revision_allowed": true,
      "time_limit_ms": 180000
    }
  },
  "task_distribution": {
    "distribution_strategy": "capability_based",
    "load_balancing": true,
    "priority_handling": "weighted",
    "max_concurrent_tasks": 5
  },
  "communication": {
    "channels": ["direct_message", "broadcast", "group_chat"],
    "protocols": ["http", "websocket", "grpc"],
    "message_format": "json",
    "encryption_enabled": true
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface CollabData {
  protocolVersion: string;
  timestamp: string;
  collabId: string;
  contextId: string;
  collaborationType: CollaborationType;
  status: CollabStatus;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    agentId: string;
    role: string;
    weight: number;
    status: 'active' | 'inactive' | 'pending';
    joinedAt: string;
  }>;
  decisionMaking: {
    algorithm: DecisionAlgorithm;
    threshold: number;
    timeoutMs: number;
    votingMechanism: {
      anonymity: boolean;
      transparency: boolean;
      revisionAllowed: boolean;
      timeLimitMs: number;
    };
  };
  taskDistribution: {
    distributionStrategy: 'round_robin' | 'capability_based' | 'load_balanced';
    loadBalancing: boolean;
    priorityHandling: 'fifo' | 'priority' | 'weighted';
    maxConcurrentTasks: number;
  };
  communication: {
    channels: string[];
    protocols: string[];
    messageFormat: 'json' | 'xml' | 'protobuf';
    encryptionEnabled: boolean;
  };
}

type CollaborationType = 'task_distribution' | 'decision_making' | 'resource_sharing' | 
                        'knowledge_exchange' | 'problem_solving' | 'consensus_building';

type DecisionAlgorithm = 'majority_vote' | 'consensus' | 'weighted_vote' | 'pbft' | 'custom';
type CollabStatus = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'cancelled';
```

### **Mapper实现**
```typescript
export class CollabMapper {
  static toSchema(entity: CollabData): CollabSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      collab_id: entity.collabId,
      context_id: entity.contextId,
      collaboration_type: entity.collaborationType,
      status: entity.status,
      title: entity.title,
      description: entity.description,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      participants: entity.participants.map(p => ({
        agent_id: p.agentId,
        role: p.role,
        weight: p.weight,
        status: p.status,
        joined_at: p.joinedAt
      })),
      decision_making: {
        algorithm: entity.decisionMaking.algorithm,
        threshold: entity.decisionMaking.threshold,
        timeout_ms: entity.decisionMaking.timeoutMs,
        voting_mechanism: {
          anonymity: entity.decisionMaking.votingMechanism.anonymity,
          transparency: entity.decisionMaking.votingMechanism.transparency,
          revision_allowed: entity.decisionMaking.votingMechanism.revisionAllowed,
          time_limit_ms: entity.decisionMaking.votingMechanism.timeLimitMs
        }
      },
      task_distribution: {
        distribution_strategy: entity.taskDistribution.distributionStrategy,
        load_balancing: entity.taskDistribution.loadBalancing,
        priority_handling: entity.taskDistribution.priorityHandling,
        max_concurrent_tasks: entity.taskDistribution.maxConcurrentTasks
      },
      communication: {
        channels: entity.communication.channels,
        protocols: entity.communication.protocols,
        message_format: entity.communication.messageFormat,
        encryption_enabled: entity.communication.encryptionEnabled
      }
    };
  }

  static fromSchema(schema: CollabSchema): CollabData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      collabId: schema.collab_id,
      contextId: schema.context_id,
      collaborationType: schema.collaboration_type,
      status: schema.status,
      title: schema.title,
      description: schema.description,
      createdBy: schema.created_by,
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      participants: schema.participants.map(p => ({
        agentId: p.agent_id,
        role: p.role,
        weight: p.weight,
        status: p.status,
        joinedAt: p.joined_at
      })),
      decisionMaking: {
        algorithm: schema.decision_making.algorithm,
        threshold: schema.decision_making.threshold,
        timeoutMs: schema.decision_making.timeout_ms,
        votingMechanism: {
          anonymity: schema.decision_making.voting_mechanism.anonymity,
          transparency: schema.decision_making.voting_mechanism.transparency,
          revisionAllowed: schema.decision_making.voting_mechanism.revision_allowed,
          timeLimitMs: schema.decision_making.voting_mechanism.time_limit_ms
        }
      },
      taskDistribution: {
        distributionStrategy: schema.task_distribution.distribution_strategy,
        loadBalancing: schema.task_distribution.load_balancing,
        priorityHandling: schema.task_distribution.priority_handling,
        maxConcurrentTasks: schema.task_distribution.max_concurrent_tasks
      },
      communication: {
        channels: schema.communication.channels,
        protocols: schema.communication.protocols,
        messageFormat: schema.communication.message_format,
        encryptionEnabled: schema.communication.encryption_enabled
      }
    };
  }

  static validateSchema(data: unknown): data is CollabSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.collab_id === 'string' &&
      typeof obj.collaboration_type === 'string' &&
      Array.isArray(obj.participants) &&
      // 验证不存在camelCase字段
      !('collabId' in obj) &&
      !('protocolVersion' in obj) &&
      !('collaborationType' in obj)
    );
  }
}
```

## 🔍 **验证规则**

### **必需字段验证**
```json
{
  "required": [
    "protocol_version",
    "timestamp",
    "collab_id",
    "context_id",
    "collaboration_type",
    "status",
    "participants"
  ]
}
```

### **协作业务规则验证**
```typescript
const collabValidationRules = {
  // 验证参与者权重总和
  validateParticipantWeights: (participants: Participant[]) => {
    const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);
    return Math.abs(totalWeight - 1.0) < 0.001; // 允许浮点误差
  },

  // 验证决策阈值合理性
  validateDecisionThreshold: (threshold: number, algorithm: string) => {
    if (algorithm === 'majority_vote') return threshold > 0.5 && threshold <= 1.0;
    if (algorithm === 'consensus') return threshold === 1.0;
    return threshold > 0 && threshold <= 1.0;
  },

  // 验证参与者最小数量
  validateMinimumParticipants: (participants: Participant[], collaborationType: string) => {
    const minRequirements = {
      'decision_making': 2,
      'consensus_building': 3,
      'task_distribution': 1,
      'resource_sharing': 2
    };
    return participants.length >= (minRequirements[collaborationType] || 1);
  }
};
```

## 🚀 **使用示例**

### **创建决策协作**
```typescript
import { CollabService } from '@mplp/collab';

const collabService = new CollabService();

const decisionCollab = await collabService.createCollaboration({
  contextId: "context-123",
  collaborationType: "decision_making",
  title: "技术栈选择决策",
  description: "团队协作选择项目技术栈",
  participants: [
    { agentId: "architect-001", role: "lead_architect", weight: 0.4 },
    { agentId: "developer-001", role: "senior_developer", weight: 0.3 },
    { agentId: "developer-002", role: "senior_developer", weight: 0.3 }
  ],
  decisionMaking: {
    algorithm: "weighted_vote",
    threshold: 0.7,
    timeoutMs: 1800000, // 30分钟
    votingMechanism: {
      anonymity: false,
      transparency: true,
      revisionAllowed: true,
      timeLimitMs: 900000 // 15分钟投票时间
    }
  }
});
```

### **任务分发协作**
```typescript
const taskCollab = await collabService.createTaskDistribution({
  contextId: "context-456",
  title: "代码审查任务分发",
  participants: [
    { agentId: "reviewer-001", role: "senior_reviewer", weight: 0.4 },
    { agentId: "reviewer-002", role: "reviewer", weight: 0.3 },
    { agentId: "reviewer-003", role: "reviewer", weight: 0.3 }
  ],
  taskDistribution: {
    distributionStrategy: "capability_based",
    loadBalancing: true,
    priorityHandling: "weighted",
    maxConcurrentTasks: 3
  }
});
```

### **监控协作状态**
```typescript
// 监听协作事件
collabService.on('decision.submitted', (event) => {
  console.log(`收到决策投票: ${event.collabId} - ${event.agentId}`);
});

collabService.on('collaboration.completed', (event) => {
  console.log(`协作完成: ${event.collabId} - ${event.result}`);
});

// 获取协作状态
const status = await collabService.getCollaborationStatus(collabId);
console.log(`协作进度: ${status.completedTasks}/${status.totalTasks}`);
```

## 🔗 **模块集成**

### **与Role模块集成**
```typescript
// 基于角色的协作权限
const eligibleAgents = await roleService.getAgentsWithCapability('decision_making');
await collabService.inviteParticipants(collabId, eligibleAgents);
```

### **与Plan模块集成**
```typescript
// 基于计划的任务分发
planService.on('plan.tasks_ready', async (event) => {
  await collabService.distributeTasksToAgents({
    planId: event.planId,
    tasks: event.tasks,
    distributionStrategy: 'capability_based'
  });
});
```

---

**维护团队**: MPLP Collab团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成

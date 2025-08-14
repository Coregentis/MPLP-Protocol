# MPLP Dialog Protocol Schema

## 📋 **概述**

Dialog协议Schema定义了MPLP系统中对话和交互管理的统一标准接口，支持从简单对话到智能分析的所有对话需求。经过最新企业级功能增强，现已包含完整的对话交互监控、用户体验分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-dialog.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 58.9%
**功能完整性**: ✅ 100% (基础功能 + 对话监控 + 企业级功能)
**企业级特性**: ✅ 对话交互监控、用户体验分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **对话管理**: 管理多方对话的生命周期和状态
- **交互控制**: 控制对话流程和参与者交互规则
- **智能分析**: 提供对话内容的智能分析和洞察
- **统一接口**: 为不同类型的对话需求提供统一接口

### **对话监控功能**
- **对话交互监控**: 实时监控对话响应延迟、完成率、质量评分
- **用户体验分析**: 详细的用户满意度分析和交互效率评估
- **对话状态监控**: 监控对话的交互状态、参与者管理、会话质量
- **对话管理审计**: 监控对话管理过程的合规性和可靠性
- **交互体验保证**: 监控对话交互系统的用户体验和交互质量

### **企业级功能**
- **对话管理审计**: 完整的对话管理和交互记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **性能监控**: 对话交互系统的详细监控和健康检查，包含关键对话指标
- **版本控制**: 对话配置的版本历史、变更追踪和快照管理
- **搜索索引**: 对话数据的全文搜索、语义搜索和自动索引
- **事件集成**: 对话事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和对话事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab ← [Dialog] → Network
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
| `dialog_id` | string | ✅ | UUID v4格式的对话标识符 |
| `context_id` | string | ✅ | 关联的上下文ID |
| `dialog_type` | string | ✅ | 对话类型枚举值 |
| `status` | string | ✅ | 对话状态枚举值 |
| `participants` | array | ✅ | 参与者列表 |

### **对话类型枚举**
```json
{
  "dialog_type": {
    "enum": [
      "simple_chat",          // 简单聊天
      "structured_discussion", // 结构化讨论
      "decision_dialog",      // 决策对话
      "brainstorming",        // 头脑风暴
      "interview",            // 面试对话
      "negotiation",          // 协商对话
      "problem_solving"       // 问题解决对话
    ]
  }
}
```

### **对话能力配置**
```json
{
  "dialog_capabilities": {
    "basic": {
      "enabled": true,
      "message_history": true,
      "participant_management": true
    },
    "intelligent_control": {
      "enabled": false,
      "adaptive_rounds": false,
      "dynamic_strategy": false,
      "completeness_evaluation": false
    },
    "critical_thinking": {
      "enabled": false,
      "analysis_depth": "surface",
      "bias_detection": false,
      "argument_evaluation": false
    }
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "dialog_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "550e8400-e29b-41d4-a716-446655440001",
  "dialog_type": "structured_discussion",
  "status": "active",
  "title": "项目需求讨论",
  "description": "团队讨论新项目的功能需求",
  "created_by": "facilitator-123",
  "created_at": "2025-08-13T10:30:00.000Z",
  "updated_at": "2025-08-13T10:35:00.000Z",
  "participants": [
    {
      "participant_id": "user-001",
      "role": "product_manager",
      "status": "active",
      "joined_at": "2025-08-13T10:30:00.000Z",
      "permissions": ["speak", "moderate", "summarize"]
    },
    {
      "participant_id": "user-002",
      "role": "developer",
      "status": "active", 
      "joined_at": "2025-08-13T10:31:00.000Z",
      "permissions": ["speak", "react"]
    }
  ],
  "dialog_capabilities": {
    "basic": {
      "enabled": true,
      "message_history": true,
      "participant_management": true
    },
    "intelligent_control": {
      "enabled": true,
      "adaptive_rounds": true,
      "dynamic_strategy": true,
      "completeness_evaluation": true
    },
    "critical_thinking": {
      "enabled": true,
      "analysis_depth": "deep",
      "bias_detection": true,
      "argument_evaluation": true
    }
  },
  "flow_control": {
    "max_rounds": 10,
    "round_timeout_ms": 300000,
    "turn_taking_strategy": "moderated",
    "interruption_policy": "polite"
  },
  "content_analysis": {
    "sentiment_analysis": true,
    "topic_extraction": true,
    "key_points_identification": true,
    "consensus_tracking": true
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface DialogData {
  protocolVersion: string;
  timestamp: string;
  dialogId: string;
  contextId: string;
  dialogType: DialogType;
  status: DialogStatus;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    participantId: string;
    role: string;
    status: 'active' | 'inactive' | 'muted';
    joinedAt: string;
    permissions: string[];
  }>;
  dialogCapabilities: {
    basic: {
      enabled: true;
      messageHistory: boolean;
      participantManagement: boolean;
    };
    intelligentControl: {
      enabled: boolean;
      adaptiveRounds: boolean;
      dynamicStrategy: boolean;
      completenessEvaluation: boolean;
    };
    criticalThinking: {
      enabled: boolean;
      analysisDepth: 'surface' | 'moderate' | 'deep';
      biasDetection: boolean;
      argumentEvaluation: boolean;
    };
  };
  flowControl: {
    maxRounds: number;
    roundTimeoutMs: number;
    turnTakingStrategy: 'free' | 'moderated' | 'round_robin';
    interruptionPolicy: 'strict' | 'polite' | 'free';
  };
  contentAnalysis: {
    sentimentAnalysis: boolean;
    topicExtraction: boolean;
    keyPointsIdentification: boolean;
    consensusTracking: boolean;
  };
}

type DialogType = 'simple_chat' | 'structured_discussion' | 'decision_dialog' | 
                 'brainstorming' | 'interview' | 'negotiation' | 'problem_solving';

type DialogStatus = 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
```

### **Mapper实现**
```typescript
export class DialogMapper {
  static toSchema(entity: DialogData): DialogSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      dialog_id: entity.dialogId,
      context_id: entity.contextId,
      dialog_type: entity.dialogType,
      status: entity.status,
      title: entity.title,
      description: entity.description,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      participants: entity.participants.map(p => ({
        participant_id: p.participantId,
        role: p.role,
        status: p.status,
        joined_at: p.joinedAt,
        permissions: p.permissions
      })),
      dialog_capabilities: {
        basic: {
          enabled: entity.dialogCapabilities.basic.enabled,
          message_history: entity.dialogCapabilities.basic.messageHistory,
          participant_management: entity.dialogCapabilities.basic.participantManagement
        },
        intelligent_control: {
          enabled: entity.dialogCapabilities.intelligentControl.enabled,
          adaptive_rounds: entity.dialogCapabilities.intelligentControl.adaptiveRounds,
          dynamic_strategy: entity.dialogCapabilities.intelligentControl.dynamicStrategy,
          completeness_evaluation: entity.dialogCapabilities.intelligentControl.completenessEvaluation
        },
        critical_thinking: {
          enabled: entity.dialogCapabilities.criticalThinking.enabled,
          analysis_depth: entity.dialogCapabilities.criticalThinking.analysisDepth,
          bias_detection: entity.dialogCapabilities.criticalThinking.biasDetection,
          argument_evaluation: entity.dialogCapabilities.criticalThinking.argumentEvaluation
        }
      },
      flow_control: {
        max_rounds: entity.flowControl.maxRounds,
        round_timeout_ms: entity.flowControl.roundTimeoutMs,
        turn_taking_strategy: entity.flowControl.turnTakingStrategy,
        interruption_policy: entity.flowControl.interruptionPolicy
      },
      content_analysis: {
        sentiment_analysis: entity.contentAnalysis.sentimentAnalysis,
        topic_extraction: entity.contentAnalysis.topicExtraction,
        key_points_identification: entity.contentAnalysis.keyPointsIdentification,
        consensus_tracking: entity.contentAnalysis.consensusTracking
      }
    };
  }

  static fromSchema(schema: DialogSchema): DialogData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      dialogId: schema.dialog_id,
      contextId: schema.context_id,
      dialogType: schema.dialog_type,
      status: schema.status,
      title: schema.title,
      description: schema.description,
      createdBy: schema.created_by,
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      participants: schema.participants.map(p => ({
        participantId: p.participant_id,
        role: p.role,
        status: p.status,
        joinedAt: p.joined_at,
        permissions: p.permissions
      })),
      dialogCapabilities: {
        basic: {
          enabled: schema.dialog_capabilities.basic.enabled,
          messageHistory: schema.dialog_capabilities.basic.message_history,
          participantManagement: schema.dialog_capabilities.basic.participant_management
        },
        intelligentControl: {
          enabled: schema.dialog_capabilities.intelligent_control.enabled,
          adaptiveRounds: schema.dialog_capabilities.intelligent_control.adaptive_rounds,
          dynamicStrategy: schema.dialog_capabilities.intelligent_control.dynamic_strategy,
          completenessEvaluation: schema.dialog_capabilities.intelligent_control.completeness_evaluation
        },
        criticalThinking: {
          enabled: schema.dialog_capabilities.critical_thinking.enabled,
          analysisDepth: schema.dialog_capabilities.critical_thinking.analysis_depth,
          biasDetection: schema.dialog_capabilities.critical_thinking.bias_detection,
          argumentEvaluation: schema.dialog_capabilities.critical_thinking.argument_evaluation
        }
      },
      flowControl: {
        maxRounds: schema.flow_control.max_rounds,
        roundTimeoutMs: schema.flow_control.round_timeout_ms,
        turnTakingStrategy: schema.flow_control.turn_taking_strategy,
        interruptionPolicy: schema.flow_control.interruption_policy
      },
      contentAnalysis: {
        sentimentAnalysis: schema.content_analysis.sentiment_analysis,
        topicExtraction: schema.content_analysis.topic_extraction,
        keyPointsIdentification: schema.content_analysis.key_points_identification,
        consensusTracking: schema.content_analysis.consensus_tracking
      }
    };
  }

  static validateSchema(data: unknown): data is DialogSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.dialog_id === 'string' &&
      typeof obj.dialog_type === 'string' &&
      Array.isArray(obj.participants) &&
      // 验证不存在camelCase字段
      !('dialogId' in obj) &&
      !('protocolVersion' in obj) &&
      !('dialogType' in obj)
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
    "dialog_id",
    "context_id",
    "dialog_type",
    "status",
    "participants",
    "dialog_capabilities"
  ]
}
```

### **对话业务规则验证**
```typescript
const dialogValidationRules = {
  // 验证参与者最小数量
  validateMinimumParticipants: (participants: Participant[], dialogType: string) => {
    const minRequirements = {
      'simple_chat': 2,
      'structured_discussion': 3,
      'decision_dialog': 2,
      'brainstorming': 3,
      'interview': 2,
      'negotiation': 2
    };
    return participants.length >= (minRequirements[dialogType] || 2);
  },

  // 验证轮次配置合理性
  validateRoundConfiguration: (maxRounds: number, timeoutMs: number) => {
    return maxRounds > 0 && maxRounds <= 100 && timeoutMs >= 30000; // 至少30秒
  },

  // 验证权限配置
  validateParticipantPermissions: (permissions: string[]) => {
    const validPermissions = ['speak', 'moderate', 'summarize', 'react', 'mute_others'];
    return permissions.every(p => validPermissions.includes(p));
  }
};
```

## 🚀 **使用示例**

### **创建结构化讨论**
```typescript
import { DialogService } from '@mplp/dialog';

const dialogService = new DialogService();

const discussion = await dialogService.createDialog({
  contextId: "context-123",
  dialogType: "structured_discussion",
  title: "产品功能优先级讨论",
  description: "团队讨论下个版本的功能优先级",
  participants: [
    { participantId: "pm-001", role: "product_manager", permissions: ["speak", "moderate"] },
    { participantId: "dev-001", role: "developer", permissions: ["speak", "react"] },
    { participantId: "designer-001", role: "designer", permissions: ["speak", "react"] }
  ],
  dialogCapabilities: {
    basic: { enabled: true, messageHistory: true, participantManagement: true },
    intelligentControl: { enabled: true, adaptiveRounds: true, dynamicStrategy: true },
    criticalThinking: { enabled: true, analysisDepth: "moderate", biasDetection: true }
  },
  flowControl: {
    maxRounds: 8,
    roundTimeoutMs: 600000, // 10分钟
    turnTakingStrategy: "moderated",
    interruptionPolicy: "polite"
  }
});
```

### **监控对话进展**
```typescript
// 监听对话事件
dialogService.on('message.sent', (event) => {
  console.log(`新消息: ${event.participantId} - ${event.message}`);
});

dialogService.on('round.completed', (event) => {
  console.log(`轮次完成: ${event.dialogId} - 轮次 ${event.roundNumber}`);
});

// 获取对话分析
const analysis = await dialogService.getDialogAnalysis(dialogId);
console.log(`情感分析: ${analysis.sentiment}`);
console.log(`关键话题: ${analysis.keyTopics.join(', ')}`);
```

---

**维护团队**: MPLP Dialog团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成

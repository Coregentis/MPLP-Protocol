# Dialog模块API参考

> **🌐 语言导航**: [English](../../../en/modules/dialog/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Dialog模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Dialog-teal.svg)](./README.md)
[![对话](https://img.shields.io/badge/conversations-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/dialog/api-reference.md)

---

## 🎯 API概览

Dialog模块提供全面的REST、GraphQL和WebSocket API，用于企业级对话管理、智能对话编排和多参与者通信。所有API都遵循MPLP协议标准，并提供高级对话AI功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/dialogs`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/dialogs`

### **身份验证**
所有API端点都需要使用JWT Bearer令牌进行身份验证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **对话管理端点**

#### **创建对话会话**
```http
POST /api/v1/dialogs
Content-Type: application/json
Authorization: Bearer <token>

{
  "dialog_id": "dialog-workflow-001",
  "dialog_name": "工作流审批讨论",
  "dialog_type": "approval_workflow",
  "dialog_category": "business_process",
  "dialog_description": "季度预算审批工作流的多方利益相关者讨论",
  "participants": [
    {
      "participant_id": "user-001",
      "participant_type": "human",
      "participant_role": "requester",
      "participant_name": "张三",
      "participant_email": "zhangsan@company.com",
      "permissions": ["read", "write", "initiate_topics"]
    },
    {
      "participant_id": "user-002",
      "participant_type": "human",
      "participant_role": "approver",
      "participant_name": "李四",
      "participant_email": "lisi@company.com",
      "permissions": ["read", "write", "approve", "reject"]
    },
    {
      "participant_id": "ai-assistant-001",
      "participant_type": "ai_agent",
      "participant_role": "facilitator",
      "participant_name": "AI工作流助手",
      "ai_capabilities": ["summarization", "decision_support", "process_guidance"],
      "permissions": ["read", "write", "suggest", "analyze"]
    }
  ],
  "dialog_configuration": {
    "max_participants": 10,
    "allow_anonymous": false,
    "moderation_enabled": true,
    "ai_assistance_enabled": true,
    "real_time_collaboration": true,
    "message_retention_days": 90,
    "encryption_enabled": true,
    "audit_logging": true
  },
  "workflow_integration": {
    "context_id": "ctx-budget-q4",
    "plan_id": "plan-budget-approval",
    "approval_workflow_id": "approval-budget-001",
    "trace_enabled": true
  },
  "ai_configuration": {
    "conversation_intelligence": {
      "enabled": true,
      "sentiment_analysis": true,
      "topic_extraction": true,
      "decision_tracking": true,
      "action_item_detection": true
    },
    "automated_responses": {
      "enabled": true,
      "response_types": ["acknowledgment", "clarification", "summary"],
      "trigger_conditions": ["question_asked", "decision_needed", "timeout"]
    },
    "smart_suggestions": {
      "enabled": true,
      "suggestion_types": ["next_steps", "relevant_documents", "expert_contacts"],
      "context_awareness": true
    }
  },
  "metadata": {
    "project_id": "proj-budget-2025",
    "department": "finance",
    "priority": "high",
    "deadline": "2025-09-15T17:00:00Z",
    "tags": ["budget", "approval", "quarterly"]
  }
}
```

#### **响应**
```json
{
  "dialog_id": "dialog-workflow-001",
  "dialog_name": "工作流审批讨论",
  "dialog_type": "approval_workflow",
  "status": "active",
  "created_at": "2025-09-03T10:00:00Z",
  "created_by": "user-001",
  "participants": [
    {
      "participant_id": "user-001",
      "participant_name": "张三",
      "participant_role": "requester",
      "status": "active",
      "joined_at": "2025-09-03T10:00:00Z"
    },
    {
      "participant_id": "user-002",
      "participant_name": "李四",
      "participant_role": "approver",
      "status": "invited",
      "invited_at": "2025-09-03T10:00:00Z"
    },
    {
      "participant_id": "ai-assistant-001",
      "participant_name": "AI工作流助手",
      "participant_role": "facilitator",
      "status": "active",
      "joined_at": "2025-09-03T10:00:00Z"
    }
  ],
  "dialog_urls": {
    "web_interface": "https://app.mplp.dev/dialogs/dialog-workflow-001",
    "api_endpoint": "https://api.mplp.dev/v1/dialogs/dialog-workflow-001",
    "websocket_endpoint": "wss://api.mplp.dev/ws/dialogs/dialog-workflow-001"
  },
  "ai_assistant_info": {
    "assistant_id": "ai-assistant-001",
    "capabilities": ["summarization", "decision_support", "process_guidance"],
    "language_support": ["zh-CN", "en-US"],
    "availability": "24/7"
  }
}
```

#### **获取对话详情**
```http
GET /api/v1/dialogs/{dialog_id}
Authorization: Bearer <token>
```

#### **响应**
```json
{
  "dialog_id": "dialog-workflow-001",
  "dialog_name": "工作流审批讨论",
  "dialog_type": "approval_workflow",
  "status": "active",
  "created_at": "2025-09-03T10:00:00Z",
  "updated_at": "2025-09-03T10:15:00Z",
  "participants_count": 3,
  "messages_count": 15,
  "last_activity": "2025-09-03T10:15:00Z",
  "conversation_summary": {
    "key_topics": ["预算分配", "时间线", "资源需求"],
    "decisions_made": [
      {
        "decision": "批准Q4预算增加15%",
        "decided_by": "user-002",
        "decided_at": "2025-09-03T10:12:00Z"
      }
    ],
    "action_items": [
      {
        "action": "准备详细预算分解",
        "assigned_to": "user-001",
        "due_date": "2025-09-05T17:00:00Z"
      }
    ],
    "sentiment_analysis": {
      "overall_sentiment": "positive",
      "confidence": 0.85,
      "sentiment_trend": "improving"
    }
  }
}
```

### **消息管理端点**

#### **发送消息**
```http
POST /api/v1/dialogs/{dialog_id}/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "message_type": "text",
  "content": "我认为我们应该重新考虑这个预算分配策略。",
  "sender_id": "user-001",
  "reply_to_message_id": "msg-001",
  "message_metadata": {
    "priority": "normal",
    "requires_response": true,
    "response_deadline": "2025-09-03T12:00:00Z",
    "tags": ["budget", "strategy"]
  },
  "ai_processing": {
    "sentiment_analysis": true,
    "intent_detection": true,
    "entity_extraction": true,
    "auto_translation": false
  }
}
```

#### **响应**
```json
{
  "message_id": "msg-015",
  "dialog_id": "dialog-workflow-001",
  "message_type": "text",
  "content": "我认为我们应该重新考虑这个预算分配策略。",
  "sender_id": "user-001",
  "sender_name": "张三",
  "sent_at": "2025-09-03T10:15:00Z",
  "status": "delivered",
  "ai_analysis": {
    "sentiment": {
      "sentiment": "neutral",
      "confidence": 0.78,
      "emotions": ["concern", "thoughtfulness"]
    },
    "intent": {
      "primary_intent": "suggestion",
      "confidence": 0.92,
      "secondary_intents": ["discussion_initiation"]
    },
    "entities": [
      {
        "entity": "预算分配策略",
        "type": "business_concept",
        "confidence": 0.95
      }
    ]
  },
  "delivery_status": {
    "delivered_to": ["user-002", "ai-assistant-001"],
    "read_by": [],
    "delivery_time": "2025-09-03T10:15:01Z"
  }
}
```

#### **获取对话消息历史**
```http
GET /api/v1/dialogs/{dialog_id}/messages?limit=50&offset=0&order=desc
Authorization: Bearer <token>
```

#### **响应**
```json
{
  "dialog_id": "dialog-workflow-001",
  "messages": [
    {
      "message_id": "msg-015",
      "message_type": "text",
      "content": "我认为我们应该重新考虑这个预算分配策略。",
      "sender_id": "user-001",
      "sender_name": "张三",
      "sent_at": "2025-09-03T10:15:00Z",
      "ai_analysis": {
        "sentiment": "neutral",
        "intent": "suggestion",
        "key_entities": ["预算分配策略"]
      }
    },
    {
      "message_id": "msg-014",
      "message_type": "ai_response",
      "content": "基于当前讨论，我建议我们总结一下到目前为止达成的关键决策点。",
      "sender_id": "ai-assistant-001",
      "sender_name": "AI工作流助手",
      "sent_at": "2025-09-03T10:12:30Z",
      "ai_metadata": {
        "response_type": "summary_suggestion",
        "confidence": 0.89,
        "triggered_by": "conversation_flow_analysis"
      }
    }
  ],
  "pagination": {
    "total_messages": 15,
    "current_page": 1,
    "total_pages": 1,
    "has_more": false
  },
  "conversation_metrics": {
    "average_response_time": "2.5 minutes",
    "participation_rate": {
      "user-001": 0.6,
      "user-002": 0.3,
      "ai-assistant-001": 0.1
    },
    "sentiment_trend": "positive"
  }
}
```

---

## 🔄 WebSocket API参考

### **连接建立**
```javascript
const ws = new WebSocket('wss://api.mplp.dev/ws/dialogs/dialog-workflow-001?token=<jwt-token>');

ws.onopen = function(event) {
  console.log('已连接到对话会话');
  
  // 发送加入对话消息
  ws.send(JSON.stringify({
    type: 'join_dialog',
    dialog_id: 'dialog-workflow-001',
    participant_id: 'user-001'
  }));
};
```

### **实时消息处理**
```javascript
ws.onmessage = function(event) {
  const message = JSON.parse(event.data);
  
  switch(message.type) {
    case 'new_message':
      handleNewMessage(message.data);
      break;
    case 'participant_joined':
      handleParticipantJoined(message.data);
      break;
    case 'ai_suggestion':
      handleAISuggestion(message.data);
      break;
    case 'typing_indicator':
      handleTypingIndicator(message.data);
      break;
  }
};

function handleNewMessage(messageData) {
  console.log('新消息:', messageData.content);
  console.log('发送者:', messageData.sender_name);
  console.log('AI分析:', messageData.ai_analysis);
}
```

### **发送实时消息**
```javascript
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: 'send_message',
    dialog_id: 'dialog-workflow-001',
    message: {
      content: content,
      message_type: 'text',
      sender_id: 'user-001'
    }
  }));
}
```

---

## 📊 GraphQL API参考

### **查询对话信息**
```graphql
query GetDialog($dialogId: ID!) {
  dialog(id: $dialogId) {
    dialogId
    dialogName
    dialogType
    status
    createdAt
    participants {
      participantId
      participantName
      participantRole
      status
      joinedAt
    }
    messages(limit: 10, orderBy: SENT_AT_DESC) {
      messageId
      content
      messageType
      sender {
        participantId
        participantName
      }
      sentAt
      aiAnalysis {
        sentiment
        intent
        entities
      }
    }
    conversationSummary {
      keyTopics
      decisionsMade {
        decision
        decidedBy
        decidedAt
      }
      actionItems {
        action
        assignedTo
        dueDate
      }
    }
  }
}
```

### **创建新对话**
```graphql
mutation CreateDialog($input: CreateDialogInput!) {
  createDialog(input: $input) {
    dialogId
    dialogName
    status
    createdAt
    participants {
      participantId
      participantName
      status
    }
    dialogUrls {
      webInterface
      apiEndpoint
      websocketEndpoint
    }
  }
}
```

---

## 🔗 相关文档

- [Dialog模块概览](./README.md) - 模块概览和架构
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 生产就绪  

**⚠️ Alpha版本说明**: Dialog模块API在Alpha版本中提供完整的对话管理功能。额外的高级API功能和优化将在Beta版本中添加。

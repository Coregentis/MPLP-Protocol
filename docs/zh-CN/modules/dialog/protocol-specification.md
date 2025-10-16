# Dialog模块协议规范

> **🌐 语言导航**: [English](../../../en/modules/dialog/protocol-specification.md) | [中文](protocol-specification.md)



**多智能体协议生命周期平台 - Dialog模块协议规范 v1.0.0-alpha**

[![协议](https://img.shields.io/badge/protocol-Dialog%20v1.0-purple.svg)](./README.md)
[![规范](https://img.shields.io/badge/specification-Enterprise%20Grade-green.svg)](./api-reference.md)
[![对话](https://img.shields.io/badge/conversations-Compliant-orange.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/dialog/protocol-specification.md)

---

## 🎯 协议概览

Dialog模块协议定义了企业级对话管理、AI驱动的对话协调和多智能体系统中实时协作通信的全面消息格式、数据结构和通信模式。该规范确保分布式智能体网络中安全、可扩展和智能的对话交互。

### **协议范围**
- **对话管理**: 会话创建、参与者管理和对话生命周期
- **消息处理**: 实时消息处理、AI分析和智能响应
- **对话智能**: AI驱动的情感分析、主题提取和决策跟踪
- **实时通信**: 基于WebSocket的广播、在线状态管理和通知
- **跨模块集成**: 工作流集成和多模块对话协调

### **协议特性**
- **版本**: 1.0.0-alpha
- **传输**: HTTP/HTTPS, WebSocket, gRPC, 消息队列
- **序列化**: JSON, Protocol Buffers, MessagePack
- **安全**: JWT认证, 消息加密, 审计日志
- **AI集成**: 兼容OpenAI, Anthropic, Azure OpenAI

---

## 📋 核心协议消息

### **对话管理协议**

#### **对话创建消息**
```json
{
  "message_type": "dialog.management.create",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-dialog-create-001",
  "timestamp": "2025-09-03T10:00:00.000Z",
  "correlation_id": "corr-dialog-001",
  "sender": {
    "sender_id": "user-001",
    "sender_type": "human",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user_account": "john.smith@company.com"
    }
  },
  "payload": {
    "dialog_creation": {
      "dialog_id": "dialog-workflow-001",
      "dialog_name": "季度预算审批讨论",
      "dialog_type": "approval_workflow",
      "dialog_category": "business_process",
      "dialog_description": "具有AI协调和决策跟踪的多方利益相关者Q4预算审批讨论",
      "participants": [
        {
          "participant_id": "user-001",
          "participant_type": "human",
          "participant_role": "requester",
          "participant_name": "张三",
          "participant_email": "zhangsan@company.com",
          "participant_department": "市场部",
          "permissions": ["read", "write", "initiate_topics", "attach_documents"],
          "notification_preferences": {
            "email_notifications": true,
            "push_notifications": true,
            "mention_alerts": true,
            "decision_alerts": true
          },
          "availability": {
            "timezone": "Asia/Shanghai",
            "working_hours": {
              "start": "09:00",
              "end": "18:00"
            },
            "preferred_response_time": "within_2_hours"
          }
        },
        {
          "participant_id": "user-002",
          "participant_type": "human",
          "participant_role": "approver",
          "participant_name": "李四",
          "participant_email": "lisi@company.com",
          "participant_department": "财务部",
          "permissions": ["read", "write", "approve", "reject", "request_changes"],
          "approval_authority": {
            "max_approval_amount": 1000000,
            "approval_categories": ["budget", "expenditure", "investment"],
            "delegation_enabled": true
          },
          "notification_preferences": {
            "email_notifications": true,
            "push_notifications": true,
            "approval_alerts": true,
            "deadline_alerts": true
          }
        },
        {
          "participant_id": "ai-facilitator-001",
          "participant_type": "ai_agent",
          "participant_role": "facilitator",
          "participant_name": "AI协调助手",
          "ai_capabilities": {
            "conversation_intelligence": true,
            "automated_responses": true,
            "smart_suggestions": true,
            "decision_tracking": true,
            "sentiment_monitoring": true,
            "conflict_resolution": true
          },
          "ai_configuration": {
            "response_frequency": "as_needed",
            "intervention_threshold": 0.8,
            "languages": ["zh-CN", "en-US"],
            "personality": "professional_helpful"
          }
        }
      ],
      "dialog_configuration": {
        "max_participants": 50,
        "allow_anonymous": false,
        "moderation_enabled": true,
        "ai_assistance_enabled": true,
        "real_time_collaboration": true,
        "message_retention_days": 90,
        "encryption_enabled": true,
        "audit_logging": true,
        "auto_translation": true,
        "supported_languages": ["zh-CN", "en-US", "ja-JP"],
        "conversation_timeout_hours": 72,
        "decision_deadline": "2025-09-10T17:00:00.000Z"
      },
      "ai_configuration": {
        "conversation_intelligence": {
          "enabled": true,
          "sentiment_analysis": {
            "enabled": true,
            "real_time": true,
            "confidence_threshold": 0.8,
            "alert_on_negative": true
          },
          "topic_extraction": {
            "enabled": true,
            "max_topics_per_message": 5,
            "topic_clustering": true,
            "topic_evolution_tracking": true
          },
          "decision_tracking": {
            "enabled": true,
            "decision_confidence_threshold": 0.9,
            "track_decision_makers": true,
            "consensus_detection": true
          },
          "action_item_detection": {
            "enabled": true,
            "auto_assignment": true,
            "due_date_extraction": true,
            "priority_classification": true
          }
        },
        "automated_responses": {
          "enabled": true,
          "response_types": ["acknowledgment", "clarification", "summary", "action_reminder"],
          "trigger_conditions": ["question_asked", "decision_needed", "timeout_reached", "conflict_detected"],
          "response_delay_ms": 2000,
          "max_responses_per_hour": 20,
          "personalization_enabled": true
        },
        "smart_suggestions": {
          "enabled": true,
          "suggestion_types": ["next_steps", "relevant_documents", "similar_conversations", "expert_contacts"],
          "context_awareness": true,
          "suggestion_confidence_threshold": 0.75,
          "proactive_suggestions": true
        }
      },
      "workflow_integration": {
        "context_id": "context-budget-q4-2025",
        "plan_id": "plan-budget-approval-001",
        "trace_enabled": true,
        "approval_workflow": {
          "workflow_id": "approval-budget-001",
          "approval_stages": [
            {
              "stage_id": "department_review",
              "stage_name": "部门审查",
              "required_approvers": ["user-002"],
              "approval_threshold": 1,
              "stage_timeout_hours": 24
            },
            {
              "stage_id": "executive_approval",
              "stage_name": "高管审批",
              "required_approvers": ["user-003", "user-004"],
              "approval_threshold": 2,
              "stage_timeout_hours": 48
            }
          ],
          "escalation_rules": {
            "timeout_escalation": true,
            "conflict_escalation": true,
            "escalation_contacts": ["user-005"]
          }
        }
      },
      "metadata": {
        "business_context": {
          "project_id": "proj-budget-2025",
          "cost_center": "CC-MKT-001",
          "budget_category": "operational",
          "fiscal_year": "2025",
          "priority": "high"
        },
        "compliance_requirements": {
          "sox_compliance": true,
          "gdpr_compliance": true,
          "audit_trail_required": true,
          "data_retention_policy": "7_years"
        },
        "integration_metadata": {
          "erp_system": "SAP",
          "crm_system": "Salesforce",
          "document_management": "SharePoint"
        }
      },
      "created_by": "user-001",
      "created_at": "2025-09-03T10:00:00.000Z"
    }
  }
}
```

#### **对话创建响应消息**
```json
{
  "message_type": "dialog.management.create.response",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-dialog-create-response-001",
  "timestamp": "2025-09-03T10:00:01.500Z",
  "correlation_id": "corr-dialog-001",
  "sender": {
    "sender_id": "dialog-service",
    "sender_type": "system"
  },
  "payload": {
    "dialog_creation_result": {
      "status": "success",
      "dialog_id": "dialog-workflow-001",
      "dialog_name": "季度预算审批讨论",
      "dialog_status": "active",
      "participants_initialized": 3,
      "ai_facilitator_status": "active",
      "dialog_urls": {
        "web_interface": "https://app.mplp.dev/dialogs/dialog-workflow-001",
        "api_endpoint": "https://api.mplp.dev/v1/dialogs/dialog-workflow-001",
        "websocket_endpoint": "wss://api.mplp.dev/ws/dialogs/dialog-workflow-001"
      },
      "ai_assistant_info": {
        "assistant_id": "ai-facilitator-001",
        "capabilities": ["conversation_intelligence", "automated_responses", "smart_suggestions"],
        "language_support": ["zh-CN", "en-US"],
        "availability": "24/7"
      },
      "workflow_integration_status": {
        "context_linked": true,
        "plan_linked": true,
        "trace_enabled": true,
        "approval_workflow_initialized": true
      },
      "security_configuration": {
        "encryption_enabled": true,
        "audit_logging_enabled": true,
        "access_control_applied": true
      },
      "estimated_costs": {
        "ai_processing_cost_per_message": 0.02,
        "storage_cost_per_day": 0.10,
        "bandwidth_cost_estimate": 0.05
      },
      "creation_time_ms": 1500,
      "created_at": "2025-09-03T10:00:01.500Z"
    }
  }
}
```

### **消息处理协议**

#### **智能消息发送**
```json
{
  "message_type": "dialog.message.send",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-send-001",
  "timestamp": "2025-09-03T10:15:00.000Z",
  "correlation_id": "corr-message-001",
  "sender": {
    "sender_id": "user-001",
    "sender_type": "human",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "payload": {
    "message_send": {
      "dialog_id": "dialog-workflow-001",
      "message_type": "text",
      "content": {
        "text": "我们需要审查Q4市场推广预算，总额为50万元。这包括数字广告30万、活动费用15万、内容制作5万。请各位审查并提供反馈。",
        "language": "zh-CN",
        "formatting": {
          "mentions": [],
          "hashtags": ["#Q4预算", "#市场推广"],
          "attachments": [
            {
              "attachment_id": "att-budget-001",
              "attachment_type": "document",
              "file_name": "Q4_Marketing_Budget_Detail.xlsx",
              "file_size": 2048576,
              "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "download_url": "https://files.mplp.dev/attachments/att-budget-001"
            }
          ]
        }
      },
      "reply_to_message_id": null,
      "message_metadata": {
        "priority": "high",
        "requires_response": true,
        "response_deadline": "2025-09-05T17:00:00.000Z",
        "tags": ["budget_review", "approval_required", "q4_planning"],
        "business_context": {
          "action_required": true,
          "decision_point": true,
          "stakeholders": ["finance", "marketing", "executive"]
        }
      },
      "ai_processing": {
        "sentiment_analysis": true,
        "intent_detection": true,
        "entity_extraction": true,
        "action_item_detection": true,
        "auto_translation": false,
        "smart_suggestions": true
      }
    }
  }
}
```

---

## 🔗 相关文档

- [Dialog模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [测试指南](./testing-guide.md) - 测试策略

---

**协议版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级规范  

**⚠️ Alpha版本说明**: Dialog模块协议规范在Alpha版本中提供企业级协议定义。额外的高级协议功能和扩展将在Beta版本中添加。

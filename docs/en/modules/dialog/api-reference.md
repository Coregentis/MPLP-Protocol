# Dialog Module API Reference

**Multi-Agent Protocol Lifecycle Platform - Dialog Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Dialog-teal.svg)](./README.md)
[![Conversations](https://img.shields.io/badge/conversations-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/dialog/api-reference.md)

---

## 🎯 API Overview

The Dialog Module provides comprehensive REST, GraphQL, and WebSocket APIs for enterprise-grade conversation management, intelligent dialog orchestration, and multi-participant communication. All APIs follow MPLP protocol standards and provide advanced conversational AI features.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/dialogs`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/dialogs`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API Reference

### **Dialog Management Endpoints**

#### **Create Dialog Session**
```http
POST /api/v1/dialogs
Content-Type: application/json
Authorization: Bearer <token>

{
  "dialog_id": "dialog-workflow-001",
  "dialog_name": "Workflow Approval Discussion",
  "dialog_type": "approval_workflow",
  "dialog_category": "business_process",
  "dialog_description": "Multi-stakeholder discussion for quarterly budget approval workflow",
  "participants": [
    {
      "participant_id": "user-001",
      "participant_type": "human",
      "participant_role": "requester",
      "participant_name": "John Smith",
      "participant_email": "john.smith@company.com",
      "permissions": ["read", "write", "initiate_topics"]
    },
    {
      "participant_id": "user-002",
      "participant_type": "human",
      "participant_role": "approver",
      "participant_name": "Sarah Johnson",
      "participant_email": "sarah.johnson@company.com",
      "permissions": ["read", "write", "approve", "reject"]
    },
    {
      "participant_id": "ai-assistant-001",
      "participant_type": "ai_agent",
      "participant_role": "facilitator",
      "participant_name": "AI Workflow Assistant",
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
      "suggestion_types": ["next_steps", "relevant_documents", "similar_cases"],
      "proactive_suggestions": true
    }
  },
  "metadata": {
    "tags": ["budget", "approval", "quarterly", "finance"],
    "priority": "high",
    "department": "finance",
    "cost_center": "FIN-001",
    "compliance_requirements": ["sox", "audit_trail"]
  }
}
```

**Response (201 Created):**
```json
{
  "dialog_id": "dialog-workflow-001",
  "dialog_name": "Workflow Approval Discussion",
  "dialog_type": "approval_workflow",
  "dialog_status": "active",
  "created_at": "2025-09-03T10:00:00.000Z",
  "created_by": "user-001",
  "participants": [
    {
      "participant_id": "user-001",
      "participant_status": "active",
      "joined_at": "2025-09-03T10:00:00.000Z",
      "last_activity": "2025-09-03T10:00:00.000Z"
    },
    {
      "participant_id": "user-002",
      "participant_status": "invited",
      "invitation_sent_at": "2025-09-03T10:00:00.000Z"
    },
    {
      "participant_id": "ai-assistant-001",
      "participant_status": "active",
      "joined_at": "2025-09-03T10:00:00.000Z",
      "ai_readiness": "ready"
    }
  ],
  "dialog_urls": {
    "web_interface": "https://app.mplp.dev/dialogs/dialog-workflow-001",
    "api_endpoint": "https://api.mplp.dev/v1/dialogs/dialog-workflow-001",
    "websocket_endpoint": "wss://api.mplp.dev/ws/dialogs/dialog-workflow-001"
  },
  "security_context": {
    "encryption_key_id": "key-dialog-001",
    "access_token": "dialog-access-token-001",
    "session_timeout_minutes": 480
  },
  "ai_services": {
    "conversation_intelligence": "enabled",
    "automated_facilitation": "enabled",
    "smart_suggestions": "enabled",
    "real_time_analysis": "enabled"
  }
}
```

#### **Send Message**
```http
POST /api/v1/dialogs/{dialog_id}/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "message_id": "msg-001",
  "message_type": "text",
  "message_content": {
    "text": "I'd like to discuss the Q4 budget allocation for the marketing department. The proposed increase of 25% seems significant given current market conditions.",
    "formatting": {
      "mentions": ["@sarah.johnson", "@ai-assistant-001"],
      "hashtags": ["#budget", "#marketing", "#q4"],
      "emphasis": ["significant", "current market conditions"]
    }
  },
  "message_context": {
    "reply_to_message_id": null,
    "thread_id": "thread-budget-discussion",
    "topic": "budget_allocation",
    "urgency": "normal",
    "requires_response": true,
    "response_deadline": "2025-09-05T17:00:00.000Z"
  },
  "attachments": [
    {
      "attachment_id": "att-001",
      "attachment_type": "document",
      "attachment_name": "Q4_Marketing_Budget_Proposal.pdf",
      "attachment_size_bytes": 2048576,
      "attachment_url": "https://storage.mplp.dev/attachments/att-001",
      "attachment_checksum": "sha256:abc123def456..."
    }
  ],
  "ai_processing": {
    "analyze_sentiment": true,
    "extract_topics": true,
    "detect_action_items": true,
    "generate_summary": false,
    "translate_if_needed": false
  },
  "metadata": {
    "client_timestamp": "2025-09-03T10:05:00.000Z",
    "client_timezone": "America/New_York",
    "message_source": "web_interface",
    "device_info": {
      "device_type": "desktop",
      "browser": "Chrome 118.0",
      "os": "Windows 11"
    }
  }
}
```

**Response (201 Created):**
```json
{
  "message_id": "msg-001",
  "dialog_id": "dialog-workflow-001",
  "sender_id": "user-001",
  "message_type": "text",
  "message_status": "delivered",
  "sent_at": "2025-09-03T10:05:00.000Z",
  "delivered_at": "2025-09-03T10:05:01.000Z",
  "message_sequence": 1,
  "thread_id": "thread-budget-discussion",
  "ai_analysis": {
    "sentiment": {
      "overall_sentiment": "neutral",
      "sentiment_score": 0.1,
      "confidence": 0.85,
      "emotional_tone": "professional_concern"
    },
    "topics_extracted": [
      {
        "topic": "budget_allocation",
        "confidence": 0.95,
        "keywords": ["Q4", "budget", "allocation", "marketing"]
      },
      {
        "topic": "market_conditions",
        "confidence": 0.78,
        "keywords": ["market conditions", "significant", "increase"]
      }
    ],
    "action_items_detected": [
      {
        "action_item": "Review marketing budget increase justification",
        "assigned_to": ["sarah.johnson"],
        "priority": "medium",
        "due_date": "2025-09-05T17:00:00.000Z"
      }
    ],
    "entities_mentioned": [
      {
        "entity": "Q4 budget",
        "entity_type": "financial_period",
        "confidence": 0.92
      },
      {
        "entity": "marketing department",
        "entity_type": "organization_unit",
        "confidence": 0.88
      },
      {
        "entity": "25%",
        "entity_type": "percentage",
        "confidence": 0.99
      }
    ]
  },
  "delivery_status": {
    "total_recipients": 3,
    "delivered_to": 2,
    "pending_delivery": 1,
    "delivery_details": [
      {
        "participant_id": "user-002",
        "delivery_status": "delivered",
        "delivered_at": "2025-09-03T10:05:01.000Z"
      },
      {
        "participant_id": "ai-assistant-001",
        "delivery_status": "delivered",
        "delivered_at": "2025-09-03T10:05:00.500Z",
        "ai_processing_status": "completed"
      }
    ]
  },
  "smart_suggestions": [
    {
      "suggestion_type": "relevant_document",
      "suggestion_title": "Previous Q3 Marketing Performance Report",
      "suggestion_description": "May provide context for budget increase justification",
      "suggestion_url": "https://docs.company.com/reports/q3-marketing",
      "relevance_score": 0.82
    },
    {
      "suggestion_type": "similar_discussion",
      "suggestion_title": "Q3 Budget Review Discussion",
      "suggestion_description": "Similar budget discussion from previous quarter",
      "suggestion_url": "https://app.mplp.dev/dialogs/dialog-q3-budget",
      "relevance_score": 0.75
    }
  ]
}
```

#### **Get Dialog Messages**
```http
GET /api/v1/dialogs/{dialog_id}/messages?limit=50&offset=0&thread_id=thread-budget-discussion&include_ai_analysis=true
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "dialog_id": "dialog-workflow-001",
  "thread_id": "thread-budget-discussion",
  "messages": [
    {
      "message_id": "msg-001",
      "sender_id": "user-001",
      "sender_name": "John Smith",
      "sender_type": "human",
      "message_type": "text",
      "message_content": {
        "text": "I'd like to discuss the Q4 budget allocation for the marketing department...",
        "formatted_text": "I'd like to discuss the Q4 budget allocation for the marketing department. The proposed increase of 25% seems <em>significant</em> given <em>current market conditions</em>.",
        "mentions": ["@sarah.johnson", "@ai-assistant-001"],
        "hashtags": ["#budget", "#marketing", "#q4"]
      },
      "sent_at": "2025-09-03T10:05:00.000Z",
      "message_sequence": 1,
      "attachments": [
        {
          "attachment_id": "att-001",
          "attachment_name": "Q4_Marketing_Budget_Proposal.pdf",
          "attachment_type": "document",
          "attachment_size_bytes": 2048576,
          "download_url": "https://api.mplp.dev/v1/dialogs/dialog-workflow-001/attachments/att-001"
        }
      ],
      "ai_analysis": {
        "sentiment": "neutral",
        "topics": ["budget_allocation", "market_conditions"],
        "action_items": [
          {
            "action": "Review marketing budget increase justification",
            "assigned_to": ["sarah.johnson"],
            "due_date": "2025-09-05T17:00:00.000Z"
          }
        ],
        "key_entities": ["Q4 budget", "marketing department", "25%"]
      },
      "reactions": [
        {
          "reaction_type": "acknowledge",
          "participant_id": "user-002",
          "reacted_at": "2025-09-03T10:06:00.000Z"
        }
      ],
      "read_status": [
        {
          "participant_id": "user-002",
          "read_at": "2025-09-03T10:05:30.000Z"
        },
        {
          "participant_id": "ai-assistant-001",
          "read_at": "2025-09-03T10:05:00.500Z"
        }
      ]
    },
    {
      "message_id": "msg-002",
      "sender_id": "ai-assistant-001",
      "sender_name": "AI Workflow Assistant",
      "sender_type": "ai_agent",
      "message_type": "ai_response",
      "message_content": {
        "text": "I've analyzed the budget proposal and current market data. Here's a summary of key considerations for the 25% marketing budget increase:",
        "structured_content": {
          "analysis_type": "budget_analysis",
          "key_findings": [
            {
              "finding": "Market conditions show 15% decline in consumer spending",
              "impact": "high",
              "recommendation": "Consider phased budget increase"
            },
            {
              "finding": "Previous marketing ROI was 3.2x",
              "impact": "positive",
              "recommendation": "Strong justification for continued investment"
            }
          ],
          "recommendations": [
            "Implement 15% increase initially with performance gates",
            "Focus budget on digital channels with higher ROI",
            "Establish monthly review checkpoints"
          ]
        }
      },
      "sent_at": "2025-09-03T10:07:30.000Z",
      "message_sequence": 2,
      "ai_metadata": {
        "processing_time_ms": 2500,
        "confidence_score": 0.89,
        "data_sources": ["market_data_api", "internal_analytics", "budget_history"],
        "model_version": "gpt-4-analysis-v1.2"
      },
      "smart_actions": [
        {
          "action_type": "schedule_review",
          "action_title": "Schedule Budget Review Meeting",
          "action_description": "Schedule follow-up meeting to discuss phased approach",
          "suggested_participants": ["user-001", "user-002", "finance-team"],
          "suggested_date": "2025-09-04T14:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "total_messages": 2,
    "limit": 50,
    "offset": 0,
    "has_more": false
  },
  "thread_summary": {
    "thread_id": "thread-budget-discussion",
    "topic": "Q4 Marketing Budget Discussion",
    "participant_count": 3,
    "message_count": 2,
    "last_activity": "2025-09-03T10:07:30.000Z",
    "status": "active",
    "key_decisions": [],
    "action_items": [
      {
        "action": "Review marketing budget increase justification",
        "assigned_to": ["sarah.johnson"],
        "status": "pending",
        "due_date": "2025-09-05T17:00:00.000Z"
      }
    ]
  }
}
```

### **AI-Powered Dialog Features**

#### **Generate Dialog Summary**
```http
POST /api/v1/dialogs/{dialog_id}/summary
Content-Type: application/json
Authorization: Bearer <token>

{
  "summary_type": "comprehensive",
  "time_range": {
    "start_date": "2025-09-03T10:00:00.000Z",
    "end_date": "2025-09-03T12:00:00.000Z"
  },
  "include_sections": [
    "key_topics",
    "decisions_made",
    "action_items",
    "participant_contributions",
    "sentiment_analysis",
    "next_steps"
  ],
  "summary_format": "structured",
  "target_audience": "executives"
}
```

**Response (200 OK):**
```json
{
  "dialog_id": "dialog-workflow-001",
  "summary_id": "summary-001",
  "summary_type": "comprehensive",
  "generated_at": "2025-09-03T12:00:00.000Z",
  "time_range": {
    "start_date": "2025-09-03T10:00:00.000Z",
    "end_date": "2025-09-03T12:00:00.000Z",
    "duration_minutes": 120
  },
  "summary_content": {
    "executive_summary": "Discussion focused on Q4 marketing budget increase proposal of 25%. AI analysis revealed market challenges but strong historical ROI. Recommendation for phased approach with performance gates.",
    "key_topics": [
      {
        "topic": "Q4 Marketing Budget Increase",
        "importance": "high",
        "discussion_time_percent": 65,
        "participant_engagement": "high",
        "key_points": [
          "Proposed 25% increase in marketing budget",
          "Current market conditions showing 15% decline in consumer spending",
          "Historical marketing ROI of 3.2x supports investment",
          "Recommendation for phased 15% initial increase"
        ]
      },
      {
        "topic": "Market Conditions Analysis",
        "importance": "medium",
        "discussion_time_percent": 25,
        "key_points": [
          "Consumer spending decline impacting budget decisions",
          "Digital channels showing better ROI than traditional",
          "Need for agile budget allocation approach"
        ]
      }
    ],
    "decisions_made": [
      {
        "decision": "Adopt phased budget increase approach",
        "decision_maker": "sarah.johnson",
        "decision_date": "2025-09-03T11:30:00.000Z",
        "decision_rationale": "Balances growth investment with market uncertainty",
        "implementation_date": "2025-10-01T00:00:00.000Z"
      }
    ],
    "action_items": [
      {
        "action": "Prepare detailed phased budget implementation plan",
        "assigned_to": "john.smith",
        "due_date": "2025-09-06T17:00:00.000Z",
        "priority": "high",
        "status": "assigned"
      },
      {
        "action": "Schedule monthly budget review meetings",
        "assigned_to": "sarah.johnson",
        "due_date": "2025-09-04T17:00:00.000Z",
        "priority": "medium",
        "status": "assigned"
      }
    ],
    "participant_contributions": [
      {
        "participant_id": "user-001",
        "participant_name": "John Smith",
        "message_count": 8,
        "contribution_percentage": 45,
        "key_contributions": [
          "Initiated budget discussion",
          "Provided market context",
          "Proposed implementation timeline"
        ],
        "engagement_level": "high"
      },
      {
        "participant_id": "user-002",
        "participant_name": "Sarah Johnson",
        "message_count": 6,
        "contribution_percentage": 35,
        "key_contributions": [
          "Made final budget decision",
          "Provided approval authority",
          "Set review schedule"
        ],
        "engagement_level": "high"
      },
      {
        "participant_id": "ai-assistant-001",
        "participant_name": "AI Workflow Assistant",
        "message_count": 4,
        "contribution_percentage": 20,
        "key_contributions": [
          "Provided market data analysis",
          "Generated budget recommendations",
          "Facilitated decision-making process"
        ],
        "engagement_level": "supportive"
      }
    ],
    "sentiment_analysis": {
      "overall_sentiment": "constructive",
      "sentiment_progression": [
        {
          "time_period": "10:00-10:30",
          "sentiment": "cautious",
          "sentiment_score": -0.2
        },
        {
          "time_period": "10:30-11:00",
          "sentiment": "analytical",
          "sentiment_score": 0.1
        },
        {
          "time_period": "11:00-11:30",
          "sentiment": "collaborative",
          "sentiment_score": 0.4
        },
        {
          "time_period": "11:30-12:00",
          "sentiment": "decisive",
          "sentiment_score": 0.6
        }
      ],
      "emotional_themes": ["professional", "data-driven", "collaborative", "solution-focused"]
    },
    "next_steps": [
      {
        "step": "Finalize phased budget implementation plan",
        "timeline": "By September 6, 2025",
        "responsible_party": "John Smith",
        "dependencies": ["Market analysis update", "Finance team approval"]
      },
      {
        "step": "Begin Q4 marketing campaign planning",
        "timeline": "By September 15, 2025",
        "responsible_party": "Marketing Team",
        "dependencies": ["Budget approval", "Resource allocation"]
      }
    ]
  },
  "summary_metadata": {
    "total_messages_analyzed": 18,
    "processing_time_ms": 5500,
    "ai_confidence_score": 0.91,
    "data_sources": ["dialog_messages", "participant_profiles", "market_data"],
    "summary_length_words": 342,
    "key_insights_count": 8
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type Dialog {
  dialogId: ID!
  dialogName: String!
  dialogType: DialogType!
  dialogCategory: String!
  dialogDescription: String
  dialogStatus: DialogStatus!
  createdAt: DateTime!
  createdBy: ID!
  updatedAt: DateTime!
  participants: [Participant!]!
  messages: [Message!]!
  threads: [Thread!]!
  aiConfiguration: AIConfiguration
  workflowIntegration: WorkflowIntegration
  metadata: DialogMetadata
}

type Message {
  messageId: ID!
  dialogId: ID!
  senderId: ID!
  senderName: String!
  senderType: ParticipantType!
  messageType: MessageType!
  messageContent: MessageContent!
  sentAt: DateTime!
  messageSequence: Int!
  threadId: ID
  replyToMessageId: ID
  attachments: [Attachment!]!
  aiAnalysis: AIAnalysis
  reactions: [Reaction!]!
  readStatus: [ReadStatus!]!
}

type AIAnalysis {
  sentiment: SentimentAnalysis
  topicsExtracted: [Topic!]!
  actionItemsDetected: [ActionItem!]!
  entitiesMentioned: [Entity!]!
  smartSuggestions: [SmartSuggestion!]!
  processingMetadata: AIProcessingMetadata
}

enum DialogType {
  APPROVAL_WORKFLOW
  BRAINSTORMING
  DECISION_MAKING
  PROJECT_PLANNING
  PROBLEM_SOLVING
  INFORMATION_SHARING
  TRAINING_SESSION
  CUSTOM
}

enum DialogStatus {
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
  CANCELLED
}

enum MessageType {
  TEXT
  AI_RESPONSE
  SYSTEM_MESSAGE
  ATTACHMENT
  POLL
  DECISION
  ACTION_ITEM
}
```

### **Query Operations**

#### **Get Dialog with Messages**
```graphql
query GetDialog($dialogId: ID!, $messageLimit: Int = 50) {
  dialog(dialogId: $dialogId) {
    dialogId
    dialogName
    dialogType
    dialogStatus
    createdAt
    participants {
      participantId
      participantName
      participantType
      participantRole
      participantStatus
      lastActivity
    }
    messages(limit: $messageLimit) {
      messageId
      senderId
      senderName
      messageType
      messageContent {
        text
        formattedText
        mentions
        hashtags
      }
      sentAt
      aiAnalysis {
        sentiment {
          overallSentiment
          sentimentScore
          confidence
        }
        topicsExtracted {
          topic
          confidence
          keywords
        }
        actionItemsDetected {
          actionItem
          assignedTo
          priority
          dueDate
        }
      }
      reactions {
        reactionType
        participantId
        reactedAt
      }
    }
    aiConfiguration {
      conversationIntelligence {
        enabled
        sentimentAnalysis
        topicExtraction
        decisionTracking
      }
      automatedResponses {
        enabled
        responseTypes
        triggerConditions
      }
    }
  }
}
```

### **Mutation Operations**

#### **Create Dialog**
```graphql
mutation CreateDialog($input: CreateDialogInput!) {
  createDialog(input: $input) {
    dialog {
      dialogId
      dialogName
      dialogType
      dialogStatus
      createdAt
      participants {
        participantId
        participantStatus
        joinedAt
      }
      dialogUrls {
        webInterface
        apiEndpoint
        websocketEndpoint
      }
    }
  }
}
```

#### **Send Message**
```graphql
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    message {
      messageId
      dialogId
      senderId
      messageType
      messageStatus
      sentAt
      aiAnalysis {
        sentiment {
          overallSentiment
          sentimentScore
        }
        topicsExtracted {
          topic
          confidence
        }
        actionItemsDetected {
          actionItem
          assignedTo
          dueDate
        }
      }
      smartSuggestions {
        suggestionType
        suggestionTitle
        suggestionDescription
        relevanceScore
      }
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Real-time Message Updates**

```javascript
// Subscribe to dialog messages
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'dialogs.dialog-workflow-001.messages'
}));

// Receive new messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'message_received') {
    console.log('New message:', message.data);
  }
};
```

### **Real-time AI Analysis**

```javascript
// Subscribe to AI analysis updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'dialogs.dialog-workflow-001.ai_analysis'
}));

// Receive AI analysis results
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'ai_analysis_completed') {
    console.log('AI analysis:', message.data);
  }
};
```

---

## 🔗 Related Documentation

- [Dialog Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**API Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Enterprise Ready  

**⚠️ Alpha Notice**: The Dialog Module API provides enterprise-grade conversation management capabilities in Alpha release. Additional AI-powered conversation orchestration and advanced dialog analytics features will be added in Beta release while maintaining backward compatibility.

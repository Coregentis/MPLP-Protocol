# Confirm模块API参考

> **🌐 语言导航**: [English](../../../en/modules/confirm/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Confirm模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Confirm-green.svg)](./README.md)
[![工作流](https://img.shields.io/badge/workflow-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/confirm/api-reference.md)

---

## 🎯 API概览

Confirm模块为企业级审批工作流、决策管理和共识机制提供全面的REST、GraphQL和WebSocket API。所有API都遵循MPLP协议标准，并提供高级工作流自动化功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/confirm`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/confirm`

### **身份验证**
所有API端点都需要使用JWT Bearer令牌进行身份验证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **审批工作流端点**

#### **创建审批请求**
```http
POST /api/v1/confirm/approvals
Content-Type: application/json
Authorization: Bearer <token>

{
  "request_type": "budget_approval",
  "title": "Q4营销活动预算",
  "description": "Q4营销活动预算分配需要审批",
  "priority": "high",
  "urgency": "normal",
  "context_id": "ctx-marketing-001",
  "subject": {
    "subject_type": "budget_allocation",
    "subject_id": "budget-q4-marketing",
    "amount": 500000,
    "currency": "USD",
    "category": "marketing_expenses",
    "fiscal_year": "2025",
    "quarter": "Q4"
  },
  "approval_criteria": {
    "required_approvals": 2,
    "approval_threshold": "majority",
    "escalation_rules": {
      "timeout_hours": 48,
      "escalation_levels": ["manager", "director", "vp"],
      "auto_escalate": true
    }
  },
  "workflow_definition": {
    "workflow_id": "wf-budget-approval-001",
    "steps": [
      {
        "step_name": "经理审批",
        "step_type": "human_approval",
        "approver_role": "direct_manager",
        "required": true,
        "timeout_hours": 24
      },
      {
        "step_name": "财务审查",
        "step_type": "human_approval",
        "approver_role": "finance_manager",
        "required": true,
        "timeout_hours": 24,
        "parallel": true
      }
    ]
  },
  "attachments": [
    {
      "filename": "budget_proposal.pdf",
      "file_type": "application/pdf",
      "file_size": 2048576,
      "checksum": "sha256:abc123..."
    }
  ],
  "metadata": {
    "department": "marketing",
    "cost_center": "MKT-001",
    "business_justification": "增加Q4市场份额",
    "expected_roi": 2.5,
    "risk_level": "medium"
  }
}
```

**响应 (201 Created):**
```json
{
  "approval_id": "approval-q4-marketing-001",
  "request_type": "budget_approval",
  "title": "Q4营销活动预算",
  "status": "pending",
  "current_step": "经理审批",
  "created_at": "2025-09-03T10:00:00.000Z",
  "created_by": "user-marketing-manager",
  "workflow": {
    "workflow_id": "wf-budget-approval-001",
    "total_steps": 2,
    "completed_steps": 0,
    "current_step_index": 0,
    "estimated_completion": "2025-09-05T10:00:00.000Z"
  },
  "approvers": [
    {
      "step_name": "经理审批",
      "approver_id": "user-direct-manager",
      "approver_name": "张经理",
      "approver_email": "zhang.manager@company.com",
      "status": "pending",
      "assigned_at": "2025-09-03T10:00:00.000Z",
      "due_date": "2025-09-04T10:00:00.000Z"
    },
    {
      "step_name": "财务审查",
      "approver_id": "user-finance-manager",
      "approver_name": "李财务",
      "approver_email": "li.finance@company.com",
      "status": "waiting",
      "parallel": true
    }
  ],
  "subject": {
    "subject_type": "budget_allocation",
    "subject_id": "budget-q4-marketing",
    "amount": 500000,
    "currency": "USD",
    "category": "marketing_expenses"
  },
  "tracking": {
    "approval_url": "https://app.mplp.dev/approvals/approval-q4-marketing-001",
    "status_endpoint": "/api/v1/confirm/approvals/approval-q4-marketing-001/status",
    "webhook_url": "https://api.mplp.dev/webhooks/approval-status-changed"
  },
  "notifications": {
    "email_sent": true,
    "slack_notification": true,
    "dashboard_notification": true
  }
}
```

#### **处理审批决策**
```http
POST /api/v1/confirm/approvals/{approval_id}/decisions
Content-Type: application/json
Authorization: Bearer <token>

{
  "decision": "approved",
  "decision_rationale": "预算分配合理，符合Q4营销策略目标",
  "approver_id": "user-direct-manager",
  "step_name": "经理审批",
  "conditions": [
    {
      "condition_type": "budget_limit",
      "condition_value": 450000,
      "condition_description": "建议将预算控制在45万美元以内"
    }
  ],
  "comments": [
    {
      "comment_type": "approval_note",
      "comment_text": "建议重点关注数字营销渠道的ROI",
      "visibility": "all_approvers"
    }
  ],
  "attachments": [
    {
      "filename": "manager_review_notes.pdf",
      "file_type": "application/pdf",
      "file_size": 1024000
    }
  ],
  "metadata": {
    "approval_timestamp": "2025-09-03T14:30:00.000Z",
    "approval_location": "office",
    "approval_method": "web_interface",
    "risk_assessment": "low",
    "compliance_check": "passed"
  }
}
```

**响应 (200 OK):**
```json
{
  "decision_id": "decision-manager-001",
  "approval_id": "approval-q4-marketing-001",
  "decision": "approved",
  "decision_status": "recorded",
  "processed_at": "2025-09-03T14:30:00.000Z",
  "approver": {
    "approver_id": "user-direct-manager",
    "approver_name": "张经理",
    "step_name": "经理审批"
  },
  "workflow_impact": {
    "current_step_completed": true,
    "next_step": "财务审查",
    "next_step_activated": true,
    "workflow_status": "in_progress",
    "completion_percentage": 50
  },
  "next_actions": [
    {
      "action_type": "notify_next_approver",
      "target_approver": "user-finance-manager",
      "notification_sent": true,
      "due_date": "2025-09-04T14:30:00.000Z"
    }
  ],
  "audit_trail": {
    "decision_recorded": true,
    "audit_log_id": "audit-decision-001",
    "compliance_logged": true,
    "notification_history": [
      {
        "notification_type": "email",
        "recipient": "user-finance-manager",
        "sent_at": "2025-09-03T14:31:00.000Z",
        "status": "delivered"
      }
    ]
  },
  "conditions_applied": [
    {
      "condition_type": "budget_limit",
      "condition_value": 450000,
      "applied_to_workflow": true,
      "validation_required": true
    }
  ]
}
```

#### **获取审批状态**
```http
GET /api/v1/confirm/approvals/{approval_id}/status
Authorization: Bearer <token>
```

**响应 (200 OK):**
```json
{
  "approval_id": "approval-q4-marketing-001",
  "status": "in_progress",
  "current_step": "财务审查",
  "progress": {
    "total_steps": 2,
    "completed_steps": 1,
    "current_step_index": 1,
    "completion_percentage": 50
  },
  "timeline": {
    "created_at": "2025-09-03T10:00:00.000Z",
    "first_approval_at": "2025-09-03T14:30:00.000Z",
    "estimated_completion": "2025-09-04T14:30:00.000Z",
    "actual_completion": null,
    "total_elapsed_hours": 4.5,
    "remaining_estimated_hours": 24
  },
  "approvers_status": [
    {
      "step_name": "经理审批",
      "approver_id": "user-direct-manager",
      "status": "approved",
      "decision_at": "2025-09-03T14:30:00.000Z",
      "decision": "approved",
      "conditions": ["budget_limit: 450000"]
    },
    {
      "step_name": "财务审查",
      "approver_id": "user-finance-manager",
      "status": "pending",
      "assigned_at": "2025-09-03T14:31:00.000Z",
      "due_date": "2025-09-04T14:30:00.000Z",
      "time_remaining_hours": 23.5
    }
  ],
  "escalation_status": {
    "escalation_triggered": false,
    "escalation_level": 0,
    "next_escalation_at": "2025-09-04T14:30:00.000Z"
  },
  "notifications": {
    "last_notification_sent": "2025-09-03T14:31:00.000Z",
    "notification_count": 2,
    "pending_notifications": 0
  }
}
```

---

## 🔍 GraphQL API参考

### **Schema定义**

```graphql
type Approval {
  approvalId: ID!
  requestType: String!
  title: String!
  description: String
  status: ApprovalStatus!
  priority: Priority!
  urgency: Urgency!
  createdAt: DateTime!
  createdBy: ID!
  updatedAt: DateTime!
  currentStep: String
  workflow: ApprovalWorkflow!
  approvers: [ApprovalStep!]!
  subject: ApprovalSubject!
  decisions: [ApprovalDecision!]!
  auditTrail: [AuditEntry!]!
  metadata: ApprovalMetadata
}

type ApprovalWorkflow {
  workflowId: ID!
  totalSteps: Int!
  completedSteps: Int!
  currentStepIndex: Int!
  estimatedCompletion: DateTime
  steps: [WorkflowStep!]!
}

type ApprovalStep {
  stepName: String!
  approverId: ID!
  approverName: String!
  approverEmail: String!
  status: StepStatus!
  assignedAt: DateTime
  dueDate: DateTime
  completedAt: DateTime
  decision: ApprovalDecision
}

enum ApprovalStatus {
  PENDING
  IN_PROGRESS
  APPROVED
  REJECTED
  CANCELLED
  ESCALATED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum StepStatus {
  WAITING
  PENDING
  APPROVED
  REJECTED
  ESCALATED
  TIMEOUT
}
```

### **查询操作**

#### **获取审批详情**
```graphql
query GetApproval($approvalId: ID!, $includeAuditTrail: Boolean = false) {
  approval(approvalId: $approvalId) {
    approvalId
    title
    status
    priority
    createdAt
    currentStep
    workflow {
      workflowId
      totalSteps
      completedSteps
      estimatedCompletion
    }
    approvers {
      stepName
      approverName
      status
      dueDate
      decision {
        decision
        decisionRationale
        processedAt
      }
    }
    subject {
      subjectType
      subjectId
      amount
      currency
    }
    auditTrail @include(if: $includeAuditTrail) {
      eventType
      eventDescription
      timestamp
      userId
    }
  }
}
```

---

## 🔌 WebSocket API参考

### **实时审批状态更新**

```javascript
// 订阅审批状态更新
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'approval.approval-q4-marketing-001.status'
}));

// 接收状态更新
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'approval_status_update') {
    console.log('审批状态更新:', message.data);
  }
};
```

---

## 🔗 相关文档

- [Confirm模块概览](./README.md) - 模块概览和架构
- [协议规范](./protocol-specification.md) - 协议规范
- [实施指南](./implementation-guide.md) - 实施指南
- [配置指南](./configuration-guide.md) - 配置选项
- [测试指南](./testing-guide.md) - 测试策略
- [性能指南](./performance-guide.md) - 性能优化
- [集成示例](./integration-examples.md) - 集成示例

---

**API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业就绪  

**⚠️ Alpha版本说明**: Confirm模块API在Alpha版本中提供企业级审批工作流和决策管理能力。额外的高级工作流功能和智能审批特性将在Beta版本中添加，同时保持向后兼容性。

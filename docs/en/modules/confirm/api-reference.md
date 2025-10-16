# Confirm Module API Reference

> **🌐 Language Navigation**: [English](api-reference.md) | [中文](../../../zh-CN/modules/confirm/api-reference.md)



**Multi-Agent Protocol Lifecycle Platform - Confirm Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Confirm-green.svg)](./README.md)
[![Workflow](https://img.shields.io/badge/workflow-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/confirm/api-reference.md)

---

## 🎯 API Overview

The Confirm Module provides comprehensive REST, GraphQL, and WebSocket APIs for enterprise-grade approval workflows, decision management, and consensus mechanisms. All APIs follow MPLP protocol standards and provide advanced workflow automation features.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/confirm`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/confirm`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API Reference

### **Approval Workflow Endpoints**

#### **Create Approval Request**
```http
POST /api/v1/confirm/approvals
Content-Type: application/json
Authorization: Bearer <token>

{
  "request_type": "budget_approval",
  "title": "Q4 Marketing Campaign Budget",
  "description": "Approval required for Q4 marketing campaign budget allocation",
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
        "step_name": "Manager Approval",
        "step_type": "human_approval",
        "approver_role": "direct_manager",
        "required": true,
        "timeout_hours": 24
      },
      {
        "step_name": "Finance Review",
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
    "business_justification": "Increase market share in Q4",
    "expected_roi": 2.5,
    "risk_level": "medium"
  }
}
```

**Response (201 Created):**
```json
{
  "request_id": "req-001",
  "request_type": "budget_approval",
  "title": "Q4 Marketing Campaign Budget",
  "status": "submitted",
  "priority": "high",
  "urgency": "normal",
  "requested_by": "user-001",
  "requested_at": "2025-09-03T10:00:00.000Z",
  "context_id": "ctx-marketing-001",
  "workflow_execution": {
    "execution_id": "exec-001",
    "workflow_id": "wf-budget-approval-001",
    "current_step": "step-001",
    "status": "in_progress",
    "estimated_completion": "2025-09-05T10:00:00.000Z"
  },
  "approval_route": {
    "route_id": "route-001",
    "total_steps": 2,
    "current_step_index": 0,
    "next_approvers": [
      {
        "approver_id": "manager-001",
        "approver_name": "John Manager",
        "approver_role": "direct_manager",
        "step_name": "Manager Approval",
        "due_date": "2025-09-04T10:00:00.000Z"
      }
    ]
  },
  "audit_trail": {
    "created_at": "2025-09-03T10:00:00.000Z",
    "created_by": "user-001",
    "initial_state": "submitted",
    "audit_id": "audit-001"
  }
}
```

#### **Submit Approval Decision**
```http
POST /api/v1/confirm/approvals/{request_id}/decisions
Content-Type: application/json
Authorization: Bearer <token>

{
  "step_id": "step-001",
  "decision": "approved",
  "decision_rationale": "Budget allocation aligns with Q4 strategic objectives",
  "conditions": [
    {
      "condition": "monthly_reporting",
      "description": "Provide monthly spend reports to finance team",
      "required": true
    }
  ],
  "recommendations": [
    {
      "type": "optimization",
      "description": "Consider A/B testing for digital ad campaigns",
      "priority": "medium"
    }
  ],
  "risk_assessment": {
    "risk_level": "low",
    "risk_factors": [
      {
        "factor": "market_volatility",
        "impact": "medium",
        "probability": "low",
        "mitigation": "flexible_budget_allocation"
      }
    ]
  },
  "supporting_documents": ["att-001"],
  "consultation_notes": "Discussed with finance team regarding budget impact"
}
```

**Response (200 OK):**
```json
{
  "decision_id": "dec-001",
  "request_id": "req-001",
  "step_id": "step-001",
  "approver_id": "manager-001",
  "decision": "approved",
  "decision_timestamp": "2025-09-03T14:30:00.000Z",
  "workflow_status": {
    "current_step": "step-002",
    "status": "in_progress",
    "progress_percentage": 50,
    "next_approvers": [
      {
        "approver_id": "finance-001",
        "approver_name": "Jane Finance",
        "approver_role": "finance_manager",
        "step_name": "Finance Review",
        "due_date": "2025-09-04T14:30:00.000Z"
      }
    ]
  },
  "conditions_applied": [
    {
      "condition": "monthly_reporting",
      "status": "active",
      "due_date": "2025-10-03T00:00:00.000Z"
    }
  ],
  "audit_trail": {
    "decision_recorded_at": "2025-09-03T14:30:00.000Z",
    "audit_id": "audit-002",
    "previous_state": "pending_approval",
    "new_state": "in_progress"
  }
}
```

#### **Get Approval Status**
```http
GET /api/v1/confirm/approvals/{request_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "request_id": "req-001",
  "title": "Q4 Marketing Campaign Budget",
  "status": "approved",
  "priority": "high",
  "requested_by": "user-001",
  "requested_at": "2025-09-03T10:00:00.000Z",
  "completed_at": "2025-09-03T16:45:00.000Z",
  "total_processing_time": "6h 45m",
  "workflow_execution": {
    "execution_id": "exec-001",
    "status": "completed",
    "steps_completed": 2,
    "total_steps": 2,
    "completion_percentage": 100
  },
  "approval_decisions": [
    {
      "decision_id": "dec-001",
      "step_name": "Manager Approval",
      "approver_name": "John Manager",
      "decision": "approved",
      "decision_timestamp": "2025-09-03T14:30:00.000Z",
      "processing_time": "4h 30m"
    },
    {
      "decision_id": "dec-002",
      "step_name": "Finance Review",
      "approver_name": "Jane Finance",
      "decision": "approved",
      "decision_timestamp": "2025-09-03T16:45:00.000Z",
      "processing_time": "2h 15m"
    }
  ],
  "final_outcome": {
    "decision": "approved",
    "effective_date": "2025-09-03T16:45:00.000Z",
    "conditions": [
      {
        "condition": "monthly_reporting",
        "status": "active",
        "compliance_required": true
      }
    ],
    "budget_allocated": {
      "amount": 500000,
      "currency": "USD",
      "allocation_date": "2025-09-03T16:45:00.000Z",
      "budget_code": "MKT-Q4-2025-001"
    }
  },
  "compliance_status": {
    "sox_compliant": true,
    "audit_trail_complete": true,
    "documentation_complete": true,
    "approval_chain_verified": true
  }
}
```

### **Workflow Management Endpoints**

#### **Create Workflow Template**
```http
POST /api/v1/confirm/workflows
Content-Type: application/json
Authorization: Bearer <token>

{
  "workflow_name": "Enterprise Budget Approval",
  "workflow_description": "Multi-level approval process for enterprise budget requests",
  "workflow_category": "financial",
  "trigger_conditions": {
    "request_type": "budget_approval",
    "amount_threshold": 100000,
    "department": ["marketing", "sales", "operations"]
  },
  "steps": [
    {
      "step_name": "Department Manager Review",
      "step_type": "human_approval",
      "approver_selection": {
        "method": "role_based",
        "role": "department_manager",
        "fallback_role": "senior_manager"
      },
      "requirements": {
        "required": true,
        "timeout_hours": 24,
        "escalation_enabled": true
      },
      "conditions": {
        "skip_if": "amount < 50000",
        "parallel_with": null
      }
    },
    {
      "step_name": "Finance Team Review",
      "step_type": "human_approval",
      "approver_selection": {
        "method": "role_based",
        "role": "finance_manager",
        "require_certification": ["CPA", "MBA_Finance"]
      },
      "requirements": {
        "required": true,
        "timeout_hours": 48,
        "parallel_execution": true
      }
    },
    {
      "step_name": "Executive Approval",
      "step_type": "human_approval",
      "approver_selection": {
        "method": "role_based",
        "role": "executive_team",
        "minimum_level": "director"
      },
      "requirements": {
        "required": true,
        "timeout_hours": 72,
        "conditions": ["amount > 250000"]
      }
    }
  ],
  "escalation_rules": {
    "global_timeout_hours": 168,
    "escalation_chain": ["senior_manager", "director", "vp", "ceo"],
    "auto_escalate_on_timeout": true,
    "notification_intervals": [24, 48, 72]
  },
  "compliance_requirements": {
    "audit_trail": "complete",
    "documentation": "required",
    "approval_evidence": "digital_signature",
    "retention_period_years": 7
  },
  "metadata": {
    "created_by": "admin-001",
    "version": "1.0",
    "effective_date": "2025-09-03T00:00:00.000Z",
    "review_frequency": "quarterly"
  }
}
```

**Response (201 Created):**
```json
{
  "workflow_id": "wf-enterprise-budget-001",
  "workflow_name": "Enterprise Budget Approval",
  "version": "1.0",
  "status": "active",
  "created_at": "2025-09-03T10:00:00.000Z",
  "created_by": "admin-001",
  "steps_count": 3,
  "estimated_duration": {
    "min_hours": 24,
    "max_hours": 168,
    "average_hours": 72
  },
  "usage_statistics": {
    "total_executions": 0,
    "success_rate": 0,
    "average_completion_time": null
  },
  "compliance_features": {
    "audit_enabled": true,
    "digital_signatures": true,
    "retention_policy": "7_years",
    "sox_compliant": true
  }
}
```

### **Consensus Management Endpoints**

#### **Initiate Consensus Process**
```http
POST /api/v1/confirm/consensus
Content-Type: application/json
Authorization: Bearer <token>

{
  "consensus_type": "multi_party_agreement",
  "title": "Technology Stack Selection",
  "description": "Consensus required for selecting the technology stack for the new project",
  "context_id": "ctx-project-001",
  "subject": {
    "subject_type": "technology_decision",
    "subject_id": "tech-stack-selection-001",
    "options": [
      {
        "option_id": "opt-001",
        "name": "React + Node.js",
        "description": "Modern JavaScript stack with React frontend and Node.js backend",
        "pros": ["Fast development", "Large community", "Good performance"],
        "cons": ["JavaScript complexity", "Rapid ecosystem changes"],
        "estimated_cost": 150000,
        "timeline_months": 8
      },
      {
        "option_id": "opt-002",
        "name": "Angular + .NET",
        "description": "Enterprise stack with Angular frontend and .NET backend",
        "pros": ["Enterprise ready", "Strong typing", "Microsoft support"],
        "cons": ["Steeper learning curve", "Higher licensing costs"],
        "estimated_cost": 200000,
        "timeline_months": 10
      }
    ]
  },
  "participants": [
    {
      "participant_id": "tech-lead-001",
      "participant_name": "Alice Tech Lead",
      "participant_role": "technical_lead",
      "voting_weight": 2.0,
      "expertise_areas": ["frontend", "architecture"]
    },
    {
      "participant_id": "dev-001",
      "participant_name": "Bob Developer",
      "participant_role": "senior_developer",
      "voting_weight": 1.0,
      "expertise_areas": ["backend", "database"]
    },
    {
      "participant_id": "pm-001",
      "participant_name": "Carol PM",
      "participant_role": "project_manager",
      "voting_weight": 1.5,
      "expertise_areas": ["project_management", "stakeholder_relations"]
    }
  ],
  "consensus_rules": {
    "algorithm": "weighted_majority",
    "threshold": 0.67,
    "minimum_participation": 0.8,
    "timeout_hours": 72,
    "allow_abstention": true,
    "require_justification": true
  },
  "evaluation_criteria": [
    {
      "criterion": "technical_feasibility",
      "weight": 0.3,
      "description": "How technically feasible is this option?"
    },
    {
      "criterion": "cost_effectiveness",
      "weight": 0.25,
      "description": "What is the cost-benefit ratio?"
    },
    {
      "criterion": "timeline_impact",
      "weight": 0.25,
      "description": "How does this affect project timeline?"
    },
    {
      "criterion": "team_expertise",
      "weight": 0.2,
      "description": "How well does this match team expertise?"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "consensus_id": "cons-001",
  "title": "Technology Stack Selection",
  "status": "active",
  "created_at": "2025-09-03T10:00:00.000Z",
  "expires_at": "2025-09-06T10:00:00.000Z",
  "participants_count": 3,
  "options_count": 2,
  "consensus_progress": {
    "votes_received": 0,
    "votes_required": 3,
    "participation_rate": 0.0,
    "consensus_threshold": 0.67,
    "current_consensus": null
  },
  "voting_status": {
    "voting_open": true,
    "voting_deadline": "2025-09-06T10:00:00.000Z",
    "reminder_schedule": [
      "2025-09-04T10:00:00.000Z",
      "2025-09-05T10:00:00.000Z",
      "2025-09-06T08:00:00.000Z"
    ]
  },
  "evaluation_framework": {
    "criteria_count": 4,
    "weighted_scoring": true,
    "justification_required": true,
    "anonymous_voting": false
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type ApprovalRequest {
  requestId: ID!
  requestType: String!
  title: String!
  description: String
  status: ApprovalStatus!
  priority: Priority!
  urgency: Urgency!
  requestedBy: ID!
  requestedAt: DateTime!
  contextId: ID
  subject: ApprovalSubject!
  workflowExecution: WorkflowExecution
  approvalRoute: ApprovalRoute
  decisions: [ApprovalDecision!]!
  auditTrail: [AuditEntry!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ApprovalDecision {
  decisionId: ID!
  requestId: ID!
  stepId: ID!
  approverId: ID!
  approverRole: String!
  decision: DecisionType!
  decisionTimestamp: DateTime!
  decisionRationale: String
  conditions: [ApprovalCondition!]
  recommendations: [Recommendation!]
  riskAssessment: RiskAssessment
  auditTrail: AuditEntry!
}

type WorkflowExecution {
  executionId: ID!
  workflowId: ID!
  status: ExecutionStatus!
  currentStep: String
  stepsCompleted: Int!
  totalSteps: Int!
  estimatedCompletion: DateTime
  actualCompletion: DateTime
  processingTime: Duration
}

type ConsensusProcess {
  consensusId: ID!
  title: String!
  description: String
  status: ConsensusStatus!
  consensusType: String!
  participants: [ConsensusParticipant!]!
  options: [ConsensusOption!]!
  votes: [ConsensusVote!]!
  result: ConsensusResult
  createdAt: DateTime!
  expiresAt: DateTime
}

enum ApprovalStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  PENDING_APPROVAL
  IN_PROGRESS
  ESCALATED
  APPROVED
  REJECTED
  COMPLETED
  CANCELLED
  TIMEOUT
  ARCHIVED
}

enum DecisionType {
  APPROVED
  REJECTED
  CONDITIONAL_APPROVAL
  DEFERRED
  ESCALATED
  ABSTAINED
}

enum Priority {
  LOW
  NORMAL
  HIGH
  CRITICAL
  EMERGENCY
}

enum Urgency {
  LOW
  NORMAL
  HIGH
  URGENT
  IMMEDIATE
}
```

### **Query Operations**

#### **Get Approval Request Details**
```graphql
query GetApprovalRequest($requestId: ID!) {
  approvalRequest(requestId: $requestId) {
    requestId
    title
    status
    priority
    urgency
    requestedBy
    requestedAt
    subject {
      subjectType
      subjectId
      amount
      currency
    }
    workflowExecution {
      executionId
      status
      currentStep
      stepsCompleted
      totalSteps
      estimatedCompletion
    }
    decisions {
      decisionId
      approverId
      decision
      decisionTimestamp
      decisionRationale
      conditions {
        condition
        description
        required
      }
    }
    auditTrail {
      auditId
      action
      timestamp
      userId
      details
    }
  }
}
```

#### **Get User's Pending Approvals**
```graphql
query GetPendingApprovals($userId: ID!, $limit: Int, $offset: Int) {
  user(userId: $userId) {
    pendingApprovals(limit: $limit, offset: $offset) {
      requestId
      title
      priority
      urgency
      requestedBy
      requestedAt
      dueDate
      stepName
      estimatedProcessingTime
      subject {
        subjectType
        amount
        currency
      }
    }
  }
}
```

### **Mutation Operations**

#### **Submit Approval Decision**
```graphql
mutation SubmitApprovalDecision($input: ApprovalDecisionInput!) {
  submitApprovalDecision(input: $input) {
    decision {
      decisionId
      decision
      decisionTimestamp
    }
    workflowStatus {
      currentStep
      status
      nextApprovers {
        approverId
        approverName
        stepName
        dueDate
      }
    }
    auditTrail {
      auditId
      action
      timestamp
    }
  }
}
```

#### **Create Consensus Process**
```graphql
mutation CreateConsensusProcess($input: ConsensusProcessInput!) {
  createConsensusProcess(input: $input) {
    consensusProcess {
      consensusId
      title
      status
      participantsCount
      optionsCount
      expiresAt
      votingStatus {
        votingOpen
        votingDeadline
        participationRate
      }
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Real-time Approval Updates**

```javascript
// Subscribe to approval status updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'approvals.req-001.updates'
}));

// Receive approval status updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'approval_status_updated') {
    console.log('Approval status updated:', message.data);
  }
};
```

### **Real-time Consensus Updates**

```javascript
// Subscribe to consensus process updates
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'consensus.cons-001.updates'
}));

// Receive consensus updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'consensus_vote_received') {
    console.log('New vote received:', message.data);
  }
};
```

---

## 🔗 Related Documentation

- [Confirm Module Overview](./README.md) - Module overview and architecture
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

**⚠️ Alpha Notice**: The Confirm Module API provides enterprise-grade approval workflow capabilities in Alpha release. Additional AI-powered decision support and advanced consensus features will be added in Beta release while maintaining backward compatibility.

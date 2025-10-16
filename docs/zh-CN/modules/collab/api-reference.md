# Collab模块API参考

> **🌐 语言导航**: [English](../../../en/modules/collab/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Collab模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Collab-purple.svg)](./README.md)
[![协作](https://img.shields.io/badge/collaboration-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/collab/api-reference.md)

---

## 🎯 API概览

Collab模块为企业级多智能体协作、智能协调编排和分布式决策制定系统提供全面的REST、GraphQL和WebSocket API。所有API都遵循MPLP协议标准，并提供高级协作智能功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/collaboration`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/collaboration`

### **身份验证**
所有API端点都需要使用JWT Bearer令牌进行身份验证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **协作管理端点**

#### **创建协作会话**
```http
POST /api/v1/collaboration/sessions
Content-Type: application/json
Authorization: Bearer <token>

{
  "collaboration_id": "collab-project-alpha-001",
  "collaboration_name": "项目Alpha多智能体协调",
  "collaboration_type": "multi_agent_coordination",
  "collaboration_category": "project_management",
  "collaboration_description": "项目Alpha开发的协调多智能体协作，具有AI驱动的决策支持和资源优化",
  "participants": [
    {
      "participant_id": "agent-dev-001",
      "participant_type": "ai_agent",
      "participant_role": "development_coordinator",
      "participant_name": "开发协调代理",
      "agent_capabilities": [
        "task_scheduling",
        "resource_allocation",
        "progress_tracking",
        "quality_assurance",
        "risk_assessment"
      ],
      "collaboration_permissions": [
        "coordinate_tasks",
        "allocate_resources",
        "make_decisions",
        "escalate_issues",
        "generate_reports"
      ],
      "decision_authority": {
        "autonomous_decisions": ["task_assignment", "resource_reallocation"],
        "approval_required": ["budget_changes", "timeline_modifications"],
        "escalation_triggers": ["critical_issues", "resource_conflicts"]
      }
    },
    {
      "participant_id": "agent-qa-001",
      "participant_type": "ai_agent",
      "participant_role": "quality_assurance_specialist",
      "participant_name": "质量保证代理",
      "agent_capabilities": [
        "quality_monitoring",
        "test_coordination",
        "defect_analysis",
        "compliance_checking",
        "performance_evaluation"
      ],
      "collaboration_permissions": [
        "review_deliverables",
        "approve_quality_gates",
        "reject_substandard_work",
        "recommend_improvements",
        "escalate_quality_issues"
      ],
      "quality_standards": {
        "minimum_quality_threshold": 0.95,
        "compliance_requirements": ["iso_9001", "cmmi_level_3"],
        "testing_coverage_minimum": 0.90
      }
    },
    {
      "participant_id": "human-pm-001",
      "participant_type": "human",
      "participant_role": "project_manager",
      "participant_name": "陈莎拉",
      "participant_email": "sarah.chen@company.com",
      "collaboration_permissions": [
        "oversee_collaboration",
        "make_strategic_decisions",
        "approve_major_changes",
        "resolve_conflicts",
        "communicate_with_stakeholders"
      ],
      "oversight_preferences": {
        "notification_frequency": "real_time",
        "decision_involvement": "strategic_only",
        "escalation_threshold": "high_priority",
        "reporting_schedule": "daily_summary"
      }
    }
  ],
  "collaboration_configuration": {
    "max_participants": 20,
    "coordination_style": "hierarchical_with_consensus",
    "decision_making_model": "weighted_voting",
    "conflict_resolution": "ai_mediated",
    "real_time_coordination": true,
    "async_collaboration": true,
    "resource_sharing": true,
    "knowledge_sharing": true,
    "progress_tracking": true,
    "performance_monitoring": true
  },
  "ai_coordination": {
    "coordination_intelligence": {
      "enabled": true,
      "coordination_model": "multi_agent_orchestration",
      "decision_support": true,
      "conflict_detection": true,
      "resource_optimization": true,
      "performance_prediction": true
    },
    "automated_coordination": {
      "enabled": true,
      "coordination_triggers": [
        "task_dependencies_ready",
        "resource_availability_changed",
        "deadline_approaching",
        "quality_gate_reached",
        "conflict_detected"
      ],
      "coordination_actions": [
        "task_reassignment",
        "resource_reallocation",
        "priority_adjustment",
        "timeline_optimization",
        "stakeholder_notification"
      ]
    },
    "intelligent_recommendations": {
      "enabled": true,
      "recommendation_types": [
        "task_optimization",
        "resource_allocation",
        "timeline_adjustments",
        "quality_improvements",
        "risk_mitigation"
      ],
      "proactive_recommendations": true,
      "recommendation_confidence_threshold": 0.8
    }
  },
  "workflow_integration": {
    "context_id": "ctx-project-alpha",
    "plan_id": "plan-alpha-development",
    "dialog_id": "dialog-alpha-coordination",
    "trace_enabled": true,
    "milestone_synchronization": true,
    "cross_module_events": true
  },
  "performance_targets": {
    "coordination_efficiency": 0.95,
    "decision_speed": "< 5分钟",
    "conflict_resolution_time": "< 30分钟",
    "resource_utilization": 0.85,
    "quality_maintenance": 0.98
  },
  "metadata": {
    "project_context": {
      "project_name": "项目Alpha",
      "project_phase": "development",
      "project_priority": "high",
      "project_budget": 2000000,
      "project_timeline": "6个月"
    },
    "tags": ["multi-agent", "coordination", "development", "ai-powered"],
    "expected_duration_days": 180,
    "success_criteria": [
      "all_milestones_achieved",
      "quality_standards_met",
      "budget_within_limits",
      "timeline_adherence"
    ]
  }
}
```

**响应 (201 Created):**
```json
{
  "collaboration_id": "collab-project-alpha-001",
  "collaboration_name": "项目Alpha多智能体协调",
  "collaboration_type": "multi_agent_coordination",
  "collaboration_status": "active",
  "created_at": "2025-09-03T10:00:00.000Z",
  "created_by": "human-pm-001",
  "participants": [
    {
      "participant_id": "agent-dev-001",
      "participant_status": "active",
      "coordination_role": "primary_coordinator",
      "joined_at": "2025-09-03T10:00:00.000Z",
      "agent_readiness": "ready",
      "current_workload": 0.0
    },
    {
      "participant_id": "agent-qa-001",
      "participant_status": "active",
      "coordination_role": "quality_monitor",
      "joined_at": "2025-09-03T10:00:00.000Z",
      "agent_readiness": "ready",
      "current_workload": 0.0
    },
    {
      "participant_id": "human-pm-001",
      "participant_status": "active",
      "coordination_role": "strategic_overseer",
      "joined_at": "2025-09-03T10:00:00.000Z",
      "oversight_level": "strategic"
    }
  ],
  "coordination_framework": {
    "coordination_model": "hierarchical_with_consensus",
    "decision_making_active": true,
    "conflict_resolution_active": true,
    "resource_optimization_active": true,
    "performance_monitoring_active": true
  },
  "collaboration_urls": {
    "coordination_dashboard": "https://app.mplp.dev/collaboration/collab-project-alpha-001",
    "api_endpoint": "https://api.mplp.dev/v1/collaboration/collab-project-alpha-001",
    "websocket_endpoint": "wss://api.mplp.dev/ws/collaboration/collab-project-alpha-001",
    "real_time_monitoring": "https://monitor.mplp.dev/collaboration/collab-project-alpha-001"
  },
  "ai_services": {
    "coordination_intelligence": "enabled",
    "automated_coordination": "enabled",
    "intelligent_recommendations": "enabled",
    "conflict_resolution": "enabled",
    "performance_optimization": "enabled"
  },
  "initial_coordination_state": {
    "active_tasks": 0,
    "pending_decisions": 0,
    "resource_allocation": {},
    "coordination_efficiency": 1.0,
    "system_health": "optimal"
  }
}
```

---

## 🔍 GraphQL API参考

### **Schema定义**

```graphql
type Collaboration {
  collaborationId: ID!
  collaborationName: String!
  collaborationType: CollaborationType!
  collaborationCategory: String!
  collaborationDescription: String
  collaborationStatus: CollaborationStatus!
  createdAt: DateTime!
  createdBy: ID!
  updatedAt: DateTime!
  participants: [CollaborationParticipant!]!
  coordinationFramework: CoordinationFramework!
  aiCoordination: AICoordination
  workflowIntegration: WorkflowIntegration
  performanceMetrics: CollaborationPerformanceMetrics
  metadata: CollaborationMetadata
}

type CollaborationParticipant {
  participantId: ID!
  participantType: ParticipantType!
  participantRole: String!
  participantName: String!
  participantStatus: ParticipantStatus!
  agentCapabilities: [String!]
  collaborationPermissions: [String!]
  decisionAuthority: DecisionAuthority
  currentWorkload: Float
  performanceMetrics: ParticipantPerformanceMetrics
}

enum CollaborationType {
  MULTI_AGENT_COORDINATION
  DISTRIBUTED_DECISION_MAKING
  RESOURCE_OPTIMIZATION
  KNOWLEDGE_COLLABORATION
  WORKFLOW_ORCHESTRATION
  CONFLICT_RESOLUTION
}

enum CollaborationStatus {
  ACTIVE
  PAUSED
  COMPLETED
  SUSPENDED
  ARCHIVED
}
```

---

## 🔌 WebSocket API参考

### **实时协调更新**

```javascript
// 订阅协作协调事件
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'collaboration.collab-project-alpha-001.coordination'
}));

// 接收协调更新
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'coordination_update') {
    console.log('协调更新:', message.data);
  }
};
```

---

## 🔗 相关文档

- [Collab模块概览](./README.md) - 模块概览和架构
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

**⚠️ Alpha版本说明**: Collab模块API在Alpha版本中提供企业级多智能体协作能力。额外的AI驱动协调编排和高级分布式决策制定功能将在Beta版本中添加，同时保持向后兼容性。

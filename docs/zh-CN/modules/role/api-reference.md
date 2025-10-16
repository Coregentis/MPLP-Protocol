# Role模块API参考

> **🌐 语言导航**: [English](../../../en/modules/role/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Role模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Role-purple.svg)](./README.md)
[![RBAC](https://img.shields.io/badge/RBAC-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/role/api-reference.md)

---

## 🎯 API概览

Role模块提供全面的REST、GraphQL和WebSocket API，用于企业级基于角色的访问控制(RBAC)、权限管理和基于能力的授权。所有API遵循MPLP协议标准，提供先进的安全功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/roles`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/roles`

### **身份验证**
所有API端点都需要使用JWT Bearer令牌进行身份验证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **角色管理端点**

#### **创建角色**
```http
POST /api/v1/roles
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "project_manager",
  "display_name": "项目经理",
  "description": "管理项目规划和执行",
  "permissions": [
    "project:create",
    "project:read",
    "project:update",
    "project:delete",
    "team:manage",
    "plan:execute"
  ],
  "capabilities": [
    "strategic_planning",
    "team_leadership",
    "resource_management"
  ],
  "constraints": {
    "max_projects": 5,
    "max_team_size": 20,
    "budget_limit": 1000000
  },
  "metadata": {
    "department": "management",
    "level": "senior",
    "certification_required": true
  }
}
```

**响应 (201 Created):**
```json
{
  "role_id": "role-001",
  "name": "project_manager",
  "display_name": "项目经理",
  "description": "管理项目规划和执行",
  "permissions": [
    "project:create",
    "project:read",
    "project:update",
    "project:delete",
    "team:manage",
    "plan:execute"
  ],
  "capabilities": [
    "strategic_planning",
    "team_leadership",
    "resource_management"
  ],
  "constraints": {
    "max_projects": 5,
    "max_team_size": 20,
    "budget_limit": 1000000
  },
  "status": "active",
  "created_at": "2025-09-03T10:00:00.000Z",
  "updated_at": "2025-09-03T10:00:00.000Z"
}
```

#### **分配角色给用户**
```http
POST /api/v1/roles/{role_id}/assignments
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "assignment_type": "permanent",
  "effective_date": "2025-09-03T10:00:00.000Z",
  "expiration_date": "2026-09-03T10:00:00.000Z",
  "constraints": {
    "max_concurrent_projects": 3,
    "allowed_departments": ["engineering", "product"]
  },
  "justification": "用户具备项目管理经验和相关认证"
}
```

**响应 (201 Created):**
```json
{
  "assignment_id": "assign-001",
  "role_id": "role-001",
  "user_id": "user-001",
  "context_id": "ctx-001",
  "assignment_type": "permanent",
  "status": "active",
  "effective_date": "2025-09-03T10:00:00.000Z",
  "expiration_date": "2026-09-03T10:00:00.000Z",
  "constraints": {
    "max_concurrent_projects": 3,
    "allowed_departments": ["engineering", "product"]
  },
  "assigned_by": "admin-001",
  "assigned_at": "2025-09-03T10:00:00.000Z"
}
```

#### **检查权限**
```http
POST /api/v1/permissions/check
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-001",
  "resource": "project:proj-001",
  "action": "update",
  "context": {
    "context_id": "ctx-001",
    "environment": "production",
    "time_of_day": "business_hours",
    "location": "office",
    "additional_factors": {
      "project_phase": "execution",
      "urgency_level": "normal"
    }
  }
}
```

**响应 (200 OK):**
```json
{
  "permission_granted": true,
  "decision_reason": "用户具有project_manager角色，拥有project:update权限",
  "applicable_roles": [
    {
      "role_id": "role-001",
      "role_name": "project_manager",
      "permission_source": "direct_grant"
    }
  ],
  "constraints_applied": [
    {
      "constraint_type": "time_based",
      "constraint_value": "business_hours_only",
      "satisfied": true
    },
    {
      "constraint_type": "location_based",
      "constraint_value": "office_access_required",
      "satisfied": true
    }
  ],
  "evaluation_time_ms": 15,
  "cache_hit": true,
  "evaluated_at": "2025-09-03T10:05:00.000Z"
}
```

### **能力管理端点**

#### **匹配能力**
```http
POST /api/v1/capabilities/match
Content-Type: application/json
Authorization: Bearer <token>

{
  "required_capabilities": [
    {
      "capability": "machine_learning",
      "level": "advanced",
      "certification_required": true
    },
    {
      "capability": "data_analysis",
      "level": "intermediate",
      "experience_years": 3
    },
    {
      "capability": "python_programming",
      "level": "expert",
      "frameworks": ["tensorflow", "pytorch"]
    }
  ],
  "candidate_agents": [
    "agent-001",
    "agent-002",
    "agent-003"
  ],
  "matching_criteria": {
    "strict_matching": false,
    "allow_capability_substitution": true,
    "minimum_match_percentage": 80,
    "prefer_certified_capabilities": true
  }
}
```

**响应 (200 OK):**
```json
{
  "matches": [
    {
      "agent_id": "agent-001",
      "match_score": 95.5,
      "matched_capabilities": [
        {
          "capability": "machine_learning",
          "agent_level": "expert",
          "required_level": "advanced",
          "match_quality": "exceeds",
          "certifications": [
            {
              "certification_id": "cert-ml-001",
              "issuer": "AI Institute",
              "valid_until": "2026-12-31T23:59:59.000Z"
            }
          ]
        },
        {
          "capability": "data_analysis",
          "agent_level": "advanced",
          "required_level": "intermediate",
          "match_quality": "exceeds",
          "experience_years": 5
        },
        {
          "capability": "python_programming",
          "agent_level": "expert",
          "required_level": "expert",
          "match_quality": "exact",
          "frameworks": ["tensorflow", "pytorch", "scikit-learn"]
        }
      ],
      "missing_capabilities": [],
      "recommendation": "强烈推荐 - 所有能力都超过要求"
    },
    {
      "agent_id": "agent-002",
      "match_score": 82.3,
      "matched_capabilities": [
        {
          "capability": "machine_learning",
          "agent_level": "advanced",
          "required_level": "advanced",
          "match_quality": "exact",
          "certifications": []
        },
        {
          "capability": "data_analysis",
          "agent_level": "intermediate",
          "required_level": "intermediate",
          "match_quality": "exact",
          "experience_years": 3
        }
      ],
      "missing_capabilities": [
        {
          "capability": "python_programming",
          "required_level": "expert",
          "gap_analysis": "需要提升编程技能到专家级别"
        }
      ],
      "recommendation": "条件推荐 - 需要额外的编程培训"
    }
  ],
  "matching_summary": {
    "total_candidates": 3,
    "qualified_candidates": 2,
    "best_match": "agent-001",
    "average_match_score": 88.9
  }
}
```

### **审计和合规端点**

#### **获取审计日志**
```http
GET /api/v1/audit/logs?user_id=user-001&start_date=2025-09-01&end_date=2025-09-03&event_type=permission_check
Authorization: Bearer <token>
```

**响应 (200 OK):**
```json
{
  "audit_logs": [
    {
      "log_id": "audit-001",
      "event_type": "permission_check",
      "user_id": "user-001",
      "resource": "project:proj-001",
      "action": "read",
      "result": "granted",
      "timestamp": "2025-09-03T10:00:00.000Z",
      "context": {
        "context_id": "ctx-001",
        "ip_address": "192.168.1.100",
        "user_agent": "MPLP-Client/1.0",
        "session_id": "sess-001"
      },
      "decision_factors": [
        {
          "factor": "role_assignment",
          "value": "project_manager",
          "weight": 0.8
        },
        {
          "factor": "time_constraint",
          "value": "business_hours",
          "weight": 0.2
        }
      ]
    }
  ],
  "pagination": {
    "total_records": 1,
    "page": 1,
    "page_size": 50,
    "total_pages": 1
  },
  "filters_applied": {
    "user_id": "user-001",
    "date_range": "2025-09-01 to 2025-09-03",
    "event_type": "permission_check"
  }
}
```

#### **生成合规报告**
```http
POST /api/v1/compliance/reports
Content-Type: application/json
Authorization: Bearer <token>

{
  "report_type": "access_review",
  "scope": {
    "organization_id": "org-001",
    "departments": ["engineering", "product"],
    "time_period": {
      "start_date": "2025-08-01T00:00:00.000Z",
      "end_date": "2025-09-03T23:59:59.000Z"
    }
  },
  "report_parameters": {
    "include_role_assignments": true,
    "include_permission_usage": true,
    "include_capability_assessments": true,
    "include_security_violations": true,
    "format": "detailed"
  }
}
```

**响应 (202 Accepted):**
```json
{
  "report_id": "report-001",
  "report_type": "access_review",
  "status": "generating",
  "estimated_completion": "2025-09-03T10:15:00.000Z",
  "download_url": null,
  "created_at": "2025-09-03T10:00:00.000Z",
  "progress": {
    "percentage": 0,
    "current_phase": "data_collection",
    "estimated_time_remaining_seconds": 900
  }
}
```

---

## 🔗 相关文档

- [Role模块概览](./README.md) - 模块概览和架构
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
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Role模块API在Alpha版本中提供完整的企业级RBAC功能。额外的高级API功能和优化将在Beta版本中添加。

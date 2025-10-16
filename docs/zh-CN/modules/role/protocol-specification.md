# Role模块协议规范

> **🌐 语言导航**: [English](../../../en/modules/role/protocol-specification.md) | [中文](protocol-specification.md)



**多智能体协议生命周期平台 - Role模块协议规范 v1.0.0-alpha**

[![协议](https://img.shields.io/badge/protocol-RBAC%20v1.0-blue.svg)](./README.md)
[![规范](https://img.shields.io/badge/specification-Enterprise%20Grade-green.svg)](./api-reference.md)
[![安全](https://img.shields.io/badge/security-Compliant-orange.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/role/protocol-specification.md)

---

## 🎯 协议概览

Role模块协议定义了多智能体系统中企业级基于角色的访问控制(RBAC)的全面消息格式、数据结构和通信模式。此规范确保分布式智能体网络中安全、可扩展和可互操作的授权。

### **协议范围**
- **RBAC消息**: 角色创建、分配和管理协议
- **权限评估**: 动态权限检查和策略执行
- **能力验证**: 基于技能的授权和认证验证
- **安全事件**: 审计跟踪、合规报告和威胁检测
- **跨模块集成**: 与Context、Plan和Trace模块的安全通信

### **协议特性**
- **版本**: 1.0.0-alpha
- **传输**: HTTP/HTTPS、WebSocket、消息队列
- **序列化**: 带Schema验证的JSON
- **安全**: JWT认证、消息签名、加密支持
- **合规**: SOX、GDPR、HIPAA、PCI-DSS兼容

---

## 📋 核心协议消息

### **角色管理协议**

#### **角色创建消息**
```json
{
  "message_type": "role.create",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-role-001",
  "timestamp": "2025-09-03T10:00:00Z",
  "correlation_id": "corr-001",
  "sender": {
    "sender_id": "admin-001",
    "sender_type": "administrator",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "mfa_verified": true
    }
  },
  "payload": {
    "role_definition": {
      "name": "project_manager",
      "display_name": "项目经理",
      "description": "管理项目规划和执行",
      "role_type": "functional",
      "permissions": [
        {
          "permission": "project:create",
          "scope": "organization",
          "constraints": {
            "max_projects": 5,
            "budget_limit": 1000000
          }
        },
        {
          "permission": "team:manage",
          "scope": "project",
          "constraints": {
            "max_team_size": 20
          }
        }
      ],
      "capabilities": [
        {
          "capability": "strategic_planning",
          "level": "advanced",
          "certification_required": true
        },
        {
          "capability": "team_leadership",
          "level": "expert",
          "experience_years": 5
        }
      ],
      "inheritance": {
        "parent_roles": ["team_member", "project_contributor"],
        "inheritance_type": "additive"
      },
      "constraints": {
        "max_concurrent_assignments": 10,
        "assignment_duration_days": 365,
        "approval_required": true
      },
      "compliance": {
        "sox_compliant": true,
        "gdpr_compliant": true,
        "audit_required": true,
        "data_classification": "confidential"
      }
    },
    "metadata": {
      "department": "management",
      "cost_center": "CC-001",
      "created_by": "admin-001",
      "approval_workflow": "standard"
    }
  }
}
```

#### **角色创建响应**
```json
{
  "message_type": "role.create.response",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-role-002",
  "correlation_id": "corr-001",
  "timestamp": "2025-09-03T10:00:05Z",
  "status": "success",
  "payload": {
    "role": {
      "role_id": "role-001",
      "name": "project_manager",
      "display_name": "项目经理",
      "status": "active",
      "created_at": "2025-09-03T10:00:05Z",
      "version": 1,
      "permissions_count": 2,
      "capabilities_count": 2,
      "inheritance_depth": 2
    },
    "audit": {
      "audit_id": "audit-001",
      "action": "role_created",
      "timestamp": "2025-09-03T10:00:05Z",
      "compliance_verified": true
    }
  }
}
```

### **权限评估协议**

#### **权限检查请求**
```json
{
  "message_type": "permission.check",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-perm-001",
  "timestamp": "2025-09-03T10:05:00Z",
  "correlation_id": "corr-002",
  "sender": {
    "sender_id": "agent-001",
    "sender_type": "intelligent_agent",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "payload": {
    "permission_request": {
      "user_id": "user-001",
      "resource": "project:proj-001",
      "action": "update",
      "context": {
        "request_time": "2025-09-03T10:05:00Z",
        "request_source": "192.168.1.100",
        "session_id": "sess-001",
        "mfa_verified": true,
        "risk_level": "low"
      },
      "additional_checks": [
        {
          "type": "capability_check",
          "capability": "project_management",
          "level": "intermediate"
        },
        {
          "type": "constraint_check",
          "constraint": "budget_approval",
          "value": 50000
        }
      ]
    },
    "evaluation_options": {
      "include_inherited_permissions": true,
      "check_capability_requirements": true,
      "evaluate_constraints": true,
      "audit_decision": true
    }
  }
}
```

#### **权限检查响应**
```json
{
  "message_type": "permission.check.response",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-perm-002",
  "correlation_id": "corr-002",
  "timestamp": "2025-09-03T10:05:01Z",
  "status": "success",
  "payload": {
    "permission_result": {
      "allowed": true,
      "decision": "grant",
      "confidence": 0.95,
      "evaluation_time_ms": 8,
      "permissions": [
        {
          "permission": "project:update",
          "source": "role:project_manager",
          "granted": true,
          "constraints": {
            "budget_limit": 1000000,
            "approval_required": false
          }
        }
      ],
      "capabilities": [
        {
          "capability": "project_management",
          "level": "advanced",
          "verified": true,
          "certification": "cert-001"
        }
      ],
      "constraints_evaluated": [
        {
          "constraint": "budget_approval",
          "required_value": 100000,
          "actual_value": 50000,
          "satisfied": true
        }
      ],
      "risk_assessment": {
        "risk_level": "low",
        "threat_indicators": [],
        "anomaly_score": 0.1
      }
    },
    "audit": {
      "audit_id": "audit-002",
      "decision_logged": true,
      "compliance_checked": true
    }
  }
}
```

### **能力验证协议**

#### **能力验证请求**
```json
{
  "message_type": "capability.validate",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-cap-001",
  "timestamp": "2025-09-03T10:10:00Z",
  "correlation_id": "corr-003",
  "payload": {
    "validation_request": {
      "user_id": "user-001",
      "capabilities": [
        {
          "capability_id": "cap-001",
          "capability_name": "advanced_data_analysis",
          "required_level": "expert",
          "certification_required": true,
          "context": {
            "domain": "financial_analysis",
            "complexity": "high",
            "data_sensitivity": "confidential"
          }
        }
      ],
      "validation_criteria": {
        "check_certifications": true,
        "verify_experience": true,
        "assess_recent_performance": true,
        "validate_training": true
      }
    }
  }
}
```

#### **能力验证响应**
```json
{
  "message_type": "capability.validate.response",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-cap-002",
  "correlation_id": "corr-003",
  "timestamp": "2025-09-03T10:10:02Z",
  "status": "success",
  "payload": {
    "validation_result": {
      "overall_qualified": true,
      "confidence_score": 0.88,
      "capabilities": [
        {
          "capability_id": "cap-001",
          "capability_name": "advanced_data_analysis",
          "qualified": true,
          "current_level": "expert",
          "required_level": "expert",
          "certifications": [
            {
              "certification_id": "cert-data-001",
              "name": "高级数据分析师认证",
              "issuer": "数据科学协会",
              "issued_date": "2024-06-15",
              "expires_date": "2026-06-15",
              "status": "valid"
            }
          ],
          "experience": {
            "years": 6,
            "projects_completed": 45,
            "success_rate": 0.92
          },
          "recent_performance": {
            "last_assessment_date": "2025-08-15",
            "score": 0.91,
            "feedback": "优秀的分析能力和创新思维"
          }
        }
      ],
      "recommendations": [
        {
          "type": "training",
          "description": "建议参加机器学习高级课程以提升技能",
          "priority": "medium"
        }
      ]
    }
  }
}
```

---

## 🔒 安全协议特性

### **认证和授权**

#### **JWT令牌格式**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-001"
  },
  "payload": {
    "iss": "mplp-auth-service",
    "sub": "user-001",
    "aud": "mplp-role-module",
    "exp": 1693747200,
    "iat": 1693743600,
    "jti": "jwt-001",
    "roles": ["project_manager", "team_lead"],
    "permissions": ["project:read", "project:update"],
    "capabilities": ["strategic_planning", "team_leadership"],
    "mfa_verified": true,
    "risk_level": "low"
  }
}
```

### **消息签名和加密**

#### **消息完整性验证**
```json
{
  "message": {
    // 原始消息内容
  },
  "signature": {
    "algorithm": "RS256",
    "signature": "base64-encoded-signature",
    "public_key_id": "key-001",
    "timestamp": "2025-09-03T10:00:00Z"
  },
  "encryption": {
    "algorithm": "AES-256-GCM",
    "key_id": "enc-key-001",
    "iv": "base64-encoded-iv",
    "tag": "base64-encoded-tag"
  }
}
```

---

## 🔗 相关文档

- [Role模块概览](./README.md) - 模块概览和架构
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
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Role模块协议规范在Alpha版本中提供企业级RBAC协议定义。额外的高级协议功能和安全特性将在Beta版本中添加。

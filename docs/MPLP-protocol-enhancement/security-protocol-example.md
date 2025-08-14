# MPLP安全协议示例

## 📋 **示例概述**

**基于Schema**: `mplp-security.json`  
**示例版本**: MPLP v1.0.0  
**创建时间**: 2025-08-12  
**用途**: 演示企业级安全协议的完整使用方法

## 🔐 **安全上下文示例**

### **完整的安全上下文结构**

```json
{
  "security_context": {
    "context_id": "sec-550e8400-e29b-41d4-a716-446655440001",
    "session_id": "sess-550e8400-e29b-41d4-a716-446655440002",
    "user_identity": {
      "user_id": "user-12345",
      "username": "john.doe",
      "email": "john.doe@company.com",
      "display_name": "John Doe",
      "user_type": "human",
      "organization": "ACME Corporation",
      "department": "Engineering",
      "roles": ["developer", "reviewer", "coordinator"],
      "groups": ["engineering-team", "mplp-users"],
      "attributes": {
        "clearance_level": "confidential",
        "project_access": ["mplp-v1", "internal-tools"],
        "location": "US-West"
      }
    },
    "authentication_token": {
      "token_type": "jwt",
      "token_value": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "issued_at": "2025-08-12T10:00:00Z",
      "expires_at": "2025-08-12T18:00:00Z",
      "issuer": "mplp-auth-service",
      "audience": "mplp-platform",
      "scopes": ["coordination:read", "coordination:write", "orchestration:execute"]
    },
    "permissions": [
      {
        "permission_id": "perm-550e8400-e29b-41d4-a716-446655440003",
        "resource_type": "module",
        "resource_identifier": "coordination",
        "actions": ["read", "write", "execute"],
        "conditions": {
          "time_restrictions": {
            "allowed_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            "allowed_days": [1, 2, 3, 4, 5]
          },
          "ip_restrictions": ["192.168.1.0/24", "10.0.0.0/8"],
          "context_requirements": {
            "require_approval_for": ["critical_operations"],
            "max_concurrent_sessions": 3
          }
        },
        "granted_at": "2025-08-12T09:00:00Z",
        "expires_at": "2025-08-12T18:00:00Z",
        "granted_by": "admin-user"
      }
    ],
    "security_level": "confidential",
    "encryption_info": {
      "algorithm": "aes_256_gcm",
      "key_id": "key-2025-08-12-001",
      "key_version": "v1.0",
      "initialization_vector": "1234567890abcdef",
      "key_derivation": {
        "method": "pbkdf2",
        "iterations": 10000,
        "salt": "random_salt_value"
      },
      "signature": "signature_value",
      "certificate_chain": ["cert1", "cert2", "root_cert"]
    },
    "security_policies": [
      {
        "policy_id": "pol-data-protection",
        "policy_name": "数据保护政策",
        "policy_version": "1.0.0",
        "enforcement_level": "enforcing"
      },
      {
        "policy_id": "pol-access-control",
        "policy_name": "访问控制政策",
        "policy_version": "1.2.0",
        "enforcement_level": "enforcing"
      }
    ],
    "threat_indicators": [],
    "created_at": "2025-08-12T10:00:00Z",
    "updated_at": "2025-08-12T10:00:00Z"
  }
}
```

## 🚨 **安全事件示例**

### **安全违规事件处理**

```json
{
  "security_event": {
    "event_id": "evt-550e8400-e29b-41d4-a716-446655440004",
    "event_type": "authorization_denied",
    "severity": "warning",
    "source_module": "coordination",
    "affected_resources": ["coordination/api/create-request", "user-session-12345"],
    "security_context": {
      "context_id": "sec-550e8400-e29b-41d4-a716-446655440001",
      "session_id": "sess-550e8400-e29b-41d4-a716-446655440002",
      "user_identity": {
        "user_id": "user-12345",
        "username": "john.doe",
        "user_type": "human"
      },
      "security_level": "confidential"
    },
    "event_details": {
      "attempted_action": "create_coordination_request",
      "denied_reason": "insufficient_permissions",
      "required_permission": "coordination:admin",
      "user_permissions": ["coordination:read", "coordination:write"],
      "request_details": {
        "source_ip": "192.168.1.100",
        "user_agent": "MPLP-Client/1.0.0",
        "request_timestamp": "2025-08-12T14:30:00Z"
      }
    },
    "mitigation_actions": [
      {
        "action_type": "log_incident",
        "action_description": "记录安全事件到审计日志",
        "automated": true,
        "executed_at": "2025-08-12T14:30:01Z"
      },
      {
        "action_type": "alert_admin",
        "action_description": "通知安全管理员权限不足事件",
        "automated": true,
        "executed_at": "2025-08-12T14:30:02Z"
      }
    ],
    "investigation_status": "resolved",
    "occurred_at": "2025-08-12T14:30:00Z",
    "resolved_at": "2025-08-12T14:35:00Z"
  }
}
```

## 📋 **安全策略示例**

### **企业级安全策略配置**

```json
{
  "security_policy": {
    "policy_id": "pol-550e8400-e29b-41d4-a716-446655440005",
    "policy_name": "MPLP企业级访问控制策略",
    "policy_version": "1.0.0",
    "policy_type": "authorization",
    "target_modules": ["coordination", "orchestration", "transaction", "core"],
    "policy_rules": [
      {
        "rule_id": "rule-001",
        "rule_name": "管理员权限检查",
        "condition": "user.roles.includes('admin') && resource.type == 'configuration'",
        "action": "allow",
        "parameters": {
          "require_mfa": true,
          "session_timeout_minutes": 30
        }
      },
      {
        "rule_id": "rule-002",
        "rule_name": "工作时间访问限制",
        "condition": "time.hour >= 8 && time.hour <= 18 && time.weekday <= 5",
        "action": "allow",
        "parameters": {
          "outside_hours_action": "require_approval"
        }
      },
      {
        "rule_id": "rule-003",
        "rule_name": "敏感操作审批",
        "condition": "operation.type == 'delete' && resource.classification == 'critical'",
        "action": "require_approval",
        "parameters": {
          "approver_roles": ["senior_admin", "security_officer"],
          "approval_timeout_hours": 24
        }
      },
      {
        "rule_id": "rule-004",
        "rule_name": "IP地址白名单",
        "condition": "!ip.in_range(['192.168.0.0/16', '10.0.0.0/8'])",
        "action": "deny",
        "parameters": {
          "exception_process": "security_team_approval"
        }
      }
    ],
    "enforcement_level": "enforcing",
    "compliance_frameworks": ["gdpr", "iso_27001", "sox"],
    "effective_date": "2025-08-12T00:00:00Z",
    "expiration_date": "2026-08-12T00:00:00Z",
    "created_by": "security-admin",
    "approved_by": "ciso",
    "created_at": "2025-08-12T08:00:00Z",
    "updated_at": "2025-08-12T08:00:00Z"
  }
}
```

## 🔍 **审计日志示例**

### **详细的安全审计记录**

```json
{
  "audit_entry": {
    "audit_id": "audit-550e8400-e29b-41d4-a716-446655440006",
    "event_type": "access",
    "user_identity": {
      "user_id": "user-12345",
      "username": "john.doe",
      "email": "john.doe@company.com",
      "user_type": "human",
      "roles": ["developer", "coordinator"]
    },
    "resource_accessed": "coordination/api/create-workflow",
    "action_performed": "POST /coordination/workflows",
    "result": "success",
    "source_ip": "192.168.1.100",
    "user_agent": "MPLP-Client/1.0.0 (Windows NT 10.0)",
    "session_id": "sess-550e8400-e29b-41d4-a716-446655440002",
    "request_id": "req-550e8400-e29b-41d4-a716-446655440007",
    "additional_data": {
      "workflow_type": "coordination_request",
      "target_modules": ["context", "plan"],
      "data_classification": "internal",
      "request_size_bytes": 1024,
      "response_size_bytes": 512,
      "processing_time_ms": 150
    },
    "risk_score": 2.5,
    "timestamp": "2025-08-12T14:30:00Z"
  }
}
```

## 🛡️ **安全最佳实践**

### **身份认证最佳实践**
1. **多因素认证**: 对敏感操作启用MFA
2. **令牌管理**: 使用短期令牌和刷新机制
3. **会话管理**: 实施会话超时和并发控制
4. **证书管理**: 定期轮换加密密钥和证书

### **权限管理最佳实践**
1. **最小权限原则**: 仅授予必要的最小权限
2. **基于角色的访问控制**: 使用RBAC模型
3. **动态权限检查**: 实时验证权限有效性
4. **权限审计**: 定期审查和清理权限

### **数据保护最佳实践**
1. **传输加密**: 使用TLS 1.3加密传输
2. **存储加密**: 敏感数据静态加密
3. **数据分类**: 按敏感级别分类保护
4. **数据脱敏**: 日志和监控中脱敏处理

### **安全监控最佳实践**
1. **实时监控**: 24/7安全事件监控
2. **异常检测**: 基于行为的异常检测
3. **威胁情报**: 集成外部威胁情报
4. **事件响应**: 自动化事件响应流程

## 🔧 **集成示例**

### **安全协议集成代码**
```typescript
import { SecurityContext, SecurityEvent, SecurityPolicy } from './mplp-security';

// 安全上下文验证
async function validateSecurityContext(context: SecurityContext): Promise<boolean> {
  // 验证令牌有效性
  if (!await validateToken(context.authentication_token)) {
    return false;
  }
  
  // 检查权限
  if (!await checkPermissions(context.permissions)) {
    return false;
  }
  
  // 验证安全策略
  if (!await enforceSecurityPolicies(context.security_policies)) {
    return false;
  }
  
  return true;
}

// 安全事件处理
async function handleSecurityEvent(event: SecurityEvent): Promise<void> {
  // 记录审计日志
  await logAuditEvent(event);
  
  // 执行缓解措施
  for (const action of event.mitigation_actions) {
    await executeMitigationAction(action);
  }
  
  // 发送告警通知
  if (event.severity === 'critical' || event.severity === 'emergency') {
    await sendSecurityAlert(event);
  }
}

// 安全策略执行
async function enforceSecurityPolicy(policy: SecurityPolicy, context: SecurityContext): Promise<boolean> {
  for (const rule of policy.policy_rules) {
    const result = await evaluateRule(rule, context);
    if (!result.allowed) {
      await logPolicyViolation(policy, rule, context);
      return false;
    }
  }
  return true;
}
```

### **安全配置示例**
```yaml
# 安全配置文件示例
security:
  authentication:
    methods: ["jwt", "oauth2", "certificate"]
    token_expiry: "8h"
    refresh_token_expiry: "30d"
    mfa_required_for: ["admin_operations", "sensitive_data"]
  
  authorization:
    model: "rbac"
    policy_enforcement: "enforcing"
    permission_cache_ttl: "5m"
  
  encryption:
    algorithm: "aes_256_gcm"
    key_rotation_interval: "90d"
    tls_version: "1.3"
  
  audit:
    log_level: "info"
    retention_days: 365
    real_time_monitoring: true
    
  compliance:
    frameworks: ["gdpr", "iso_27001", "sox"]
    data_classification: true
    privacy_controls: true
```

---

**示例版本**: v1.0.0  
**创建时间**: 2025-08-12  
**适用范围**: MPLP安全协议  
**维护状态**: 活跃维护

# MPLP v1.0 Role API 文档

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **API概览**

Role API提供了完整的角色和权限管理功能，支持基于角色的访问控制(RBAC)、权限委托、角色继承和细粒度权限管理。

## 🔗 **基础信息**

- **Base URL**: `/api/v1/roles`
- **认证方式**: Bearer Token
- **内容类型**: `application/json`
- **API版本**: v1.0.0

## 📋 **核心API端点**

### **1. 创建角色**
```http
POST /api/v1/roles
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "project_manager",
  "display_name": "项目经理",
  "description": "负责项目管理和团队协调",
  "role_type": "functional",
  "context_id": "ctx_123456",
  "permissions": [
    {
      "resource": "projects",
      "actions": ["create", "read", "update", "delete"],
      "grant_type": "allow",
      "conditions": {
        "department": "engineering"
      }
    },
    {
      "resource": "team_members",
      "actions": ["read", "update"],
      "grant_type": "allow"
    }
  ],
  "scope": {
    "type": "department",
    "value": "engineering"
  },
  "attributes": {
    "max_team_size": 10,
    "budget_limit": 100000
  }
}
```

**响应示例**:
```json
{
  "status": 201,
  "data": {
    "role_id": "role_789012",
    "name": "project_manager",
    "display_name": "项目经理",
    "description": "负责项目管理和团队协调",
    "role_type": "functional",
    "status": "active",
    "context_id": "ctx_123456",
    "created_at": "2025-08-06T00:35:06Z",
    "updated_at": "2025-08-06T00:35:06Z",
    "permissions": [
      {
        "permission_id": "perm_001",
        "resource": "projects",
        "actions": ["create", "read", "update", "delete"],
        "grant_type": "allow",
        "conditions": {
          "department": "engineering"
        }
      }
    ],
    "scope": {
      "type": "department",
      "value": "engineering"
    }
  },
  "message": "角色创建成功"
}
```

### **2. 分配角色**
```http
POST /api/v1/roles/{roleId}/assignments
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": "user_123456",
  "assigned_by": "admin_001",
  "assignment_type": "direct",
  "effective_from": "2025-08-06T00:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z",
  "conditions": {
    "project_id": "proj_789",
    "location": "headquarters"
  },
  "metadata": {
    "reason": "项目需要",
    "approval_id": "appr_456"
  }
}
```

**响应示例**:
```json
{
  "status": 201,
  "data": {
    "assignment_id": "assign_345678",
    "role_id": "role_789012",
    "user_id": "user_123456",
    "assignment_type": "direct",
    "status": "active",
    "assigned_by": "admin_001",
    "assigned_at": "2025-08-06T00:35:06Z",
    "effective_from": "2025-08-06T00:00:00Z",
    "expires_at": "2025-12-31T23:59:59Z",
    "conditions": {
      "project_id": "proj_789",
      "location": "headquarters"
    }
  },
  "message": "角色分配成功"
}
```

### **3. 检查权限**
```http
POST /api/v1/roles/permissions/check
Content-Type: application/json
Authorization: Bearer {token}

{
  "user_id": "user_123456",
  "resource": "projects",
  "action": "create",
  "context": {
    "department": "engineering",
    "project_type": "internal"
  }
}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "user_id": "user_123456",
    "resource": "projects",
    "action": "create",
    "permission_granted": true,
    "effective_roles": [
      {
        "role_id": "role_789012",
        "role_name": "project_manager",
        "assignment_type": "direct"
      }
    ],
    "applicable_permissions": [
      {
        "permission_id": "perm_001",
        "resource": "projects",
        "actions": ["create", "read", "update", "delete"],
        "grant_type": "allow"
      }
    ],
    "evaluation_context": {
      "department": "engineering",
      "project_type": "internal"
    },
    "checked_at": "2025-08-06T00:35:06Z"
  }
}
```

### **4. 委托角色**
```http
POST /api/v1/roles/{roleId}/delegate
Content-Type: application/json
Authorization: Bearer {token}

{
  "delegator_id": "user_123456",
  "delegate_to": "user_789012",
  "delegation_type": "temporary",
  "permissions_subset": ["read", "update"],
  "effective_from": "2025-08-06T09:00:00Z",
  "expires_at": "2025-08-06T18:00:00Z",
  "reason": "出差期间临时委托",
  "conditions": {
    "max_budget": 10000,
    "approval_required": true
  }
}
```

### **5. 获取用户角色**
```http
GET /api/v1/roles/users/{userId}/roles?include_inherited=true&status=active
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "user_id": "user_123456",
    "roles": [
      {
        "role_id": "role_789012",
        "name": "project_manager",
        "display_name": "项目经理",
        "assignment_type": "direct",
        "status": "active",
        "assigned_at": "2025-08-06T00:35:06Z",
        "expires_at": "2025-12-31T23:59:59Z"
      },
      {
        "role_id": "role_456789",
        "name": "team_lead",
        "display_name": "团队负责人",
        "assignment_type": "inherited",
        "status": "active",
        "inherited_from": "role_789012"
      }
    ],
    "total_roles": 2,
    "effective_permissions": [
      {
        "resource": "projects",
        "actions": ["create", "read", "update", "delete"]
      },
      {
        "resource": "team_members",
        "actions": ["read", "update"]
      }
    ]
  }
}
```

### **6. 更新角色**
```http
PUT /api/v1/roles/{roleId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "display_name": "高级项目经理",
  "description": "负责大型项目管理和跨部门协调",
  "permissions": [
    {
      "resource": "projects",
      "actions": ["create", "read", "update", "delete", "approve"],
      "grant_type": "allow"
    }
  ],
  "attributes": {
    "max_team_size": 20,
    "budget_limit": 500000
  }
}
```

### **7. 撤销角色分配**
```http
DELETE /api/v1/roles/{roleId}/assignments/{assignmentId}
Authorization: Bearer {token}

{
  "revoked_by": "admin_001",
  "reason": "项目结束",
  "effective_immediately": true
}
```

### **8. 列出角色**
```http
GET /api/v1/roles?role_type=functional&status=active&limit=20&offset=0
Authorization: Bearer {token}
```

**查询参数**:
- `role_type`: 角色类型 (system, organizational, functional, project, temporary)
- `status`: 角色状态 (active, inactive, deprecated, suspended)
- `context_id`: 上下文ID
- `search`: 搜索关键词
- `limit`: 返回数量限制 (默认10)
- `offset`: 偏移量 (默认0)

## 📊 **数据模型**

### **角色类型 (RoleType)**
- `system`: 系统角色
- `organizational`: 组织角色
- `functional`: 功能角色
- `project`: 项目角色
- `temporary`: 临时角色

### **角色状态 (RoleStatus)**
- `active`: 活跃
- `inactive`: 非活跃
- `deprecated`: 已废弃
- `suspended`: 已暂停

### **权限操作 (PermissionAction)**
- `create`: 创建
- `read`: 读取
- `update`: 更新
- `delete`: 删除
- `execute`: 执行
- `approve`: 审批
- `monitor`: 监控
- `admin`: 管理

### **授予类型 (GrantType)**
- `allow`: 允许
- `deny`: 拒绝
- `conditional`: 有条件允许

## 🔧 **TypeScript SDK 使用示例**

```typescript
import { RoleProtocol } from 'mplp/role';

// 创建角色
const role = await RoleProtocol.create({
  name: 'project_manager',
  display_name: '项目经理',
  role_type: 'functional',
  permissions: [
    {
      resource: 'projects',
      actions: ['create', 'read', 'update', 'delete'],
      grant_type: 'allow'
    }
  ]
});

// 分配角色
await RoleProtocol.assign(role.role_id, {
  user_id: 'user_123456',
  assignment_type: 'direct'
});

// 检查权限
const hasPermission = await RoleProtocol.checkPermission({
  user_id: 'user_123456',
  resource: 'projects',
  action: 'create'
});
```

## 🚦 **状态码**

- `200 OK`: 请求成功
- `201 Created`: 角色/分配创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 认证失败
- `403 Forbidden`: 权限不足
- `404 Not Found`: 角色不存在
- `409 Conflict`: 角色冲突
- `422 Unprocessable Entity`: 数据验证失败
- `500 Internal Server Error`: 服务器内部错误

## 📈 **性能和限制**

- **请求频率**: 500 requests/minute
- **角色数量**: 最大1000个角色/组织
- **权限检查**: 缓存5分钟
- **角色分配**: 最大100个用户/角色
- **委托深度**: 最大3层委托

---

**相关文档**:
- [Role Protocol概览](../03-protocols/protocol-overview.md#role-protocol)
- [API总览](./api-overview.md)
- [权限管理指南](../04-development/permission-guide.md)

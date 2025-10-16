# Role Module API Reference

> **🌐 Language Navigation**: [English](api-reference.md) | [中文](../../../zh-CN/modules/role/api-reference.md)



**Multi-Agent Protocol Lifecycle Platform - Role Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Role-purple.svg)](./README.md)
[![RBAC](https://img.shields.io/badge/RBAC-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/role/api-reference.md)

---

## 🎯 API Overview

The Role Module provides comprehensive REST, GraphQL, and WebSocket APIs for enterprise-grade Role-Based Access Control (RBAC), permission management, and capability-based authorization. All APIs follow MPLP protocol standards and provide advanced security features.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/roles`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/roles`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API Reference

### **Role Management Endpoints**

#### **Create Role**
```http
POST /api/v1/roles
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "project_manager",
  "display_name": "Project Manager",
  "description": "Manages project planning and execution",
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

**Response (201 Created):**
```json
{
  "role_id": "role-001",
  "name": "project_manager",
  "display_name": "Project Manager",
  "description": "Manages project planning and execution",
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

#### **Assign Role to User**
```http
POST /api/v1/roles/{role_id}/assignments
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "assigned_by": "admin-001",
  "assignment_reason": "Project leadership requirement",
  "expires_at": "2025-12-31T23:59:59.000Z",
  "constraints": {
    "max_concurrent_projects": 3,
    "budget_approval_limit": 500000
  }
}
```

**Response (201 Created):**
```json
{
  "assignment_id": "assign-001",
  "role_id": "role-001",
  "user_id": "user-001",
  "context_id": "ctx-001",
  "status": "active",
  "assigned_by": "admin-001",
  "assigned_at": "2025-09-03T10:15:00.000Z",
  "expires_at": "2025-12-31T23:59:59.000Z",
  "effective_permissions": [
    "project:create",
    "project:read",
    "project:update",
    "team:manage"
  ],
  "constraints": {
    "max_concurrent_projects": 3,
    "budget_approval_limit": 500000
  }
}
```

### **Permission Management Endpoints**

#### **Check User Permissions**
```http
POST /api/v1/permissions/check
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "permissions": [
    "project:create",
    "team:manage",
    "budget:approve"
  ],
  "resource_constraints": {
    "project_budget": 750000,
    "team_size": 15
  }
}
```

**Response (200 OK):**
```json
{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "permission_results": [
    {
      "permission": "project:create",
      "granted": true,
      "source": "role:project_manager",
      "constraints_satisfied": true
    },
    {
      "permission": "team:manage",
      "granted": true,
      "source": "role:project_manager",
      "constraints_satisfied": true
    },
    {
      "permission": "budget:approve",
      "granted": false,
      "reason": "Budget limit exceeded",
      "required_limit": 1000000,
      "requested_amount": 750000
    }
  ],
  "overall_access": "partial",
  "recommendations": [
    "Request budget approval from senior manager",
    "Consider reducing project scope"
  ]
}
```

#### **Get User Capabilities**
```http
GET /api/v1/users/{user_id}/capabilities?context_id=ctx-001
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "capabilities": [
    {
      "capability": "strategic_planning",
      "level": "expert",
      "source": "role:project_manager",
      "verified": true,
      "last_used": "2025-09-02T14:30:00.000Z"
    },
    {
      "capability": "team_leadership",
      "level": "advanced",
      "source": "role:project_manager",
      "verified": true,
      "certifications": ["PMP", "Agile_Master"]
    },
    {
      "capability": "resource_management",
      "level": "intermediate",
      "source": "role:project_manager",
      "verified": false,
      "requires_verification": true
    }
  ],
  "capability_score": 0.85,
  "recommendations": [
    "Complete resource management certification",
    "Gain experience in budget planning"
  ]
}
```

### **Role Analytics Endpoints**

#### **Get Role Usage Analytics**
```http
GET /api/v1/roles/{role_id}/analytics?period=30d
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "role_id": "role-001",
  "analytics_period": {
    "start": "2025-08-04T00:00:00.000Z",
    "end": "2025-09-03T23:59:59.000Z"
  },
  "usage_statistics": {
    "total_assignments": 25,
    "active_assignments": 18,
    "expired_assignments": 7,
    "average_assignment_duration": 2592000000,
    "assignment_success_rate": 0.92
  },
  "permission_usage": [
    {
      "permission": "project:create",
      "usage_count": 156,
      "success_rate": 0.98,
      "average_response_time": 250
    },
    {
      "permission": "team:manage",
      "usage_count": 89,
      "success_rate": 0.95,
      "average_response_time": 180
    }
  ],
  "capability_utilization": [
    {
      "capability": "strategic_planning",
      "utilization_rate": 0.75,
      "effectiveness_score": 0.88,
      "improvement_trend": "increasing"
    }
  ],
  "performance_metrics": {
    "role_effectiveness": 0.87,
    "user_satisfaction": 0.91,
    "compliance_score": 0.96
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type Role {
  roleId: ID!
  name: String!
  displayName: String
  description: String
  permissions: [String!]!
  capabilities: [Capability!]!
  constraints: RoleConstraints
  status: RoleStatus!
  assignments: [RoleAssignment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type RoleAssignment {
  assignmentId: ID!
  roleId: ID!
  userId: ID!
  contextId: ID
  status: AssignmentStatus!
  assignedBy: ID!
  assignedAt: DateTime!
  expiresAt: DateTime
  effectivePermissions: [String!]!
  constraints: AssignmentConstraints
}

type Capability {
  name: String!
  level: CapabilityLevel!
  verified: Boolean!
  certifications: [String!]
  lastUsed: DateTime
}

type PermissionCheck {
  permission: String!
  granted: Boolean!
  source: String
  constraintsSatisfied: Boolean!
  reason: String
}

enum RoleStatus {
  ACTIVE
  INACTIVE
  DEPRECATED
}

enum AssignmentStatus {
  ACTIVE
  EXPIRED
  REVOKED
  SUSPENDED
}

enum CapabilityLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

### **Query Operations**

#### **Get Role with Assignments**
```graphql
query GetRoleDetails($roleId: ID!) {
  role(roleId: $roleId) {
    roleId
    name
    displayName
    description
    permissions
    capabilities {
      name
      level
      verified
      certifications
    }
    constraints {
      maxProjects
      maxTeamSize
      budgetLimit
    }
    assignments {
      assignmentId
      userId
      contextId
      status
      assignedAt
      expiresAt
      effectivePermissions
    }
    status
    createdAt
    updatedAt
  }
}
```

#### **Check User Permissions**
```graphql
query CheckPermissions($input: PermissionCheckInput!) {
  checkPermissions(input: $input) {
    userId
    contextId
    permissionResults {
      permission
      granted
      source
      constraintsSatisfied
      reason
    }
    overallAccess
    recommendations
  }
}
```

### **Mutation Operations**

#### **Create Role**
```graphql
mutation CreateRole($input: CreateRoleInput!) {
  createRole(input: $input) {
    role {
      roleId
      name
      displayName
      permissions
      capabilities {
        name
        level
      }
      status
    }
  }
}
```

#### **Assign Role**
```graphql
mutation AssignRole($input: AssignRoleInput!) {
  assignRole(input: $input) {
    assignment {
      assignmentId
      roleId
      userId
      contextId
      status
      assignedAt
      expiresAt
      effectivePermissions
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Real-time Permission Updates**

```javascript
// Subscribe to permission changes
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'permissions.user-001.updates'
}));

// Receive permission updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'permission_updated') {
    console.log('Permission updated:', message.data);
  }
};
```

### **Role Assignment Notifications**

```javascript
// Subscribe to role assignment events
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'roles.assignments.notifications'
}));

// Receive assignment notifications
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'role_assigned') {
    console.log('Role assigned:', message.data);
  }
};
```

---

## 🔒 Security Features

### **Advanced Permission Validation**

#### **Context-Aware Permissions**
```http
POST /api/v1/permissions/validate-context
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "action": "project:create",
  "resource": {
    "type": "project",
    "attributes": {
      "budget": 500000,
      "team_size": 10,
      "duration": "6_months",
      "classification": "internal"
    }
  },
  "environment": {
    "time_of_day": "business_hours",
    "location": "office",
    "device_type": "corporate_laptop"
  }
}
```

#### **Dynamic Permission Evaluation**
```http
POST /api/v1/permissions/evaluate-dynamic
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-001",
  "context_id": "ctx-001",
  "permission_expression": "project:create AND (budget < user.budget_limit OR approval:manager)",
  "variables": {
    "budget": 750000,
    "user.budget_limit": 500000,
    "approval:manager": false
  }
}
```

---

## 📊 Audit and Compliance

### **Audit Trail Endpoints**

#### **Get Permission Audit Log**
```http
GET /api/v1/audit/permissions?user_id=user-001&start_date=2025-09-01&end_date=2025-09-03
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "audit_entries": [
    {
      "audit_id": "audit-001",
      "timestamp": "2025-09-03T10:15:00.000Z",
      "user_id": "user-001",
      "action": "permission_check",
      "permission": "project:create",
      "context_id": "ctx-001",
      "result": "granted",
      "source": "role:project_manager",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "session_id": "sess-001"
    }
  ],
  "total_entries": 1,
  "compliance_status": "compliant",
  "violations": []
}
```

---

## 🔗 Related Documentation

- [Role Module Overview](./README.md) - Module overview and architecture
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

**⚠️ Alpha Notice**: The Role Module API provides enterprise-grade RBAC capabilities in Alpha release. Additional security features and compliance tools will be added in Beta release while maintaining backward compatibility.

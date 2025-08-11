# Role Module - API Reference

**Version**: v1.0.0
**Last Updated**: 2025-08-09 16:30:00
**Status**: Enterprise-Grade Production Ready ✅

---

## 📋 **API Overview**

The Role Module provides a comprehensive REST API for role-based access control (RBAC) operations. All endpoints follow RESTful design principles with consistent request/response patterns and comprehensive error handling.

**Base URL**: `/api/v1/roles`

## 🔐 **Authentication**

All API endpoints require authentication. Include the authentication token in the request header:

```http
Authorization: Bearer <your-token>
Content-Type: application/json
```

## 📊 **Response Format**

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  status: number;           // HTTP status code
  success: boolean;         // Operation success indicator
  data?: T;                // Response data (if successful)
  error?: string;          // Error message (if failed)
  message?: string;        // Success message
  timestamp: string;       // Response timestamp
}
```

## 🎯 **Role Management Endpoints**

### Create Role
Create a new role with permissions and configuration.

```http
POST /api/v1/roles
```

**Request Body**:
```typescript
interface CreateRoleRequest {
  context_id: string;
  name: string;
  role_type: 'functional' | 'organizational' | 'project' | 'system' | 'temporary';
  display_name?: string;
  description?: string;
  permissions?: Permission[];
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  scope?: RoleScope;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
}
```

**Response**:
```typescript
interface CreateRoleResponse {
  role_id: string;
  context_id: string;
  name: string;
  role_type: string;
  status: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}
```

**Example**:
```bash
curl -X POST /api/v1/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "context_id": "project-123",
    "name": "Project Manager",
    "role_type": "functional",
    "permissions": [{
      "permission_id": "perm-1",
      "resource_type": "project",
      "resource_id": "project-123",
      "actions": ["read", "write", "manage"],
      "grant_type": "direct"
    }]
  }'
```

### Get Role by ID
Retrieve a specific role by its ID.

```http
GET /api/v1/roles/{id}
```

**Parameters**:
- `id` (path): Role ID

**Response**:
```typescript
interface GetRoleResponse {
  role_id: string;
  context_id: string;
  name: string;
  role_type: string;
  status: string;
  permissions: Permission[];
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  scope?: RoleScope;
  created_at: string;
  updated_at: string;
}
```

### Update Role Status
Update the status of a role.

```http
PUT /api/v1/roles/{id}/status
```

**Request Body**:
```typescript
interface UpdateRoleStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
}
```

### Delete Role
Delete a role (soft delete with dependency checking).

```http
DELETE /api/v1/roles/{id}
```

**Response**: 204 No Content on success

## 🔑 **Permission Management Endpoints**

### Assign Permissions
Assign permissions to a role.

```http
POST /api/v1/roles/{id}/permissions
```

**Request Body**:
```typescript
interface AssignPermissionsRequest {
  permissions: Permission[];
}
```

### Revoke Permissions
Revoke permissions from a role.

```http
DELETE /api/v1/roles/{id}/permissions
```

**Request Body**:
```typescript
interface RevokePermissionsRequest {
  permission_ids: string[];
}
```

### Check Permission
Check if a role has a specific permission.

```http
GET /api/v1/roles/{id}/permissions/check
```

**Query Parameters**:
- `resource_type` (required): Resource type to check
- `resource_id` (optional): Specific resource ID (defaults to '*')
- `action` (required): Action to check

**Response**:
```typescript
interface PermissionCheckResponse {
  has_permission: boolean;
  permission_details?: Permission;
  checked_at: string;
}
```

**Example**:
```bash
curl -X GET "/api/v1/roles/role-123/permissions/check?resource_type=project&resource_id=proj-456&action=write" \
  -H "Authorization: Bearer <token>"
```

## 🔍 **Query and Search Endpoints**

### Query Roles
Search and filter roles with pagination.

```http
GET /api/v1/roles
```

**Query Parameters**:
- `contextId` (optional): Filter by context ID
- `roleType` (optional): Filter by role type
- `status` (optional): Filter by status
- `namePattern` (optional): Search by name pattern
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order (asc/desc)

**Response**:
```typescript
interface QueryRolesResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
```

### Get Active Roles
Get all active roles in a context.

```http
GET /api/v1/roles/active
```

**Query Parameters**:
- `contextId` (optional): Filter by context ID

**Response**:
```typescript
interface ActiveRolesResponse {
  roles: Role[];
  total: number;
}
```

### Get Role Statistics
Get statistical information about roles.

```http
GET /api/v1/roles/statistics
```

**Query Parameters**:
- `contextId` (optional): Filter by context ID

**Response**:
```typescript
interface RoleStatisticsResponse {
  total: number;
  active_count: number;
  by_type: {
    functional: number;
    organizational: number;
    project: number;
    system: number;
    temporary: number;
  };
  by_status: {
    active: number;
    inactive: number;
    suspended: number;
  };
}
```

## 📋 **Data Types**

### Permission
```typescript
interface Permission {
  permission_id: string;
  resource_type: 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'system';
  resource_id: string;
  actions: ('read' | 'write' | 'create' | 'delete' | 'manage' | 'execute' | 'approve')[];
  conditions?: Record<string, any>;
  grant_type: 'direct' | 'inherited' | 'delegated' | 'conditional';
  expiry?: string;
}
```

### Role Inheritance
```typescript
interface RoleInheritance {
  parent_roles: string[];
  inheritance_type: 'full' | 'partial' | 'conditional';
  excluded_permissions?: string[];
  inheritance_rules?: {
    merge_strategy: 'union' | 'intersection' | 'override';
    conflict_resolution: 'least_restrictive' | 'most_restrictive' | 'parent_wins';
  };
  max_depth?: number;
}
```

### Role Delegation
```typescript
interface RoleDelegation {
  can_delegate: boolean;
  delegation_depth: number;
  allowed_delegates: string[];
  delegation_constraints?: {
    time_limit?: number;
    scope_restrictions?: string[];
    approval_required?: boolean;
  };
}
```

### Role Scope
```typescript
interface RoleScope {
  level: 'organization' | 'project' | 'team' | 'individual';
  boundaries: string[];
  restrictions?: {
    time_based?: {
      start_time: string;
      end_time: string;
      timezone?: string;
    };
    location_based?: {
      allowed_ips?: string[];
      allowed_countries?: string[];
    };
    resource_based?: {
      max_resources?: number;
      resource_types?: string[];
    };
  };
}
```

## ❌ **Error Responses**

### Error Format
```typescript
interface ErrorResponse {
  status: number;
  success: false;
  error: string;
  details?: {
    field?: string;
    code?: string;
    message?: string;
  }[];
  timestamp: string;
}
```

### Common Error Codes
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate name)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Example Error Response
```json
{
  "status": 400,
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "code": "REQUIRED",
      "message": "Role name is required"
    }
  ],
  "timestamp": "2025-08-09T16:30:00.000Z"
}
```

## 🔄 **Rate Limiting**

API endpoints are rate-limited to ensure fair usage:

- **Standard endpoints**: 1000 requests per hour per user
- **Query endpoints**: 500 requests per hour per user
- **Bulk operations**: 100 requests per hour per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625097600
```

## 📝 **Request Examples**

### Complete Role Creation
```bash
curl -X POST /api/v1/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "context_id": "org-123",
    "name": "Senior Developer",
    "role_type": "functional",
    "display_name": "Senior Software Developer",
    "description": "Senior developer with code review and mentoring responsibilities",
    "permissions": [
      {
        "permission_id": "dev-read",
        "resource_type": "project",
        "resource_id": "*",
        "actions": ["read", "write"],
        "grant_type": "direct"
      },
      {
        "permission_id": "review-approve",
        "resource_type": "plan",
        "resource_id": "*",
        "actions": ["read", "approve"],
        "grant_type": "direct"
      }
    ],
    "inheritance": {
      "parent_roles": ["developer-base"],
      "inheritance_type": "full",
      "inheritance_rules": {
        "merge_strategy": "union",
        "conflict_resolution": "least_restrictive"
      }
    }
  }'
```

---

**The Role Module API provides comprehensive, enterprise-grade RBAC functionality with consistent patterns, robust error handling, and high performance suitable for production deployments.**

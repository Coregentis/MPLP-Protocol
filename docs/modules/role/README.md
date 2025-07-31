# Role Module

## 📋 Overview

The Role Module provides comprehensive Role-Based Access Control (RBAC), permission management, and identity governance within the MPLP ecosystem. It implements fine-grained access control with DDD architecture for secure multi-agent collaboration.

## 🏗️ Architecture

### DDD Layer Structure

```
src/modules/role/
├── api/                    # API Layer
│   ├── controllers/        # REST controllers
│   │   └── role.controller.ts
│   └── dto/               # Data transfer objects
├── application/           # Application Layer
│   ├── services/          # Application services
│   │   └── role-management.service.ts
│   ├── commands/          # Command handlers
│   │   └── create-role.command.ts
│   └── queries/           # Query handlers
│       └── get-role-by-id.query.ts
├── domain/                # Domain Layer
│   ├── entities/          # Domain entities
│   │   ├── role.entity.ts
│   │   ├── permission.entity.ts
│   │   └── user-role.entity.ts
│   ├── repositories/      # Repository interfaces
│   │   └── role-repository.interface.ts
│   └── services/          # Domain services
│       └── permission-evaluation.service.ts
├── infrastructure/        # Infrastructure Layer
│   └── repositories/      # Repository implementations
│       └── role.repository.ts
├── module.ts             # Module integration
├── index.ts              # Public exports
└── types.ts              # Type definitions
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { initializeRoleModule } from 'mplp';

// Initialize the module
const roleModule = await initializeRoleModule();

// Create a role
const roleResult = await roleModule.roleManagementService.createRole({
  name: 'Project Manager',
  description: 'Can manage projects and approve plans',
  permissions: [
    'context:create',
    'context:read',
    'context:update',
    'plan:create',
    'plan:read',
    'plan:approve',
    'confirm:create',
    'confirm:approve'
  ],
  is_system_role: false
});

// Assign role to user
if (roleResult.success) {
  await roleModule.roleManagementService.assignRoleToUser(
    'user-123',
    roleResult.data.role_id
  );
}

// Check permissions
const hasPermission = await roleModule.roleManagementService.checkPermission(
  'user-123',
  'plan:approve',
  { context_id: 'ctx-123' }
);

console.log('User can approve plans:', hasPermission);
```

## 📖 API Reference

### Role Management Service

#### createRole()

Creates a new role with permissions.

```typescript
async createRole(request: CreateRoleRequest): Promise<OperationResult<Role>>
```

**Parameters:**
```typescript
interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
  parent_role_id?: UUID;
  is_system_role?: boolean;
  metadata?: Record<string, any>;
}
```

#### assignRoleToUser()

Assigns a role to a user.

```typescript
async assignRoleToUser(
  userId: string,
  roleId: UUID,
  context?: AssignmentContext
): Promise<OperationResult<UserRole>>
```

#### checkPermission()

Checks if a user has a specific permission.

```typescript
async checkPermission(
  userId: string,
  permission: string,
  context?: PermissionContext
): Promise<boolean>
```

#### getUserRoles()

Gets all roles assigned to a user.

```typescript
async getUserRoles(userId: string): Promise<OperationResult<UserRole[]>>
```

#### getUserPermissions()

Gets all effective permissions for a user.

```typescript
async getUserPermissions(
  userId: string,
  context?: PermissionContext
): Promise<OperationResult<string[]>>
```

## 🎯 Domain Model

### Role Entity

The core domain entity representing a role.

```typescript
class Role {
  // Properties
  role_id: UUID;
  name: string;
  description?: string;
  permissions: Permission[];
  parent_role_id?: UUID;
  child_roles: Role[];
  is_system_role: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;

  // Business Methods
  addPermission(permission: Permission): void;
  removePermission(permissionId: UUID): void;
  hasPermission(permission: string): boolean;
  getEffectivePermissions(): string[];
  addChildRole(role: Role): void;
  isDescendantOf(roleId: UUID): boolean;
}
```

### Permission Entity

Individual permission within the system.

```typescript
class Permission {
  // Properties
  permission_id: UUID;
  name: string;
  resource: string;
  action: string;
  description?: string;
  conditions?: PermissionCondition[];
  is_system_permission: boolean;
  created_at: Timestamp;

  // Business Methods
  matches(resource: string, action: string): boolean;
  evaluateConditions(context: PermissionContext): boolean;
  getFullName(): string; // e.g., "context:create"
}
```

### User Role Assignment

```typescript
class UserRole {
  // Properties
  assignment_id: UUID;
  user_id: string;
  role_id: UUID;
  assigned_by: string;
  context_id?: UUID;
  expires_at?: Date;
  is_active: boolean;
  assigned_at: Timestamp;

  // Business Methods
  isExpired(): boolean;
  isValidInContext(contextId: UUID): boolean;
  activate(): void;
  deactivate(): void;
}
```

## 🔧 Configuration

### Module Options

```typescript
interface RoleModuleOptions {
  dataSource?: DataSource;           // Database connection
  enableRoleHierarchy?: boolean;     // Enable role inheritance
  enablePermissionInheritance?: boolean; // Enable permission inheritance
  enableContextualPermissions?: boolean; // Enable context-based permissions
  enableAuditLogging?: boolean;      // Enable permission audit logs
  defaultRole?: string;              // Default role for new users
  adminRole?: string;                // Admin role name
}
```

### Permission System

```typescript
// Standard MPLP permissions
const MPLP_PERMISSIONS = {
  // Context permissions
  'context:create': 'Create new contexts',
  'context:read': 'Read context information',
  'context:update': 'Update context details',
  'context:delete': 'Delete contexts',
  
  // Plan permissions
  'plan:create': 'Create new plans',
  'plan:read': 'Read plan information',
  'plan:update': 'Update plan details',
  'plan:delete': 'Delete plans',
  'plan:approve': 'Approve plans',
  
  // Confirm permissions
  'confirm:create': 'Create confirmation requests',
  'confirm:read': 'Read confirmation details',
  'confirm:approve': 'Submit approvals',
  'confirm:manage': 'Manage confirmation workflows',
  
  // Trace permissions
  'trace:read': 'Read trace information',
  'trace:create': 'Create traces',
  'trace:export': 'Export trace data',
  
  // Role permissions
  'role:create': 'Create new roles',
  'role:read': 'Read role information',
  'role:update': 'Update role details',
  'role:delete': 'Delete roles',
  'role:assign': 'Assign roles to users',
  
  // System permissions
  'system:admin': 'System administration',
  'system:config': 'System configuration',
  'system:monitor': 'System monitoring'
};
```

## 📊 Events

The Role Module emits domain events for audit and integration:

```typescript
interface RoleCreatedEvent {
  event_type: 'role_created';
  role_id: UUID;
  role_name: string;
  permissions: string[];
  created_by: string;
  timestamp: Timestamp;
}

interface RoleAssignedEvent {
  event_type: 'role_assigned';
  assignment_id: UUID;
  user_id: string;
  role_id: UUID;
  context_id?: UUID;
  assigned_by: string;
  timestamp: Timestamp;
}

interface PermissionCheckedEvent {
  event_type: 'permission_checked';
  user_id: string;
  permission: string;
  context?: PermissionContext;
  result: boolean;
  timestamp: Timestamp;
}
```

## 🧪 Testing

### Unit Tests

```typescript
import { Role } from '../domain/entities/role.entity';
import { Permission } from '../domain/entities/permission.entity';

describe('Role Entity', () => {
  test('should create valid role', () => {
    const role = new Role(
      'role-123',
      'Test Role',
      false,
      true,
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    expect(role.role_id).toBe('role-123');
    expect(role.name).toBe('Test Role');
    expect(role.is_active).toBe(true);
  });

  test('should add permission to role', () => {
    const role = new Role(/* ... */);
    const permission = new Permission(
      'perm-123',
      'context:create',
      'context',
      'create',
      false,
      new Date().toISOString()
    );
    
    role.addPermission(permission);
    expect(role.hasPermission('context:create')).toBe(true);
  });
});
```

## 🔗 Integration

### With Other Modules

The Role Module integrates with all other modules for access control:

- **Context Module**: Controls context creation and management permissions
- **Plan Module**: Manages plan creation, editing, and approval permissions
- **Confirm Module**: Controls approval workflow permissions
- **Trace Module**: Manages monitoring and data access permissions
- **Extension Module**: Controls extension installation and execution permissions
- **Core Module**: Enforces permissions during workflow orchestration

### Middleware Integration

```typescript
// Express middleware for permission checking
const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const context = {
      context_id: req.params.contextId,
      resource_id: req.params.id
    };
    
    const hasPermission = await roleModule.roleManagementService.checkPermission(
      userId,
      permission,
      context
    );
    
    if (hasPermission) {
      next();
    } else {
      res.status(403).json({
        error: 'Insufficient permissions',
        required_permission: permission
      });
    }
  };
};

// Usage in routes
app.post('/api/v1/contexts', 
  requirePermission('context:create'),
  contextController.createContext
);
```

## 🔐 Security Features

### Role Hierarchy

```typescript
// Create role hierarchy
const adminRole = await roleModule.roleManagementService.createRole({
  name: 'Administrator',
  permissions: ['system:admin', 'system:config', 'system:monitor']
});

const managerRole = await roleModule.roleManagementService.createRole({
  name: 'Manager',
  parent_role_id: adminRole.data.role_id,
  permissions: ['plan:approve', 'confirm:manage']
});

const userRole = await roleModule.roleManagementService.createRole({
  name: 'User',
  parent_role_id: managerRole.data.role_id,
  permissions: ['context:create', 'plan:create']
});
```

### Contextual Permissions

```typescript
// Context-specific permissions
const contextualPermission = {
  permission: 'plan:approve',
  context: {
    context_id: 'ctx-123',
    conditions: [
      {
        field: 'plan.budget',
        operator: 'less_than',
        value: 10000
      }
    ]
  }
};

// Check contextual permission
const canApprove = await roleModule.roleManagementService.checkPermission(
  'user-123',
  'plan:approve',
  {
    context_id: 'ctx-123',
    plan: { budget: 5000 }
  }
);
```

### Audit Logging

```typescript
// Enable comprehensive audit logging
const roleModule = await initializeRoleModule({
  enableAuditLogging: true,
  auditConfig: {
    logPermissionChecks: true,
    logRoleAssignments: true,
    logPermissionChanges: true,
    retentionDays: 90
  }
});

// Query audit logs
const auditLogs = await roleModule.roleManagementService.getAuditLogs({
  user_id: 'user-123',
  action_types: ['permission_check', 'role_assignment'],
  time_range: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31')
  }
});
```

---

The Role Module provides enterprise-grade RBAC capabilities with role hierarchy, contextual permissions, comprehensive audit logging, and seamless integration across all MPLP modules for secure multi-agent collaboration.

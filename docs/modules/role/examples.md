# Role Module - Examples and Use Cases

**Version**: v1.0.0
**Last Updated**: 2025-08-09 16:30:00
**Status**: Enterprise-Grade Production Ready ✅

---

## 📋 **Examples Overview**

This document provides practical examples and enterprise patterns for using the Role Module in real-world scenarios. All examples are based on production-tested code and enterprise best practices.

## 🚀 **Basic Usage Examples**

### Role Creation

#### Simple Role Creation
```typescript
import { RoleManagementService } from '@mplp/role';

const roleService = new RoleManagementService();

// Create a basic project manager role
const result = await roleService.createRole({
  context_id: 'project-123',
  name: 'Project Manager',
  role_type: 'functional',
  display_name: 'Project Manager',
  description: 'Manages project resources and team coordination',
  permissions: [{
    permission_id: 'pm-basic',
    resource_type: 'project',
    resource_id: 'project-123',
    actions: ['read', 'write', 'manage'],
    grant_type: 'direct'
  }]
});

if (result.success) {
  console.log('Role created:', result.data.roleId);
} else {
  console.error('Failed to create role:', result.error);
}
```

#### Role with Multiple Permissions
```typescript
// Create a senior developer role with multiple permissions
const seniorDevRole = await roleService.createRole({
  context_id: 'team-456',
  name: 'Senior Developer',
  role_type: 'functional',
  permissions: [
    {
      permission_id: 'dev-code',
      resource_type: 'project',
      resource_id: '*',
      actions: ['read', 'write'],
      grant_type: 'direct'
    },
    {
      permission_id: 'dev-review',
      resource_type: 'plan',
      resource_id: '*',
      actions: ['read', 'approve'],
      grant_type: 'direct'
    },
    {
      permission_id: 'dev-mentor',
      resource_type: 'trace',
      resource_id: '*',
      actions: ['read'],
      grant_type: 'direct'
    }
  ]
});
```

### Permission Checking

#### Basic Permission Check
```typescript
// Check if a role has permission to write to a project
const hasPermission = await roleService.checkPermission(
  'role-123',
  'project',
  'project-456',
  'write'
);

if (hasPermission.success && hasPermission.data) {
  console.log('Permission granted');
  // Proceed with the operation
} else {
  console.log('Permission denied');
  // Handle unauthorized access
}
```

#### Bulk Permission Checking
```typescript
// Check multiple permissions efficiently
const permissions = [
  { resource_type: 'project', resource_id: 'proj-1', action: 'read' },
  { resource_type: 'plan', resource_id: 'plan-1', action: 'write' },
  { resource_type: 'confirm', resource_id: 'conf-1', action: 'approve' }
];

const results = await Promise.all(
  permissions.map(p => 
    roleService.checkPermission('role-123', p.resource_type, p.resource_id, p.action)
  )
);

const hasAllPermissions = results.every(r => r.success && r.data);
```

## 🏗️ **Advanced RBAC Examples**

### Role Inheritance

#### Parent-Child Role Hierarchy
```typescript
// Create a base developer role
const baseDeveloper = await roleService.createRole({
  context_id: 'org-123',
  name: 'Developer',
  role_type: 'functional',
  permissions: [
    {
      permission_id: 'dev-basic',
      resource_type: 'project',
      resource_id: '*',
      actions: ['read'],
      grant_type: 'direct'
    }
  ]
});

// Create a senior developer role that inherits from base developer
const seniorDeveloper = await roleService.createRole({
  context_id: 'org-123',
  name: 'Senior Developer',
  role_type: 'functional',
  inheritance: {
    parent_roles: [baseDeveloper.data.roleId],
    inheritance_type: 'full',
    inheritance_rules: {
      merge_strategy: 'union',
      conflict_resolution: 'least_restrictive'
    },
    max_depth: 3
  },
  permissions: [
    {
      permission_id: 'senior-review',
      resource_type: 'plan',
      resource_id: '*',
      actions: ['approve'],
      grant_type: 'direct'
    }
  ]
});
```

#### Complex Inheritance with Exclusions
```typescript
// Create a role that inherits but excludes certain permissions
const limitedManager = await roleService.createRole({
  context_id: 'team-789',
  name: 'Limited Manager',
  role_type: 'organizational',
  inheritance: {
    parent_roles: ['full-manager-role'],
    inheritance_type: 'partial',
    excluded_permissions: ['system:admin', 'role:delete'],
    inheritance_rules: {
      merge_strategy: 'intersection',
      conflict_resolution: 'most_restrictive'
    }
  }
});
```

### Role Delegation

#### Temporary Role Delegation
```typescript
// Create a role that can be delegated temporarily
const delegatableRole = await roleService.createRole({
  context_id: 'project-urgent',
  name: 'Emergency Response Lead',
  role_type: 'temporary',
  delegation: {
    can_delegate: true,
    delegation_depth: 2,
    allowed_delegates: ['senior-staff', 'team-leads'],
    delegation_constraints: {
      time_limit: 86400, // 24 hours
      scope_restrictions: ['emergency-only'],
      approval_required: true
    }
  },
  permissions: [
    {
      permission_id: 'emergency-access',
      resource_type: 'system',
      resource_id: '*',
      actions: ['read', 'execute'],
      grant_type: 'direct',
      expiry: new Date(Date.now() + 86400000).toISOString() // 24 hours
    }
  ]
});
```

### Conditional Permissions

#### Time-Based Permissions
```typescript
// Create a role with time-restricted permissions
const nightShiftRole = await roleService.createRole({
  context_id: 'operations-24x7',
  name: 'Night Shift Operator',
  role_type: 'functional',
  scope: {
    level: 'team',
    boundaries: ['night-shift-team'],
    restrictions: {
      time_based: {
        start_time: '18:00',
        end_time: '06:00',
        timezone: 'UTC'
      }
    }
  },
  permissions: [
    {
      permission_id: 'night-ops',
      resource_type: 'system',
      resource_id: 'monitoring-system',
      actions: ['read', 'execute'],
      conditions: {
        time_based: {
          start_time: '18:00',
          end_time: '06:00'
        }
      },
      grant_type: 'conditional'
    }
  ]
});
```

#### Location-Based Permissions
```typescript
// Create a role with location restrictions
const secureAccessRole = await roleService.createRole({
  context_id: 'secure-facility',
  name: 'Secure Area Access',
  role_type: 'system',
  permissions: [
    {
      permission_id: 'secure-data',
      resource_type: 'trace',
      resource_id: 'classified-data',
      actions: ['read'],
      conditions: {
        location_based: {
          allowed_ips: ['192.168.1.0/24', '10.0.0.0/8'],
          allowed_countries: ['US']
        },
        device_based: {
          require_mfa: true,
          trusted_devices_only: true
        }
      },
      grant_type: 'conditional'
    }
  ]
});
```

## 🤖 **Agent Management Examples**

### AI Agent Role Assignment
```typescript
// Create a role specifically for AI agents
const aiAgentRole = await roleService.createRole({
  context_id: 'ai-team',
  name: 'AI Assistant',
  role_type: 'system',
  agents: ['assistant-1', 'assistant-2'],
  agent_management: {
    max_agents: 10,
    auto_assign: true,
    capabilities: {
      core: {
        reasoning: true,
        learning: true,
        communication: true,
        collaboration: true
      },
      domain: {
        expertise: ['data_analysis', 'report_generation'],
        specializations: ['statistical_analysis'],
        knowledge_areas: ['business_intelligence']
      }
    }
  },
  permissions: [
    {
      permission_id: 'ai-data-access',
      resource_type: 'trace',
      resource_id: '*',
      actions: ['read', 'analyze'],
      grant_type: 'direct'
    }
  ]
});
```

### Team Configuration
```typescript
// Configure a team of AI agents with collaborative roles
const teamConfig = await roleService.createRole({
  context_id: 'ddsc-project',
  name: 'DDSC Team Lead',
  role_type: 'organizational',
  team_configuration: {
    max_team_size: 5,
    collaboration_rules: [
      {
        rule_type: 'communication',
        settings: {
          required_updates: true,
          update_frequency: 'hourly',
          escalation_threshold: 2
        }
      },
      {
        rule_type: 'decision_making',
        settings: {
          consensus_required: true,
          voting_threshold: 0.6,
          timeout_minutes: 30
        }
      }
    ]
  }
});
```

## 🔐 **Security and Audit Examples**

### Comprehensive Audit Configuration
```typescript
// Create a role with comprehensive audit settings
const auditedRole = await roleService.createRole({
  context_id: 'financial-system',
  name: 'Financial Analyst',
  role_type: 'functional',
  audit_settings: {
    log_all_actions: true,
    retention_days: 2555, // 7 years for financial compliance
    sensitive_operations: [
      'permission_change',
      'role_assignment',
      'data_export',
      'financial_calculation'
    ],
    notification_settings: {
      email_alerts: true,
      slack_notifications: true,
      webhook_url: 'https://compliance.company.com/audit-webhook'
    }
  },
  validation_rules: {
    required_certifications: ['financial-analyst-cert', 'sox-compliance'],
    min_experience_years: 3,
    background_check: true,
    periodic_review_days: 90
  }
});
```

### Security Validation
```typescript
// Create a role with strict security validation
const highSecurityRole = await roleService.createRole({
  context_id: 'classified-project',
  name: 'Security Analyst',
  role_type: 'system',
  attributes: {
    security_clearance: 'top_secret',
    department: 'security',
    priority: 'critical',
    access_level: 'level_5'
  },
  validation_rules: {
    required_certifications: [
      'security-clearance-ts',
      'cybersecurity-cert',
      'incident-response-cert'
    ],
    min_experience_years: 5,
    background_check: true,
    polygraph_required: true,
    periodic_review_days: 30
  }
});
```

## 📊 **Query and Analytics Examples**

### Role Statistics and Reporting
```typescript
// Get comprehensive role statistics
const stats = await roleService.getStatistics('org-123');

console.log('Role Statistics:', {
  total: stats.data.total,
  active: stats.data.active_count,
  byType: stats.data.by_type,
  byStatus: stats.data.by_status
});

// Query roles with complex filters
const queryResult = await roleService.queryRoles(
  {
    context_id: 'org-123',
    role_type: 'functional',
    status: 'active',
    name_pattern: 'Manager',
    created_after: '2025-01-01T00:00:00Z'
  },
  {
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  }
);
```

### Active Role Monitoring
```typescript
// Monitor active roles in real-time
const activeRoles = await roleService.getActiveRoles('project-123');

// Set up periodic monitoring
setInterval(async () => {
  const current = await roleService.getActiveRoles('project-123');
  if (current.data.total !== activeRoles.data.total) {
    console.log('Role count changed:', {
      previous: activeRoles.data.total,
      current: current.data.total
    });
  }
}, 60000); // Check every minute
```

## 🔧 **Integration Examples**

### Express.js Middleware Integration
```typescript
import express from 'express';
import { RoleController } from '@mplp/role';

const app = express();
const roleController = new RoleController(roleService);

// Role management routes
app.post('/api/v1/roles', roleController.createRole.bind(roleController));
app.get('/api/v1/roles/:id', roleController.getRoleById.bind(roleController));
app.put('/api/v1/roles/:id/status', roleController.updateRoleStatus.bind(roleController));

// Permission checking middleware
const requirePermission = (resourceType: string, action: string) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const roleId = req.user?.roleId;
    const resourceId = req.params.id || '*';
    
    const hasPermission = await roleService.checkPermission(
      roleId,
      resourceType,
      resourceId,
      action
    );
    
    if (hasPermission.success && hasPermission.data) {
      next();
    } else {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: `${resourceType}:${action}`
      });
    }
  };
};

// Protected routes
app.get('/api/v1/projects/:id', 
  requirePermission('project', 'read'),
  projectController.getProject
);

app.put('/api/v1/projects/:id', 
  requirePermission('project', 'write'),
  projectController.updateProject
);
```

### Cache Integration Example
```typescript
import { RoleCacheService } from '@mplp/role';

const cacheService = new RoleCacheService();

// Optimized permission checking with caching
async function checkPermissionWithCache(
  roleId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<boolean> {
  const cacheKey = `perm:${roleId}:${resourceType}:${resourceId}:${action}`;
  
  // Try cache first
  let result = await cacheService.getPermissionCheck(cacheKey);
  
  if (result === null) {
    // Cache miss - check permission and cache result
    const permissionResult = await roleService.checkPermission(
      roleId, resourceType, resourceId, action
    );
    
    result = permissionResult.success && permissionResult.data;
    
    // Cache for 1 minute
    await cacheService.setPermissionCheck(cacheKey, result, 60);
  }
  
  return result;
}
```

---

**These examples demonstrate enterprise-grade RBAC patterns and best practices for production deployment of the Role Module in complex, multi-user environments.**

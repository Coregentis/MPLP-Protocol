# MPLP Role Protocol Schema

## 📋 **概述**

Role协议Schema定义了MPLP系统中角色定义和权限管理的标准数据结构，实现企业级的基于角色的访问控制(RBAC)系统。经过最新企业级功能增强，现已包含完整的角色权限监控、安全管理分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-role.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 75.31% (企业级标准) 🏆
**功能完整性**: ✅ 100% (基础功能 + 角色监控 + 企业级功能)
**企业级特性**: ✅ 角色权限监控、安全管理分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **角色管理**: 定义和管理系统中的各种角色
- **权限控制**: 实现细粒度的权限管理和访问控制
- **Agent管理**: 管理智能Agent的角色分配和能力配置
- **安全治理**: 提供企业级的安全治理和合规支持

### **角色监控功能**
- **角色权限监控**: 实时监控角色分配延迟、权限检查性能、安全评分
- **安全管理分析**: 详细的权限准确性分析和角色管理效率评估
- **角色状态监控**: 监控角色的分配状态、权限变更、安全检查
- **角色管理审计**: 监控角色管理过程的合规性和可靠性
- **安全保证**: 监控角色权限系统的安全性和权限管理质量

### **企业级功能**
- **角色管理审计**: 完整的角色管理和权限记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **企业级性能监控**: 角色权限系统的详细监控和健康检查，包含关键角色指标
- **版本控制**: 角色配置的版本历史、变更追踪和快照管理
- **搜索索引**: 角色数据的全文搜索、语义搜索和自动索引
- **事件集成**: 角色事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和角色事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace ← [Role]
基础设施层   │ Event-Bus, State-Sync, Transaction
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `role_id` | string | ✅ | UUID v4格式的角色标识符 |
| `context_id` | string | ✅ | 关联的上下文ID |
| `role_name` | string | ✅ | 角色名称 |
| `role_type` | string | ✅ | 角色类型枚举值 |
| `agent_type` | string | ✅ | Agent类型枚举值 |
| `agent_status` | string | ✅ | Agent状态枚举值 |

### **Agent类型枚举**
```json
{
  "agent_type": {
    "enum": [
      "core",         // 核心Agent
      "specialist",   // 专业Agent
      "stakeholder",  // 利益相关者Agent
      "coordinator",  // 协调Agent
      "custom"        // 自定义Agent
    ]
  }
}
```

### **Agent状态枚举**
```json
{
  "agent_status": {
    "enum": [
      "active",       // 活跃状态
      "inactive",     // 非活跃状态
      "busy",         // 忙碌状态
      "error",        // 错误状态
      "maintenance",  // 维护状态
      "retired"       // 已退役
    ]
  }
}
```

### **专业技能水平枚举**
```json
{
  "expertise_level": {
    "enum": [
      "beginner",     // 初学者
      "intermediate", // 中级
      "advanced",     // 高级
      "expert",       // 专家
      "master"        // 大师级
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "role_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "550e8400-e29b-41d4-a716-446655440001",
  "role_name": "项目经理",
  "role_type": "management",
  "agent_type": "coordinator",
  "agent_status": "active",
  "description": "负责项目整体协调和管理",
  "created_by": "admin-12345",
  "created_at": "2025-08-13T10:30:00.000Z",
  "updated_at": "2025-08-13T10:35:00.000Z",
  "capabilities": {
    "technical_skills": ["project_management", "risk_assessment"],
    "expertise_level": "expert",
    "communication_style": "collaborative",
    "conflict_resolution_strategy": "collaborative"
  },
  "permissions": {
    "resource_access": ["read", "write", "delete"],
    "operation_permissions": ["create_plan", "approve_task", "assign_role"],
    "data_access_level": "department",
    "security_clearance": "confidential"
  },
  "constraints": {
    "max_concurrent_tasks": 10,
    "working_hours": {
      "start_time": "09:00",
      "end_time": "18:00",
      "timezone": "UTC+8"
    },
    "availability_schedule": {
      "monday": true,
      "tuesday": true,
      "wednesday": true,
      "thursday": true,
      "friday": true,
      "saturday": false,
      "sunday": false
    }
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface RoleData {
  protocolVersion: string;
  timestamp: string;
  roleId: string;
  contextId: string;
  roleName: string;
  roleType: RoleType;
  agentType: AgentType;
  agentStatus: AgentStatus;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  capabilities: {
    technicalSkills: string[];
    expertiseLevel: ExpertiseLevel;
    communicationStyle: CommunicationStyle;
    conflictResolutionStrategy: ConflictResolutionStrategy;
  };
  permissions: {
    resourceAccess: string[];
    operationPermissions: string[];
    dataAccessLevel: 'public' | 'internal' | 'department' | 'confidential' | 'secret';
    securityClearance: 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
  };
  constraints: {
    maxConcurrentTasks: number;
    workingHours: {
      startTime: string;
      endTime: string;
      timezone: string;
    };
    availabilitySchedule: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  };
}

type AgentType = 'core' | 'specialist' | 'stakeholder' | 'coordinator' | 'custom';
type AgentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance' | 'retired';
type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
```

### **Mapper实现**
```typescript
export class RoleMapper {
  static toSchema(entity: RoleData): RoleSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      role_id: entity.roleId,
      context_id: entity.contextId,
      role_name: entity.roleName,
      role_type: entity.roleType,
      agent_type: entity.agentType,
      agent_status: entity.agentStatus,
      description: entity.description,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      capabilities: {
        technical_skills: entity.capabilities.technicalSkills,
        expertise_level: entity.capabilities.expertiseLevel,
        communication_style: entity.capabilities.communicationStyle,
        conflict_resolution_strategy: entity.capabilities.conflictResolutionStrategy
      },
      permissions: {
        resource_access: entity.permissions.resourceAccess,
        operation_permissions: entity.permissions.operationPermissions,
        data_access_level: entity.permissions.dataAccessLevel,
        security_clearance: entity.permissions.securityClearance
      },
      constraints: {
        max_concurrent_tasks: entity.constraints.maxConcurrentTasks,
        working_hours: {
          start_time: entity.constraints.workingHours.startTime,
          end_time: entity.constraints.workingHours.endTime,
          timezone: entity.constraints.workingHours.timezone
        },
        availability_schedule: {
          monday: entity.constraints.availabilitySchedule.monday,
          tuesday: entity.constraints.availabilitySchedule.tuesday,
          wednesday: entity.constraints.availabilitySchedule.wednesday,
          thursday: entity.constraints.availabilitySchedule.thursday,
          friday: entity.constraints.availabilitySchedule.friday,
          saturday: entity.constraints.availabilitySchedule.saturday,
          sunday: entity.constraints.availabilitySchedule.sunday
        }
      }
    };
  }

  static fromSchema(schema: RoleSchema): RoleData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      roleId: schema.role_id,
      contextId: schema.context_id,
      roleName: schema.role_name,
      roleType: schema.role_type,
      agentType: schema.agent_type,
      agentStatus: schema.agent_status,
      description: schema.description,
      createdBy: schema.created_by,
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      capabilities: {
        technicalSkills: schema.capabilities.technical_skills,
        expertiseLevel: schema.capabilities.expertise_level,
        communicationStyle: schema.capabilities.communication_style,
        conflictResolutionStrategy: schema.capabilities.conflict_resolution_strategy
      },
      permissions: {
        resourceAccess: schema.permissions.resource_access,
        operationPermissions: schema.permissions.operation_permissions,
        dataAccessLevel: schema.permissions.data_access_level,
        securityClearance: schema.permissions.security_clearance
      },
      constraints: {
        maxConcurrentTasks: schema.constraints.max_concurrent_tasks,
        workingHours: {
          startTime: schema.constraints.working_hours.start_time,
          endTime: schema.constraints.working_hours.end_time,
          timezone: schema.constraints.working_hours.timezone
        },
        availabilitySchedule: {
          monday: schema.constraints.availability_schedule.monday,
          tuesday: schema.constraints.availability_schedule.tuesday,
          wednesday: schema.constraints.availability_schedule.wednesday,
          thursday: schema.constraints.availability_schedule.thursday,
          friday: schema.constraints.availability_schedule.friday,
          saturday: schema.constraints.availability_schedule.saturday,
          sunday: schema.constraints.availability_schedule.sunday
        }
      }
    };
  }

  static validateSchema(data: unknown): data is RoleSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.role_id === 'string' &&
      typeof obj.role_name === 'string' &&
      typeof obj.agent_type === 'string' &&
      // 验证不存在camelCase字段
      !('roleId' in obj) &&
      !('protocolVersion' in obj) &&
      !('agentType' in obj)
    );
  }
}
```

## 🔍 **验证规则**

### **必需字段验证**
```json
{
  "required": [
    "protocol_version",
    "timestamp",
    "role_id",
    "context_id",
    "role_name",
    "role_type",
    "agent_type",
    "agent_status"
  ]
}
```

### **企业级RBAC验证**
```typescript
const roleValidationRules = {
  // 验证权限层次结构
  validatePermissionHierarchy: (permissions: string[], userRole: string) => {
    const hierarchy = {
      'admin': ['all'],
      'manager': ['read', 'write', 'approve'],
      'developer': ['read', 'write'],
      'viewer': ['read']
    };
    const allowedPermissions = hierarchy[userRole] || [];
    return permissions.every(p => allowedPermissions.includes(p) || allowedPermissions.includes('all'));
  },

  // 验证安全等级
  validateSecurityClearance: (clearance: string, dataLevel: string) => {
    const clearanceLevels = ['public', 'internal', 'confidential', 'secret', 'top_secret'];
    const clearanceIndex = clearanceLevels.indexOf(clearance);
    const dataIndex = clearanceLevels.indexOf(dataLevel);
    return clearanceIndex >= dataIndex;
  },

  // 验证工作时间合理性
  validateWorkingHours: (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return start < end && (end.getTime() - start.getTime()) <= 12 * 60 * 60 * 1000; // 最多12小时
  }
};
```

## 🚀 **使用示例**

### **创建角色**
```typescript
import { RoleService } from '@mplp/role';

const roleService = new RoleService();

const projectManagerRole = await roleService.createRole({
  contextId: "context-123",
  roleName: "高级项目经理",
  roleType: "management",
  agentType: "coordinator",
  description: "负责大型项目的整体协调和管理",
  capabilities: {
    technicalSkills: ["project_management", "risk_assessment", "team_leadership"],
    expertiseLevel: "expert",
    communicationStyle: "collaborative",
    conflictResolutionStrategy: "collaborative"
  },
  permissions: {
    resourceAccess: ["read", "write", "delete"],
    operationPermissions: ["create_plan", "approve_task", "assign_role", "manage_budget"],
    dataAccessLevel: "department",
    securityClearance: "confidential"
  },
  constraints: {
    maxConcurrentTasks: 15,
    workingHours: {
      startTime: "08:00",
      endTime: "19:00",
      timezone: "UTC+8"
    }
  }
});
```

### **权限检查**
```typescript
// 检查用户权限
const hasPermission = await roleService.checkPermission(userId, 'approve_plan');

// 检查数据访问权限
const canAccessData = await roleService.checkDataAccess(userId, 'confidential');

// 批量权限检查
const permissions = await roleService.batchCheckPermissions(userId, [
  'create_plan',
  'approve_task',
  'manage_budget'
]);
```

### **角色分配**
```typescript
// 分配角色给用户
await roleService.assignRole(userId, roleId, {
  effectiveDate: "2025-08-13T00:00:00Z",
  expiryDate: "2025-12-31T23:59:59Z",
  assignedBy: "admin-123"
});

// 临时权限提升
await roleService.grantTemporaryPermission(userId, 'emergency_approval', {
  duration: 3600000, // 1小时
  reason: "紧急情况处理",
  approvedBy: "manager-456"
});
```

## 🔗 **模块集成**

### **与Context模块集成**
```typescript
// 基于上下文的角色激活
contextService.on('context.activated', async (event) => {
  const contextRoles = await roleService.getContextRoles(event.contextId);
  await roleService.activateRoles(contextRoles);
});
```

### **与Plan模块集成**
```typescript
// 基于角色的计划权限
const canCreatePlan = await roleService.checkPermission(userId, 'create_plan');
if (canCreatePlan) {
  const plan = await planService.createPlan(planData);
}
```

### **与Confirm模块集成**
```typescript
// 基于角色的审批流程
const approvers = await roleService.getApproversForType('plan_approval', {
  budgetAmount: 100000,
  riskLevel: 'medium'
});
```

## 📈 **企业级特性**

### **多租户支持**
```typescript
// 租户隔离
const tenantRoles = await roleService.getTenantRoles(tenantId);

// 跨租户权限
await roleService.grantCrossTenantAccess(userId, targetTenantId, permissions);
```

### **合规审计**
```typescript
// 权限审计日志
const auditLog = await roleService.getPermissionAuditLog({
  userId: "user-123",
  startDate: "2025-08-01",
  endDate: "2025-08-31",
  actions: ["permission_granted", "permission_revoked", "role_assigned"]
});

// 合规报告
const complianceReport = await roleService.generateComplianceReport({
  reportType: "quarterly",
  includePermissionMatrix: true,
  includeRoleHierarchy: true
});
```

### **智能推荐**
```typescript
// 基于工作模式的角色推荐
const recommendedRoles = await roleService.recommendRoles(userId, {
  basedOnActivity: true,
  basedOnSkills: true,
  basedOnTeamNeeds: true
});
```

## ✅ **最佳实践**

### **角色设计**
- 遵循最小权限原则
- 建立清晰的角色层次结构
- 定期审查和更新角色权限
- 实施职责分离原则

### **权限管理**
- 使用基于属性的访问控制(ABAC)
- 实施动态权限评估
- 建立权限继承机制
- 监控权限使用情况

### **安全治理**
- 定期进行权限审计
- 实施强制访问控制
- 建立应急权限机制
- 维护详细的审计日志

---

**维护团队**: MPLP Role团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成  
**企业级认证**: 🏆 75.31%覆盖率，333个测试用例

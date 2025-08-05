# MPLP Role协议标准规范 v1.0

## 🎯 **协议目标**

Role协议作为MPLP开源协议体系的核心组件，提供厂商中立的角色和权限管理标准，支持基于角色的访问控制（RBAC）功能。

## 📋 **协议概述**

### **协议职责**
- **角色管理**：角色的创建、更新、删除和查询
- **权限控制**：权限的分配、验证和撤销
- **访问管理**：基于角色的访问控制（RBAC）
- **继承机制**：角色继承和权限传递
- **委托功能**：角色委托和临时授权
- **审计跟踪**：角色和权限变更的完整审计记录

### **设计原则**
- **厂商中立**：不绑定任何特定应用、厂商或实现
- **开源标准**：遵循开源协议的统一接口原则
- **参数化配置**：通过配置参数支持不同应用需求
- **类型安全**：完整的TypeScript类型定义和Schema验证
- **扩展性**：支持未来功能扩展而不破坏兼容性

## 🔧 **标准接口定义**

### **Role协议核心接口**

```typescript
interface RoleProtocol {
  /**
   * 创建新角色
   * @param request 角色创建请求
   * @returns 角色创建响应
   */
  createRole(request: CreateRoleRequest): Promise<RoleResponse>;
  
  /**
   * 更新角色信息
   * @param request 角色更新请求
   * @returns 角色更新响应
   */
  updateRole(request: UpdateRoleRequest): Promise<RoleResponse>;
  
  /**
   * 删除角色
   * @param roleId 角色ID
   * @returns 删除响应
   */
  deleteRole(roleId: string): Promise<DeleteResponse>;
  
  /**
   * 获取角色详情
   * @param roleId 角色ID
   * @returns 角色详情响应
   */
  getRole(roleId: string): Promise<RoleResponse>;
  
  /**
   * 查询角色列表
   * @param filter 查询条件
   * @returns 角色列表响应
   */
  queryRoles(filter: RoleFilter): Promise<RoleListResponse>;
  
  /**
   * 分配权限
   * @param request 权限分配请求
   * @returns 权限分配响应
   */
  assignPermission(request: AssignPermissionRequest): Promise<PermissionResponse>;
  
  /**
   * 撤销权限
   * @param request 权限撤销请求
   * @returns 权限撤销响应
   */
  revokePermission(request: RevokePermissionRequest): Promise<PermissionResponse>;
  
  /**
   * 检查权限
   * @param request 权限检查请求
   * @returns 权限检查响应
   */
  checkPermission(request: PermissionCheckRequest): Promise<PermissionCheckResponse>;
}
```

## 📊 **数据类型定义**

### **核心数据结构**

```typescript
/**
 * 角色定义
 */
interface Role {
  role_id: string;
  context_id: string;
  name: string;
  display_name?: string;
  description?: string;
  role_type: RoleType;
  status: RoleStatus;
  permissions: Permission[];
  scope?: RoleScope;
  inheritance?: RoleInheritance;
  delegation?: RoleDelegation;
  attributes?: RoleAttributes;
  validation_rules?: ValidationRules;
  audit_settings?: AuditSettings;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * 权限定义
 */
interface Permission {
  permission_id: string;
  resource_type: ResourceType;
  resource_id?: string;
  actions: PermissionAction[];
  conditions?: PermissionConditions;
  grant_type: GrantType;
  expiry?: string;
}
```

### **枚举类型**

```typescript
type RoleType = 'system' | 'organizational' | 'functional' | 'project' | 'temporary';
type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'suspended';
type ResourceType = 'context' | 'plan' | 'dialog' | 'extension' | 'trace' | 'role' | 'custom';
type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage';
type GrantType = 'direct' | 'inherited' | 'delegated' | 'temporary';
```

## 🔄 **标准操作流程**

### **角色创建流程**
1. 验证角色数据的完整性和合规性
2. 检查角色名称的唯一性
3. 验证权限的有效性
4. 创建角色实例
5. 记录审计日志
6. 返回创建结果

### **权限验证流程**
1. 解析权限检查请求
2. 查找相关角色和权限
3. 检查直接权限
4. 检查继承权限
5. 检查委托权限
6. 应用条件限制
7. 返回验证结果

## 🛡️ **安全和合规**

### **安全原则**
- **最小权限原则**：默认拒绝，显式授权
- **权限分离**：关键操作需要多重权限
- **时间限制**：支持权限的时间限制
- **审计完整性**：所有权限操作都有审计记录

### **合规支持**
- **GDPR合规**：支持数据保护和隐私权限
- **SOX合规**：支持财务相关的权限控制
- **HIPAA合规**：支持医疗数据的权限管理
- **自定义合规**：支持自定义合规框架

## 📈 **扩展机制**

### **自定义资源类型**
```typescript
interface CustomResourceType {
  type_name: string;
  description: string;
  supported_actions: string[];
  validation_schema: object;
}
```

### **自定义权限条件**
```typescript
interface CustomCondition {
  condition_type: string;
  parameters: Record<string, any>;
  evaluation_logic: string;
}
```

## 🔍 **使用示例**

### **基础角色管理**
```typescript
// 创建项目管理员角色
const roleRequest: CreateRoleRequest = {
  context_id: "project-123",
  name: "project_admin",
  display_name: "项目管理员",
  role_type: "project",
  permissions: [
    {
      resource_type: "project",
      resource_id: "project-123",
      actions: ["read", "update", "manage"],
      grant_type: "direct"
    }
  ]
};

const role = await roleProtocol.createRole(roleRequest);
```

### **权限检查**
```typescript
// 检查用户是否有项目管理权限
const checkRequest: PermissionCheckRequest = {
  subject_id: "user-456",
  resource_type: "project",
  resource_id: "project-123",
  action: "manage"
};

const result = await roleProtocol.checkPermission(checkRequest);
```

## 📚 **相关协议**

- **Context协议**：提供上下文管理，Role协议在其范围内工作
- **Plan协议**：使用Role协议进行任务执行权限控制
- **Dialog协议**：使用Role协议管理对话参与权限
- **Trace协议**：使用Role协议控制监控和审计权限

---

**版本**：1.0.0  
**状态**：标准规范  
**维护者**：MPLP协议委员会  
**最后更新**：2025-01-04

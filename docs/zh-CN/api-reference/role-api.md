# Role API 参考

**基于角色的访问控制和能力管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Role%20模块-blue.svg)](../modules/role/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--role.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-323%2F323%20通过-green.svg)](../modules/role/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/role-api.md)

---

## 🎯 概述

Role API为多智能体系统提供全面的基于角色的访问控制（RBAC）和能力管理功能。它支持细粒度权限控制、角色继承、委托管理和企业级安全特性。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  RoleController,
  RoleManagementService,
  CreateRoleRequestDTO,
  UpdateRoleRequestDTO,
  RoleResponseDTO,
  UnifiedSecurityAPI
} from 'mplp/modules/role';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const roleModule = mplp.getModule('role');
```

## 🏗️ 核心接口

### **RoleResponseDTO** (响应接口)

```typescript
interface RoleResponseDTO {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  roleId: string;                 // 唯一角色标识符
  name: string;                   // 角色名称
  description?: string;           // 角色描述
  type: RoleType;                 // 角色类型
  status: RoleStatus;             // 角色状态
  
  // 权限和能力字段
  permissions: Permission[];      // 权限列表
  capabilities: Capability[];     // 能力列表
  inheritance: RoleInheritance;   // 角色继承配置
  delegation: DelegationConfig;   // 委托设置
  
  // 安全和审计字段
  securityLevel: SecurityLevel;   // 安全级别
  auditTrail: AuditTrail;        // 审计跟踪信息
  
  // 企业级功能
  complexityScore: number;        // 角色复杂度评分
  agentAssignments: AgentAssignment[]; // 智能体分配
  
  // 元数据
  metadata?: Record<string, any>; // 自定义元数据
  createdAt?: string;            // 创建时间戳
  updatedAt?: string;            // 最后更新时间戳
}
```

### **CreateRoleRequestDTO** (创建请求接口)

```typescript
interface CreateRoleRequestDTO {
  name: string;                   // 必需：角色名称
  description?: string;           // 可选：角色描述
  type: RoleType;                 // 必需：角色类型
  
  // 权限配置
  permissions?: Permission[];     // 初始权限
  capabilities?: Capability[];    // 初始能力
  
  // 继承和委托
  parentRoles?: string[];         // 父角色ID
  delegationConfig?: Partial<DelegationConfig>;
  
  // 安全设置
  securityLevel?: SecurityLevel;  // 安全级别
  
  // 元数据
  metadata?: Record<string, any>;
}
```

### **UpdateRoleRequestDTO** (更新请求接口)

```typescript
interface UpdateRoleRequestDTO {
  name?: string;                  // 可选：更新名称
  description?: string;           // 可选：更新描述
  status?: RoleStatus;            // 可选：更新状态
  
  // 权限更新
  permissions?: Permission[];
  capabilities?: Capability[];
  
  // 配置更新
  delegationConfig?: Partial<DelegationConfig>;
  securityLevel?: SecurityLevel;
  
  // 元数据更新
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **RoleType** (角色类型)

```typescript
enum RoleType {
  SYSTEM = 'system',              // 系统角色
  FUNCTIONAL = 'functional',      // 功能角色
  ORGANIZATIONAL = 'organizational', // 组织角色
  PROJECT = 'project',            // 项目特定角色
  TEMPORARY = 'temporary'         // 临时角色
}
```

### **RoleStatus** (角色状态)

```typescript
enum RoleStatus {
  ACTIVE = 'active',              // 活跃状态
  INACTIVE = 'inactive',          // 非活跃状态
  SUSPENDED = 'suspended',        // 暂停状态
  ARCHIVED = 'archived'           // 已归档状态
}
```

### **SecurityLevel** (安全级别)

```typescript
enum SecurityLevel {
  LOW = 'low',                    // 低安全级别
  MEDIUM = 'medium',              // 中等安全级别
  HIGH = 'high',                  // 高安全级别
  CRITICAL = 'critical'           // 关键安全级别
}
```

## 🎮 控制器API

### **RoleController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建角色**
```typescript
async createRole(dto: CreateRoleRequestDTO): Promise<ApiResponse<RoleResponseDTO>>
```

**HTTP端点**: `POST /api/roles`

**请求示例**:
```json
{
  "name": "项目经理",
  "description": "具有完整项目访问权限的项目管理角色",
  "type": "project",
  "permissions": [
    {
      "resource": "project",
      "actions": ["create", "read", "update", "delete"],
      "conditions": ["owner", "assigned"]
    }
  ],
  "capabilities": [
    {
      "name": "project_management",
      "level": "advanced",
      "scope": "project"
    }
  ],
  "securityLevel": "high"
}
```

#### **获取角色**
```typescript
async getRole(roleId: string): Promise<ApiResponse<RoleResponseDTO>>
```

**HTTP端点**: `GET /api/roles/{roleId}`

#### **更新角色**
```typescript
async updateRole(roleId: string, dto: UpdateRoleRequestDTO): Promise<ApiResponse<RoleResponseDTO>>
```

**HTTP端点**: `PUT /api/roles/{roleId}`

#### **删除角色**
```typescript
async deleteRole(roleId: string): Promise<ApiResponse<void>>
```

**HTTP端点**: `DELETE /api/roles/{roleId}`

#### **列出角色**
```typescript
async listRoles(filter?: RoleQueryFilterDTO, pagination?: PaginationParamsDTO): Promise<ApiResponse<RoleResponseDTO[]>>
```

**HTTP端点**: `GET /api/roles`

**查询参数**:
- `type`: 按角色类型过滤
- `status`: 按状态过滤
- `securityLevel`: 按安全级别过滤
- `limit`: 限制结果数量
- `offset`: 分页偏移量

#### **检查权限**
```typescript
async checkPermission(dto: CheckPermissionRequestDTO): Promise<ApiResponse<PermissionCheckResult>>
```

**HTTP端点**: `POST /api/roles/check-permission`

**请求示例**:
```json
{
  "userId": "user-123",
  "resource": "project:proj-456",
  "action": "update",
  "context": {
    "environment": "production",
    "timestamp": "2025-09-04T10:30:00Z"
  }
}
```

#### **分配角色**
```typescript
async assignRole(dto: AssignRoleRequestDTO): Promise<ApiResponse<RoleAssignmentResult>>
```

**HTTP端点**: `POST /api/roles/assign`

#### **撤销角色**
```typescript
async revokeRole(dto: RevokeRoleRequestDTO): Promise<ApiResponse<RoleRevocationResult>>
```

**HTTP端点**: `POST /api/roles/revoke`

## 🔧 服务层API

### **RoleManagementService**

核心业务逻辑服务，提供角色管理功能。

#### **主要方法**

```typescript
class RoleManagementService {
  // 基础CRUD操作
  async createRole(request: CreateRoleRequest): Promise<RoleEntity>;
  async getRoleById(roleId: string): Promise<RoleEntity | null>;
  async updateRole(request: UpdateRoleRequest): Promise<RoleEntity>;
  async deleteRole(roleId: string): Promise<boolean>;
  
  // 角色分配操作
  async assignRole(request: AssignRoleRequest): Promise<RoleAssignmentResult>;
  async revokeRole(userId: string, roleId: string): Promise<RoleRevocationResult>;
  async getUserRoles(userId: string): Promise<RoleEntity[]>;
  
  // 权限操作
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
  async getUserPermissions(userId: string): Promise<Permission[]>;
  async getRolePermissions(roleId: string): Promise<Permission[]>;
  
  // 高级操作
  async getRoleHierarchy(roleId: string): Promise<RoleHierarchy>;
  async validateRoleAssignment(userId: string, roleId: string): Promise<ValidationResult>;
  async getRoleComplexity(roleId: string): Promise<ComplexityAnalysis>;
  
  // 分析和监控
  async getRoleStatistics(): Promise<RoleStatistics>;
  async getRoleUsageMetrics(roleId: string): Promise<UsageMetrics>;
}
```

### **UnifiedSecurityAPI**

企业级统一安全API，提供全面的访问控制。

#### **核心方法**

```typescript
class UnifiedSecurityAPI {
  // 权限检查
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean>;
  async checkMultiplePermissions(userId: string, checks: PermissionCheck[]): Promise<PermissionResult[]>;
  
  // 角色管理
  async getUserEffectiveRoles(userId: string): Promise<EffectiveRole[]>;
  async getRoleCapabilities(roleId: string): Promise<Capability[]>;
  
  // 安全验证
  async validateSecurityContext(context: SecurityContext): Promise<ValidationResult>;
  async auditSecurityEvent(event: SecurityEvent): Promise<void>;
  
  // 企业级功能
  async enforceSecurityPolicy(policy: SecurityPolicy): Promise<EnforcementResult>;
  async generateSecurityReport(criteria: ReportCriteria): Promise<SecurityReport>;
}
```

## 📊 数据结构

### **Permission** (权限定义)

```typescript
interface Permission {
  id: string;                     // 权限ID
  resource: string;               // 资源标识符
  actions: string[];              // 允许的操作
  conditions?: string[];          // 权限条件
  scope?: PermissionScope;        // 权限范围
  constraints?: PermissionConstraint[]; // 附加约束
}
```

### **Capability** (能力定义)

```typescript
interface Capability {
  name: string;                   // 能力名称
  level: CapabilityLevel;         // 能力级别
  scope: CapabilityScope;         // 能力范围
  requirements?: string[];        // 前置要求
  metadata?: Record<string, any>; // 附加元数据
}
```

### **RoleInheritance** (角色继承配置)

```typescript
interface RoleInheritance {
  enabled: boolean;               // 继承启用
  parentRoles: string[];          // 父角色ID
  inheritanceType: InheritanceType; // 继承类型
  restrictions?: InheritanceRestriction[]; // 继承限制
}
```

### **DelegationConfig** (委托配置)

```typescript
interface DelegationConfig {
  enabled: boolean;               // 委托启用
  maxDelegationDepth: number;     // 最大委托深度
  allowedDelegates: string[];     // 允许的委托用户ID
  restrictions: DelegationRestriction[]; // 委托限制
  auditRequired: boolean;         // 审计要求
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/role/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/role/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/role/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/role/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文

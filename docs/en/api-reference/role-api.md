# Role API Reference

**Role-Based Access Control and Capability Management - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Role%20Module-blue.svg)](../modules/role/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--role.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-323%2F323%20passing-green.svg)](../modules/role/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/role-api.md)

---

## 🎯 Overview

The Role API provides comprehensive role-based access control (RBAC) and capability management for multi-agent systems. It enables fine-grained permission control, role inheritance, delegation management, and enterprise-grade security features. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  RoleController,
  RoleManagementService,
  CreateRoleRequestDTO,
  UpdateRoleRequestDTO,
  RoleResponseDTO,
  UnifiedSecurityAPI
} from 'mplp/modules/role';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const roleModule = mplp.getModule('role');
```

## 🏗️ Core Interfaces

### **RoleResponseDTO** (Response Interface)

```typescript
interface RoleResponseDTO {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  roleId: string;                 // Unique role identifier
  name: string;                   // Role name
  description?: string;           // Role description
  type: RoleType;                 // Role type
  status: RoleStatus;             // Role status
  
  // Permission and capability fields
  permissions: Permission[];      // Permission list
  capabilities: Capability[];     // Capability list
  inheritance: RoleInheritance;   // Role inheritance configuration
  delegation: DelegationConfig;   // Delegation settings
  
  // Security and audit fields
  securityLevel: SecurityLevel;   // Security level
  auditTrail: AuditTrail;        // Audit trail information
  
  // Enterprise features
  complexityScore: number;        // Role complexity score
  agentAssignments: AgentAssignment[]; // Agent assignments
  
  // Metadata
  metadata?: Record<string, any>; // Custom metadata
  createdAt?: string;            // Creation timestamp
  updatedAt?: string;            // Last update timestamp
}
```

### **CreateRoleRequestDTO** (Create Request Interface)

```typescript
interface CreateRoleRequestDTO {
  name: string;                   // Required: Role name
  description?: string;           // Optional: Role description
  type: RoleType;                 // Required: Role type
  
  // Permission configuration
  permissions?: Permission[];     // Initial permissions
  capabilities?: Capability[];    // Initial capabilities
  
  // Inheritance and delegation
  parentRoles?: string[];         // Parent role IDs
  delegationConfig?: Partial<DelegationConfig>;
  
  // Security settings
  securityLevel?: SecurityLevel;  // Security level
  
  // Metadata
  metadata?: Record<string, any>;
}
```

### **UpdateRoleRequestDTO** (Update Request Interface)

```typescript
interface UpdateRoleRequestDTO {
  name?: string;                  // Optional: Update name
  description?: string;           // Optional: Update description
  status?: RoleStatus;            // Optional: Update status
  
  // Permission updates
  permissions?: Permission[];
  capabilities?: Capability[];
  
  // Configuration updates
  delegationConfig?: Partial<DelegationConfig>;
  securityLevel?: SecurityLevel;
  
  // Metadata updates
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **RoleType** (Role Type)

```typescript
enum RoleType {
  SYSTEM = 'system',              // System role
  FUNCTIONAL = 'functional',      // Functional role
  ORGANIZATIONAL = 'organizational', // Organizational role
  PROJECT = 'project',            // Project-specific role
  TEMPORARY = 'temporary'         // Temporary role
}
```

### **RoleStatus** (Role Status)

```typescript
enum RoleStatus {
  ACTIVE = 'active',              // Active status
  INACTIVE = 'inactive',          // Inactive status
  SUSPENDED = 'suspended',        // Suspended status
  ARCHIVED = 'archived'           // Archived status
}
```

### **SecurityLevel** (Security Level)

```typescript
enum SecurityLevel {
  LOW = 'low',                    // Low security
  MEDIUM = 'medium',              // Medium security
  HIGH = 'high',                  // High security
  CRITICAL = 'critical'           // Critical security
}
```

## 🎮 Controller API

### **RoleController**

Main REST API controller providing HTTP endpoint access.

#### **Create Role**
```typescript
async createRole(dto: CreateRoleRequestDTO): Promise<ApiResponse<RoleResponseDTO>>
```

**HTTP Endpoint**: `POST /api/roles`

**Request Example**:
```json
{
  "name": "Project Manager",
  "description": "Project management role with full project access",
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

#### **Get Role**
```typescript
async getRole(roleId: string): Promise<ApiResponse<RoleResponseDTO>>
```

**HTTP Endpoint**: `GET /api/roles/{roleId}`

#### **Update Role**
```typescript
async updateRole(roleId: string, dto: UpdateRoleRequestDTO): Promise<ApiResponse<RoleResponseDTO>>
```

**HTTP Endpoint**: `PUT /api/roles/{roleId}`

#### **Delete Role**
```typescript
async deleteRole(roleId: string): Promise<ApiResponse<void>>
```

**HTTP Endpoint**: `DELETE /api/roles/{roleId}`

#### **List Roles**
```typescript
async listRoles(filter?: RoleQueryFilterDTO, pagination?: PaginationParamsDTO): Promise<ApiResponse<RoleResponseDTO[]>>
```

**HTTP Endpoint**: `GET /api/roles`

**Query Parameters**:
- `type`: Filter by role type
- `status`: Filter by status
- `securityLevel`: Filter by security level
- `limit`: Limit results
- `offset`: Pagination offset

#### **Check Permission**
```typescript
async checkPermission(dto: CheckPermissionRequestDTO): Promise<ApiResponse<PermissionCheckResult>>
```

**HTTP Endpoint**: `POST /api/roles/check-permission`

**Request Example**:
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

#### **Assign Role**
```typescript
async assignRole(dto: AssignRoleRequestDTO): Promise<ApiResponse<RoleAssignmentResult>>
```

**HTTP Endpoint**: `POST /api/roles/assign`

#### **Revoke Role**
```typescript
async revokeRole(dto: RevokeRoleRequestDTO): Promise<ApiResponse<RoleRevocationResult>>
```

**HTTP Endpoint**: `POST /api/roles/revoke`

## 🔧 Service Layer API

### **RoleManagementService**

Core business logic service providing role management functionality.

#### **Main Methods**

```typescript
class RoleManagementService {
  // Basic CRUD operations
  async createRole(request: CreateRoleRequest): Promise<RoleEntity>;
  async getRoleById(roleId: string): Promise<RoleEntity | null>;
  async updateRole(request: UpdateRoleRequest): Promise<RoleEntity>;
  async deleteRole(roleId: string): Promise<boolean>;
  
  // Role assignment operations
  async assignRole(request: AssignRoleRequest): Promise<RoleAssignmentResult>;
  async revokeRole(userId: string, roleId: string): Promise<RoleRevocationResult>;
  async getUserRoles(userId: string): Promise<RoleEntity[]>;
  
  // Permission operations
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
  async getUserPermissions(userId: string): Promise<Permission[]>;
  async getRolePermissions(roleId: string): Promise<Permission[]>;
  
  // Advanced operations
  async getRoleHierarchy(roleId: string): Promise<RoleHierarchy>;
  async validateRoleAssignment(userId: string, roleId: string): Promise<ValidationResult>;
  async getRoleComplexity(roleId: string): Promise<ComplexityAnalysis>;
  
  // Analytics and monitoring
  async getRoleStatistics(): Promise<RoleStatistics>;
  async getRoleUsageMetrics(roleId: string): Promise<UsageMetrics>;
}
```

### **UnifiedSecurityAPI**

Enterprise-grade unified security API for comprehensive access control.

#### **Core Methods**

```typescript
class UnifiedSecurityAPI {
  // Permission checking
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean>;
  async checkMultiplePermissions(userId: string, checks: PermissionCheck[]): Promise<PermissionResult[]>;
  
  // Role management
  async getUserEffectiveRoles(userId: string): Promise<EffectiveRole[]>;
  async getRoleCapabilities(roleId: string): Promise<Capability[]>;
  
  // Security validation
  async validateSecurityContext(context: SecurityContext): Promise<ValidationResult>;
  async auditSecurityEvent(event: SecurityEvent): Promise<void>;
  
  // Enterprise features
  async enforceSecurityPolicy(policy: SecurityPolicy): Promise<EnforcementResult>;
  async generateSecurityReport(criteria: ReportCriteria): Promise<SecurityReport>;
}
```

## 📊 Data Structures

### **Permission** (Permission Definition)

```typescript
interface Permission {
  id: string;                     // Permission ID
  resource: string;               // Resource identifier
  actions: string[];              // Allowed actions
  conditions?: string[];          // Permission conditions
  scope?: PermissionScope;        // Permission scope
  constraints?: PermissionConstraint[]; // Additional constraints
}
```

### **Capability** (Capability Definition)

```typescript
interface Capability {
  name: string;                   // Capability name
  level: CapabilityLevel;         // Capability level
  scope: CapabilityScope;         // Capability scope
  requirements?: string[];        // Prerequisites
  metadata?: Record<string, any>; // Additional metadata
}
```

### **RoleInheritance** (Role Inheritance Configuration)

```typescript
interface RoleInheritance {
  enabled: boolean;               // Inheritance enabled
  parentRoles: string[];          // Parent role IDs
  inheritanceType: InheritanceType; // Inheritance type
  restrictions?: InheritanceRestriction[]; // Inheritance restrictions
}
```

### **DelegationConfig** (Delegation Configuration)

```typescript
interface DelegationConfig {
  enabled: boolean;               // Delegation enabled
  maxDelegationDepth: number;     // Maximum delegation depth
  allowedDelegates: string[];     // Allowed delegate user IDs
  restrictions: DelegationRestriction[]; // Delegation restrictions
  auditRequired: boolean;         // Audit requirement
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/role/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/role/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/role/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/role/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English

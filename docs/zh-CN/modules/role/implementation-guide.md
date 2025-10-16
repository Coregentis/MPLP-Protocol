# Role模块实施指南

> **🌐 语言导航**: [English](../../../en/modules/role/implementation-guide.md) | [中文](implementation-guide.md)



**多智能体协议生命周期平台 - Role模块实施指南 v1.0.0-alpha**

[![实施](https://img.shields.io/badge/implementation-Enterprise%20Ready-green.svg)](./README.md)
[![模块](https://img.shields.io/badge/module-Role-purple.svg)](./protocol-specification.md)
[![RBAC](https://img.shields.io/badge/RBAC-Enterprise%20Grade-green.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/role/implementation-guide.md)

---

## 🎯 实施概览

本指南提供Role模块的全面实施指导，包括企业级RBAC系统、权限管理模式、基于能力的授权和安全最佳实践。涵盖基础角色管理场景和高级企业安全实施。

### **实施范围**
- **企业RBAC系统**: 分层角色管理和继承
- **权限引擎**: 动态权限评估和策略执行
- **能力授权**: 基于技能的访问控制和验证
- **安全框架**: 审计跟踪、合规和威胁检测
- **跨模块集成**: 与Context、Plan和Trace模块的集成

### **目标实施**
- **独立RBAC服务**: 独立的Role模块部署
- **企业安全平台**: 具有合规功能的高级安全
- **多租户授权**: 可扩展的多组织安全
- **实时访问控制**: 高性能权限检查

---

## 🏗️ 核心服务实施

### **企业RBAC服务实施**

#### **角色管理服务**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRegistry } from './registries/permission.registry';
import { CapabilityValidator } from './validators/capability.validator';
import { AuditLogger } from './loggers/audit.logger';

@Injectable()
export class EnterpriseRoleService {
  private readonly logger = new Logger(EnterpriseRoleService.name);

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRegistry: PermissionRegistry,
    private readonly capabilityValidator: CapabilityValidator,
    private readonly auditLogger: AuditLogger
  ) {}

  async createRole(request: CreateRoleRequest): Promise<Role> {
    this.logger.log(`创建角色: ${request.name}`);

    // 阶段1: 验证角色定义
    await this.validateRoleDefinition(request);

    // 阶段2: 检查冲突和依赖
    await this.checkRoleConflicts(request);

    // 阶段3: 构建具有继承的角色
    const role = await this.buildRoleWithInheritance(request);

    // 阶段4: 注册权限
    await this.registerRolePermissions(role);

    // 阶段5: 验证能力
    await this.validateRoleCapabilities(role);

    // 阶段6: 创建角色实体
    const createdRole = await this.roleRepository.create({
      roleId: this.generateRoleId(),
      name: request.name,
      displayName: request.displayName,
      description: request.description,
      roleType: request.roleType || 'functional',
      permissions: role.permissions,
      capabilities: role.capabilities,
      constraints: request.constraints || {},
      inheritance: request.inheritance || {},
      metadata: request.metadata || {},
      status: RoleStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 阶段7: 审计角色创建
    await this.auditLogger.logRoleCreation({
      roleId: createdRole.roleId,
      roleName: createdRole.name,
      createdBy: request.createdBy,
      permissions: createdRole.permissions.length,
      capabilities: createdRole.capabilities.length,
      timestamp: new Date()
    });

    this.logger.log(`角色创建成功: ${createdRole.roleId}`);
    return createdRole;
  }

  async assignRole(request: AssignRoleRequest): Promise<RoleAssignment> {
    this.logger.log(`分配角色: ${request.roleId} 给用户 ${request.userId}`);

    // 验证角色存在
    const role = await this.roleRepository.findById(request.roleId);
    if (!role) {
      throw new Error(`角色未找到: ${request.roleId}`);
    }

    // 验证用户能力匹配
    if (role.capabilities.length > 0) {
      const capabilityMatch = await this.capabilityValidator.validateUserCapabilities(
        request.userId,
        role.capabilities
      );

      if (!capabilityMatch.isValid) {
        throw new Error(`用户能力不匹配角色要求: ${capabilityMatch.missingCapabilities.join(', ')}`);
      }
    }

    // 检查分配约束
    await this.validateAssignmentConstraints(request);

    // 创建角色分配
    const assignment = await this.roleRepository.createAssignment({
      assignmentId: this.generateAssignmentId(),
      roleId: request.roleId,
      userId: request.userId,
      contextId: request.contextId,
      assignmentType: request.assignmentType || 'permanent',
      effectiveDate: request.effectiveDate || new Date(),
      expirationDate: request.expirationDate,
      constraints: request.constraints || {},
      assignedBy: request.assignedBy,
      assignedAt: new Date(),
      status: AssignmentStatus.Active
    });

    // 审计角色分配
    await this.auditLogger.logRoleAssignment({
      assignmentId: assignment.assignmentId,
      roleId: request.roleId,
      userId: request.userId,
      assignedBy: request.assignedBy,
      timestamp: new Date()
    });

    return assignment;
  }

  private async validateRoleDefinition(request: CreateRoleRequest): Promise<void> {
    // 验证角色名称格式
    if (!/^[a-z][a-z0-9_]*$/.test(request.name)) {
      throw new ValidationError('角色名称必须以小写字母开头，只能包含小写字母、数字和下划线');
    }

    // 验证权限格式
    for (const permission of request.permissions || []) {
      if (!/^[a-z]+:[a-z_]+$/.test(permission)) {
        throw new ValidationError(`权限格式无效: ${permission}`);
      }
    }

    // 验证能力定义
    for (const capability of request.capabilities || []) {
      const isValid = await this.capabilityValidator.validateCapabilityDefinition(capability);
      if (!isValid) {
        throw new ValidationError(`能力定义无效: ${capability}`);
      }
    }
  }

  private async buildRoleWithInheritance(request: CreateRoleRequest): Promise<Role> {
    let permissions = new Set(request.permissions || []);
    let capabilities = new Set(request.capabilities || []);

    // 处理角色继承
    if (request.inheritance?.parentRoles) {
      for (const parentRoleId of request.inheritance.parentRoles) {
        const parentRole = await this.roleRepository.findById(parentRoleId);
        if (parentRole) {
          // 继承权限
          parentRole.permissions.forEach(permission => permissions.add(permission));
          
          // 继承能力
          parentRole.capabilities.forEach(capability => capabilities.add(capability));
        }
      }
    }

    return {
      ...request,
      permissions: Array.from(permissions),
      capabilities: Array.from(capabilities)
    } as Role;
  }
}
```

#### **权限评估引擎实施**
```typescript
@Injectable()
export class PermissionEvaluationEngine {
  private readonly logger = new Logger(PermissionEvaluationEngine.name);
  private readonly permissionCache = new LRUCache<string, PermissionDecision>({ max: 100000 });

  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly policyEngine: PolicyEngine,
    private readonly contextResolver: ContextResolver,
    private readonly auditLogger: AuditLogger
  ) {}

  async checkPermission(request: PermissionCheckRequest): Promise<PermissionDecision> {
    const startTime = Date.now();
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(request);
    
    // 检查缓存
    const cachedDecision = this.permissionCache.get(cacheKey);
    if (cachedDecision && this.isDecisionValid(cachedDecision)) {
      await this.auditPermissionCheck(request, cachedDecision, true);
      return cachedDecision;
    }

    try {
      // 阶段1: 解析安全上下文
      const securityContext = await this.contextResolver.resolveSecurityContext(request);

      // 阶段2: 获取用户角色
      const userRoles = await this.getUserRoles(request.userId, securityContext);

      // 阶段3: 收集有效权限
      const effectivePermissions = await this.collectEffectivePermissions(userRoles, securityContext);

      // 阶段4: 评估权限匹配
      const permissionMatch = this.evaluatePermissionMatch(
        effectivePermissions,
        request.resource,
        request.action
      );

      // 阶段5: 应用策略规则
      const policyDecision = await this.evaluatePolicies(request, securityContext, userRoles);

      // 阶段6: 合并决策
      const finalDecision = this.mergeDecisions(permissionMatch, policyDecision);

      // 阶段7: 创建权限决策
      const decision: PermissionDecision = {
        granted: finalDecision.granted,
        reason: finalDecision.reason,
        applicableRoles: userRoles.map(role => ({
          roleId: role.roleId,
          roleName: role.name,
          permissionSource: this.getPermissionSource(role, request.resource, request.action)
        })),
        constraintsApplied: finalDecision.constraints,
        evaluationTimeMs: Date.now() - startTime,
        cacheHit: false,
        evaluatedAt: new Date(),
        expiresAt: new Date(Date.now() + 300000) // 5分钟缓存
      };

      // 缓存决策
      this.permissionCache.set(cacheKey, decision);

      // 审计权限检查
      await this.auditPermissionCheck(request, decision, false);

      return decision;

    } catch (error) {
      this.logger.error(`权限评估失败: ${error.message}`, error.stack);
      
      // 返回拒绝决策
      const denyDecision: PermissionDecision = {
        granted: false,
        reason: `评估错误: ${error.message}`,
        applicableRoles: [],
        constraintsApplied: [],
        evaluationTimeMs: Date.now() - startTime,
        cacheHit: false,
        evaluatedAt: new Date()
      };

      await this.auditPermissionCheck(request, denyDecision, false);
      return denyDecision;
    }
  }

  private async getUserRoles(userId: string, context: SecurityContext): Promise<Role[]> {
    // 获取用户的所有角色分配
    const assignments = await this.roleRepository.getUserRoleAssignments(userId);
    
    // 过滤有效的分配
    const validAssignments = assignments.filter(assignment => {
      // 检查分配是否在有效期内
      const now = new Date();
      if (assignment.effectiveDate && assignment.effectiveDate > now) {
        return false;
      }
      if (assignment.expirationDate && assignment.expirationDate < now) {
        return false;
      }

      // 检查上下文匹配
      if (assignment.contextId && assignment.contextId !== context.contextId) {
        return false;
      }

      return assignment.status === AssignmentStatus.Active;
    });

    // 获取角色详情
    const roles = await Promise.all(
      validAssignments.map(assignment => 
        this.roleRepository.findById(assignment.roleId)
      )
    );

    return roles.filter(role => role !== null);
  }

  private async collectEffectivePermissions(
    roles: Role[],
    context: SecurityContext
  ): Promise<EffectivePermission[]> {
    const permissions: EffectivePermission[] = [];

    for (const role of roles) {
      for (const permission of role.permissions) {
        // 解析权限
        const [resource, action] = permission.split(':');
        
        permissions.push({
          resource: resource,
          action: action,
          sourceRole: role.roleId,
          constraints: role.constraints || {},
          inherited: role.inheritance?.parentRoles?.length > 0
        });
      }
    }

    return permissions;
  }

  private evaluatePermissionMatch(
    permissions: EffectivePermission[],
    requestedResource: string,
    requestedAction: string
  ): PermissionMatchResult {
    // 查找精确匹配
    const exactMatch = permissions.find(p => 
      p.resource === requestedResource && p.action === requestedAction
    );

    if (exactMatch) {
      return {
        granted: true,
        matchType: 'exact',
        matchedPermission: exactMatch
      };
    }

    // 查找通配符匹配
    const wildcardMatch = permissions.find(p => 
      (p.resource === '*' || p.resource === requestedResource) &&
      (p.action === '*' || p.action === requestedAction)
    );

    if (wildcardMatch) {
      return {
        granted: true,
        matchType: 'wildcard',
        matchedPermission: wildcardMatch
      };
    }

    return {
      granted: false,
      matchType: 'none'
    };
  }

  private async evaluatePolicies(
    request: PermissionCheckRequest,
    context: SecurityContext,
    roles: Role[]
  ): Promise<PolicyDecision> {
    // 获取适用的策略
    const applicablePolicies = await this.policyEngine.getApplicablePolicies(
      request.resource,
      request.action,
      context
    );

    // 评估每个策略
    const policyResults = await Promise.all(
      applicablePolicies.map(policy => 
        this.policyEngine.evaluatePolicy(policy, {
          userId: request.userId,
          resource: request.resource,
          action: request.action,
          context: context,
          roles: roles
        })
      )
    );

    // 合并策略结果
    return this.mergePolicyResults(policyResults);
  }

  private mergeDecisions(
    permissionMatch: PermissionMatchResult,
    policyDecision: PolicyDecision
  ): FinalDecision {
    // 如果权限匹配失败，直接拒绝
    if (!permissionMatch.granted) {
      return {
        granted: false,
        reason: '缺少所需权限',
        constraints: []
      };
    }

    // 如果策略拒绝，拒绝访问
    if (!policyDecision.granted) {
      return {
        granted: false,
        reason: policyDecision.reason || '策略拒绝访问',
        constraints: policyDecision.constraints || []
      };
    }

    // 权限和策略都允许
    return {
      granted: true,
      reason: '权限和策略验证通过',
      constraints: [
        ...(permissionMatch.matchedPermission?.constraints ? [permissionMatch.matchedPermission.constraints] : []),
        ...(policyDecision.constraints || [])
      ]
    };
  }
}
```

---

## 🔗 相关文档

- [Role模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**实施版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业就绪  

**⚠️ Alpha版本说明**: Role模块实施指南在Alpha版本中提供企业就绪的实施指导。额外的高级实施模式和优化将在Beta版本中添加。

# Role Module Implementation Guide

**Multi-Agent Protocol Lifecycle Platform - Role Module Implementation Guide v1.0.0-alpha**

[![Implementation](https://img.shields.io/badge/implementation-Enterprise%20Ready-green.svg)](./README.md)
[![Module](https://img.shields.io/badge/module-Role-purple.svg)](./protocol-specification.md)
[![RBAC](https://img.shields.io/badge/RBAC-Enterprise%20Grade-green.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/role/implementation-guide.md)

---

## 🎯 Implementation Overview

This guide provides comprehensive implementation guidance for the Role Module, including enterprise-grade RBAC systems, permission management patterns, capability-based authorization, and security best practices. It covers both basic role management scenarios and advanced enterprise security implementations.

### **Implementation Scope**
- **Enterprise RBAC System**: Hierarchical role management and inheritance
- **Permission Engine**: Dynamic permission evaluation and policy enforcement
- **Capability Authorization**: Skill-based access control and validation
- **Security Framework**: Audit trails, compliance, and threat detection
- **Cross-Module Integration**: Integration with Context, Plan, and Trace modules

### **Target Implementations**
- **Standalone RBAC Service**: Independent Role Module deployment
- **Enterprise Security Platform**: Advanced security with compliance features
- **Multi-Tenant Authorization**: Scalable multi-organization security
- **Real-Time Access Control**: High-performance permission checking

---

## 🏗️ Core Service Implementation

### **Enterprise RBAC Service Implementation**

#### **Role Management Service**
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
    this.logger.log(`Creating role: ${request.name}`);

    // Phase 1: Validate role definition
    await this.validateRoleDefinition(request);

    // Phase 2: Check for conflicts and dependencies
    await this.checkRoleConflicts(request);

    // Phase 3: Build role with inheritance
    const role = await this.buildRoleWithInheritance(request);

    // Phase 4: Register permissions
    await this.registerRolePermissions(role);

    // Phase 5: Validate capabilities
    await this.validateRoleCapabilities(role);

    // Phase 6: Create role entity
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

    // Phase 7: Audit role creation
    await this.auditLogger.logRoleCreation({
      roleId: createdRole.roleId,
      roleName: createdRole.name,
      createdBy: request.createdBy,
      permissions: createdRole.permissions.length,
      capabilities: createdRole.capabilities.length,
      timestamp: new Date()
    });

    this.logger.log(`Role created successfully: ${createdRole.roleId}`);
    return createdRole;
  }

  private async validateRoleDefinition(request: CreateRoleRequest): Promise<void> {
    // Validate basic role information
    if (!request.name || request.name.trim().length === 0) {
      throw new ValidationError('Role name is required');
    }

    if (!/^[a-z][a-z0-9_]*$/.test(request.name)) {
      throw new ValidationError('Role name must be lowercase with underscores');
    }

    // Check for duplicate role names
    const existingRole = await this.roleRepository.findByName(request.name);
    if (existingRole) {
      throw new ConflictError(`Role with name '${request.name}' already exists`);
    }

    // Validate permissions
    if (request.permissions && request.permissions.length > 0) {
      await this.validatePermissions(request.permissions);
    }

    // Validate capabilities
    if (request.capabilities && request.capabilities.length > 0) {
      await this.validateCapabilities(request.capabilities);
    }

    // Validate constraints
    if (request.constraints) {
      await this.validateConstraints(request.constraints);
    }
  }

  private async buildRoleWithInheritance(request: CreateRoleRequest): Promise<RoleBuilder> {
    const roleBuilder = new RoleBuilder(request);

    // Handle role inheritance
    if (request.inheritance && request.inheritance.parentRoles) {
      for (const parentRoleName of request.inheritance.parentRoles) {
        const parentRole = await this.roleRepository.findByName(parentRoleName);
        if (!parentRole) {
          throw new NotFoundError(`Parent role '${parentRoleName}' not found`);
        }

        // Inherit permissions if specified
        if (request.inheritance.inheritPermissions) {
          roleBuilder.inheritPermissions(parentRole.permissions);
        }

        // Inherit capabilities if specified
        if (request.inheritance.inheritCapabilities) {
          roleBuilder.inheritCapabilities(parentRole.capabilities);
        }

        // Inherit constraints with override support
        roleBuilder.inheritConstraints(parentRole.constraints, request.constraints);
      }
    }

    // Add direct permissions
    if (request.permissions) {
      roleBuilder.addPermissions(request.permissions);
    }

    // Add direct capabilities
    if (request.capabilities) {
      roleBuilder.addCapabilities(request.capabilities);
    }

    return roleBuilder.build();
  }

  async assignRole(request: AssignRoleRequest): Promise<RoleAssignment> {
    this.logger.log(`Assigning role ${request.roleId} to user ${request.userId}`);

    // Phase 1: Validate assignment eligibility
    await this.validateAssignmentEligibility(request);

    // Phase 2: Check capability requirements
    await this.validateUserCapabilities(request);

    // Phase 3: Create assignment with constraints
    const assignment = await this.createAssignmentWithConstraints(request);

    // Phase 4: Activate role permissions
    await this.activateRolePermissions(assignment);

    // Phase 5: Set up monitoring and expiration
    await this.setupAssignmentLifecycle(assignment);

    // Phase 6: Audit assignment
    await this.auditLogger.logRoleAssignment({
      assignmentId: assignment.assignmentId,
      roleId: request.roleId,
      userId: request.userId,
      contextId: request.contextId,
      assignedBy: request.assignedBy,
      expiresAt: assignment.expiresAt,
      timestamp: new Date()
    });

    return assignment;
  }

  private async validateAssignmentEligibility(request: AssignRoleRequest): Promise<void> {
    // Check if role exists and is active
    const role = await this.roleRepository.findById(request.roleId);
    if (!role) {
      throw new NotFoundError(`Role '${request.roleId}' not found`);
    }

    if (role.status !== RoleStatus.Active) {
      throw new ValidationError(`Role '${role.name}' is not active`);
    }

    // Check for existing assignments
    const existingAssignment = await this.roleRepository.findActiveAssignment(
      request.userId,
      request.roleId,
      request.contextId
    );

    if (existingAssignment) {
      throw new ConflictError('User already has this role assignment');
    }

    // Check assignment constraints
    if (role.constraints.maxAssignments) {
      const currentAssignments = await this.roleRepository.countActiveAssignments(request.roleId);
      if (currentAssignments >= role.constraints.maxAssignments) {
        throw new ValidationError('Role assignment limit exceeded');
      }
    }

    // Validate context if specified
    if (request.contextId) {
      await this.validateContextAccess(request.userId, request.contextId);
    }
  }

  private async validateUserCapabilities(request: AssignRoleRequest): Promise<void> {
    const role = await this.roleRepository.findById(request.roleId);
    const requiredCapabilities = role.capabilities.filter(cap => cap.required);

    if (requiredCapabilities.length === 0) {
      return; // No capability requirements
    }

    const userCapabilities = await this.capabilityValidator.getUserCapabilities(request.userId);
    
    for (const requiredCapability of requiredCapabilities) {
      const userCapability = userCapabilities.find(cap => cap.name === requiredCapability.name);
      
      if (!userCapability) {
        throw new ValidationError(
          `User lacks required capability: ${requiredCapability.name}`
        );
      }

      // Check capability level
      if (!this.isCapabilityLevelSufficient(userCapability.level, requiredCapability.level)) {
        throw new ValidationError(
          `User capability level insufficient: ${requiredCapability.name} requires ${requiredCapability.level}, user has ${userCapability.level}`
        );
      }

      // Check verification requirements
      if (requiredCapability.verificationRequired && !userCapability.verified) {
        throw new ValidationError(
          `Capability verification required: ${requiredCapability.name}`
        );
      }

      // Check certifications
      if (requiredCapability.certifications && requiredCapability.certifications.length > 0) {
        const hasRequiredCertifications = requiredCapability.certifications.every(cert =>
          userCapability.certifications && userCapability.certifications.includes(cert)
        );

        if (!hasRequiredCertifications) {
          throw new ValidationError(
            `Missing required certifications for ${requiredCapability.name}: ${requiredCapability.certifications.join(', ')}`
          );
        }
      }
    }
  }
}
```

### **Permission Engine Implementation**

#### **Dynamic Permission Evaluator**
```typescript
@Injectable()
export class DynamicPermissionEvaluator {
  private readonly logger = new Logger(DynamicPermissionEvaluator.name);
  private readonly permissionCache = new LRUCache<string, PermissionResult>(10000);

  constructor(
    private readonly policyEngine: PolicyEngine,
    private readonly contextResolver: ContextResolver,
    private readonly auditLogger: AuditLogger,
    private readonly performanceMonitor: PerformanceMonitor
  ) {}

  async checkPermission(request: PermissionCheckRequest): Promise<PermissionResult> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(request);

    try {
      // Check cache first
      const cachedResult = this.permissionCache.get(cacheKey);
      if (cachedResult && this.isCacheValid(cachedResult)) {
        this.performanceMonitor.recordCacheHit('permission_check');
        return cachedResult;
      }

      // Resolve security context
      const securityContext = await this.contextResolver.resolveSecurityContext({
        userId: request.userId,
        contextId: request.contextId,
        resource: request.resource,
        environment: request.environment
      });

      // Get user's active roles
      const activeRoles = await this.getUserActiveRoles(
        request.userId,
        request.contextId,
        securityContext
      );

      // Evaluate permissions across all roles
      const permissionEvaluations = await Promise.all(
        activeRoles.map(role =>
          this.evaluateRolePermissions(role, request, securityContext)
        )
      );

      // Combine evaluations using policy rules
      const combinedResult = await this.combinePermissionEvaluations(
        permissionEvaluations,
        request,
        securityContext
      );

      // Apply additional constraints
      const finalResult = await this.applyConstraints(
        combinedResult,
        request,
        securityContext
      );

      // Cache the result
      this.permissionCache.set(cacheKey, finalResult);

      // Audit the permission check
      await this.auditLogger.logPermissionCheck({
        userId: request.userId,
        permission: request.requestedPermission,
        resource: request.resource,
        result: finalResult.granted,
        reason: finalResult.reason,
        context: securityContext,
        duration: performance.now() - startTime
      });

      return finalResult;

    } catch (error) {
      this.logger.error(`Permission check failed: ${error.message}`, error.stack);
      
      await this.auditLogger.logPermissionError({
        userId: request.userId,
        permission: request.requestedPermission,
        error: error.message,
        duration: performance.now() - startTime
      });

      // Return deny-by-default for security
      return {
        granted: false,
        reason: 'evaluation_error',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  private async evaluateRolePermissions(
    role: Role,
    request: PermissionCheckRequest,
    context: SecurityContext
  ): Promise<RolePermissionEvaluation> {
    const rolePermissions = role.permissions.filter(permission =>
      this.permissionMatches(permission, request.requestedPermission)
    );

    if (rolePermissions.length === 0) {
      return {
        roleId: role.roleId,
        roleName: role.name,
        granted: false,
        reason: 'permission_not_found',
        matchingPermissions: []
      };
    }

    const evaluationResults = await Promise.all(
      rolePermissions.map(permission =>
        this.evaluatePermissionWithPolicy(permission, request, context, role)
      )
    );

    // Use most permissive result (OR logic)
    const grantedEvaluations = evaluationResults.filter(eval => eval.granted);
    
    if (grantedEvaluations.length > 0) {
      return {
        roleId: role.roleId,
        roleName: role.name,
        granted: true,
        reason: 'permission_granted',
        matchingPermissions: grantedEvaluations.map(eval => eval.permission),
        grantingEvaluation: grantedEvaluations[0]
      };
    }

    return {
      roleId: role.roleId,
      roleName: role.name,
      granted: false,
      reason: 'policy_denied',
      matchingPermissions: rolePermissions,
      denyingEvaluations: evaluationResults
    };
  }

  private async evaluatePermissionWithPolicy(
    permission: RolePermission,
    request: PermissionCheckRequest,
    context: SecurityContext,
    role: Role
  ): Promise<PolicyEvaluation> {
    // Build policy evaluation context
    const policyContext = {
      user: {
        userId: request.userId,
        roles: [role],
        capabilities: await this.getUserCapabilities(request.userId)
      },
      resource: request.resource,
      environment: request.environment,
      permission: permission,
      securityContext: context
    };

    // Evaluate permission conditions
    if (permission.conditions && permission.conditions.length > 0) {
      for (const condition of permission.conditions) {
        const conditionResult = await this.policyEngine.evaluateCondition(
          condition,
          policyContext
        );

        if (!conditionResult.satisfied) {
          return {
            permission: permission,
            granted: false,
            reason: 'condition_not_satisfied',
            failedCondition: condition,
            conditionResult: conditionResult
          };
        }
      }
    }

    // Evaluate scope restrictions
    if (permission.scope) {
      const scopeResult = await this.policyEngine.evaluateScope(
        permission.scope,
        policyContext
      );

      if (!scopeResult.withinScope) {
        return {
          permission: permission,
          granted: false,
          reason: 'scope_violation',
          scopeResult: scopeResult
        };
      }
    }

    // Check time-based restrictions
    if (permission.timeRestrictions) {
      const timeResult = await this.policyEngine.evaluateTimeRestrictions(
        permission.timeRestrictions,
        policyContext
      );

      if (!timeResult.allowed) {
        return {
          permission: permission,
          granted: false,
          reason: 'time_restriction',
          timeResult: timeResult
        };
      }
    }

    return {
      permission: permission,
      granted: true,
      reason: 'policy_satisfied',
      evaluationDetails: {
        conditionsChecked: permission.conditions?.length || 0,
        scopeValidated: !!permission.scope,
        timeValidated: !!permission.timeRestrictions
      }
    };
  }

  private async combinePermissionEvaluations(
    evaluations: RolePermissionEvaluation[],
    request: PermissionCheckRequest,
    context: SecurityContext
  ): Promise<CombinedPermissionResult> {
    // Check if any role grants the permission
    const grantingEvaluations = evaluations.filter(eval => eval.granted);
    
    if (grantingEvaluations.length > 0) {
      // Use the most specific/restrictive granting evaluation
      const bestGrant = this.selectBestGrantingEvaluation(grantingEvaluations);
      
      return {
        granted: true,
        reason: 'role_permission_granted',
        grantingRole: bestGrant.roleName,
        grantingPermission: bestGrant.grantingEvaluation.permission,
        allEvaluations: evaluations
      };
    }

    // No role grants permission
    return {
      granted: false,
      reason: 'no_granting_role',
      denyingReasons: evaluations.map(eval => ({
        role: eval.roleName,
        reason: eval.reason
      })),
      allEvaluations: evaluations
    };
  }

  private async applyConstraints(
    result: CombinedPermissionResult,
    request: PermissionCheckRequest,
    context: SecurityContext
  ): Promise<PermissionResult> {
    if (!result.granted) {
      return {
        granted: false,
        reason: result.reason,
        details: result,
        timestamp: new Date()
      };
    }

    // Apply global constraints
    const globalConstraints = await this.getGlobalConstraints(context);
    for (const constraint of globalConstraints) {
      const constraintResult = await this.policyEngine.evaluateConstraint(
        constraint,
        {
          user: { userId: request.userId },
          resource: request.resource,
          permission: request.requestedPermission,
          context: context
        }
      );

      if (!constraintResult.satisfied) {
        return {
          granted: false,
          reason: 'global_constraint_violation',
          constraint: constraint,
          constraintResult: constraintResult,
          timestamp: new Date()
        };
      }
    }

    // Apply resource-specific constraints
    if (request.resource && request.resource.constraints) {
      for (const constraint of request.resource.constraints) {
        const constraintResult = await this.policyEngine.evaluateResourceConstraint(
          constraint,
          request.resource,
          context
        );

        if (!constraintResult.satisfied) {
          return {
            granted: false,
            reason: 'resource_constraint_violation',
            constraint: constraint,
            constraintResult: constraintResult,
            timestamp: new Date()
          };
        }
      }
    }

    return {
      granted: true,
      reason: 'permission_granted',
      grantingRole: result.grantingRole,
      grantingPermission: result.grantingPermission,
      details: result,
      timestamp: new Date()
    };
  }
}
```

---

## 🔗 Related Documentation

- [Role Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**Implementation Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Enterprise Ready  

**⚠️ Alpha Notice**: This implementation guide provides production-ready enterprise RBAC patterns in Alpha release. Additional security patterns and advanced authorization strategies will be added based on community feedback in Beta release.

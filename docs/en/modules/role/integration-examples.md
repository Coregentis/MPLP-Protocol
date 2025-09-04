# Role Module Integration Examples

**Multi-Agent Protocol Lifecycle Platform - Role Module Integration Examples v1.0.0-alpha**

[![Integration](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![Examples](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![Security](https://img.shields.io/badge/security-Best%20Practices-orange.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/role/integration-examples.md)

---

## 🎯 Integration Overview

This document provides comprehensive integration examples for the Role Module, demonstrating real-world enterprise RBAC scenarios, cross-module security integration patterns, and best practices for building secure multi-agent systems with MPLP Role Module.

### **Integration Scenarios**
- **Enterprise Security Platform**: Complete RBAC system with audit and compliance
- **Multi-Tenant Authorization**: Scalable multi-organization security
- **Cross-Module Security**: Integration with Context, Plan, and Trace modules
- **Real-Time Access Control**: High-performance permission checking
- **Compliance and Audit**: Regulatory compliance and audit trail management
- **Advanced Security Features**: MFA, threat detection, and anomaly monitoring

---

## 🚀 Basic Integration Examples

### **1. Enterprise Security Platform**

#### **Express.js with Enterprise RBAC**
```typescript
import express from 'express';
import { RoleModule } from '@mplp/role';
import { EnterpriseRoleService } from '@mplp/role/services';
import { SecurityMiddleware } from '@mplp/role/middleware';

// Initialize Express application
const app = express();
app.use(express.json());

// Initialize Role Module with enterprise features
const roleModule = new RoleModule({
  rbac: {
    hierarchicalRoles: true,
    capabilityBasedAuth: true,
    dynamicPermissions: true,
    auditLogging: true
  },
  security: {
    multiFactorAuth: true,
    threatDetection: true,
    complianceMonitoring: true,
    sessionSecurity: true
  },
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    ssl: true,
    poolSize: 50
  },
  cache: {
    type: 'redis',
    cluster: true,
    host: process.env.REDIS_HOST
  }
});

const roleService = roleModule.getEnterpriseRoleService();
const securityMiddleware = new SecurityMiddleware(roleModule);

// Apply security middleware globally
app.use(securityMiddleware.authenticate());
app.use(securityMiddleware.auditRequest());

// Enterprise role management
app.post('/roles', securityMiddleware.requirePermission('role:create'), async (req, res) => {
  try {
    const role = await roleService.createRole({
      name: req.body.name,
      displayName: req.body.display_name,
      description: req.body.description,
      permissions: req.body.permissions,
      capabilities: req.body.capabilities,
      constraints: req.body.constraints,
      inheritance: req.body.inheritance,
      metadata: {
        department: req.body.department,
        level: req.body.level,
        costCenter: req.body.cost_center,
        approvalRequired: req.body.approval_required
      },
      createdBy: req.user.userId
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Advanced permission checking with context
app.post('/permissions/check-advanced', async (req, res) => {
  try {
    const result = await roleService.checkPermissionAdvanced({
      userId: req.body.user_id,
      contextId: req.body.context_id,
      requestedPermission: req.body.permission,
      resource: {
        resourceType: req.body.resource_type,
        resourceId: req.body.resource_id,
        attributes: req.body.resource_attributes,
        constraints: req.body.resource_constraints
      },
      environment: {
        timestamp: new Date(),
        location: req.ip,
        deviceType: req.get('User-Agent'),
        sessionId: req.sessionID,
        networkInfo: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer')
        }
      },
      evaluationOptions: {
        includeInheritedPermissions: true,
        includeDelegatedPermissions: true,
        checkCapabilityRequirements: true,
        validateConstraints: true,
        auditDecision: true,
        includeRecommendations: true
      }
    });

    res.json({
      granted: result.granted,
      reason: result.reason,
      grantingRole: result.grantingRole,
      grantingPermission: result.grantingPermission,
      constraints: result.appliedConstraints,
      recommendations: result.recommendations,
      auditId: result.auditId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capability-based authorization
app.post('/capabilities/validate', async (req, res) => {
  try {
    const validation = await roleService.validateCapabilities({
      userId: req.body.user_id,
      requiredCapabilities: req.body.required_capabilities,
      context: {
        contextId: req.body.context_id,
        taskType: req.body.task_type,
        complexityLevel: req.body.complexity_level,
        timeframe: req.body.timeframe
      },
      validationOptions: {
        checkCertifications: true,
        checkPerformanceHistory: true,
        includeRecommendations: true,
        validateExperience: true
      }
    });

    res.json({
      overallMatch: validation.overallMatch,
      capabilityMatches: validation.capabilityMatches,
      certificationStatus: validation.certificationStatus,
      performanceScore: validation.performanceScore,
      recommendations: validation.recommendations,
      developmentPlan: validation.developmentPlan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compliance and audit endpoints
app.get('/audit/permissions', securityMiddleware.requirePermission('audit:read'), async (req, res) => {
  try {
    const auditLog = await roleService.getPermissionAuditLog({
      userId: req.query.user_id,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      permission: req.query.permission,
      result: req.query.result,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 100
      }
    });

    res.json({
      auditEntries: auditLog.entries,
      totalEntries: auditLog.total,
      complianceStatus: auditLog.complianceStatus,
      violations: auditLog.violations,
      recommendations: auditLog.recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Enterprise RBAC API server running on port ${PORT}`);
});
```

### **2. Multi-Tenant Authorization System**

#### **Multi-Tenant Security Service**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RoleService } from '@mplp/role';
import { TenantContextResolver } from './tenant-context.resolver';
import { MultiTenantAuditLogger } from './multi-tenant-audit.logger';

@Injectable()
export class MultiTenantAuthorizationService {
  private readonly logger = new Logger(MultiTenantAuthorizationService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly tenantContextResolver: TenantContextResolver,
    private readonly auditLogger: MultiTenantAuditLogger
  ) {}

  async checkTenantPermission(request: TenantPermissionRequest): Promise<TenantPermissionResult> {
    this.logger.log(`Checking tenant permission: ${request.permission} for user ${request.userId} in tenant ${request.tenantId}`);

    // Resolve tenant context
    const tenantContext = await this.tenantContextResolver.resolveTenantContext({
      tenantId: request.tenantId,
      userId: request.userId,
      includeHierarchy: true,
      includeCustomRoles: true
    });

    // Validate tenant access
    await this.validateTenantAccess(request.userId, request.tenantId, tenantContext);

    // Get user roles within tenant scope
    const tenantRoles = await this.roleService.getUserRolesInTenant({
      userId: request.userId,
      tenantId: request.tenantId,
      includeInherited: true,
      includeGlobal: true
    });

    // Check permission with tenant-specific context
    const permissionResult = await this.roleService.checkPermission({
      userId: request.userId,
      contextId: `tenant:${request.tenantId}`,
      requestedPermission: request.permission,
      resource: {
        ...request.resource,
        tenantId: request.tenantId,
        tenantScope: tenantContext.scope
      },
      environment: {
        ...request.environment,
        tenantId: request.tenantId,
        tenantDomain: tenantContext.domain,
        tenantPlan: tenantContext.plan
      },
      evaluationOptions: {
        includeTenantPolicies: true,
        checkTenantConstraints: true,
        validateTenantLimits: true,
        auditDecision: true
      }
    });

    // Apply tenant-specific constraints
    const finalResult = await this.applyTenantConstraints(
      permissionResult,
      request,
      tenantContext
    );

    // Audit tenant permission check
    await this.auditLogger.logTenantPermissionCheck({
      tenantId: request.tenantId,
      userId: request.userId,
      permission: request.permission,
      resource: request.resource,
      result: finalResult.granted,
      reason: finalResult.reason,
      tenantContext: tenantContext,
      timestamp: new Date()
    });

    return {
      granted: finalResult.granted,
      reason: finalResult.reason,
      tenantId: request.tenantId,
      tenantScope: tenantContext.scope,
      appliedPolicies: finalResult.appliedPolicies,
      tenantConstraints: finalResult.tenantConstraints,
      auditId: finalResult.auditId
    };
  }

  async createTenantRole(request: CreateTenantRoleRequest): Promise<TenantRole> {
    // Validate tenant admin permissions
    await this.validateTenantAdminAccess(request.createdBy, request.tenantId);

    // Get tenant configuration
    const tenantConfig = await this.tenantContextResolver.getTenantConfiguration(request.tenantId);

    // Create role with tenant-specific constraints
    const role = await this.roleService.createRole({
      name: `${request.tenantId}:${request.name}`,
      displayName: request.displayName,
      description: request.description,
      permissions: this.scopePermissionsToTenant(request.permissions, request.tenantId),
      capabilities: request.capabilities,
      constraints: {
        ...request.constraints,
        tenantId: request.tenantId,
        tenantScope: tenantConfig.scope,
        maxUsers: Math.min(request.constraints?.maxUsers || 1000, tenantConfig.limits.maxUsersPerRole),
        resourceLimits: this.applyTenantResourceLimits(request.constraints?.resourceLimits, tenantConfig.limits)
      },
      metadata: {
        ...request.metadata,
        tenantId: request.tenantId,
        tenantDomain: tenantConfig.domain,
        tenantPlan: tenantConfig.plan,
        createdBy: request.createdBy
      },
      createdBy: request.createdBy
    });

    // Set up tenant-specific role policies
    await this.setupTenantRolePolicies(role, tenantConfig);

    return {
      ...role,
      tenantId: request.tenantId,
      tenantScope: tenantConfig.scope,
      tenantPolicies: await this.getTenantPolicies(request.tenantId)
    };
  }

  private async validateTenantAccess(
    userId: string,
    tenantId: string,
    tenantContext: TenantContext
  ): Promise<void> {
    // Check if user has access to tenant
    const hasAccess = await this.roleService.checkPermission({
      userId,
      contextId: `tenant:${tenantId}`,
      requestedPermission: 'tenant:access',
      resource: {
        resourceType: 'tenant',
        resourceId: tenantId,
        attributes: {
          tenantDomain: tenantContext.domain,
          tenantPlan: tenantContext.plan
        }
      }
    });

    if (!hasAccess.granted) {
      throw new UnauthorizedError(`User ${userId} does not have access to tenant ${tenantId}`);
    }

    // Check tenant status
    if (tenantContext.status !== 'active') {
      throw new TenantInactiveError(`Tenant ${tenantId} is not active`);
    }

    // Check tenant limits
    if (tenantContext.limits.exceeded) {
      throw new TenantLimitExceededError(`Tenant ${tenantId} has exceeded usage limits`);
    }
  }

  private scopePermissionsToTenant(
    permissions: RolePermission[],
    tenantId: string
  ): RolePermission[] {
    return permissions.map(permission => ({
      ...permission,
      scope: `tenant:${tenantId}`,
      conditions: [
        ...(permission.conditions || []),
        `tenant_id:${tenantId}`,
        'tenant_active:true'
      ]
    }));
  }

  private async applyTenantConstraints(
    permissionResult: PermissionResult,
    request: TenantPermissionRequest,
    tenantContext: TenantContext
  ): Promise<PermissionResult> {
    if (!permissionResult.granted) {
      return permissionResult;
    }

    // Check tenant-specific resource limits
    if (request.resource && tenantContext.limits) {
      const resourceCheck = await this.checkTenantResourceLimits(
        request.resource,
        tenantContext.limits
      );

      if (!resourceCheck.allowed) {
        return {
          granted: false,
          reason: 'tenant_resource_limit_exceeded',
          tenantConstraint: resourceCheck.violatedConstraint,
          timestamp: new Date()
        };
      }
    }

    // Check tenant plan restrictions
    if (tenantContext.plan && tenantContext.plan.restrictions) {
      const planCheck = await this.checkTenantPlanRestrictions(
        request.permission,
        tenantContext.plan.restrictions
      );

      if (!planCheck.allowed) {
        return {
          granted: false,
          reason: 'tenant_plan_restriction',
          planRestriction: planCheck.restriction,
          upgradeRequired: planCheck.upgradeRequired,
          timestamp: new Date()
        };
      }
    }

    return {
      ...permissionResult,
      tenantConstraints: {
        resourceLimits: tenantContext.limits,
        planRestrictions: tenantContext.plan?.restrictions,
        appliedAt: new Date()
      }
    };
  }
}
```

---

## 🔗 Cross-Module Integration Examples

### **1. Role + Context + Plan Integration**

#### **Secure Project Management System**
```typescript
import { RoleService } from '@mplp/role';
import { ContextService } from '@mplp/context';
import { PlanService } from '@mplp/plan';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SecureProjectManagementService {
  constructor(
    private readonly roleService: RoleService,
    private readonly contextService: ContextService,
    private readonly planService: PlanService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.setupCrossModuleEventHandlers();
  }

  async createSecureProject(request: SecureProjectRequest): Promise<SecureProject> {
    // 1. Create project context with security settings
    const context = await this.contextService.createContext({
      name: `Project: ${request.name}`,
      type: 'secure_collaborative',
      configuration: {
        maxParticipants: request.maxTeamSize || 50,
        securityLevel: request.securityLevel || 'high',
        dataClassification: request.dataClassification || 'confidential',
        accessControl: {
          enabled: true,
          requiresApproval: true,
          mfaRequired: request.securityLevel === 'critical',
          sessionTimeout: request.securityLevel === 'critical' ? 1800 : 3600
        }
      },
      metadata: {
        tags: ['project', 'secure', 'rbac-enabled'],
        category: 'secure-project',
        priority: request.priority || 'normal',
        securityMetadata: {
          classification: request.dataClassification,
          clearanceRequired: request.clearanceRequired,
          complianceFrameworks: request.complianceFrameworks || []
        }
      },
      createdBy: request.createdBy
    });

    // 2. Set up project-specific roles with security constraints
    const projectRoles = await this.createProjectSecurityRoles({
      contextId: context.contextId,
      securityLevel: request.securityLevel,
      dataClassification: request.dataClassification,
      complianceFrameworks: request.complianceFrameworks,
      customRoles: request.customRoles
    });

    // 3. Create secure project plan with role-based task assignment
    const projectPlan = await this.planService.generatePlan({
      name: request.name,
      contextId: context.contextId,
      objectives: request.objectives.map(obj => ({
        ...obj,
        securityConstraints: {
          requiredClearance: request.clearanceRequired,
          dataHandlingRules: this.getDataHandlingRules(request.dataClassification),
          auditRequired: true
        }
      })),
      planningStrategy: {
        algorithm: 'secure_hierarchical_planning',
        optimizationGoals: [
          'minimize_time',
          'maximize_security',
          'ensure_compliance',
          'optimize_clearance_usage'
        ],
        securityConstraints: {
          roleBasedTaskAssignment: true,
          capabilityValidation: true,
          clearanceVerification: true,
          auditTrailRequired: true
        }
      },
      executionPreferences: {
        securityMode: 'strict',
        auditLevel: 'comprehensive',
        complianceChecking: 'continuous',
        accessLogging: 'detailed'
      }
    });

    // 4. Assign team members with security validation
    const secureTeam = await this.assembleSecureTeam({
      contextId: context.contextId,
      planId: projectPlan.planId,
      requiredRoles: this.extractRequiredRoles(projectPlan),
      securityRequirements: {
        clearanceLevel: request.clearanceRequired,
        backgroundCheckRequired: request.securityLevel === 'critical',
        certificationRequired: request.complianceFrameworks.length > 0
      },
      teamComposition: request.teamComposition
    });

    // 5. Set up comprehensive security monitoring
    const securityMonitoring = await this.setupProjectSecurityMonitoring({
      contextId: context.contextId,
      planId: projectPlan.planId,
      securityLevel: request.securityLevel,
      monitoringRules: {
        accessPatternAnalysis: true,
        privilegeEscalationDetection: true,
        dataExfiltrationPrevention: true,
        complianceViolationDetection: true,
        anomalyDetection: true
      }
    });

    const secureProject: SecureProject = {
      projectId: this.generateProjectId(),
      name: request.name,
      contextId: context.contextId,
      planId: projectPlan.planId,
      securityLevel: request.securityLevel,
      dataClassification: request.dataClassification,
      team: secureTeam.members,
      roles: projectRoles,
      securityFeatures: {
        roleBasedAccess: true,
        capabilityValidation: true,
        auditLogging: true,
        threatDetection: true,
        complianceMonitoring: true,
        dataProtection: true
      },
      complianceStatus: {
        frameworks: request.complianceFrameworks,
        status: 'compliant',
        lastAudit: new Date(),
        nextAudit: this.calculateNextAuditDate(request.complianceFrameworks)
      },
      createdAt: new Date(),
      estimatedCompletion: projectPlan.estimatedCompletion
    };

    // 6. Emit secure project creation event
    await this.eventEmitter.emitAsync('secure.project.created', {
      projectId: secureProject.projectId,
      contextId: context.contextId,
      planId: projectPlan.planId,
      securityLevel: request.securityLevel,
      teamSize: secureTeam.members.length,
      complianceFrameworks: request.complianceFrameworks,
      createdBy: request.createdBy,
      timestamp: new Date().toISOString()
    });

    return secureProject;
  }

  private async createProjectSecurityRoles(request: ProjectSecurityRolesRequest): Promise<ProjectRole[]> {
    const baseRoles = [
      {
        name: 'project_security_officer',
        displayName: 'Project Security Officer',
        permissions: [
          'project:security:manage',
          'audit:access',
          'compliance:monitor',
          'threat:investigate'
        ],
        capabilities: [
          { capability: 'security_management', level: 'expert', required: true },
          { capability: 'compliance_knowledge', level: 'advanced', required: true },
          { capability: 'incident_response', level: 'expert', required: true }
        ],
        constraints: {
          clearanceRequired: 'secret',
          backgroundCheckRequired: true,
          maxConcurrentProjects: 3
        }
      },
      {
        name: 'secure_project_manager',
        displayName: 'Secure Project Manager',
        permissions: [
          'project:manage',
          'team:coordinate',
          'plan:execute',
          'security:enforce'
        ],
        capabilities: [
          { capability: 'project_management', level: 'expert', required: true },
          { capability: 'security_awareness', level: 'advanced', required: true },
          { capability: 'compliance_management', level: 'intermediate', required: true }
        ],
        constraints: {
          clearanceRequired: request.securityLevel === 'critical' ? 'top_secret' : 'secret',
          certificationRequired: request.complianceFrameworks.length > 0
        }
      },
      {
        name: 'secure_developer',
        displayName: 'Secure Developer',
        permissions: [
          'code:develop',
          'security:implement',
          'data:access:restricted'
        ],
        capabilities: [
          { capability: 'secure_coding', level: 'advanced', required: true },
          { capability: 'data_protection', level: 'intermediate', required: true }
        ],
        constraints: {
          clearanceRequired: 'confidential',
          trainingRequired: ['secure_coding', 'data_protection']
        }
      }
    ];

    // Create roles with security constraints
    const createdRoles = await Promise.all(
      baseRoles.map(async roleDefinition => {
        const role = await this.roleService.createRole({
          ...roleDefinition,
          name: `${request.contextId}:${roleDefinition.name}`,
          constraints: {
            ...roleDefinition.constraints,
            contextId: request.contextId,
            securityLevel: request.securityLevel,
            dataClassification: request.dataClassification,
            complianceFrameworks: request.complianceFrameworks
          },
          metadata: {
            projectRole: true,
            securityRole: true,
            contextId: request.contextId,
            securityLevel: request.securityLevel
          }
        });

        return {
          ...role,
          projectSpecific: true,
          securityConstraints: roleDefinition.constraints
        };
      })
    );

    return createdRoles;
  }

  private setupCrossModuleEventHandlers(): void {
    // Handle context security events
    this.eventEmitter.on('context.security.violation', async (event) => {
      await this.handleSecurityViolation(event);
    });

    this.eventEmitter.on('context.access.denied', async (event) => {
      await this.handleAccessDenied(event);
    });

    // Handle plan security events
    this.eventEmitter.on('plan.task.security.check', async (event) => {
      await this.handleTaskSecurityCheck(event);
    });

    this.eventEmitter.on('plan.execution.security.alert', async (event) => {
      await this.handleExecutionSecurityAlert(event);
    });

    // Handle role security events
    this.eventEmitter.on('role.privilege.escalation.detected', async (event) => {
      await this.handlePrivilegeEscalationDetection(event);
    });

    this.eventEmitter.on('role.assignment.security.violation', async (event) => {
      await this.handleRoleAssignmentViolation(event);
    });
  }

  private async handleSecurityViolation(event: SecurityViolationEvent): Promise<void> {
    // Immediate response to security violations
    const response = await this.roleService.respondToSecurityViolation({
      violationType: event.violationType,
      severity: event.severity,
      contextId: event.contextId,
      userId: event.userId,
      details: event.details,
      automaticResponse: {
        suspendUser: event.severity === 'critical',
        revokePermissions: event.severity !== 'low',
        notifySecurityTeam: true,
        escalateToAdmin: event.severity === 'critical'
      }
    });

    // Log security incident
    await this.auditLogger.logSecurityIncident({
      incidentType: 'security_violation',
      severity: event.severity,
      contextId: event.contextId,
      userId: event.userId,
      response: response,
      timestamp: new Date()
    });
  }
}
```

---

## 🔗 Related Documentation

- [Role Module Overview](./README.md) - Module overview and architecture
- [API Reference](./api-reference.md) - Complete API documentation
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization

---

**Integration Examples Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Examples**: Enterprise Ready  

**⚠️ Alpha Notice**: These integration examples showcase enterprise-grade RBAC capabilities in Alpha release. Additional security integration patterns and compliance examples will be added based on community feedback and real-world usage in Beta release.

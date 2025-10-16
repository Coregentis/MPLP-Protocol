# Role模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/role/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Role模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![安全](https://img.shields.io/badge/security-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/role/integration-examples.md)

---

## 🎯 集成概览

本文档提供Role模块的全面集成示例，展示真实世界的企业RBAC场景、跨模块安全集成模式，以及使用MPLP Role模块构建安全多智能体系统的最佳实践。

### **集成场景**
- **企业安全平台**: 具有审计和合规的完整RBAC系统
- **多租户授权**: 可扩展的多组织安全
- **跨模块安全**: 与Context、Plan和Trace模块的集成
- **实时访问控制**: 高性能权限检查
- **合规和审计**: 监管合规和审计跟踪管理
- **高级安全功能**: MFA、威胁检测和异常监控

---

## 🚀 基础集成示例

### **1. 企业安全平台**

#### **Express.js与企业级RBAC**
```typescript
import express from 'express';
import { RoleModule } from '@mplp/role';
import { EnterpriseRoleService } from '@mplp/role/services';
import { SecurityMiddleware } from '@mplp/role/middleware';

// 初始化Express应用
const app = express();
app.use(express.json());

// 使用企业功能初始化Role模块
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
    sessionManagement: true,
    encryptionAtRest: true
  },
  compliance: {
    sox: true,
    gdpr: true,
    hipaa: true,
    pciDss: true
  },
  performance: {
    caching: {
      enabled: true,
      ttl: 300,
      maxEntries: 100000
    },
    clustering: {
      enabled: true,
      instances: 4
    }
  }
});

// 初始化企业角色服务
const roleService = new EnterpriseRoleService(roleModule);

// 配置安全中间件
const securityMiddleware = new SecurityMiddleware({
  roleService,
  authenticationRequired: true,
  auditLogging: true,
  threatDetection: true
});

// 应用安全中间件
app.use(securityMiddleware.authenticate());
app.use(securityMiddleware.authorize());
app.use(securityMiddleware.auditLog());

// 企业级角色管理端点
app.post('/api/v1/enterprise/roles', async (req, res) => {
  try {
    // 验证管理员权限
    const hasPermission = await roleService.checkPermission(
      req.user.userId,
      'role:create',
      'enterprise',
      {
        context: 'role_management',
        tenant: req.user.tenantId,
        mfaVerified: req.user.mfaVerified
      }
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: 'role:create on enterprise context'
      });
    }

    // 创建企业角色
    const role = await roleService.createEnterpriseRole({
      name: req.body.name,
      displayName: req.body.displayName,
      description: req.body.description,
      permissions: req.body.permissions,
      capabilities: req.body.capabilities,
      constraints: req.body.constraints,
      compliance: {
        sox: req.body.soxCompliant || false,
        gdpr: req.body.gdprCompliant || false,
        auditRequired: true
      },
      createdBy: req.user.userId,
      tenantId: req.user.tenantId
    });

    // 记录审计日志
    await roleService.auditLog({
      action: 'role_created',
      userId: req.user.userId,
      resourceId: role.roleId,
      details: {
        roleName: role.name,
        permissions: role.permissions.length,
        capabilities: role.capabilities.length
      },
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      role: {
        roleId: role.roleId,
        name: role.name,
        displayName: role.displayName,
        status: role.status,
        createdAt: role.createdAt
      }
    });

  } catch (error) {
    console.error('Role creation failed:', error);
    res.status(500).json({
      error: 'Role creation failed',
      message: error.message
    });
  }
});

// 高级权限检查端点
app.post('/api/v1/enterprise/permissions/check', async (req, res) => {
  try {
    const { userId, resource, action, context } = req.body;

    // 执行多层权限检查
    const permissionResult = await roleService.evaluatePermissions(userId, {
      resource,
      action,
      context: {
        ...context,
        requestTime: new Date(),
        requestSource: req.ip,
        mfaRequired: context.sensitiveOperation || false
      }
    });

    // 检查威胁检测
    const threatAssessment = await roleService.assessThreat({
      userId,
      action,
      resource,
      context: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        recentActivity: context.recentActivity
      }
    });

    // 如果检测到威胁，拒绝访问
    if (threatAssessment.riskLevel === 'high') {
      await roleService.auditLog({
        action: 'access_denied_threat',
        userId,
        reason: 'High threat risk detected',
        threatDetails: threatAssessment,
        timestamp: new Date()
      });

      return res.status(403).json({
        allowed: false,
        reason: 'Access denied due to security concerns',
        threatLevel: threatAssessment.riskLevel
      });
    }

    res.json({
      allowed: permissionResult.allowed,
      permissions: permissionResult.permissions,
      constraints: permissionResult.constraints,
      threatLevel: threatAssessment.riskLevel,
      auditId: permissionResult.auditId
    });

  } catch (error) {
    console.error('Permission check failed:', error);
    res.status(500).json({
      error: 'Permission check failed',
      message: error.message
    });
  }
});

// 启动企业安全平台
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Enterprise Security Platform running on port ${PORT}`);
  console.log('Features enabled:');
  console.log('- Hierarchical RBAC');
  console.log('- Capability-based authorization');
  console.log('- Multi-factor authentication');
  console.log('- Threat detection');
  console.log('- Compliance monitoring');
  console.log('- Audit logging');
});
```

### **2. 多租户授权系统**

#### **多组织安全管理**
```typescript
import { RoleModule } from '@mplp/role';
import { MultiTenantRoleService } from '@mplp/role/services';
import { TenantIsolationMiddleware } from '@mplp/role/middleware';

// 多租户角色服务配置
const multiTenantRoleService = new MultiTenantRoleService({
  tenantIsolation: {
    strict: true,
    crossTenantAccess: false,
    tenantDataEncryption: true
  },
  roleManagement: {
    tenantSpecificRoles: true,
    globalRoles: ['system_admin', 'support'],
    roleInheritance: 'tenant_scoped'
  },
  permissions: {
    tenantScopedPermissions: true,
    globalPermissions: ['system:admin', 'tenant:create'],
    permissionInheritance: 'hierarchical'
  }
});

// 租户隔离中间件
const tenantIsolation = new TenantIsolationMiddleware({
  tenantIdentification: 'header', // header, subdomain, path
  tenantHeader: 'X-Tenant-ID',
  strictIsolation: true,
  auditCrossTenantAccess: true
});

// 多租户角色创建
async function createTenantRole(tenantId: string, roleDefinition: any) {
  try {
    // 验证租户存在
    const tenant = await multiTenantRoleService.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // 创建租户特定角色
    const role = await multiTenantRoleService.createRole({
      ...roleDefinition,
      tenantId,
      scope: 'tenant',
      isolation: {
        crossTenantVisible: false,
        inheritFromGlobal: roleDefinition.inheritGlobal || false
      }
    });

    // 设置租户特定权限
    await multiTenantRoleService.assignPermissions(role.roleId, {
      permissions: roleDefinition.permissions.map(permission => ({
        permission,
        scope: 'tenant',
        tenantId,
        constraints: {
          resourceScope: `tenant:${tenantId}`,
          actionScope: 'tenant_operations'
        }
      }))
    });

    return role;

  } catch (error) {
    console.error('Tenant role creation failed:', error);
    throw error;
  }
}

// 跨租户权限检查
async function checkCrossTenantPermission(
  userId: string,
  sourceTenantId: string,
  targetTenantId: string,
  resource: string,
  action: string
) {
  try {
    // 检查用户是否有跨租户访问权限
    const crossTenantPermission = await multiTenantRoleService.checkPermission(
      userId,
      'tenant:cross_access',
      'global',
      {
        sourceTenant: sourceTenantId,
        targetTenant: targetTenantId,
        requestedResource: resource,
        requestedAction: action
      }
    );

    if (!crossTenantPermission) {
      await multiTenantRoleService.auditLog({
        action: 'cross_tenant_access_denied',
        userId,
        sourceTenant: sourceTenantId,
        targetTenant: targetTenantId,
        resource,
        reason: 'Insufficient cross-tenant permissions'
      });

      return {
        allowed: false,
        reason: 'Cross-tenant access denied'
      };
    }

    // 检查目标租户中的具体权限
    const targetPermission = await multiTenantRoleService.checkPermission(
      userId,
      resource,
      action,
      {
        tenantId: targetTenantId,
        crossTenantAccess: true,
        sourceTenant: sourceTenantId
      }
    );

    return {
      allowed: targetPermission,
      crossTenantAccess: true,
      auditRequired: true
    };

  } catch (error) {
    console.error('Cross-tenant permission check failed:', error);
    return {
      allowed: false,
      reason: 'Permission check failed'
    };
  }
}
```

### **3. 与Context模块的安全集成**

#### **上下文感知权限控制**
```typescript
import { RoleModule } from '@mplp/role';
import { ContextModule } from '@mplp/context';
import { SecurityContextIntegration } from '@mplp/role/integrations';

// 安全上下文集成服务
const securityContextIntegration = new SecurityContextIntegration({
  roleModule,
  contextModule,
  integration: {
    contextAwarePermissions: true,
    dynamicRoleAssignment: true,
    contextBasedConstraints: true,
    securityContextCaching: true
  }
});

// 上下文感知权限检查
async function checkContextAwarePermission(
  userId: string,
  resource: string,
  action: string,
  contextId: string
) {
  try {
    // 获取安全上下文
    const securityContext = await securityContextIntegration.getSecurityContext(contextId);
    
    // 评估上下文特定的权限
    const permissionResult = await securityContextIntegration.evaluatePermission({
      userId,
      resource,
      action,
      context: {
        contextId,
        securityLevel: securityContext.securityLevel,
        dataClassification: securityContext.dataClassification,
        accessRequirements: securityContext.accessRequirements,
        complianceRequirements: securityContext.complianceRequirements
      }
    });

    // 应用上下文特定的约束
    const constraints = await securityContextIntegration.applyContextConstraints({
      userId,
      contextId,
      basePermissions: permissionResult.permissions,
      securityContext
    });

    return {
      allowed: permissionResult.allowed,
      permissions: permissionResult.permissions,
      constraints,
      securityContext: {
        level: securityContext.securityLevel,
        classification: securityContext.dataClassification
      }
    };

  } catch (error) {
    console.error('Context-aware permission check failed:', error);
    throw error;
  }
}

// 动态角色分配基于上下文
async function assignContextBasedRole(
  userId: string,
  contextId: string,
  requiredCapabilities: string[]
) {
  try {
    // 获取上下文要求
    const contextRequirements = await securityContextIntegration.getContextRequirements(contextId);
    
    // 匹配用户能力与上下文要求
    const capabilityMatch = await securityContextIntegration.matchCapabilities({
      userId,
      requiredCapabilities,
      contextRequirements: contextRequirements.capabilities,
      securityLevel: contextRequirements.securityLevel
    });

    if (!capabilityMatch.qualified) {
      return {
        assigned: false,
        reason: 'Insufficient capabilities for context',
        missingCapabilities: capabilityMatch.missingCapabilities
      };
    }

    // 分配上下文特定角色
    const contextRole = await securityContextIntegration.assignContextRole({
      userId,
      contextId,
      roleType: contextRequirements.roleType,
      capabilities: capabilityMatch.matchedCapabilities,
      duration: contextRequirements.maxRoleDuration,
      constraints: contextRequirements.roleConstraints
    });

    return {
      assigned: true,
      roleId: contextRole.roleId,
      roleName: contextRole.name,
      expiresAt: contextRole.expiresAt,
      capabilities: contextRole.capabilities
    };

  } catch (error) {
    console.error('Context-based role assignment failed:', error);
    throw error;
  }
}
```

---

## 🔗 相关文档

- [Role模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Role模块集成示例在Alpha版本中提供企业级安全集成模式。额外的高级集成模式和安全功能将在Beta版本中添加。

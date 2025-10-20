/**
 * Role模块测试数据工厂
 * 
 * @description 为Role模块测试提供标准化的测试数据生成 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 测试层 - 数据工厂
 */

import { randomUUID } from 'crypto';
import {
  UUID,
  RoleType,
  RoleStatus,
  GrantType,
  SecurityClearance,
  SeniorityLevel,
  Permission,
  Agent,
  AgentType,
  AgentStatus,
  ExpertiseLevel,
  CommunicationStyle,
  ConflictResolutionStrategy
} from '../../../src/modules/role/types';
import { RoleEntityData } from '../../../src/modules/role/api/mappers/role.mapper';
import { CreateRoleRequest } from '../../../src/modules/role/application/services/role-management.service';

/**
 * 创建简单的Role实体数据
 */
export function createSimpleMockRoleEntityData(): RoleEntityData {
  return {
    protocolVersion: '1.0.0',
    timestamp: new Date('2025-01-01T00:00:00.000Z'),
    roleId: 'role-test-001' as UUID,
    contextId: 'context-test-001' as UUID,
    name: 'test-role',
    displayName: 'Test Role',
    description: 'A test role for unit testing',
    roleType: 'organizational' as RoleType,
    status: 'active' as RoleStatus,
    permissions: [
      {
        permissionId: 'perm-test-001' as UUID,
        resourceType: 'context',
        resourceId: 'resource-test-001' as UUID,
        actions: ['read', 'update'],
        grantType: 'direct' as GrantType,
        expiry: new Date('2025-12-31T23:59:59.999Z')
      }
    ],
    performanceMetrics: {
      enabled: true,
      collectionIntervalSeconds: 60,
      metrics: {
        roleAssignmentLatencyMs: 10,
        permissionCheckLatencyMs: 5,
        roleSecurityScore: 85,
        permissionAccuracyPercent: 95,
        roleManagementEfficiencyScore: 90
      }
    },
    monitoringIntegration: {
      enabled: false,
      supportedProviders: ['prometheus', 'grafana']
    },
    versionHistory: {
      enabled: true,
      maxVersions: 50,
      versions: [
        {
          versionId: 'version-test-001' as UUID,
          versionNumber: 1,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          createdBy: 'test-user',
          changeSummary: 'Initial creation',
          changeType: 'created'
        }
      ]
    },
    searchMetadata: {
      enabled: true,
      indexingStrategy: 'keyword',
      searchableFields: ['role_id', 'name', 'role_type']
    },
    roleOperation: 'create',
    eventIntegration: {
      enabled: false
    },
    auditTrail: {
      enabled: true,
      retentionDays: 365,
      auditEvents: [
        {
          eventId: 'event-test-001' as UUID,
          eventType: 'role_created',
          timestamp: new Date('2025-01-01T00:00:00.000Z'),
          userId: 'test-user',
          action: 'create',
          resource: 'role',
          roleId: 'role-test-001' as UUID,
          roleName: 'test-role',
          roleType: 'organizational'
        }
      ]
    }
  };
}

/**
 * 创建复杂的Role实体数据（包含所有可选字段）
 */
export function createComplexMockRoleEntityData(): RoleEntityData {
  const baseData = createSimpleMockRoleEntityData();
  
  return {
    ...baseData,
    scope: {
      level: 'organization',
      contextIds: ['context-test-001', 'context-test-002'] as UUID[],
      planIds: ['plan-test-001'] as UUID[],
      resourceConstraints: {
        maxContexts: 10,
        maxPlans: 5,
        allowedResourceTypes: ['context', 'plan', 'task']
      }
    },
    inheritance: {
      parentRoles: [
        {
          roleId: 'parent-role-001' as UUID,
          inheritanceType: 'full',
          excludedPermissions: [],
          conditions: {}
        }
      ],
      childRoles: [
        {
          roleId: 'child-role-001' as UUID,
          delegationLevel: 1,
          canFurtherDelegate: false
        }
      ],
      inheritanceRules: {
        mergeStrategy: 'union',
        conflictResolution: 'most_restrictive',
        maxInheritanceDepth: 3
      }
    },
    delegation: {
      canDelegate: true,
      delegatablePermissions: ['perm-test-001'] as UUID[],
      delegationConstraints: {
        maxDelegationDepth: 2,
        timeLimit: 86400,
        requireApproval: false,
        revocable: true
      },
      activeDelegations: [
        {
          delegationId: 'delegation-test-001' as UUID,
          delegatedTo: 'user-test-002',
          permissions: ['perm-test-001'] as UUID[],
          startTime: new Date('2025-01-01T00:00:00.000Z'),
          endTime: new Date('2025-01-02T00:00:00.000Z'),
          status: 'active'
        }
      ]
    },
    attributes: {
      securityClearance: 'confidential' as SecurityClearance,
      department: 'Engineering',
      seniorityLevel: 'senior' as SeniorityLevel,
      certificationRequirements: [
        {
          certification: 'Security+',
          level: 'advanced',
          expiry: new Date('2025-12-31T23:59:59.999Z'),
          issuer: 'CompTIA'
        }
      ],
      customAttributes: {
        team: 'Platform',
        location: 'Remote',
        timezone: 'UTC'
      }
    },
    agents: [
      createMockAgent()
    ],
    agentManagement: {
      maxAgents: 5,
      autoScaling: true,
      loadBalancing: true,
      healthCheckIntervalMs: 30000,
      defaultAgentConfig: {
        timeout: 5000,
        retries: 3
      }
    },
    teamConfiguration: {
      maxTeamSize: 10,
      collaborationRules: [
        {
          ruleName: 'Communication Protocol',
          ruleType: 'communication',
          ruleConfig: {
            channels: ['slack', 'email'],
            frequency: 'daily'
          }
        }
      ],
      decisionMechanism: {
        type: 'consensus',
        threshold: 0.8,
        timeoutMs: 300000
      }
    }
  };
}

/**
 * 创建Mock Agent
 */
export function createMockAgent(): Agent {
  return {
    agentId: 'agent-test-001' as UUID,
    name: 'Test Agent',
    type: 'specialist' as AgentType,
    domain: 'security',
    status: 'active' as AgentStatus,
    capabilities: {
      core: {
        criticalThinking: true,
        scenarioValidation: true,
        ddscDialog: true,
        mplpProtocols: ['role', 'context', 'plan']
      },
      specialist: {
        domain: 'security',
        expertiseLevel: 'expert' as ExpertiseLevel,
        knowledgeAreas: ['rbac', 'authentication', 'authorization'],
        tools: ['security-scanner', 'audit-tool']
      },
      collaboration: {
        communicationStyle: 'technical' as CommunicationStyle,
        conflictResolution: 'consensus' as ConflictResolutionStrategy,
        decisionWeight: 0.8,
        trustLevel: 0.9
      },
      learning: {
        experienceAccumulation: true,
        patternRecognition: true,
        adaptationMechanism: true,
        performanceOptimization: true
      }
    },
    performanceMetrics: {
      responseTimeMs: 150,
      throughputOpsPerSec: 100,
      successRate: 0.98,
      errorRate: 0.02,
      lastUpdated: new Date('2025-01-01T00:00:00.000Z')
    },
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    createdBy: 'test-user'
  };
}

/**
 * 创建CreateRoleRequest测试数据
 */
export function createMockCreateRoleRequest(): CreateRoleRequest {
  return {
    contextId: 'context-test-001' as UUID,
    name: 'test-role-request',
    displayName: 'Test Role Request',
    description: 'A test role creation request',
    roleType: 'functional' as RoleType,
    permissions: [
      {
        permissionId: 'perm-test-002' as UUID,
        resourceType: 'plan',
        resourceId: 'resource-test-002' as UUID,
        actions: ['create', 'read', 'execute'],
        grantType: 'direct' as GrantType
      }
    ],
    scope: {
      level: 'project',
      contextIds: ['context-test-001'] as UUID[],
      resourceConstraints: {
        maxContexts: 5,
        maxPlans: 3,
        allowedResourceTypes: ['plan', 'task']
      }
    },
    attributes: {
      securityClearance: 'internal' as SecurityClearance,
      department: 'Product',
      certificationRequirements: [
        {
          certification: 'Agile PM',
          level: 'intermediate',
          issuer: 'PMI'
        }
      ]
    }
  };
}

/**
 * 创建多个测试角色数据
 */
export function createMultipleMockRoles(count: number): RoleEntityData[] {
  const roles: RoleEntityData[] = [];
  
  for (let i = 0; i < count; i++) {
    const baseRole = createSimpleMockRoleEntityData();
    roles.push({
      ...baseRole,
      roleId: `role-test-${String(i + 1).padStart(3, '0')}` as UUID,
      name: `test-role-${i + 1}`,
      displayName: `Test Role ${i + 1}`,
      roleType: i % 2 === 0 ? 'organizational' : 'functional',
      status: i % 3 === 0 ? 'inactive' : 'active'
    });
  }
  
  return roles;
}

/**
 * 创建随机UUID
 */
export function createTestUUID(): UUID {
  return randomUUID() as UUID;
}

/**
 * 创建测试日期
 */
export function createTestDate(offset: number = 0): Date {
  const baseDate = new Date('2025-01-01T00:00:00.000Z');
  return new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
}

/**
 * 创建测试权限
 */
export function createTestPermission(overrides: Partial<Permission> = {}): Permission {
  return {
    permissionId: createTestUUID(),
    resourceType: 'context',
    resourceId: createTestUUID(),
    actions: ['read'],
    grantType: 'direct' as GrantType,
    ...overrides
  };
}

/**
 * 验证测试数据的有效性
 */
export function validateTestData(data: RoleEntityData): boolean {
  return !!(
    data.roleId &&
    data.contextId &&
    data.name &&
    data.roleType &&
    data.status &&
    Array.isArray(data.permissions) &&
    data.performanceMetrics &&
    data.monitoringIntegration &&
    data.versionHistory &&
    data.searchMetadata &&
    data.eventIntegration &&
    data.auditTrail
  );
}

/**
 * 创建测试用的RoleEntity对象
 */
export function createTestRole(overrides: Partial<RoleEntityData> = {}): import('../../../src/modules/role/domain/entities/role.entity').RoleEntity {
  const { RoleEntity } = require('../../../src/modules/role/domain/entities/role.entity');
  const roleData = {
    ...createSimpleMockRoleEntityData(),
    ...overrides
  };
  return new RoleEntity(roleData);
}

/**
 * 创建带权限的测试角色
 */
export function createTestRoleWithPermissions(permissions: Permission[] = [], overrides: Partial<RoleEntityData> = {}): import('../../../src/modules/role/domain/entities/role.entity').RoleEntity {
  const { RoleEntity } = require('../../../src/modules/role/domain/entities/role.entity');

  // 确保权限数组格式正确
  const defaultPermissions = permissions.length > 0 ? permissions : [
    {
      permissionId: createTestUUID(),
      resourceType: 'context',
      resourceId: createTestUUID(),
      actions: ['read', 'write'],
      grantType: 'direct' as const,
      expiry: new Date('2025-12-31')
    }
  ];

  const roleData = {
    ...createComplexMockRoleEntityData(),
    permissions: defaultPermissions,
    ...overrides
  };
  return new RoleEntity(roleData);
}

/**
 * Role模块测试数据工厂
 * 基于MPLP统一测试标准v1.0
 * 
 * @description 提供标准化的Role测试数据生成
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { RoleEntity } from '../../../../src/modules/role/domain/entities/role.entity';
import { RoleType, RoleStatus, SecurityClearance, Permission } from '../../../../src/modules/role/types';
import { UUID } from '../../../../src/shared/types';

export class RoleTestFactory {
  /**
   * 创建标准Role实体用于测试
   */
  static createRoleEntity(overrides: Partial<any> = {}): RoleEntity {
    const defaultData = {
      // 基础协议字段
      protocolVersion: '1.0.0',
      timestamp: new Date('2025-01-01T00:00:00Z'),
      roleId: 'role-test-001' as UUID,
      contextId: 'ctx-test-001' as UUID,

      // 角色核心字段
      name: 'Test Role',
      displayName: 'Test Role Display',
      description: 'Test role for unit testing',
      roleType: 'functional' as RoleType,
      status: 'active' as RoleStatus,

      // 权限配置
      permissions: ['read', 'write'] as Permission[],

      // 必需的企业级字段
      performanceMetrics: {},
      monitoringIntegration: {},
      versionHistory: {},
      searchMetadata: {},
      roleOperation: 'create' as const,
      eventIntegration: {},
      auditTrail: {
        enabled: true,
        retentionDays: 90,
        events: []
      },

      // 可选字段
      scope: {
        level: 'project' as const,
        boundaries: ['project-001'],
        restrictions: []
      },

      // 可选的其他字段
      inheritance: {
        parentRoles: [],
        childRoles: [],
        inheritanceRules: {
          permissionInheritance: 'additive',
          conflictResolution: 'deny',
          maxDepth: 5
        }
      },

      delegation: {
        canDelegate: true,
        delegationRules: {
          maxDelegationDepth: 3,
          allowedDelegates: [],
          restrictedPermissions: [],
          timeConstraints: {
            maxDuration: 86400,
            allowPermanent: false
          }
        },
        activeDelegations: []
      },

      attributes: {
        priority: 'medium',
        category: 'standard',
        tags: ['test'],
        customAttributes: {}
      },

      validationRules: {
        assignmentRules: {
          maxAssignments: 100,
          requireApproval: false,
          approvers: [],
          autoAssignmentRules: []
        },
        accessRules: {
          timeRestrictions: [],
          locationRestrictions: [],
          deviceRestrictions: [],
          networkRestrictions: []
        },
        complianceRules: {
          requiredCertifications: [],
          backgroundCheckLevel: 'basic',
          trainingRequirements: [],
          renewalPeriod: 365
        }
      },

      auditSettings: {
        enabled: true,
        logLevel: 'standard',
        retentionPeriod: 90,
        alertThresholds: {
          failedAccess: 5,
          suspiciousActivity: 3,
          privilegeEscalation: 1
        }
      },

      agents: []
    };

    return new RoleEntity({ ...defaultData, ...overrides });
  }

  /**
   * 创建Role Schema格式数据 (snake_case)
   */
  static createRoleSchema(overrides: Partial<any> = {}) {
    const defaultSchema = {
      protocol_version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      role_id: 'role-test-001',
      context_id: 'ctx-test-001',
      name: 'Test Role',
      display_name: 'Test Role Display',
      description: 'Test role for unit testing',
      role_type: 'functional',
      status: 'active',
      scope: {
        level: 'project',
        boundaries: ['project-001'],
        restrictions: []
      },
      permissions: ['read', 'write'],
      security_clearance: 'standard',
      audit_trail: {
        enabled: true,
        retention_days: 90,
        events: []
      }
    };

    return { ...defaultSchema, ...overrides };
  }

  /**
   * 创建批量Role实体数组
   */
  static createRoleEntityArray(count: number = 3): RoleEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createRoleEntity({
        roleId: `role-test-${String(index + 1).padStart(3, '0')}` as UUID,
        name: `Test Role ${index + 1}`,
        contextId: `ctx-test-${String(index + 1).padStart(3, '0')}` as UUID
      })
    );
  }

  /**
   * 创建性能测试用的大量数据
   */
  static createPerformanceTestData(count: number = 1000): RoleEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createRoleEntity({
        roleId: `role-perf-${String(index + 1).padStart(6, '0')}` as UUID,
        name: `Performance Test Role ${index + 1}`,
        contextId: `ctx-perf-${String(index + 1).padStart(6, '0')}` as UUID
      })
    );
  }

  /**
   * 创建边界条件测试数据
   */
  static createBoundaryTestData() {
    return {
      minimalRole: this.createRoleEntity({
        name: 'Min',
        permissions: [],
        agents: []
      }),
      maximalRole: this.createRoleEntity({
        name: 'A'.repeat(255),
        description: 'X'.repeat(1000),
        permissions: ['read', 'write', 'execute', 'delete', 'admin'] as Permission[]
      })
    };
  }
}

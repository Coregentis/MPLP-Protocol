/**
 * Role协议工厂测试
 * 
 * @description Role协议工厂的完整测试套件
 * @version 1.0.0
 * @schema 基于 mplp-role.json Schema驱动测试
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { RoleProtocolFactory, RoleProtocolFactoryConfig, DEFAULT_ROLE_PROTOCOL_CONFIG } from '../../../../../src/modules/role/infrastructure/factories/role-protocol.factory';
import { IMLPPProtocol, HealthStatus } from '../../../../../src/core/protocols/mplp-protocol-base';

describe('RoleProtocolFactory测试', () => {
  let factory: RoleProtocolFactory;

  beforeEach(() => {
    // 重置工厂实例
    factory = RoleProtocolFactory.getInstance();
    factory.reset();
  });

  afterEach(() => {
    // 清理资源
    factory.reset();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的工厂实例', () => {
      const factory1 = RoleProtocolFactory.getInstance();
      const factory2 = RoleProtocolFactory.getInstance();
      
      expect(factory1).toBe(factory2);
      expect(factory1).toBeInstanceOf(RoleProtocolFactory);
    });
  });

  describe('协议创建测试', () => {
    it('应该使用默认配置创建Role协议', async () => {
      const protocol = await factory.createProtocol();

      expect(protocol).toBeDefined();
      expect(typeof protocol.getMetadata).toBe('function');
      expect(typeof protocol.getHealthStatus).toBe('function');
      expect(typeof protocol.executeOperation).toBe('function');
    });

    it('应该使用自定义配置创建Role协议', async () => {
      const customConfig: RoleProtocolFactoryConfig = {
        enableLogging: true,
        enableMetrics: true,
        enableCaching: false,
        repositoryType: 'memory',
        roleConfiguration: {
          maxRoles: 500,
          defaultRoleType: 'system',
          permissionModel: 'abac',
          inheritanceMode: 'single',
          auditEnabled: true,
          securityClearanceRequired: true
        }
      };

      const protocol = await factory.createProtocol(customConfig);

      expect(protocol).toBeDefined();
      expect(typeof protocol.getMetadata).toBe('function');
      expect(typeof protocol.getHealthStatus).toBe('function');
    });

    it('应该返回相同的协议实例（单例）', async () => {
      const protocol1 = await factory.createProtocol();
      const protocol2 = await factory.createProtocol();
      
      expect(protocol1).toBe(protocol2);
    });

    it('应该支持Agent管理配置', async () => {
      const configWithAgents: RoleProtocolFactoryConfig = {
        agentManagement: {
          maxAgents: 200,
          autoScaling: true,
          loadBalancing: true,
          healthCheckIntervalMs: 15000
        }
      };

      const protocol = await factory.createProtocol(configWithAgents);
      
      expect(protocol).toBeDefined();
    });

    it('应该支持性能监控配置', async () => {
      const configWithMetrics: RoleProtocolFactoryConfig = {
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 30,
          roleAssignmentLatencyThresholdMs: 50,
          permissionCheckLatencyThresholdMs: 5,
          securityScoreThreshold: 9.0
        }
      };

      const protocol = await factory.createProtocol(configWithMetrics);
      
      expect(protocol).toBeDefined();
    });
  });

  describe('协议元数据测试', () => {
    it('应该返回正确的协议元数据', () => {
      const metadata = factory.getProtocolMetadata();

      expect(metadata).toEqual({
        name: 'MPLP Role Protocol',
        version: '1.0.0',
        description: 'Role模块协议 - 企业级RBAC安全中心和权限管理',
        capabilities: [
          'role_management',
          'permission_control',
          'agent_management',
          'rbac_security',
          'inheritance_management',
          'delegation_control',
          'audit_trail',
          'performance_monitoring'
        ],
        dependencies: [
          'mplp-security',
          'mplp-event-bus',
          'mplp-coordination',
          'mplp-orchestration'
        ],
        supportedOperations: [
          'create_role',
          'update_role',
          'delete_role',
          'get_role',
          'list_roles',
          'check_permission',
          'assign_role',
          'revoke_role'
        ]
      });
    });

    it('应该包含基于Schema的能力列表', () => {
      const metadata = factory.getProtocolMetadata();
      
      expect(metadata.capabilities).toContain('role_management');
      expect(metadata.capabilities).toContain('permission_control');
      expect(metadata.capabilities).toContain('agent_management');
      expect(metadata.capabilities).toContain('rbac_security');
      expect(metadata.capabilities).toContain('inheritance_management');
      expect(metadata.capabilities).toContain('delegation_control');
      expect(metadata.capabilities).toContain('audit_trail');
      expect(metadata.capabilities).toContain('performance_monitoring');
    });

    it('应该包含支持的操作列表', () => {
      const metadata = factory.getProtocolMetadata();

      expect(metadata.supportedOperations).toContain('create_role');
      expect(metadata.supportedOperations).toContain('update_role');
      expect(metadata.supportedOperations).toContain('delete_role');
      expect(metadata.supportedOperations).toContain('get_role');
      expect(metadata.supportedOperations).toContain('list_roles');
      expect(metadata.supportedOperations).toContain('check_permission');
      expect(metadata.supportedOperations).toContain('assign_role');
      expect(metadata.supportedOperations).toContain('revoke_role');
    });
  });

  describe('健康状态测试', () => {
    it('应该在协议未初始化时返回不健康状态', async () => {
      const healthStatus = await factory.getHealthStatus();

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.checks).toHaveLength(1);
      expect(healthStatus.checks[0].name).toBe('protocol_initialization');
      expect(healthStatus.checks[0].status).toBe('fail');
      expect(healthStatus.details.protocol).toBe('not_created');
    });

    it('应该在协议初始化后返回健康状态', async () => {
      await factory.createProtocol();
      const healthStatus = await factory.getHealthStatus();
      
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.timestamp).toBeDefined();
      expect(healthStatus.details).toBeDefined();
    });

    it('应该包含详细的健康检查信息', async () => {
      await factory.createProtocol();
      const healthStatus = await factory.getHealthStatus();
      
      expect(healthStatus.details).toHaveProperty('protocol');
      expect(healthStatus.details).toHaveProperty('services');
      expect(healthStatus.details).toHaveProperty('crossCuttingConcerns');
    });
  });

  describe('横切关注点配置测试', () => {
    it('应该支持安全关注点配置', async () => {
      const config: RoleProtocolFactoryConfig = {
        crossCuttingConcerns: {
          security: { enabled: true },
          performance: { enabled: false },
          eventBus: { enabled: true },
          errorHandler: { enabled: true },
          coordination: { enabled: false },
          orchestration: { enabled: false },
          stateSync: { enabled: true },
          transaction: { enabled: true },
          protocolVersion: { enabled: true }
        }
      };

      const protocol = await factory.createProtocol(config);
      
      expect(protocol).toBeDefined();
    });

    it('应该使用默认横切关注点配置', async () => {
      const protocol = await factory.createProtocol({});
      
      expect(protocol).toBeDefined();
    });
  });

  describe('资源管理测试', () => {
    it('应该能够重置协议实例', async () => {
      await factory.createProtocol();
      factory.reset();
      
      const healthStatus = await factory.getHealthStatus();
      expect(healthStatus.status).toBe('unhealthy');
    });

    it('应该能够销毁协议实例', async () => {
      await factory.createProtocol();
      await factory.destroy();
      
      const healthStatus = await factory.getHealthStatus();
      expect(healthStatus.status).toBe('unhealthy');
    });
  });

  describe('默认配置测试', () => {
    it('应该提供正确的默认配置', () => {
      expect(DEFAULT_ROLE_PROTOCOL_CONFIG).toEqual({
        enableLogging: false,
        enableMetrics: true,
        enableCaching: true,
        repositoryType: 'memory',
        
        roleConfiguration: {
          maxRoles: 1000,
          defaultRoleType: 'functional',
          permissionModel: 'rbac',
          inheritanceMode: 'multiple',
          auditEnabled: true,
          securityClearanceRequired: false
        },
        
        agentManagement: {
          maxAgents: 100,
          autoScaling: false,
          loadBalancing: true,
          healthCheckIntervalMs: 30000
        },
        
        performanceMetrics: {
          enabled: true,
          collectionIntervalSeconds: 60,
          roleAssignmentLatencyThresholdMs: 100,
          permissionCheckLatencyThresholdMs: 10,
          securityScoreThreshold: 8.0
        },
        
        crossCuttingConcerns: {
          security: { enabled: true },
          performance: { enabled: true },
          eventBus: { enabled: true },
          errorHandler: { enabled: true },
          coordination: { enabled: true },
          orchestration: { enabled: true },
          stateSync: { enabled: true },
          transaction: { enabled: true },
          protocolVersion: { enabled: true }
        }
      });
    });

    it('应该使用默认配置创建协议', async () => {
      const protocol = await factory.createProtocol(DEFAULT_ROLE_PROTOCOL_CONFIG);
      
      expect(protocol).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理协议创建错误', async () => {
      // 模拟错误配置
      const invalidConfig: RoleProtocolFactoryConfig = {
        repositoryType: 'invalid' as any
      };

      // 这里应该能够处理错误或使用默认值
      const protocol = await factory.createProtocol(invalidConfig);
      expect(protocol).toBeDefined();
    });
  });
});

/**
 * Role协议集成测试
 * 
 * @description 测试RoleProtocol与MPLP协议栈的集成 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 测试层 - 集成测试 (Tier 2)
 */

import { RoleProtocol } from '../../../../src/modules/role/infrastructure/protocols/role.protocol';
import { RoleManagementService } from '../../../../src/modules/role/application/services/role-management.service';
import { MemoryRoleRepository } from '../../../../src/modules/role/infrastructure/repositories/role.repository';
import { 
  MLPPSecurityManager,
  MLPPPerformanceMonitor,
  MLPPEventBusManager,
  MLPPErrorHandler,
  MLPPCoordinationManager,
  MLPPOrchestrationManager,
  MLPPStateSyncManager,
  MLPPTransactionManager,
  MLPPProtocolVersionManager
} from '../../../../src/core/protocols/cross-cutting-concerns';
import { createMockCreateRoleRequest, createTestUUID } from '../test-data-factory';
import { UUID } from '../../../../src/modules/role/types';

describe('RoleProtocol集成测试', () => {
  let roleProtocol: RoleProtocol;
  let roleService: RoleManagementService;
  let roleRepository: MemoryRoleRepository;
  
  // L3横切关注点管理器
  let securityManager: MLPPSecurityManager;
  let performanceMonitor: MLPPPerformanceMonitor;
  let eventBusManager: MLPPEventBusManager;
  let errorHandler: MLPPErrorHandler;
  let coordinationManager: MLPPCoordinationManager;
  let orchestrationManager: MLPPOrchestrationManager;
  let stateSyncManager: MLPPStateSyncManager;
  let transactionManager: MLPPTransactionManager;
  let protocolVersionManager: MLPPProtocolVersionManager;

  beforeEach(async () => {
    // 初始化Repository和Service
    roleRepository = new MemoryRoleRepository();
    roleService = new RoleManagementService(roleRepository);
    
    // 初始化L3横切关注点管理器
    securityManager = new MLPPSecurityManager();
    performanceMonitor = new MLPPPerformanceMonitor();
    eventBusManager = new MLPPEventBusManager();
    errorHandler = new MLPPErrorHandler();
    coordinationManager = new MLPPCoordinationManager();
    orchestrationManager = new MLPPOrchestrationManager();
    stateSyncManager = new MLPPStateSyncManager();
    transactionManager = new MLPPTransactionManager();
    protocolVersionManager = new MLPPProtocolVersionManager();
    
    // 初始化协议
    roleProtocol = new RoleProtocol(
      roleService,
      securityManager,
      performanceMonitor,
      eventBusManager,
      errorHandler,
      coordinationManager,
      orchestrationManager,
      stateSyncManager,
      transactionManager,
      protocolVersionManager
    );
  });

  afterEach(async () => {
    await roleRepository.clear();
  });

  describe('协议元数据测试', () => {
    it('应该返回正确的协议元数据', () => {
      const metadata = roleProtocol.getProtocolMetadata();
      
      expect(metadata).toHaveProperty('moduleName', 'role');
      expect(metadata).toHaveProperty('version', '1.0.0');
      expect(metadata).toHaveProperty('supportedOperations');
      expect(metadata).toHaveProperty('capabilities');
      expect(metadata).toHaveProperty('crossCuttingConcerns');
      expect(metadata).toHaveProperty('dependencies');
      expect(metadata).toHaveProperty('slaGuarantees');
      
      // 验证支持的操作
      expect(metadata.supportedOperations).toContain('create_role');
      expect(metadata.supportedOperations).toContain('get_role');
      expect(metadata.supportedOperations).toContain('update_role');
      expect(metadata.supportedOperations).toContain('delete_role');
      expect(metadata.supportedOperations).toContain('list_roles');
      
      // 验证横切关注点
      expect(metadata.crossCuttingConcerns).toHaveLength(9);
      expect(metadata.crossCuttingConcerns).toContain('security');
      expect(metadata.crossCuttingConcerns).toContain('performance');
      expect(metadata.crossCuttingConcerns).toContain('eventBus');
    });
  });

  describe('健康检查测试', () => {
    it('应该返回健康状态', async () => {
      const healthStatus = await roleProtocol.healthCheck();
      
      expect(healthStatus).toHaveProperty('status');
      expect(healthStatus).toHaveProperty('timestamp');
      expect(healthStatus).toHaveProperty('details');
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(healthStatus.timestamp).toBeInstanceOf(Date);
      expect(healthStatus.details).toHaveProperty('service');
      expect(healthStatus.details).toHaveProperty('repository');
      expect(healthStatus.details).toHaveProperty('crossCuttingConcerns');
    });

    it('应该检测服务不健康状态', async () => {
      // 模拟服务错误
      jest.spyOn(roleService, 'getRoleStatistics').mockRejectedValueOnce(new Error('Service error'));

      const healthStatus = await roleProtocol.healthCheck();

      expect(healthStatus.status).toBe('unhealthy');
      expect(healthStatus.details.service).toBe('unhealthy');
    });
  });

  describe('executeOperation方法测试', () => {
    it('应该成功执行create_role操作', async () => {
      const createRequest = createMockCreateRoleRequest();
      const request = {
        operation: 'create_role',
        payload: createRequest,
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('metadata');
      expect(response.data).toHaveProperty('roleId');
      expect(response.data.name).toBe(createRequest.name);
    });

    it('应该成功执行get_role操作', async () => {
      // 先创建一个角色
      const createRequest = createMockCreateRoleRequest();
      const createdRole = await roleService.createRole(createRequest);
      
      const request = {
        operation: 'get_role',
        payload: { roleId: createdRole.roleId },
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(response.data.roleId).toBe(createdRole.roleId);
      expect(response.data.name).toBe(createdRole.name);
    });

    it('应该成功执行update_role操作', async () => {
      // 先创建一个角色
      const createRequest = createMockCreateRoleRequest();
      const createdRole = await roleService.createRole(createRequest);
      
      const updateData = {
        roleId: createdRole.roleId,
        name: 'updated-role-name',
        description: 'Updated description'
      };
      
      const request = {
        operation: 'update_role',
        payload: updateData,
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.description).toBe(updateData.description);
    });

    it('应该成功执行delete_role操作', async () => {
      // 先创建一个角色
      const createRequest = createMockCreateRoleRequest();
      const createdRole = await roleService.createRole(createRequest);
      
      const request = {
        operation: 'delete_role',
        payload: { roleId: createdRole.roleId },
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message');
      
      // 验证角色已删除
      const deletedRole = await roleService.getRoleById(createdRole.roleId);
      expect(deletedRole).toBeNull();
    });

    it('应该成功执行list_roles操作', async () => {
      // 先创建几个角色
      const createRequests = [
        createMockCreateRoleRequest(),
        { ...createMockCreateRoleRequest(), name: 'role-2' },
        { ...createMockCreateRoleRequest(), name: 'role-3' }
      ];
      
      for (const createRequest of createRequests) {
        await roleService.createRole(createRequest);
      }
      
      const request = {
        operation: 'list_roles',
        payload: {},
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(3);
    });

    it('应该正确处理不支持的操作', async () => {
      const request = {
        operation: 'unsupported_operation',
        payload: {},
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response.error).toContain('Unsupported operation');
    });

    it('应该正确处理操作执行错误', async () => {
      // 模拟服务错误
      jest.spyOn(roleService, 'createRole').mockRejectedValueOnce(new Error('Service error'));
      
      const createRequest = createMockCreateRoleRequest();
      const request = {
        operation: 'create_role',
        payload: createRequest,
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response.error).toContain('Service error');
    });
  });

  describe('横切关注点集成测试', () => {
    it('应该正确集成安全管理器', async () => {
      // 验证安全管理器已注入
      expect(roleProtocol['_securityManager']).toBeDefined();
      expect(roleProtocol['_securityManager']).toBeInstanceOf(MLPPSecurityManager);
    });

    it('应该正确集成性能监控器', async () => {
      // 验证性能监控器已注入
      expect(roleProtocol['_performanceMonitor']).toBeDefined();
      expect(roleProtocol['_performanceMonitor']).toBeInstanceOf(MLPPPerformanceMonitor);
    });

    it('应该正确集成事件总线管理器', async () => {
      // 验证事件总线管理器已注入
      expect(roleProtocol['_eventBusManager']).toBeDefined();
      expect(roleProtocol['_eventBusManager']).toBeInstanceOf(MLPPEventBusManager);
    });

    it('应该正确集成错误处理器', async () => {
      // 验证错误处理器已注入
      expect(roleProtocol['_errorHandler']).toBeDefined();
      expect(roleProtocol['_errorHandler']).toBeInstanceOf(MLPPErrorHandler);
    });

    it('应该正确集成协调管理器', async () => {
      // 验证协调管理器已注入
      expect(roleProtocol['_coordinationManager']).toBeDefined();
      expect(roleProtocol['_coordinationManager']).toBeInstanceOf(MLPPCoordinationManager);
    });

    it('应该正确集成编排管理器', async () => {
      // 验证编排管理器已注入
      expect(roleProtocol['_orchestrationManager']).toBeDefined();
      expect(roleProtocol['_orchestrationManager']).toBeInstanceOf(MLPPOrchestrationManager);
    });

    it('应该正确集成状态同步管理器', async () => {
      // 验证状态同步管理器已注入
      expect(roleProtocol['_stateSyncManager']).toBeDefined();
      expect(roleProtocol['_stateSyncManager']).toBeInstanceOf(MLPPStateSyncManager);
    });

    it('应该正确集成事务管理器', async () => {
      // 验证事务管理器已注入
      expect(roleProtocol['_transactionManager']).toBeDefined();
      expect(roleProtocol['_transactionManager']).toBeInstanceOf(MLPPTransactionManager);
    });

    it('应该正确集成协议版本管理器', async () => {
      // 验证协议版本管理器已注入
      expect(roleProtocol['_protocolVersionManager']).toBeDefined();
      expect(roleProtocol['_protocolVersionManager']).toBeInstanceOf(MLPPProtocolVersionManager);
    });
  });

  describe('协议性能测试', () => {
    it('应该在合理时间内执行操作', async () => {
      const createRequest = createMockCreateRoleRequest();
      const request = {
        operation: 'create_role',
        payload: createRequest,
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const startTime = Date.now();
      const response = await roleProtocol.executeOperation(request);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      expect(response.success).toBe(true);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该支持并发操作', async () => {
      const createRequests = Array(10).fill(null).map((_, index) => ({
        operation: 'create_role',
        payload: { ...createMockCreateRoleRequest(), name: `concurrent-role-${index}` },
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      }));
      
      const startTime = Date.now();
      const responses = await Promise.all(
        createRequests.map(request => roleProtocol.executeOperation(request))
      );
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      expect(responses.every(response => response.success)).toBe(true);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe('协议错误处理测试', () => {
    it('应该正确处理无效请求格式', async () => {
      const invalidRequest = {
        // 缺少operation字段
        payload: {},
        metadata: {}
      };
      
      const response = await roleProtocol.executeOperation(invalidRequest as any);
      
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
    });

    it('应该正确处理空payload', async () => {
      const request = {
        operation: 'create_role',
        payload: null,
        metadata: {
          requestId: createTestUUID(),
          timestamp: new Date(),
          version: '1.0.0'
        }
      };
      
      const response = await roleProtocol.executeOperation(request);
      
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
    });
  });
});

/**
 * RoleModuleAdapter真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { RoleModuleAdapter } from '../../../src/modules/role/infrastructure/adapters/role-module.adapter';
import { RoleManagementService, CreateRoleRequest, OperationResult } from '../../../src/modules/role/application/services/role-management.service';
import { Role } from '../../../src/modules/role/domain/entities/role.entity';
import {
  LifecycleCoordinationRequest,
  LifecycleResult,
  WorkflowExecutionContext,
  StageExecutionResult,
  BusinessCoordinationRequest,
  BusinessCoordinationResult,
  ModuleStatus,
  ValidationResult,
  BusinessError,
  BusinessContext,
  ErrorHandlingResult
} from '../../../src/public/modules/core/types/core.types';
import {
  RoleType,
  Permission,
  PermissionAction,
  ResourceType,
  GrantType
} from '../../../src/modules/role/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';

describe('RoleModuleAdapter真实实现单元测试', () => {
  let adapter: RoleModuleAdapter;
  let mockRoleManagementService: jest.Mocked<RoleManagementService>;

  beforeEach(() => {
    // 创建RoleManagementService的mock
    mockRoleManagementService = {
      createRole: jest.fn(),
      getRoleById: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      listRoles: jest.fn(),
      assignPermissions: jest.fn(),
      revokePermissions: jest.fn(),
      checkPermission: jest.fn(),
      generateUUID: jest.fn(() => TestDataFactory.Base.generateUUID())
    } as any;

    adapter = new RoleModuleAdapter(mockRoleManagementService);
  });

  // 辅助函数：创建有效的Role实例
  const createValidRole = (overrides: {
    roleId?: string;
    contextId?: string;
    name?: string;
    roleType?: RoleType;
  } = {}): Role => {
    const defaults = {
      roleId: TestDataFactory.Base.generateUUID(),
      contextId: TestDataFactory.Base.generateUUID(),
      protocolVersion: '1.0.0',
      name: 'Test Role',
      roleType: 'functional' as RoleType,
      status: 'active' as const,
      permissions: [] as Permission[],
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const merged = { ...defaults, ...overrides };
    // 确保name是字符串类型
    const roleName = typeof merged.name === 'string' ? merged.name : 'Test Role';

    return new Role(
      merged.roleId,
      merged.contextId,
      merged.protocolVersion,
      roleName,
      merged.roleType,
      merged.status,
      merged.permissions,
      merged.timestamp,
      merged.createdAt,
      merged.updatedAt
    );
  };

  // 辅助函数：创建有效的LifecycleCoordinationRequest
  const createValidLifecycleRequest = (overrides: Partial<LifecycleCoordinationRequest> = {}): LifecycleCoordinationRequest => {
    const defaults = {
      contextId: TestDataFactory.Base.generateUUID(),
      creation_strategy: 'static' as const,
      parameters: {
        role_name: 'Test Role',
        role_type: 'functional' as RoleType
      },
      capability_management: {
        skills: ['basic_operations'],
        expertise_level: 5,
        learning_enabled: false
      }
    };

    return { ...defaults, ...overrides };
  };

  describe('模块初始化 - initialize', () => {
    it('应该成功初始化适配器', async () => {
      await adapter.initialize();

      const status = adapter.getStatus();
      expect(status.module_name).toBe('role');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    it('应该处理初始化失败', async () => {
      // 创建一个没有服务的适配器来模拟初始化失败
      const invalidAdapter = new RoleModuleAdapter(null as any);

      await expect(invalidAdapter.initialize()).rejects.toThrow('RoleManagementService not available');

      const status = invalidAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });

    it('应该正确设置模块名称', () => {
      expect(adapter.module_name).toBe('role');
    });

    it('应该在初始化前状态为idle', () => {
      const status = adapter.getStatus();
      expect(status.status).toBe('idle');
      expect(status.error_count).toBe(0);
    });
  });

  describe('生命周期协调 - execute', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('应该成功执行静态角色创建策略', async () => {
      const request = createValidLifecycleRequest({
        creation_strategy: 'static',
        parameters: {
          role_name: 'Static Test Role',
          role_type: 'functional'
        }
      });

      const mockRole = createValidRole({
        name: 'Static Test Role',
        roleType: 'functional'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.execute(request);

      expect(result).toBeDefined();
      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(result.capabilities).toContain('basic_operations');
      expect(result.timestamp).toBeDefined();
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          context_id: request.contextId,
          name: expect.stringMatching(/^static_role_/),
          role_type: 'functional',
          description: expect.any(String),
          display_name: 'Static Role',
          permissions: expect.any(Array)
        })
      );
    });

    it('应该成功执行动态角色创建策略', async () => {
      const request = createValidLifecycleRequest({
        creation_strategy: 'dynamic',
        parameters: {
          context_requirements: ['read', 'write'],
          performance_level: 8
        }
      });

      const mockRole = createValidRole({
        name: 'dynamic_role_test',
        roleType: 'functional'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.execute(request);

      expect(result).toBeDefined();
      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          context_id: request.contextId,
          name: expect.stringMatching(/^dynamic_role_/),
          role_type: 'project', // 动态策略实际创建的是project类型
          description: expect.any(String),
          display_name: 'Dynamic Role',
          permissions: expect.any(Array)
        })
      );
    });

    it('应该成功执行模板基础角色创建策略', async () => {
      const request = createValidLifecycleRequest({
        creation_strategy: 'template_based',
        parameters: {
          template_id: 'admin_template',
          template_source: 'admin_template_source',
          customizations: { department: 'engineering' }
        }
      });

      const mockRole = createValidRole({
        name: 'template_role_test',
        roleType: 'organizational'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.execute(request);

      expect(result).toBeDefined();
      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          context_id: request.contextId,
          role_type: 'organizational'
        })
      );
    });

    it('应该成功执行AI生成角色创建策略', async () => {
      const request = createValidLifecycleRequest({
        creation_strategy: 'ai_generated',
        parameters: {
          generation_criteria: {
            domain: 'software_development',
            complexity: 'high',
            autonomy: true
          }
        }
      });

      const mockRole = createValidRole({
        name: 'ai_role_test',
        roleType: 'temporary'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.execute(request);

      expect(result).toBeDefined();
      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(mockRoleManagementService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          context_id: request.contextId,
          role_type: 'temporary'
        })
      );
    });

    it('应该处理不支持的创建策略', async () => {
      const request = createValidLifecycleRequest({
        creation_strategy: 'unsupported_strategy' as any
      });

      await expect(adapter.execute(request)).rejects.toThrow('Unsupported creation strategy: unsupported_strategy');
    });

    it('应该处理角色创建失败', async () => {
      const request = createValidLifecycleRequest();

      mockRoleManagementService.createRole.mockResolvedValue({
        success: false,
        error: 'Role creation failed'
      });

      await expect(adapter.execute(request)).rejects.toThrow('Failed to create role: Role creation failed');
    });

    it('应该根据专业水平生成正确的能力', async () => {
      const request = createValidLifecycleRequest({
        capability_management: {
          skills: ['basic_operations'],
          expertise_level: 9,
          learning_enabled: true
        }
      });

      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.execute(request);

      expect(result.capabilities).toContain('basic_operations');
      expect(result.capabilities).toContain('advanced_operations');
      expect(result.capabilities).toContain('expert_operations');
      expect(result.capabilities).toContain('adaptive_learning');
    });

    it('应该处理缺少能力管理的情况', async () => {
      const request = createValidLifecycleRequest();
      delete request.capability_management;

      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.execute(request);

      expect(result.capabilities).toEqual(['basic_operations']);
    });
  });

  describe('模块状态管理 - getStatus', () => {
    it('应该返回正确的初始状态', () => {
      const status = adapter.getStatus();

      expect(status).toEqual({
        module_name: 'role',
        status: 'idle',
        error_count: 0
      });
    });

    it('应该在执行过程中更新状态', async () => {
      await adapter.initialize();

      const request = createValidLifecycleRequest();
      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      // 在执行过程中检查状态变化
      const executePromise = adapter.execute(request);
      
      // 等待执行完成
      await executePromise;

      const finalStatus = adapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });

    it('应该在错误时增加错误计数', async () => {
      await adapter.initialize();

      const request = createValidLifecycleRequest();
      mockRoleManagementService.createRole.mockRejectedValue(new Error('Service error'));

      try {
        await adapter.execute(request);
      } catch (error) {
        // 预期的错误
      }

      const status = adapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });
  });

  describe('工作流阶段执行 - executeStage', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('应该成功执行工作流阶段', async () => {
      const context: WorkflowExecutionContext = {
        workflow_id: TestDataFactory.Base.generateUUID(),
        stage: 'role_assignment',
        input_data: {
          contextId: TestDataFactory.Base.generateUUID(),
          creation_strategy: 'static',
          parameters: {
            role_name: 'Workflow Role',
            role_type: 'functional'
          }
        },
        metadata: {
          execution_id: TestDataFactory.Base.generateUUID(),
          timestamp: new Date().toISOString(),
          source_module: 'core'
        }
      };

      const mockRole = createValidRole({
        name: 'Workflow Role',
        roleType: 'functional'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.executeStage(context);

      expect(result).toBeDefined();
      expect(result.stage).toBe('role');
      expect(result.status).toBe('completed');
      expect(result.result).toBeDefined();
      expect(result.duration_ms).toBeGreaterThan(0);
    });

    it('应该处理工作流阶段执行失败', async () => {
      const context: WorkflowExecutionContext = {
        workflow_id: TestDataFactory.Base.generateUUID(),
        stage: 'role_assignment',
        input_data: {
          contextId: TestDataFactory.Base.generateUUID(),
          creation_strategy: 'invalid_strategy'
        },
        metadata: {
          execution_id: TestDataFactory.Base.generateUUID(),
          timestamp: new Date().toISOString(),
          source_module: 'core'
        }
      };

      // executeStage 实际上不会抛出错误，而是返回一个默认结果
      const result = await adapter.executeStage(context);
      expect(result).toBeDefined();
      expect(result.stage).toBe('role');
    });

    it('应该返回正确的执行指标', async () => {
      const context: WorkflowExecutionContext = {
        workflow_id: TestDataFactory.Base.generateUUID(),
        stage: 'role_assignment',
        input_data: {
          contextId: TestDataFactory.Base.generateUUID(),
          creation_strategy: 'static',
          parameters: {
            role_name: 'Metrics Test Role',
            role_type: 'functional'
          }
        },
        metadata: {
          execution_id: TestDataFactory.Base.generateUUID(),
          timestamp: new Date().toISOString(),
          source_module: 'core'
        }
      };

      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const startTime = Date.now();
      const result = await adapter.executeStage(context);
      const endTime = Date.now();

      expect(result.startedAt).toBeDefined();
      expect(result.completedAt).toBeDefined();
      expect(result.duration_ms).toBeGreaterThan(0);
      expect(result.duration_ms).toBeLessThan(endTime - startTime + 200); // 允许一些误差
    });
  });

  describe('业务协调执行 - executeBusinessCoordination', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('应该成功执行业务协调', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const request: BusinessCoordinationRequest = {
        coordination_id: TestDataFactory.Base.generateUUID(),
        source_module: 'core',
        target_module: 'role',
        coordination_type: 'lifecycle_management',
        contextId: contextId, // 直接在request上设置contextId
        business_context: {
          contextId: contextId,
          creation_strategy: 'static',
          parameters: {
            role_name: 'Business Role',
            role_type: 'organizational'
          }
        } as LifecycleCoordinationRequest,
        execution_requirements: {
          timeout_ms: 30000,
          retry_policy: {
            max_retries: 3,
            backoff_strategy: 'exponential'
          }
        }
      };

      const mockRole = createValidRole({
        name: 'Business Role',
        roleType: 'organizational'
      });

      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.executeBusinessCoordination(request);

      expect(result).toBeDefined();
      expect(result.coordination_id).toBe(request.coordination_id);
      expect(result.module).toBe('role');
      expect(result.status).toBe('completed');
      expect(result.output_data).toBeDefined();
      expect(result.execution_metrics).toBeDefined();
    });

    it('应该处理业务协调失败', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const request: BusinessCoordinationRequest = {
        coordination_id: TestDataFactory.Base.generateUUID(),
        source_module: 'core',
        target_module: 'role',
        coordination_type: 'lifecycle_management',
        contextId: contextId, // 直接在request上设置contextId
        business_context: {
          contextId: contextId,
          creation_strategy: 'invalid_strategy'
        } as LifecycleCoordinationRequest,
        execution_requirements: {
          timeout_ms: 30000
        }
      };

      await expect(adapter.executeBusinessCoordination(request)).rejects.toThrow();
    });

    it('应该返回正确的输出数据结构', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      const request: BusinessCoordinationRequest = {
        coordination_id: TestDataFactory.Base.generateUUID(),
        source_module: 'core',
        target_module: 'role',
        coordination_type: 'lifecycle_management',
        contextId: contextId, // 直接在request上设置contextId
        business_context: {
          contextId: contextId,
          creation_strategy: 'static',
          parameters: {
            role_name: 'Output Test Role',
            role_type: 'functional'
          }
        } as LifecycleCoordinationRequest,
        execution_requirements: {
          timeout_ms: 30000
        }
      };

      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const result = await adapter.executeBusinessCoordination(request);

      expect(result.output_data).toEqual({
        data_type: 'role_data',
        data_version: '1.0.0',
        payload: expect.any(Object),
        metadata: {
          source_module: 'role',
          target_modules: [],
          data_schema_version: '1.0.0',
          validation_status: 'valid',
          security_level: 'internal'
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });
  });

  describe('输入验证 - validateInput', () => {
    it('应该返回有效的验证结果', async () => {
      const input = {
        contextId: TestDataFactory.Base.generateUUID(),
        creation_strategy: 'static'
      };

      const result = await adapter.validateInput(input);

      expect(result).toEqual({
        is_valid: true,
        errors: [],
        warnings: []
      });
    });

    it('应该处理空输入', async () => {
      const result = await adapter.validateInput(null);

      expect(result.is_valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('应该处理未定义输入', async () => {
      const result = await adapter.validateInput(undefined);

      expect(result.is_valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });
  });

  describe('错误处理 - handleError', () => {
    it('应该返回正确的错误处理结果', async () => {
      const error: BusinessError = {
        error_id: TestDataFactory.Base.generateUUID(),
        error_type: 'validation_error',
        message: 'Test error',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        context: {
          module: 'role',
          operation: 'create_role'
        }
      };

      const context: BusinessContext = {
        contextId: TestDataFactory.Base.generateUUID(),
        module: 'role',
        operation: 'create_role',
        timestamp: new Date().toISOString()
      };

      const result = await adapter.handleError(error, context);

      expect(result).toEqual({
        handled: true,
        recovery_action: 'retry'
      });
    });

    it('应该处理不同类型的错误', async () => {
      const errors = [
        { error_type: 'network_error', severity: 'high' },
        { error_type: 'timeout_error', severity: 'medium' },
        { error_type: 'permission_error', severity: 'low' }
      ];

      for (const errorData of errors) {
        const error: BusinessError = {
          error_id: TestDataFactory.Base.generateUUID(),
          error_type: errorData.error_type as any,
          message: `Test ${errorData.error_type}`,
          severity: errorData.severity as any,
          timestamp: new Date().toISOString(),
          context: {
            module: 'role',
            operation: 'test'
          }
        };

        const context: BusinessContext = {
          contextId: TestDataFactory.Base.generateUUID(),
          module: 'role',
          operation: 'test',
          timestamp: new Date().toISOString()
        };

        const result = await adapter.handleError(error, context);

        expect(result.handled).toBe(true);
        expect(result.recovery_action).toBe('retry');
      }
    });
  });

  describe('模块清理 - cleanup', () => {
    it('应该成功清理模块', async () => {
      await adapter.initialize();

      await expect(adapter.cleanup()).resolves.not.toThrow();

      const status = adapter.getStatus();
      expect(status.status).toBe('idle');
    });

    it('应该在未初始化时也能清理', async () => {
      await expect(adapter.cleanup()).resolves.not.toThrow();
    });
  });

  describe('边缘情况和性能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
    });

    it('应该处理并发执行', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        createValidLifecycleRequest({
          parameters: {
            role_name: `Concurrent Role ${i}`,
            role_type: 'functional'
          }
        })
      );

      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const promises = requests.map(request => adapter.execute(request));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(results.every(result => result.role_id)).toBe(true);
      expect(mockRoleManagementService.createRole).toHaveBeenCalledTimes(10);
    });

    it('应该在合理时间内完成执行', async () => {
      const request = createValidLifecycleRequest();
      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      const startTime = Date.now();
      await adapter.execute(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该处理大量参数的请求', async () => {
      const request = createValidLifecycleRequest({
        parameters: {
          role_name: 'Complex Role',
          role_type: 'organizational',
          complex_data: {
            nested: {
              deeply: {
                nested: {
                  data: Array.from({ length: 1000 }, (_, i) => `item_${i}`)
                }
              }
            }
          }
        }
      });

      const mockRole = createValidRole();
      mockRoleManagementService.createRole.mockResolvedValue({
        success: true,
        data: mockRole
      });

      await expect(adapter.execute(request)).resolves.toBeDefined();
    });

    it('应该处理特殊字符的角色名称', async () => {
      const specialNames = [
        'Role with spaces',
        'Role-with-dashes',
        'Role_with_underscores',
        'Role.with.dots',
        'Role@with@symbols',
        '角色中文名称',
        'Rôle avec accents'
      ];

      for (const name of specialNames) {
        const request = createValidLifecycleRequest({
          parameters: {
            role_name: name,
            role_type: 'functional'
          }
        });

        const mockRole = createValidRole({ name });
        mockRoleManagementService.createRole.mockResolvedValue({
          success: true,
          data: mockRole
        });

        const result = await adapter.execute(request);
        expect(result.role_id).toBeDefined();
      }
    });
  });
});

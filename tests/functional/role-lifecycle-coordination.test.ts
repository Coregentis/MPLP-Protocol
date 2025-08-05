/**
 * Role模块生命周期协调功能测试
 * @description 验证Role模块的生命周期管理功能实现
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 22:19
 */

import { v4 as uuidv4 } from 'uuid';
import { RoleModuleAdapter } from '../../src/modules/role/infrastructure/adapters/role-module.adapter';
import { RoleManagementService } from '../../src/modules/role/application/services/role-management.service';
import { RoleRepository } from '../../src/modules/role/infrastructure/repositories/role.repository';
import { LifecycleCoordinationRequest, LifecycleResult } from '../../src/public/modules/core/types/core.types';

describe('Role模块生命周期协调功能测试', () => {
  let roleAdapter: RoleModuleAdapter;
  let roleManagementService: RoleManagementService;

  beforeEach(async () => {
    // 创建Role服务
    const roleRepository = new RoleRepository();
    roleManagementService = new RoleManagementService(roleRepository);

    // 创建Role适配器
    roleAdapter = new RoleModuleAdapter(roleManagementService);
    await roleAdapter.initialize();
  });

  afterEach(async () => {
    await roleAdapter.cleanup();
  });

  describe('模块初始化和状态管理', () => {
    test('应该成功初始化Role模块适配器', async () => {
      const status = roleAdapter.getStatus();
      expect(status.module_name).toBe('role');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    test('应该正确处理模块状态变化', async () => {
      const initialStatus = roleAdapter.getStatus();
      expect(initialStatus.status).toBe('initialized');

      // 执行一个生命周期协调请求
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      await roleAdapter.execute(request);

      const finalStatus = roleAdapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });
  });

  describe('静态角色创建', () => {
    test('应该成功创建静态角色', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(result.role_data.name).toContain('static_role_');
      expect(result.role_data.role_type).toBe('functional');
      expect(result.capabilities).toContain('basic_operations');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('动态角色创建', () => {
    test('应该成功创建动态角色', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'dynamic',
        parameters: {
          creation_rules: ['admin_access', 'user_management']
        }
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(result.role_data.name).toContain('dynamic_role_');
      expect(result.role_data.role_type).toBe('project');
      expect(result.role_data.description).toContain('admin_access');
      expect(result.capabilities).toContain('basic_operations');
    });

    test('应该根据规则生成相应权限', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'dynamic',
        parameters: {
          creation_rules: ['admin_access']
        }
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.role_data.permissions).toBeDefined();
      expect(result.role_data.permissions.length).toBeGreaterThan(2); // 默认权限 + admin权限
      
      const adminPermission = result.role_data.permissions.find(
        (p: any) => p.resource_type === 'system' && p.actions.includes('admin')
      );
      expect(adminPermission).toBeDefined();
    });
  });

  describe('基于模板的角色创建', () => {
    test('应该成功创建基于模板的角色', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'template_based',
        parameters: {
          template_source: 'admin_template'
        }
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(result.role_data.name).toContain('template_role_');
      expect(result.role_data.role_type).toBe('organizational');
      expect(result.role_data.description).toContain('admin_template');
    });

    test('应该验证模板源参数', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'template_based',
        parameters: {} // 缺少template_source
      };

      await expect(roleAdapter.execute(request)).rejects.toThrow(
        'Template source is required for template_based strategy'
      );
    });
  });

  describe('AI生成角色创建', () => {
    test('应该成功创建AI生成的角色', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'ai_generated',
        parameters: {
          generation_criteria: {
            access_level: 'high',
            domain: 'data_analysis'
          }
        }
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.role_id).toBeDefined();
      expect(result.role_data).toBeDefined();
      expect(result.role_data.name).toContain('ai_role_');
      expect(result.role_data.role_type).toBe('temporary');
      expect(result.role_data.description).toContain('data_analysis');
    });

    test('应该验证AI生成条件', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'ai_generated',
        parameters: {} // 缺少generation_criteria
      };

      await expect(roleAdapter.execute(request)).rejects.toThrow(
        'Generation criteria is required for ai_generated strategy'
      );
    });
  });

  describe('能力管理', () => {
    test('应该正确处理能力管理配置', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {},
        capability_management: {
          skills: ['data_analysis', 'machine_learning'],
          expertise_level: 8,
          learning_enabled: true
        }
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.capabilities).toContain('data_analysis');
      expect(result.capabilities).toContain('machine_learning');
      expect(result.capabilities).toContain('advanced_operations'); // 专业水平 >= 7
      expect(result.capabilities).toContain('adaptive_learning'); // 学习启用
    });

    test('应该根据专业水平添加相应能力', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {},
        capability_management: {
          skills: ['basic_skill'],
          expertise_level: 9,
          learning_enabled: false
        }
      };

      const result: LifecycleResult = await roleAdapter.execute(request);

      expect(result.capabilities).toContain('basic_skill');
      expect(result.capabilities).toContain('advanced_operations');
      expect(result.capabilities).toContain('expert_operations'); // 专业水平 >= 9
      expect(result.capabilities).not.toContain('adaptive_learning'); // 学习未启用
    });

    test('应该验证能力管理参数', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {},
        capability_management: {
          skills: [], // 空技能列表
          expertise_level: 5,
          learning_enabled: true
        }
      };

      await expect(roleAdapter.execute(request)).rejects.toThrow(
        'At least one skill is required for capability management'
      );
    });

    test('应该验证专业水平范围', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {},
        capability_management: {
          skills: ['test_skill'],
          expertise_level: 15, // 超出范围
          learning_enabled: true
        }
      };

      await expect(roleAdapter.execute(request)).rejects.toThrow(
        'Expertise level must be between 1 and 10'
      );
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的创建策略', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'invalid_strategy' as any,
        parameters: {}
      };

      await expect(roleAdapter.execute(request)).rejects.toThrow(
        'Unsupported creation strategy: invalid_strategy'
      );
    });

    test('应该处理缺少contextId的情况', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: '' as any,
        creation_strategy: 'static',
        parameters: {}
      };

      await expect(roleAdapter.execute(request)).rejects.toThrow(
        'Context ID is required'
      );
    });
  });

  describe('性能和并发', () => {
    test('应该在合理时间内完成生命周期管理', async () => {
      const request: LifecycleCoordinationRequest = {
        contextId: uuidv4(),
        creation_strategy: 'static',
        parameters: {}
      };

      const startTime = Date.now();
      const result = await roleAdapter.execute(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    test('应该支持并发生命周期管理', async () => {
      const requests = Array.from({ length: 3 }, () => ({
        contextId: uuidv4(),
        creation_strategy: 'static' as const,
        parameters: {}
      }));

      const results = await Promise.all(
        requests.map(request => roleAdapter.execute(request))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.role_id).toBeDefined();
        expect(result.role_data).toBeDefined();
      });

      // 确保每个角色都有唯一的ID
      const roleIds = results.map(r => r.role_id);
      const uniqueIds = new Set(roleIds);
      expect(uniqueIds.size).toBe(3);
    });
  });
});

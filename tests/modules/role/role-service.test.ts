/**
 * MPLP Role服务单元测试
 * 
 * @version v1.0.0
 * @created 2025-07-13T02:30:00+08:00
 * @compliance role-protocol.json Schema v1.0.1 - 100%合规
 * @description 测试角色服务的基本功能，包括角色创建、查询、更新和删除
 */

import { v4 as uuidv4 } from 'uuid';
import { RoleService, InMemoryRoleRepository } from '../../../src/modules/role';
import { 
  CreateRoleRequest, 
  RoleProtocol,
  UpdateRoleRequest,
  RoleErrorCode,
  UserRoleAssignment
} from '../../../src/modules/role/types';

describe('RoleService', () => {
  // 测试实例
  let roleService: RoleService;
  let roleRepository: InMemoryRoleRepository;

  // 测试数据
  let testContext = {
    context_id: uuidv4(),
    name: 'Test Context'
  };

  // 测试角色请求
  const createRoleRequest: CreateRoleRequest = {
    context_id: testContext.context_id,
    name: 'test-role',
    display_name: 'Test Role',
    description: 'A test role',
    role_type: 'project',
    scope: {
      level: 'project',
      context_ids: [testContext.context_id]
    },
    permissions: [
      {
        permission_id: uuidv4(),
        resource_type: 'context',
        resource_id: testContext.context_id,
        actions: ['read', 'update'],
        grant_type: 'direct'
      }
    ]
  };

  // 在每个测试前初始化
  beforeEach(() => {
    roleRepository = new InMemoryRoleRepository();
    roleService = new RoleService(roleRepository);
    testContext = {
      context_id: uuidv4(),
      name: 'Test Context'
    };
  });

  describe('createRole', () => {
    it('应该成功创建角色', async () => {
      // 1. 创建角色
      const result = await roleService.createRole({
        ...createRoleRequest,
        context_id: testContext.context_id
      });

      // 2. 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const role = result.data!;
      expect(role.role_id).toBeDefined();
      expect(role.name).toBe(createRoleRequest.name);
      expect(role.status).toBe('active');
      expect(role.context_id).toBe(testContext.context_id);
      expect(role.protocol_version).toBe('1.0.1');
      
      // 3. 验证角色已保存
      const savedRole = await roleRepository.findById(role.role_id);
      expect(savedRole).not.toBeNull();
      expect(savedRole!.role_id).toBe(role.role_id);
    });

    it('应该拒绝创建名称重复的角色', async () => {
      // 1. 创建第一个角色
      const result1 = await roleService.createRole(createRoleRequest);
      expect(result1.success).toBe(true);
      
      // 2. 尝试创建同名角色
      const result2 = await roleService.createRole(createRoleRequest);
      
      // 3. 验证拒绝创建
      expect(result2.success).toBe(false);
      expect(result2.error?.code).toBe(RoleErrorCode.ROLE_ALREADY_EXISTS);
    });
  });

  describe('getRole', () => {
    it('应该获取现有角色', async () => {
      // 1. 创建角色
      const createResult = await roleService.createRole(createRoleRequest);
      expect(createResult.success).toBe(true);
      const roleId = createResult.data!.role_id;
      
      // 2. 获取角色
      const result = await roleService.getRole(roleId);
      
      // 3. 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.role_id).toBe(roleId);
      expect(result.data!.name).toBe(createRoleRequest.name);
    });

    it('应该返回错误当角色不存在', async () => {
      // 1. 尝试获取不存在的角色
      const result = await roleService.getRole('non-existent-role-id');
      
      // 2. 验证错误
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(RoleErrorCode.ROLE_NOT_FOUND);
    });
  });

  describe('updateRole', () => {
    it('应该成功更新角色', async () => {
      // 1. 创建角色
      const createResult = await roleService.createRole(createRoleRequest);
      expect(createResult.success).toBe(true);
      const roleId = createResult.data!.role_id;
      
      // 2. 更新角色
      const updateRequest: UpdateRoleRequest = {
        role_id: roleId,
        display_name: 'Updated Test Role',
        description: 'Updated description'
      };
      
      const result = await roleService.updateRole(roleId, updateRequest);
      
      // 3. 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.display_name).toBe(updateRequest.display_name);
      expect(result.data!.description).toBe(updateRequest.description);
      
      // 验证原始字段未改变
      expect(result.data!.role_id).toBe(roleId);
      expect(result.data!.name).toBe(createRoleRequest.name);
    });

    it('应该返回错误当更新不存在的角色', async () => {
      // 1. 尝试更新不存在的角色
      const updateRequest: UpdateRoleRequest = {
        role_id: 'non-existent-role-id',
        display_name: 'Updated Role'
      };
      
      const result = await roleService.updateRole('non-existent-role-id', updateRequest);
      
      // 2. 验证错误
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(RoleErrorCode.ROLE_NOT_FOUND);
    });
  });

  describe('deleteRole', () => {
    it('应该成功删除角色', async () => {
      // 1. 创建角色
      const createResult = await roleService.createRole(createRoleRequest);
      expect(createResult.success).toBe(true);
      const roleId = createResult.data!.role_id;
      
      // 2. 删除角色
      const result = await roleService.deleteRole(roleId);
      
      // 3. 验证结果
      expect(result.success).toBe(true);
      
      // 4. 验证角色已删除
      const deleted = await roleRepository.findById(roleId);
      expect(deleted).toBeNull();
    });

    it('应该返回错误当删除不存在的角色', async () => {
      // 1. 尝试删除不存在的角色
      const result = await roleService.deleteRole('non-existent-role-id');
      
      // 2. 验证错误
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(RoleErrorCode.ROLE_NOT_FOUND);
    });
  });

  describe('findRoles', () => {
    it('应该按过滤条件查找角色', async () => {
      // 1. 创建多个角色
      const role1 = await roleService.createRole({
        ...createRoleRequest,
        name: 'role-1',
        display_name: 'Role 1',
        role_type: 'project'
      });
      
      const role2 = await roleService.createRole({
        ...createRoleRequest,
        name: 'role-2',
        display_name: 'Role 2',
        role_type: 'system'
      });
      
      // 2. 按类型过滤查询
      const result = await roleService.findRoles({
        role_types: ['project']
      });
      
      // 3. 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe('role-1');
    });
  });

  describe('assignRoleToUser', () => {
    it('应该成功将角色分配给用户', async () => {
      // 1. 创建角色
      const createResult = await roleService.createRole(createRoleRequest);
      expect(createResult.success).toBe(true);
      const roleId = createResult.data!.role_id;
      
      // 2. 分配角色给用户
      const userId = uuidv4();
      const assignment: UserRoleAssignment = {
        assignment_id: uuidv4(),
        user_id: userId,
        role_id: roleId,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      };
      
      const result = await roleService.assignRoleToUser(assignment);
      
      // 3. 验证结果
      expect(result.success).toBe(true);
      
      // 4. 验证用户已获得角色
      const userRoles = await roleRepository.findRolesByUserId(userId);
      expect(userRoles).toHaveLength(1);
      expect(userRoles[0].role_id).toBe(roleId);
      
      // 5. 验证角色用户列表
      const roleUsers = await roleRepository.findUsersByRoleId(roleId);
      expect(roleUsers).toContain(userId);
    });

    it('应该返回错误当角色不存在', async () => {
      // 1. 尝试分配不存在的角色
      const assignment: UserRoleAssignment = {
        assignment_id: uuidv4(),
        user_id: uuidv4(),
        role_id: 'non-existent-role-id',
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      };
      
      const result = await roleService.assignRoleToUser(assignment);
      
      // 2. 验证错误
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(RoleErrorCode.ROLE_NOT_FOUND);
    });
  });

  describe('getHealthStatus', () => {
    it('应该返回健康状态', async () => {
      // 1. 获取健康状态
      const status = await roleService.getHealthStatus();
      
      // 2. 验证结果
      expect(status).toBeDefined();
      expect(status.status).toBe('healthy');
      expect(status.version).toBe('1.0.1');
      expect(typeof status.uptime_ms).toBe('number');
      expect(typeof status.timestamp).toBe('string');
    });
  });
}); 
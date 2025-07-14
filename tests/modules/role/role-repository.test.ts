/**
 * MPLP Role仓库单元测试
 * 
 * @version v1.0.0
 * @created 2025-07-13T03:00:00+08:00
 * @compliance role-protocol.json Schema v1.0.1 - 100%合规
 * @description 测试内存型角色仓库的基本功能，包括CRUD操作和角色分配
 */

import { v4 as uuidv4 } from 'uuid';
import { InMemoryRoleRepository } from '../../../src/modules/role';
import { 
  RoleProtocol,
  RoleType,
  RoleStatus,
  ScopeLevel,
  Permission,
  UserRoleAssignment
} from '../../../src/modules/role/types';

describe('InMemoryRoleRepository', () => {
  // 测试实例
  let repository: InMemoryRoleRepository;
  
  // 测试数据
  const contextId = uuidv4();
  let testRole: RoleProtocol;
  
  // 事件监听器模拟函数
  const mockListener = jest.fn();
  
  // 在每个测试前初始化
  beforeEach(() => {
    repository = new InMemoryRoleRepository();
    repository.on('role_saved', mockListener);
    repository.on('role_updated', mockListener);
    repository.on('role_deleted', mockListener);
    
    // 创建测试角色
    testRole = createTestRole();
    
    // 重置模拟函数
    mockListener.mockReset();
  });
  
  /**
   * 创建测试角色
   */
  function createTestRole(override: Partial<RoleProtocol> = {}): RoleProtocol {
    return {
      role_id: uuidv4(),
      protocol_version: '1.0.1',
      timestamp: new Date().toISOString(),
      context_id: contextId,
      name: `test-role-${Math.random().toString(36).substring(7)}`,
      role_type: 'project' as RoleType,
      status: 'active' as RoleStatus,
      permissions: [
        {
          permission_id: uuidv4(),
          resource_type: 'context',
          resource_id: contextId,
          actions: ['read', 'update'],
          grant_type: 'direct'
        }
      ],
      scope: {
        level: 'project' as ScopeLevel,
        context_ids: [contextId]
      },
      ...override
    };
  }
  
  describe('save', () => {
    it('应该保存角色并生成事件', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 验证角色已保存
      const savedRole = await repository.findById(testRole.role_id);
      expect(savedRole).toBeDefined();
      expect(savedRole!.role_id).toBe(testRole.role_id);
      
      // 3. 验证事件已触发
      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        role_id: testRole.role_id
      }));
    });
    
    it('应该在缺少ID时自动生成ID', async () => {
      // 1. 创建没有ID的角色
      const roleWithoutId = { ...testRole, role_id: undefined } as any;
      
      // 2. 保存角色
      await repository.save(roleWithoutId);
      
      // 3. 验证角色被保存并生成了ID
      expect(mockListener).toHaveBeenCalledTimes(1);
      const savedRole = mockListener.mock.calls[0][0];
      expect(savedRole.role_id).toBeDefined();
      expect(typeof savedRole.role_id).toBe('string');
    });
  });
  
  describe('findById', () => {
    it('应该找到已保存的角色', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 通过ID查找
      const role = await repository.findById(testRole.role_id);
      
      // 3. 验证结果
      expect(role).toBeDefined();
      expect(role!.role_id).toBe(testRole.role_id);
      expect(role!.name).toBe(testRole.name);
    });
    
    it('应该返回null当角色不存在', async () => {
      // 1. 查找不存在的角色
      const role = await repository.findById('non-existent-id');
      
      // 2. 验证结果
      expect(role).toBeNull();
    });
    
    it('应该返回深拷贝以防止外部修改', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 查找角色
      const role = await repository.findById(testRole.role_id);
      
      // 3. 修改返回的角色
      role!.name = 'modified-name';
      
      // 4. 再次查找角色，验证原始数据未修改
      const roleAgain = await repository.findById(testRole.role_id);
      expect(roleAgain!.name).toBe(testRole.name);
      expect(roleAgain!.name).not.toBe('modified-name');
    });
  });
  
  describe('findByFilter', () => {
    it('应该按角色ID过滤', async () => {
      // 1. 保存多个角色
      const role1 = createTestRole();
      const role2 = createTestRole();
      await repository.save(role1);
      await repository.save(role2);
      
      // 2. 按ID过滤查询
      const results = await repository.findByFilter({
        role_ids: [role1.role_id]
      });
      
      // 3. 验证结果
      expect(results).toHaveLength(1);
      expect(results[0].role_id).toBe(role1.role_id);
    });
    
    it('应该按上下文ID过滤', async () => {
      // 1. 保存不同上下文的角色
      const role1 = createTestRole({ context_id: 'context-1' });
      const role2 = createTestRole({ context_id: 'context-2' });
      await repository.save(role1);
      await repository.save(role2);
      
      // 2. 按上下文ID过滤查询
      const results = await repository.findByFilter({
        context_ids: ['context-1']
      });
      
      // 3. 验证结果
      expect(results).toHaveLength(1);
      expect(results[0].context_id).toBe('context-1');
    });
    
    it('应该按角色类型过滤', async () => {
      // 1. 保存不同类型的角色
      const role1 = createTestRole({ role_type: 'system' });
      const role2 = createTestRole({ role_type: 'project' });
      await repository.save(role1);
      await repository.save(role2);
      
      // 2. 按类型过滤查询
      const results = await repository.findByFilter({
        role_types: ['system']
      });
      
      // 3. 验证结果
      expect(results).toHaveLength(1);
      expect(results[0].role_type).toBe('system');
    });
    
    it('应该按状态过滤', async () => {
      // 1. 保存不同状态的角色
      const role1 = createTestRole({ status: 'active' });
      const role2 = createTestRole({ status: 'inactive' });
      await repository.save(role1);
      await repository.save(role2);
      
      // 2. 按状态过滤查询
      const results = await repository.findByFilter({
        statuses: ['inactive']
      });
      
      // 3. 验证结果
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('inactive');
    });
    
    it('应该组合多个过滤条件', async () => {
      // 1. 保存多个角色
      const role1 = createTestRole({
        role_type: 'project',
        status: 'active',
        context_id: 'context-1'
      });
      const role2 = createTestRole({
        role_type: 'system',
        status: 'active',
        context_id: 'context-1'
      });
      const role3 = createTestRole({
        role_type: 'project',
        status: 'inactive',
        context_id: 'context-2'
      });
      await repository.save(role1);
      await repository.save(role2);
      await repository.save(role3);
      
      // 2. 组合过滤条件
      const results = await repository.findByFilter({
        role_types: ['project'],
        statuses: ['active'],
        context_ids: ['context-1']
      });
      
      // 3. 验证结果
      expect(results).toHaveLength(1);
      expect(results[0].role_id).toBe(role1.role_id);
    });
    
    it('应该返回空数组当没有匹配的角色', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 查询不匹配的条件
      const results = await repository.findByFilter({
        role_types: ['temporary']
      });
      
      // 3. 验证结果
      expect(results).toHaveLength(0);
    });
  });
  
  describe('update', () => {
    it('应该更新现有角色并生成事件', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 更新角色
      const updates = {
        display_name: 'Updated Display Name',
        description: 'Updated description'
      };
      await repository.update(testRole.role_id, updates);
      
      // 3. 验证角色已更新
      const updatedRole = await repository.findById(testRole.role_id);
      expect(updatedRole!.display_name).toBe(updates.display_name);
      expect(updatedRole!.description).toBe(updates.description);
      
      // 4. 验证事件已触发
      expect(mockListener).toHaveBeenCalledTimes(2); // save + update
      expect(mockListener.mock.calls[1][0]).toMatchObject(updates);
    });
    
    it('应该在更新时保持角色ID不变', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 尝试更新角色ID
      await repository.update(testRole.role_id, {
        role_id: 'new-id'
      });
      
      // 3. 验证ID保持不变
      const updatedRole = await repository.findById(testRole.role_id);
      expect(updatedRole).toBeDefined();
      expect(updatedRole!.role_id).toBe(testRole.role_id);
      expect(updatedRole!.role_id).not.toBe('new-id');
    });
    
    it('应该在角色不存在时抛出错误', async () => {
      // 1. 尝试更新不存在的角色
      await expect(repository.update('non-existent-id', {
        display_name: 'New Display Name'
      })).rejects.toThrow();
    });
  });
  
  describe('delete', () => {
    it('应该删除现有角色并生成事件', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 删除角色
      await repository.delete(testRole.role_id);
      
      // 3. 验证角色已删除
      const deletedRole = await repository.findById(testRole.role_id);
      expect(deletedRole).toBeNull();
      
      // 4. 验证事件已触发
      expect(mockListener).toHaveBeenCalledTimes(2); // save + delete
      expect(mockListener.mock.calls[1][0]).toBe(testRole.role_id);
    });
    
    it('应该在删除时清理用户-角色关联', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 分配角色给用户
      const userId = 'test-user';
      await repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: userId,
        role_id: testRole.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      });
      
      // 3. 删除角色
      await repository.delete(testRole.role_id);
      
      // 4. 验证用户角色已清理
      const userRoles = await repository.findRolesByUserId(userId);
      expect(userRoles).toHaveLength(0);
    });
    
    it('应该在角色不存在时抛出错误', async () => {
      // 1. 尝试删除不存在的角色
      await expect(repository.delete('non-existent-id')).rejects.toThrow();
    });
  });
  
  describe('count', () => {
    it('应该返回角色总数', async () => {
      // 1. 保存多个角色
      await repository.save(createTestRole());
      await repository.save(createTestRole());
      await repository.save(createTestRole());
      
      // 2. 获取角色总数
      const count = await repository.count();
      
      // 3. 验证结果
      expect(count).toBe(3);
    });
    
    it('应该返回过滤后的角色数量', async () => {
      // 1. 保存不同类型的角色
      await repository.save(createTestRole({ role_type: 'project' }));
      await repository.save(createTestRole({ role_type: 'system' }));
      await repository.save(createTestRole({ role_type: 'project' }));
      
      // 2. 获取过滤后的角色数量
      const count = await repository.count({
        role_types: ['project']
      });
      
      // 3. 验证结果
      expect(count).toBe(2);
    });
  });
  
  describe('exists', () => {
    it('应该返回true当角色存在', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 检查角色是否存在
      const exists = await repository.exists(testRole.role_id);
      
      // 3. 验证结果
      expect(exists).toBe(true);
    });
    
    it('应该返回false当角色不存在', async () => {
      // 1. 检查不存在的角色
      const exists = await repository.exists('non-existent-id');
      
      // 2. 验证结果
      expect(exists).toBe(false);
    });
  });
  
  describe('isNameUnique', () => {
    it('应该返回true当名称唯一', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 检查不同的名称
      const isUnique = await repository.isNameUnique('unique-name');
      
      // 3. 验证结果
      expect(isUnique).toBe(true);
    });
    
    it('应该返回false当名称已存在', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 检查相同的名称
      const isUnique = await repository.isNameUnique(testRole.name);
      
      // 3. 验证结果
      expect(isUnique).toBe(false);
    });
    
    it('应该在排除当前角色时返回true', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 检查相同的名称但排除当前角色
      const isUnique = await repository.isNameUnique(testRole.name, testRole.role_id);
      
      // 3. 验证结果
      expect(isUnique).toBe(true);
    });
  });
  
  describe('assignRoleToUser & revokeRoleFromUser', () => {
    it('应该分配角色给用户并生成事件', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 分配角色给用户
      const userId = 'test-user';
      const assignment: UserRoleAssignment = {
        assignment_id: uuidv4(),
        user_id: userId,
        role_id: testRole.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      };
      
      repository.on('role_assigned', mockListener);
      await repository.assignRoleToUser(assignment);
      
      // 3. 验证用户-角色关联
      const userRoles = await repository.findRolesByUserId(userId);
      expect(userRoles).toHaveLength(1);
      expect(userRoles[0].role_id).toBe(testRole.role_id);
      
      // 4. 验证角色-用户关联
      const roleUsers = await repository.findUsersByRoleId(testRole.role_id);
      expect(roleUsers).toContain(userId);
      
      // 5. 验证事件已触发
      expect(mockListener).toHaveBeenCalledWith(assignment);
    });
    
    it('应该撤销角色并生成事件', async () => {
      // 1. 保存角色并分配给用户
      await repository.save(testRole);
      const userId = 'test-user';
      await repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: userId,
        role_id: testRole.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      });
      
      // 2. 撤销角色
      repository.on('role_revoked', mockListener);
      await repository.revokeRoleFromUser(userId, testRole.role_id);
      
      // 3. 验证用户-角色关联已删除
      const userRoles = await repository.findRolesByUserId(userId);
      expect(userRoles).toHaveLength(0);
      
      // 4. 验证角色-用户关联已删除
      const roleUsers = await repository.findUsersByRoleId(testRole.role_id);
      expect(roleUsers).not.toContain(userId);
      
      // 5. 验证事件已触发
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
        user_id: userId,
        role_id: testRole.role_id
      }));
    });
    
    it('应该在角色不存在时抛出错误', async () => {
      // 1. 尝试分配不存在的角色
      await expect(repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: 'test-user',
        role_id: 'non-existent-id',
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      })).rejects.toThrow();
    });
  });
  
  describe('findRolesByUserId & findUsersByRoleId', () => {
    it('应该找到用户的所有角色', async () => {
      // 1. 创建多个角色
      const role1 = createTestRole();
      const role2 = createTestRole();
      await repository.save(role1);
      await repository.save(role2);
      
      // 2. 分配角色给用户
      const userId = 'test-user';
      await repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: userId,
        role_id: role1.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      });
      await repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: userId,
        role_id: role2.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      });
      
      // 3. 查找用户的角色
      const userRoles = await repository.findRolesByUserId(userId);
      
      // 4. 验证结果
      expect(userRoles).toHaveLength(2);
      expect(userRoles.map(r => r.role_id)).toContain(role1.role_id);
      expect(userRoles.map(r => r.role_id)).toContain(role2.role_id);
    });
    
    it('应该找到角色的所有用户', async () => {
      // 1. 创建角色
      await repository.save(testRole);
      
      // 2. 分配角色给多个用户
      const user1 = 'user-1';
      const user2 = 'user-2';
      await repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: user1,
        role_id: testRole.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      });
      await repository.assignRoleToUser({
        assignment_id: uuidv4(),
        user_id: user2,
        role_id: testRole.role_id,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        status: 'active'
      });
      
      // 3. 查找角色的用户
      const roleUsers = await repository.findUsersByRoleId(testRole.role_id);
      
      // 4. 验证结果
      expect(roleUsers).toHaveLength(2);
      expect(roleUsers).toContain(user1);
      expect(roleUsers).toContain(user2);
    });
    
    it('应该返回空数组当用户没有角色', async () => {
      // 1. 查找不存在用户的角色
      const userRoles = await repository.findRolesByUserId('non-existent-user');
      
      // 2. 验证结果
      expect(userRoles).toHaveLength(0);
    });
    
    it('应该返回空数组当角色没有用户', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 查找角色的用户（没有分配）
      const roleUsers = await repository.findUsersByRoleId(testRole.role_id);
      
      // 3. 验证结果
      expect(roleUsers).toHaveLength(0);
    });
  });
  
  describe('reset', () => {
    it('应该重置仓库状态', async () => {
      // 1. 保存角色
      await repository.save(testRole);
      
      // 2. 重置仓库
      repository.reset();
      
      // 3. 验证仓库已重置
      const count = await repository.count();
      expect(count).toBe(0);
      
      const role = await repository.findById(testRole.role_id);
      expect(role).toBeNull();
    });
  });
}); 
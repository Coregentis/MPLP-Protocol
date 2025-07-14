/**
 * MPLP 集成测试 - Role和Context模块集成
 * 
 * @version v1.0.0
 * @created 2025-07-14T10:00:00+08:00
 * @compliance 100% Schema合规性 - 基于role-protocol.json和context-protocol.json
 * @description 测试Role模块与Context模块的集成，验证角色权限控制和上下文访问
 */

import { expect } from '@jest/globals';
import { RoleManager } from '../../../src/modules/role/role-manager';
import { ContextManager } from '../../../src/modules/context/context-manager';
import { CreateContextRequest } from '../../../src/modules/context/types';
import { Permission } from '../../../src/modules/role/types';
import { v4 as uuidv4 } from 'uuid';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Role-Context Integration', () => {
  let roleManager: RoleManager;
  let contextManager: ContextManager;
  let testContextId: string;
  let testUserId: string;
  
  beforeAll(async () => {
    // 初始化管理器
    roleManager = new RoleManager();
    contextManager = new ContextManager();
    
    // 测试用户ID
    testUserId = `test-user-${uuidv4()}`;
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  beforeEach(async () => {
    // 创建测试上下文
    const contextRequest: CreateContextRequest = {
      name: 'Role Integration Test Context',
      description: 'Context for role integration testing',
      initialState: {
        environment: 'test',
        integration_test: true
      }
    };
    
    const contextResult = await contextManager.createContext(contextRequest);
    expect(contextResult.success).toBe(true);
    expect(contextResult.data).toBeDefined();
    
    testContextId = contextResult.data!.context_id;
  });
  
  afterAll(async () => {
    // 清理资源
    await roleManager.cleanupExpired();
  });
  
  test('应该能够创建角色并分配给上下文', async () => {
    // 创建角色
    const contextReaderRole = await roleManager.createRole({
      name: 'Context Reader',
      description: 'Can read context data',
      permissions: [
        {
          resource: 'context',
          action: 'read'
        }
      ]
    });
    
    expect(contextReaderRole).toBeDefined();
    expect(contextReaderRole.role_id).toBeDefined();
    expect(contextReaderRole.name).toBe('Context Reader');
    
    // 分配角色给用户
    const assignment = await roleManager.assignRole(testUserId, contextReaderRole.role_id, testContextId);
    
    expect(assignment).toBeDefined();
    expect(assignment.user_id).toBe(testUserId);
    expect(assignment.role_id).toBe(contextReaderRole.role_id);
    expect(assignment.context_id).toBe(testContextId);
    
    // 验证用户角色分配
    const userRoles = await roleManager.getUserRoles(testUserId);
    expect(userRoles).toHaveLength(1);
    expect(userRoles[0].role_id).toBe(contextReaderRole.role_id);
  });
  
  test('应该能够检查用户对上下文的权限', async () => {
    // 创建角色
    const contextEditorRole = await roleManager.createRole({
      name: 'Context Editor',
      description: 'Can edit context data',
      permissions: [
        {
          resource: 'context',
          action: 'read'
        },
        {
          resource: 'context',
          action: 'write'
        }
      ]
    });
    
    // 分配角色给用户
    await roleManager.assignRole(testUserId, contextEditorRole.role_id, testContextId);
    
    // 检查读权限
    const readCheckResult = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'context',
      action: 'read',
      context_id: testContextId
    });
    
    expect(readCheckResult.granted).toBe(true);
    
    // 检查写权限
    const writeCheckResult = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'context',
      action: 'write',
      context_id: testContextId
    });
    
    expect(writeCheckResult.granted).toBe(true);
    
    // 检查删除权限（应该没有）
    const deleteCheckResult = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'context',
      action: 'delete',
      context_id: testContextId
    });
    
    expect(deleteCheckResult.granted).toBe(false);
  });
  
  test('应该在上下文被删除时撤销相关角色分配', async () => {
    // 创建角色
    const role = await roleManager.createRole({
      name: 'Temporary Role',
      description: 'Temporary role for testing',
      permissions: [
        {
          resource: 'context',
          action: 'read'
        }
      ]
    });
    
    // 分配角色给用户
    await roleManager.assignRole(testUserId, role.role_id, testContextId);
    
    // 验证角色分配成功
    const beforeDelete = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'context',
      action: 'read',
      context_id: testContextId
    });
    
    expect(beforeDelete.granted).toBe(true);
    
    // 删除上下文
    await contextManager.deleteContext(testContextId);
    
    // 验证角色分配被撤销
    const afterDelete = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'context',
      action: 'read',
      context_id: testContextId
    });
    
    expect(afterDelete.granted).toBe(false);
  });
  
  test('应该能够通过角色控制上下文的访问', async () => {
    // 创建一个新的上下文
    const restrictedContextResult = await contextManager.createContext({
      name: 'Restricted Context',
      description: 'Context with restricted access',
      initialState: {
        restricted: true
      }
    });
    
    const restrictedContextId = restrictedContextResult.data!.context_id;
    
    // 创建管理员角色
    const adminRole = await roleManager.createRole({
      name: 'Context Admin',
      description: 'Full access to contexts',
      permissions: [
        {
          resource: 'context',
          action: 'read'
        },
        {
          resource: 'context',
          action: 'write'
        },
        {
          resource: 'context',
          action: 'delete'
        }
      ]
    });
    
    // 创建一个新的测试用户
    const adminUserId = `admin-user-${uuidv4()}`;
    
    // 分配管理员角色给新用户
    await roleManager.assignRole(adminUserId, adminRole.role_id, restrictedContextId);
    
    // 验证普通用户无法访问受限上下文
    const normalUserAccess = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'context',
      action: 'read',
      context_id: restrictedContextId
    });
    
    expect(normalUserAccess.granted).toBe(false);
    
    // 验证管理员可以访问受限上下文
    const adminUserAccess = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'context',
      action: 'read',
      context_id: restrictedContextId
    });
    
    expect(adminUserAccess.granted).toBe(true);
    
    // 验证管理员可以删除受限上下文
    const adminDeleteAccess = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'context',
      action: 'delete',
      context_id: restrictedContextId
    });
    
    expect(adminDeleteAccess.granted).toBe(true);
  });
}); 
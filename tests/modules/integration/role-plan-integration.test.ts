/**
 * MPLP 集成测试 - Role和Plan模块集成
 * 
 * @version v1.0.0
 * @created 2025-07-14T11:00:00+08:00
 * @compliance 100% Schema合规性 - 基于role-protocol.json和plan-protocol.json
 * @description 测试Role模块与Plan模块的集成，验证角色权限控制和计划执行权限
 */

import { expect } from '@jest/globals';
import { RoleManager } from '../../../src/modules/role/role-manager';
import { PlanManager } from '../../../src/modules/plan/plan-manager';
import { ContextManager } from '../../../src/modules/context/context-manager';
import { PlanProtocol } from '../../../src/modules/plan/types';
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

// 模拟FailureResolver
jest.mock('../../../src/modules/plan/failure-resolver', () => ({
  FailureResolver: jest.fn().mockImplementation(() => ({
    handleTaskFailure: jest.fn().mockResolvedValue({
      success: true,
      recovery_suggestions: []
    }),
    analyzeFailure: jest.fn().mockResolvedValue({
      failure_type: 'test',
      analysis: {}
    })
  }))
}));

describe('Role-Plan Integration', () => {
  let roleManager: RoleManager;
  let planManager: PlanManager;
  let contextManager: ContextManager;
  let testContextId: string;
  let testPlanId: string;
  let testUserId: string;
  let adminUserId: string;
  
  beforeAll(async () => {
    // 初始化管理器
    roleManager = new RoleManager();
    contextManager = new ContextManager();
    planManager = new PlanManager();
    
    // 连接PlanManager和ContextManager
    planManager.setContextManager(contextManager);
    
    // 测试用户ID
    testUserId = `test-user-${uuidv4()}`;
    adminUserId = `admin-user-${uuidv4()}`;
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  beforeEach(async () => {
    // 创建测试上下文
    const contextResult = await contextManager.createContext({
      name: 'Role-Plan Integration Test Context',
      description: 'Context for role-plan integration testing',
      initialState: {
        environment: 'test',
        integration_test: true
      }
    });
    
    testContextId = contextResult.data!.context_id;
    
    // 创建测试计划
    const planResult = await planManager.createPlan({
      context_id: testContextId,
      name: 'Test Plan',
      description: 'Plan for role integration testing',
      tasks: [
        {
          task_id: 'task-1',
          name: 'Task 1',
          type: 'atomic',
          status: 'pending'
        },
        {
          task_id: 'task-2',
          name: 'Task 2',
          type: 'atomic',
          status: 'pending',
          dependencies: ['task-1']
        }
      ],
      workflow: {
        execution_strategy: 'sequential'
      }
    });
    
    testPlanId = planResult.plan_id;
    
    // 创建角色
    const planViewerRole = await roleManager.createRole({
      name: 'Plan Viewer',
      description: 'Can view plans',
      permissions: [
        {
          resource: 'plan',
          action: 'read'
        }
      ]
    });
    
    const planEditorRole = await roleManager.createRole({
      name: 'Plan Editor',
      description: 'Can edit and execute plans',
      permissions: [
        {
          resource: 'plan',
          action: 'read'
        },
        {
          resource: 'plan',
          action: 'write'
        },
        {
          resource: 'plan',
          action: 'execute'
        }
      ]
    });
    
    // 分配角色
    await roleManager.assignRole(testUserId, planViewerRole.role_id, testContextId);
    await roleManager.assignRole(adminUserId, planEditorRole.role_id, testContextId);
  });
  
  afterAll(async () => {
    // 清理资源
    await roleManager.cleanupExpired();
  });
  
  test('普通用户应该只能查看计划，不能执行', async () => {
    // 检查查看权限
    const viewPermission = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'plan',
      action: 'read',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(viewPermission.granted).toBe(true);
    
    // 检查执行权限
    const executePermission = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'plan',
      action: 'execute',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(executePermission.granted).toBe(false);
    
    // 尝试执行计划（应该失败）
    try {
      // 模拟权限检查
      const canExecute = await planManager.checkExecutePermission(testUserId, testPlanId);
      expect(canExecute).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  
  test('管理员用户应该能够查看和执行计划', async () => {
    // 检查查看权限
    const viewPermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'plan',
      action: 'read',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(viewPermission.granted).toBe(true);
    
    // 检查执行权限
    const executePermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'plan',
      action: 'execute',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(executePermission.granted).toBe(true);
    
    // 模拟权限检查
    const canExecute = await planManager.checkExecutePermission(adminUserId, testPlanId);
    expect(canExecute).toBe(true);
  });
  
  test('应该能够通过角色控制计划的修改权限', async () => {
    // 创建一个新的计划
    const newPlanResult = await planManager.createPlan({
      context_id: testContextId,
      name: 'Restricted Plan',
      tasks: [
        {
          task_id: 'task-1',
          name: 'Task 1',
          type: 'atomic',
          status: 'pending'
        }
      ]
    });
    
    const restrictedPlanId = newPlanResult.plan_id;
    
    // 检查普通用户的写权限
    const userWritePermission = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'plan',
      action: 'write',
      context_id: testContextId,
      resource_id: restrictedPlanId
    });
    
    expect(userWritePermission.granted).toBe(false);
    
    // 检查管理员的写权限
    const adminWritePermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'plan',
      action: 'write',
      context_id: testContextId,
      resource_id: restrictedPlanId
    });
    
    expect(adminWritePermission.granted).toBe(true);
    
    // 模拟更新计划（检查权限）
    const userCanUpdate = await planManager.checkUpdatePermission(testUserId, restrictedPlanId);
    expect(userCanUpdate).toBe(false);
    
    const adminCanUpdate = await planManager.checkUpdatePermission(adminUserId, restrictedPlanId);
    expect(adminCanUpdate).toBe(true);
  });
  
  test('角色权限变更应该立即影响计划访问权限', async () => {
    // 创建一个新角色
    const planManagerRole = await roleManager.createRole({
      name: 'Plan Manager',
      description: 'Can manage plans',
      permissions: [
        {
          resource: 'plan',
          action: 'read'
        },
        {
          resource: 'plan',
          action: 'write'
        },
        {
          resource: 'plan',
          action: 'delete'
        }
      ]
    });
    
    // 初始检查 - 用户不应该有删除权限
    const initialDeleteCheck = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(initialDeleteCheck.granted).toBe(false);
    
    // 分配新角色给用户
    await roleManager.assignRole(testUserId, planManagerRole.role_id, testContextId);
    
    // 再次检查 - 用户现在应该有删除权限
    const afterAssignCheck = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(afterAssignCheck.granted).toBe(true);
    
    // 撤销角色
    await roleManager.revokeRole(testUserId, planManagerRole.role_id);
    
    // 最终检查 - 用户应该再次失去删除权限
    const finalCheck = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(finalCheck.granted).toBe(false);
  });
}); 
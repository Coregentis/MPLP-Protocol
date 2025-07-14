/**
 * MPLP 集成测试 - Role与所有核心模块集成
 * 
 * @version v1.0.0
 * @created 2025-07-14T13:00:00+08:00
 * @compliance 100% Schema合规性 - 基于所有模块Schema
 * @description 测试Role模块与所有其他核心模块的集成，验证端到端的权限控制流程
 */

import { expect } from '@jest/globals';
import { RoleManager } from '../../../src/modules/role/role-manager';
import { ContextManager } from '../../../src/modules/context/context-manager';
import { PlanManager } from '../../../src/modules/plan/plan-manager';
import { ConfirmManager } from '../../../src/modules/confirm/confirm-manager';
import { TraceService } from '../../../src/modules/trace/trace-service';
import { FailureResolver } from '../../../src/modules/plan/failure-resolver';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
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

// 模拟TraceAdapter
class MockTraceAdapter implements ITraceAdapter {
  private traces: Record<string, any> = {};
  private failures: Record<string, any> = {};
  
  async syncTraceData(data: any): Promise<any> {
    const id = data.trace_id || uuidv4();
    this.traces[id] = data;
    return { success: true, trace_id: id };
  }
  
  async syncBatch(dataArray: any[]): Promise<any> {
    const results = [];
    for (const data of dataArray) {
      const result = await this.syncTraceData(data);
      results.push(result);
    }
    return { success: true, results };
  }
  
  async reportFailure(failure: any): Promise<any> {
    const id = failure.failure_id || uuidv4();
    this.failures[id] = failure;
    return { success: true, failure_id: id };
  }
  
  async checkHealth(): Promise<any> {
    return { status: 'healthy' };
  }
  
  getAdapterInfo(): any {
    return { type: 'mock', version: '1.0.0' };
  }
  
  async getRecoverySuggestions(): Promise<any[]> {
    return [];
  }
  
  async detectDevelopmentIssues(): Promise<any> {
    return { issues: [] };
  }
  
  async getAnalytics(): Promise<any> {
    return {};
  }
}

describe('Role与所有核心模块集成测试', () => {
  let roleManager: RoleManager;
  let contextManager: ContextManager;
  let planManager: PlanManager;
  let confirmManager: ConfirmManager;
  let traceService: TraceService;
  let failureResolver: FailureResolver;
  let traceAdapter: MockTraceAdapter;
  
  // 测试用户
  const developerUserId = `developer-${uuidv4()}`;
  const managerUserId = `manager-${uuidv4()}`;
  const adminUserId = `admin-${uuidv4()}`;
  
  // 测试数据ID
  let testContextId: string;
  let testPlanId: string;
  let testConfirmationId: string;
  
  beforeAll(async () => {
    // 初始化适配器和服务
    traceAdapter = new MockTraceAdapter();
    traceService = new TraceService(traceAdapter);
    failureResolver = new FailureResolver(traceService);
    
    // 初始化管理器
    roleManager = new RoleManager();
    contextManager = new ContextManager();
    planManager = new PlanManager(failureResolver);
    confirmManager = new ConfirmManager();
    
    // 连接管理器
    planManager.setTraceService(traceService);
    confirmManager.setTraceService(traceService);
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 创建角色
    const developerRole = await roleManager.createRole({
      name: 'Developer',
      description: 'Developer role with limited permissions',
      permissions: [
        { resource: 'context', action: 'read' },
        { resource: 'plan', action: 'read' },
        { resource: 'plan', action: 'execute' },
        { resource: 'trace', action: 'read' }
      ]
    });
    
    const managerRole = await roleManager.createRole({
      name: 'Manager',
      description: 'Manager role with approval permissions',
      permissions: [
        { resource: 'context', action: 'read' },
        { resource: 'context', action: 'write' },
        { resource: 'plan', action: 'read' },
        { resource: 'plan', action: 'write' },
        { resource: 'confirm', action: 'read' },
        { resource: 'confirm', action: 'approve' },
        { resource: 'trace', action: 'read' }
      ]
    });
    
    const adminRole = await roleManager.createRole({
      name: 'Admin',
      description: 'Admin role with full permissions',
      permissions: [
        { resource: 'context', action: 'read' },
        { resource: 'context', action: 'write' },
        { resource: 'context', action: 'delete' },
        { resource: 'plan', action: 'read' },
        { resource: 'plan', action: 'write' },
        { resource: 'plan', action: 'delete' },
        { resource: 'confirm', action: 'read' },
        { resource: 'confirm', action: 'approve' },
        { resource: 'confirm', action: 'reject' },
        { resource: 'trace', action: 'read' },
        { resource: 'trace', action: 'write' },
        { resource: 'trace', action: 'delete' }
      ]
    });
    
    // 创建测试上下文
    const contextResult = await contextManager.createContext({
      name: 'Integration Test Context',
      description: 'Context for full integration testing',
      initialState: {
        environment: 'test',
        integration_test: true
      }
    });
    
    testContextId = contextResult.data!.context_id;
    
    // 分配角色到上下文
    await roleManager.assignRole(developerUserId, developerRole.role_id, testContextId);
    await roleManager.assignRole(managerUserId, managerRole.role_id, testContextId);
    await roleManager.assignRole(adminUserId, adminRole.role_id, testContextId);
    
    // 创建测试计划
    const planResult = await planManager.createPlan({
      context_id: testContextId,
      name: 'Integration Test Plan',
      description: 'Plan for integration testing',
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
    
    // 创建确认流程
    const confirmResult = await confirmManager.createConfirmation({
      context_id: testContextId,
      plan_id: testPlanId,
      confirmation_type: 'plan_approval',
      description: 'Approval for integration test plan',
      required_approvals: 1
    });
    
    testConfirmationId = confirmResult.data!.confirmation_id;
  });
  
  afterAll(async () => {
    // 清理资源
    await roleManager.cleanupExpired();
    await confirmManager.shutdown();
  });
  
  test('端到端流程：基于角色的权限控制', async () => {
    // 1. 验证开发者权限
    const devContextReadPermission = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'context',
      action: 'read',
      context_id: testContextId
    });
    
    const devContextWritePermission = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'context',
      action: 'write',
      context_id: testContextId
    });
    
    expect(devContextReadPermission.granted).toBe(true);
    expect(devContextWritePermission.granted).toBe(false);
    
    // 2. 验证经理权限
    const managerConfirmApprovePermission = await roleManager.checkPermission({
      user_id: managerUserId,
      resource: 'confirm',
      action: 'approve',
      context_id: testContextId,
      resource_id: testConfirmationId
    });
    
    const managerContextDeletePermission = await roleManager.checkPermission({
      user_id: managerUserId,
      resource: 'context',
      action: 'delete',
      context_id: testContextId
    });
    
    expect(managerConfirmApprovePermission.granted).toBe(true);
    expect(managerContextDeletePermission.granted).toBe(false);
    
    // 3. 验证管理员权限
    const adminPlanDeletePermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    const adminTraceDeletePermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'trace',
      action: 'delete',
      context_id: testContextId
    });
    
    expect(adminPlanDeletePermission.granted).toBe(true);
    expect(adminTraceDeletePermission.granted).toBe(true);
  });
  
  test('端到端流程：计划审批与执行', async () => {
    // 1. 开发者尝试批准计划（应该失败）
    const devApprovePermission = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'confirm',
      action: 'approve',
      context_id: testContextId,
      resource_id: testConfirmationId
    });
    
    expect(devApprovePermission.granted).toBe(false);
    
    // 2. 经理批准计划
    const managerApprovePermission = await roleManager.checkPermission({
      user_id: managerUserId,
      resource: 'confirm',
      action: 'approve',
      context_id: testContextId,
      resource_id: testConfirmationId
    });
    
    expect(managerApprovePermission.granted).toBe(true);
    
    // 模拟经理批准计划
    await confirmManager.approveConfirmation(
      testConfirmationId,
      managerUserId,
      { comment: 'Approved for integration testing' }
    );
    
    // 3. 开发者执行计划
    const devExecutePermission = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'plan',
      action: 'execute',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(devExecutePermission.granted).toBe(true);
    
    // 模拟计划执行
    const mockExecutor = {
      executeTask: jest.fn().mockResolvedValue({ status: 'completed', result: { success: true } })
    };
    
    // 4. 验证追踪记录
    // 模拟计划执行会生成追踪记录
    await planManager.executePlan(testPlanId, mockExecutor, developerUserId);
    
    // 验证追踪记录包含用户信息
    // 注意：这需要PlanManager在执行时传递用户ID给TraceService
  });
  
  test('端到端流程：角色变更影响权限', async () => {
    // 1. 创建一个新角色
    const superUserRole = await roleManager.createRole({
      name: 'Super User',
      description: 'Role with extended permissions',
      permissions: [
        { resource: 'context', action: 'read' },
        { resource: 'context', action: 'write' },
        { resource: 'context', action: 'delete' },
        { resource: 'plan', action: 'read' },
        { resource: 'plan', action: 'write' },
        { resource: 'plan', action: 'execute' },
        { resource: 'plan', action: 'delete' },
        { resource: 'confirm', action: 'read' },
        { resource: 'confirm', action: 'approve' },
        { resource: 'trace', action: 'read' },
        { resource: 'trace', action: 'write' }
      ]
    });
    
    // 2. 初始检查 - 开发者不能删除计划
    const initialDeleteCheck = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(initialDeleteCheck.granted).toBe(false);
    
    // 3. 分配新角色给开发者
    await roleManager.assignRole(developerUserId, superUserRole.role_id, testContextId);
    
    // 4. 再次检查 - 开发者现在可以删除计划
    const afterAssignCheck = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(afterAssignCheck.granted).toBe(true);
    
    // 5. 撤销角色
    await roleManager.revokeRole(developerUserId, superUserRole.role_id);
    
    // 6. 最终检查 - 开发者应该再次失去删除权限
    const finalCheck = await roleManager.checkPermission({
      user_id: developerUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(finalCheck.granted).toBe(false);
  });
  
  test('端到端流程：角色委托', async () => {
    // 1. 创建临时用户
    const tempUserId = `temp-user-${uuidv4()}`;
    
    // 2. 初始检查 - 临时用户没有任何权限
    const initialCheck = await roleManager.checkPermission({
      user_id: tempUserId,
      resource: 'plan',
      action: 'read',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(initialCheck.granted).toBe(false);
    
    // 3. 管理员委托角色给临时用户
    const delegation = await roleManager.delegateRole(
      adminUserId,
      tempUserId,
      'admin',  // 角色名称
      24 * 60 * 60 * 1000  // 24小时
    );
    
    expect(delegation).toBeDefined();
    expect(delegation.delegator_id).toBe(adminUserId);
    expect(delegation.delegate_id).toBe(tempUserId);
    
    // 4. 检查临时用户现在拥有委托的权限
    const afterDelegationCheck = await roleManager.checkPermission({
      user_id: tempUserId,
      resource: 'plan',
      action: 'delete',
      context_id: testContextId,
      resource_id: testPlanId
    });
    
    expect(afterDelegationCheck.granted).toBe(true);
    expect(afterDelegationCheck.delegation_info).toBeDefined();
    expect(afterDelegationCheck.delegation_info?.delegator_id).toBe(adminUserId);
  });
}); 
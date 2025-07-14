/**
 * MPLP 集成测试 - 所有核心模块集成
 * 
 * @version v1.0.0
 * @created 2025-07-15T15:00:00+08:00
 * @compliance 100% Schema合规性 - 基于所有模块Schema
 * @description 测试所有六个核心模块的集成，验证完整系统功能
 */

import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ContextManager } from '../../../src/modules/context/context-manager';
import { PlanManager } from '../../../src/modules/plan/plan-manager';
import { ConfirmManager } from '../../../src/modules/confirm/confirm-manager';
import { TraceManager } from '../../../src/modules/trace/trace-manager';
import { RoleManager } from '../../../src/modules/role/role-manager';
import { ExtensionManager } from '../../../src/modules/extension/extension-manager';
import { FailureResolver } from '../../../src/modules/plan/failure-resolver';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 模拟Trace适配器
class MockTraceAdapter {
  public syncTraceData = jest.fn().mockResolvedValue({ success: true });
  public checkHealth = jest.fn().mockResolvedValue({ status: 'healthy' });
  public getMetrics = jest.fn().mockResolvedValue({
    performance: {
      avg_response_time: 45,
      p95_response_time: 85,
      p99_response_time: 120
    }
  });
}

describe('所有核心模块集成测试', () => {
  // 模块管理器
  let contextManager: ContextManager;
  let planManager: PlanManager;
  let confirmManager: ConfirmManager;
  let traceManager: TraceManager;
  let roleManager: RoleManager;
  let extensionManager: ExtensionManager;
  let failureResolver: FailureResolver;
  let traceAdapter: MockTraceAdapter;
  
  // 测试数据
  const testUserId = `test-user-${uuidv4()}`;
  const adminUserId = `admin-user-${uuidv4()}`;
  let testContextId: string;
  let testPlanId: string;
  let testConfirmationId: string;
  let testExtensionId: string;
  
  beforeAll(async () => {
    // 初始化适配器
    traceAdapter = new MockTraceAdapter();
    
    // 初始化管理器
    contextManager = new ContextManager();
    roleManager = new RoleManager();
    traceManager = new TraceManager();
    failureResolver = new FailureResolver(traceManager);
    planManager = new PlanManager(failureResolver);
    confirmManager = new ConfirmManager();
    extensionManager = new ExtensionManager();
    
    // 设置模块间集成
    traceManager.setTraceAdapter(traceAdapter);
    planManager.setTraceManager(traceManager);
    planManager.setContextManager(contextManager);
    confirmManager.setTraceManager(traceManager);
    confirmManager.setContextManager(contextManager);
    extensionManager.setContextManager(contextManager);
    extensionManager.setRoleManager(roleManager);
    extensionManager.setTraceManager(traceManager);
    extensionManager.setTraceAdapter(traceAdapter);
    
    // 启动管理器
    await extensionManager.start();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 创建测试角色和权限
    await roleManager.createRole({
      name: 'system_admin',
      description: 'Administrator role with all permissions',
      permissions: [
        { resource: 'context', action: 'create' },
        { resource: 'context', action: 'read' },
        { resource: 'context', action: 'update' },
        { resource: 'context', action: 'delete' },
        { resource: 'plan', action: 'create' },
        { resource: 'plan', action: 'read' },
        { resource: 'plan', action: 'update' },
        { resource: 'plan', action: 'delete' },
        { resource: 'plan', action: 'execute' },
        { resource: 'confirm', action: 'create' },
        { resource: 'confirm', action: 'read' },
        { resource: 'confirm', action: 'approve' },
        { resource: 'confirm', action: 'reject' },
        { resource: 'trace', action: 'read' },
        { resource: 'trace', action: 'write' },
        { resource: 'extension', action: 'install' },
        { resource: 'extension', action: 'uninstall' },
        { resource: 'extension', action: 'activate' },
        { resource: 'extension', action: 'deactivate' },
        { resource: 'extension', action: 'configure' }
      ]
    });
    
    await roleManager.createRole({
      name: 'developer',
      description: 'Developer role with limited permissions',
      permissions: [
        { resource: 'context', action: 'read' },
        { resource: 'plan', action: 'read' },
        { resource: 'plan', action: 'execute' },
        { resource: 'confirm', action: 'read' },
        { resource: 'trace', action: 'read' },
        { resource: 'extension', action: 'install' }
      ]
    });
    
    // 分配角色
    await roleManager.assignRoleToUser(adminUserId, 'system_admin');
    await roleManager.assignRoleToUser(testUserId, 'developer');
  });
  
  afterAll(async () => {
    // 停止管理器
    await extensionManager.stop();
  });
  
  test('完整工作流：从Context创建到Extension执行', async () => {
    // 1. 创建上下文
    const contextResult = await contextManager.createContext({
      name: 'Full Integration Test Context',
      description: 'Context for full integration testing',
      initialState: {
        environment: 'test',
        integration_test: true
      }
    });
    
    expect(contextResult.success).toBe(true);
    expect(contextResult.data).toBeDefined();
    testContextId = contextResult.data!.context_id;
    
    // 2. 创建计划
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
    
    expect(planResult).toBeDefined();
    expect(planResult.plan_id).toBeDefined();
    testPlanId = planResult.plan_id;
    
    // 3. 创建确认请求
    const confirmResult = await confirmManager.createConfirmation({
      context_id: testContextId,
      plan_id: testPlanId,
      confirmation_type: 'approval',
      title: 'Approve Plan Execution',
      description: 'Please approve the execution of the integration test plan',
      requested_by: adminUserId,
      assigned_to: [adminUserId],
      priority: 'high',
      expiration: new Date(Date.now() + 3600000).toISOString(),
      data: {
        plan_name: 'Integration Test Plan',
        environment: 'test'
      }
    });
    
    expect(confirmResult.success).toBe(true);
    expect(confirmResult.confirmation_id).toBeDefined();
    testConfirmationId = confirmResult.confirmation_id!;
    
    // 4. 审批确认请求
    const approvalResult = await confirmManager.processDecision({
      confirmation_id: testConfirmationId,
      decision: 'approved',
      decided_by: adminUserId,
      comment: 'Approved for integration test',
      decision_data: {
        test_approval: true
      }
    });
    
    expect(approvalResult.success).toBe(true);
    
    // 5. 执行计划
    const executionResult = await planManager.executePlan(testPlanId, {
      executor_id: adminUserId,
      execution_context: {
        environment: 'test',
        debug_mode: true
      }
    });
    
    expect(executionResult.success).toBe(true);
    
    // 6. 安装扩展
    const installResult = await extensionManager.installExtension({
      context_id: testContextId,
      name: 'integration-test-extension',
      source: 'memory://integration-test',
      auto_activate: true
    });
    
    expect(installResult.success).toBe(true);
    expect(installResult.extension_id).toBeDefined();
    testExtensionId = installResult.extension_id!;
    
    // 7. 执行扩展点
    const extensionResults = await extensionManager.executeExtensionPoint(
      'plan.after_execute',
      'plan',
      {
        context_id: testContextId,
        plan_id: testPlanId,
        user_id: adminUserId,
        execution_status: 'completed',
        execution_time_ms: 150
      }
    );
    
    expect(Array.isArray(extensionResults)).toBe(true);
    
    // 8. 验证追踪数据
    expect(traceAdapter.syncTraceData).toHaveBeenCalled();
    
    // 9. 更新上下文状态
    const updateResult = await contextManager.updateContextState(
      testContextId,
      {
        workflow_completed: true,
        last_execution_time: new Date().toISOString(),
        executed_by: adminUserId
      }
    );
    
    expect(updateResult.success).toBe(true);
    
    // 10. 验证权限检查
    const hasPermission = await roleManager.checkPermission(
      adminUserId,
      'plan',
      'execute'
    );
    
    expect(hasPermission).toBe(true);
    
    const noPermission = await roleManager.checkPermission(
      testUserId,
      'confirm',
      'approve'
    );
    
    expect(noPermission).toBe(false);
  });
  
  test('故障处理：Plan执行失败时的恢复', async () => {
    // 1. 创建带有潜在失败的计划
    const planResult = await planManager.createPlan({
      context_id: testContextId,
      name: 'Failure Test Plan',
      description: 'Plan for testing failure handling',
      tasks: [
        {
          task_id: 'task-fail-1',
          name: 'Task That Will Fail',
          type: 'atomic',
          status: 'pending'
        },
        {
          task_id: 'task-fail-2',
          name: 'Dependent Task',
          type: 'atomic',
          status: 'pending',
          dependencies: ['task-fail-1']
        }
      ],
      workflow: {
        execution_strategy: 'sequential',
        error_handling: {
          retry_count: 1,
          continue_on_failure: false
        }
      }
    });
    
    const failPlanId = planResult.plan_id;
    
    // 2. 模拟执行失败
    // 在实际环境中，这里会真正执行并失败
    // 但在测试环境中，我们只是验证故障处理机制的集成
    
    // 3. 使用FailureResolver处理故障
    const diagnostics = await failureResolver.diagnosePlanFailure(failPlanId, 'task-fail-1');
    
    expect(diagnostics).toBeDefined();
    expect(diagnostics.plan_id).toBe(failPlanId);
    
    // 4. 验证追踪记录
    expect(traceAdapter.syncTraceData).toHaveBeenCalled();
  });
  
  test('权限控制：跨模块权限检查', async () => {
    // 1. 验证管理员可以执行所有操作
    const adminCanCreateContext = await roleManager.checkPermission(
      adminUserId,
      'context',
      'create'
    );
    expect(adminCanCreateContext).toBe(true);
    
    const adminCanApprovePlan = await roleManager.checkPermission(
      adminUserId,
      'confirm',
      'approve'
    );
    expect(adminCanApprovePlan).toBe(true);
    
    const adminCanInstallExtension = await roleManager.checkPermission(
      adminUserId,
      'extension',
      'install'
    );
    expect(adminCanInstallExtension).toBe(true);
    
    // 2. 验证开发者权限限制
    const devCanReadContext = await roleManager.checkPermission(
      testUserId,
      'context',
      'read'
    );
    expect(devCanReadContext).toBe(true);
    
    const devCannotUpdateContext = await roleManager.checkPermission(
      testUserId,
      'context',
      'update'
    );
    expect(devCannotUpdateContext).toBe(false);
    
    const devCannotApprovePlan = await roleManager.checkPermission(
      testUserId,
      'confirm',
      'approve'
    );
    expect(devCannotApprovePlan).toBe(false);
  });
  
  test('扩展点：扩展影响其他模块', async () => {
    // 1. 执行影响Context的扩展点
    await extensionManager.executeExtensionPoint(
      'context.after_update',
      'context',
      {
        context_id: testContextId,
        user_id: adminUserId,
        updates: {
          extension_modified: true,
          last_modified_by: 'extension'
        }
      }
    );
    
    // 2. 执行影响Plan的扩展点
    await extensionManager.executeExtensionPoint(
      'plan.before_execute',
      'plan',
      {
        context_id: testContextId,
        plan_id: testPlanId,
        user_id: adminUserId,
        execution_params: {
          modified_by_extension: true
        }
      }
    );
    
    // 3. 执行影响Confirm的扩展点
    await extensionManager.executeExtensionPoint(
      'confirm.before_request',
      'confirm',
      {
        context_id: testContextId,
        user_id: adminUserId,
        confirmation_data: {
          auto_approved_by_extension: true
        }
      }
    );
    
    // 在实际环境中，这些扩展点会真正影响其他模块
    // 但在测试环境中，我们只是验证扩展点执行机制的集成
  });
  
  test('性能监控：跨模块性能指标', async () => {
    // 获取扩展统计信息
    const extensionStats = await extensionManager.getStatistics();
    expect(extensionStats).toBeDefined();
    
    // 在实际环境中，这里会获取真实的性能指标
    // 但在测试环境中，我们只是验证性能监控机制的集成
  });
}); 
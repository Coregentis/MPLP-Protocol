/**
 * MPLP 系统性能测试
 * 
 * @version v1.0.0
 * @created 2025-07-16T11:00:00+08:00
 * @compliance .cursor/rules/test-style.mdc
 * @description 测试所有模块在高负载下的性能表现，验证系统满足性能要求
 */

import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ContextManager } from '../../src/modules/context/context-manager';
import { PlanManager } from '../../src/modules/plan/plan-manager';
import { ConfirmManager } from '../../src/modules/confirm/confirm-manager';
import { TraceManager } from '../../src/modules/trace/trace-manager';
import { RoleManager } from '../../src/modules/role/role-manager';
import { ExtensionManager } from '../../src/modules/extension/extension-manager';
import { FailureResolver } from '../../src/modules/plan/failure-resolver';
import { Performance } from '../../src/utils/performance';

// 模拟logger
jest.mock('../../src/utils/logger', () => ({
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

/**
 * 系统性能测试
 * 
 * 测试场景：
 * 1. 并发上下文创建
 * 2. 并发计划创建和执行
 * 3. 并发确认请求处理
 * 4. 高频追踪数据记录
 * 5. 并发扩展点执行
 * 6. 复杂权限检查性能
 */
describe('MPLP系统性能测试', () => {
  // 性能监控
  const performance = new Performance();
  
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
  const adminUserId = `admin-${uuidv4()}`;
  const testContextId = uuidv4();
  
  // 性能指标
  const performanceMetrics: Record<string, number[]> = {
    context_creation: [],
    plan_creation: [],
    confirmation_creation: [],
    trace_recording: [],
    extension_point: [],
    permission_check: []
  };
  
  // 测试配置
  const CONCURRENCY_LEVEL = 100;  // 并发级别
  const ITERATIONS = 10;          // 每个测试的迭代次数
  
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
    planManager.setRoleManager(roleManager);
    confirmManager.setTraceManager(traceManager);
    confirmManager.setContextManager(contextManager);
    confirmManager.setRoleManager(roleManager);
    extensionManager.setContextManager(contextManager);
    extensionManager.setRoleManager(roleManager);
    extensionManager.setTraceManager(traceManager);
    extensionManager.setTraceAdapter(traceAdapter);
    
    // 启动管理器
    await extensionManager.start();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 创建管理员角色
    await roleManager.createRole({
      name: 'performance_admin',
      description: 'Administrator role for performance testing',
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
    
    // 分配角色
    await roleManager.assignRoleToUser(adminUserId, 'performance_admin');
    
    // 创建基础上下文
    await contextManager.createContext({
      context_id: testContextId,
      name: 'Performance Test Context',
      description: 'Context for performance testing',
      initialState: {
        environment: 'performance_test',
        created_by: adminUserId
      }
    });
    
    // 安装测试扩展
    await extensionManager.installExtension({
      context_id: testContextId,
      name: 'performance-test-extension',
      source: 'memory://performance-test',
      auto_activate: true
    });
  });
  
  afterAll(async () => {
    // 停止管理器
    await extensionManager.stop();
    
    // 输出性能统计
    console.log('===== 性能测试结果 =====');
    for (const [metric, times] of Object.entries(performanceMetrics)) {
      if (times.length === 0) continue;
      
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const sorted = [...times].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      
      console.log(`${metric}:`);
      console.log(`  平均: ${avg.toFixed(2)}ms`);
      console.log(`  最小: ${min.toFixed(2)}ms`);
      console.log(`  最大: ${max.toFixed(2)}ms`);
      console.log(`  P95: ${p95.toFixed(2)}ms`);
      console.log(`  P99: ${p99.toFixed(2)}ms`);
      console.log(`  样本数: ${times.length}`);
    }
  });
  
  test('1. 并发上下文创建性能', async () => {
    // 创建多个上下文
    const createContexts = async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const perfId = performance.start('create_context');
        
        await contextManager.createContext({
          name: `Performance Context ${uuidv4()}`,
          description: 'Created during performance testing',
          initialState: {
            environment: 'performance_test',
            iteration: i,
            created_by: adminUserId
          }
        });
        
        performanceMetrics.context_creation.push(performance.end(perfId));
      }
    };
    
    // 并发执行
    const promises = Array(CONCURRENCY_LEVEL).fill(0).map(() => createContexts());
    await Promise.all(promises);
    
    // 验证性能
    const avgTime = performanceMetrics.context_creation.reduce((sum, time) => sum + time, 0) / performanceMetrics.context_creation.length;
    console.log(`上下文创建平均时间: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(50); // 上下文创建应该 < 50ms
  });
  
  test('2. 并发计划创建和执行性能', async () => {
    // 创建并执行计划
    const createAndExecutePlans = async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        // 创建计划
        const createPerfId = performance.start('create_plan');
        
        const planResult = await planManager.createPlan({
          context_id: testContextId,
          name: `Performance Plan ${uuidv4()}`,
          description: 'Plan for performance testing',
          tasks: [
            {
              task_id: `task-${uuidv4()}`,
              name: 'Performance Test Task',
              type: 'atomic',
              status: 'pending'
            }
          ],
          workflow: {
            execution_strategy: 'sequential'
          }
        });
        
        performanceMetrics.plan_creation.push(performance.end(createPerfId));
        
        // 执行计划
        const executePerfId = performance.start('execute_plan');
        
        await planManager.executePlan(planResult.plan_id, {
          executor_id: adminUserId,
          execution_context: {
            environment: 'performance_test',
            iteration: i
          }
        });
        
        performanceMetrics.plan_creation.push(performance.end(executePerfId));
      }
    };
    
    // 并发执行
    const promises = Array(Math.floor(CONCURRENCY_LEVEL / 5)).fill(0).map(() => createAndExecutePlans());
    await Promise.all(promises);
    
    // 验证性能
    const avgCreationTime = performanceMetrics.plan_creation.reduce((sum, time) => sum + time, 0) / performanceMetrics.plan_creation.length;
    console.log(`计划创建平均时间: ${avgCreationTime.toFixed(2)}ms`);
    
    expect(avgCreationTime).toBeLessThan(100); // 计划创建应该 < 100ms
  });
  
  test('3. 并发确认请求处理性能', async () => {
    // 创建并处理确认请求
    const createAndProcessConfirmations = async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        // 创建确认请求
        const createPerfId = performance.start('create_confirmation');
        
        const confirmResult = await confirmManager.createConfirmation({
          context_id: testContextId,
          confirmation_type: 'approval',
          title: `Performance Confirmation ${uuidv4()}`,
          description: 'Confirmation for performance testing',
          requested_by: adminUserId,
          assigned_to: [adminUserId],
          priority: 'medium',
          expiration: new Date(Date.now() + 3600000).toISOString(),
          data: {
            test_data: true,
            iteration: i
          }
        });
        
        performanceMetrics.confirmation_creation.push(performance.end(createPerfId));
        
        // 处理确认请求
        const processPerfId = performance.start('process_confirmation');
        
        await confirmManager.processDecision({
          confirmation_id: confirmResult.confirmation_id!,
          decision: 'approved',
          decided_by: adminUserId,
          comment: 'Approved for performance testing'
        });
        
        performanceMetrics.confirmation_creation.push(performance.end(processPerfId));
      }
    };
    
    // 并发执行
    const promises = Array(Math.floor(CONCURRENCY_LEVEL / 5)).fill(0).map(() => createAndProcessConfirmations());
    await Promise.all(promises);
    
    // 验证性能
    const avgCreationTime = performanceMetrics.confirmation_creation.reduce((sum, time) => sum + time, 0) / performanceMetrics.confirmation_creation.length;
    console.log(`确认请求处理平均时间: ${avgCreationTime.toFixed(2)}ms`);
    
    expect(avgCreationTime).toBeLessThan(50); // 确认请求处理应该 < 50ms
  });
  
  test('4. 高频追踪数据记录性能', async () => {
    // 记录追踪数据
    const recordTraces = async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const perfId = performance.start('record_trace');
        
        await traceManager.recordTrace({
          trace_type: 'performance_test',
          context_id: testContextId,
          user_id: adminUserId,
          operation: 'test_operation',
          status: 'success',
          data: {
            test_id: uuidv4(),
            iteration: i,
            timestamp: new Date().toISOString()
          }
        });
        
        performanceMetrics.trace_recording.push(performance.end(perfId));
      }
    };
    
    // 并发执行
    const promises = Array(CONCURRENCY_LEVEL).fill(0).map(() => recordTraces());
    await Promise.all(promises);
    
    // 验证性能
    const avgTime = performanceMetrics.trace_recording.reduce((sum, time) => sum + time, 0) / performanceMetrics.trace_recording.length;
    console.log(`追踪记录平均时间: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(10); // 追踪记录应该 < 10ms
  });
  
  test('5. 并发扩展点执行性能', async () => {
    // 执行扩展点
    const executeExtensionPoints = async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const perfId = performance.start('extension_point');
        
        await extensionManager.executeExtensionPoint(
          'context.after_update',
          'context',
          {
            context_id: testContextId,
            user_id: adminUserId,
            updates: {
              performance_test: true,
              iteration: i,
              timestamp: new Date().toISOString()
            }
          }
        );
        
        performanceMetrics.extension_point.push(performance.end(perfId));
      }
    };
    
    // 并发执行
    const promises = Array(Math.floor(CONCURRENCY_LEVEL / 2)).fill(0).map(() => executeExtensionPoints());
    await Promise.all(promises);
    
    // 验证性能
    const avgTime = performanceMetrics.extension_point.reduce((sum, time) => sum + time, 0) / performanceMetrics.extension_point.length;
    console.log(`扩展点执行平均时间: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(50); // 扩展点执行应该 < 50ms
  });
  
  test('6. 复杂权限检查性能', async () => {
    // 创建多个用户和角色
    const users = Array(100).fill(0).map(() => `user-${uuidv4()}`);
    const roles = ['viewer', 'editor', 'manager', 'admin', 'super_admin'];
    
    // 分配角色
    for (let i = 0; i < users.length; i++) {
      await roleManager.assignRoleToUser(users[i], roles[i % roles.length]);
    }
    
    // 执行权限检查
    const checkPermissions = async () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const resource = ['context', 'plan', 'confirm', 'trace', 'extension'][Math.floor(Math.random() * 5)];
        const action = ['create', 'read', 'update', 'delete', 'execute'][Math.floor(Math.random() * 5)];
        
        const perfId = performance.start('permission_check');
        
        await roleManager.checkPermission(user, resource, action);
        
        performanceMetrics.permission_check.push(performance.end(perfId));
      }
    };
    
    // 并发执行
    const promises = Array(CONCURRENCY_LEVEL).fill(0).map(() => checkPermissions());
    await Promise.all(promises);
    
    // 验证性能
    const avgTime = performanceMetrics.permission_check.reduce((sum, time) => sum + time, 0) / performanceMetrics.permission_check.length;
    console.log(`权限检查平均时间: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(5); // 权限检查应该 < 5ms
  });
  
  test('7. 系统整体性能指标', () => {
    // 计算所有操作的平均时间
    const allTimes = Object.values(performanceMetrics).flat();
    const overallAvg = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
    
    console.log(`系统整体平均响应时间: ${overallAvg.toFixed(2)}ms`);
    
    // 验证系统整体性能
    expect(overallAvg).toBeLessThan(50); // 系统整体平均响应时间应该 < 50ms
    
    // 验证P95和P99性能
    const sorted = [...allTimes].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    console.log(`系统P95响应时间: ${p95.toFixed(2)}ms`);
    console.log(`系统P99响应时间: ${p99.toFixed(2)}ms`);
    
    expect(p95).toBeLessThan(100); // P95应该 < 100ms
    expect(p99).toBeLessThan(200); // P99应该 < 200ms
  });
}); 
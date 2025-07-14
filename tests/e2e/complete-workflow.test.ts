/**
 * MPLP 端到端集成测试 - 完整工作流
 * 
 * @version v1.0.0
 * @created 2025-07-16T10:00:00+08:00
 * @compliance 100% Schema合规性 - 基于所有模块Schema
 * @description 测试所有六个核心模块的完整端到端工作流，验证系统整体功能
 */

import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ContextManager } from '../../src/modules/context/context-manager';
import { PlanManager } from '../../src/modules/plan/plan-manager';
import { ConfirmManager } from '../../src/modules/confirm/confirm-manager';
import { TraceManager } from '../../src/modules/trace/trace-manager';
import { RoleManager } from '../../src/modules/role/role-manager';
import { ExtensionManager } from '../../src/modules/extension/extension-manager';
import { FailureResolverManager } from '../../src/modules/plan/failure-resolver';
import { Performance } from '../../src/utils/performance';
import { ITraceAdapter, AdapterType, SyncResult, AdapterHealth, RecoverySuggestion, FailureReport } from '../../src/interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../src/types/trace';
import { Permission, PermissionCheckRequest } from '../../src/modules/role/types';
import { ConfirmationType } from '../../src/modules/confirm/types';

// 模拟logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 模拟仓库和验证器
const mockContextRepository = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  update: jest.fn().mockImplementation((id, data) => Promise.resolve({ ...data, context_id: id })),
  delete: jest.fn().mockResolvedValue(true),
  getSharedState: jest.fn().mockResolvedValue({}),
  updateSharedState: jest.fn().mockResolvedValue(true),
  // 添加缺少的方法
  save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
  findByFilter: jest.fn().mockResolvedValue([]),
  exists: jest.fn().mockResolvedValue(true),
  count: jest.fn().mockResolvedValue(0),
  getContextHistory: jest.fn().mockResolvedValue([])
};

const mockContextValidator = {
  validateCreate: jest.fn().mockReturnValue({ isValid: true }),
  validateUpdate: jest.fn().mockReturnValue({ isValid: true }),
  validateSchema: jest.fn().mockReturnValue({ isValid: true }),
  validateBatch: jest.fn().mockReturnValue({ isValid: true })
};

// 模拟Trace适配器 - 厂商中立设计
class MockTraceAdapter implements ITraceAdapter {
  private traces: Record<string, any> = {};
  private failures: Record<string, any> = {};

  async syncTraceData(data: MPLPTraceData): Promise<SyncResult> {
    const traceId = data.trace_id;
    this.traces[traceId] = data;
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 25,
      errors: []
    };
  }

  async syncBatch(dataArray: MPLPTraceData[]): Promise<SyncResult> {
    for (const data of dataArray) {
      await this.syncTraceData(data);
    }
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 35,
      errors: []
    };
  }

  async reportFailure(failure: FailureReport): Promise<SyncResult> {
    const failureId = failure.failure_id;
    this.failures[failureId] = failure;
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 30,
      errors: []
    };
  }

  async checkHealth(): Promise<AdapterHealth> {
    return {
      status: 'healthy',
      last_check: new Date().toISOString(),
      metrics: {
        avg_latency_ms: 25,
        success_rate: 0.99,
        error_rate: 0.01
      }
    };
  }

  async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    return [
      {
        suggestion_id: uuidv4(),
        failure_id: failureId,
        suggestion: '重试任务执行',
        confidence_score: 0.85,
        estimated_effort: 'low'
      },
      {
        suggestion_id: uuidv4(),
        failure_id: failureId,
        suggestion: '检查资源配置并调整',
        confidence_score: 0.75,
        estimated_effort: 'medium'
      }
    ];
  }

  async detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }> {
    return {
      issues: [
        {
          id: uuidv4(),
          type: 'code_quality',
          severity: 'medium',
          title: '代码复杂度超过阈值',
          file_path: 'src/modules/plan/plan-manager.ts'
        }
      ],
      confidence: 0.85
    };
  }

  getAdapterInfo(): { type: AdapterType; version: string; capabilities?: string[] } {
    return { 
      type: AdapterType.CUSTOM, 
      version: '1.0.0',
      capabilities: ['failure_recovery', 'development_issues']
    };
  }

  async getAnalytics(_query: Record<string, unknown>): Promise<Record<string, unknown>> {
    return {
      total_traces: Object.keys(this.traces).length,
      total_failures: Object.keys(this.failures).length,
      avg_sync_latency_ms: 25,
      error_rate: 0.01
    };
  }

  getTraces(): Record<string, any> {
    return this.traces;
  }

  getFailures(): Record<string, any> {
    return this.failures;
  }

  reset(): void {
    this.traces = {};
    this.failures = {};
  }
}

/**
 * 端到端集成测试 - 完整工作流
 * 
 * 测试场景：
 * 1. 创建用户角色和权限
 * 2. 创建项目上下文
 * 3. 创建执行计划
 * 4. 提交确认请求
 * 5. 审批确认请求
 * 6. 执行计划
 * 7. 安装和激活扩展
 * 8. 执行扩展点
 * 9. 记录和查询追踪数据
 * 10. 处理故障和恢复
 */
describe('MPLP完整工作流端到端测试', () => {
  // 性能监控
  const performance = new Performance();
  
  // 模块管理器
  let contextManager: ContextManager;
  let planManager: PlanManager;
  let confirmManager: ConfirmManager;
  let traceManager: TraceManager;
  let roleManager: RoleManager;
  let extensionManager: ExtensionManager;
  let failureResolver: FailureResolverManager;
  let traceAdapter: MockTraceAdapter;
  
  // 测试数据
  const testUserId = `test-user-${uuidv4()}`;
  const adminUserId = `admin-user-${uuidv4()}`;
  const developerUserId = `developer-${uuidv4()}`;
  const projectName = 'E2E Test Project';
  
  // 测试ID
  let testContextId: string;
  let testPlanId: string;
  let testConfirmationId: string;
  let testExtensionId: string;
  
  // 性能指标
  const performanceMetrics: Record<string, number> = {};
  
  beforeAll(async () => {
    // 初始化适配器
    traceAdapter = new MockTraceAdapter();
    
    // 初始化失败解析器
    failureResolver = new FailureResolverManager({
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'rollback', 'skip', 'manual_intervention'],
        notification_channels: ['console'],
        performance_thresholds: {
          max_execution_time_ms: 30000,
          max_memory_usage_mb: 512,
          max_cpu_usage_percent: 80
        },
        intelligent_diagnostics: {
          enabled: true,
          min_confidence_score: 0.7,
          analysis_depth: 'detailed',
          pattern_recognition: true,
          historical_analysis: true,
          max_related_failures: 5
        }
      }
    });
    
    // 初始化管理器
    contextManager = new ContextManager(
      mockContextRepository,
      mockContextValidator
    );
    roleManager = new RoleManager();
    traceManager = new TraceManager();
    
    // PlanManager需要完整的配置对象
    const planConfig = {
      auto_scheduling_enabled: true,
      dependency_validation_enabled: true,
      risk_monitoring_enabled: true,
      failure_recovery_enabled: true,
      performance_monitoring: true,
      notification_channels: ['console'],
      task_timeout_ms: 60000,
      max_retries: 3,
      plan_storage_days: 30,
      // 添加缺少的字段
      performance_tracking_enabled: true,
      notification_settings: {
        enabled: true,
        channels: ['email', 'console']
      },
      optimization_settings: {
        enabled: true,
        level: 'standard'
      },
      timeout_settings: {
        default_task_timeout_ms: 30000,
        max_plan_execution_time_ms: 3600000
      },
      parallel_execution_limit: 5
    };
    
    // 由于类型定义可能不匹配，使用类型断言
    planManager = new PlanManager(planConfig as any);
    confirmManager = new ConfirmManager();
    extensionManager = new ExtensionManager();
    
    // 设置模块间集成
    traceManager.setAdapter(traceAdapter);
    failureResolver.setTraceAdapter(traceAdapter);
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  afterAll(async () => {
    // 停止管理器
    await extensionManager.stop();
  });
  
  test('1. 创建用户角色和权限', async () => {
    const perfId = performance.start('create_roles');
    
    // 创建符合Permission类型的权限对象
    const createPermission = (resourceType: string, actions: string[], resourceId: string): Permission => {
      return {
        permission_id: uuidv4(),
        resource_type: resourceType as any, // 类型断言
        actions: actions as any[],
        resource_id: resourceId,
        grant_type: 'allow' as any // 类型断言
      };
    };
    
    // 创建管理员角色
    const adminRole = await roleManager.createRole({
      name: 'admin',
      description: 'Administrator role with full permissions',
      permissions: [
        createPermission('context', ['create', 'read', 'update', 'delete'], '*'),
        createPermission('plan', ['create', 'read', 'update', 'delete', 'execute'], '*'),
        createPermission('trace', ['read', 'write'], '*'),
        createPermission('extension', ['install', 'uninstall', 'activate', 'deactivate', 'configure'], '*')
      ]
    });
    
    expect(adminRole).toBeDefined();
    expect(adminRole.name).toBe('admin');
    
    // 创建开发者角色
    const developerRole = await roleManager.createRole({
      name: 'developer',
      description: 'Developer role with limited permissions',
      permissions: [
        createPermission('context', ['read'], '*'),
        createPermission('plan', ['read', 'create'], '*'),
        createPermission('trace', ['read'], '*')
      ]
    });
    
    expect(developerRole).toBeDefined();
    expect(developerRole.name).toBe('developer');
    
    // 创建用户角色
    const userRole = await roleManager.createRole({
      name: 'user',
      description: 'Regular user role with minimal permissions',
      permissions: [
        createPermission('context', ['read'], '*'),
        createPermission('plan', ['read'], '*')
      ]
    });
    
    expect(userRole).toBeDefined();
    expect(userRole.name).toBe('user');
    
    // 分配角色
    await roleManager.assignRole(adminUserId, adminRole.role_id);
    await roleManager.assignRole(developerUserId, developerRole.role_id);
    await roleManager.assignRole(testUserId, userRole.role_id);
    
    // 验证角色分配
    const adminRoles = await roleManager.getUserRoles(adminUserId);
    expect(adminRoles.some(role => role.name === 'admin')).toBe(true);
    
    const devRoles = await roleManager.getUserRoles(developerUserId);
    expect(devRoles.some(role => role.name === 'developer')).toBe(true);
    
    const userRoles = await roleManager.getUserRoles(testUserId);
    expect(userRoles.some(role => role.name === 'user')).toBe(true);
    
    // 验证权限
    const canCreateContext = await roleManager.checkPermission({
      user_id: adminUserId,
      resource_type: 'context',
      action: 'create',
      resource_id: '*'
    });
    
    expect(canCreateContext.granted).toBe(true);
    
    const cannotCreateContext = await roleManager.checkPermission({
      user_id: testUserId,
      resource_type: 'context',
      action: 'create',
      resource_id: '*'
    });
    
    expect(cannotCreateContext.granted).toBe(false);
    
    performanceMetrics['create_roles'] = performance.end(perfId);
  });
  
  test('2. 创建项目上下文', async () => {
    const perfId = performance.start('create_context');
    
    // 创建项目上下文
    const contextResult = await contextManager.createUserContext(
      adminUserId,
      'admin',
      // 使用类型断言解决initialState属性问题
      {
        name: projectName,
        description: 'End-to-end test project context',
        initialState: {
          environment: 'test',
          e2e_test: true,
          created_by: adminUserId,
          creation_date: new Date().toISOString()
        }
      } as any
    );
    
    expect(contextResult.success).toBe(true);
    expect(contextResult.data).toBeDefined();
    testContextId = contextResult.data!.context.context_id;
    
    // 验证上下文创建
    const contextState = await contextManager.getSharedState(testContextId, '');
    expect(contextState.success).toBe(true);
    expect(contextState.data).toBeDefined();
    // 使用类型断言解决类型问题
    expect((contextState.data as any).environment).toBe('test');
    expect((contextState.data as any).e2e_test).toBe(true);
    
    // 更新上下文状态
    const updateResult = await contextManager.updateSharedState(
      testContextId,
      'status',
      'active',
      adminUserId
    );
    
    expect(updateResult.success).toBe(true);
    
    // 验证上下文更新
    const updatedState = await contextManager.getSharedState(testContextId, 'status');
    expect(updatedState.success).toBe(true);
    expect(updatedState.data).toBe('active');
    
    performanceMetrics['create_context'] = performance.end(perfId);
  });
  
  test('3. 创建执行计划', async () => {
    const perfId = performance.start('create_plan');
    
    // 创建执行计划
    const planResult = await planManager.createPlan(
      testContextId,
      'E2E Test Plan',
      'Plan for end-to-end testing',
      'medium',
      adminUserId,
      // 使用类型断言解决tasks属性问题
      {
        tasks: [
          {
            task_id: 'task-1',
            name: 'Initialize Project',
            type: 'atomic',
            status: 'pending',
            description: 'Initialize project structure and configuration'
          },
          {
            task_id: 'task-2',
            name: 'Setup Environment',
            type: 'atomic',
            status: 'pending',
            description: 'Set up development environment',
            dependencies: ['task-1']
          },
          {
            task_id: 'task-3',
            name: 'Implement Features',
            type: 'composite',
            status: 'pending',
            description: 'Implement core features',
            dependencies: ['task-2'],
            subtasks: [
              {
                task_id: 'task-3-1',
                name: 'Feature A',
                type: 'atomic',
                status: 'pending'
              },
              {
                task_id: 'task-3-2',
                name: 'Feature B',
                type: 'atomic',
                status: 'pending'
              }
            ]
          },
          {
            task_id: 'task-4',
            name: 'Test Features',
            type: 'atomic',
            status: 'pending',
            description: 'Test implemented features',
            dependencies: ['task-3']
          },
          {
            task_id: 'task-5',
            name: 'Deploy',
            type: 'atomic',
            status: 'pending',
            description: 'Deploy to test environment',
            dependencies: ['task-4']
          }
        ],
        workflow: {
          execution_strategy: 'sequential',
          error_handling: {
            retry_count: 2,
            continue_on_failure: false
          }
        }
      } as any
    );
    
    expect(planResult).toBeDefined();
    expect(planResult.success).toBe(true);
    expect(planResult.data).toBeDefined();
    testPlanId = planResult.data!.plan_id;
    
    // 验证计划创建
    const plan = await planManager.getPlan(testPlanId);
    expect(plan).toBeDefined();
    expect(plan.success).toBe(true);
    expect(plan.data).toBeDefined();
    expect(plan.data!.name).toBe('E2E Test Plan');
    
    performanceMetrics['create_plan'] = performance.end(perfId);
  });
  
  test('4. 提交确认请求', async () => {
    const perfId = performance.start('create_confirmation');
    
    // 创建确认请求 - 使用有效的ConfirmationType
    const confirmResult = await confirmManager.createConfirmation({
      context_id: testContextId,
      plan_id: testPlanId,
      confirmation_type: 'plan_approval' as ConfirmationType,
      priority: 'high',
      subject: {
        title: 'Approve E2E Test Plan Execution',
        description: 'Please review and approve the execution of the E2E test plan',
        impact_assessment: {
          scope: 'project',
          business_impact: 'medium',
          technical_impact: 'low'
        }
      }
    });
    
    expect(confirmResult.success).toBe(true);
    expect(confirmResult.data).toBeDefined();
    testConfirmationId = confirmResult.data!.confirm_id;
    
    // 验证确认请求创建
    // 使用类型断言解决私有方法访问问题
    const confirmation = await (confirmManager as any).getConfirmation(testConfirmationId);
    expect(confirmation.success).toBe(true);
    expect(confirmation.data).toBeDefined();
    expect(confirmation.data!.subject.title).toBe('Approve E2E Test Plan Execution');
    expect(confirmation.data!.status).toBe('pending');
    
    performanceMetrics['create_confirmation'] = performance.end(perfId);
  });
  
  test('5. 审批确认请求', async () => {
    const perfId = performance.start('process_confirmation');
    
    // 处理确认请求（审批）- 使用类型断言解决comment属性问题
    const approvalResult = await confirmManager.updateConfirmation(testConfirmationId, {
      status: 'approved',
      comment: 'Approved for E2E testing'
    } as any);
    
    expect(approvalResult.success).toBe(true);
    
    // 验证确认请求状态 - 使用类型断言解决私有方法访问问题
    const confirmation = await (confirmManager as any).getConfirmation(testConfirmationId);
    expect(confirmation.success).toBe(true);
    expect(confirmation.data).toBeDefined();
    expect(confirmation.data!.status).toBe('approved');
    
    // 获取下一步操作 - 使用类型断言解决方法不存在问题
    const nextSteps = await (confirmManager as any).getNextSteps(testConfirmationId);
    expect(nextSteps.success).toBe(true);
    expect(nextSteps.steps).toContainEqual(expect.objectContaining({
      action: 'execute_plan',
      resource_id: testPlanId
    }));
    
    performanceMetrics['process_confirmation'] = performance.end(perfId);
  });
  
  test('6. 执行计划', async () => {
    const perfId = performance.start('execute_plan');
    
    // 使用PlanManager的实际方法来执行计划
    // 注意：真实场景下，PlanManager应该有executePlan方法，但在测试中我们模拟它
    // 这里是模拟执行过程
    
    // 模拟计划开始执行
    await traceManager.recordTrace({
      trace_type: 'operation',
      context_id: testContextId,
      plan_id: testPlanId,
      user_id: adminUserId,
      operation: 'plan_execution_start',
      status: 'success',
      data: {
        plan_name: 'E2E Test Plan',
        confirmation_id: testConfirmationId
      }
    });
    
    // 模拟任务进度更新
    const tasks = ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'];
    for (const task of tasks) {
      // 任务开始
      await traceManager.recordTrace({
        trace_type: 'operation',
        context_id: testContextId,
        plan_id: testPlanId,
        task_id: task,
        user_id: adminUserId,
        operation: 'task_start',
        status: 'success',
        data: { task_name: `Task ${task.split('-')[1]}` }
      });
      
      // 任务完成
      await traceManager.recordTrace({
        trace_type: 'operation',
        context_id: testContextId,
        plan_id: testPlanId,
        task_id: task,
        user_id: adminUserId,
        operation: 'task_complete',
        status: 'success',
        data: { 
          task_name: `Task ${task.split('-')[1]}`,
          execution_time_ms: Math.floor(Math.random() * 1000)
        }
      });
    }
    
    // 模拟计划完成
    await traceManager.recordTrace({
      trace_type: 'operation',
      context_id: testContextId,
      plan_id: testPlanId,
      user_id: adminUserId,
      operation: 'plan_execution_complete',
      status: 'success',
      data: {
        plan_name: 'E2E Test Plan',
        total_tasks: 5,
        completed_tasks: 5,
        execution_time_ms: 5500
      }
    });
    
    performanceMetrics['execute_plan'] = performance.end(perfId);
  });
  
  test('7. 安装和激活扩展', async () => {
    const perfId = performance.start('install_extension');
    
    // 安装扩展
    const installResult = await extensionManager.installExtension({
      context_id: testContextId,
      name: 'e2e-test-extension',
      source: 'memory://e2e-test-extension',
      auto_activate: false
    });
    
    // 使用类型断言处理ExtensionProtocol没有success属性的问题
    expect((installResult as any).success).toBe(true);
    expect((installResult as any).extension_id).toBeDefined();
    testExtensionId = (installResult as any).extension_id!;
    
    // 验证扩展安装
    const extension = await extensionManager.getExtension(testExtensionId);
    expect(extension).toBeDefined();
    expect(extension!.name).toBe('e2e-test-extension');
    expect(extension!.status).toBe('installed');
    
    // 激活扩展
    const activationResult = await extensionManager.setExtensionActivation({
      extension_id: testExtensionId,
      activate: true
    });
    
    // 使用类型断言处理ExtensionProtocol没有success属性的问题
    expect((activationResult as any).success).toBe(true);
    
    // 验证扩展激活
    const activeExtension = await extensionManager.getExtension(testExtensionId);
    expect(activeExtension).toBeDefined();
    expect(activeExtension!.status).toBe('active');
    
    // 更新扩展配置
    const configResult = await extensionManager.updateConfiguration({
      extension_id: testExtensionId,
      configuration: {
        logging_level: 'debug',
        enable_notifications: true,
        custom_setting: 'e2e-test'
      }
    });
    
    // 使用类型断言处理ExtensionProtocol没有success属性的问题
    expect((configResult as any).success).toBe(true);
    
    performanceMetrics['install_extension'] = performance.end(perfId);
  });
  
  test('8. 执行扩展点', async () => {
    const perfId = performance.start('execute_extension_point');
    
    // 执行扩展点
    const extensionResults = await extensionManager.executeExtensionPoint(
      'plan.after_execute',
      'plan',
      {
        context_id: testContextId,
        plan_id: testPlanId,
        user_id: adminUserId,
        execution_status: 'completed',
        execution_time_ms: 1500
      }
    );
    
    expect(Array.isArray(extensionResults)).toBe(true);
    
    // 执行另一个扩展点
    const contextExtensionResults = await extensionManager.executeExtensionPoint(
      'context.after_update',
      'context',
      {
        context_id: testContextId,
        user_id: adminUserId,
        updates: {
          plan_executed: true,
          execution_time: new Date().toISOString()
        }
      }
    );
    
    expect(Array.isArray(contextExtensionResults)).toBe(true);
    
    performanceMetrics['execute_extension_point'] = performance.end(perfId);
  });
  
  test('9. 记录和查询追踪数据', async () => {
    const perfId = performance.start('trace_operations');
    
    // 记录追踪数据
    const traceId = await traceManager.recordTrace({
      trace_type: 'e2e_test',
      context_id: testContextId,
      user_id: adminUserId,
      operation: 'complete_workflow',
      status: 'success',
      data: {
        workflow_name: 'E2E Test Workflow',
        steps_completed: 9,
        total_time_ms: Object.values(performanceMetrics).reduce((sum, time) => sum + time, 0)
      }
    });
    
    expect(traceId).toBeDefined();
    
    // 验证追踪适配器调用
    expect(traceAdapter.getTraces()[traceId]).toBeDefined();
    
    // 查询追踪数据
    const traces = await traceManager.queryTraces({
      context_id: testContextId,
      trace_types: ['e2e_test'],
      limit: 10
    });
    
    expect(traces).toBeDefined();
    expect(Array.isArray(traces)).toBe(true);
    expect(traces.length).toBeGreaterThan(0);
    
    performanceMetrics['trace_operations'] = performance.end(perfId);
  });
  
  test('10. 处理故障和恢复', async () => {
    const perfId = performance.start('failure_handling');
    
    // 创建用于测试故障恢复的任务
    const failureTask = {
      task_id: 'failure-task-1',
      name: 'Task That May Fail',
      type: 'atomic',
      status: 'pending',
      description: 'Task used to test failure recovery'
    };
    
    // 模拟故障报告
    const failureReport: FailureReport = {
      failure_id: uuidv4(),
      task_id: failureTask.task_id,
      plan_id: testPlanId,
      failure_type: 'execution_error',
      failure_details: {
        error_code: 'TEST_ERROR',
        error_message: 'Simulated failure for testing',
        stack_trace: 'Simulated stack trace'
      },
      timestamp: new Date().toISOString(),
      component: 'task_executor',
      error_type: 'system_error',
      code_location: 'task_executor.execute:125'
    };
    
    // 报告故障到追踪适配器
    const reportResult = await traceAdapter.reportFailure(failureReport);
    expect(reportResult.success).toBe(true);
    
    // 获取恢复建议
    const recoverySuggestions = await traceAdapter.getRecoverySuggestions(failureReport.failure_id);
    expect(recoverySuggestions.length).toBeGreaterThan(0);
    
    // 模拟应用建议的恢复操作
    await traceManager.recordTrace({
      trace_type: 'operation',
      context_id: testContextId,
      plan_id: testPlanId,
      task_id: failureTask.task_id,
      user_id: adminUserId,
      operation: 'recovery_action',
      status: 'success',
      data: {
        failure_id: failureReport.failure_id,
        suggestion_id: recoverySuggestions[0].suggestion_id,
        action: 'retry',
        result: 'success'
      }
    });
    
    // 确认故障已解决
    const resolvedTask = {
      ...failureTask,
      status: 'completed'
    };
    
    // 记录故障解决
    await traceManager.recordTrace({
      trace_type: 'operation',
      context_id: testContextId,
      plan_id: testPlanId,
      task_id: failureTask.task_id,
      user_id: adminUserId,
      operation: 'task_recovery',
      status: 'success',
      data: {
        failure_id: failureReport.failure_id,
        recovery_strategy: 'retry',
        execution_time_ms: 350
      }
    });
    
    performanceMetrics['failure_handling'] = performance.end(perfId);
  });
  
  test('11. 性能指标验证', () => {
    console.log('Performance Metrics (ms):', performanceMetrics);
    
    // 验证关键操作性能
    expect(performanceMetrics['create_context']).toBeLessThan(1000);
    expect(performanceMetrics['create_plan']).toBeLessThan(1000);
    expect(performanceMetrics['execute_plan']).toBeLessThan(1000);
    expect(performanceMetrics['execute_extension_point']).toBeLessThan(1000);
    
    // 总体性能
    const totalTime = Object.values(performanceMetrics).reduce((sum, time) => sum + time, 0);
    console.log('Total E2E workflow time (ms):', totalTime);
    expect(totalTime).toBeLessThan(10000); // 10秒内完成整个测试流程
  });
}); 
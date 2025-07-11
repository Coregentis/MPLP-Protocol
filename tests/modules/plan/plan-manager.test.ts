/**
 * Plan模块管理器测试
 * 
 * @version v1.0.0
 * @created 2025-07-10T08:50:00+08:00
 * @compliance .cursor/rules/testing-strategy.mdc - Plan模块测试规范
 * @compliance .cursor/rules/performance-standards.mdc - Plan性能测试要求
 * @tracepilot_integration Plan模块测试追踪 - 增强版TracePilot
 */

import { PlanManager } from '../../../src/modules/plan/plan-manager';
import { PlanConfiguration, Task, TaskStatus, TaskPriority } from '../../../src/modules/plan/types';
import { EnhancedTracePilotAdapter } from '../../../src/mcp/enhanced-tracepilot-adapter';

describe('PlanManager', () => {
  let planManager: PlanManager;
  let mockTracePilotAdapter: jest.Mocked<EnhancedTracePilotAdapter>;
  let defaultConfig: PlanConfiguration;

  beforeEach(() => {
    // 创建增强版TracePilot适配器Mock
    mockTracePilotAdapter = {
      syncTraceData: jest.fn().mockResolvedValue({
        success: true,
        sync_latency: 10,
        traces_synced: 1,
        errors: [],
        timestamp: new Date().toISOString()
      }),
      addToBatch: jest.fn().mockResolvedValue(undefined),
      detectDevelopmentIssues: jest.fn().mockResolvedValue([]),
      generateSuggestions: jest.fn().mockResolvedValue([]),
      autoFix: jest.fn().mockResolvedValue(true),
      getIssueReport: jest.fn().mockReturnValue({
        total_issues: 0,
        by_severity: {},
        by_type: {},
        recent_issues: []
      }),
      on: jest.fn(),
      emit: jest.fn(),
      stop: jest.fn()
    } as any;

    // 默认配置
    defaultConfig = {
      auto_scheduling_enabled: true,
      dependency_validation_enabled: true,
      resource_optimization_enabled: true,
      progress_tracking_enabled: true,
      notification_settings: {
        task_completion: true,
        milestone_reached: true,
        deadline_approaching: true,
        blocking_issues: true
      },
      retry_policy: {
        max_retries: 3,
        retry_delay_ms: 1000,
        exponential_backoff: true
      },
      parallel_execution_limit: 5
    };

    planManager = new PlanManager(defaultConfig, mockTracePilotAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlan', () => {
    it('应该成功创建计划', async () => {
      const result = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.title).toBe('Test Plan');
      expect(result.data!.description).toBe('Test Description');
      expect(result.data!.owner_id).toBe('user-123');
      expect(result.data!.context_id).toBe('ctx-123');
      expect(result.data!.status).toBe('draft');
      expect(result.operation_time_ms).toBeLessThan(10); // 性能要求<10ms
    });

    it('应该同步到TracePilot', async () => {
      await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Plan.plan_created',
          context_id: expect.any(String),
          trace_type: 'operation',
          status: 'completed'
        })
      );
    });
  });

  describe('addTask', () => {
    let planId: string;

    beforeEach(async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );
      planId = planResult.data!.plan_id;
    });

    it('应该成功添加任务', async () => {
      const result = await planManager.addTask(
        planId,
        'Test Task',
        'Test Task Description',
        'high',
        'user-456'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.title).toBe('Test Task');
      expect(result.data!.priority).toBe('high');
      expect(result.data!.assignee_id).toBe('user-456');
      expect(result.data!.status).toBe('pending');
      expect(result.operation_time_ms).toBeLessThan(10); // 性能要求<10ms
    });

    it('应该处理父子任务关系', async () => {
      const parentResult = await planManager.addTask(
        planId,
        'Parent Task',
        'Parent Description'
      );
      const parentTaskId = parentResult.data!.task_id;

      const childResult = await planManager.addTask(
        planId,
        'Child Task',
        'Child Description',
        'medium',
        'user-456',
        parentTaskId
      );

      expect(childResult.success).toBe(true);
      expect(childResult.data!.parent_task_id).toBe(parentTaskId);
    });
  });

  describe('addDependency', () => {
    let planId: string;
    let sourceTaskId: string;
    let targetTaskId: string;

    beforeEach(async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );
      planId = planResult.data!.plan_id;

      const sourceResult = await planManager.addTask(
        planId,
        'Source Task',
        'Source Description'
      );
      sourceTaskId = sourceResult.data!.task_id;

      const targetResult = await planManager.addTask(
        planId,
        'Target Task',
        'Target Description'
      );
      targetTaskId = targetResult.data!.task_id;
    });

    it('应该成功添加依赖关系', async () => {
      const result = await planManager.addDependency(
        sourceTaskId,
        targetTaskId,
        'sequential'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.source_task_id).toBe(sourceTaskId);
      expect(result.data!.target_task_id).toBe(targetTaskId);
      expect(result.data!.dependency_type).toBe('sequential');
    });

    it('应该检测循环依赖', async () => {
      // 创建第三个任务
      const thirdResult = await planManager.addTask(
        planId,
        'Third Task',
        'Third Description'
      );
      const thirdTaskId = thirdResult.data!.task_id;

      // 创建链式依赖：A -> B -> C
      await planManager.addDependency(sourceTaskId, targetTaskId, 'sequential');
      await planManager.addDependency(targetTaskId, thirdTaskId, 'sequential');

      // 尝试创建循环依赖：C -> A
      const result = await planManager.addDependency(
        thirdTaskId,
        sourceTaskId,
        'sequential'
      );

      expect(result.success).toBe(false);
      expect(result.error_code).toBe('CYCLIC_DEPENDENCY');
    });
  });

  describe('updateTaskStatus', () => {
    let planId: string;
    let taskId: string;

    beforeEach(async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );
      planId = planResult.data!.plan_id;

      const taskResult = await planManager.addTask(
        planId,
        'Test Task',
        'Test Description'
      );
      taskId = taskResult.data!.task_id;
    });

    it('应该成功更新任务状态', async () => {
      const result = await planManager.updateTaskStatus(
        taskId,
        'in_progress'
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('in_progress');
      expect(result.data!.started_at).toBeDefined();
    });

    it('应该在完成时设置完成时间', async () => {
      const result = await planManager.updateTaskStatus(
        taskId,
        'completed',
        { result: 'success' }
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('completed');
      expect(result.data!.completed_at).toBeDefined();
      expect(result.data!.result_data).toEqual({ result: 'success' });
    });

    it('应该在失败时设置错误信息', async () => {
      const result = await planManager.updateTaskStatus(
        taskId,
        'failed',
        undefined,
        'Task execution failed'
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('failed');
      expect(result.data!.error_message).toBe('Task execution failed');
    });
  });

  describe('resolveFailedTask', () => {
    let planId: string;
    let taskId: string;

    beforeEach(async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );
      planId = planResult.data!.plan_id;

      const taskResult = await planManager.addTask(
        planId,
        'Test Task',
        'Test Description'
      );
      taskId = taskResult.data!.task_id;

      // 设置任务为失败状态
      await planManager.updateTaskStatus(
        taskId,
        'failed',
        undefined,
        'Test failure'
      );
    });

    it('应该成功重试失败任务', async () => {
      const result = await planManager.resolveFailedTask(
        taskId,
        'retry',
        { maxRetries: 2 }
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('ready');
      expect(result.data!.error_message).toBeUndefined();
      expect(result.data!.metadata.retry_count).toBe(1);
      expect(result.operation_time_ms).toBeLessThan(10); // 性能要求<10ms
    });

    it('应该成功回滚失败任务', async () => {
      const result = await planManager.resolveFailedTask(
        taskId,
        'rollback'
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('cancelled');
      expect(result.data!.metadata.rollback_reason).toBe('task_failure');
    });

    it('应该成功跳过失败任务', async () => {
      const result = await planManager.resolveFailedTask(
        taskId,
        'skip'
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('cancelled');
      expect(result.data!.metadata.skip_reason).toBe('task_failure');
    });

    it('应该成功标记需要人工干预', async () => {
      const result = await planManager.resolveFailedTask(
        taskId,
        'manual_intervention'
      );

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('blocked');
      expect(result.data!.metadata.intervention_required).toBe(true);
      expect(result.data!.metadata.intervention_reason).toBe('task_failure');
    });

    it('应该在超过最大重试次数时失败', async () => {
      // 设置任务已重试3次
      const task = await planManager.getTask(taskId);
      task.data!.metadata.retry_count = 3;

      const result = await planManager.resolveFailedTask(
        taskId,
        'retry',
        { maxRetries: 3 }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeded maximum retry attempts');
    });
  });

  describe('batchResolveFailedTasks', () => {
    let planId: string;
    let taskIds: string[];

    beforeEach(async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );
      planId = planResult.data!.plan_id;

      taskIds = [];
      for (let i = 0; i < 3; i++) {
        const taskResult = await planManager.addTask(
          planId,
          `Test Task ${i}`,
          `Test Description ${i}`
        );
        taskIds.push(taskResult.data!.task_id);

        // 设置任务为失败状态
        await planManager.updateTaskStatus(
          taskResult.data!.task_id,
          'failed',
          undefined,
          `Test failure ${i}`
        );
      }
    });

    it('应该成功批量重试失败任务', async () => {
      const result = await planManager.batchResolveFailedTasks(
        taskIds,
        'retry'
      );

      expect(result.total_targets).toBe(3);
      expect(result.successful_operations).toBe(3);
      expect(result.failed_operations).toBe(0);
      expect(result.operation_time_ms).toBeLessThan(50); // 性能要求<50ms per batch
    });

    it('应该处理部分失败的批量操作', async () => {
      // 设置第一个任务已达到最大重试次数
      const firstTask = await planManager.getTask(taskIds[0]);
      firstTask.data!.metadata.retry_count = 3;

      const result = await planManager.batchResolveFailedTasks(
        taskIds,
        'retry',
        { maxRetries: 3 }
      );

      expect(result.total_targets).toBe(3);
      expect(result.successful_operations).toBe(2);
      expect(result.failed_operations).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('performance requirements', () => {
    it('计划创建应该在10ms内完成', async () => {
      const startTime = Date.now();
      
      await planManager.createPlan(
        'ctx-123',
        'Performance Test Plan',
        'Performance Test Description',
        'user-123'
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10);
    });

    it('任务添加应该在10ms内完成', async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      const startTime = Date.now();
      
      await planManager.addTask(
        planResult.data!.plan_id,
        'Performance Test Task',
        'Performance Test Description'
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10);
    });

    it('失败恢复应该在10ms内完成', async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      const taskResult = await planManager.addTask(
        planResult.data!.plan_id,
        'Test Task',
        'Test Description'
      );

      // 设置任务为失败状态
      await planManager.updateTaskStatus(
        taskResult.data!.task_id,
        'failed',
        undefined,
        'Test failure'
      );

      const startTime = Date.now();
      
      await planManager.resolveFailedTask(
        taskResult.data!.task_id,
        'retry'
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Enhanced TracePilot Integration', () => {
    it('应该正确初始化增强版TracePilot适配器', () => {
      expect(mockTracePilotAdapter.on).toHaveBeenCalledWith('issue_detected', expect.any(Function));
      expect(mockTracePilotAdapter.on).toHaveBeenCalledWith('auto_fix_applied', expect.any(Function));
    });

    it('应该提供任务追踪报告', () => {
      const report = planManager.getTaskTrackingReport();
      
      expect(report).toHaveProperty('total_trackers');
      expect(report).toHaveProperty('by_status');
      expect(report).toHaveProperty('by_module');
      expect(report).toHaveProperty('recent_issues');
    });

    it('应该在TracePilot检测到问题时创建追踪器', () => {
      // 模拟问题检测事件
      const mockIssue = {
        id: 'test-issue-1',
        type: 'incomplete_implementation',
        severity: 'high',
        title: 'Test Issue',
        description: 'Test Description',
        suggested_solution: 'Test Solution',
        auto_fixable: true,
        dependencies: [],
        created_at: new Date().toISOString(),
        status: 'open',
        file_path: 'src/modules/plan/test.ts'
      };

      // 获取事件监听器
      const issueDetectedCallback = (mockTracePilotAdapter.on as jest.Mock).mock.calls
        .find(call => call[0] === 'issue_detected')[1];

      // 触发问题检测事件
      issueDetectedCallback(mockIssue);

      // 验证追踪器是否被创建
      const report = planManager.getTaskTrackingReport();
      expect(report.total_trackers).toBe(1);
      expect(report.by_module.plan).toBe(1);
    });
  });

  describe('TracePilot integration', () => {
    it('应该在创建计划时同步到TracePilot', async () => {
      await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Plan.plan_created',
          trace_type: 'operation',
          status: 'completed',
          tracepilot_metadata: expect.objectContaining({
            agent_id: 'plan-manager',
            operation_complexity: 'medium'
          })
        })
      );
    });

    it('应该在失败恢复时同步到TracePilot', async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      const taskResult = await planManager.addTask(
        planResult.data!.plan_id,
        'Test Task',
        'Test Description'
      );

      await planManager.updateTaskStatus(
        taskResult.data!.task_id,
        'failed',
        undefined,
        'Test failure'
      );

      // 清除之前的调用
      mockTracePilotAdapter.syncTraceData.mockClear();

      await planManager.resolveFailedTask(
        taskResult.data!.task_id,
        'retry'
      );

      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Plan.task_failure_resolved',
          trace_type: 'operation',
          status: 'completed'
        })
      );
    });
  });

  describe('edge cases', () => {
    it('应该处理不存在的计划', async () => {
      const result = await planManager.getPlan('non-existent-plan');
      
      expect(result.success).toBe(false);
      expect(result.error_code).toBe('PLAN_NOT_FOUND');
    });

    it('应该处理不存在的任务', async () => {
      const result = await planManager.getTask('non-existent-task');
      
      expect(result.success).toBe(false);
      expect(result.error_code).toBe('TASK_NOT_FOUND');
    });

    it('应该处理对非失败任务的失败恢复', async () => {
      const planResult = await planManager.createPlan(
        'ctx-123',
        'Test Plan',
        'Test Description',
        'user-123'
      );

      const taskResult = await planManager.addTask(
        planResult.data!.plan_id,
        'Test Task',
        'Test Description'
      );

      const result = await planManager.resolveFailedTask(
        taskResult.data!.task_id,
        'retry'
      );

      expect(result.success).toBe(false);
      expect(result.error_code).toBe('TASK_NOT_FAILED');
    });
  });
}); 
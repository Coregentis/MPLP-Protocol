/**
 * MPLP Phase 1 模块集成测试
 * 
 * @version v1.0.0
 * @created 2025-07-09T24:00:00+08:00
 * @compliance .cursor/rules/testing-standards.mdc - 集成测试规范
 * @tracepilot_integration 验证完整的TracePilot集成链路
 */

import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { ContextManager } from '@/modules/context';
import { PlanManager } from '@/modules/plan';
import { EnhancedTraceManager } from '@/modules/trace/enhanced-trace-manager';
import { TracePilotAdapter } from '@/mcp/tracepilot-adapter';
import { createDefaultContextConfig } from '@/modules/context/utils';
import { createDefaultTraceConfig } from '@/modules/trace/utils';
import type { PlanConfiguration } from '@/modules/plan/types';
import type { EnhancedTraceConfig } from '@/modules/trace/enhanced-trace-manager';

describe('MPLP Phase 1 - 核心模块集成测试', () => {
  let contextManager: ContextManager;
  let planManager: PlanManager;
  let traceManager: EnhancedTraceManager;
  let mockTracePilotAdapter: jest.Mocked<TracePilotAdapter>;

  beforeAll(() => {
    // 创建TracePilot适配器模拟
    mockTracePilotAdapter = {
      syncTraceData: jest.fn().mockResolvedValue({
        success: true,
        sync_latency: 25,
        traces_synced: 1,
        errors: [],
        timestamp: new Date().toISOString()
      }),
      addToBatch: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(true),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    } as any;
  });

  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();

    // 初始化Context模块
    const contextConfig = createDefaultContextConfig();
    contextConfig.auto_cleanup_enabled = false;
    contextManager = new ContextManager(contextConfig, mockTracePilotAdapter);

    // 初始化Plan模块
    const planConfig: PlanConfiguration = {
      auto_scheduling_enabled: false,
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
      parallel_execution_limit: 10
    };
    planManager = new PlanManager(planConfig, mockTracePilotAdapter);

    // 初始化Trace模块
    const traceConfig: EnhancedTraceConfig = {
      auto_sync_enabled: true,
      batch_processing_enabled: true,
      real_time_monitoring_enabled: true,
      max_trace_buffer_size: 1000,
      sync_interval_ms: 5000,
      retention_days: 30,
      tracepilot_sync_enabled: true,
      tracepilot_batch_size: 50,
      tracepilot_sync_timeout_ms: 3000,
      context_integration_enabled: true,
      plan_integration_enabled: true,
      performance_threshold_ms: 100,
      error_rate_threshold: 5,
      alert_on_anomaly: true
    };
    traceManager = new EnhancedTraceManager(traceConfig, mockTracePilotAdapter);
  });

  afterEach(() => {
    // 清理事件监听器
    contextManager.removeAllListeners();
    planManager.removeAllListeners();
    traceManager.removeAllListeners();
  });

  describe('🔄 完整工作流程集成测试', () => {
    it('应该支持完整的Context -> Plan -> Task工作流程', async () => {
      // 1. 创建Context
      const contextResult = await contextManager.createContext('user-integration-test', 'agent-test');
      expect(contextResult.success).toBe(true);
      const contextId = contextResult.data!.context_id;

      // 验证TracePilot同步
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_name: 'Context.context_created'
        })
      );

      // 2. 在Context中设置共享状态
      const stateResult = await contextManager.setSharedState(
        contextId,
        'project_config',
        { name: 'MPLP Integration Test', version: '1.0.0' },
        'object'
      );
      expect(stateResult.success).toBe(true);

      // 3. 创建Plan
      const planResult = await planManager.createPlan(
        contextId,
        'MPLP集成测试计划',
        '验证Context、Plan、Trace模块的集成功能',
        'user-integration-test'
      );
      expect(planResult.success).toBe(true);
      const planId = planResult.data!.plan_id;

      // 4. 添加任务到Plan
      const task1Result = await planManager.addTask(
        planId,
        '初始化Context',
        '设置项目配置和共享状态',
        'high',
        'user-integration-test'
      );
      expect(task1Result.success).toBe(true);
      const task1Id = task1Result.data!.task_id;

      const task2Result = await planManager.addTask(
        planId,
        '执行主要功能',
        '执行项目的主要功能实现',
        'high',
        'user-integration-test'
      );
      expect(task2Result.success).toBe(true);
      const task2Id = task2Result.data!.task_id;

      // 5. 添加任务依赖
      const depResult = await planManager.addDependency(task1Id, task2Id, 'sequential');
      expect(depResult.success).toBe(true);

      // 6. 创建追踪记录
      const traceResult = await traceManager.createTrace(
        'Integration',
        'complete_workflow',
        contextId,
        planId,
        task1Id
      );
      expect(traceResult.success).toBe(true);
      const traceId = traceResult.data!.trace_id;

      // 7. 执行任务流程
      await planManager.updateTaskStatus(task1Id, 'in_progress');
      await planManager.updateTaskStatus(task1Id, 'completed', { result: 'Context initialized' });

      await planManager.updateTaskStatus(task2Id, 'in_progress');
      await planManager.updateTaskStatus(task2Id, 'completed', { result: 'Main functionality executed' });

      // 8. 完成追踪
      await traceManager.completeTrace(traceId, 'completed', undefined, {
        workflow_completed: true,
        tasks_completed: 2
      });

      // 验证最终状态
      const finalContext = await contextManager.getContext(contextId);
      const finalPlan = await planManager.getPlan(planId);
      
      expect(finalContext.success).toBe(true);
      expect(finalPlan.success).toBe(true);
      expect(finalPlan.data!.progress_summary.completed_tasks).toBe(2);
      expect(finalPlan.data!.progress_summary.overall_progress_percentage).toBe(100);

      // 验证TracePilot同步调用次数
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalledTimes(8); // Context + SharedState + Plan + 2Tasks + Dependency + 2Traces
    });

    it('应该正确处理跨模块的错误传播', async () => {
      // 创建Context
      const contextResult = await contextManager.createContext('error-test-user');
      const contextId = contextResult.data!.context_id;

      // 创建Plan
      const planResult = await planManager.createPlan(
        contextId,
        '错误处理测试计划',
        '测试跨模块错误传播',
        'error-test-user'
      );
      const planId = planResult.data!.plan_id;

      // 添加任务
      const taskResult = await planManager.addTask(
        planId,
        '会失败的任务',
        '故意失败以测试错误处理',
        'high'
      );
      const taskId = taskResult.data!.task_id;

      // 创建追踪
      const traceResult = await traceManager.createTrace(
        'ErrorTest',
        'failing_operation',
        contextId,
        planId,
        taskId
      );
      const traceId = traceResult.data!.trace_id;

      // 模拟任务失败
      await planManager.updateTaskStatus(taskId, 'in_progress');
      await planManager.updateTaskStatus(taskId, 'failed', undefined, 'Simulated task failure');

      // 完成追踪记录错误
      await traceManager.completeTrace(traceId, 'failed', 'Task execution failed');

      // 验证错误状态传播
      const finalTask = await planManager.getTask(taskId);
      expect(finalTask.success).toBe(true);
      expect(finalTask.data!.status).toBe('failed');
      expect(finalTask.data!.error_message).toBe('Simulated task failure');

      // 验证Plan状态更新
      const finalPlan = await planManager.getPlan(planId);
      expect(finalPlan.data!.progress_summary.failed_tasks).toBe(1);

      // 验证Trace错误记录
      const traceQuery = await traceManager.queryTraces({
        plan_ids: [planId],
        has_errors: true
      });
      expect(traceQuery.success).toBe(true);
      expect(traceQuery.data!.length).toBe(1);
      expect(traceQuery.data![0].status).toBe('failed');
    });
  });

  describe('📊 性能和追踪集成测试', () => {
    it('所有模块操作应该满足性能目标', async () => {
      const performanceResults = [];

      // Context性能测试
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const result = await contextManager.createContext(`perf-user-${i}`);
        const duration = performance.now() - startTime;
        
        performanceResults.push({ module: 'Context', operation: 'create', duration });
        expect(result.operation_time_ms).toBeLessThan(5); // Context目标: <5ms
        expect(duration).toBeLessThan(50); // 总体响应时间
      }

      // Plan性能测试
      const contextResult = await contextManager.createContext('plan-perf-user');
      const contextId = contextResult.data!.context_id;

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const result = await planManager.createPlan(
          contextId,
          `性能测试计划${i}`,
          '性能测试计划',
          'plan-perf-user'
        );
        const duration = performance.now() - startTime;
        
        performanceResults.push({ module: 'Plan', operation: 'create', duration });
        expect(result.operation_time_ms).toBeLessThan(10); // Plan目标: <10ms
        expect(duration).toBeLessThan(100);
      }

      // Trace性能测试
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const result = await traceManager.createTrace(
          'Performance',
          `test_operation_${i}`,
          contextId
        );
        const duration = performance.now() - startTime;
        
        performanceResults.push({ module: 'Trace', operation: 'create', duration });
        expect(result.operation_time_ms).toBeLessThan(2); // Trace目标: <2ms
        expect(duration).toBeLessThan(50);
      }

      // 打印性能统计
      const avgByModule = performanceResults.reduce((acc, result) => {
        const key = `${result.module}.${result.operation}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(result.duration);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(avgByModule).forEach(([operation, durations]) => {
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        console.log(`${operation} 平均响应时间: ${avg.toFixed(2)}ms`);
      });
    });

    it('应该正确收集和报告模块统计信息', async () => {
      // 创建一些测试数据
      const contextResult = await contextManager.createContext('stats-test-user');
      const contextId = contextResult.data!.context_id;

      await contextManager.setSharedState(contextId, 'test1', 'value1', 'string');
      await contextManager.setSharedState(contextId, 'test2', 'value2', 'string');

      const planResult = await planManager.createPlan(contextId, '统计测试计划', '测试统计功能', 'stats-test-user');
      const planId = planResult.data!.plan_id;

      await planManager.addTask(planId, '任务1', '描述1', 'high');
      await planManager.addTask(planId, '任务2', '描述2', 'medium');

      await traceManager.createTrace('Stats', 'test_operation', contextId, planId);

      // 获取统计信息
      const contextStats = contextManager.getModuleStats();
      const planStats = planManager.getModuleStats();
      const traceStats = traceManager.getModuleStats();

      // 验证统计信息
      expect(contextStats.total_contexts).toBeGreaterThan(0);
      expect(contextStats.total_shared_state_items).toBe(2);

      expect(planStats.total_plans).toBeGreaterThan(0);
      expect(planStats.total_tasks).toBe(2);

      expect(traceStats.total_traces).toBeGreaterThan(0);

      console.log('模块统计信息:', {
        context: contextStats,
        plan: planStats,
        trace: traceStats
      });
    });
  });

  describe('🔗 TracePilot集成验证', () => {
    it('应该在所有关键操作中正确同步TracePilot数据', async () => {
      // 创建完整的工作流程
      const contextResult = await contextManager.createContext('tracepilot-test-user');
      const contextId = contextResult.data!.context_id;

      const planResult = await planManager.createPlan(contextId, 'TracePilot测试', '验证TracePilot集成', 'tracepilot-test-user');
      const planId = planResult.data!.plan_id;

      const taskResult = await planManager.addTask(planId, 'TracePilot任务', 'TracePilot集成测试任务', 'high');
      const taskId = taskResult.data!.task_id;

      const traceResult = await traceManager.createTrace('TracePilot', 'integration_test', contextId, planId, taskId);
      const traceId = traceResult.data!.trace_id;

      await traceManager.completeTrace(traceId, 'completed');

      // 验证TracePilot同步调用
      const syncCalls = mockTracePilotAdapter.syncTraceData.mock.calls;
      
      // 应该包含所有模块的同步调用
      const contextCalls = syncCalls.filter(call => 
        call[0].operation_name.startsWith('Context.')
      );
      const planCalls = syncCalls.filter(call => 
        call[0].operation_name.startsWith('Plan.')
      );
      const traceCalls = syncCalls.filter(call => 
        call[0].operation_name.startsWith('TracePilot.')
      );

      expect(contextCalls.length).toBeGreaterThan(0);
      expect(planCalls.length).toBeGreaterThan(0);
      expect(traceCalls.length).toBeGreaterThan(0);

      // 验证同步数据格式
      syncCalls.forEach(call => {
        const traceData = call[0];
        expect(traceData).toHaveProperty('trace_id');
        expect(traceData).toHaveProperty('operation_name');
        expect(traceData).toHaveProperty('performance_metrics');
        expect(traceData).toHaveProperty('tags');
        expect(traceData.tags).toHaveProperty('module');
      });

      console.log(`TracePilot同步调用总数: ${syncCalls.length}`);
      console.log('同步操作分布:', {
        context: contextCalls.length,
        plan: planCalls.length,
        trace: traceCalls.length
      });
    });

    it('TracePilot同步失败不应该影响正常业务功能', async () => {
      // 模拟TracePilot同步失败
      mockTracePilotAdapter.syncTraceData.mockRejectedValue(new Error('TracePilot服务不可用'));

      // 执行正常业务流程
      const contextResult = await contextManager.createContext('resilience-test-user');
      expect(contextResult.success).toBe(true); // 应该仍然成功

      const planResult = await planManager.createPlan(
        contextResult.data!.context_id,
        '韧性测试计划',
        '测试TracePilot故障情况下的系统韧性',
        'resilience-test-user'
      );
      expect(planResult.success).toBe(true); // 应该仍然成功

      const taskResult = await planManager.addTask(
        planResult.data!.plan_id,
        '韧性测试任务',
        '测试任务',
        'medium'
      );
      expect(taskResult.success).toBe(true); // 应该仍然成功

      // 验证TracePilot调用确实失败了，但业务功能正常
      expect(mockTracePilotAdapter.syncTraceData).toHaveBeenCalled();
    });
  });

  describe('🎭 事件系统集成测试', () => {
    it('应该正确传播跨模块事件', (done) => {
      let eventCount = 0;
      const expectedEvents = 3; // Context、Plan、Trace各一个事件

      const checkComplete = () => {
        eventCount++;
        if (eventCount === expectedEvents) {
          done();
        }
      };

      // 监听各模块事件
      contextManager.on('context_event', (event) => {
        expect(event).toHaveProperty('event_type');
        expect(event).toHaveProperty('context_id');
        checkComplete();
      });

      planManager.on('plan_event', (event) => {
        expect(event).toHaveProperty('event_type');
        expect(event).toHaveProperty('plan_id');
        checkComplete();
      });

      traceManager.on('trace_event', (event) => {
        expect(event).toHaveProperty('event_type');
        expect(event).toHaveProperty('trace_id');
        checkComplete();
      });

      // 触发事件
      contextManager.createContext('event-test-user').then(contextResult => {
        const contextId = contextResult.data!.context_id;
        
        planManager.createPlan(contextId, '事件测试计划', '测试事件传播', 'event-test-user').then(planResult => {
          const planId = planResult.data!.plan_id;
          
          traceManager.createTrace('Event', 'test_event', contextId, planId);
        });
      });
    });
  });

  describe('💾 数据一致性测试', () => {
    it('应该在跨模块操作中维护数据一致性', async () => {
      // 创建关联数据
      const contextResult = await contextManager.createContext('consistency-test-user');
      const contextId = contextResult.data!.context_id;

      const planResult = await planManager.createPlan(contextId, '一致性测试计划', '测试数据一致性', 'consistency-test-user');
      const planId = planResult.data!.plan_id;

      const taskResult = await planManager.addTask(planId, '一致性测试任务', '测试任务', 'high');
      const taskId = taskResult.data!.task_id;

      // 验证关联数据的一致性
      const context = await contextManager.getContext(contextId);
      const plan = await planManager.getPlan(planId);
      const task = await planManager.getTask(taskId);

      expect(context.success).toBe(true);
      expect(plan.success).toBe(true);
      expect(task.success).toBe(true);

      // 验证引用关系
      expect(plan.data!.context_id).toBe(contextId);
      expect(task.data!.plan_id).toBe(planId);
      expect(plan.data!.task_ids).toContain(taskId);

      // 查询追踪数据验证一致性
      const traces = await traceManager.queryTraces({
        context_ids: [contextId],
        plan_ids: [planId]
      });
      
      expect(traces.success).toBe(true);
      // 验证追踪数据中的关联ID正确
      traces.data!.forEach(trace => {
        expect(trace.context_id).toBe(contextId);
        if (trace.tags?.plan_id && trace.tags.plan_id !== 'none') {
          expect(trace.tags.plan_id).toBe(planId);
        }
      });
    });
  });
}); 
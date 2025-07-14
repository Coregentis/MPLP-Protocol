/**
 * MPLP 模块集成测试 - Plan与Trace模块集成
 * 
 * @version v1.0.0
 * @created 2025-07-12T20:00:00+08:00
 * @compliance plan-protocol.json, trace-protocol.json Schema v1.0.0 - 100%合规
 * @description 测试Plan模块的failure-resolver功能与Trace模块的集成，验证故障处理和追踪机制
 */

import { expect } from '@jest/globals';
import { PlanManager } from '../../../src/modules/plan/plan-manager';
import { FailureResolver } from '../../../src/modules/plan/failure-resolver';
import { TraceService } from '../../../src/modules/trace/trace-service';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { PlanProtocol, TaskStatus } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

// 模拟TraceAdapter
const mockTraceAdapter: jest.Mocked<ITraceAdapter> = {
  syncTraceData: jest.fn().mockResolvedValue({ success: true }),
  syncBatch: jest.fn().mockResolvedValue({ success: true }),
  reportFailure: jest.fn().mockResolvedValue({ success: true }),
  checkHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
  getAdapterInfo: jest.fn().mockReturnValue({ type: 'mock-adapter', version: '1.0.0' }),
  getRecoverySuggestions: jest.fn().mockResolvedValue([
    {
      suggestion_id: 'sugg-1',
      action: 'retry',
      description: 'Retry the task with increased timeout',
      confidence: 0.95
    },
    {
      suggestion_id: 'sugg-2',
      action: 'skip',
      description: 'Skip the task and continue',
      confidence: 0.75
    }
  ]),
  detectDevelopmentIssues: jest.fn().mockResolvedValue({
    issues: [],
    confidence: 1.0
  }),
  getAnalytics: jest.fn().mockResolvedValue({})
};

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 创建测试计划
function createTestPlan(): PlanProtocol {
  return {
    plan_id: uuidv4(),
    context_id: uuidv4(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    name: 'Test Plan',
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
      },
      {
        task_id: 'task-3',
        name: 'Task 3',
        type: 'atomic',
        status: 'pending',
        dependencies: ['task-2']
      }
    ],
    workflow: {
      execution_strategy: 'sequential'
    }
  };
}

// 测试任务执行器
class TestTaskExecutor {
  private failOnTaskId?: string;
  
  constructor(failOnTaskId?: string) {
    this.failOnTaskId = failOnTaskId;
  }
  
  async executeTask(task: any): Promise<any> {
    if (task.task_id === this.failOnTaskId) {
      throw new Error(`Task execution failed for ${task.name}`);
    }
    return {
      status: 'completed',
      result: { success: true }
    };
  }
}

describe('Plan与Trace模块集成测试', () => {
  let planManager: PlanManager;
  let traceService: TraceService;
  let failureResolver: FailureResolver;
  
  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    
    // 创建TraceService实例
    traceService = new TraceService(mockTraceAdapter);
    
    // 创建FailureResolver实例
    failureResolver = new FailureResolver(traceService);
    
    // 创建PlanManager实例
    planManager = new PlanManager(failureResolver);
  });
  
  test('正常执行计划应生成完整的追踪记录', async () => {
    // 创建测试计划
    const plan = createTestPlan();
    
    // 创建任务执行器（不失败）
    const taskExecutor = new TestTaskExecutor();
    
    // 执行计划
    const result = await planManager.executePlan(plan, taskExecutor);
    
    // 验证计划执行结果
    expect(result.success).toBe(true);
    expect(result.completed_tasks).toBe(3);
    expect(result.failed_tasks).toBe(0);
    
    // 验证追踪记录创建
    expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledTimes(3); // 每个任务一个追踪记录
    
    // 检查参数 - 验证记录了任务执行情况
    const syncCalls = mockTraceAdapter.syncTraceData.mock.calls;
    expect(syncCalls[0][0]).toMatchObject({
      operation_type: 'task_execution',
      status: 'completed',
      context_id: plan.context_id,
      plan_id: plan.plan_id
    });
  });
  
  test('任务执行失败时应触发故障处理和故障报告', async () => {
    // 创建测试计划
    const plan = createTestPlan();
    
    // 创建任务执行器（让task-2失败）
    const taskExecutor = new TestTaskExecutor('task-2');
    
    // 执行计划
    const result = await planManager.executePlan(plan, taskExecutor);
    
    // 验证计划执行结果
    expect(result.success).toBe(false);
    expect(result.completed_tasks).toBe(1); // 只有task-1完成了
    expect(result.failed_tasks).toBe(1); // task-2失败了
    expect(result.pending_tasks).toBe(1); // task-3未执行
    
    // 验证追踪记录创建
    expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledTimes(2); // task-1成功，task-2失败
    
    // 验证故障报告
    expect(mockTraceAdapter.reportFailure).toHaveBeenCalled();
    const failureReport = mockTraceAdapter.reportFailure.mock.calls[0][0];
    expect(failureReport).toMatchObject({
      failure_type: 'task_execution_error',
      context_id: plan.context_id,
      plan_id: plan.plan_id,
      task_id: 'task-2'
    });
    
    // 验证请求了恢复建议
    expect(mockTraceAdapter.getRecoverySuggestions).toHaveBeenCalled();
  });
  
  test('失败的计划应能使用恢复建议并重试', async () => {
    // 创建测试计划
    const plan = createTestPlan();
    
    // 首先运行失败的测试
    const failingExecutor = new TestTaskExecutor('task-2');
    const failedResult = await planManager.executePlan(plan, failingExecutor);
    expect(failedResult.success).toBe(false);
    
    // 验证获取了恢复建议
    expect(mockTraceAdapter.getRecoverySuggestions).toHaveBeenCalled();
    
    // 模拟处理故障，现在使用不会失败的执行器
    const recoveryExecutor = new TestTaskExecutor();
    
    // 从失败点重试计划
    const recoveryResult = await planManager.retryPlanFromFailure(plan, failedResult.failure_point, recoveryExecutor);
    
    // 验证恢复成功
    expect(recoveryResult.success).toBe(true);
    expect(recoveryResult.completed_tasks).toBe(3);
    expect(recoveryResult.failed_tasks).toBe(0);
    
    // 验证更新了任务状态
    expect(plan.tasks[0].status).toBe('completed');
    expect(plan.tasks[1].status).toBe('completed');
    expect(plan.tasks[2].status).toBe('completed');
    
    // 验证创建了新的追踪记录（恢复过程）
    expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledTimes(5); // 2次初始(1成功+1失败) + 2次重试(task-2,3) + 1次恢复过程
  });
  
  test('应当能识别和修复依赖关系问题', async () => {
    // 创建一个有循环依赖的计划
    const planWithCircularDep = createTestPlan();
    planWithCircularDep.tasks.push({
      task_id: 'task-4',
      name: 'Task 4',
      type: 'atomic',
      status: 'pending',
      dependencies: ['task-3']
    });
    
    // 添加循环依赖: task-1依赖task-4
    planWithCircularDep.tasks[0].dependencies = ['task-4'];
    
    // 使用PlanManager验证和修复计划
    const validationResult = await planManager.validatePlan(planWithCircularDep);
    
    // 验证发现了问题
    expect(validationResult.valid).toBe(false);
    expect(validationResult.issues).toHaveLength(1);
    expect(validationResult.issues[0].type).toBe('circular_dependency');
    
    // 验证问题已报告给Trace
    expect(mockTraceAdapter.reportFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        failure_type: 'plan_validation_error',
        issue_type: 'circular_dependency'
      })
    );
    
    // 尝试自动修复
    const fixResult = await planManager.autoFixPlan(planWithCircularDep, validationResult.issues);
    
    // 验证修复成功
    expect(fixResult.success).toBe(true);
    expect(fixResult.fixed_issues).toBe(1);
    
    // 验证没有循环依赖了
    const revalidationResult = await planManager.validatePlan(planWithCircularDep);
    expect(revalidationResult.valid).toBe(true);
  });
  
  test('FailureResolver应能基于历史数据生成预防措施', async () => {
    // 设置模拟追踪数据，模拟有任务历史失败
    mockTraceAdapter.getAnalytics.mockResolvedValue({
      task_failure_patterns: [
        {
          task_pattern: 'database_migration',
          failure_rate: 0.75,
          common_errors: ['connection_timeout', 'lock_timeout']
        }
      ]
    });
    
    // 创建一个包含高风险任务的计划
    const plan = createTestPlan();
    plan.tasks.push({
      task_id: 'task-db-migration',
      name: 'Database Migration',
      type: 'atomic',
      status: 'pending'
    });
    
    // 获取预防措施
    const preventionMeasures = await failureResolver.generatePreventiveMeasures(plan);
    
    // 验证生成了预防措施
    expect(preventionMeasures).toBeDefined();
    expect(preventionMeasures.length).toBeGreaterThan(0);
    
    // 验证添加了预防检查点
    const updatedPlan = await failureResolver.applyPreventiveMeasures(plan, preventionMeasures);
    
    // 找到数据库任务是否有预防措施
    const dbTask = updatedPlan.tasks.find(task => task.task_id === 'task-db-migration');
    expect(dbTask).toBeDefined();
    expect(dbTask.pre_execution_checks).toBeDefined();
    expect(dbTask.pre_execution_checks.length).toBeGreaterThan(0);
    
    // 验证生成了追踪记录
    expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledWith(
      expect.objectContaining({
        operation_type: 'preventive_measure_applied',
        plan_id: plan.plan_id
      })
    );
  });
  
  test('应能记录和分析计划执行性能指标', async () => {
    // 创建测试计划
    const plan = createTestPlan();
    const taskExecutor = new TestTaskExecutor();
    
    // 执行计划
    await planManager.executePlan(plan, taskExecutor);
    
    // 获取性能指标
    const metrics = await planManager.getPlanExecutionMetrics(plan.plan_id);
    
    // 验证指标存在
    expect(metrics).toBeDefined();
    expect(metrics.total_execution_time_ms).toBeGreaterThan(0);
    expect(metrics.tasks_metrics).toHaveLength(plan.tasks.length);
    
    // 验证指标已发送到Trace
    expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledWith(
      expect.objectContaining({
        operation_type: 'performance_metrics',
        metrics: expect.anything()
      })
    );
  });
}); 
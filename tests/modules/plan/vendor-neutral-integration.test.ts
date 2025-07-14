/**
 * MPLP Plan模块 - 厂商中立适配器集成测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T16:00:00+08:00
 * @compliance .cursor/rules/test-style.mdc - 集成测试规范
 * @compliance .cursor/rules/test-data.mdc - 测试数据规范
 */

import { v4 as uuidv4 } from 'uuid';
import { FailureResolverManager, FailureResolverConfig } from '../../../src/modules/plan/failure-resolver';
import { PlanManager } from '../../../src/modules/plan/plan-manager';
import { PlanConfiguration, PlanTask, TaskStatus } from '../../../src/modules/plan/types';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../../src/types/trace';

// 创建一个真实的适配器实现
class TestTraceAdapter implements ITraceAdapter {
  private events: Record<string, any[]> = {
    'trace_data': [],
    'failure_reports': [],
    'recovery_suggestions': {},
    'development_issues': []
  };
  private eventHandlers: Record<string, Function[]> = {};
  private isEnhanced: boolean;
  
  constructor(isEnhanced: boolean = false) {
    this.isEnhanced = isEnhanced;
  }
  
  getAdapterInfo(): { type: string; version: string } {
    return {
      type: this.isEnhanced ? 'enhanced-test-adapter' : 'basic-test-adapter',
      version: this.isEnhanced ? '2.0.0' : '1.0.0'
    };
  }
  
  async syncTraceData(traceData: MPLPTraceData): Promise<any> {
    this.events.trace_data.push(traceData);
    this.emit('trace_synced', traceData);
    return { 
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 5,
      errors: []
    };
  }
  
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<any> {
    this.events.trace_data.push(...traceBatch);
    this.emit('batch_synced', traceBatch);
    return { 
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 10,
      errors: []
    };
  }
  
  async reportFailure(failure: any): Promise<any> {
    this.events.failure_reports.push(failure);
    this.emit('failure_reported', failure);
    return { 
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 8,
      errors: []
    };
  }
  
  async checkHealth(): Promise<any> {
    return {
      status: 'healthy',
      last_check: new Date().toISOString(),
      metrics: {
        avg_latency_ms: 5,
        success_rate: 1.0,
        error_rate: 0.0
      }
    };
  }
  
  // 增强型适配器方法
  async getRecoverySuggestions(failureId: string): Promise<any[]> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return this.events.recovery_suggestions[failureId] || [];
  }
  
  async detectDevelopmentIssues(): Promise<any> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return {
      issues: this.events.development_issues,
      confidence: 0.9
    };
  }
  
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return {
      total_traces: this.events.trace_data.length,
      total_failures: this.events.failure_reports.length,
      avg_latency_ms: 15,
      success_rate: 0.95
    };
  }
  
  // 事件处理
  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }
  
  private emit(event: string, data: any): void {
    if (this.eventHandlers[event]) {
      for (const handler of this.eventHandlers[event]) {
        handler(data);
      }
    }
  }
  
  // 测试辅助方法
  addRecoverySuggestion(failureId: string, suggestion: any): void {
    if (!this.events.recovery_suggestions[failureId]) {
      this.events.recovery_suggestions[failureId] = [];
    }
    this.events.recovery_suggestions[failureId].push(suggestion);
  }
  
  addDevelopmentIssue(issue: any): void {
    this.events.development_issues.push(issue);
  }
  
  getCollectedTraceData(): any[] {
    return this.events.trace_data;
  }
  
  getCollectedFailureReports(): any[] {
    return this.events.failure_reports;
  }
  
  clearCollectedData(): void {
    this.events.trace_data = [];
    this.events.failure_reports = [];
    this.events.recovery_suggestions = {};
    this.events.development_issues = [];
  }
}

describe('厂商中立适配器集成测试', () => {
  let planManager: PlanManager;
  let failureResolver: FailureResolverManager;
  let basicAdapter: TestTraceAdapter;
  let enhancedAdapter: TestTraceAdapter;
  let planId: string;
  let taskId: string;
  
  beforeAll(() => {
    // 创建适配器实例
    basicAdapter = new TestTraceAdapter(false);
    enhancedAdapter = new TestTraceAdapter(true);
    
    // 创建失败解决器实例
    const resolverConfig: FailureResolverConfig = {
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'skip'],
        notification_channels: ['console'],
        performance_thresholds: {
          max_execution_time_ms: 1000,
          max_memory_usage_mb: 100,
          max_cpu_usage_percent: 70
        }
      }
    };
    failureResolver = new FailureResolverManager(resolverConfig);
    
    // 创建计划管理器实例
    const planConfig: PlanConfiguration = {
      auto_scheduling_enabled: true,
      dependency_validation_enabled: true,
      risk_monitoring_enabled: true,
      failure_recovery_enabled: true,
      performance_tracking_enabled: true,
      notification_settings: {
        enabled: true,
        channels: ['console'],
        events: ['task_failure']
      },
      optimization_settings: {
        enabled: false,
        strategy: 'balanced',
        auto_reoptimize: false
      },
      timeout_settings: {
        default_task_timeout_ms: 30000,
        plan_execution_timeout_ms: 3600000,
        dependency_resolution_timeout_ms: 5000
      },
      parallel_execution_limit: 2
    };
    planManager = new PlanManager(planConfig);
    
    // 设置失败解决器
    (planManager as any).failureResolver = failureResolver;
  });
  
  beforeEach(async () => {
    // 清除收集的数据
    basicAdapter.clearCollectedData();
    enhancedAdapter.clearCollectedData();
    
    // 创建测试计划和任务
    const planResult = await planManager.createPlan(
      'ctx-123',
      'Integration Test Plan',
      'Test Description'
    );
    planId = planResult.data!.plan_id;
    
    const taskResult = await planManager.addTask(
      planId,
      'Integration Test Task',
      'Test Description'
    );
    taskId = taskResult.data!.task_id;
  });
  
  describe('基础适配器集成', () => {
    beforeEach(() => {
      // 设置基础适配器
      planManager.setTraceAdapter(basicAdapter);
      failureResolver.setTraceAdapter(basicAdapter);
    });
    
    test('应正确同步任务状态变更', async () => {
      // 更新任务状态
      await planManager.updateTaskStatus(
        taskId,
        'in_progress'
      );
      
      // 验证追踪数据
      const traceData = basicAdapter.getCollectedTraceData();
      expect(traceData.length).toBeGreaterThan(0);
      expect(traceData.some(data => data.operation_name.includes('task_updated'))).toBe(true);
    });
    
    test('应正确同步故障信息', async () => {
      // 更新任务状态为失败
      await planManager.updateTaskStatus(
        taskId,
        'failed',
        undefined,
        'Integration test failure'
      );
      
      // 验证故障报告
      const failureReports = basicAdapter.getCollectedFailureReports();
      expect(failureReports.length).toBeGreaterThan(0);
      expect(failureReports[0].task_id).toBe(taskId);
      expect(failureReports[0].plan_id).toBe(planId);
      expect(failureReports[0].failure_details).toHaveProperty('error_message', 'Integration test failure');
    });
    
    test('基础适配器应不支持恢复建议功能', async () => {
      // 尝试获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions('any-id');
      
      // 应返回空数组
      expect(suggestions).toEqual([]);
    });
    
    test('基础适配器应不支持开发问题检测', async () => {
      // 尝试检测开发问题
      const issues = await failureResolver.detectDevelopmentIssues();
      
      // 应返回空数组
      expect(issues).toEqual([]);
    });
  });
  
  describe('增强型适配器集成', () => {
    beforeEach(() => {
      // 设置增强型适配器
      planManager.setTraceAdapter(enhancedAdapter);
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加测试数据
      enhancedAdapter.addRecoverySuggestion(taskId, {
        suggestion_id: 'sugg-1',
        failure_id: taskId,
        suggestion: 'Increase retry count to 5',
        confidence_score: 0.9,
        estimated_effort: 'low'
      });
      
      enhancedAdapter.addDevelopmentIssue({
        id: 'issue-1',
        type: 'performance',
        severity: 'medium',
        title: 'Optimize database query',
        file_path: 'src/modules/plan/plan-manager.ts'
      });
    });
    
    test('应正确同步任务状态变更', async () => {
      // 更新任务状态
      await planManager.updateTaskStatus(
        taskId,
        'in_progress'
      );
      
      // 验证追踪数据
      const traceData = enhancedAdapter.getCollectedTraceData();
      expect(traceData.length).toBeGreaterThan(0);
      expect(traceData.some(data => data.operation_name.includes('task_updated'))).toBe(true);
    });
    
    test('应正确同步故障信息', async () => {
      // 更新任务状态为失败
      await planManager.updateTaskStatus(
        taskId,
        'failed',
        undefined,
        'Integration test failure'
      );
      
      // 验证故障报告
      const failureReports = enhancedAdapter.getCollectedFailureReports();
      expect(failureReports.length).toBeGreaterThan(0);
      expect(failureReports[0].task_id).toBe(taskId);
      expect(failureReports[0].plan_id).toBe(planId);
      expect(failureReports[0].failure_details).toHaveProperty('error_message', 'Integration test failure');
    });
    
    test('增强型适配器应支持恢复建议功能', async () => {
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(taskId);
      
      // 应返回预设的建议
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toBe('Increase retry count to 5');
    });
    
    test('增强型适配器应支持开发问题检测', async () => {
      // 检测开发问题
      const issues = await failureResolver.detectDevelopmentIssues();
      
      // 应返回预设的问题
      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('performance');
      expect(issues[0].title).toBe('Optimize database query');
    });
    
    test('应能够动态切换适配器类型', async () => {
      // 先使用增强型适配器
      const enhancedSuggestions = await failureResolver.getRecoverySuggestions(taskId);
      expect(enhancedSuggestions).toHaveLength(1);
      
      // 切换到基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      
      // 再次获取建议
      const basicSuggestions = await failureResolver.getRecoverySuggestions(taskId);
      expect(basicSuggestions).toHaveLength(0);
      
      // 切回增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 再次获取建议
      const newEnhancedSuggestions = await failureResolver.getRecoverySuggestions(taskId);
      expect(newEnhancedSuggestions).toHaveLength(1);
    });
  });
  
  describe('完整工作流测试', () => {
    test('应完成从故障到恢复的完整流程', async () => {
      // 设置增强型适配器
      planManager.setTraceAdapter(enhancedAdapter);
      failureResolver.setTraceAdapter(enhancedAdapter);
      
      // 添加恢复建议
      enhancedAdapter.addRecoverySuggestion(taskId, {
        suggestion_id: 'sugg-1',
        failure_id: taskId,
        suggestion: 'Retry with increased timeout',
        confidence_score: 0.95,
        estimated_effort: 'low'
      });
      
      // 监听事件
      const traceDataPromise = new Promise<void>(resolve => {
        enhancedAdapter.on('trace_synced', (data: any) => {
          if (data.operation_name.includes('task_failure_resolved')) {
            resolve();
          }
        });
      });
      
      // 1. 更新任务状态为失败
      await planManager.updateTaskStatus(
        taskId,
        'failed',
        undefined,
        'Workflow test failure'
      );
      
      // 2. 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(taskId);
      expect(suggestions).toHaveLength(1);
      
      // 3. 应用恢复策略
      await planManager.resolveFailedTask(
        taskId,
        'retry',
        { maxRetries: 5, delayMs: 1000 }
      );
      
      // 4. 等待事件触发
      await traceDataPromise;
      
      // 5. 验证任务状态
      const taskResult = await planManager.getTask(taskId);
      expect(taskResult.success).toBe(true);
      expect(taskResult.data!.status).not.toBe('failed');
      
      // 6. 验证追踪数据
      const traceData = enhancedAdapter.getCollectedTraceData();
      const failureReports = enhancedAdapter.getCollectedFailureReports();
      
      expect(traceData.length).toBeGreaterThan(0);
      expect(failureReports.length).toBeGreaterThan(0);
      expect(traceData.some(data => data.operation_name.includes('task_failure_resolved'))).toBe(true);
    });
  });
}); 
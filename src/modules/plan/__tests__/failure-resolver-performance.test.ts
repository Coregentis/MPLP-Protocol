/**
 * MPLP Plan模块 - 故障解决器性能测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T19:00:00+08:00
 * @compliance .cursor/rules/test-style.mdc - 性能测试规范
 * @compliance .cursor/rules/test-data.mdc - 测试数据规范
 * @compliance .cursor/rules/architecture.mdc - 性能要求
 */

import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';
import { FailureResolverManager, FailureResolverConfig } from '../failure-resolver';
import { PlanTask, TaskStatus, RecoveryStrategy } from '../types';
import { ITraceAdapter, RecoverySuggestion, AdapterType } from '../../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../../types/trace';

// 模拟UUID以确保测试一致性
jest.mock('uuid');
(uuidv4 as jest.Mock).mockReturnValue('00000000-0000-0000-0000-000000000000');

// 模拟日志以避免测试输出
jest.mock('@/utils/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}));

// 创建高性能模拟适配器
class HighPerformanceAdapter implements ITraceAdapter {
  private isEnhanced: boolean;
  private recoverySuggestions: Map<string, RecoverySuggestion[]> = new Map();
  private developmentIssues: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    file_path?: string;
  }> = [];
  
  constructor(isEnhanced: boolean = false) {
    this.isEnhanced = isEnhanced;
    
    // 预填充一些恢复建议和开发问题，以模拟实际场景
    if (isEnhanced) {
      // 添加恢复建议
      this.addRecoverySuggestion('00000000-0000-0000-0000-000000000000', {
        suggestion_id: 'sugg-1',
        failure_id: '00000000-0000-0000-0000-000000000000',
        suggestion: 'Increase database connection timeout',
        confidence_score: 0.92,
        estimated_effort: 'low'
      });
      
      this.addRecoverySuggestion('00000000-0000-0000-0000-000000000000', {
        suggestion_id: 'sugg-2',
        failure_id: '00000000-0000-0000-0000-000000000000',
        suggestion: 'Add retry logic for database operations',
        confidence_score: 0.85,
        estimated_effort: 'medium'
      });
      
      // 添加开发问题
      this.addDevelopmentIssue({
        id: 'issue-1',
        type: 'performance',
        severity: 'medium',
        title: 'Database connection pool configuration issue',
        file_path: 'src/config/database.js'
      });
    }
  }
  
  getAdapterInfo(): { type: AdapterType; version: string; capabilities?: string[] } {
    return {
      type: this.isEnhanced ? AdapterType.ENHANCED : AdapterType.BASE,
      version: this.isEnhanced ? '2.0.0' : '1.0.0',
      capabilities: this.isEnhanced 
        ? ['basic_tracing', 'failure_resolution', 'development_issues', 'analytics'] 
        : ['basic_tracing']
    };
  }
  
  async syncTraceData(traceData: MPLPTraceData): Promise<any> {
    // 高性能实现，不做实际存储
    return {
      success: true,
      sync_id: '00000000-0000-0000-0000-000000000000',
      sync_timestamp: new Date().toISOString(),
      latency_ms: 1,
      errors: []
    };
  }
  
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<any> {
    // 高性能实现，不做实际存储
    return {
      success: true,
      sync_id: '00000000-0000-0000-0000-000000000000',
      sync_timestamp: new Date().toISOString(),
      latency_ms: 1,
      errors: []
    };
  }
  
  async reportFailure(failure: any): Promise<any> {
    // 高性能实现，不做实际存储
    return {
      success: true,
      sync_id: '00000000-0000-0000-0000-000000000000',
      sync_timestamp: new Date().toISOString(),
      latency_ms: 1,
      errors: []
    };
  }
  
  async checkHealth(): Promise<any> {
    return {
      status: 'healthy',
      last_check: new Date().toISOString(),
      metrics: {
        avg_latency_ms: 1,
        success_rate: 1.0,
        error_rate: 0.0
      }
    };
  }
  
  // 增强型适配器方法
  async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    if (!this.isEnhanced) {
      return [];
    }
    
    return this.recoverySuggestions.get(failureId) || [];
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
    if (!this.isEnhanced) {
      return {
        issues: [],
        confidence: 0
      };
    }
    
    return {
      issues: this.developmentIssues,
      confidence: 0.9
    };
  }
  
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.isEnhanced) {
      return {};
    }
    
    return {
      total_traces: 100,
      total_failures: 10,
      avg_latency_ms: 5,
      success_rate: 0.95
    };
  }
  
  // 事件处理
  on(event: string, handler: Function): void {
    // 高性能实现，不实际注册事件
  }
  
  // 测试辅助方法
  addRecoverySuggestion(failureId: string, suggestion: RecoverySuggestion): void {
    if (!this.recoverySuggestions.has(failureId)) {
      this.recoverySuggestions.set(failureId, []);
    }
    
    this.recoverySuggestions.get(failureId)!.push(suggestion);
  }
  
  addDevelopmentIssue(issue: any): void {
    this.developmentIssues.push(issue);
  }
}

describe('故障解决器性能测试', () => {
  // 测试数据和设置
  let failureResolver: FailureResolverManager;
  let basicAdapter: HighPerformanceAdapter;
  let enhancedAdapter: HighPerformanceAdapter;
  let mockConfig: FailureResolverConfig;
  const mockUUID = '00000000-0000-0000-0000-000000000000';
  
  // 创建模拟任务
  const createMockTask = (override = {}): PlanTask => ({
    task_id: mockUUID,
    name: '测试任务',
    type: 'atomic',
    status: 'pending' as TaskStatus,
    priority: 'medium',
    ...override
  });
  
  beforeEach(() => {
    // 创建基础适配器和增强型适配器
    basicAdapter = new HighPerformanceAdapter(false);
    enhancedAdapter = new HighPerformanceAdapter(true);
    
    // 设置基础配置
    mockConfig = {
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'rollback', 'skip', 'manual_intervention'],
        retry_config: {
          max_attempts: 3,
          delay_ms: 100,
          backoff_factor: 2,
          max_delay_ms: 5000
        },
        rollback_config: {
          enabled: true,
          checkpoint_frequency: 5,
          max_rollback_depth: 10
        },
        manual_intervention_config: {
          timeout_ms: 30000,
          escalation_levels: ['developer', 'team_lead', 'manager'],
          approval_required: true
        },
        notification_channels: ['email', 'slack'],
        performance_thresholds: {
          max_execution_time_ms: 5000,
          max_memory_usage_mb: 512,
          max_cpu_usage_percent: 80
        }
      }
    };
    
    // 创建失败解决器实例
    failureResolver = new FailureResolverManager(mockConfig);
    
    // 模拟内部方法以避免实际执行恢复策略
    jest.spyOn(failureResolver as any, 'applyRecoveryStrategy').mockResolvedValue({
      success: true,
      strategy_used: 'retry',
      task_id: mockUUID,
      plan_id: mockUUID,
      new_status: 'ready' as TaskStatus,
      execution_time_ms: 1
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('基础适配器性能测试', () => {
    beforeEach(() => {
      // 设置基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
    });
    
    test('故障处理应在10ms内完成', async () => {
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 测量执行时间
      const startTime = performance.now();
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      const duration = performance.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(10);
      console.log(`基础适配器故障处理耗时: ${duration.toFixed(2)}ms`);
    });
    
    test('恢复建议获取应在5ms内完成', async () => {
      // 测量执行时间
      const startTime = performance.now();
      
      // 获取恢复建议
      await failureResolver.getRecoverySuggestions(mockUUID);
      
      const duration = performance.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(5);
      console.log(`基础适配器恢复建议获取耗时: ${duration.toFixed(2)}ms`);
    });
    
    test('开发问题检测应在5ms内完成', async () => {
      // 测量执行时间
      const startTime = performance.now();
      
      // 检测开发问题
      await failureResolver.detectDevelopmentIssues();
      
      const duration = performance.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(5);
      console.log(`基础适配器开发问题检测耗时: ${duration.toFixed(2)}ms`);
    });
  });
  
  describe('增强型适配器性能测试', () => {
    beforeEach(() => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
    });
    
    test('故障处理应在10ms内完成', async () => {
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 测量执行时间
      const startTime = performance.now();
      
      // 处理任务故障
      await failureResolver.handleTaskFailure(
        mockUUID, // planId
        mockUUID, // taskId
        mockTask,
        errorMsg
      );
      
      const duration = performance.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(10);
      console.log(`增强型适配器故障处理耗时: ${duration.toFixed(2)}ms`);
    });
    
    test('恢复建议获取应在5ms内完成', async () => {
      // 测量执行时间
      const startTime = performance.now();
      
      // 获取恢复建议
      const suggestions = await failureResolver.getRecoverySuggestions(mockUUID);
      
      const duration = performance.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(5);
      console.log(`增强型适配器恢复建议获取耗时: ${duration.toFixed(2)}ms`);
      
      // 验证返回了正确的建议
      expect(suggestions).toHaveLength(2);
    });
    
    test('开发问题检测应在5ms内完成', async () => {
      // 测量执行时间
      const startTime = performance.now();
      
      // 检测开发问题
      const result = await failureResolver.detectDevelopmentIssues();
      
      const duration = performance.now() - startTime;
      
      // 验证执行时间
      expect(duration).toBeLessThan(5);
      console.log(`增强型适配器开发问题检测耗时: ${duration.toFixed(2)}ms`);
      
      // 验证返回了正确的问题
      expect(result.issues).toHaveLength(1);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
  
  describe('性能压力测试', () => {
    beforeEach(() => {
      // 设置增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
    });
    
    test('应能在10ms内处理大量故障', async () => {
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 执行多次故障处理以模拟高负载
      const iterations = 10;
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        // 处理任务故障
        await failureResolver.handleTaskFailure(
          mockUUID, // planId
          mockUUID, // taskId
          mockTask,
          errorMsg
        );
        
        const duration = performance.now() - startTime;
        durations.push(duration);
      }
      
      // 计算平均、最大和最小执行时间
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      console.log(`压力测试结果 (${iterations}次迭代):`);
      console.log(`- 平均执行时间: ${avgDuration.toFixed(2)}ms`);
      console.log(`- 最大执行时间: ${maxDuration.toFixed(2)}ms`);
      console.log(`- 最小执行时间: ${minDuration.toFixed(2)}ms`);
      
      // 验证最大执行时间
      expect(maxDuration).toBeLessThan(10);
    });
    
    test('应能在5ms内处理大量恢复建议请求', async () => {
      // 执行多次恢复建议获取以模拟高负载
      const iterations = 10;
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        // 获取恢复建议
        await failureResolver.getRecoverySuggestions(mockUUID);
        
        const duration = performance.now() - startTime;
        durations.push(duration);
      }
      
      // 计算平均、最大和最小执行时间
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      console.log(`恢复建议压力测试结果 (${iterations}次迭代):`);
      console.log(`- 平均执行时间: ${avgDuration.toFixed(2)}ms`);
      console.log(`- 最大执行时间: ${maxDuration.toFixed(2)}ms`);
      console.log(`- 最小执行时间: ${minDuration.toFixed(2)}ms`);
      
      // 验证最大执行时间
      expect(maxDuration).toBeLessThan(5);
    });
    
    test('应能在5ms内处理大量开发问题检测请求', async () => {
      // 执行多次开发问题检测以模拟高负载
      const iterations = 10;
      const durations: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        // 检测开发问题
        await failureResolver.detectDevelopmentIssues();
        
        const duration = performance.now() - startTime;
        durations.push(duration);
      }
      
      // 计算平均、最大和最小执行时间
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      console.log(`开发问题检测压力测试结果 (${iterations}次迭代):`);
      console.log(`- 平均执行时间: ${avgDuration.toFixed(2)}ms`);
      console.log(`- 最大执行时间: ${maxDuration.toFixed(2)}ms`);
      console.log(`- 最小执行时间: ${minDuration.toFixed(2)}ms`);
      
      // 验证最大执行时间
      expect(maxDuration).toBeLessThan(5);
    });
  });
  
  describe('多适配器切换性能测试', () => {
    test('适配器切换应不影响性能', async () => {
      // 创建测试任务
      const mockTask = createMockTask({ status: 'failed' as TaskStatus });
      const errorMsg = 'Test error message';
      
      // 测试基础适配器性能
      failureResolver.setTraceAdapter(basicAdapter);
      const basicStartTime = performance.now();
      await failureResolver.handleTaskFailure(mockUUID, mockUUID, mockTask, errorMsg);
      const basicDuration = performance.now() - basicStartTime;
      
      // 切换到增强型适配器
      failureResolver.setTraceAdapter(enhancedAdapter);
      const enhancedStartTime = performance.now();
      await failureResolver.handleTaskFailure(mockUUID, mockUUID, mockTask, errorMsg);
      const enhancedDuration = performance.now() - enhancedStartTime;
      
      // 再次切换回基础适配器
      failureResolver.setTraceAdapter(basicAdapter);
      const switchBackStartTime = performance.now();
      await failureResolver.handleTaskFailure(mockUUID, mockUUID, mockTask, errorMsg);
      const switchBackDuration = performance.now() - switchBackStartTime;
      
      console.log('适配器切换性能测试:');
      console.log(`- 基础适配器: ${basicDuration.toFixed(2)}ms`);
      console.log(`- 增强型适配器: ${enhancedDuration.toFixed(2)}ms`);
      console.log(`- 切换回基础适配器: ${switchBackDuration.toFixed(2)}ms`);
      
      // 验证所有执行时间
      expect(basicDuration).toBeLessThan(10);
      expect(enhancedDuration).toBeLessThan(10);
      expect(switchBackDuration).toBeLessThan(10);
    });
  });
}); 
/**
 * MPLP Trace模块 - TraceService测试
 * 
 * @version v1.0.0
 * @created 2025-07-12T19:00:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @description 测试TraceService的核心功能，包括追踪记录的创建、更新、查询和性能统计
 */

import { expect } from '@jest/globals';
import { TraceService } from '../../../src/modules/trace/trace-service';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../../src/types/trace';
import { Performance } from '../../../src/utils/performance';

// 模拟Performance工具
jest.mock('../../../src/utils/performance', () => {
  return {
    Performance: jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      end: jest.fn().mockReturnValue(5)
    }))
  };
});

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('TraceService', () => {
  let traceService: TraceService;
  let mockTraceAdapter: jest.Mocked<ITraceAdapter>;
  
  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    
    // 创建模拟Trace适配器
    mockTraceAdapter = {
      syncTraceData: jest.fn().mockResolvedValue({ success: true }),
      syncBatch: jest.fn().mockResolvedValue({ success: true }),
      reportFailure: jest.fn().mockResolvedValue({ success: true }),
      checkHealth: jest.fn().mockResolvedValue({ 
        status: 'healthy',
        last_check: new Date().toISOString(),
        metrics: { avg_latency_ms: 10, success_rate: 0.99, error_rate: 0.01 }
      }),
      getAdapterInfo: jest.fn().mockReturnValue({ type: 'test-adapter', version: '1.0.0' }),
      getRecoverySuggestions: jest.fn().mockResolvedValue([]),
      detectDevelopmentIssues: jest.fn().mockResolvedValue({ issues: [], confidence: 1.0 }),
      getAnalytics: jest.fn().mockResolvedValue({})
    } as unknown as jest.Mocked<ITraceAdapter>;
    
    // 创建TraceService实例
    traceService = new TraceService(mockTraceAdapter);
  });
  
  describe('createTrace', () => {
    test('应该成功创建追踪记录', async () => {
      // 执行
      const traceData = await traceService.createTrace({
        operation_module: 'TestModule',
        operation_name: 'test_operation',
        context_id: 'ctx-123',
        plan_id: 'plan-456',
        task_id: 'task-789',
        tags: { environment: 'test' }
      });
      
      // 验证
      expect(traceData).toBeDefined();
      expect(traceData.operation_module).toBe('TestModule');
      expect(traceData.operation_name).toBe('test_operation');
      expect(traceData.context_id).toBe('ctx-123');
      expect(traceData.plan_id).toBe('plan-456');
      expect(traceData.task_id).toBe('task-789');
      expect(traceData.tags).toEqual({ environment: 'test' });
      expect(traceData.status).toBe('pending');
      expect(traceData.trace_id).toBeDefined();
      expect(traceData.timestamp).toBeDefined();
      
      // 验证适配器调用
      expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_module: 'TestModule',
          operation_name: 'test_operation',
          context_id: 'ctx-123'
        })
      );
    });
    
    test('应该验证必填字段', async () => {
      // 执行和验证 - 没有操作模块
      await expect(
        traceService.createTrace({
          operation_module: '',
          operation_name: 'test_operation',
          context_id: 'ctx-123'
        })
      ).rejects.toThrow('Operation module is required');
      
      // 执行和验证 - 没有操作名称
      await expect(
        traceService.createTrace({
          operation_module: 'TestModule',
          operation_name: '',
          context_id: 'ctx-123'
        })
      ).rejects.toThrow('Operation name is required');
      
      // 执行和验证 - 没有上下文ID
      await expect(
        traceService.createTrace({
          operation_module: 'TestModule',
          operation_name: 'test_operation',
          context_id: ''
        })
      ).rejects.toThrow('Context ID is required');
    });
    
    test('应该生成唯一的追踪ID', async () => {
      // 执行
      const trace1 = await traceService.createTrace({
        operation_module: 'TestModule',
        operation_name: 'operation1',
        context_id: 'ctx-123'
      });
      
      const trace2 = await traceService.createTrace({
        operation_module: 'TestModule',
        operation_name: 'operation2',
        context_id: 'ctx-123'
      });
      
      // 验证
      expect(trace1.trace_id).not.toBe(trace2.trace_id);
    });
  });
  
  describe('updateTrace', () => {
    let traceData: MPLPTraceData;
    
    beforeEach(async () => {
      // 创建测试追踪数据
      traceData = await traceService.createTrace({
        operation_module: 'TestModule',
        operation_name: 'test_operation',
        context_id: 'ctx-123'
      });
    });
    
    test('应该成功更新追踪状态', async () => {
      // 执行
      const updatedTrace = await traceService.updateTrace(
        traceData.trace_id,
        {
          status: 'completed',
          result_data: { test_result: 'success' }
        }
      );
      
      // 验证
      expect(updatedTrace.status).toBe('completed');
      expect(updatedTrace.result_data).toEqual({ test_result: 'success' });
      expect(updatedTrace.completed_at).toBeDefined();
      
      // 验证适配器调用
      expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledTimes(2); // 创建+更新
    });
    
    test('应该处理错误状态更新', async () => {
      // 执行
      const updatedTrace = await traceService.updateTrace(
        traceData.trace_id,
        {
          status: 'failed',
          error_message: 'Test failed with error',
          error_details: { error_code: 'TEST_ERROR' }
        }
      );
      
      // 验证
      expect(updatedTrace.status).toBe('failed');
      expect(updatedTrace.error_message).toBe('Test failed with error');
      expect(updatedTrace.error_details).toEqual({ error_code: 'TEST_ERROR' });
    });
    
    test('应该处理不存在的追踪记录', async () => {
      // 执行和验证
      await expect(
        traceService.updateTrace(
          'non-existent-trace',
          { status: 'completed' }
        )
      ).rejects.toThrow('Trace not found');
    });
  });
  
  describe('getTrace', () => {
    let traceId: string;
    
    beforeEach(async () => {
      // 创建测试追踪数据
      const trace = await traceService.createTrace({
        operation_module: 'TestModule',
        operation_name: 'test_operation',
        context_id: 'ctx-123'
      });
      
      traceId = trace.trace_id;
    });
    
    test('应该成功获取追踪记录', async () => {
      // 执行
      const trace = await traceService.getTrace(traceId);
      
      // 验证
      expect(trace).toBeDefined();
      expect(trace.trace_id).toBe(traceId);
      expect(trace.operation_module).toBe('TestModule');
      expect(trace.operation_name).toBe('test_operation');
      expect(trace.context_id).toBe('ctx-123');
    });
    
    test('应该处理不存在的追踪记录', async () => {
      // 执行和验证
      await expect(
        traceService.getTrace('non-existent-trace')
      ).rejects.toThrow('Trace not found');
    });
  });
  
  describe('queryTraces', () => {
    beforeEach(async () => {
      // 创建测试追踪数据
      await traceService.createTrace({
        operation_module: 'Module1',
        operation_name: 'operation1',
        context_id: 'ctx-123',
        plan_id: 'plan-1'
      });
      
      await traceService.createTrace({
        operation_module: 'Module1',
        operation_name: 'operation2',
        context_id: 'ctx-123',
        plan_id: 'plan-1'
      });
      
      await traceService.createTrace({
        operation_module: 'Module2',
        operation_name: 'operation1',
        context_id: 'ctx-456',
        plan_id: 'plan-2'
      });
    });
    
    test('应该查询符合条件的追踪记录', async () => {
      // 按上下文ID查询
      const contextResults = await traceService.queryTraces({
        context_ids: ['ctx-123']
      });
      expect(contextResults).toHaveLength(2);
      expect(contextResults[0].context_id).toBe('ctx-123');
      expect(contextResults[1].context_id).toBe('ctx-123');
      
      // 按模块名查询
      const moduleResults = await traceService.queryTraces({
        operation_modules: ['Module1']
      });
      expect(moduleResults).toHaveLength(2);
      expect(moduleResults[0].operation_module).toBe('Module1');
      expect(moduleResults[1].operation_module).toBe('Module1');
      
      // 按计划ID查询
      const planResults = await traceService.queryTraces({
        plan_ids: ['plan-2']
      });
      expect(planResults).toHaveLength(1);
      expect(planResults[0].plan_id).toBe('plan-2');
      
      // 组合查询
      const combinedResults = await traceService.queryTraces({
        operation_modules: ['Module1'],
        operation_names: ['operation1']
      });
      expect(combinedResults).toHaveLength(1);
      expect(combinedResults[0].operation_module).toBe('Module1');
      expect(combinedResults[0].operation_name).toBe('operation1');
    });
    
    test('应该支持分页查询', async () => {
      // 创建更多数据
      await traceService.createTrace({
        operation_module: 'Module1',
        operation_name: 'operation3',
        context_id: 'ctx-123'
      });
      
      await traceService.createTrace({
        operation_module: 'Module1',
        operation_name: 'operation4',
        context_id: 'ctx-123'
      });
      
      // 第一页
      const page1 = await traceService.queryTraces(
        { operation_modules: ['Module1'] },
        { limit: 2, offset: 0 }
      );
      expect(page1).toHaveLength(2);
      
      // 第二页
      const page2 = await traceService.queryTraces(
        { operation_modules: ['Module1'] },
        { limit: 2, offset: 2 }
      );
      expect(page2).toHaveLength(2);
      
      // 验证不同页的数据不同
      expect(page1[0].trace_id).not.toBe(page2[0].trace_id);
    });
  });
  
  describe('reportFailure', () => {
    test('应该成功报告故障', async () => {
      // 执行
      const result = await traceService.reportFailure({
        failure_id: 'test-failure',
        module: 'TestModule',
        context_id: 'ctx-123',
        description: 'Failed operation',
        details: { error_code: 'TEST_ERROR' }
      });
      
      // 验证
      expect(result.success).toBe(true);
      
      // 验证适配器调用
      expect(mockTraceAdapter.reportFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          failure_id: 'test-failure',
          module: 'TestModule',
          context_id: 'ctx-123',
          description: 'Failed operation',
          details: { error_code: 'TEST_ERROR' }
        })
      );
    });
    
    test('应该验证必填字段', async () => {
      // 执行和验证 - 没有故障ID
      await expect(
        traceService.reportFailure({
          failure_id: '',
          module: 'TestModule',
          context_id: 'ctx-123',
          description: 'Failed operation'
        })
      ).rejects.toThrow('Failure ID is required');
      
      // 执行和验证 - 没有模块
      await expect(
        traceService.reportFailure({
          failure_id: 'test-failure',
          module: '',
          context_id: 'ctx-123',
          description: 'Failed operation'
        })
      ).rejects.toThrow('Module is required');
    });
  });
  
  describe('getRecoverySuggestions', () => {
    test('应该返回恢复建议', async () => {
      // 设置模拟适配器返回值
      mockTraceAdapter.getRecoverySuggestions.mockResolvedValue([
        {
          suggestion_id: 'sugg-1',
          action: 'retry',
          description: 'Retry the operation',
          confidence: 0.9
        }
      ]);
      
      // 执行
      const suggestions = await traceService.getRecoverySuggestions('test-failure');
      
      // 验证
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].action).toBe('retry');
      
      // 验证适配器调用
      expect(mockTraceAdapter.getRecoverySuggestions).toHaveBeenCalledWith('test-failure');
    });
  });
  
  describe('detectDevelopmentIssues', () => {
    test('应该返回开发问题', async () => {
      // 设置模拟适配器返回值
      mockTraceAdapter.detectDevelopmentIssues.mockResolvedValue({
        issues: [
          {
            id: 'issue-1',
            type: 'code_quality',
            severity: 'warning',
            title: 'Potential memory leak',
            description: 'Possible memory leak in resource handling',
            file_path: 'src/modules/test.ts'
          }
        ],
        confidence: 0.8
      });
      
      // 执行
      const result = await traceService.detectDevelopmentIssues();
      
      // 验证
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('code_quality');
      expect(result.confidence).toBe(0.8);
      
      // 验证适配器调用
      expect(mockTraceAdapter.detectDevelopmentIssues).toHaveBeenCalled();
    });
  });
  
  describe('getAdapterHealth', () => {
    test('应该返回适配器健康状态', async () => {
      // 执行
      const health = await traceService.getAdapterHealth();
      
      // 验证
      expect(health.status).toBe('healthy');
      expect(health.metrics.avg_latency_ms).toBe(10);
      
      // 验证适配器调用
      expect(mockTraceAdapter.checkHealth).toHaveBeenCalled();
    });
  });
  
  describe('getPerformanceStats', () => {
    beforeEach(async () => {
      // 创建一些测试追踪数据
      await traceService.createTrace({
        operation_module: 'Module1',
        operation_name: 'operation1',
        context_id: 'ctx-123',
        duration_ms: 50
      });
      
      await traceService.createTrace({
        operation_module: 'Module1',
        operation_name: 'operation2',
        context_id: 'ctx-123',
        duration_ms: 100
      });
    });
    
    test('应该返回性能统计数据', () => {
      // 执行
      const stats = traceService.getPerformanceStats();
      
      // 验证
      expect(stats).toBeDefined();
      expect(stats.avg_operation_time_ms).toBeGreaterThanOrEqual(0);
      expect(stats.total_traces).toBe(2);
    });
    
    test('应该按模块返回性能统计', () => {
      // 执行
      const stats = traceService.getPerformanceStats('Module1');
      
      // 验证
      expect(stats).toBeDefined();
      expect(stats.operation_count).toBe(2);
      expect(stats.avg_duration_ms).toBe(75); // (50+100)/2
    });
  });
}); 
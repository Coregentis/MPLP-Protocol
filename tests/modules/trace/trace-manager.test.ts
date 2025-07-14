/**
 * MPLP Trace模块 - TraceManager测试
 * 
 * @version v1.0.0
 * @created 2025-07-12T18:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @description 测试TraceManager的核心功能，包括初始化、创建追踪记录、查询和性能监控
 */

import { expect } from '@jest/globals';
import { TraceManager } from '../../../src/modules/trace/trace-manager';
import { AdapterFactory } from '../../../src/adapters/trace/adapter-factory';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { 
  TraceConfig,
  TraceProtocol,
  TraceFilter,
  PerformanceMetrics
} from '../../../src/modules/trace/types';

// 模拟适配器工厂
jest.mock('../../../src/adapters/trace/adapter-factory');
const mockAdapterFactory = AdapterFactory as jest.Mocked<typeof AdapterFactory>;

// 模拟Trace适配器
const mockTraceAdapter: jest.Mocked<ITraceAdapter> = {
  syncTraceData: jest.fn().mockResolvedValue({ success: true }),
  syncBatch: jest.fn().mockResolvedValue({ success: true }),
  reportFailure: jest.fn().mockResolvedValue({ success: true }),
  checkHealth: jest.fn().mockResolvedValue({ 
    status: 'healthy',
    last_check: new Date().toISOString(),
    metrics: { avg_latency_ms: 10, success_rate: 0.99, error_rate: 0.01 }
  }),
  getRecoverySuggestions: jest.fn().mockResolvedValue([]),
  detectDevelopmentIssues: jest.fn().mockResolvedValue({ issues: [], confidence: 1.0 }),
  getAnalytics: jest.fn().mockResolvedValue({}),
  on: jest.fn(),
  getAdapterInfo: jest.fn().mockReturnValue({ type: 'test-adapter', version: '1.0.0' })
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

describe('TraceManager', () => {
  let traceManager: TraceManager;
  const defaultConfig: TraceConfig = {
    auto_sync_enabled: true,
    batch_processing_enabled: true,
    real_time_monitoring_enabled: true,
    max_trace_buffer_size: 1000,
    sync_interval_ms: 5000,
    retention_days: 30,
    tracepilot_sync_enabled: true,
    context_integration_enabled: true,
    plan_integration_enabled: true
  };
  
  beforeEach(() => {
    // 重置模拟
    jest.clearAllMocks();
    
    // 设置适配器工厂返回模拟适配器
    mockAdapterFactory.createAdapter.mockReturnValue(mockTraceAdapter);
    
    // 创建TraceManager实例
    traceManager = new TraceManager(defaultConfig);
  });
  
  describe('initialize', () => {
    test('应该成功初始化管理器', async () => {
      // 执行
      await traceManager.initialize();
      
      // 验证
      expect(traceManager.isInitialized()).toBe(true);
      expect(mockAdapterFactory.createAdapter).toHaveBeenCalled();
    });
    
    test('应该处理初始化错误', async () => {
      // 设置适配器工厂抛出错误
      mockAdapterFactory.createAdapter.mockImplementation(() => {
        throw new Error('Adapter creation failed');
      });
      
      // 执行和验证
      await expect(traceManager.initialize()).rejects.toThrow('Adapter creation failed');
      expect(traceManager.isInitialized()).toBe(false);
    });
  });
  
  describe('createTrace', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该成功创建追踪记录', async () => {
      // 执行
      const result = await traceManager.createTrace(
        'TestModule',
        'test_operation',
        'ctx-123',
        'plan-456',
        'task-789'
      );
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.operation_module).toBe('TestModule');
        expect(result.data.operation_name).toBe('test_operation');
        expect(result.data.context_id).toBe('ctx-123');
        expect(result.data.status).toBe('pending');
        expect(result.data.trace_id).toBeDefined();
        expect(result.data.timestamp).toBeDefined();
      }
    });
    
    test('应该处理参数验证', async () => {
      // 执行和验证 - 没有模块名
      await expect(
        traceManager.createTrace('', 'test_operation', 'ctx-123')
      ).rejects.toThrow('Module name is required');
      
      // 执行和验证 - 没有操作名
      await expect(
        traceManager.createTrace('TestModule', '', 'ctx-123')
      ).rejects.toThrow('Operation name is required');
    });
    
    test('应该向Trace适配器同步数据', async () => {
      // 执行
      await traceManager.createTrace(
        'TestModule',
        'test_operation',
        'ctx-123'
      );
      
      // 验证
      expect(mockTraceAdapter.syncTraceData).toHaveBeenCalledWith(
        expect.objectContaining({
          operation_module: 'TestModule',
          operation_name: 'test_operation',
          context_id: 'ctx-123'
        })
      );
    });
  });
  
  describe('completeTrace', () => {
    let traceId: string;
    
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
      
      // 创建一个追踪记录
      const result = await traceManager.createTrace(
        'TestModule',
        'test_operation',
        'ctx-123'
      );
      
      traceId = result.data!.trace_id;
    });
    
    test('应该成功完成追踪记录', async () => {
      // 执行
      const result = await traceManager.completeTrace(
        traceId,
        'completed',
        undefined,
        { test_result: 'success' }
      );
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.status).toBe('completed');
        expect(result.data.result_data).toEqual({ test_result: 'success' });
        expect(result.data.completed_at).toBeDefined();
      }
    });
    
    test('应该处理失败的追踪记录', async () => {
      // 执行
      const result = await traceManager.completeTrace(
        traceId,
        'failed',
        'Test failed with error'
      );
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.status).toBe('failed');
        expect(result.data.error_message).toBe('Test failed with error');
      }
    });
    
    test('应该处理不存在的追踪记录', async () => {
      // 执行
      const result = await traceManager.completeTrace(
        'non-existent-trace',
        'completed'
      );
      
      // 验证
      expect(result.success).toBe(false);
      expect(result.error_code).toBe('TRACE_NOT_FOUND');
    });
  });
  
  describe('queryTraces', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
      
      // 创建一些测试追踪记录
      await traceManager.createTrace('Module1', 'operation1', 'ctx-123', 'plan-1');
      await traceManager.createTrace('Module1', 'operation2', 'ctx-123', 'plan-1');
      await traceManager.createTrace('Module2', 'operation1', 'ctx-456', 'plan-2');
    });
    
    test('应该按上下文ID查询追踪记录', async () => {
      // 执行
      const result = await traceManager.queryTraces({
        context_ids: ['ctx-123']
      });
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(2);
      expect(result.data![0].context_id).toBe('ctx-123');
      expect(result.data![1].context_id).toBe('ctx-123');
    });
    
    test('应该按模块名查询追踪记录', async () => {
      // 执行
      const result = await traceManager.queryTraces({
        modules: ['Module1']
      });
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(2);
      expect(result.data![0].operation_module).toBe('Module1');
      expect(result.data![1].operation_module).toBe('Module1');
    });
    
    test('应该组合多个过滤条件', async () => {
      // 执行
      const result = await traceManager.queryTraces({
        modules: ['Module1'],
        operation_names: ['operation1']
      });
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(1);
      expect(result.data![0].operation_module).toBe('Module1');
      expect(result.data![0].operation_name).toBe('operation1');
    });
  });
  
  describe('reportFailure', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该成功报告故障', async () => {
      // 执行
      const result = await traceManager.reportFailure(
        'test-failure',
        'TestModule',
        'ctx-123',
        'Failed operation',
        { error_code: 'TEST_ERROR' }
      );
      
      // 验证
      expect(result.success).toBe(true);
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
  });
  
  describe('getRecoverySuggestions', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该获取恢复建议', async () => {
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
      const result = await traceManager.getRecoverySuggestions('test-failure');
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBe(1);
      expect(result.data![0].action).toBe('retry');
    });
  });
  
  describe('detectDevelopmentIssues', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该检测开发问题', async () => {
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
      const result = await traceManager.detectDevelopmentIssues();
      
      // 验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.issues.length).toBe(1);
      expect(result.data!.issues[0].type).toBe('code_quality');
    });
  });
  
  describe('healthCheck', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该执行健康检查', async () => {
      // 执行
      const result = await traceManager.healthCheck();
      
      // 验证
      expect(result.status).toBe('healthy');
      expect(result.details).toBeDefined();
      expect(result.details.adapter).toBeDefined();
      expect(result.details.adapter.status).toBe('healthy');
    });
  });
  
  describe('getModuleStats', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
      
      // 创建一些测试追踪记录
      await traceManager.createTrace('Module1', 'operation1', 'ctx-123');
      await traceManager.createTrace('Module1', 'operation2', 'ctx-123');
      await traceManager.createTrace('Module2', 'operation1', 'ctx-456');
    });
    
    test('应该返回模块统计信息', () => {
      // 执行
      const stats = traceManager.getModuleStats();
      
      // 验证
      expect(stats.total_traces).toBe(3);
      expect(stats.traces_by_module.Module1).toBe(2);
      expect(stats.traces_by_module.Module2).toBe(1);
    });
  });
  
  describe('getPerformanceMetrics', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该返回性能指标', () => {
      // 执行
      const metrics = traceManager.getPerformanceMetrics();
      
      // 验证
      expect(metrics).toBeDefined();
      expect(metrics.avg_operation_time_ms).toBeDefined();
      expect(metrics.p95_operation_time_ms).toBeDefined();
      expect(metrics.total_operations).toBeDefined();
    });
  });
  
  describe('shutdown', () => {
    beforeEach(async () => {
      // 确保管理器已初始化
      await traceManager.initialize();
    });
    
    test('应该成功关闭管理器', async () => {
      // 执行
      await traceManager.shutdown();
      
      // 验证
      expect(traceManager.isInitialized()).toBe(false);
    });
  });
}); 
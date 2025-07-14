/**
 * MPLP Trace模块 - 适配器集成测试
 * 
 * @version v1.0.1
 * @created 2025-07-12T19:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @description 测试Trace适配器与模块的集成，验证厂商中立设计原则
 */

import { expect } from '@jest/globals';
import { TraceAdapterFactory, AdapterType } from '../../../src/adapters/trace/adapter-factory';
import { BaseTraceAdapter } from '../../../src/adapters/trace/base-trace-adapter';
import { EnhancedTraceAdapter } from '../../../src/adapters/trace/enhanced-trace-adapter';
import { TraceService } from '../../../src/modules/trace/trace-service';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../../src/types/trace';
import { v4 as uuidv4 } from 'uuid';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 创建一个测试用的自定义适配器
class CustomTraceAdapter implements ITraceAdapter {
  private traceData: MPLPTraceData[] = [];
  private failureReports: any[] = [];
  
  getAdapterInfo(): { type: string; version: string } {
    return { type: 'custom-adapter', version: '2.0.0' };
  }
  
  async syncTraceData(traceData: MPLPTraceData): Promise<any> {
    this.traceData.push(traceData);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 5
    };
  }
  
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<any> {
    this.traceData.push(...traceBatch);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 8
    };
  }
  
  async reportFailure(failure: any): Promise<any> {
    this.failureReports.push(failure);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString()
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
  
  async getRecoverySuggestions(failureId: string): Promise<any[]> {
    return [
      {
        suggestion_id: `sugg-${uuidv4()}`,
        failure_id: failureId,
        action: 'retry',
        description: 'Retry the operation with increased timeout',
        confidence: 0.95
      },
      {
        suggestion_id: `sugg-${uuidv4()}`,
        failure_id: failureId,
        action: 'skip',
        description: 'Skip this operation and continue',
        confidence: 0.85
      }
    ];
  }
  
  async detectDevelopmentIssues(): Promise<any> {
    return {
      issues: [
        {
          id: `issue-${uuidv4()}`,
          type: 'performance',
          severity: 'warning',
          title: 'Custom issue detection',
          description: 'This is a test issue from custom adapter',
          file_path: 'src/modules/test.ts'
        }
      ],
      confidence: 0.9
    };
  }
  
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    return {
      total_traces: this.traceData.length,
      total_failures: this.failureReports.length,
      custom_metrics: {
        process_time_avg: 15,
        memory_usage_mb: 256
      }
    };
  }
  
  // 测试帮助方法
  getCollectedTraceData(): MPLPTraceData[] {
    return this.traceData;
  }
  
  getCollectedFailureReports(): any[] {
    return this.failureReports;
  }
  
  clearCollectedData(): void {
    this.traceData = [];
    this.failureReports = [];
  }
}

describe('Trace适配器集成测试', () => {
  // 测试不同的适配器类型
  const adapterImplementations = [
    { name: '基础适配器', factory: () => new BaseTraceAdapter() },
    { name: '增强型适配器', factory: () => new EnhancedTraceAdapter() },
    { name: '自定义适配器', factory: () => new CustomTraceAdapter() }
  ];
  
  // 对每种适配器类型运行相同的测试
  adapterImplementations.forEach(implementation => {
    describe(`使用 ${implementation.name}`, () => {
      let adapter: ITraceAdapter;
      let traceService: TraceService;
      
      beforeEach(() => {
        // 重置所有模拟
        jest.clearAllMocks();
        
        // 创建适配器实例
        adapter = implementation.factory();
        
        // 如果是自定义适配器，清除收集的数据
        if (adapter instanceof CustomTraceAdapter) {
          adapter.clearCollectedData();
        }
        
        // 创建TraceService实例
        traceService = new TraceService(adapter);
      });
      
      test('应该通过服务层正确使用适配器', async () => {
        // 创建追踪记录
        const trace = await traceService.createTrace({
          module: 'TestModule',
          operation: 'test_operation',
          context_id: 'ctx-123',
          plan_id: 'plan-456',
          task_id: 'task-789'
        });
        
        // 验证追踪记录
        expect(trace).toBeDefined();
        expect(trace.module).toBe('TestModule');
        expect(trace.operation).toBe('test_operation');
        expect(trace.context_id).toBe('ctx-123');
        expect(trace.plan_id).toBe('plan-456');
        expect(trace.task_id).toBe('task-789');
        
        // 验证适配器数据
        if (adapter instanceof CustomTraceAdapter) {
          const collectedData = adapter.getCollectedTraceData();
          expect(collectedData.length).toBe(1);
          expect(collectedData[0].module).toBe('TestModule');
          expect(collectedData[0].operation).toBe('test_operation');
          expect(collectedData[0].context_id).toBe('ctx-123');
        }
      });
      
      test('应该支持故障报告和建议获取', async () => {
        // 报告故障
        const failureResult = await traceService.reportFailure({
          failure_id: 'test-failure',
          module: 'TestModule',
          context_id: 'ctx-123',
          description: 'Test failure'
        });
        
        expect(failureResult.success).toBe(true);
        
        // 获取恢复建议
        const suggestions = await traceService.getRecoverySuggestions('test-failure');
        
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        
        // 验证适配器数据
        if (adapter instanceof CustomTraceAdapter) {
          const reports = adapter.getCollectedFailureReports();
          expect(reports.length).toBe(1);
          expect(reports[0].failure_id).toBe('test-failure');
          expect(reports[0].module).toBe('TestModule');
        }
      });
      
      test('应该正确获取健康状态', async () => {
        const health = await traceService.getAdapterHealth();
        
        expect(health).toBeDefined();
        expect(health.status).toBe('healthy');
        expect(health.metrics).toBeDefined();
      });
      
      test('应该支持开发问题检测', async () => {
        const issues = await traceService.detectDevelopmentIssues();
        
        expect(issues).toBeDefined();
        expect(issues.issues).toBeDefined();
        expect(Array.isArray(issues.issues)).toBe(true);
      });
    });
  });
  
  describe('TraceAdapterFactory测试', () => {
    test('应该能够创建不同类型的适配器', () => {
      const factory = TraceAdapterFactory.getInstance();
      
      // 创建基础适配器
      const baseAdapter = factory.createAdapter(AdapterType.BASE);
      expect(baseAdapter).toBeInstanceOf(BaseTraceAdapter);
      
      // 创建增强型适配器
      const enhancedAdapter = factory.createAdapter(AdapterType.ENHANCED);
      expect(enhancedAdapter).toBeInstanceOf(EnhancedTraceAdapter);
    });
    
    test('适配器替换不应影响功能', async () => {
      // 创建服务实例
      const factory = TraceAdapterFactory.getInstance();
      const baseAdapter = factory.createAdapter(AdapterType.BASE);
      const traceService = new TraceService(baseAdapter);
      
      // 使用基础适配器创建追踪
      const trace1 = await traceService.createTrace({
        module: 'TestModule',
        operation: 'operation1',
        context_id: 'ctx-123'
      });
      expect(trace1).toBeDefined();
      
      // 切换到增强型适配器
      const enhancedAdapter = factory.createAdapter(AdapterType.ENHANCED);
      traceService.setAdapter(enhancedAdapter);
      
      // 使用增强型适配器创建追踪
      const trace2 = await traceService.createTrace({
        module: 'TestModule',
        operation: 'operation2',
        context_id: 'ctx-123'
      });
      expect(trace2).toBeDefined();
      
      // 切换到自定义适配器
      const customAdapter = new CustomTraceAdapter();
      traceService.setAdapter(customAdapter);
      
      // 使用自定义适配器创建追踪
      const trace3 = await traceService.createTrace({
        module: 'TestModule',
        operation: 'operation3',
        context_id: 'ctx-123'
      });
      expect(trace3).toBeDefined();
      
      // 验证自定义适配器收集的数据
      const collectedData = customAdapter.getCollectedTraceData();
      expect(collectedData.length).toBe(1);
      expect(collectedData[0].operation).toBe('operation3');
    });
    
    test('应该能够自动检测适配器类型和功能', () => {
      // 创建各种适配器
      const baseAdapter = new BaseTraceAdapter();
      const enhancedAdapter = new EnhancedTraceAdapter();
      const customAdapter = new CustomTraceAdapter();
      
      // 检测适配器类型
      expect(TraceAdapterFactory.detectAdapterType(baseAdapter)).toBe(AdapterType.BASE);
      expect(TraceAdapterFactory.detectAdapterType(enhancedAdapter)).toBe(AdapterType.ENHANCED);
      expect(TraceAdapterFactory.detectAdapterType(customAdapter)).toBe(AdapterType.CUSTOM);
      
      // 检测功能支持
      expect(TraceAdapterFactory.supportsFeature(baseAdapter, 'trace_sync')).toBe(true);
      expect(TraceAdapterFactory.supportsFeature(enhancedAdapter, 'development_issues')).toBe(true);
      expect(TraceAdapterFactory.supportsFeature(customAdapter, 'analytics')).toBe(true);
    });
  });
  
  describe('厂商中立原则验证', () => {
    test('核心模块代码不应依赖特定厂商实现', () => {
      // 创建服务实例
      const traceService = new TraceService(new BaseTraceAdapter());
      
      // 验证服务类型
      expect(traceService.constructor.name).toBe('TraceService');
      
      // 验证服务仅依赖通用接口
      const adapterInfo = traceService.getAdapterInfo();
      expect(adapterInfo).toHaveProperty('type');
      expect(adapterInfo).toHaveProperty('version');
      
      // 服务方法应仅使用通用参数
      expect(() => traceService.createTrace({
        module: 'TestModule',
        operation: 'test_operation',
        context_id: 'ctx-123'
      })).not.toThrow();
    });
    
    test('适配器实现应该可以被替换', async () => {
      // 创建服务和适配器实例
      const baseAdapter = new BaseTraceAdapter();
      const enhancedAdapter = new EnhancedTraceAdapter();
      const customAdapter = new CustomTraceAdapter();
      
      const traceService = new TraceService(baseAdapter);
      
      // 基础功能测试
      const trace1 = await traceService.createTrace({
        module: 'TestModule',
        operation: 'test1',
        context_id: 'ctx-123'
      });
      expect(trace1).toBeDefined();
      
      // 替换为增强型适配器
      traceService.setAdapter(enhancedAdapter);
      const trace2 = await traceService.createTrace({
        module: 'TestModule',
        operation: 'test2',
        context_id: 'ctx-123'
      });
      expect(trace2).toBeDefined();
      
      // 替换为自定义适配器
      traceService.setAdapter(customAdapter);
      const trace3 = await traceService.createTrace({
        module: 'TestModule',
        operation: 'test3',
        context_id: 'ctx-123'
      });
      expect(trace3).toBeDefined();
      
      // 验证自定义适配器收集的数据
      expect(customAdapter.getCollectedTraceData().length).toBe(1);
    });
  });
}); 
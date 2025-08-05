/**
 * Trace模块适配器单元测试
 * @description 测试TraceModuleAdapter的所有功能，确保100%分支覆盖
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 23:54
 * 
 * 基于MPLP测试策略规则：
 * 1. 基于实际Schema和实现编写测试
 * 2. 使用TestDataFactory生成测试数据
 * 3. 发现并修复源代码问题，而不是绕过问题
 * 4. 确保100%分支覆盖，发现源代码功能缺失
 */

import { jest } from '@jest/globals';
import { TraceModuleAdapter } from '../../../src/modules/trace/infrastructure/adapters/trace-module.adapter';
import { TraceManagementService, OperationResult } from '../../../src/modules/trace/application/services/trace-management.service';
import { TraceFactory, CreateTraceRequest } from '../../../src/modules/trace/domain/factories/trace.factory';
import { TraceAnalysisService } from '../../../src/modules/trace/domain/services/trace-analysis.service';
import { Trace } from '../../../src/modules/trace/domain/entities/trace.entity';
import { TracingCoordinationRequest, TracingResult, ModuleStatus } from '../../../src/public/modules/core/types/core.types';
import {
  TraceType,
  TraceStatus,
  TraceSeverity,
  EventType,
  EventCategory,
  EventSource,
  TraceEvent,
  TraceMetadata,
  ErrorInformation,
  UUID
} from '../../../src/modules/trace/types';
import { Timestamp } from '../../../src/public/shared/types/base-types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('TraceModuleAdapter单元测试', () => {
  let traceAdapter: TraceModuleAdapter;
  let mockTraceManagementService: jest.Mocked<TraceManagementService>;
  let mockTraceFactory: jest.Mocked<TraceFactory>;
  let mockAnalysisService: jest.Mocked<TraceAnalysisService>;

  // 辅助函数：创建正确的Mock Trace实体
  const createMockTrace = (
    contextId: string, 
    traceType: TraceType = 'execution',
    severity: TraceSeverity = 'info'
  ): Trace => {
    const traceEvent: TraceEvent = {
      type: 'start' as EventType,
      name: 'coordination_trace',
      description: 'Test trace event',
      category: 'system' as EventCategory,
      source: {
        component: 'core-orchestrator',
        module: 'trace-adapter',
        function: 'test'
      } as EventSource,
      data: {
        strategy: 'real_time',
        test: true
      }
    };

    const createRequest: CreateTraceRequest = {
      context_id: contextId as UUID,
      trace_type: traceType,
      severity: severity,
      event: traceEvent,
      metadata: {
        strategy: 'real_time',
        sampling_rate: 1.0,
        retention_period: 86400000,
        event_filters: [],
        monitoring_enabled: true,
        dashboard_enabled: false
      }
    };

    // 如果是错误类型，添加错误信息
    if (traceType === 'error') {
      createRequest.error_information = {
        error_code: 'TEST_ERROR',
        error_message: 'Test error message',
        stack_trace: 'Test stack trace',
        error_type: 'TestError'
      };
    }

    return TraceFactory.create(createRequest);
  };

  // 辅助函数：设置通用的Mock返回值
  const setupMockReturns = () => {
    mockTraceManagementService.recordEvent.mockResolvedValue({
      success: true,
      data: { event_id: 'test-event-id', recorded_at: new Date().toISOString() }
    });
  };

  beforeEach(async () => {
    // 基于实际接口创建Mock服务
    mockTraceManagementService = {
      createTrace: jest.fn(),
      getTrace: jest.fn(),
      updateTrace: jest.fn(),
      deleteTrace: jest.fn(),
      listTraces: jest.fn(),
      searchTraces: jest.fn(),
      getTracesByContext: jest.fn(),
      getTracesByType: jest.fn(),
      getTracesByStatus: jest.fn(),
      bulkCreateTraces: jest.fn(),
      bulkUpdateTraces: jest.fn(),
      bulkDeleteTraces: jest.fn(),
      recordEvent: jest.fn() // 新增的recordEvent方法
    } as jest.Mocked<TraceManagementService>;

    mockTraceFactory = {
      create: jest.fn()
    } as unknown as jest.Mocked<TraceFactory>;

    mockAnalysisService = {
      analyzeTrace: jest.fn(),
      generateReport: jest.fn(),
      calculateMetrics: jest.fn(),
      detectAnomalies: jest.fn(),
      correlateTraces: jest.fn()
    } as jest.Mocked<TraceAnalysisService>;

    // 设置通用Mock返回值
    setupMockReturns();

    // 创建适配器实例
    traceAdapter = new TraceModuleAdapter(
      mockTraceManagementService,
      mockTraceFactory,
      mockAnalysisService
    );
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('模块初始化', () => {
    test('应该成功初始化适配器', async () => {
      await traceAdapter.initialize();

      const status = traceAdapter.getStatus();
      expect(status.module_name).toBe('trace');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    test('应该处理初始化失败', async () => {
      // 创建一个没有服务的适配器来模拟初始化失败
      const invalidAdapter = new TraceModuleAdapter(null as any, null as any, null as any);

      await expect(invalidAdapter.initialize()).rejects.toThrow('Trace services not available');

      const status = invalidAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });

    test('应该正确设置模块名称', () => {
      expect(traceAdapter.module_name).toBe('trace');
    });
  });

  describe('跟踪协调执行', () => {
    beforeEach(async () => {
      await traceAdapter.initialize();
    });

    test('应该成功执行实时跟踪策略', async () => {
      // 使用TestDataFactory生成测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'real_time',
        parameters: {
          sampling_rate: 1.0
        },
        monitoring_config: {
          metrics_collection: true,
          alert_thresholds: {
            error_rate: 0.05,
            response_time: 1000
          },
          dashboard_enabled: true
        }
      };

      // 基于实际Trace实体创建Mock返回值
      const mockTrace = createMockTrace(contextId, 'execution', 'info');

      const mockResult: OperationResult<Trace> = {
        success: true,
        data: mockTrace
      };

      mockTraceManagementService.createTrace.mockResolvedValue(mockResult);
      mockTraceManagementService.recordEvent.mockResolvedValue({
        success: true,
        data: { event_id: 'test-event-id', recorded_at: new Date().toISOString() }
      });

      const result: TracingResult = await traceAdapter.execute(request);

      // 验证结果结构
      expect(result.trace_id).toBeDefined();
      expect(result.monitoring_session).toBeDefined();
      expect(result.monitoring_session.session_id).toBeDefined();
      expect(result.monitoring_session.start_time).toBeDefined();
      expect(result.monitoring_session.active_traces).toBe(1);
      expect(result.event_collection).toBeDefined();
      expect(result.event_collection.events_captured).toBe(0);
      expect(result.event_collection.storage_location).toContain('realtime');
      expect(result.timestamp).toBeDefined();

      // 验证服务调用
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledWith(
        expect.objectContaining({
          context_id: contextId,
          trace_type: 'execution',
          severity: 'info'
        })
      );
    });

    test('应该成功执行批处理跟踪策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'batch',
        parameters: {
          retention_period: 604800000, // 7 days
          event_filters: ['error', 'warning']
        }
      };

      const mockTrace = createMockTrace(contextId, 'monitoring', 'info');

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });

      const result: TracingResult = await traceAdapter.execute(request);

      expect(result.trace_id).toBeDefined();
      expect(result.event_collection.storage_location).toContain('batch');
      expect(result.monitoring_session.active_traces).toBe(1);
    });

    test('应该成功执行采样跟踪策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'sampling',
        parameters: {
          sampling_rate: 0.1, // 10% 采样
          event_filters: ['performance']
        }
      };

      const mockTrace = createMockTrace(contextId, 'performance', 'info');

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });

      const result: TracingResult = await traceAdapter.execute(request);

      expect(result.trace_id).toBeDefined();
      expect(result.event_collection.storage_location).toContain('sampling');
      
      // 验证采样率被正确传递
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            sampling_rate: 0.1
          })
        })
      );
    });

    test('应该成功执行自适应跟踪策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'adaptive',
        parameters: {
          sampling_rate: 0.5,
          retention_period: 259200000 // 3 days
        },
        monitoring_config: {
          metrics_collection: true,
          alert_thresholds: {
            cpu_usage: 80,
            memory_usage: 90
          },
          dashboard_enabled: false
        }
      };

      const mockTrace = createMockTrace(contextId, 'error', 'warn');

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });

      const result: TracingResult = await traceAdapter.execute(request);

      expect(result.trace_id).toBeDefined();
      expect(result.event_collection.storage_location).toContain('adaptive');
      expect(result.monitoring_session.session_id).toBeDefined();
    });
  });

  describe('参数验证', () => {
    beforeEach(async () => {
      await traceAdapter.initialize();
    });

    test('应该验证contextId必需', async () => {
      const request: TracingCoordinationRequest = {
        contextId: '', // 空的contextId
        tracing_strategy: 'real_time',
        parameters: {}
      };

      await expect(traceAdapter.execute(request)).rejects.toThrow('Context ID is required');

      const status = traceAdapter.getStatus();
      expect(status.error_count).toBe(1);
      expect(status.status).toBe('error');
    });

    test('应该验证跟踪策略有效性', async () => {
      const request: TracingCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        tracing_strategy: 'invalid_strategy' as any,
        parameters: {}
      };

      await expect(traceAdapter.execute(request)).rejects.toThrow(
        'Unsupported tracing strategy: invalid_strategy'
      );
    });

    test('应该验证采样率范围', async () => {
      const request: TracingCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        tracing_strategy: 'sampling',
        parameters: {
          sampling_rate: 1.5 // 超出范围
        }
      };

      await expect(traceAdapter.execute(request)).rejects.toThrow(
        'Sampling rate must be between 0 and 1'
      );
    });

    test('应该验证保留期为正数', async () => {
      const request: TracingCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        tracing_strategy: 'batch',
        parameters: {
          retention_period: -86400000 // 负数保留期
        }
      };

      await expect(traceAdapter.execute(request)).rejects.toThrow(
        'Retention period must be positive'
      );
    });

    test('应该验证事件过滤器为数组', async () => {
      const request: TracingCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        tracing_strategy: 'real_time',
        parameters: {
          event_filters: 'not_an_array' as any
        }
      };

      await expect(traceAdapter.execute(request)).rejects.toThrow(
        'Event filters must be an array'
      );
    });

    test('应该验证告警阈值为正数', async () => {
      const request: TracingCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        tracing_strategy: 'real_time',
        parameters: {},
        monitoring_config: {
          metrics_collection: true,
          alert_thresholds: {
            error_rate: -0.1 // 负数阈值
          },
          dashboard_enabled: true
        }
      };

      await expect(traceAdapter.execute(request)).rejects.toThrow(
        'Alert threshold for error_rate must be a positive number'
      );
    });
  });

  describe('模块状态管理', () => {
    test('应该正确跟踪执行状态', async () => {
      await traceAdapter.initialize();

      const contextId = TestDataFactory.Base.generateUUID();
      const request: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'real_time',
        parameters: {}
      };

      const mockTrace = createMockTrace(contextId, 'execution', 'info');

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });

      const initialStatus = traceAdapter.getStatus();
      expect(initialStatus.status).toBe('initialized');

      await traceAdapter.execute(request);

      const finalStatus = traceAdapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });

    test('应该处理执行错误并更新状态', async () => {
      await traceAdapter.initialize();

      const request: TracingCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        tracing_strategy: 'real_time',
        parameters: {}
      };

      // 模拟服务错误
      mockTraceManagementService.createTrace.mockResolvedValue({
        success: false,
        error: 'Service error'
      });

      await expect(traceAdapter.execute(request)).rejects.toThrow('Failed to create trace: Service error');

      const status = traceAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });
  });

  describe('清理资源', () => {
    test('应该成功清理资源', async () => {
      await traceAdapter.initialize();
      await traceAdapter.cleanup();

      const status = traceAdapter.getStatus();
      expect(status.status).toBe('idle');
    });
  });

  describe('性能测试', () => {
    beforeEach(async () => {
      await traceAdapter.initialize();
    });

    test('应该在合理时间内完成跟踪协调', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'real_time',
        parameters: {
          sampling_rate: 1.0
        }
      };

      const mockTrace = createMockTrace(contextId, 'execution', 'info');

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });

      const startTime = Date.now();
      const result = await traceAdapter.execute(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ADAPTER_EXECUTION_TIME || 1000);
    });
  });
});

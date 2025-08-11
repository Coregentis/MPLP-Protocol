/**
 * Trace管理服务单元测试
 * 
 * 基于Schema驱动测试原则，测试TraceManagementService的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T17:30:00+08:00
 */

import { jest } from '@jest/globals';
import { TraceManagementService, OperationResult } from '../../../src/modules/trace/application/services/trace-management.service';
import { Trace } from '../../../src/modules/trace/domain/entities/trace.entity';
import { ITraceRepository, TraceFilter, PaginationOptions, PaginatedResult, TraceStatistics } from '../../../src/modules/trace/domain/repositories/trace-repository.interface';
import { TraceFactory, CreateTraceRequest } from '../../../src/modules/trace/domain/factories/trace.factory';
import { TraceAnalysisService, AnalysisResult } from '../../../src/modules/trace/domain/services/trace-analysis.service';

// Mock TraceFactory静态方法
jest.mock('../../../src/modules/trace/domain/factories/trace.factory');
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent, 
  PerformanceMetrics, 
  ErrorInformation, 
  Correlation, 
  TraceMetadata 
} from '../../../src/modules/trace/types';
import { UUID } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('TraceManagementService', () => {
  let service: TraceManagementService;
  let mockRepository: jest.Mocked<ITraceRepository>;
  let mockAnalysisService: jest.Mocked<TraceAnalysisService>;

  const mockTraceFactory = TraceFactory as jest.Mocked<typeof TraceFactory>;

  // 辅助函数：创建有效的TraceEvent
  const createValidEvent = (event_name: string = 'test_event'): TraceEvent => ({
    type: 'start',
    name: event_name,
    description: 'Test event description',
    category: 'system',
    source: {
      component: 'test_component',
      module: 'test_module',
      function: 'test_function',
      line_number: 123
    },
    data: { test: true }
  });

  // 辅助函数：创建有效的PerformanceMetrics
  const createValidMetrics = (): PerformanceMetrics => ({
    execution_time: {
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: 150
    },
    resource_usage: {
      cpu: {
        utilization_percent: 50.5,
        instructions: 1000000,
        cache_misses: 100
      },
      memory: {
        peak_usage_mb: 256,
        average_usage_mb: 200,
        allocations: 1000,
        deallocations: 900
      }
    },
    custom_metrics: {
      test_metric: {
        value: 42,
        unit: 'count',
        type: 'counter'
      }
    }
  });

  // 辅助函数：创建有效的ErrorInformation
  const createValidError = (): ErrorInformation => ({
    error_code: 'TEST_ERROR',
    error_message: 'Test error message',
    error_type: 'validation',
    stack_trace: [
      {
        file: 'test.ts',
        function: 'testFunction',
        line: 123,
        column: 45
      }
    ],
    recovery_actions: [
      {
        action: 'retry',
        description: 'Retry the operation',
        parameters: { max_retries: 3 }
      }
    ]
  });

  beforeEach(() => {
    // 基于实际接口创建Mock依赖
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      findByContextId: jest.fn(),
      search: jest.fn(),
      cleanupExpiredTraces: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      getStatistics: jest.fn()
    } as unknown as jest.Mocked<ITraceRepository>;

    mockAnalysisService = {
      analyzeTraces: jest.fn(),
      detectCorrelations: jest.fn(),
      analyzePerformance: jest.fn(),
      generateReport: jest.fn()
    } as unknown as jest.Mocked<TraceAnalysisService>;

    // 创建服务实例 - 基于实际构造函数
    // 注意：TraceFactory是静态类，服务中直接调用静态方法
    service = new TraceManagementService(
      mockRepository,
      {} as TraceFactory, // 传入空对象，因为实际不使用实例方法
      mockAnalysisService
    );
  });

  afterEach(async () => {
    // 清理测试数据
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('createTrace', () => {
    it('应该成功创建Trace', async () => {
      // 准备测试数据 - 基于实际Schema
      const createRequest: CreateTraceRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        plan_id: TestDataFactory.Base.generateUUID(),
        trace_type: 'execution',
        severity: 'info',
        event: createValidEvent('test_event'),
        performance_metrics: createValidMetrics(),
        metadata: { test: true }
      };

      const mockTrace = new Trace(
        TestDataFactory.Base.generateUUID(),
        createRequest.context_id,
        '1.0.0',
        createRequest.trace_type,
        createRequest.severity,
        createRequest.event,
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        createRequest.plan_id,
        createRequest.performance_metrics,
        undefined,
        [],
        createRequest.metadata
      );

      // 设置Mock返回值 - 基于实际接口
      const validationResult = {
        isValid: true,
        errors: []
      };
      mockTraceFactory.validateCreateRequest.mockReturnValue(validationResult);
      mockTraceFactory.create.mockReturnValue(mockTrace);
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.createTrace(createRequest),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果 - 基于实际返回类型
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrace);
      expect(mockTraceFactory.validateCreateRequest).toHaveBeenCalledWith(createRequest);
      expect(mockTraceFactory.create).toHaveBeenCalledWith(createRequest);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTrace);
    });

    it('应该处理验证失败', async () => {
      // 准备测试数据
      const createRequest: CreateTraceRequest = {
        context_id: '', // 无效context_id
        trace_type: 'execution',
        severity: 'info',
        event: createValidEvent()
      };

      const validationResult = {
        isValid: false,
        errors: ['Context ID is required']
      };
      mockTraceFactory.validateCreateRequest.mockReturnValue(validationResult);

      // 执行测试
      const result = await service.createTrace(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Context ID is required');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const createRequest: CreateTraceRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        trace_type: 'execution',
        severity: 'info',
        event: createValidEvent()
      };

      const mockTrace = new Trace(
        TestDataFactory.Base.generateUUID(),
        createRequest.context_id,
        '1.0.0',
        createRequest.trace_type,
        createRequest.severity,
        createRequest.event,
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const validationResult = { 
        isValid: true, 
        errors: [] 
      };
      const dbError = new Error('Database connection failed');

      mockTraceFactory.validateCreateRequest.mockReturnValue(validationResult);
      mockTraceFactory.create.mockReturnValue(mockTrace);
      mockRepository.save.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.createTrace(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('创建追踪失败: Database connection failed');
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '空字符串context_id',
          input: { 
            context_id: '', 
            trace_type: 'execution' as TraceType,
            severity: 'info' as TraceSeverity,
            event: createValidEvent()
          },
          expectedError: 'Context ID is required'
        },
        {
          name: '最小必需参数',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            trace_type: 'execution' as TraceType,
            severity: 'info' as TraceSeverity,
            event: createValidEvent()
          },
          expectedSuccess: true
        },
        {
          name: '包含所有可选参数',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            plan_id: TestDataFactory.Base.generateUUID(),
            trace_type: 'execution' as TraceType,
            severity: 'info' as TraceSeverity,
            event: createValidEvent(),
            performance_metrics: createValidMetrics(),
            error_information: createValidError(),
            metadata: { test: true }
          },
          expectedSuccess: true
        }
      ];

      for (const test of boundaryTests) {
        if (test.expectedError) {
          const validationResult = { 
            isValid: false, 
            errors: [test.expectedError] 
          };
          mockTraceFactory.validateCreateRequest.mockReturnValue(validationResult);
          
          const result = await service.createTrace(test.input);
          expect(result.success).toBe(false);
          expect(result.error).toBe(test.expectedError);
        } else if (test.expectedSuccess) {
          const validationResult = { 
            isValid: true, 
            errors: [] 
          };
          const mockTrace = new Trace(
            TestDataFactory.Base.generateUUID(),
            test.input.context_id,
            '1.0.0',
            test.input.trace_type,
            test.input.severity,
            test.input.event,
            new Date().toISOString(),
            new Date().toISOString(),
            new Date().toISOString(),
            test.input.plan_id,
            test.input.performance_metrics,
            test.input.error_information,
            [],
            test.input.metadata
          );

          mockTraceFactory.validateCreateRequest.mockReturnValue(validationResult);
          mockTraceFactory.create.mockReturnValue(mockTrace);
          mockRepository.save.mockResolvedValue(undefined);

          const result = await service.createTrace(test.input);
          expect(result.success).toBe(true);
        }
        
        // 清理Mock状态
        jest.clearAllMocks();
      }
    });
  });

  describe('getTraceById', () => {
    it('应该成功获取Trace', async () => {
      // 准备测试数据
      const traceId = TestDataFactory.Base.generateUUID();
      const mockTrace = new Trace(
        traceId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'execution',
        'info',
        createValidEvent(),
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(mockTrace);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.getTraceById(traceId),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrace);
      expect(mockRepository.findById).toHaveBeenCalledWith(traceId);
    });

    it('应该处理Trace不存在的情况', async () => {
      // 准备测试数据
      const traceId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.getTraceById(traceId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('追踪不存在');
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const traceId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findById.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getTraceById(traceId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('获取追踪失败: Database connection failed');
    });
  });



  describe('queryTraces', () => {
    it('应该成功查询Trace列表', async () => {
      // 准备测试数据
      const filter: TraceFilter = {
        context_id: TestDataFactory.Base.generateUUID(),
        trace_type: 'execution'
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const mockResult: PaginatedResult<Trace> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);

      // 执行测试
      const result = await service.queryTraces(filter, pagination);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
    });
  });

  describe('analyzeTraces', () => {
    it('应该成功分析指定上下文的Trace', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const mockTraces: Trace[] = [];
      const mockAnalysis: AnalysisResult = {
        summary: {
          total_traces: 0,
          error_count: 0,
          warning_count: 0,
          performance_issues: 0
        },
        patterns: [],
        recommendations: []
      };

      // 设置Mock返回值
      mockRepository.findByContextId.mockResolvedValue(mockTraces);
      mockAnalysisService.analyzeTraces.mockReturnValue(mockAnalysis);

      // 执行测试
      const result = await service.analyzeTraces(contextId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnalysis);
      expect(mockRepository.findByContextId).toHaveBeenCalledWith(contextId);
      expect(mockAnalysisService.analyzeTraces).toHaveBeenCalledWith(mockTraces);
    });

    it('应该成功分析所有Trace', async () => {
      // 准备测试数据
      const mockResult: PaginatedResult<Trace> = {
        items: [],
        total: 0,
        page: 1,
        limit: 1000,
        total_pages: 0
      };
      const mockAnalysis: AnalysisResult = {
        summary: {
          total_traces: 0,
          error_count: 0,
          warning_count: 0,
          performance_issues: 0
        },
        patterns: [],
        recommendations: []
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);
      mockAnalysisService.analyzeTraces.mockReturnValue(mockAnalysis);

      // 执行测试
      const result = await service.analyzeTraces();

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnalysis);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith({}, { page: 1, limit: 1000 });
      expect(mockAnalysisService.analyzeTraces).toHaveBeenCalledWith(mockResult.items);
    });
  });

  describe('searchTraces', () => {
    it('应该成功搜索Trace', async () => {
      // 准备测试数据
      const query = 'test search';
      const filter: TraceFilter = {
        trace_type: 'execution'
      };
      const mockTraces: Trace[] = [];

      // 设置Mock返回值
      mockRepository.search.mockResolvedValue(mockTraces);

      // 执行测试
      const result = await service.searchTraces(query, filter);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTraces);
      expect(mockRepository.search).toHaveBeenCalledWith(query, filter);
    });

    it('应该处理无过滤器的搜索', async () => {
      // 准备测试数据
      const query = 'test search';
      const mockTraces: Trace[] = [];

      // 设置Mock返回值
      mockRepository.search.mockResolvedValue(mockTraces);

      // 执行测试
      const result = await service.searchTraces(query);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTraces);
      expect(mockRepository.search).toHaveBeenCalledWith(query, undefined);
    });
  });

  describe('cleanupExpiredTraces', () => {
    it('应该成功清理过期Trace', async () => {
      // 准备测试数据
      const olderThanDays = 30;
      const deletedCount = 5;

      // 设置Mock返回值
      mockRepository.cleanupExpiredTraces.mockResolvedValue(deletedCount);

      // 执行测试
      const result = await service.cleanupExpiredTraces(olderThanDays);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBe(deletedCount);
      expect(mockRepository.cleanupExpiredTraces).toHaveBeenCalledWith(olderThanDays);
    });
  });
});

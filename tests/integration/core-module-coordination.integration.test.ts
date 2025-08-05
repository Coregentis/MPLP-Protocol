/**
 * Core模块协调集成测试
 * @description 测试Core模块与Plan、Confirm、Trace模块适配器的协调功能
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-05 00:30
 * 
 * 基于MPLP测试策略规则：
 * 1. 验证真实的模块间协调功能
 * 2. 发现隐藏的集成问题
 * 3. 确保源代码修复的有效性
 * 4. 验证完整的工作流协调
 */

import { jest } from '@jest/globals';
import { CoreOrchestrator } from '../../src/public/modules/core/orchestrator/core-orchestrator';
import { PlanModuleAdapter } from '../../src/modules/plan/infrastructure/adapters/plan-module.adapter';
import { ConfirmModuleAdapter } from '../../src/modules/confirm/infrastructure/adapters/confirm-module.adapter';
import { TraceModuleAdapter } from '../../src/modules/trace/infrastructure/adapters/trace-module.adapter';

// Core types
import {
  PlanningCoordinationRequest,
  PlanningResult,
  ConfirmationCoordinationRequest,
  ConfirmationResult,
  TracingCoordinationRequest,
  TracingResult,
  OrchestratorConfiguration,
  WorkflowConfiguration,
  UUID
} from '../../src/public/modules/core/types/core.types';

// Module services
import { PlanManagementService } from '../../src/modules/plan/application/services/plan-management.service';
import { PlanExecutionService } from '../../src/modules/plan/application/services/plan-execution.service';
import { PlanFactory } from '../../src/modules/plan/domain/factories/plan.factory';
import { PlanValidationService } from '../../src/modules/plan/domain/services/plan-validation.service';

import { ConfirmManagementService } from '../../src/modules/confirm/application/services/confirm-management.service';
import { ConfirmFactory } from '../../src/modules/confirm/domain/factories/confirm.factory';
import { ConfirmValidationService } from '../../src/modules/confirm/domain/services/confirm-validation.service';

import { TraceManagementService } from '../../src/modules/trace/application/services/trace-management.service';
import { TraceFactory } from '../../src/modules/trace/domain/factories/trace.factory';
import { TraceAnalysisService } from '../../src/modules/trace/domain/services/trace-analysis.service';

import { TestDataFactory } from '../public/test-utils/test-data-factory';
import { TestHelpers } from '../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../test-config';

describe('Core模块协调集成测试', () => {
  let coreOrchestrator: CoreOrchestrator;
  let planAdapter: PlanModuleAdapter;
  let confirmAdapter: ConfirmModuleAdapter;
  let traceAdapter: TraceModuleAdapter;

  // Mock services
  let mockPlanManagementService: jest.Mocked<PlanManagementService>;
  let mockPlanExecutionService: jest.Mocked<PlanExecutionService>;
  let mockPlanFactory: jest.Mocked<PlanFactory>;
  let mockPlanValidationService: jest.Mocked<PlanValidationService>;

  let mockConfirmManagementService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmFactory: jest.Mocked<ConfirmFactory>;
  let mockConfirmValidationService: jest.Mocked<ConfirmValidationService>;

  let mockTraceManagementService: jest.Mocked<TraceManagementService>;
  let mockTraceFactory: jest.Mocked<TraceFactory>;
  let mockTraceAnalysisService: jest.Mocked<TraceAnalysisService>;

  beforeEach(async () => {
    // 创建Mock服务 - Plan模块
    mockPlanManagementService = {
      createPlan: jest.fn(),
      getPlan: jest.fn(),
      updatePlan: jest.fn(),
      deletePlan: jest.fn(),
      updatePlanStatus: jest.fn(),
      findPlans: jest.fn(),
      countPlans: jest.fn(),
      isPlanExecutable: jest.fn()
    } as jest.Mocked<PlanManagementService>;

    mockPlanExecutionService = {
      executePlan: jest.fn(),
      pausePlan: jest.fn(),
      resumePlan: jest.fn(),
      cancelPlan: jest.fn(),
      getExecutionStatus: jest.fn(),
      getExecutionHistory: jest.fn()
    } as jest.Mocked<PlanExecutionService>;

    mockPlanFactory = {
      create: jest.fn()
    } as unknown as jest.Mocked<PlanFactory>;

    mockPlanValidationService = {
      validateCreateRequest: jest.fn(),
      validateUpdateRequest: jest.fn(),
      validateStatusTransition: jest.fn()
    } as jest.Mocked<PlanValidationService>;

    // 创建Mock服务 - Confirm模块
    mockConfirmManagementService = {
      createConfirm: jest.fn(),
      getConfirmById: jest.fn(),
      updateConfirmStatus: jest.fn(),
      cancelConfirm: jest.fn(),
      queryConfirms: jest.fn(),
      getPendingConfirms: jest.fn(),
      processExpiredConfirms: jest.fn(),
      getConfirmStatistics: jest.fn(),
      batchUpdateStatus: jest.fn()
    } as jest.Mocked<ConfirmManagementService>;

    mockConfirmFactory = {
      create: jest.fn()
    } as unknown as jest.Mocked<ConfirmFactory>;

    mockConfirmValidationService = {
      validateCreateRequest: jest.fn(),
      validateUpdateRequest: jest.fn(),
      validateStatusTransition: jest.fn()
    } as jest.Mocked<ConfirmValidationService>;

    // 创建Mock服务 - Trace模块
    mockTraceManagementService = {
      createTrace: jest.fn(),
      getTraceById: jest.fn(),
      queryTraces: jest.fn(),
      getErrorTraces: jest.fn(),
      getPerformanceTraces: jest.fn(),
      addCorrelation: jest.fn(),
      updatePerformanceMetrics: jest.fn(),
      setErrorInformation: jest.fn(),
      analyzeTraces: jest.fn(),
      analyzePerformance: jest.fn(),
      getTraceChain: jest.fn(),
      getStatistics: jest.fn(),
      searchTraces: jest.fn(),
      cleanupExpiredTraces: jest.fn(),
      deleteTrace: jest.fn(),
      batchDeleteTraces: jest.fn(),
      detectAndAddCorrelations: jest.fn(),
      recordEvent: jest.fn() // 修复后的方法
    } as jest.Mocked<TraceManagementService>;

    mockTraceFactory = {
      create: jest.fn()
    } as unknown as jest.Mocked<TraceFactory>;

    mockTraceAnalysisService = {
      analyzeTrace: jest.fn(),
      generateReport: jest.fn(),
      calculateMetrics: jest.fn(),
      detectAnomalies: jest.fn(),
      correlateTraces: jest.fn()
    } as jest.Mocked<TraceAnalysisService>;

    // 创建适配器实例
    planAdapter = new PlanModuleAdapter(
      mockPlanManagementService,
      mockPlanExecutionService
    );

    confirmAdapter = new ConfirmModuleAdapter(
      mockConfirmManagementService,
      mockConfirmFactory,
      mockConfirmValidationService
    );

    traceAdapter = new TraceModuleAdapter(
      mockTraceManagementService,
      mockTraceFactory,
      mockTraceAnalysisService
    );

    // 先初始化各个适配器
    await planAdapter.initialize();
    await confirmAdapter.initialize();
    await traceAdapter.initialize();

    // 创建Core协调器配置
    const orchestratorConfig: OrchestratorConfiguration = {
      default_workflow: {
        execution_strategy: 'sequential',
        timeout_ms: 30000,
        retry_policy: {
          max_retries: 3,
          retry_delay_ms: 1000
        }
      } as WorkflowConfiguration,
      module_timeout_ms: 10000,
      max_concurrent_executions: 5,
      enable_performance_monitoring: true,
      enable_event_logging: true
    };

    // 创建Core协调器并注册模块
    coreOrchestrator = new CoreOrchestrator(orchestratorConfig);

    // 注册已初始化的模块适配器
    coreOrchestrator.registerModule(planAdapter);
    coreOrchestrator.registerModule(confirmAdapter);
    coreOrchestrator.registerModule(traceAdapter);

    // 初始化Core协调器（会再次调用模块的initialize，但适配器应该处理重复初始化）
    await coreOrchestrator.initialize();
  });

  afterEach(async () => {
    await coreOrchestrator.cleanup();
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('Plan模块协调集成', () => {
    test('应该成功协调Plan模块的规划功能', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const planRequest: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {
          decomposition_rules: ['task_based', 'priority_based'],
          priority_weights: { urgent: 1.0, normal: 0.5 },
          resource_constraints: { max_parallel_tasks: 5 }
        }
      };

      // 设置Mock返回值
      const mockPlan = TestDataFactory.Plan.createPlanData({ context_id: contextId });
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      // 执行协调
      const result: PlanningResult = await coreOrchestrator.coordinatePlanning(planRequest);

      // 验证结果
      expect(result.plan_id).toBeDefined();
      expect(result.task_breakdown).toBeDefined();
      expect(result.resource_allocation).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // 验证服务调用
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledTimes(1);
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          context_id: contextId,
          execution_strategy: 'sequential'
        })
      );
    });
  });

  describe('Confirm模块协调集成', () => {
    test('应该成功协调Confirm模块的确认功能', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const confirmRequest: ConfirmationCoordinationRequest = {
        contextId: contextId,
        confirmation_strategy: 'manual',
        parameters: {
          approval_rules: ['manager_approval'],
          timeout_ms: 3600000
        },
        approval_workflow: {
          required_approvers: ['manager1', 'manager2'],
          approval_threshold: 2,
          parallel_approval: true
        }
      };

      // 设置Mock返回值
      const mockConfirm = TestDataFactory.Confirm.createConfirmData({ context_id: contextId });
      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      // 执行协调
      const result: ConfirmationResult = await coreOrchestrator.coordinateConfirmation(confirmRequest);

      // 验证结果
      expect(result.confirmation_id).toBeDefined();
      expect(result.approval_status).toBeDefined();
      expect(result.approver_responses).toBeDefined();
      expect(result.final_decision).toBeDefined();

      // 验证服务调用
      expect(mockConfirmManagementService.createConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Trace模块协调集成', () => {
    test('应该成功协调Trace模块的跟踪功能', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const traceRequest: TracingCoordinationRequest = {
        contextId: contextId,
        tracing_strategy: 'real_time',
        parameters: {
          sampling_rate: 1.0,
          retention_period: 86400000,
          event_filters: ['error', 'warning']
        },
        monitoring_config: {
          metrics_collection: true,
          alert_thresholds: { error_rate: 0.05 },
          dashboard_enabled: true
        }
      };

      // 设置Mock返回值
      const mockTrace = TestDataFactory.Trace.createTraceData({ context_id: contextId });
      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });
      
      // 设置recordEvent Mock返回值（验证源代码修复）
      mockTraceManagementService.recordEvent.mockResolvedValue({
        success: true,
        data: { event_id: 'test-event-id', recorded_at: new Date().toISOString() }
      });

      // 执行协调
      const result: TracingResult = await coreOrchestrator.coordinateTracing(traceRequest);

      // 验证结果
      expect(result.trace_id).toBeDefined();
      expect(result.monitoring_session).toBeDefined();
      expect(result.event_collection).toBeDefined();
      expect(result.timestamp).toBeDefined();

      // 验证服务调用
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledTimes(1);
      
      // 验证recordEvent方法被调用（验证源代码修复有效）
      expect(mockTraceManagementService.recordEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('多模块协调集成', () => {
    test('应该成功协调多个模块的完整工作流', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置所有Mock返回值
      const mockPlan = TestDataFactory.Plan.createPlanData({ context_id: contextId });
      const mockConfirm = TestDataFactory.Confirm.createConfirmData({ context_id: contextId });
      const mockTrace = TestDataFactory.Trace.createTraceData({ context_id: contextId });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: mockConfirm
      });

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: mockTrace
      });

      mockTraceManagementService.recordEvent.mockResolvedValue({
        success: true,
        data: { event_id: 'test-event-id', recorded_at: new Date().toISOString() }
      });

      // 执行完整工作流
      const planResult = await coreOrchestrator.coordinatePlanning({
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {}
      });

      const confirmResult = await coreOrchestrator.coordinateConfirmation({
        contextId: contextId,
        confirmation_strategy: 'manual',
        parameters: {},
        approval_workflow: {
          required_approvers: ['manager'],
          approval_threshold: 1,
          parallel_approval: false
        }
      });

      const traceResult = await coreOrchestrator.coordinateTracing({
        contextId: contextId,
        tracing_strategy: 'real_time',
        parameters: {},
        monitoring_config: {
          metrics_collection: true,
          alert_thresholds: {},
          dashboard_enabled: false
        }
      });

      // 验证所有结果
      expect(planResult.plan_id).toBeDefined();
      expect(confirmResult.confirmation_id).toBeDefined();
      expect(traceResult.trace_id).toBeDefined();

      // 验证所有服务都被调用
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledTimes(1);
      expect(mockConfirmManagementService.createConfirm).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.recordEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('性能集成测试', () => {
    test('应该在合理时间内完成模块协调', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: TestDataFactory.Plan.createPlanData({ context_id: contextId })
      });

      const startTime = Date.now();
      
      await coreOrchestrator.coordinatePlanning({
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {}
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CORE_COORDINATION_TIME || 2000);
    });
  });
});

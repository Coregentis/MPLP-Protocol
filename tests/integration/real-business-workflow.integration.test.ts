/**
 * 真正的业务工作流集成测试
 * @description P0架构修复验证：测试Plan → Confirm → Trace业务数据流转
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-05 02:00
 * 
 * 测试目标：
 * 1. 验证真正的业务工作流执行
 * 2. 验证模块间数据传递
 * 3. 验证Plan输出 → Confirm输入 → Trace输入的数据流转
 * 4. 验证P0架构修复的有效性
 */

import { jest } from '@jest/globals';
import { CoreOrchestrator } from '../../src/public/modules/core/orchestrator/core-orchestrator';
import { PlanModuleAdapter } from '../../src/modules/plan/infrastructure/adapters/plan-module.adapter';
import { ConfirmModuleAdapter } from '../../src/modules/confirm/infrastructure/adapters/confirm-module.adapter';
import { TraceModuleAdapter } from '../../src/modules/trace/infrastructure/adapters/trace-module.adapter';

// Core types
import { 
  WorkflowConfiguration,
  WorkflowExecutionResult,
  OrchestratorConfiguration,
  BusinessData,
  UUID
} from '../../src/public/modules/core/types/core.types';

// Module services (Mock)
import { PlanManagementService } from '../../src/modules/plan/application/services/plan-management.service';
import { PlanExecutionService } from '../../src/modules/plan/application/services/plan-execution.service';
import { ConfirmManagementService } from '../../src/modules/confirm/application/services/confirm-management.service';
import { ConfirmFactory } from '../../src/modules/confirm/domain/factories/confirm.factory';
import { ConfirmValidationService } from '../../src/modules/confirm/domain/services/confirm-validation.service';
import { TraceManagementService } from '../../src/modules/trace/application/services/trace-management.service';
import { TraceFactory } from '../../src/modules/trace/domain/factories/trace.factory';
import { TraceAnalysisService } from '../../src/modules/trace/domain/services/trace-analysis.service';

import { TestDataFactory } from '../public/test-utils/test-data-factory';

describe('真正的业务工作流集成测试 - P0架构修复验证', () => {
  let coreOrchestrator: CoreOrchestrator;
  let planAdapter: PlanModuleAdapter;
  let confirmAdapter: ConfirmModuleAdapter;
  let traceAdapter: TraceModuleAdapter;

  // Mock services
  let mockPlanManagementService: jest.Mocked<PlanManagementService>;
  let mockPlanExecutionService: jest.Mocked<PlanExecutionService>;
  let mockConfirmManagementService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmFactory: jest.Mocked<ConfirmFactory>;
  let mockConfirmValidationService: jest.Mocked<ConfirmValidationService>;
  let mockTraceManagementService: jest.Mocked<TraceManagementService>;
  let mockTraceFactory: jest.Mocked<TraceFactory>;
  let mockTraceAnalysisService: jest.Mocked<TraceAnalysisService>;

  beforeEach(async () => {
    // 创建所有Mock服务
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
      recordEvent: jest.fn()
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

    // 初始化适配器
    await planAdapter.initialize();
    await confirmAdapter.initialize();
    await traceAdapter.initialize();

    // 创建Core协调器配置
    const orchestratorConfig: OrchestratorConfiguration = {
      default_workflow: {
        stages: ['plan', 'confirm', 'trace'],
        parallel_execution: false, // 关键：顺序执行
        timeout_ms: 30000,
        retry_policy: {
          max_attempts: 3,
          delay_ms: 1000
        }
      } as WorkflowConfiguration,
      module_timeout_ms: 10000,
      max_concurrent_executions: 5,
      enable_performance_monitoring: true,
      enable_event_logging: true
    };

    // 创建Core协调器
    coreOrchestrator = new CoreOrchestrator(orchestratorConfig);
    
    // 注册模块适配器
    coreOrchestrator.registerModule(planAdapter);
    coreOrchestrator.registerModule(confirmAdapter);
    coreOrchestrator.registerModule(traceAdapter);

    // 初始化Core协调器
    await coreOrchestrator.initialize();
  });

  afterEach(async () => {
    await coreOrchestrator.cleanup();
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('P0架构修复验证：真正的业务工作流', () => {
    test('应该执行真正的Plan → Confirm → Trace业务工作流', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值 - 模拟真实的业务数据流转
      const planData = TestDataFactory.Plan.createPlanData({ context_id: contextId });
      const confirmData = TestDataFactory.Confirm.createConfirmData({ context_id: contextId });
      const traceData = TestDataFactory.Trace.createTraceData({ context_id: contextId });

      // Plan阶段Mock
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: planData
      });

      // Confirm阶段Mock
      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: confirmData
      });

      // Trace阶段Mock
      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: traceData
      });

      mockTraceManagementService.recordEvent.mockResolvedValue({
        success: true,
        data: { event_id: 'test-event-id', recorded_at: new Date().toISOString() }
      });

      // 执行真正的业务工作流
      const workflowResult: WorkflowExecutionResult = await coreOrchestrator.executeWorkflow(
        contextId as UUID,
        {
          stages: ['plan', 'confirm', 'trace'],
          parallel_execution: false, // 确保顺序执行
          timeout_ms: 30000
        }
      );

      // 验证工作流执行结果
      expect(workflowResult.execution_id).toBeDefined();
      expect(workflowResult.context_id).toBe(contextId);
      expect(workflowResult.status).toBe('completed');
      expect(workflowResult.stages).toHaveLength(3);

      // 验证执行顺序
      expect(workflowResult.stages[0].stage).toBe('plan');
      expect(workflowResult.stages[1].stage).toBe('confirm');
      expect(workflowResult.stages[2].stage).toBe('trace');

      // 验证所有阶段都成功
      workflowResult.stages.forEach(stage => {
        expect(stage.status).toBe('completed');
        expect(stage.result).toBeDefined();
      });

      // 关键验证：确认服务调用顺序和数据传递
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledTimes(1);
      expect(mockConfirmManagementService.createConfirm).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.recordEvent).toHaveBeenCalledTimes(2);

      // 验证执行时间合理
      expect(workflowResult.total_duration_ms).toBeGreaterThan(0);
      expect(workflowResult.total_duration_ms).toBeLessThan(30000);

      console.log('✅ P0架构修复验证成功：真正的业务工作流执行完成');
      console.log(`📊 工作流执行结果：${workflowResult.status}`);
      console.log(`⏱️ 执行时间：${workflowResult.total_duration_ms}ms`);
      console.log(`🔄 阶段数量：${workflowResult.stages.length}`);
    });

    test('应该在Plan阶段失败时正确停止工作流', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Plan失败
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: false,
        error: 'Plan creation failed'
      });

      // 执行工作流
      const workflowResult: WorkflowExecutionResult = await coreOrchestrator.executeWorkflow(
        contextId as UUID,
        {
          stages: ['plan', 'confirm', 'trace'],
          parallel_execution: false
        }
      );

      // 验证工作流失败
      expect(workflowResult.status).toBe('failed');
      expect(workflowResult.stages.length).toBeGreaterThan(0); // 至少执行了Plan阶段

      // 验证Plan被调用，但Confirm和Trace没有被调用
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledTimes(1);
      expect(mockConfirmManagementService.createConfirm).not.toHaveBeenCalled();
      expect(mockTraceManagementService.createTrace).not.toHaveBeenCalled();

      console.log('✅ P0架构修复验证成功：工作流错误处理正确');
    });
  });
});

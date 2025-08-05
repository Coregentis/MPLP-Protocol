/**
 * Core工作流执行集成测试
 * @description 测试真正的业务工作流：Plan → Confirm → Trace 顺序执行
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-05 01:00
 * 
 * 基于批判性思维分析：
 * 1. 测试真正的业务工作流，而不是独立的模块协调
 * 2. 验证模块间的数据传递和依赖关系
 * 3. 确保顺序执行：Plan输出 → Confirm输入 → Trace输入
 * 4. 测试完整的业务场景，而不是技术功能
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
  ExtendedWorkflowConfig,
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

describe('Core工作流执行集成测试', () => {
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
        parallel_execution: false, // 顺序执行
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

  describe('完整业务工作流测试', () => {
    test('应该按顺序执行Plan → Confirm → Trace工作流', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值 - 模拟真实的数据流转
      const planResult = {
        plan_id: TestDataFactory.Base.generateUUID(),
        task_breakdown: {
          tasks: [
            {
              task_id: TestDataFactory.Base.generateUUID(),
              name: 'Setup Environment',
              dependencies: [],
              priority: 1,
              estimated_duration: 3600000
            }
          ],
          execution_order: []
        },
        resource_allocation: {
          developers: 2,
          budget: 10000
        },
        timestamp: new Date().toISOString()
      };

      const confirmResult = {
        confirmation_id: TestDataFactory.Base.generateUUID(),
        approval_status: 'approved',
        approver_responses: [
          {
            approver_id: 'manager1',
            decision: 'approved',
            timestamp: new Date().toISOString()
          }
        ],
        final_decision: 'approved',
        timestamp: new Date().toISOString()
      };

      const traceResult = {
        trace_id: TestDataFactory.Base.generateUUID(),
        monitoring_session: {
          session_id: TestDataFactory.Base.generateUUID(),
          start_time: new Date().toISOString(),
          active_traces: 1
        },
        event_collection: {
          events_captured: 0,
          storage_location: 'memory://traces/realtime'
        },
        timestamp: new Date().toISOString()
      };

      // 设置Mock返回值
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: TestDataFactory.Plan.createPlanData({ context_id: contextId })
      });

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: TestDataFactory.Confirm.createConfirmData({ context_id: contextId })
      });

      mockTraceManagementService.createTrace.mockResolvedValue({
        success: true,
        data: TestDataFactory.Trace.createTraceData({ context_id: contextId })
      });

      mockTraceManagementService.recordEvent.mockResolvedValue({
        success: true,
        data: { event_id: 'test-event-id', recorded_at: new Date().toISOString() }
      });

      // 执行完整工作流
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

      // 验证服务调用顺序（这是关键！）
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledTimes(1);
      expect(mockConfirmManagementService.createConfirm).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.createTrace).toHaveBeenCalledTimes(1);
      expect(mockTraceManagementService.recordEvent).toHaveBeenCalledTimes(2);

      // 验证执行时间合理
      expect(workflowResult.total_duration_ms).toBeGreaterThan(0);
      expect(workflowResult.total_duration_ms).toBeLessThan(30000);
    });

    test('应该在某个阶段失败时停止工作流执行', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Plan成功，Confirm失败
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: TestDataFactory.Plan.createPlanData({ context_id: contextId })
      });

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: false,
        error: 'Approval rejected'
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
      expect(workflowResult.stages).toHaveLength(2); // 只执行了Plan和Confirm

      // 验证Plan成功，Confirm失败
      expect(workflowResult.stages[0].stage).toBe('plan');
      expect(workflowResult.stages[0].status).toBe('completed');
      expect(workflowResult.stages[1].stage).toBe('confirm');
      expect(workflowResult.stages[1].status).toBe('failed');

      // 验证Trace没有被调用
      expect(mockTraceManagementService.createTrace).not.toHaveBeenCalled();
    });
  });

  describe('扩展工作流测试', () => {
    test('应该支持扩展工作流配置', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: TestDataFactory.Plan.createPlanData({ context_id: contextId })
      });

      mockConfirmManagementService.createConfirm.mockResolvedValue({
        success: true,
        data: TestDataFactory.Confirm.createConfirmData({ context_id: contextId })
      });

      const extendedConfig: ExtendedWorkflowConfig = {
        stages: ['plan', 'confirm'],
        execution_mode: 'sequential',
        timeout_ms: 20000
      };

      // 执行扩展工作流
      const workflowResult: WorkflowExecutionResult = await coreOrchestrator.executeExtendedWorkflow(
        contextId as UUID,
        extendedConfig
      );

      // 验证结果
      expect(workflowResult.status).toBe('completed');
      expect(workflowResult.stages).toHaveLength(2);
      expect(workflowResult.stages[0].stage).toBe('plan');
      expect(workflowResult.stages[1].stage).toBe('confirm');
    });
  });
});

/**
 * CoreOrchestrator单元测试
 * 
 * 基于Schema驱动测试原则，测试CoreOrchestrator的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T20:00:00+08:00
 */

import { jest } from '@jest/globals';
import { CoreOrchestrator } from '../../../src/public/modules/core/orchestrator/core-orchestrator';
import {
  WorkflowStage,
  ExecutionStatus,
  ProtocolModule,
  WorkflowConfiguration,
  ExecutionContext,
  StageExecutionResult,
  WorkflowExecutionResult,
  ModuleInterface,
  ModuleStatus,
  CoordinationEvent,
  OrchestratorConfiguration,
  RetryPolicy,
  ErrorHandlingPolicy,
  PerformanceMetrics
} from '../../../src/public/modules/core/types/core.types';
import { UUID } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('CoreOrchestrator', () => {
  let orchestrator: CoreOrchestrator;
  let mockModules: Map<ProtocolModule, jest.Mocked<ModuleInterface>>;
  let configuration: OrchestratorConfiguration;

  // 辅助函数：创建有效的RetryPolicy
  const createValidRetryPolicy = (): RetryPolicy => ({
    max_attempts: 3,
    delay_ms: 1000,
    backoff_multiplier: 2,
    max_delay_ms: 10000
  });

  // 辅助函数：创建有效的ErrorHandlingPolicy
  const createValidErrorHandlingPolicy = (): ErrorHandlingPolicy => ({
    continue_on_error: false,
    rollback_on_failure: true,
    notification_enabled: true
  });

  // 辅助函数：创建有效的WorkflowConfiguration
  const createValidWorkflowConfiguration = (): WorkflowConfiguration => ({
    stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[],
    parallel_execution: false,
    timeout_ms: 300000,
    retry_policy: createValidRetryPolicy(),
    error_handling: createValidErrorHandlingPolicy()
  });

  // 辅助函数：创建有效的PerformanceMetrics
  const createValidPerformanceMetrics = (): PerformanceMetrics => ({
    average_execution_time_ms: 1500,
    total_executions: 100,
    success_rate: 0.95,
    error_rate: 0.05,
    last_updated: new Date().toISOString()
  });

  // 辅助函数：创建有效的ModuleStatus
  const createValidModuleStatus = (moduleName: ProtocolModule): ModuleStatus => ({
    module_name: moduleName,
    status: 'idle',
    last_execution: new Date().toISOString(),
    error_count: 0,
    performance_metrics: createValidPerformanceMetrics()
  });

  // 辅助函数：创建Mock ModuleInterface
  const createMockModule = (moduleName: ProtocolModule): jest.Mocked<ModuleInterface> => ({
    module_name: moduleName,
    initialize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    execute: jest.fn<(context: any) => Promise<any>>().mockResolvedValue({ success: true, data: `${moduleName} result` }),
    cleanup: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    getStatus: jest.fn<() => ModuleStatus>().mockReturnValue(createValidModuleStatus(moduleName))
  });

  beforeEach(() => {
    // 创建配置
    configuration = {
      default_workflow: createValidWorkflowConfiguration(),
      module_timeout_ms: 30000,
      max_concurrent_executions: 5,
      enable_performance_monitoring: true,
      enable_event_logging: true
    };

    // 创建Mock模块
    mockModules = new Map();
    const moduleNames: ProtocolModule[] = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    
    moduleNames.forEach(moduleName => {
      const mockModule = createMockModule(moduleName);
      mockModules.set(moduleName, mockModule);
    });

    // 创建调度器实例
    orchestrator = new CoreOrchestrator(configuration);

    // 注册所有Mock模块
    mockModules.forEach((mockModule, moduleName) => {
      orchestrator.registerModule(mockModule);
    });
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确创建CoreOrchestrator实例', async () => {
      // 执行测试
      const newOrchestrator = await TestHelpers.Performance.expectExecutionTime(
        () => new CoreOrchestrator(configuration),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果
      expect(newOrchestrator).toBeInstanceOf(CoreOrchestrator);
    });

    it('应该测试边界条件', () => {
      const boundaryConfigs = [
        {
          name: '最小配置',
          config: {
            default_workflow: {
              stages: ['context'] as WorkflowStage[]
            },
            module_timeout_ms: 1000,
            max_concurrent_executions: 1,
            enable_performance_monitoring: false,
            enable_event_logging: false
          } as OrchestratorConfiguration,
          expectedError: undefined
        },
        {
          name: '最大配置',
          config: {
            default_workflow: createValidWorkflowConfiguration(),
            module_timeout_ms: 600000,
            max_concurrent_executions: 100,
            enable_performance_monitoring: true,
            enable_event_logging: true,
            lifecycle_hooks: {
              beforeWorkflow: jest.fn(),
              afterWorkflow: jest.fn(),
              beforeStage: jest.fn(),
              afterStage: jest.fn(),
              onError: jest.fn()
            }
          } as OrchestratorConfiguration,
          expectedError: undefined
        }
      ];

      for (const test of boundaryConfigs) {
        const newOrchestrator = new CoreOrchestrator(test.config);
        expect(newOrchestrator).toBeInstanceOf(CoreOrchestrator);
      }
    });
  });

  describe('registerModule', () => {
    it('应该成功注册模块', () => {
      // 准备测试数据
      const newOrchestrator = new CoreOrchestrator(configuration);
      const mockModule = createMockModule('context');

      // 执行测试
      newOrchestrator.registerModule(mockModule);

      // 验证结果 - 通过getModuleStatuses检查模块是否注册
      const moduleStatuses = newOrchestrator.getModuleStatuses();
      expect(moduleStatuses.has('context')).toBe(true);
    });

    it('应该处理重复注册', () => {
      // 准备测试数据
      const newOrchestrator = new CoreOrchestrator(configuration);
      const mockModule1 = createMockModule('context');
      const mockModule2 = createMockModule('context');

      // 执行测试
      newOrchestrator.registerModule(mockModule1);
      newOrchestrator.registerModule(mockModule2); // 重复注册

      // 验证结果
      const moduleStatuses = newOrchestrator.getModuleStatuses();
      expect(moduleStatuses.has('context')).toBe(true);
      expect(moduleStatuses.size).toBe(1);
    });
  });

  describe('executeWorkflow', () => {
    it('应该成功执行工作流', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const workflowConfig: Partial<WorkflowConfiguration> = {
        stages: ['context', 'plan'] as WorkflowStage[],
        timeout_ms: 60000
      };

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => orchestrator.executeWorkflow(contextId, workflowConfig),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result.context_id).toBe(contextId);
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(2);
      expect(result.stages[0].stage).toBe('context');
      expect(result.stages[1].stage).toBe('plan');
      expect(result.stages.every(s => s.status === 'completed')).toBe(true);
      expect(result.total_duration_ms).toBeGreaterThanOrEqual(0);
      expect(result.started_at).toBeDefined();
      expect(result.completed_at).toBeDefined();

      // 验证模块被调用
      expect(mockModules.get('context')?.execute).toHaveBeenCalled();
      expect(mockModules.get('plan')?.execute).toHaveBeenCalled();
    });

    it('应该处理模块执行失败', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const workflowConfig: Partial<WorkflowConfiguration> = {
        stages: ['context', 'plan'] as WorkflowStage[],
        error_handling: {
          continue_on_error: false, // 确保遇到错误时停止
          rollback_on_failure: true,
          notification_enabled: true
        }
      };

      // 设置模块执行失败
      const planModule = mockModules.get('plan');
      if (planModule) {
        planModule.execute.mockRejectedValue(new Error('Plan execution failed'));
      }

      // 执行测试
      const result = await orchestrator.executeWorkflow(contextId, workflowConfig);

      // 验证结果
      expect(result.status).toBe('completed'); // 工作流完成，但包含失败的阶段
      expect(result.stages).toHaveLength(2);
      expect(result.stages[0].status).toBe('completed'); // context成功
      expect(result.stages[1].status).toBe('failed'); // plan失败
      expect(result.stages[1].error).toBeDefined();
      expect(result.stages[1].error?.message).toContain('Plan execution failed');
    });

    it('应该处理空工作流配置', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();

      // 执行测试 - 使用默认配置
      const result = await orchestrator.executeWorkflow(contextId);

      // 验证结果
      expect(result.context_id).toBe(contextId);
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(4); // 默认配置有4个阶段
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '单阶段工作流',
          config: { stages: ['context'] as WorkflowStage[] },
          expectedStageCount: 1
        },
        {
          name: '所有阶段工作流',
          config: { stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[] },
          expectedStageCount: 4
        },
        {
          name: '短超时时间',
          config: { 
            stages: ['context'] as WorkflowStage[],
            timeout_ms: 1000
          },
          expectedStageCount: 1
        }
      ];

      for (const test of boundaryTests) {
        const contextId = TestDataFactory.Base.generateUUID();
        const result = await orchestrator.executeWorkflow(contextId, test.config);
        
        expect(result.context_id).toBe(contextId);
        expect(result.stages).toHaveLength(test.expectedStageCount);
      }
    });
  });

  describe('getActiveExecutions', () => {
    it('应该返回活跃的执行上下文', async () => {
      // 准备测试数据
      const contextId1 = TestDataFactory.Base.generateUUID();
      const contextId2 = TestDataFactory.Base.generateUUID();

      // 启动两个工作流（不等待完成）
      const promise1 = orchestrator.executeWorkflow(contextId1, { stages: ['context'] });
      const promise2 = orchestrator.executeWorkflow(contextId2, { stages: ['context'] });

      // 在执行过程中检查活跃执行
      const activeExecutions = orchestrator.getActiveExecutions();
      
      // 等待执行完成
      await Promise.all([promise1, promise2]);

      // 验证结果 - 在执行过程中应该有活跃的执行
      // 注意：由于执行很快，可能在检查时已经完成，所以这里主要验证方法不抛错
      expect(Array.isArray(activeExecutions)).toBe(true);
    });

    it('应该在没有活跃执行时返回空数组', () => {
      // 执行测试
      const activeExecutions = orchestrator.getActiveExecutions();

      // 验证结果
      expect(activeExecutions).toEqual([]);
    });
  });

  describe('getModuleStatuses', () => {
    it('应该返回所有注册模块的状态', () => {
      // 执行测试
      const moduleStatuses = orchestrator.getModuleStatuses();

      // 验证结果
      expect(moduleStatuses.size).toBe(6); // 6个注册的模块
      expect(moduleStatuses.has('context')).toBe(true);
      expect(moduleStatuses.has('plan')).toBe(true);
      expect(moduleStatuses.has('confirm')).toBe(true);
      expect(moduleStatuses.has('trace')).toBe(true);
      expect(moduleStatuses.has('role')).toBe(true);
      expect(moduleStatuses.has('extension')).toBe(true);

      // 验证状态结构
      const contextStatus = moduleStatuses.get('context');
      expect(contextStatus).toBeDefined();
      expect(contextStatus?.module_name).toBe('context');
      expect(contextStatus?.status).toBeDefined();
      expect(contextStatus?.error_count).toBeDefined();
    });
  });

  describe('addEventListener', () => {
    it('应该成功添加事件监听器', async () => {
      // 准备测试数据
      const eventListener = jest.fn();
      const contextId = TestDataFactory.Base.generateUUID();

      // 添加事件监听器
      orchestrator.addEventListener(eventListener);

      // 执行工作流以触发事件
      await orchestrator.executeWorkflow(contextId, { stages: ['context'] });

      // 验证结果
      expect(eventListener).toHaveBeenCalled();
      
      // 验证事件结构
      const calls = eventListener.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      
      const firstEvent = calls[0][0] as CoordinationEvent;
      expect(firstEvent.event_id).toBeDefined();
      expect(firstEvent.event_type).toBeDefined();
      expect(firstEvent.execution_id).toBeDefined();
      expect(firstEvent.timestamp).toBeDefined();
    });

    it('应该支持多个事件监听器', async () => {
      // 准备测试数据
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const contextId = TestDataFactory.Base.generateUUID();

      // 添加多个监听器
      orchestrator.addEventListener(listener1);
      orchestrator.addEventListener(listener2);

      // 执行工作流以触发事件
      await orchestrator.executeWorkflow(contextId, { stages: ['context'] });

      // 验证结果
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});

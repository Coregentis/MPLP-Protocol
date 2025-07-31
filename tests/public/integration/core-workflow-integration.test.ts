/**
 * Core工作流集成测试
 * 
 * 简化的集成测试，专注于验证Core模块的工作流编排功能
 * 测试WorkflowManager和CoreOrchestrator的基本集成
 * 
 * @version 1.0.0
 * @created 2025-01-28T22:00:00+08:00
 */

import { WorkflowManager } from '../../../src/public/modules/core/workflow/workflow-manager';
import { CoreOrchestrator } from '../../../src/public/modules/core/orchestrator/core-orchestrator';
import {
  WorkflowStage,
  WorkflowConfiguration,
  OrchestratorConfiguration,
  ModuleInterface,
  ExecutionContext,
  ModuleStatus
} from '../../../src/public/modules/core/types/core.types';
import { UUID } from '../../../src/public/shared/types';
import { TestDataFactory } from '../test-utils/test-data-factory';
import { TestHelpers } from '../test-utils/test-helpers';

describe('Core工作流集成测试', () => {
  let workflowManager: WorkflowManager;
  let orchestrator: CoreOrchestrator;

  beforeEach(() => {
    // 创建WorkflowManager
    workflowManager = new WorkflowManager();

    // 创建CoreOrchestrator配置
    const config: OrchestratorConfiguration = {
      default_workflow: {
        stages: ['context', 'plan'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 60000,
        retry_policy: {
          max_attempts: 2,
          delay_ms: 500,
          backoff_multiplier: 1.5,
          max_delay_ms: 5000
        },
        error_handling: {
          continue_on_error: false,
          rollback_on_failure: true,
          notification_enabled: true
        }
      },
      module_timeout_ms: 10000,
      max_concurrent_executions: 3,
      enable_performance_monitoring: true,
      enable_event_logging: true
    };

    orchestrator = new CoreOrchestrator(config);
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('WorkflowManager集成', () => {
    it('应该成功获取和验证工作流模板', () => {
      // 测试获取标准模板
      const standardTemplate = workflowManager.getTemplate('standard');
      expect(standardTemplate).toBeDefined();
      expect(standardTemplate?.stages).toEqual(['context', 'plan', 'confirm', 'trace']);

      // 测试获取快速模板
      const fastTemplate = workflowManager.getTemplate('fast');
      expect(fastTemplate).toBeDefined();
      expect(fastTemplate?.stages).toEqual(['context', 'plan', 'trace']);

      // 测试获取并行模板
      const parallelTemplate = workflowManager.getTemplate('parallel');
      expect(parallelTemplate).toBeDefined();
      expect(parallelTemplate?.parallel_execution).toBe(true);
    });

    it('应该成功创建自定义工作流', () => {
      // 创建自定义工作流
      const customWorkflow = workflowManager.createCustomWorkflow(
        ['context', 'trace'] as WorkflowStage[],
        {
          parallel: false,
          timeout_ms: 30000
        }
      );

      expect(customWorkflow.stages).toEqual(['context', 'trace']);
      expect(customWorkflow.parallel_execution).toBe(false);
      expect(customWorkflow.timeout_ms).toBe(30000);
    });

    it('应该正确验证工作流配置', () => {
      // 测试有效配置
      const validConfig: WorkflowConfiguration = {
        stages: ['context', 'plan'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 60000,
        retry_policy: {
          max_attempts: 3,
          delay_ms: 1000,
          backoff_multiplier: 2,
          max_delay_ms: 10000
        },
        error_handling: {
          continue_on_error: false,
          rollback_on_failure: true,
          notification_enabled: true
        }
      };

      const validationResult = workflowManager.validateWorkflowConfiguration(validConfig);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toEqual([]);

      // 测试无效配置
      const invalidConfig: WorkflowConfiguration = {
        stages: [] as WorkflowStage[], // 空阶段数组
        parallel_execution: false,
        timeout_ms: -1000, // 负数超时
        retry_policy: {
          max_attempts: -1, // 负数重试次数
          delay_ms: 1000,
          backoff_multiplier: 2,
          max_delay_ms: 10000
        },
        error_handling: {
          continue_on_error: false,
          rollback_on_failure: true,
          notification_enabled: true
        }
      };

      const invalidValidationResult = workflowManager.validateWorkflowConfiguration(invalidConfig);
      expect(invalidValidationResult.isValid).toBe(false);
      expect(invalidValidationResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('CoreOrchestrator集成', () => {
    it('应该成功注册和管理模块', () => {
      // 创建测试模块
      const testModule: ModuleInterface = {
        module_name: 'context',
        initialize: async () => {},
        execute: async (context: ExecutionContext) => {
          return { success: true, data: { context_id: context.context_id } };
        },
        cleanup: async () => {},
        getStatus: (): ModuleStatus => ({
          module_name: 'context',
          status: 'idle',
          last_execution: new Date().toISOString(),
          error_count: 0,
          performance_metrics: {
            average_execution_time_ms: 100,
            total_executions: 1,
            success_rate: 1.0,
            error_rate: 0.0,
            last_updated: new Date().toISOString()
          }
        })
      };

      // 注册模块
      orchestrator.registerModule(testModule);

      // 验证模块状态
      const moduleStatuses = orchestrator.getModuleStatuses();
      expect(moduleStatuses.has('context')).toBe(true);
      expect(moduleStatuses.get('context')?.module_name).toBe('context');
    });

    it('应该成功执行简单工作流', async () => {
      // 注册测试模块
      const contextModule: ModuleInterface = {
        module_name: 'context',
        initialize: async () => {},
        execute: async (context: ExecutionContext) => {
          await TestHelpers.Async.wait(10);
          return { success: true, data: { context_id: context.context_id, created: true } };
        },
        cleanup: async () => {},
        getStatus: (): ModuleStatus => ({
          module_name: 'context',
          status: 'idle',
          last_execution: new Date().toISOString(),
          error_count: 0,
          performance_metrics: {
            average_execution_time_ms: 10,
            total_executions: 1,
            success_rate: 1.0,
            error_rate: 0.0,
            last_updated: new Date().toISOString()
          }
        })
      };

      const planModule: ModuleInterface = {
        module_name: 'plan',
        initialize: async () => {},
        execute: async (context: ExecutionContext) => {
          await TestHelpers.Async.wait(15);
          return { success: true, data: { plan_id: TestDataFactory.Base.generateUUID(), created: true } };
        },
        cleanup: async () => {},
        getStatus: (): ModuleStatus => ({
          module_name: 'plan',
          status: 'idle',
          last_execution: new Date().toISOString(),
          error_count: 0,
          performance_metrics: {
            average_execution_time_ms: 15,
            total_executions: 1,
            success_rate: 1.0,
            error_rate: 0.0,
            last_updated: new Date().toISOString()
          }
        })
      };

      orchestrator.registerModule(contextModule);
      orchestrator.registerModule(planModule);

      // 执行工作流
      const contextId = TestDataFactory.Base.generateUUID();
      const result = await orchestrator.executeWorkflow(contextId);

      // 验证结果
      expect(result.context_id).toBe(contextId);
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(2);
      expect(result.stages[0].stage).toBe('context');
      expect(result.stages[0].status).toBe('completed');
      expect(result.stages[1].stage).toBe('plan');
      expect(result.stages[1].status).toBe('completed');
      expect(result.total_duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('应该正确处理模块执行错误', async () => {
      // 注册正常模块和失败模块
      const contextModule: ModuleInterface = {
        module_name: 'context',
        initialize: async () => {},
        execute: async (context: ExecutionContext) => {
          return { success: true, data: { context_id: context.context_id } };
        },
        cleanup: async () => {},
        getStatus: (): ModuleStatus => ({
          module_name: 'context',
          status: 'idle',
          last_execution: new Date().toISOString(),
          error_count: 0,
          performance_metrics: {
            average_execution_time_ms: 10,
            total_executions: 1,
            success_rate: 1.0,
            error_rate: 0.0,
            last_updated: new Date().toISOString()
          }
        })
      };

      const failingModule: ModuleInterface = {
        module_name: 'plan',
        initialize: async () => {},
        execute: async (context: ExecutionContext) => {
          throw new Error('Plan execution failed');
        },
        cleanup: async () => {},
        getStatus: (): ModuleStatus => ({
          module_name: 'plan',
          status: 'idle',
          last_execution: new Date().toISOString(),
          error_count: 1,
          performance_metrics: {
            average_execution_time_ms: 0,
            total_executions: 1,
            success_rate: 0.0,
            error_rate: 1.0,
            last_updated: new Date().toISOString()
          }
        })
      };

      orchestrator.registerModule(contextModule);
      orchestrator.registerModule(failingModule);

      // 执行工作流
      const contextId = TestDataFactory.Base.generateUUID();
      const result = await orchestrator.executeWorkflow(contextId);

      // 验证错误处理
      expect(result.context_id).toBe(contextId);
      expect(result.status).toBe('completed'); // 工作流完成，但包含失败的阶段
      expect(result.stages).toHaveLength(2);
      expect(result.stages[0].status).toBe('completed');
      expect(result.stages[1].status).toBe('failed');
      expect(result.stages[1].error).toBeDefined();
      expect(result.stages[1].error?.message).toContain('Plan execution failed');
    });
  });

  describe('WorkflowManager与CoreOrchestrator集成', () => {
    it('应该使用WorkflowManager模板配置CoreOrchestrator', async () => {
      // 从WorkflowManager获取模板
      const template = workflowManager.getTemplate('fast');
      expect(template).toBeDefined();

      // 注册测试模块
      const modules = (['context', 'plan', 'trace'] as WorkflowStage[]).map(moduleName => ({
        module_name: moduleName,
        initialize: async () => {},
        execute: async (context: ExecutionContext) => {
          return { success: true, data: { [moduleName]: 'executed' } };
        },
        cleanup: async () => {},
        getStatus: (): ModuleStatus => ({
          module_name: moduleName,
          status: 'idle',
          last_execution: new Date().toISOString(),
          error_count: 0,
          performance_metrics: {
            average_execution_time_ms: 10,
            total_executions: 1,
            success_rate: 1.0,
            error_rate: 0.0,
            last_updated: new Date().toISOString()
          }
        })
      }));

      modules.forEach(module => orchestrator.registerModule(module as ModuleInterface));

      // 使用模板配置执行工作流
      const contextId = TestDataFactory.Base.generateUUID();
      const result = await orchestrator.executeWorkflow(contextId, template);

      // 验证结果
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(3); // fast模板包含3个阶段
      expect(result.stages.map(s => s.stage)).toEqual(['context', 'plan', 'trace']);
      expect(result.stages.every(s => s.status === 'completed')).toBe(true);
    });
  });
});

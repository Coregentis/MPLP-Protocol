/**
 * WorkflowManager单元测试
 * 
 * 基于Schema驱动测试原则，测试WorkflowManager的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T20:00:00+08:00
 */

import { jest } from '@jest/globals';
import { WorkflowManager, WorkflowTemplates } from '../../../src/public/modules/core/workflow/workflow-manager';
import {
  WorkflowStage,
  WorkflowConfiguration,
  RetryPolicy,
  ErrorHandlingPolicy
} from '../../../src/public/modules/core/types/core.types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('WorkflowManager', () => {
  let workflowManager: WorkflowManager;

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

  beforeEach(() => {
    workflowManager = new WorkflowManager();
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确创建WorkflowManager实例', async () => {
      // 执行测试
      const newWorkflowManager = await TestHelpers.Performance.expectExecutionTime(
        () => new WorkflowManager(),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果
      expect(newWorkflowManager).toBeInstanceOf(WorkflowManager);
    });
  });

  describe('getTemplate', () => {
    it('应该成功获取标准MPLP模板', () => {
      // 执行测试
      const template = workflowManager.getTemplate('standard');

      // 验证结果
      expect(template).toBeDefined();
      expect(template?.stages).toEqual(['context', 'plan', 'confirm', 'trace']);
      expect(template?.parallel_execution).toBe(false);
      expect(template?.timeout_ms).toBe(300000);
      expect(template?.retry_policy).toBeDefined();
      expect(template?.error_handling).toBeDefined();
    });

    it('应该成功获取快速执行模板', () => {
      // 执行测试
      const template = workflowManager.getTemplate('fast');

      // 验证结果
      expect(template).toBeDefined();
      expect(template?.stages).toEqual(['context', 'plan', 'trace']);
      expect(template?.parallel_execution).toBe(false);
      expect(template?.timeout_ms).toBe(60000);
    });

    it('应该成功获取并行执行模板', () => {
      // 执行测试
      const template = workflowManager.getTemplate('parallel');

      // 验证结果
      expect(template).toBeDefined();
      expect(template?.stages).toEqual(['context', 'plan', 'trace']);
      expect(template?.parallel_execution).toBe(true);
      expect(template?.timeout_ms).toBe(120000);
    });

    it('应该成功获取监控专用模板', () => {
      // 执行测试
      const template = workflowManager.getTemplate('monitoring');

      // 验证结果
      expect(template).toBeDefined();
      expect(template?.stages).toEqual(['context', 'trace']);
      expect(template?.parallel_execution).toBe(false);
    });

    it('应该处理不存在的模板', () => {
      // 执行测试
      const template = workflowManager.getTemplate('NON_EXISTENT_TEMPLATE');

      // 验证结果
      expect(template).toBeUndefined();
    });

    it('应该测试边界条件', () => {
      const boundaryTests = [
        { name: '', expected: undefined },
        { name: 'standard', expected: 'defined' },
        { name: 'STANDARD', expected: undefined }, // 大小写敏感
        { name: 'fast', expected: 'defined' },
        { name: 'parallel', expected: 'defined' },
        { name: 'monitoring', expected: 'defined' }
      ];

      for (const test of boundaryTests) {
        const template = workflowManager.getTemplate(test.name);
        if (test.expected === 'defined') {
          expect(template).toBeDefined();
        } else {
          expect(template).toBeUndefined();
        }
      }
    });
  });

  describe('createCustomWorkflow', () => {
    it('应该成功创建自定义工作流', () => {
      // 准备测试数据
      const stages: WorkflowStage[] = ['context', 'plan'];
      const options = {
        parallel: true,
        timeout_ms: 120000,
        retry_policy: createValidRetryPolicy(),
        error_handling: createValidErrorHandlingPolicy()
      };

      // 执行测试
      const workflow = workflowManager.createCustomWorkflow(stages, options);

      // 验证结果
      expect(workflow.stages).toEqual(stages);
      expect(workflow.parallel_execution).toBe(true);
      expect(workflow.timeout_ms).toBe(120000);
      expect(workflow.retry_policy).toMatchObject(options.retry_policy);
      expect(workflow.error_handling).toMatchObject(options.error_handling);
    });

    it('应该使用默认选项创建工作流', () => {
      // 准备测试数据
      const stages: WorkflowStage[] = ['context', 'trace'];

      // 执行测试
      const workflow = workflowManager.createCustomWorkflow(stages);

      // 验证结果
      expect(workflow.stages).toEqual(stages);
      expect(workflow.parallel_execution).toBe(false); // 默认值
      expect(workflow.timeout_ms).toBe(300000); // 默认值
      expect(workflow.retry_policy).toBeDefined();
      expect(workflow.error_handling).toBeDefined();
    });

    it('应该处理部分选项', () => {
      // 准备测试数据
      const stages: WorkflowStage[] = ['context', 'plan', 'confirm'];
      const partialOptions = {
        parallel: true,
        timeout_ms: 180000
      };

      // 执行测试
      const workflow = workflowManager.createCustomWorkflow(stages, partialOptions);

      // 验证结果
      expect(workflow.stages).toEqual(stages);
      expect(workflow.parallel_execution).toBe(true);
      expect(workflow.timeout_ms).toBe(180000);
      expect(workflow.retry_policy).toBeDefined(); // 使用默认值
      expect(workflow.error_handling).toBeDefined(); // 使用默认值
    });

    it('应该测试边界条件', () => {
      const boundaryTests = [
        {
          name: '单阶段工作流',
          stages: ['context'] as WorkflowStage[],
          options: undefined,
          expectedStageCount: 1
        },
        {
          name: '所有阶段工作流',
          stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[],
          options: { parallel: true },
          expectedStageCount: 4
        },
        {
          name: '空选项',
          stages: ['context', 'plan'] as WorkflowStage[],
          options: {},
          expectedStageCount: 2
        }
      ];

      for (const test of boundaryTests) {
        const workflow = workflowManager.createCustomWorkflow(test.stages, test.options);
        expect(workflow.stages).toHaveLength(test.expectedStageCount);
        expect(workflow.stages).toEqual(test.stages);
      }
    });
  });

  describe('validateWorkflowConfiguration', () => {
    it('应该验证有效的工作流配置', () => {
      // 准备测试数据
      const validConfig = createValidWorkflowConfiguration();

      // 执行测试
      const result = workflowManager.validateWorkflowConfiguration(validConfig);

      // 验证结果
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('应该检测无效的阶段配置', () => {
      // 准备测试数据
      const invalidConfig: WorkflowConfiguration = {
        stages: [], // 空阶段数组
        parallel_execution: false,
        timeout_ms: 300000,
        retry_policy: createValidRetryPolicy(),
        error_handling: createValidErrorHandlingPolicy()
      };

      // 执行测试
      const result = workflowManager.validateWorkflowConfiguration(invalidConfig);

      // 验证结果
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('工作流必须包含至少一个阶段');
    });

    it('应该检测无效的超时配置', () => {
      // 准备测试数据
      const invalidConfig: WorkflowConfiguration = {
        stages: ['context'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: -1000, // 负数超时
        retry_policy: createValidRetryPolicy(),
        error_handling: createValidErrorHandlingPolicy()
      };

      // 执行测试
      const result = workflowManager.validateWorkflowConfiguration(invalidConfig);

      // 验证结果
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('超时时间必须大于0');
    });

    it('应该检测无效的重试策略', () => {
      // 准备测试数据
      const invalidRetryPolicy: RetryPolicy = {
        max_attempts: -1, // 无效的重试次数
        delay_ms: 1000,
        backoff_multiplier: 2,
        max_delay_ms: 10000
      };

      const invalidConfig: WorkflowConfiguration = {
        stages: ['context'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 300000,
        retry_policy: invalidRetryPolicy,
        error_handling: createValidErrorHandlingPolicy()
      };

      // 执行测试
      const result = workflowManager.validateWorkflowConfiguration(invalidConfig);

      // 验证结果
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('最大重试次数不能为负数');
    });

    it('应该生成警告信息', () => {
      // 准备测试数据
      const configWithWarnings: WorkflowConfiguration = {
        stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 700000, // 超过10分钟的超时时间
        retry_policy: createValidRetryPolicy(),
        error_handling: createValidErrorHandlingPolicy()
      };

      // 执行测试
      const result = workflowManager.validateWorkflowConfiguration(configWithWarnings);

      // 验证结果
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('工作流超时时间超过10分钟，可能影响用户体验');
    });

    it('应该测试边界条件', () => {
      const boundaryTests = [
        {
          name: '最小有效配置',
          config: {
            stages: ['context'] as WorkflowStage[]
          } as WorkflowConfiguration,
          expectedValid: true
        },
        {
          name: '最大超时时间',
          config: {
            stages: ['context'] as WorkflowStage[],
            timeout_ms: 3600000 // 1小时
          } as WorkflowConfiguration,
          expectedValid: true
        },
        {
          name: '负超时时间',
          config: {
            stages: ['context'] as WorkflowStage[],
            timeout_ms: -1000
          } as WorkflowConfiguration,
          expectedValid: false
        }
      ];

      for (const test of boundaryTests) {
        const result = workflowManager.validateWorkflowConfiguration(test.config);
        expect(result.isValid).toBe(test.expectedValid);
      }
    });
  });

  describe('WorkflowTemplates', () => {
    it('应该提供标准MPLP模板', () => {
      // 验证模板存在且结构正确
      expect(WorkflowTemplates.STANDARD_MPLP).toBeDefined();
      expect(WorkflowTemplates.STANDARD_MPLP.stages).toEqual(['context', 'plan', 'confirm', 'trace']);
      expect(WorkflowTemplates.STANDARD_MPLP.parallel_execution).toBe(false);
      expect(WorkflowTemplates.STANDARD_MPLP.timeout_ms).toBe(300000);
    });

    it('应该提供快速执行模板', () => {
      // 验证模板存在且结构正确
      expect(WorkflowTemplates.FAST_EXECUTION).toBeDefined();
      expect(WorkflowTemplates.FAST_EXECUTION.stages).toEqual(['context', 'plan', 'trace']);
      expect(WorkflowTemplates.FAST_EXECUTION.timeout_ms).toBe(60000);
    });

    it('应该提供并行执行模板', () => {
      // 验证模板存在且结构正确
      expect(WorkflowTemplates.PARALLEL_EXECUTION).toBeDefined();
      expect(WorkflowTemplates.PARALLEL_EXECUTION.stages).toEqual(['context', 'plan', 'trace']);
      expect(WorkflowTemplates.PARALLEL_EXECUTION.parallel_execution).toBe(true);
    });

    it('应该提供监控专用模板', () => {
      // 验证模板存在且结构正确
      expect(WorkflowTemplates.MONITORING_ONLY).toBeDefined();
      expect(WorkflowTemplates.MONITORING_ONLY.stages).toEqual(['context', 'trace']);
    });
  });
});

/**
 * @fileoverview Tests for utility functions
 */

import {
  cloneWorkflow,
  validateWorkflowStructure,
  getWorkflowStepIds,
  getWorkflowAgentIds,
  hasCircularDependencies,
  calculateProgress,
  getExecutionSummary,
  isExecutionSuccessful,
  getFailedSteps,
  formatDuration,
  validateStepConfig,
  sanitizeStepName,
  generateStepId,
  retryWithBackoff,
  createTimeout,
  withTimeout
} from '../index';
import { WorkflowBuilder } from '../../workflow/WorkflowBuilder';
import {
  WorkflowDefinition,
  WorkflowResult,
  WorkflowStatus,
  StepStatus,
  StepResult,
  AgentStepConfig
} from '../../types';

describe('Utility Functions测试', () => {
  describe('工作流工具', () => {
    let testWorkflow: WorkflowDefinition;

    beforeEach(() => {
      testWorkflow = new WorkflowBuilder('TestWorkflow')
        .description('Test workflow')
        .step('step1', {
          name: 'First Step',
          agentId: 'agent1',
          action: 'test'
        })
        .step('step2', {
          name: 'Second Step',
          agentId: 'agent2',
          action: 'test',
          dependencies: ['step1']
        })
        .build();
    });

    it('应该克隆工作流', () => {
      const cloned = cloneWorkflow(testWorkflow);

      expect(cloned).toEqual(testWorkflow);
      expect(cloned).not.toBe(testWorkflow);
      expect(cloned.steps).not.toBe(testWorkflow.steps);
    });

    it('应该验证工作流结构', () => {
      expect(validateWorkflowStructure(testWorkflow)).toBe(true);
      
      expect(validateWorkflowStructure(null as any)).toBe(false);
      expect(validateWorkflowStructure({ id: '', name: 'Test' } as any)).toBe(false);
      expect(validateWorkflowStructure({ id: 'test', name: '', steps: [] } as any)).toBe(false);
      expect(validateWorkflowStructure({ id: 'test', name: 'Test', steps: [] })).toBe(false);
    });

    it('应该获取工作流步骤ID', () => {
      const stepIds = getWorkflowStepIds(testWorkflow);

      expect(stepIds).toEqual(['step1', 'step2']);
    });

    it('应该获取工作流智能体ID', () => {
      const agentIds = getWorkflowAgentIds(testWorkflow);

      expect(agentIds).toEqual(['agent1', 'agent2']);
    });

    it('应该检测循环依赖', () => {
      const circularWorkflow: WorkflowDefinition = {
        id: 'circular',
        name: 'Circular Workflow',
        steps: [
          {
            id: 'step1',
            type: 'agent',
            name: 'Step 1',
            agentId: 'agent1',
            action: 'test',
            dependencies: ['step2']
          },
          {
            id: 'step2',
            type: 'agent',
            name: 'Step 2',
            agentId: 'agent2',
            action: 'test',
            dependencies: ['step1']
          }
        ]
      };

      expect(hasCircularDependencies(testWorkflow)).toBe(false);
      expect(hasCircularDependencies(circularWorkflow)).toBe(true);
    });
  });

  describe('执行工具', () => {
    let testResult: WorkflowResult;
    let testSteps: StepResult[];

    beforeEach(() => {
      testSteps = [
        {
          stepId: 'step1',
          status: StepStatus.COMPLETED,
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T10:00:05Z'),
          duration: 5000
        },
        {
          stepId: 'step2',
          status: StepStatus.FAILED,
          startTime: new Date('2023-01-01T10:00:05Z'),
          endTime: new Date('2023-01-01T10:00:08Z'),
          duration: 3000,
          error: new Error('Test error')
        }
      ];

      testResult = {
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        status: WorkflowStatus.FAILED,
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:00:08Z'),
        duration: 8000,
        steps: testSteps
      };
    });

    it('应该计算进度', () => {
      const progress = calculateProgress(testSteps);

      expect(progress.totalSteps).toBe(2);
      expect(progress.completedSteps).toBe(1);
      expect(progress.failedSteps).toBe(1);
      expect(progress.skippedSteps).toBe(0);
      expect(progress.progress).toBe(50);
    });

    it('应该获取执行摘要', () => {
      const summary = getExecutionSummary(testResult);

      expect(summary.totalSteps).toBe(2);
      expect(summary.completedSteps).toBe(1);
      expect(summary.failedSteps).toBe(1);
      expect(summary.skippedSteps).toBe(0);
      expect(summary.totalDuration).toBe(8000);
      expect(summary.averageStepDuration).toBe(4000);
    });

    it('应该检查执行是否成功', () => {
      expect(isExecutionSuccessful(testResult)).toBe(false);

      const successfulResult = {
        ...testResult,
        status: WorkflowStatus.COMPLETED,
        steps: testSteps.map(step => ({ ...step, status: StepStatus.COMPLETED }))
      };

      expect(isExecutionSuccessful(successfulResult)).toBe(true);
    });

    it('应该获取失败的步骤', () => {
      const failedSteps = getFailedSteps(testResult);

      expect(failedSteps).toHaveLength(1);
      expect(failedSteps[0]?.stepId).toBe('step2');
    });

    it('应该格式化持续时间', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(3665000)).toBe('1h 1m 5s');
    });
  });

  describe('验证工具', () => {
    it('应该验证步骤配置', () => {
      const validStep: AgentStepConfig = {
        id: 'test-step',
        type: 'agent',
        name: 'Test Step',
        agentId: 'test-agent',
        action: 'test'
      };

      expect(validateStepConfig(validStep)).toEqual([]);

      const invalidStep = {
        id: '',
        name: 'Test Step',
        agentId: 'test-agent',
        action: 'test'
      } as any;

      const errors = validateStepConfig(invalidStep);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Step must have a valid ID');
    });

    it('应该清理步骤名称', () => {
      expect(sanitizeStepName('Test Step Name')).toBe('test_step_name');
      expect(sanitizeStepName('Test-Step@Name!')).toBe('test_step_name');
      expect(sanitizeStepName('123Test')).toBe('123test');
    });

    it('应该生成唯一步骤ID', () => {
      const existingIds = new Set(['test_step', 'test_step_1']);
      
      expect(generateStepId('Test Step')).toBe('test_step');
      expect(generateStepId('Test Step', existingIds)).toBe('test_step_2');
    });
  });

  describe('重试工具', () => {
    it('应该成功执行函数', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(fn, 3, 100);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该重试失败的函数', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(fn, 3, 10);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('应该在最大重试次数后抛出错误', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(retryWithBackoff(fn, 2, 10))
        .rejects.toThrow('Persistent failure');
      
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('应该创建超时Promise', async () => {
      const timeoutPromise = createTimeout(10);

      await expect(timeoutPromise).rejects.toThrow('Operation timed out after 10ms');
    });

    it('应该在超时前完成Promise', async () => {
      const fastPromise = Promise.resolve('fast');
      
      const result = await withTimeout(fastPromise, 1000);
      
      expect(result).toBe('fast');
    });

    it('应该在Promise超时时抛出错误', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 50));

      await expect(withTimeout(slowPromise, 10))
        .rejects.toThrow('Operation timed out after 10ms');
    });
  });
});

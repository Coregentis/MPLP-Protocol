/**
 * @fileoverview Tests for orchestrator types and error classes
 */

import {
  WorkflowStatus,
  StepStatus,
  StepPriority,
  OrchestratorError,
  WorkflowDefinitionError,
  WorkflowExecutionError,
  StepExecutionError,
  AgentNotFoundError,
  WorkflowNotFoundError
} from '../index';

describe('Orchestrator Types', () => {
  describe('Enums', () => {
    it('应该定义正确的WorkflowStatus枚举值', () => {
      expect(WorkflowStatus.IDLE).toBe('idle');
      expect(WorkflowStatus.RUNNING).toBe('running');
      expect(WorkflowStatus.PAUSED).toBe('paused');
      expect(WorkflowStatus.COMPLETED).toBe('completed');
      expect(WorkflowStatus.FAILED).toBe('failed');
      expect(WorkflowStatus.CANCELLED).toBe('cancelled');
    });

    it('应该定义正确的StepStatus枚举值', () => {
      expect(StepStatus.PENDING).toBe('pending');
      expect(StepStatus.RUNNING).toBe('running');
      expect(StepStatus.COMPLETED).toBe('completed');
      expect(StepStatus.FAILED).toBe('failed');
      expect(StepStatus.SKIPPED).toBe('skipped');
      expect(StepStatus.CANCELLED).toBe('cancelled');
    });

    it('应该定义正确的StepPriority枚举值', () => {
      expect(StepPriority.LOW).toBe(1);
      expect(StepPriority.NORMAL).toBe(2);
      expect(StepPriority.HIGH).toBe(3);
      expect(StepPriority.CRITICAL).toBe(4);
    });
  });

  describe('Error Classes', () => {
    describe('OrchestratorError', () => {
      it('应该创建基础编排器错误', () => {
        const error = new OrchestratorError('Test error');
        
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(OrchestratorError);
        expect(error.name).toBe('OrchestratorError');
        expect(error.message).toBe('Test error');
        expect(error.code).toBe('ORCHESTRATOR_ERROR');
        expect(error.details).toBeUndefined();
      });

      it('应该创建带有自定义代码的错误', () => {
        const error = new OrchestratorError('Test error', 'CUSTOM_CODE');
        
        expect(error.code).toBe('CUSTOM_CODE');
      });

      it('应该创建带有详细信息的错误', () => {
        const details = { key: 'value', number: 42 };
        const error = new OrchestratorError('Test error', 'CUSTOM_CODE', details);
        
        expect(error.details).toEqual(details);
      });

      it('应该有正确的堆栈跟踪', () => {
        const error = new OrchestratorError('Test error');
        
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('OrchestratorError');
      });
    });

    describe('WorkflowDefinitionError', () => {
      it('应该创建工作流定义错误', () => {
        const error = new WorkflowDefinitionError('Invalid workflow');
        
        expect(error).toBeInstanceOf(OrchestratorError);
        expect(error).toBeInstanceOf(WorkflowDefinitionError);
        expect(error.name).toBe('WorkflowDefinitionError');
        expect(error.message).toBe('Invalid workflow');
        expect(error.code).toBe('WORKFLOW_DEFINITION_ERROR');
      });

      it('应该创建带有详细信息的工作流定义错误', () => {
        const details = { workflowId: 'test-workflow' };
        const error = new WorkflowDefinitionError('Invalid workflow', details);
        
        expect(error.details).toEqual(details);
      });
    });

    describe('WorkflowExecutionError', () => {
      it('应该创建工作流执行错误', () => {
        const error = new WorkflowExecutionError('Execution failed');
        
        expect(error).toBeInstanceOf(OrchestratorError);
        expect(error).toBeInstanceOf(WorkflowExecutionError);
        expect(error.name).toBe('WorkflowExecutionError');
        expect(error.message).toBe('Execution failed');
        expect(error.code).toBe('WORKFLOW_EXECUTION_ERROR');
      });
    });

    describe('StepExecutionError', () => {
      it('应该创建步骤执行错误', () => {
        const error = new StepExecutionError('Step failed');
        
        expect(error).toBeInstanceOf(OrchestratorError);
        expect(error).toBeInstanceOf(StepExecutionError);
        expect(error.name).toBe('StepExecutionError');
        expect(error.message).toBe('Step failed');
        expect(error.code).toBe('STEP_EXECUTION_ERROR');
      });
    });

    describe('AgentNotFoundError', () => {
      it('应该创建智能体未找到错误', () => {
        const agentId = 'test-agent';
        const error = new AgentNotFoundError(agentId);
        
        expect(error).toBeInstanceOf(OrchestratorError);
        expect(error).toBeInstanceOf(AgentNotFoundError);
        expect(error.name).toBe('AgentNotFoundError');
        expect(error.message).toBe(`Agent not found: ${agentId}`);
        expect(error.code).toBe('AGENT_NOT_FOUND_ERROR');
        expect(error.details).toEqual({ agentId });
      });
    });

    describe('WorkflowNotFoundError', () => {
      it('应该创建工作流未找到错误', () => {
        const workflowId = 'test-workflow';
        const error = new WorkflowNotFoundError(workflowId);
        
        expect(error).toBeInstanceOf(OrchestratorError);
        expect(error).toBeInstanceOf(WorkflowNotFoundError);
        expect(error.name).toBe('WorkflowNotFoundError');
        expect(error.message).toBe(`Workflow not found: ${workflowId}`);
        expect(error.code).toBe('WORKFLOW_NOT_FOUND_ERROR');
        expect(error.details).toEqual({ workflowId });
      });
    });
  });

  describe('Type Guards and Validation', () => {
    it('应该正确识别错误类型', () => {
      const orchestratorError = new OrchestratorError('Test');
      const workflowError = new WorkflowDefinitionError('Test');
      const executionError = new WorkflowExecutionError('Test');
      const stepError = new StepExecutionError('Test');
      const agentError = new AgentNotFoundError('test-agent');
      const workflowNotFoundError = new WorkflowNotFoundError('test-workflow');
      const genericError = new Error('Generic error');

      // OrchestratorError checks
      expect(orchestratorError instanceof OrchestratorError).toBe(true);
      expect(workflowError instanceof OrchestratorError).toBe(true);
      expect(executionError instanceof OrchestratorError).toBe(true);
      expect(stepError instanceof OrchestratorError).toBe(true);
      expect(agentError instanceof OrchestratorError).toBe(true);
      expect(workflowNotFoundError instanceof OrchestratorError).toBe(true);
      expect(genericError instanceof OrchestratorError).toBe(false);

      // Specific error type checks
      expect(workflowError instanceof WorkflowDefinitionError).toBe(true);
      expect(executionError instanceof WorkflowExecutionError).toBe(true);
      expect(stepError instanceof StepExecutionError).toBe(true);
      expect(agentError instanceof AgentNotFoundError).toBe(true);
      expect(workflowNotFoundError instanceof WorkflowNotFoundError).toBe(true);

      // Cross-type checks (should be false)
      expect(workflowError instanceof WorkflowExecutionError).toBe(false);
      expect(executionError instanceof StepExecutionError).toBe(false);
      expect(agentError instanceof WorkflowNotFoundError).toBe(false);
    });

    it('应该保持错误链', () => {
      const originalError = new Error('Original error');
      const wrappedError = new WorkflowExecutionError('Wrapped error', { 
        originalError: originalError.message 
      });

      expect(wrappedError.details?.originalError).toBe('Original error');
    });
  });

  describe('Error Serialization', () => {
    it('应该正确序列化错误信息', () => {
      const error = new WorkflowDefinitionError('Test error', { 
        workflowId: 'test-workflow',
        stepId: 'test-step'
      });

      const serialized = JSON.stringify({
        name: error.name,
        message: error.message,
        code: error.code,
        details: error.details
      });

      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe('WorkflowDefinitionError');
      expect(parsed.message).toBe('Test error');
      expect(parsed.code).toBe('WORKFLOW_DEFINITION_ERROR');
      expect(parsed.details).toEqual({
        workflowId: 'test-workflow',
        stepId: 'test-step'
      });
    });
  });

  describe('Error Handling Patterns', () => {
    it('应该支持错误重新抛出', () => {
      const throwError = (): void => {
        throw new AgentNotFoundError('test-agent');
      };

      const catchAndRethrow = (): void => {
        try {
          throwError();
        } catch (error) {
          if (error instanceof AgentNotFoundError) {
            throw new WorkflowExecutionError('Failed to execute workflow', {
              originalError: error.message,
              agentId: error.details?.agentId
            });
          }
          throw error;
        }
      };

      expect(() => catchAndRethrow()).toThrow(WorkflowExecutionError);
      expect(() => catchAndRethrow()).toThrow('Failed to execute workflow');
    });

    it('应该支持错误分类处理', () => {
      const errors = [
        new OrchestratorError('Generic error'),
        new WorkflowDefinitionError('Definition error'),
        new WorkflowExecutionError('Execution error'),
        new StepExecutionError('Step error'),
        new AgentNotFoundError('test-agent'),
        new WorkflowNotFoundError('test-workflow')
      ];

      const categorizeError = (error: Error): string => {
        if (error instanceof AgentNotFoundError) return 'agent';
        if (error instanceof WorkflowNotFoundError) return 'workflow';
        if (error instanceof StepExecutionError) return 'step';
        if (error instanceof WorkflowExecutionError) return 'execution';
        if (error instanceof WorkflowDefinitionError) return 'definition';
        if (error instanceof OrchestratorError) return 'orchestrator';
        return 'unknown';
      };

      const categories = errors.map(categorizeError);

      expect(categories).toEqual([
        'orchestrator',
        'definition',
        'execution',
        'step',
        'agent',
        'workflow'
      ]);
    });
  });
});

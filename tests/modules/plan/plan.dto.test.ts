/**
 * Plan DTO测试
 * 
 * 测试src/modules/plan/api/dto/plan.dto.ts
 * 验证DTO类型定义的正确性和一致性
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import {
  CreatePlanRequestDto,
  UpdatePlanRequestDto,
  PlanResponseDto,
  PlanTaskDto,
  PlanDependencyDto,
  DurationDto,
  PlanConfigurationDto,
  RiskAssessmentDto,
  PlanExecutionRequestDto,
  PlanExecutionResultDto,
  PlanStatusDto
} from '../../../src/modules/plan/api/dto/plan.dto';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('Plan DTO Types', () => {
  describe('CreatePlanRequestDto', () => {
    it('should accept valid create plan request data', () => {
      const createRequest: CreatePlanRequestDto = {
        context_id: uuidv4(),
        name: 'Test Plan',
        description: 'Test description',
        goals: ['Goal 1', 'Goal 2'],
        execution_strategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM
      };

      expect(createRequest.context_id).toBeDefined();
      expect(createRequest.name).toBe('Test Plan');
      expect(createRequest.description).toBe('Test description');
      expect(createRequest.goals).toEqual(['Goal 1', 'Goal 2']);
      expect(createRequest.execution_strategy).toBe(ExecutionStrategy.SEQUENTIAL);
      expect(createRequest.priority).toBe(Priority.MEDIUM);
    });

    it('should accept minimal create plan request data', () => {
      const minimalRequest: CreatePlanRequestDto = {
        context_id: uuidv4(),
        name: 'Minimal Plan',
        description: 'Minimal description'
      };

      expect(minimalRequest.context_id).toBeDefined();
      expect(minimalRequest.name).toBe('Minimal Plan');
      expect(minimalRequest.description).toBe('Minimal description');
    });

    it('should accept optional fields', () => {
      const requestWithOptionals: CreatePlanRequestDto = {
        plan_id: uuidv4(),
        context_id: uuidv4(),
        name: 'Plan with Optionals',
        description: 'Description with optionals',
        goals: ['Goal 1'],
        tasks: [],
        dependencies: [],
        estimated_duration: {
          value: 3600,
          unit: 'seconds'
        },
        metadata: {
          customField: 'customValue'
        }
      };

      expect(requestWithOptionals.plan_id).toBeDefined();
      expect(requestWithOptionals.tasks).toEqual([]);
      expect(requestWithOptionals.dependencies).toEqual([]);
      expect(requestWithOptionals.estimated_duration).toEqual({
        value: 3600,
        unit: 'seconds'
      });
      expect(requestWithOptionals.metadata).toEqual({
        customField: 'customValue'
      });
    });
  });

  describe('UpdatePlanRequestDto', () => {
    it('should accept valid update plan request data', () => {
      const updateRequest: UpdatePlanRequestDto = {
        name: 'Updated Plan',
        description: 'Updated description',
        status: PlanStatus.ACTIVE,
        goals: ['Updated Goal'],
        execution_strategy: ExecutionStrategy.PARALLEL,
        priority: Priority.HIGH
      };

      expect(updateRequest.name).toBe('Updated Plan');
      expect(updateRequest.description).toBe('Updated description');
      expect(updateRequest.status).toBe(PlanStatus.ACTIVE);
      expect(updateRequest.goals).toEqual(['Updated Goal']);
      expect(updateRequest.execution_strategy).toBe(ExecutionStrategy.PARALLEL);
      expect(updateRequest.priority).toBe(Priority.HIGH);
    });

    it('should accept partial update data', () => {
      const partialUpdate: UpdatePlanRequestDto = {
        name: 'Only Name Updated'
      };

      expect(partialUpdate.name).toBe('Only Name Updated');
      expect(partialUpdate.description).toBeUndefined();
      expect(partialUpdate.status).toBeUndefined();
    });
  });

  describe('PlanResponseDto', () => {
    it('should represent complete plan response data', () => {
      const planResponse: PlanResponseDto = {
        plan_id: uuidv4(),
        context_id: uuidv4(),
        name: 'Response Plan',
        description: 'Response description',
        status: PlanStatus.ACTIVE,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['Response Goal'],
        tasks: [],
        dependencies: [],
        execution_strategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        progress: {
          completed_tasks: 5,
          total_tasks: 10,
          percentage: 50
        },
        configuration: {
          execution_settings: {
            strategy: ExecutionStrategy.SEQUENTIAL,
            default_timeout_ms: 30000,
            retry_policy: {
              max_retries: 3,
              retry_delay_ms: 1000,
              backoff_factor: 2
            }
          },
          notification_settings: {
            enabled: true,
            channels: ['email'],
            events: ['completion']
          },
          optimization_settings: {
            enabled: true,
            strategies: ['time'],
            auto_adjust: false
          }
        }
      };

      expect(planResponse.plan_id).toBeDefined();
      expect(planResponse.context_id).toBeDefined();
      expect(planResponse.name).toBe('Response Plan');
      expect(planResponse.status).toBe(PlanStatus.ACTIVE);
      expect(planResponse.progress.percentage).toBe(50);
      expect(planResponse.configuration.execution_settings.strategy).toBe(ExecutionStrategy.SEQUENTIAL);
    });
  });

  describe('PlanTaskDto', () => {
    it('should represent task data correctly', () => {
      const task: PlanTaskDto = {
        task_id: uuidv4(),
        name: 'Test Task',
        description: 'Test task description',
        status: 'pending',
        priority: 'medium',
        type: 'development'
      };

      expect(task.task_id).toBeDefined();
      expect(task.name).toBe('Test Task');
      expect(task.description).toBe('Test task description');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
      expect(task.type).toBe('development');
    });
  });

  describe('DurationDto', () => {
    it('should represent duration correctly', () => {
      const duration: DurationDto = {
        value: 3600,
        unit: 'seconds'
      };

      expect(duration.value).toBe(3600);
      expect(duration.unit).toBe('seconds');
    });

    it('should support different time units', () => {
      const durations: DurationDto[] = [
        { value: 60, unit: 'seconds' },
        { value: 30, unit: 'minutes' },
        { value: 8, unit: 'hours' },
        { value: 5, unit: 'days' }
      ];

      durations.forEach(duration => {
        expect(duration.value).toBeGreaterThan(0);
        expect(duration.unit).toBeDefined();
      });
    });
  });

  describe('PlanExecutionRequestDto', () => {
    it('should represent execution request correctly', () => {
      const executionRequest: PlanExecutionRequestDto = {
        execution_context: {
          environment: 'production'
        },
        execution_options: {
          parallel_limit: 5,
          timeout_ms: 60000,
          retry_failed_tasks: true,
          failure_strategy: 'continue'
        },
        execution_variables: {
          variable1: 'value1'
        },
        conditions: {
          condition1: true
        }
      };

      expect(executionRequest.execution_context).toEqual({
        environment: 'production'
      });
      expect(executionRequest.execution_options?.parallel_limit).toBe(5);
      expect(executionRequest.execution_options?.timeout_ms).toBe(60000);
      expect(executionRequest.execution_options?.retry_failed_tasks).toBe(true);
    });
  });

  describe('PlanExecutionResultDto', () => {
    it('should represent execution result correctly', () => {
      const executionResult: PlanExecutionResultDto = {
        success: true,
        plan_id: uuidv4(),
        status: 'completed',
        execution_id: uuidv4(),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        execution_time_ms: 5000,
        tasks_status: {
          pending: 0,
          in_progress: 0,
          completed: 10,
          failed: 0,
          cancelled: 0,
          skipped: 0
        }
      };

      expect(executionResult.success).toBe(true);
      expect(executionResult.plan_id).toBeDefined();
      expect(executionResult.status).toBe('completed');
      expect(executionResult.execution_time_ms).toBe(5000);
      expect(executionResult.tasks_status.completed).toBe(10);
    });

    it('should handle failed execution result', () => {
      const failedResult: PlanExecutionResultDto = {
        success: false,
        plan_id: uuidv4(),
        status: 'failed',
        execution_time_ms: 2000,
        tasks_status: {
          pending: 5,
          in_progress: 0,
          completed: 3,
          failed: 2,
          cancelled: 0,
          skipped: 0
        },
        error: 'Task execution failed'
      };

      expect(failedResult.success).toBe(false);
      expect(failedResult.status).toBe('failed');
      expect(failedResult.error).toBe('Task execution failed');
      expect(failedResult.tasks_status.failed).toBe(2);
    });
  });

  describe('PlanStatusDto', () => {
    it('should represent plan status correctly', () => {
      const planStatus: PlanStatusDto = {
        plan_id: uuidv4(),
        status: PlanStatus.ACTIVE,
        progress: {
          completed_tasks: 7,
          total_tasks: 10,
          percentage: 70
        },
        updated_at: new Date().toISOString()
      };

      expect(planStatus.plan_id).toBeDefined();
      expect(planStatus.status).toBe(PlanStatus.ACTIVE);
      expect(planStatus.progress.percentage).toBe(70);
      expect(planStatus.updated_at).toBeDefined();
    });
  });

  describe('DTO Consistency', () => {
    it('should maintain consistent field naming (snake_case)', () => {
      const createRequest: CreatePlanRequestDto = {
        context_id: uuidv4(),
        name: 'Consistency Test',
        description: 'Testing naming consistency',
        execution_strategy: ExecutionStrategy.SEQUENTIAL,
        estimated_duration: {
          value: 3600,
          unit: 'seconds'
        }
      };

      // 验证所有字段都使用snake_case
      expect(createRequest.context_id).toBeDefined();
      expect(createRequest.execution_strategy).toBeDefined();
      expect(createRequest.estimated_duration).toBeDefined();
    });

    it('should support nested object consistency', () => {
      const planResponse: PlanResponseDto = {
        plan_id: uuidv4(),
        context_id: uuidv4(),
        name: 'Nested Test',
        description: 'Testing nested consistency',
        status: PlanStatus.DRAFT,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['Test Goal'],
        tasks: [],
        dependencies: [],
        execution_strategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        progress: {
          completed_tasks: 0,
          total_tasks: 0,
          percentage: 0
        },
        configuration: {
          execution_settings: {
            strategy: ExecutionStrategy.SEQUENTIAL,
            default_timeout_ms: 30000,
            retry_policy: {
              max_retries: 3,
              retry_delay_ms: 1000,
              backoff_factor: 2
            }
          },
          notification_settings: {
            enabled: false,
            channels: [],
            events: []
          },
          optimization_settings: {
            enabled: false,
            strategies: [],
            auto_adjust: false
          }
        }
      };

      // 验证嵌套对象的字段命名一致性
      expect(planResponse.progress.completed_tasks).toBeDefined();
      expect(planResponse.progress.total_tasks).toBeDefined();
      expect(planResponse.configuration.execution_settings.default_timeout_ms).toBeDefined();
      expect(planResponse.configuration.execution_settings.retry_policy.max_retries).toBeDefined();
      expect(planResponse.configuration.optimization_settings.auto_adjust).toBeDefined();
    });
  });
});

/**
 * Plan实体增强功能测试
 * 
 * 测试Plan实体的Schema映射支持和企业级功能
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('Plan Entity Enhanced Features', () => {
  let testPlan: Plan;
  let testPlanData: Record<string, unknown>;

  beforeEach(() => {
    testPlanData = {
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Test Plan',
      description: 'Test plan description',
      status: PlanStatus.DRAFT,
      version: '1.0.0',
      goals: ['Goal 1', 'Goal 2'],
      tasks: [
        {
          taskId: 'task-1',
          name: 'Task 1',
          description: 'First task',
          status: 'pending',
          priority: 'medium',
          dependencies: [],
          estimatedDuration: 3600,
          assignedAgents: ['agent-1'],
          createdBy: 'test-user'
        },
        {
          taskId: 'task-2',
          name: 'Task 2',
          description: 'Second task',
          status: 'completed',
          priority: 'high',
          dependencies: ['task-1'],
          estimatedDuration: 1800,
          assignedAgents: ['agent-2'],
          createdBy: 'test-user'
        }
      ],
      dependencies: [],
      executionStrategy: ExecutionStrategy.SEQUENTIAL,
      priority: Priority.MEDIUM,
      estimatedDuration: {
        value: 5400,
        unit: 'seconds'
      },
      createdBy: 'test-user'
    };

    testPlan = new Plan(testPlanData);
  });

  describe('Schema映射支持', () => {
    describe('toSchemaFormat', () => {
      it('should convert Plan entity to Schema format correctly', () => {
        const schemaFormat = testPlan.toSchemaFormat();

        expect(schemaFormat.plan_id).toBe(testPlanData.planId);
        expect(schemaFormat.context_id).toBe(testPlanData.contextId);
        expect(schemaFormat.name).toBe(testPlanData.name);
        expect(schemaFormat.description).toBe(testPlanData.description);
        expect(schemaFormat.status).toBe(testPlanData.status);
        expect(schemaFormat.execution_strategy).toBe(testPlanData.executionStrategy);
        expect(schemaFormat.priority).toBe(testPlanData.priority);
        expect(schemaFormat.estimated_duration).toEqual(testPlanData.estimatedDuration);
        expect(schemaFormat.created_by).toBe(testPlanData.createdBy);
      });

      it('should convert tasks to Schema format with snake_case fields', () => {
        const schemaFormat = testPlan.toSchemaFormat();
        const tasks = schemaFormat.tasks as Array<Record<string, unknown>>;

        expect(tasks).toHaveLength(2);
        expect(tasks[0].task_id).toBe('task-1');
        expect(tasks[0].name).toBe('Task 1');
        expect(tasks[0].estimated_effort).toEqual({
          value: 3600,
          unit: 'seconds'
        });
        expect(tasks[0].assigned_agents).toEqual(['agent-1']);
        expect(tasks[0].created_by).toBe('test-user');

        expect(tasks[1].task_id).toBe('task-2');
        expect(tasks[1].status).toBe('completed');
      });

      it('should handle progress object correctly', () => {
        const schemaFormat = testPlan.toSchemaFormat();
        const progress = schemaFormat.progress as Record<string, unknown>;

        expect(progress.completed_tasks).toBe(1); // task-2 is completed
        expect(progress.total_tasks).toBe(2);
        expect(progress.percentage).toBe(50);
      });
    });

    describe('fromSchemaFormat', () => {
      it('should create Plan instance from Schema format', () => {
        const schemaData = {
          plan_id: uuidv4(),
          context_id: uuidv4(),
          name: 'Schema Plan',
          description: 'Plan from schema',
          status: 'active',
          version: '2.0.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          goals: ['Schema Goal'],
          tasks: [],
          dependencies: [],
          execution_strategy: 'parallel',
          priority: 'high',
          created_by: 'schema-user'
        };

        const plan = Plan.fromSchemaFormat(schemaData);

        expect(plan.planId).toBe(schemaData.plan_id);
        expect(plan.contextId).toBe(schemaData.context_id);
        expect(plan.name).toBe(schemaData.name);
        expect(plan.description).toBe(schemaData.description);
        expect(plan.status).toBe(schemaData.status);
        expect(plan.version).toBe(schemaData.version);
        expect(plan.goals).toEqual(schemaData.goals);
        expect(plan.executionStrategy).toBe(schemaData.execution_strategy);
        expect(plan.priority).toBe(schemaData.priority);
        expect(plan.createdBy).toBe(schemaData.created_by);
      });
    });

    describe('validateSchemaData', () => {
      it('should validate correct schema data', () => {
        const validSchema = {
          plan_id: uuidv4(),
          context_id: uuidv4(),
          name: 'Valid Plan',
          goals: ['Goal 1'],
          tasks: [],
          dependencies: []
        };

        const result = Plan.validateSchemaData(validSchema);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect missing required fields', () => {
        const invalidSchema = {
          name: 'Invalid Plan'
          // missing plan_id and context_id
        };

        const result = Plan.validateSchemaData(invalidSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('plan_id is required');
        expect(result.errors).toContain('context_id is required');
      });

      it('should detect invalid field types', () => {
        const invalidSchema = {
          plan_id: uuidv4(),
          context_id: uuidv4(),
          name: 'Invalid Plan',
          goals: 'not an array', // should be array
          tasks: 'not an array', // should be array
          dependencies: 'not an array' // should be array
        };

        const result = Plan.validateSchemaData(invalidSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('goals must be an array');
        expect(result.errors).toContain('tasks must be an array');
        expect(result.errors).toContain('dependencies must be an array');
      });
    });
  });

  describe('企业级功能方法', () => {
    describe('getStatusReport', () => {
      it('should generate comprehensive status report', () => {
        const report = testPlan.getStatusReport();

        expect(report.planId).toBe(testPlan.planId);
        expect(report.name).toBe(testPlan.name);
        expect(report.status).toBe(testPlan.status);
        expect(report.progress.completedTasks).toBe(1);
        expect(report.progress.totalTasks).toBe(2);
        expect(report.progress.percentage).toBe(50);
        expect(report.health).toBeDefined();
        expect(Array.isArray(report.issues)).toBe(true);
        expect(Array.isArray(report.recommendations)).toBe(true);
      });

      it('should detect health issues for empty plan', () => {
        const emptyPlan = new Plan({
          planId: uuidv4(),
          contextId: uuidv4(),
          name: 'Empty Plan',
          description: 'Plan with no tasks',
          status: PlanStatus.DRAFT,
          goals: [],
          tasks: [],
          dependencies: [],
          executionStrategy: ExecutionStrategy.SEQUENTIAL,
          priority: Priority.MEDIUM,
          createdBy: 'test-user'
        });

        const report = emptyPlan.getStatusReport();

        expect(report.health).toBe('warning');
        expect(report.issues).toContain('No tasks defined');
        expect(report.recommendations).toContain('Add tasks to the plan');
      });

      it('should provide recommendations for active plan with low progress', () => {
        const activePlan = new Plan({
          ...testPlanData,
          status: PlanStatus.ACTIVE,
          tasks: [
            {
              taskId: 'task-1',
              name: 'Task 1',
              description: 'Pending task',
              status: 'pending',
              priority: 'medium',
              dependencies: [],
              estimatedDuration: 3600,
              assignedAgents: ['agent-1'],
              createdBy: 'test-user'
            }
          ]
        });

        const report = activePlan.getStatusReport();

        expect(report.recommendations).toContain('Consider starting task execution');
      });
    });

    describe('getExecutionReadiness', () => {
      it('should assess execution readiness correctly', () => {
        // Create a plan ready for execution
        const readyPlan = new Plan({
          ...testPlanData,
          status: PlanStatus.ACTIVE,
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
          },
          riskAssessment: {
            overall_risk_level: 'low',
            risks: [],
            last_assessed: new Date().toISOString()
          }
        });

        const readiness = readyPlan.getExecutionReadiness();

        expect(readiness.ready).toBe(true);
        expect(readiness.score).toBeGreaterThan(70);
        expect(readiness.checklist).toHaveLength(7);

        // Check specific checklist items
        const statusCheck = readiness.checklist.find(item => item.item === 'Plan Status');
        expect(statusCheck?.status).toBe('pass');

        const tasksCheck = readiness.checklist.find(item => item.item === 'Tasks Defined');
        expect(tasksCheck?.status).toBe('pass');

        const configCheck = readiness.checklist.find(item => item.item === 'Configuration Present');
        expect(configCheck?.status).toBe('pass');

        const riskCheck = readiness.checklist.find(item => item.item === 'Risk Assessment');
        expect(riskCheck?.status).toBe('pass');
      });

      it('should identify execution blockers', () => {
        const notReadyPlan = new Plan({
          planId: uuidv4(),
          contextId: uuidv4(),
          name: 'Not Ready Plan',
          description: 'Plan not ready for execution',
          status: PlanStatus.DRAFT, // Wrong status
          goals: [],
          tasks: [], // No tasks
          dependencies: [],
          executionStrategy: ExecutionStrategy.SEQUENTIAL,
          priority: Priority.MEDIUM,
          createdBy: 'test-user'
        });

        const readiness = notReadyPlan.getExecutionReadiness();

        expect(readiness.ready).toBe(false);
        expect(readiness.score).toBeLessThan(70);

        // Check for specific failures
        const statusCheck = readiness.checklist.find(item => item.item === 'Plan Status');
        expect(statusCheck?.status).toBe('fail');

        const tasksCheck = readiness.checklist.find(item => item.item === 'Tasks Defined');
        expect(tasksCheck?.status).toBe('fail');
      });

      it('should handle warnings for incomplete setup', () => {
        const partialPlan = new Plan({
          ...testPlanData,
          status: PlanStatus.ACTIVE,
          // Missing configuration and risk assessment
        });

        const readiness = partialPlan.getExecutionReadiness();

        const configCheck = readiness.checklist.find(item => item.item === 'Configuration Present');
        expect(configCheck?.status).toBe('warning');

        const riskCheck = readiness.checklist.find(item => item.item === 'Risk Assessment');
        expect(riskCheck?.status).toBe('warning');
      });
    });
  });

  describe('Schema映射一致性', () => {
    it('should maintain consistency between toSchemaFormat and fromSchemaFormat', () => {
      // 转换为Schema格式
      const schemaFormat = testPlan.toSchemaFormat();
      
      // 从Schema格式重新创建Plan
      const recreatedPlan = Plan.fromSchemaFormat(schemaFormat);

      // 验证关键字段的一致性
      expect(recreatedPlan.planId).toBe(testPlan.planId);
      expect(recreatedPlan.contextId).toBe(testPlan.contextId);
      expect(recreatedPlan.name).toBe(testPlan.name);
      expect(recreatedPlan.description).toBe(testPlan.description);
      expect(recreatedPlan.status).toBe(testPlan.status);
      expect(recreatedPlan.executionStrategy).toBe(testPlan.executionStrategy);
      expect(recreatedPlan.priority).toBe(testPlan.priority);
      expect(recreatedPlan.goals).toEqual(testPlan.goals);
      expect(recreatedPlan.createdBy).toBe(testPlan.createdBy);
    });
  });
});

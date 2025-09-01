/**
 * Plan DTO单元测试
 *
 * @description 验证Plan模块的数据传输对象结构和验证
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的DTO测试模式
 */

import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  PlanResponseDto,
  PaginatedPlanResponseDto,
  PlanOperationResultDto,
  PlanExecutionDto,
  PlanOptimizationDto,
  PlanValidationDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  ResourceAllocationDto,
  RiskItemDto
} from '../../../src/modules/plan/api/dto/plan.dto';

describe('Plan DTO单元测试', () => {

  describe('CreatePlanDto测试', () => {
    it('应该创建有效的CreatePlanDto实例', () => {
      // 📋 Arrange & Act
      const dto = new CreatePlanDto();
      dto.contextId = 'ctx-test-001';
      dto.name = 'Test Plan';
      dto.description = 'Test plan description';
      dto.priority = 'high';
      dto.tasks = [
        {
          name: 'Test Task',
          type: 'atomic',
          priority: 'medium'
        }
      ];

      // ✅ Assert
      expect(dto.contextId).toBe('ctx-test-001');
      expect(dto.name).toBe('Test Plan');
      expect(dto.description).toBe('Test plan description');
      expect(dto.priority).toBe('high');
      expect(dto.tasks).toHaveLength(1);
      expect(dto.tasks![0].name).toBe('Test Task');
      expect(dto.tasks![0].type).toBe('atomic');
    });

    it('应该支持最小必需字段', () => {
      // 📋 Arrange & Act
      const dto = new CreatePlanDto();
      dto.contextId = 'ctx-minimal-001';
      dto.name = 'Minimal Plan';

      // ✅ Assert
      expect(dto.contextId).toBe('ctx-minimal-001');
      expect(dto.name).toBe('Minimal Plan');
      expect(dto.description).toBeUndefined();
      expect(dto.priority).toBeUndefined();
      expect(dto.tasks).toBeUndefined();
    });

    it('应该支持复杂的任务配置', () => {
      // 📋 Arrange & Act
      const dto = new CreatePlanDto();
      dto.contextId = 'ctx-complex-001';
      dto.name = 'Complex Plan';
      dto.tasks = [
        {
          name: 'Complex Task 1',
          type: 'composite',
          priority: 'critical'
        },
        {
          name: 'Complex Task 2',
          type: 'milestone',
          priority: 'high'
        }
      ];
      dto.milestones = [
        {
          name: 'First Milestone',
          targetDate: new Date('2024-06-01'),
          criteria: ['Task 1 completed', 'Quality check passed']
        }
      ];

      // ✅ Assert
      expect(dto.tasks).toHaveLength(2);
      expect(dto.tasks![0].type).toBe('composite');
      expect(dto.tasks![1].type).toBe('milestone');
      expect(dto.milestones).toHaveLength(1);
      expect(dto.milestones![0].name).toBe('First Milestone');
      expect(dto.milestones![0].criteria).toContain('Task 1 completed');
    });
  });

  describe('UpdatePlanDto测试', () => {
    it('应该创建有效的UpdatePlanDto实例', () => {
      // 📋 Arrange & Act
      const dto = new UpdatePlanDto();
      dto.planId = 'plan-test-001';
      dto.name = 'Updated Plan Name';
      dto.description = 'Updated description';
      dto.status = 'active';
      dto.priority = 'critical';

      // ✅ Assert
      expect(dto.planId).toBe('plan-test-001');
      expect(dto.name).toBe('Updated Plan Name');
      expect(dto.description).toBe('Updated description');
      expect(dto.status).toBe('active');
      expect(dto.priority).toBe('critical');
    });

    it('应该支持部分更新', () => {
      // 📋 Arrange & Act
      const dto = new UpdatePlanDto();
      dto.planId = 'plan-partial-001';
      dto.status = 'paused';

      // ✅ Assert
      expect(dto.planId).toBe('plan-partial-001');
      expect(dto.status).toBe('paused');
      expect(dto.name).toBeUndefined();
      expect(dto.description).toBeUndefined();
      expect(dto.priority).toBeUndefined();
    });
  });

  describe('PlanQueryDto测试', () => {
    it('应该创建有效的PlanQueryDto实例', () => {
      // 📋 Arrange & Act
      const dto = new PlanQueryDto();
      dto.status = ['active', 'paused'];
      dto.priority = 'high';
      dto.contextId = 'ctx-query-001';
      dto.namePattern = 'Test*';
      dto.assignedTo = 'user-001';

      // ✅ Assert
      expect(dto.status).toEqual(['active', 'paused']);
      expect(dto.priority).toBe('high');
      expect(dto.contextId).toBe('ctx-query-001');
      expect(dto.namePattern).toBe('Test*');
      expect(dto.assignedTo).toBe('user-001');
    });

    it('应该支持日期范围查询', () => {
      // 📋 Arrange & Act
      const dto = new PlanQueryDto();
      dto.createdAfter = '2024-01-01T00:00:00.000Z';
      dto.createdBefore = '2024-12-31T23:59:59.999Z';

      // ✅ Assert
      expect(dto.createdAfter).toBe('2024-01-01T00:00:00.000Z');
      expect(dto.createdBefore).toBe('2024-12-31T23:59:59.999Z');
    });
  });

  describe('PlanResponseDto测试', () => {
    it('应该创建有效的PlanResponseDto实例', () => {
      // 📋 Arrange & Act
      const dto = new PlanResponseDto();
      dto.planId = 'plan-response-001';
      dto.contextId = 'ctx-response-001';
      dto.name = 'Response Plan';
      dto.status = 'active';
      dto.priority = 'high';
      dto.protocolVersion = '1.0.0';
      dto.timestamp = '2024-01-01T12:00:00.000Z';
      dto.tasks = [
        {
          taskId: 'task-001',
          name: 'Response Task',
          type: 'atomic',
          status: 'pending',
          priority: 'medium'
        }
      ];
      dto.auditTrail = {
        enabled: true,
        retentionDays: 90
      };
      dto.monitoringIntegration = { enabled: true };
      dto.performanceMetrics = { responseTime: 100 };

      // ✅ Assert
      expect(dto.planId).toBe('plan-response-001');
      expect(dto.contextId).toBe('ctx-response-001');
      expect(dto.name).toBe('Response Plan');
      expect(dto.status).toBe('active');
      expect(dto.priority).toBe('high');
      expect(dto.protocolVersion).toBe('1.0.0');
      expect(dto.timestamp).toBe('2024-01-01T12:00:00.000Z');
      expect(dto.tasks).toHaveLength(1);
      expect(dto.tasks[0].taskId).toBe('task-001');
      expect(dto.auditTrail.enabled).toBe(true);
      expect(dto.monitoringIntegration.enabled).toBe(true);
    });
  });

  describe('PaginatedPlanResponseDto测试', () => {
    it('应该创建有效的PaginatedPlanResponseDto实例', () => {
      // 📋 Arrange & Act
      const dto = new PaginatedPlanResponseDto();
      dto.success = true;
      dto.data = [
        {
          planId: 'plan-001',
          contextId: 'ctx-001',
          name: 'Plan 1',
          status: 'active',
          priority: 'high',
          protocolVersion: '1.0.0',
          timestamp: '2024-01-01T12:00:00.000Z',
          tasks: [],
          auditTrail: { enabled: true, retentionDays: 90 },
          monitoringIntegration: {},
          performanceMetrics: {}
        } as any
      ];
      dto.pagination = {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      };

      // ✅ Assert
      expect(dto.success).toBe(true);
      expect(dto.data).toHaveLength(1);
      expect(dto.data[0].planId).toBe('plan-001');
      expect(dto.pagination.page).toBe(1);
      expect(dto.pagination.limit).toBe(10);
      expect(dto.pagination.total).toBe(1);
      expect(dto.pagination.totalPages).toBe(1);
    });

    it('应该支持错误状态', () => {
      // 📋 Arrange & Act
      const dto = new PaginatedPlanResponseDto();
      dto.success = false;
      dto.data = [];
      dto.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };
      dto.error = {
        code: 'QUERY_FAILED',
        message: 'Database connection failed',
        details: { query: 'SELECT * FROM plans' }
      };

      // ✅ Assert
      expect(dto.success).toBe(false);
      expect(dto.data).toHaveLength(0);
      expect(dto.error).toBeDefined();
      expect(dto.error!.code).toBe('QUERY_FAILED');
      expect(dto.error!.message).toBe('Database connection failed');
    });
  });

  describe('PlanOperationResultDto测试', () => {
    it('应该创建成功的操作结果', () => {
      // 📋 Arrange & Act
      const dto = new PlanOperationResultDto();
      dto.success = true;
      dto.planId = 'plan-success-001';
      dto.message = 'Operation completed successfully';
      dto.metadata = {
        operationType: 'create',
        executionTime: 150,
        affectedTasks: 5
      };

      // ✅ Assert
      expect(dto.success).toBe(true);
      expect(dto.planId).toBe('plan-success-001');
      expect(dto.message).toBe('Operation completed successfully');
      expect(dto.metadata?.operationType).toBe('create');
      expect(dto.metadata?.executionTime).toBe(150);
    });

    it('应该创建失败的操作结果', () => {
      // 📋 Arrange & Act
      const dto = new PlanOperationResultDto();
      dto.success = false;
      dto.error = {
        code: 'OPERATION_FAILED',
        message: 'Validation failed',
        details: {
          field: 'name',
          reason: 'Name cannot be empty'
        }
      };

      // ✅ Assert
      expect(dto.success).toBe(false);
      expect(dto.planId).toBeUndefined();
      expect(dto.error).toBeDefined();
      expect(dto.error!.code).toBe('OPERATION_FAILED');
      expect(dto.error!.message).toBe('Validation failed');
      expect(dto.error!.details?.field).toBe('name');
    });
  });

  describe('执行相关DTO测试', () => {
    it('应该创建有效的PlanExecutionDto', () => {
      // 📋 Arrange & Act
      const dto = new PlanExecutionDto();
      dto.executionMode = 'parallel';
      dto.dryRun = true;
      dto.skipValidation = false;
      dto.notifyOnCompletion = true;
      dto.customConfig = {
        maxParallelTasks: 5,
        timeout: 3600
      };

      // ✅ Assert
      expect(dto.executionMode).toBe('parallel');
      expect(dto.dryRun).toBe(true);
      expect(dto.skipValidation).toBe(false);
      expect(dto.notifyOnCompletion).toBe(true);
      expect(dto.customConfig?.maxParallelTasks).toBe(5);
    });

    it('应该创建有效的PlanOptimizationDto', () => {
      // 📋 Arrange & Act
      const dto = new PlanOptimizationDto();
      dto.targets = ['time', 'cost', 'quality'];
      dto.constraints = {
        maxDuration: 30,
        maxCost: 10000,
        minQuality: 0.9
      };
      dto.algorithm = 'genetic';
      dto.iterations = 100;

      // ✅ Assert
      expect(dto.targets).toEqual(['time', 'cost', 'quality']);
      expect(dto.constraints?.maxDuration).toBe(30);
      expect(dto.constraints?.maxCost).toBe(10000);
      expect(dto.algorithm).toBe('genetic');
      expect(dto.iterations).toBe(100);
    });

    it('应该创建有效的PlanValidationDto', () => {
      // 📋 Arrange & Act
      const dto = new PlanValidationDto();
      dto.validationLevel = 'comprehensive';
      dto.includeWarnings = true;
      dto.customRules = [
        {
          ruleId: 'rule-001',
          name: 'Custom Rule',
          description: 'Custom validation rule',
          type: 'business',
          severity: 'error',
          condition: 'tasks.length > 0',
          message: 'Plan must have at least one task',
          enabled: true
        }
      ];
      dto.skipRuleIds = ['rule-002', 'rule-003'];

      // ✅ Assert
      expect(dto.validationLevel).toBe('comprehensive');
      expect(dto.includeWarnings).toBe(true);
      expect(dto.customRules).toHaveLength(1);
      expect(dto.customRules![0].name).toBe('Custom Rule');
      expect(dto.skipRuleIds).toEqual(['rule-002', 'rule-003']);
    });
  });

  describe('任务相关DTO测试', () => {
    it('应该创建有效的CreateTaskDto', () => {
      // 📋 Arrange & Act
      const dto = new CreateTaskDto();
      dto.name = 'New Task';
      dto.description = 'Task description';
      dto.type = 'atomic';
      dto.priority = 'high';
      dto.estimatedDuration = 8;
      dto.durationUnit = 'hours';
      dto.assignedTo = ['user-001', 'user-002'];
      dto.dependencies = [
        {
          taskId: 'task-dep-001',
          type: 'finish_to_start',
          lag: 1,
          lagUnit: 'days'
        }
      ];
      dto.tags = ['urgent', 'frontend'];
      dto.metadata = { component: 'ui', complexity: 'medium' };

      // ✅ Assert
      expect(dto.name).toBe('New Task');
      expect(dto.type).toBe('atomic');
      expect(dto.priority).toBe('high');
      expect(dto.estimatedDuration).toBe(8);
      expect(dto.durationUnit).toBe('hours');
      expect(dto.assignedTo).toEqual(['user-001', 'user-002']);
      expect(dto.dependencies).toHaveLength(1);
      expect(dto.dependencies![0].type).toBe('finish_to_start');
      expect(dto.tags).toContain('urgent');
    });

    it('应该创建有效的UpdateTaskDto', () => {
      // 📋 Arrange & Act
      const dto = new UpdateTaskDto();
      dto.taskId = 'task-update-001';
      dto.status = 'running';
      dto.completionPercentage = 75;
      dto.actualDuration = 6;
      dto.startDate = '2024-01-01T09:00:00.000Z';
      dto.endDate = '2024-01-01T15:00:00.000Z';

      // ✅ Assert
      expect(dto.taskId).toBe('task-update-001');
      expect(dto.status).toBe('running');
      expect(dto.completionPercentage).toBe(75);
      expect(dto.actualDuration).toBe(6);
      expect(dto.startDate).toBe('2024-01-01T09:00:00.000Z');
      expect(dto.endDate).toBe('2024-01-01T15:00:00.000Z');
    });
  });

  describe('里程碑相关DTO测试', () => {
    it('应该创建有效的CreateMilestoneDto', () => {
      // 📋 Arrange & Act
      const dto = new CreateMilestoneDto();
      dto.name = 'Project Milestone';
      dto.description = 'Important project milestone';
      dto.targetDate = new Date('2024-06-01');
      dto.criteria = ['All tasks completed', 'Quality review passed'];
      dto.dependencies = ['milestone-001', 'milestone-002'];
      dto.deliverables = ['Documentation', 'Test Results'];

      // ✅ Assert
      expect(dto.name).toBe('Project Milestone');
      expect(dto.description).toBe('Important project milestone');
      expect(dto.targetDate).toEqual(new Date('2024-06-01'));
      expect(dto.criteria).toEqual(['All tasks completed', 'Quality review passed']);
      expect(dto.dependencies).toEqual(['milestone-001', 'milestone-002']);
      expect(dto.deliverables).toEqual(['Documentation', 'Test Results']);
    });

    it('应该创建有效的UpdateMilestoneDto', () => {
      // 📋 Arrange & Act
      const dto = new UpdateMilestoneDto();
      dto.id = 'milestone-update-001';
      dto.status = 'completed';
      dto.actualDate = new Date('2024-05-30');

      // ✅ Assert
      expect(dto.id).toBe('milestone-update-001');
      expect(dto.status).toBe('completed');
      expect(dto.actualDate).toEqual(new Date('2024-05-30'));
    });
  });

  describe('资源和风险DTO测试', () => {
    it('应该创建有效的ResourceAllocationDto', () => {
      // 📋 Arrange & Act
      const dto = new ResourceAllocationDto();
      dto.resourceId = 'resource-001';
      dto.resourceName = 'Senior Developer';
      dto.type = 'human';
      dto.allocatedAmount = 0.8;
      dto.totalCapacity = 1.0;
      dto.unit = 'FTE';
      dto.allocationPeriod = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-03-31T23:59:59.999Z'
      };

      // ✅ Assert
      expect(dto.resourceId).toBe('resource-001');
      expect(dto.resourceName).toBe('Senior Developer');
      expect(dto.type).toBe('human');
      expect(dto.allocatedAmount).toBe(0.8);
      expect(dto.totalCapacity).toBe(1.0);
      expect(dto.unit).toBe('FTE');
      expect(dto.allocationPeriod?.startDate).toBe('2024-01-01T00:00:00.000Z');
    });

    it('应该创建有效的RiskItemDto', () => {
      // 📋 Arrange & Act
      const dto = new RiskItemDto();
      dto.name = 'Technical Risk';
      dto.description = 'Risk of technical implementation issues';
      dto.category = 'Technical';
      dto.level = 'high';
      dto.probability = 0.7;
      dto.impact = 0.8;
      dto.mitigationPlan = 'Conduct proof of concept';
      dto.owner = 'tech-lead-001';

      // ✅ Assert
      expect(dto.name).toBe('Technical Risk');
      expect(dto.description).toBe('Risk of technical implementation issues');
      expect(dto.category).toBe('Technical');
      expect(dto.level).toBe('high');
      expect(dto.probability).toBe(0.7);
      expect(dto.impact).toBe(0.8);
      expect(dto.mitigationPlan).toBe('Conduct proof of concept');
      expect(dto.owner).toBe('tech-lead-001');
    });
  });
});

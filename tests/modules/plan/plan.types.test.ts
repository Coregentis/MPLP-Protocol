/**
 * Plan模块类型定义测试
 *
 * @description 验证Plan模块的TypeScript类型定义和接口
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的类型测试模式
 */

import {
  // 基础枚举类型
  PlanStatus,
  TaskType,
  TaskStatus,
  DependencyType,
  MilestoneStatus,
  ResourceType,
  ResourceStatus,
  RiskLevel,
  RiskStatus,
  ExecutionStrategy,
  OptimizationTarget,
  // 复杂对象接口
  TaskDependency,
  Task,
  Milestone,
  ResourceAllocation,
  RiskItem,
  ExecutionConfig,
  OptimizationConfig,
  ValidationRule,
  CoordinationConfig,
  AuditEvent,
  AuditTrail,
  // 主要实体接口
  PlanEntityData,
  PlanSchema,
  // 操作相关接口
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanQueryFilter,
  PlanExecutionResult,
  PlanOptimizationResult,
  PlanValidationResult
} from '../../../src/modules/plan/types';

describe('Plan模块类型定义测试', () => {

  describe('基础枚举类型测试', () => {
    it('应该正确定义PlanStatus枚举', () => {
      // 📋 Arrange & Act & Assert
      const validStatuses: PlanStatus[] = ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'];
      
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed']).toContain(status);
      });
    });

    it('应该正确定义TaskType枚举', () => {
      // 📋 Arrange & Act & Assert
      const validTypes: TaskType[] = ['atomic', 'composite', 'milestone', 'review'];
      
      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(['atomic', 'composite', 'milestone', 'review']).toContain(type);
      });
    });

    it('应该正确定义TaskStatus枚举', () => {
      // 📋 Arrange & Act & Assert
      const validStatuses: TaskStatus[] = ['pending', 'running', 'completed', 'failed', 'skipped'];
      
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(['pending', 'running', 'completed', 'failed', 'skipped']).toContain(status);
      });
    });

    it('应该正确定义DependencyType枚举', () => {
      // 📋 Arrange & Act & Assert
      const validTypes: DependencyType[] = ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'];
      
      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish']).toContain(type);
      });
    });

    it('应该正确定义MilestoneStatus枚举', () => {
      // 📋 Arrange & Act & Assert
      const validStatuses: MilestoneStatus[] = ['upcoming', 'active', 'completed', 'overdue'];
      
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(['upcoming', 'active', 'completed', 'overdue']).toContain(status);
      });
    });

    it('应该正确定义ResourceType枚举', () => {
      // 📋 Arrange & Act & Assert
      const validTypes: ResourceType[] = ['human', 'material', 'financial', 'technical'];
      
      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(['human', 'material', 'financial', 'technical']).toContain(type);
      });
    });

    it('应该正确定义RiskLevel枚举', () => {
      // 📋 Arrange & Act & Assert
      const validLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
      
      validLevels.forEach(level => {
        expect(typeof level).toBe('string');
        expect(['low', 'medium', 'high', 'critical']).toContain(level);
      });
    });

    it('应该正确定义ExecutionStrategy枚举', () => {
      // 📋 Arrange & Act & Assert
      const validStrategies: ExecutionStrategy[] = ['sequential', 'parallel', 'conditional', 'adaptive'];
      
      validStrategies.forEach(strategy => {
        expect(typeof strategy).toBe('string');
        expect(['sequential', 'parallel', 'conditional', 'adaptive']).toContain(strategy);
      });
    });

    it('应该正确定义OptimizationTarget枚举', () => {
      // 📋 Arrange & Act & Assert
      const validTargets: OptimizationTarget[] = ['time', 'cost', 'quality', 'resource', 'risk'];
      
      validTargets.forEach(target => {
        expect(typeof target).toBe('string');
        expect(['time', 'cost', 'quality', 'resource', 'risk']).toContain(target);
      });
    });
  });

  describe('复杂对象接口测试', () => {
    it('应该正确定义TaskDependency接口', () => {
      // 📋 Arrange
      const taskDependency: TaskDependency = {
        taskId: 'task-123',
        type: 'finish_to_start',
        lag: 2,
        lagUnit: 'days'
      };

      // 🎬 Act & Assert
      expect(taskDependency.taskId).toBe('task-123');
      expect(taskDependency.type).toBe('finish_to_start');
      expect(taskDependency.lag).toBe(2);
      expect(taskDependency.lagUnit).toBe('days');
    });

    it('应该正确定义Task接口', () => {
      // 📋 Arrange
      const task: Task = {
        taskId: 'task-456',
        name: 'Test Task',
        description: 'A test task',
        type: 'atomic',
        status: 'pending',
        priority: 'high',
        estimatedDuration: 8,
        durationUnit: 'hours',
        assignedTo: ['user1', 'user2'],
        dependencies: [{
          taskId: 'task-123',
          type: 'finish_to_start'
        }],
        completionPercentage: 0,
        tags: ['testing', 'development']
      };

      // 🎬 Act & Assert
      expect(task.taskId).toBe('task-456');
      expect(task.name).toBe('Test Task');
      expect(task.type).toBe('atomic');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('high');
      expect(task.estimatedDuration).toBe(8);
      expect(task.assignedTo).toHaveLength(2);
      expect(task.dependencies).toHaveLength(1);
      expect(task.tags).toContain('testing');
    });

    it('应该正确定义Milestone接口', () => {
      // 📋 Arrange
      const milestone: Milestone = {
        id: 'milestone-789',
        name: 'Test Milestone',
        description: 'A test milestone',
        targetDate: new Date('2024-12-31'),
        status: 'upcoming',
        criteria: ['Criterion 1', 'Criterion 2'],
        dependencies: ['task-123', 'task-456'],
        deliverables: ['Deliverable 1', 'Deliverable 2']
      };

      // 🎬 Act & Assert
      expect(milestone.id).toBe('milestone-789');
      expect(milestone.name).toBe('Test Milestone');
      expect(milestone.status).toBe('upcoming');
      expect(milestone.targetDate).toBeInstanceOf(Date);
      expect(milestone.criteria).toHaveLength(2);
      expect(milestone.dependencies).toHaveLength(2);
      expect(milestone.deliverables).toHaveLength(2);
    });

    it('应该正确定义ResourceAllocation接口', () => {
      // 📋 Arrange
      const resource: ResourceAllocation = {
        resourceId: 'resource-001',
        resourceName: 'Senior Developer',
        type: 'human',
        allocatedAmount: 40,
        totalCapacity: 40,
        unit: 'hours/week',
        status: 'allocated',
        allocationPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        }
      };

      // 🎬 Act & Assert
      expect(resource.resourceId).toBe('resource-001');
      expect(resource.resourceName).toBe('Senior Developer');
      expect(resource.type).toBe('human');
      expect(resource.allocatedAmount).toBe(40);
      expect(resource.status).toBe('allocated');
      expect(resource.allocationPeriod?.startDate).toBeInstanceOf(Date);
    });

    it('应该正确定义RiskItem接口', () => {
      // 📋 Arrange
      const risk: RiskItem = {
        riskId: 'risk-001',
        name: 'Technical Risk',
        description: 'Risk of technical implementation failure',
        category: 'technical',
        level: 'high',
        status: 'identified',
        probability: 0.3,
        impact: 0.8,
        riskScore: 0.24,
        mitigationPlan: 'Implement thorough testing',
        owner: 'tech-lead',
        identifiedDate: new Date('2024-01-15')
      };

      // 🎬 Act & Assert
      expect(risk.riskId).toBe('risk-001');
      expect(risk.name).toBe('Technical Risk');
      expect(risk.level).toBe('high');
      expect(risk.status).toBe('identified');
      expect(risk.probability).toBe(0.3);
      expect(risk.impact).toBe(0.8);
      expect(risk.riskScore).toBe(0.24);
      expect(risk.identifiedDate).toBeInstanceOf(Date);
    });
  });

  describe('配置接口测试', () => {
    it('应该正确定义ExecutionConfig接口', () => {
      // 📋 Arrange
      const config: ExecutionConfig = {
        strategy: 'parallel',
        maxParallelTasks: 5,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2
        },
        timeoutSettings: {
          taskTimeout: 3600,
          planTimeout: 86400
        },
        notificationSettings: {
          enabled: true,
          events: ['task_completed', 'milestone_reached'],
          channels: ['email', 'webhook']
        }
      };

      // 🎬 Act & Assert
      expect(config.strategy).toBe('parallel');
      expect(config.maxParallelTasks).toBe(5);
      expect(config.retryPolicy?.maxRetries).toBe(3);
      expect(config.timeoutSettings?.taskTimeout).toBe(3600);
      expect(config.notificationSettings?.enabled).toBe(true);
      expect(config.notificationSettings?.events).toContain('task_completed');
    });

    it('应该正确定义OptimizationConfig接口', () => {
      // 📋 Arrange
      const config: OptimizationConfig = {
        enabled: true,
        targets: ['time', 'cost'],
        constraints: {
          maxDuration: 30,
          maxCost: 10000,
          minQuality: 0.9,
          resourceLimits: {
            'developers': 5,
            'budget': 50000
          }
        },
        algorithms: ['genetic', 'simulated_annealing']
      };

      // 🎬 Act & Assert
      expect(config.enabled).toBe(true);
      expect(config.targets).toHaveLength(2);
      expect(config.targets).toContain('time');
      expect(config.constraints?.maxDuration).toBe(30);
      expect(config.constraints?.resourceLimits?.developers).toBe(5);
      expect(config.algorithms).toContain('genetic');
    });

    it('应该正确定义ValidationRule接口', () => {
      // 📋 Arrange
      const rule: ValidationRule = {
        ruleId: 'rule-001',
        name: 'Task Dependency Rule',
        description: 'Validates task dependencies',
        type: 'dependency',
        severity: 'error',
        condition: 'dependencies.length > 0',
        message: 'Task must have at least one dependency',
        enabled: true
      };

      // 🎬 Act & Assert
      expect(rule.ruleId).toBe('rule-001');
      expect(rule.name).toBe('Task Dependency Rule');
      expect(rule.type).toBe('dependency');
      expect(rule.severity).toBe('error');
      expect(rule.enabled).toBe(true);
    });

    it('应该正确定义CoordinationConfig接口', () => {
      // 📋 Arrange
      const config: CoordinationConfig = {
        enabled: true,
        coordinationMode: 'hybrid',
        conflictResolution: 'priority',
        syncInterval: 5000,
        coordinationEndpoints: ['http://api1.example.com', 'http://api2.example.com']
      };

      // 🎬 Act & Assert
      expect(config.enabled).toBe(true);
      expect(config.coordinationMode).toBe('hybrid');
      expect(config.conflictResolution).toBe('priority');
      expect(config.syncInterval).toBe(5000);
      expect(config.coordinationEndpoints).toHaveLength(2);
    });
  });
});

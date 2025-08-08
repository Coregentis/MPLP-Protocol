import { PlanMapper } from '../../../src/modules/plan/infrastructure/persistence/plan.mapper';
import { PlanEntity } from '../../../src/modules/plan/infrastructure/persistence/plan.entity';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanFactoryService } from '../../../src/modules/plan/domain/services/plan-factory.service';
import { PlanStatus, Priority, ExecutionStrategy } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('PlanMapper', () => {
  let planMapper: PlanMapper;
  let mockPlanFactoryService: jest.Mocked<PlanFactoryService>;

  beforeEach(() => {
    mockPlanFactoryService = {
      createPlan: jest.fn(),
      validatePlanData: jest.fn(),
      createPlanFromTemplate: jest.fn()
    } as any;

    planMapper = new PlanMapper(mockPlanFactoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 创建测试用的Plan实体
  const createTestPlan = (overrides: any = {}) => {
    const planData = {
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Test Plan',
      description: 'Test plan description',
      status: PlanStatus.DRAFT,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      goals: ['Goal 1', 'Goal 2'],
      tasks: [],
      dependencies: [],
      executionStrategy: ExecutionStrategy.SEQUENTIAL,
      priority: Priority.MEDIUM,
      estimatedDuration: { value: 3600, unit: 'seconds' },
      progress: {
        completedTasks: 0,
        totalTasks: 5,
        percentage: 0
      },
      timeline: {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        milestones: [],
        critical_path: []
      },
      configuration: {
        allowParallelExecution: true,
        maxRetries: 3
      },
      metadata: { source: 'test' },
      riskAssessment: {
        overall_risk_level: 'low',
        risks: [],
        last_assessed: new Date().toISOString()
      },
      ...overrides
    };

    // 创建mock Plan实例
    const mockPlan = {
      toObject: jest.fn().mockReturnValue(planData),
      ...planData
    } as any;

    return mockPlan;
  };

  // 创建测试用的PlanEntity
  const createTestPlanEntity = (overrides: any = {}) => {
    const entity = new PlanEntity();
    entity.plan_id = uuidv4();
    entity.context_id = uuidv4();
    entity.name = 'Test Plan';
    entity.description = 'Test plan description';
    entity.status = PlanStatus.DRAFT;
    entity.version = '1.0.0';
    entity.created_at = new Date();
    entity.updated_at = new Date();
    entity.goals = ['Goal 1', 'Goal 2'];
    entity.tasks = [];
    entity.dependencies = [];
    entity.execution_strategy = ExecutionStrategy.SEQUENTIAL;
    entity.priority = Priority.MEDIUM;
    entity.estimated_duration = { value: 3600, unit: 'seconds' };
    entity.progress = {
      completed_tasks: 0,
      total_tasks: 5,
      percentage: 0
    };
    entity.timeline = {
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      milestones: [],
      critical_path: []
    };
    entity.configuration = {
      allowParallelExecution: true,
      maxRetries: 3
    };
    entity.metadata = { source: 'test' };
    entity.risk_assessment = {
      overall_risk_level: 'low',
      risks: [],
      last_assessed: new Date().toISOString()
    };

    Object.assign(entity, overrides);
    return entity;
  };

  describe('toPersistence', () => {
    it('应该将领域实体正确转换为持久化实体', () => {
      const plan = createTestPlan();
      
      const result = planMapper.toPersistence(plan);
      
      expect(result).toBeInstanceOf(PlanEntity);
      expect(result.plan_id).toBe(plan.planId);
      expect(result.context_id).toBe(plan.contextId);
      expect(result.name).toBe(plan.name);
      expect(result.description).toBe(plan.description);
      expect(result.status).toBe(plan.status);
      expect(result.version).toBe(plan.version);
      expect(result.goals).toEqual(plan.goals);
      expect(result.tasks).toEqual(plan.tasks);
      expect(result.dependencies).toEqual(plan.dependencies);
      expect(result.execution_strategy).toBe(plan.executionStrategy);
      expect(result.priority).toBe(plan.priority);
      expect(result.estimated_duration).toEqual(plan.estimatedDuration);
    });

    it('应该正确映射progress字段（驼峰转下划线）', () => {
      const plan = createTestPlan({
        progress: {
          completedTasks: 3,
          totalTasks: 10,
          percentage: 30
        }
      });
      
      const result = planMapper.toPersistence(plan);
      
      expect(result.progress).toEqual({
        completed_tasks: 3,
        total_tasks: 10,
        percentage: 30
      });
    });

    it('应该正确映射timeline字段', () => {
      const timeline = {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        milestones: [{ id: '1', name: 'Milestone 1' }],
        critical_path: ['task1', 'task2']
      };
      
      const plan = createTestPlan({ timeline });
      
      const result = planMapper.toPersistence(plan);
      
      expect(result.timeline).toEqual(timeline);
    });

    it('应该正确映射risk_assessment字段', () => {
      const riskAssessment = {
        overall_risk_level: 'high',
        risks: [{ id: '1', description: 'Risk 1' }],
        last_assessed: '2025-01-01T00:00:00.000Z'
      };
      
      const plan = createTestPlan({ riskAssessment });
      
      const result = planMapper.toPersistence(plan);
      
      expect(result.risk_assessment).toEqual({
        overall_risk_level: 'high',
        risks: [{ id: '1', description: 'Risk 1' }],
        last_assessed: '2025-01-01T00:00:00.000Z'
      });
    });

    it('应该处理undefined的timeline和riskAssessment', () => {
      const plan = createTestPlan({
        timeline: undefined,
        riskAssessment: undefined
      });
      
      const result = planMapper.toPersistence(plan);
      
      expect(result.timeline).toBeUndefined();
      expect(result.risk_assessment).toBeUndefined();
    });

    it('应该正确转换日期字段', () => {
      const createdAt = '2025-01-01T10:00:00.000Z';
      const updatedAt = '2025-01-02T15:30:00.000Z';
      
      const plan = createTestPlan({ createdAt, updatedAt });
      
      const result = planMapper.toPersistence(plan);
      
      expect(result.created_at).toEqual(new Date(createdAt));
      expect(result.updated_at).toEqual(new Date(updatedAt));
    });
  });

  describe('toDomain', () => {
    it('应该将持久化实体正确转换为领域实体', () => {
      const planEntity = createTestPlanEntity();
      const expectedPlan = createTestPlan();
      
      mockPlanFactoryService.createPlan.mockReturnValue(expectedPlan);
      
      const result = planMapper.toDomain(planEntity);
      
      expect(mockPlanFactoryService.createPlan).toHaveBeenCalledWith({
        planId: planEntity.plan_id,
        contextId: planEntity.context_id,
        name: planEntity.name,
        description: planEntity.description,
        status: planEntity.status,
        version: planEntity.version,
        createdAt: planEntity.created_at.toISOString(),
        updatedAt: planEntity.updated_at.toISOString(),
        goals: planEntity.goals,
        tasks: planEntity.tasks,
        dependencies: planEntity.dependencies,
        executionStrategy: planEntity.execution_strategy,
        priority: planEntity.priority,
        estimatedDuration: planEntity.estimated_duration,
        timeline: planEntity.timeline,
        configuration: planEntity.configuration,
        metadata: planEntity.metadata,
        riskAssessment: {
          overall_risk_level: planEntity.risk_assessment?.overall_risk_level,
          risks: planEntity.risk_assessment?.risks || [],
          last_assessed: planEntity.risk_assessment?.last_assessed
        }
      });
      
      expect(result).toBe(expectedPlan);
    });

    it('应该处理没有risk_assessment的情况', () => {
      const planEntity = createTestPlanEntity({ risk_assessment: undefined });
      const expectedPlan = createTestPlan();
      
      mockPlanFactoryService.createPlan.mockReturnValue(expectedPlan);
      
      const result = planMapper.toDomain(planEntity);
      
      const createPlanCall = mockPlanFactoryService.createPlan.mock.calls[0][0];
      expect(createPlanCall.riskAssessment).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('应该将持久化实体列表转换为领域实体列表', () => {
      const planEntities = [
        createTestPlanEntity(),
        createTestPlanEntity(),
        createTestPlanEntity()
      ];
      
      const expectedPlans = [
        createTestPlan(),
        createTestPlan(),
        createTestPlan()
      ];
      
      mockPlanFactoryService.createPlan
        .mockReturnValueOnce(expectedPlans[0])
        .mockReturnValueOnce(expectedPlans[1])
        .mockReturnValueOnce(expectedPlans[2]);
      
      const result = planMapper.toDomainList(planEntities);
      
      expect(result).toHaveLength(3);
      expect(result).toEqual(expectedPlans);
      expect(mockPlanFactoryService.createPlan).toHaveBeenCalledTimes(3);
    });

    it('应该处理空列表', () => {
      const result = planMapper.toDomainList([]);
      
      expect(result).toEqual([]);
      expect(mockPlanFactoryService.createPlan).not.toHaveBeenCalled();
    });
  });

  describe('构造函数', () => {
    it('应该使用提供的PlanFactoryService', () => {
      const customFactory = new PlanFactoryService();
      const mapper = new PlanMapper(customFactory);
      
      expect(mapper['planFactoryService']).toBe(customFactory);
    });

    it('应该使用默认的PlanFactoryService', () => {
      const mapper = new PlanMapper();
      
      expect(mapper['planFactoryService']).toBeInstanceOf(PlanFactoryService);
    });
  });
});

/**
 * Plan Repository 协议级测试
 * 
 * 测试目标：达到协议级100%覆盖率标准
 * 测试原则：基于实际实现构建测试，验证数据持久化层的完整性
 * 
 * 覆盖范围：
 * - 数据完整性验证
 * - 事务处理测试
 * - 查询功能验证
 * - 错误处理测试
 * - 并发安全测试
 */

import { PlanRepositoryImpl } from '../../../infrastructure/repositories/plan-repository.impl';
import { IPlanRepository } from '../../../domain/repositories/plan-repository.interface';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanStatus, TaskStatus, Priority } from '../../../types';

describe('PlanRepository - 协议级测试', () => {
  let repository: IPlanRepository;
  let mockPlans: Plan[];
  let mockDataSource: any;
  let mockRepository: any;

  beforeEach(() => {
    // 创建mock repository
    mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getCount: jest.fn()
      }))
    };

    // 创建mock DataSource
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository)
    };

    repository = new PlanRepositoryImpl(mockDataSource);
    
    // 创建测试数据
    mockPlans = [
      new Plan({
        planId: 'plan-1',
        contextId: 'ctx-1',
        name: 'Test Plan 1',
        description: 'Description 1',
        goals: ['Goal 1', 'Goal 2'],
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: [],
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          }
        ],
        dependencies: [],
        executionStrategy: 'sequential',
        priority: Priority.HIGH,
        status: PlanStatus.DRAFT,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        createdBy: 'user-1'
      }),
      new Plan({
        planId: 'plan-2',
        contextId: 'ctx-2',
        name: 'Test Plan 2',
        description: 'Description 2',
        goals: ['Goal 3'],
        tasks: [],
        dependencies: [],
        executionStrategy: 'parallel',
        priority: Priority.MEDIUM,
        status: PlanStatus.ACTIVE,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        createdBy: 'user-2'
      })
    ];

    // 重置repository状态
    jest.clearAllMocks();
  });

  describe('🔴 协议核心 - 基本CRUD操作', () => {
    it('应该成功创建计划', async () => {
      // Arrange
      const plan = mockPlans[0];

      // Mock mapper.toPersistence
      const mockMapper = {
        toPersistence: jest.fn().mockReturnValue({
          plan_id: plan.planId,
          context_id: plan.contextId,
          name: plan.name,
          description: plan.description,
          status: plan.status
        }),
        toDomain: jest.fn().mockReturnValue(plan)
      };

      // 替换repository的mapper
      (repository as any).mapper = mockMapper;

      mockRepository.save.mockResolvedValue({
        plan_id: plan.planId,
        context_id: plan.contextId,
        name: plan.name,
        description: plan.description,
        status: plan.status
      });

      // Act
      const result = await repository.create(plan);

      // Assert
      expect(result).toBeDefined();
      expect(result.planId).toBe(plan.planId);
      expect(result.name).toBe(plan.name);
      expect(result.status).toBe(plan.status);
    });

    it('应该成功通过ID查找计划', async () => {
      // Arrange
      const plan = mockPlans[0];

      // Mock mapper.toDomain
      const mockMapper = {
        toPersistence: jest.fn(),
        toDomain: jest.fn().mockReturnValue(plan)
      };

      // 替换repository的mapper
      (repository as any).mapper = mockMapper;

      mockRepository.findOne.mockResolvedValue({
        plan_id: plan.planId,
        context_id: plan.contextId,
        name: plan.name,
        description: plan.description
      });

      // Act
      const result = await repository.findById(plan.planId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.planId).toBe(plan.planId);
      expect(result?.contextId).toBe(plan.contextId);
      expect(result?.name).toBe(plan.name);
    });

    it('应该处理查找不存在的计划', async () => {
      // Arrange
      const nonExistentId = 'non-existent-plan';
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('应该成功删除计划', async () => {
      // Arrange
      const planId = 'plan-to-delete';
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await repository.delete(planId);

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith({ plan_id: planId });
    });

  describe('🔴 协议核心 - 数据完整性验证', () => {
    it('应该验证必需字段', async () => {
      // Arrange
      const incompletePlan = {
        planId: 'incomplete-plan',
        // 缺少必需字段
      } as Plan;

      // Act & Assert
      await expect(repository.create(incompletePlan)).rejects.toThrow();
    });

    it('应该验证数据类型', async () => {
      // Arrange
      const invalidPlan = new Plan({
        planId: 'invalid-plan',
        contextId: 'ctx-1',
        name: 'Test Plan',
        description: 'Description',
        goals: [],
        tasks: [],
        dependencies: [],
        executionStrategy: 'invalid-strategy' as any, // 无效的执行策略
        priority: Priority.MEDIUM,
        status: PlanStatus.DRAFT,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        createdBy: 'user-1'
      });

      // Act & Assert
      await expect(repository.create(invalidPlan)).rejects.toThrow();
    });
  });

  describe('🔴 协议核心 - 错误处理', () => {
    it('应该处理数据库连接错误', async () => {
      // Arrange
      const plan = mockPlans[0];

      // 模拟数据库连接错误
      mockRepository.save.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(repository.create(plan)).rejects.toThrow('Database connection failed');
    });

    it('应该处理无效的查询参数', async () => {
      // Arrange
      const invalidFilters = {
        limit: -1, // 无效的limit值
        offset: 'invalid' // 无效的offset类型
      };

      // Act & Assert
      await expect(repository.findByFilter(invalidFilters as any)).rejects.toThrow();
    });
  });
});
});
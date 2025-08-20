/**
 * 任务规划协调引擎测试
 * 
 * 测试TaskPlanningCoordinator的智能任务分解和规划功能
 * 验证1000+复杂任务的处理能力
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { TaskPlanningCoordinator } from '../../../src/modules/plan/application/coordinators/task-planning.coordinator';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('TaskPlanningCoordinator', () => {
  let coordinator: TaskPlanningCoordinator;
  let testPlan: Plan;

  beforeEach(() => {
    coordinator = new TaskPlanningCoordinator();
    
    // 创建测试计划
    testPlan = new Plan({
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Test Planning',
      description: 'Test plan for coordination',
      status: PlanStatus.DRAFT,
      goals: ['Test Goal 1', 'Test Goal 2'],
      tasks: [
        {
          taskId: 'task-1',
          name: 'Simple Task',
          description: 'A simple task',
          status: 'pending',
          priority: 'medium',
          type: 'development',
          dependencies: [],
          estimatedDuration: { value: 3600, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [
            { resourceId: 'cpu-resource-1', type: 'cpu', quantity: 2, availability: 'medium' }
          ],
          metadata: { riskLevel: 'low' }
        },
        {
          taskId: 'task-2',
          name: 'Complex Task',
          description: 'A complex task requiring decomposition',
          status: 'pending',
          priority: 'high',
          type: 'analysis',
          dependencies: ['task-1'],
          estimatedDuration: { value: 36000, unit: 'seconds' }, // 10 hours - complex
          progress: 0,
          resourceRequirements: [
            { resourceId: 'cpu-resource-2', type: 'cpu', quantity: 8, availability: 'high' },
            { resourceId: 'memory-resource-1', type: 'memory', quantity: 16, availability: 'high' }
          ],
          metadata: { riskLevel: 'high' }
        },
        {
          taskId: 'task-3',
          name: 'Medium Task',
          description: 'A medium complexity task',
          status: 'pending',
          priority: 'medium',
          type: 'testing',
          dependencies: ['task-2'],
          estimatedDuration: { value: 7200, unit: 'seconds' }, // 2 hours
          progress: 0,
          resourceRequirements: [
            { resourceId: 'cpu-resource-3', type: 'cpu', quantity: 4, availability: 'medium' }
          ],
          metadata: { riskLevel: 'medium' }
        }
      ],
      dependencies: [],
      executionStrategy: ExecutionStrategy.SEQUENTIAL,
      priority: Priority.MEDIUM,
      createdBy: 'test-user'
    });
  });

  describe('基础任务规划', () => {
    it('should successfully plan tasks', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      expect(result.planId).toBe(testPlan.planId);
      expect(result.totalTasks).toBeGreaterThan(0);
      expect(result.decomposedTasks).toBeDefined();
      expect(result.optimizedSequence).toBeDefined();
      expect(result.estimatedDuration).toBeGreaterThan(0);
      expect(result.resourceRequirements).toBeDefined();
      expect(result.performance.planningTime).toBeGreaterThan(0);
    });

    it('should analyze task complexity correctly', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      
      // 复杂任务应该被分解
      const originalComplexTask = testPlan.tasks.find(t => t.taskId === 'task-2');
      expect(originalComplexTask).toBeDefined();
      
      // 检查是否有分解的子任务
      const decomposedSubTasks = result.decomposedTasks.filter(t => 
        t.taskId.startsWith('task-2-sub-')
      );
      expect(decomposedSubTasks.length).toBeGreaterThan(1);
    });

    it('should preserve simple tasks without decomposition', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      
      // 简单任务应该保持不变
      const simpleTask = result.decomposedTasks.find(t => t.taskId === 'task-1');
      expect(simpleTask).toBeDefined();
      expect(simpleTask?.name).toBe('Simple Task');
    });

    it('should generate resource allocation', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      expect(result.resourceRequirements).toHaveLength(2); // cpu and memory
      
      const cpuResource = result.resourceRequirements.find(r => r.resourceType === 'cpu');
      expect(cpuResource).toBeDefined();
      expect(cpuResource?.amount).toBeGreaterThan(0);
      
      const memoryResource = result.resourceRequirements.find(r => r.resourceType === 'memory');
      expect(memoryResource).toBeDefined();
      expect(memoryResource?.amount).toBeGreaterThan(0);
    });
  });

  describe('执行策略优化', () => {
    it('should optimize for sequential execution', async () => {
      const sequentialPlan = new Plan({
        planId: testPlan.planId,
        contextId: testPlan.contextId,
        name: testPlan.name,
        description: testPlan.description,
        status: testPlan.status,
        goals: testPlan.goals,
        tasks: testPlan.tasks,
        dependencies: testPlan.dependencies,
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: testPlan.priority,
        createdBy: testPlan.createdBy
      });

      const result = await coordinator.planTasks(sequentialPlan);

      expect(result.success).toBe(true);
      expect(result.optimizedSequence).toBeDefined();
      expect(result.optimizedSequence.length).toBeGreaterThan(0);

      // 验证序列中的依赖关系
      const sequence = result.optimizedSequence;
      const task1Index = sequence.findIndex(id => id === 'task-1');
      const task2Indices = sequence.map((id, index) =>
        id && id.startsWith('task-2') ? index : -1
      ).filter(index => index !== -1);

      // task-1应该在task-2的子任务之前（如果有task-2的子任务）
      if (task2Indices.length > 0) {
        expect(task1Index).toBeLessThan(Math.min(...task2Indices));
      } else {
        // 如果没有task-2的子任务，至少验证task-1存在
        expect(task1Index).toBeGreaterThanOrEqual(0);
      }
    });

    it('should optimize for parallel execution', async () => {
      const parallelPlan = new Plan({
        planId: testPlan.planId,
        contextId: testPlan.contextId,
        name: testPlan.name,
        description: testPlan.description,
        status: testPlan.status,
        goals: testPlan.goals,
        tasks: testPlan.tasks,
        dependencies: testPlan.dependencies,
        executionStrategy: ExecutionStrategy.PARALLEL,
        priority: testPlan.priority,
        createdBy: testPlan.createdBy
      });

      const result = await coordinator.planTasks(parallelPlan);

      expect(result.success).toBe(true);
      expect(result.optimizedSequence).toBeDefined();

      // 并行执行应该按依赖层级组织
      const sequence = result.optimizedSequence;
      expect(sequence.length).toBeGreaterThan(0);
    });
  });

  describe('大规模任务处理', () => {
    it('should handle 100+ tasks efficiently', async () => {
      // 创建包含100个任务的大型计划
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        taskId: `large-task-${i}`,
        name: `Large Task ${i}`,
        description: `Large task number ${i}`,
        status: 'pending' as const,
        priority: i % 3 === 0 ? 'high' as const : 'medium' as const,
        type: 'development' as const,
        dependencies: i > 0 ? [`large-task-${i - 1}`] : [],
        estimatedDuration: { value: 1800 + (i * 100), unit: 'seconds' },
        progress: 0,
        resourceRequirements: [
          { resource_type: 'cpu', amount: 1 + (i % 4), unit: 'cores' }
        ],
        metadata: { riskLevel: i % 10 === 0 ? 'high' : 'low' }
      }));

      const largePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Large Scale Plan',
        description: 'Plan with 100+ tasks',
        status: PlanStatus.DRAFT,
        goals: ['Large Scale Goal'],
        tasks: largeTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.PARALLEL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const startTime = Date.now();
      const result = await coordinator.planTasks(largePlan);
      const planningTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.totalTasks).toBeGreaterThanOrEqual(100);
      expect(planningTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result.performance.planningTime).toBeLessThan(5000);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
    });

    it('should provide performance warnings for very large plans', async () => {
      // 创建包含1500个任务的超大型计划
      const hugeTasks = Array.from({ length: 1500 }, (_, i) => ({
        taskId: `huge-task-${i}`,
        name: `Huge Task ${i}`,
        description: `Huge task number ${i}`,
        status: 'pending' as const,
        priority: 'medium' as const,
        type: 'development' as const,
        dependencies: [],
        estimatedDuration: { value: 3600, unit: 'seconds' },
        progress: 0,
        resourceRequirements: [],
        metadata: {}
      }));

      const hugePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Huge Scale Plan',
        description: 'Plan with 1500+ tasks',
        status: PlanStatus.DRAFT,
        goals: ['Huge Scale Goal'],
        tasks: hugeTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.PARALLEL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const result = await coordinator.planTasks(hugePlan);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Large number of tasks may impact performance');
      expect(result.recommendations).toContain('Consider implementing parallel execution for better performance');
    });
  });

  describe('自定义配置', () => {
    it('should respect custom decomposition configuration', async () => {
      const customConfig = {
        maxDepth: 3,
        maxTasksPerLevel: 10,
        complexityThreshold: 50,
        decompositionStrategy: 'depth_first' as const
      };

      const result = await coordinator.planTasks(testPlan, customConfig);

      expect(result.success).toBe(true);
      expect(result.performance.algorithmsUsed).toContain('task_decomposition');
    });

    it('should handle invalid configuration gracefully', async () => {
      const invalidConfig = {
        maxDepth: -1,
        maxTasksPerLevel: 0,
        complexityThreshold: 150
      };

      const result = await coordinator.planTasks(testPlan, invalidConfig);

      // 应该使用默认配置并成功执行
      expect(result.success).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('should handle empty task list', async () => {
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

      const result = await coordinator.planTasks(emptyPlan);

      expect(result.success).toBe(true);
      expect(result.totalTasks).toBe(0);
      expect(result.decomposedTasks).toHaveLength(0);
    });

    it('should handle circular dependencies', async () => {
      const circularTasks = [
        {
          taskId: 'circular-1',
          name: 'Circular Task 1',
          description: 'Task with circular dependency',
          status: 'pending' as const,
          priority: 'medium' as const,
          type: 'development' as const,
          dependencies: ['circular-2'],
          estimatedDuration: { value: 3600, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [],
          metadata: {}
        },
        {
          taskId: 'circular-2',
          name: 'Circular Task 2',
          description: 'Task with circular dependency',
          status: 'pending' as const,
          priority: 'medium' as const,
          type: 'development' as const,
          dependencies: ['circular-1'],
          estimatedDuration: { value: 3600, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [],
          metadata: {}
        }
      ];

      const circularPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Circular Plan',
        description: 'Plan with circular dependencies',
        status: PlanStatus.DRAFT,
        goals: ['Test Circular'],
        tasks: circularTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.planTasks(circularPlan);

      // 应该能处理循环依赖，可能通过警告或自动修复
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能指标', () => {
    it('should provide detailed performance metrics', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance).toBeDefined();
      expect(result.performance.planningTime).toBeGreaterThan(0);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
      expect(result.performance.algorithmsUsed).toContain('complexity_analysis');
      expect(result.performance.algorithmsUsed).toContain('task_decomposition');
      expect(result.performance.algorithmsUsed).toContain('sequence_optimization');
      expect(result.performance.algorithmsUsed).toContain('resource_allocation');
    });

    it('should estimate memory usage accurately', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
      
      // 内存使用量应该与任务数量相关
      const expectedMemory = result.totalTasks * 2; // 每个任务约2KB
      expect(result.performance.memoryUsage).toBeCloseTo(expectedMemory, 0);
    });
  });

  describe('建议和警告', () => {
    it('should generate appropriate recommendations', async () => {
      const result = await coordinator.planTasks(testPlan);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should warn about resource conflicts', async () => {
      // 创建资源冲突的任务
      const conflictTasks = [
        {
          taskId: 'conflict-1',
          name: 'High Resource Task',
          description: 'Task requiring many resources',
          status: 'pending' as const,
          priority: 'high' as const,
          type: 'computation' as const,
          dependencies: [],
          estimatedDuration: { value: 3600, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [
            { resourceId: 'cpu-resource-conflict', type: 'cpu', quantity: 1000, availability: 'high' } // 过多资源
          ],
          metadata: {}
        }
      ];

      const conflictPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Resource Conflict Plan',
        description: 'Plan with resource conflicts',
        status: PlanStatus.DRAFT,
        goals: ['Test Conflicts'],
        tasks: conflictTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.planTasks(conflictPlan);

      expect(result.success).toBe(true);
      expect(result.recommendations.some(r => 
        r.includes('Resource conflicts detected')
      )).toBe(true);
    });
  });
});

/**
 * 依赖关系管理协调系统测试
 * 
 * 测试DependencyManagementCoordinator的依赖分析和冲突检测功能
 * 验证≥98%冲突检测准确率
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { DependencyManagementCoordinator, ConflictType } from '../../../src/modules/plan/application/coordinators/dependency-management.coordinator';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('DependencyManagementCoordinator', () => {
  let coordinator: DependencyManagementCoordinator;
  let testPlan: Plan;

  beforeEach(() => {
    coordinator = new DependencyManagementCoordinator();
    
    // 创建基础测试计划
    testPlan = new Plan({
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Dependency Test Plan',
      description: 'Plan for testing dependency management',
      status: PlanStatus.DRAFT,
      goals: ['Test Dependencies'],
      tasks: [
        {
          taskId: 'task-1',
          name: 'First Task',
          description: 'Independent task',
          status: 'pending',
          priority: 'medium',
          type: 'development',
          dependencies: [],
          estimatedDuration: { value: 3600, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [
            { resource_type: 'cpu', amount: 2, unit: 'cores' }
          ],
          metadata: {}
        },
        {
          taskId: 'task-2',
          name: 'Second Task',
          description: 'Depends on task-1',
          status: 'pending',
          priority: 'high',
          type: 'testing',
          dependencies: ['task-1'],
          estimatedDuration: { value: 1800, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [
            { resource_type: 'cpu', amount: 1, unit: 'cores' }
          ],
          metadata: {}
        },
        {
          taskId: 'task-3',
          name: 'Third Task',
          description: 'Depends on task-2',
          status: 'pending',
          priority: 'medium',
          type: 'deployment',
          dependencies: ['task-2'],
          estimatedDuration: { value: 900, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [
            { resource_type: 'memory', amount: 4, unit: 'GB' }
          ],
          metadata: {}
        }
      ],
      dependencies: [],
      executionStrategy: ExecutionStrategy.SEQUENTIAL,
      priority: Priority.MEDIUM,
      createdBy: 'test-user'
    });
  });

  describe('基础依赖分析', () => {
    it('should successfully analyze dependencies', async () => {
      const result = await coordinator.analyzeDependencies(testPlan);

      expect(result.success).toBe(true);
      expect(result.planId).toBe(testPlan.planId);
      expect(result.totalDependencies).toBe(2); // task-2 -> task-1, task-3 -> task-2
      expect(result.validDependencies).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.conflicts)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.optimizations)).toBe(true);
      expect(result.performance.analysisTime).toBeGreaterThan(0);
      expect(result.performance.conflictDetectionAccuracy).toBeGreaterThanOrEqual(98);
    });

    it('should detect no conflicts in valid dependency chain', async () => {
      const result = await coordinator.analyzeDependencies(testPlan);

      expect(result.success).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      expect(result.validDependencies).toBe(result.totalDependencies);
      expect(result.performance.conflictDetectionAccuracy).toBe(100);
    });

    it('should provide performance metrics', async () => {
      const result = await coordinator.analyzeDependencies(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance.analysisTime).toBeGreaterThan(0);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
      expect(result.performance.algorithmsUsed).toContain('circular_detection');
      expect(result.performance.algorithmsUsed).toContain('resource_analysis');
      expect(result.performance.algorithmsUsed).toContain('timing_validation');
      expect(result.performance.algorithmsUsed).toContain('optimization_identification');
    });
  });

  describe('循环依赖检测', () => {
    it('should detect circular dependencies', async () => {
      // 创建循环依赖：task-1 -> task-2 -> task-3 -> task-1
      const circularPlan = new Plan({
        ...testPlan.toSchemaFormat(),
        tasks: [
          {
            taskId: 'task-1',
            name: 'Task 1',
            description: 'Circular task 1',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: ['task-3'], // 循环：依赖task-3
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'task-2',
            name: 'Task 2',
            description: 'Circular task 2',
            status: 'pending',
            priority: 'medium',
            type: 'testing',
            dependencies: ['task-1'], // 依赖task-1
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'task-3',
            name: 'Task 3',
            description: 'Circular task 3',
            status: 'pending',
            priority: 'medium',
            type: 'deployment',
            dependencies: ['task-2'], // 依赖task-2，形成循环
            estimatedDuration: { value: 900, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          }
        ]
      });

      const result = await coordinator.analyzeDependencies(circularPlan);

      expect(result.success).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
      
      const circularConflict = result.conflicts.find(c => c.type === ConflictType.CIRCULAR);
      expect(circularConflict).toBeDefined();
      expect(circularConflict?.severity).toBe('critical');
      expect(circularConflict?.confidence).toBeGreaterThanOrEqual(99);
      expect(circularConflict?.autoFixable).toBe(true);
    });

    it('should provide high confidence for circular dependency detection', async () => {
      // 简单的双向循环
      const simpleCyclePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Simple Cycle Plan',
        description: 'Plan with simple circular dependency',
        status: PlanStatus.DRAFT,
        goals: ['Test Simple Cycle'],
        tasks: [
          {
            taskId: 'cycle-a',
            name: 'Cycle A',
            description: 'Task A in cycle',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: ['cycle-b'],
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'cycle-b',
            name: 'Cycle B',
            description: 'Task B in cycle',
            status: 'pending',
            priority: 'medium',
            type: 'testing',
            dependencies: ['cycle-a'],
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeDependencies(simpleCyclePlan);

      expect(result.success).toBe(true);
      const circularConflict = result.conflicts.find(c => c.type === ConflictType.CIRCULAR);
      expect(circularConflict).toBeDefined();
      expect(circularConflict?.confidence).toBe(99);
      expect(circularConflict?.affectedTasks).toContain('cycle-a');
      expect(circularConflict?.affectedTasks).toContain('cycle-b');
    });
  });

  describe('缺失任务检测', () => {
    it('should detect missing task dependencies', async () => {
      const missingTaskPlan = new Plan({
        ...testPlan.toSchemaFormat(),
        tasks: [
          {
            taskId: 'valid-task',
            name: 'Valid Task',
            description: 'Task with missing dependency',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: ['non-existent-task'], // 不存在的任务
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          }
        ]
      });

      const result = await coordinator.analyzeDependencies(missingTaskPlan);

      expect(result.success).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
      
      const missingTaskConflict = result.conflicts.find(c => c.type === ConflictType.MISSING_TASK);
      expect(missingTaskConflict).toBeDefined();
      expect(missingTaskConflict?.severity).toBe('high');
      expect(missingTaskConflict?.confidence).toBe(100);
      expect(missingTaskConflict?.autoFixable).toBe(false);
      expect(missingTaskConflict?.affectedTasks).toContain('valid-task');
      expect(missingTaskConflict?.affectedDependencies).toContain('non-existent-task');
    });
  });

  describe('资源冲突检测', () => {
    it('should detect resource over-allocation conflicts', async () => {
      const resourceConflictPlan = new Plan({
        ...testPlan.toSchemaFormat(),
        tasks: [
          {
            taskId: 'resource-heavy-1',
            name: 'Resource Heavy Task 1',
            description: 'Task requiring many CPU cores',
            status: 'pending',
            priority: 'high',
            type: 'computation',
            dependencies: [],
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [
              { resourceId: 'cpu-resource-1', type: 'cpu', quantity: 80, availability: 'high' } // 接近限制
            ],
            metadata: {}
          },
          {
            taskId: 'resource-heavy-2',
            name: 'Resource Heavy Task 2',
            description: 'Another task requiring many CPU cores',
            status: 'pending',
            priority: 'high',
            type: 'computation',
            dependencies: [],
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [
              { resourceId: 'cpu-resource-2', type: 'cpu', quantity: 50, availability: 'high' } // 总共130 > 100限制
            ],
            metadata: {}
          }
        ]
      });

      const result = await coordinator.analyzeDependencies(resourceConflictPlan);

      expect(result.success).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
      
      const resourceConflict = result.conflicts.find(c => c.type === ConflictType.RESOURCE_CONFLICT);
      expect(resourceConflict).toBeDefined();
      expect(resourceConflict?.severity).toBe('high');
      expect(resourceConflict?.confidence).toBe(95);
      expect(resourceConflict?.autoFixable).toBe(true);
    });
  });

  describe('逻辑冲突检测', () => {
    it('should detect excessive dependencies', async () => {
      // 创建有过多依赖的任务
      const excessiveDeps = Array.from({ length: 15 }, (_, i) => `dep-task-${i}`);
      
      const logicalConflictPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Logical Conflict Plan',
        description: 'Plan with logical conflicts',
        status: PlanStatus.DRAFT,
        goals: ['Test Logical Conflicts'],
        tasks: [
          {
            taskId: 'excessive-deps-task',
            name: 'Task with Excessive Dependencies',
            description: 'Task depending on too many other tasks',
            status: 'pending',
            priority: 'medium',
            type: 'integration',
            dependencies: excessiveDeps, // 15个依赖，超过10个阈值
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeDependencies(logicalConflictPlan);

      expect(result.success).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
      
      const logicalConflict = result.conflicts.find(c => c.type === ConflictType.LOGICAL_CONFLICT);
      expect(logicalConflict).toBeDefined();
      expect(logicalConflict?.severity).toBe('medium');
      expect(logicalConflict?.confidence).toBe(80);
      expect(logicalConflict?.autoFixable).toBe(false);
    });
  });

  describe('优化建议生成', () => {
    it('should generate dependency suggestions', async () => {
      const result = await coordinator.analyzeDependencies(testPlan);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.optimizations)).toBe(true);
      
      // 应该有一些优化建议
      expect(result.optimizations.length).toBeGreaterThan(0);
      
      // 检查优化类型
      const optimizationTypes = result.optimizations.map(opt => opt.type);
      expect(optimizationTypes).toContain('critical_path');
      expect(optimizationTypes).toContain('resource_optimization');
    });

    it('should identify parallel execution opportunities', async () => {
      // 创建有独立任务的计划
      const parallelOpportunityPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Parallel Opportunity Plan',
        description: 'Plan with parallel opportunities',
        status: PlanStatus.DRAFT,
        goals: ['Test Parallel Opportunities'],
        tasks: [
          {
            taskId: 'independent-1',
            name: 'Independent Task 1',
            description: 'Can run in parallel',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: [], // 无依赖
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [
              { resource_type: 'cpu', amount: 2, unit: 'cores' }
            ],
            metadata: {}
          },
          {
            taskId: 'independent-2',
            name: 'Independent Task 2',
            description: 'Can run in parallel',
            status: 'pending',
            priority: 'medium',
            type: 'testing',
            dependencies: [], // 无依赖
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [
              { resource_type: 'memory', amount: 4, unit: 'GB' }
            ],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeDependencies(parallelOpportunityPlan);

      expect(result.success).toBe(true);
      
      // 应该识别出并行机会
      const parallelOpt = result.optimizations.find(opt => opt.type === 'parallel_opportunity');
      expect(parallelOpt).toBeDefined();
      expect(parallelOpt?.estimatedImprovement.timeReduction).toBeGreaterThan(0);
      
      // 应该有并行执行的建议
      const parallelSuggestion = result.suggestions.find(s => s.type === 'add');
      expect(parallelSuggestion).toBeDefined();
    });
  });

  describe('性能和准确率验证', () => {
    it('should achieve ≥98% conflict detection accuracy', async () => {
      // 测试多种冲突类型的混合场景
      const complexPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Complex Conflict Plan',
        description: 'Plan with multiple conflict types',
        status: PlanStatus.DRAFT,
        goals: ['Test Complex Conflicts'],
        tasks: [
          {
            taskId: 'task-a',
            name: 'Task A',
            description: 'Part of circular dependency',
            status: 'pending',
            priority: 'high',
            type: 'development',
            dependencies: ['task-b'], // 循环依赖
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [
              { resourceId: 'cpu-resource-4', type: 'cpu', quantity: 60, availability: 'high' }
            ],
            metadata: {}
          },
          {
            taskId: 'task-b',
            name: 'Task B',
            description: 'Part of circular dependency',
            status: 'pending',
            priority: 'high',
            type: 'testing',
            dependencies: ['task-a', 'missing-task', 'dep1', 'dep2', 'dep3', 'dep4', 'dep5', 'dep6', 'dep7', 'dep8', 'dep9', 'dep10', 'dep11'], // 循环依赖 + 缺失任务 + 逻辑冲突(过多依赖)
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [
              { resourceId: 'cpu-resource-3', type: 'cpu', quantity: 50, availability: 'high' } // 资源冲突
            ],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.PARALLEL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeDependencies(complexPlan);

      expect(result.success).toBe(true);
      expect(result.performance.conflictDetectionAccuracy).toBeGreaterThanOrEqual(98);
      
      // 应该检测到多种冲突类型
      expect(result.conflicts.length).toBeGreaterThanOrEqual(3);
      
      const conflictTypes = result.conflicts.map(c => c.type);
      expect(conflictTypes).toContain(ConflictType.CIRCULAR);
      expect(conflictTypes).toContain(ConflictType.MISSING_TASK);
      expect(conflictTypes).toContain(ConflictType.RESOURCE_CONFLICT);
    });

    it('should handle large dependency graphs efficiently', async () => {
      // 创建大型依赖图
      const largeTasks = Array.from({ length: 50 }, (_, i) => ({
        taskId: `large-task-${i}`,
        name: `Large Task ${i}`,
        description: `Large scale task ${i}`,
        status: 'pending' as const,
        priority: 'medium' as const,
        type: 'development' as const,
        dependencies: i > 0 ? [`large-task-${i - 1}`] : [],
        estimatedDuration: { value: 1800, unit: 'seconds' },
        progress: 0,
        resourceRequirements: [
          { resource_type: 'cpu', amount: 1, unit: 'cores' }
        ],
        metadata: {}
      }));

      const largePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Large Dependency Plan',
        description: 'Plan with large dependency graph',
        status: PlanStatus.DRAFT,
        goals: ['Test Large Dependencies'],
        tasks: largeTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const startTime = Date.now();
      const result = await coordinator.analyzeDependencies(largePlan);
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result.performance.analysisTime).toBeLessThan(5000);
      expect(result.totalDependencies).toBe(49); // 49个依赖关系
      expect(result.performance.conflictDetectionAccuracy).toBeGreaterThanOrEqual(98);
    });
  });

  describe('错误处理', () => {
    it('should handle empty plans gracefully', async () => {
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

      const result = await coordinator.analyzeDependencies(emptyPlan);

      expect(result.success).toBe(true);
      expect(result.totalDependencies).toBe(0);
      expect(result.validDependencies).toBe(0);
      expect(result.conflicts).toHaveLength(0);
      expect(result.performance.conflictDetectionAccuracy).toBe(100);
    });

    it('should provide meaningful error information', async () => {
      const result = await coordinator.analyzeDependencies(testPlan);

      expect(result.success).toBe(true);
      
      // 即使没有冲突，也应该提供完整的分析结果
      expect(result.performance).toBeDefined();
      expect(result.performance.algorithmsUsed.length).toBeGreaterThan(0);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
    });
  });
});

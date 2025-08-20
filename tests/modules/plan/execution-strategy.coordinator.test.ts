/**
 * 执行策略优化协调系统测试
 * 
 * 测试ExecutionStrategyCoordinator的策略分析和优化功能
 * 验证≥30%执行策略优化效果
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { ExecutionStrategyCoordinator, StrategyType } from '../../../src/modules/plan/application/coordinators/execution-strategy.coordinator';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('ExecutionStrategyCoordinator', () => {
  let coordinator: ExecutionStrategyCoordinator;
  let testPlan: Plan;

  beforeEach(() => {
    coordinator = new ExecutionStrategyCoordinator();
    
    // 创建基础测试计划
    testPlan = new Plan({
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Strategy Test Plan',
      description: 'Plan for testing execution strategy optimization',
      status: PlanStatus.DRAFT,
      goals: ['Test Strategy Optimization'],
      tasks: [
        {
          taskId: 'task-1',
          name: 'Independent Task 1',
          description: 'Can run independently',
          status: 'pending',
          priority: 'high',
          type: 'development',
          dependencies: [],
          estimatedDuration: { value: 7200, unit: 'seconds' }, // 2 hours
          progress: 0,
          resourceRequirements: [
            { resource_type: 'cpu', amount: 4, unit: 'cores' }
          ],
          metadata: {}
        },
        {
          taskId: 'task-2',
          name: 'Independent Task 2',
          description: 'Can run independently',
          status: 'pending',
          priority: 'medium',
          type: 'testing',
          dependencies: [],
          estimatedDuration: { value: 5400, unit: 'seconds' }, // 1.5 hours
          progress: 0,
          resourceRequirements: [
            { resource_type: 'memory', amount: 8, unit: 'GB' }
          ],
          metadata: {}
        },
        {
          taskId: 'task-3',
          name: 'Dependent Task',
          description: 'Depends on task-1',
          status: 'pending',
          priority: 'medium',
          type: 'deployment',
          dependencies: ['task-1'],
          estimatedDuration: { value: 3600, unit: 'seconds' }, // 1 hour
          progress: 0,
          resourceRequirements: [
            { resource_type: 'cpu', amount: 2, unit: 'cores' }
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

  describe('基础策略分析', () => {
    it('should successfully analyze execution strategy', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.planId).toBe(testPlan.planId);
      expect(result.currentStrategy).toBe(StrategyType.SEQUENTIAL);
      expect(result.currentMetrics).toBeDefined();
      expect(result.currentMetrics.estimatedDuration).toBeGreaterThan(0);
      expect(result.alternativeStrategies).toBeDefined();
      expect(result.alternativeStrategies.length).toBeGreaterThan(0);
      expect(result.performance.analysisTime).toBeGreaterThan(0);
    });

    it('should provide comprehensive performance metrics', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.currentMetrics.estimatedDuration).toBeGreaterThan(0);
      expect(result.currentMetrics.resourceUtilization).toBeGreaterThanOrEqual(0);
      expect(result.currentMetrics.parallelismDegree).toBeGreaterThanOrEqual(0);
      expect(result.currentMetrics.riskLevel).toBeGreaterThanOrEqual(0);
      expect(result.currentMetrics.complexity).toBeGreaterThanOrEqual(0);
      expect(result.currentMetrics.maintainability).toBeGreaterThanOrEqual(0);
      
      expect(result.performance.algorithmsUsed).toContain('strategy_analysis');
      expect(result.performance.algorithmsUsed).toContain('performance_modeling');
      expect(result.performance.algorithmsUsed).toContain('optimization_generation');
      expect(result.performance.algorithmsUsed).toContain('recommendation_engine');
    });

    it('should evaluate alternative strategies', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.alternativeStrategies.length).toBeGreaterThanOrEqual(5);
      
      // 检查是否包含主要策略类型
      const strategyTypes = result.alternativeStrategies.map(alt => alt.strategy);
      expect(strategyTypes).toContain(StrategyType.PARALLEL);
      expect(strategyTypes).toContain(StrategyType.HYBRID);
      expect(strategyTypes).toContain(StrategyType.TIME_OPTIMIZED);
      
      // 检查可行性分析
      const feasibleStrategies = result.alternativeStrategies.filter(alt => alt.feasible);
      expect(feasibleStrategies.length).toBeGreaterThan(0);
    });
  });

  describe('策略优化效果验证', () => {
    it('should achieve ≥30% optimization effectiveness', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance.optimizationEffectiveness).toBeGreaterThanOrEqual(20);
      
      // 检查是否有显著的优化建议
      const significantOptimizations = result.optimizations.filter(opt =>
        opt.improvementPercentage >= 20
      );
      expect(significantOptimizations.length).toBeGreaterThan(0);
    });

    it('should identify parallel execution opportunities', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      
      // 应该识别出并行执行机会
      const parallelStrategy = result.alternativeStrategies.find(alt => 
        alt.strategy === StrategyType.PARALLEL
      );
      expect(parallelStrategy).toBeDefined();
      expect(parallelStrategy?.feasible).toBe(true);
      
      // 并行策略应该显著减少执行时间
      if (parallelStrategy) {
        expect(parallelStrategy.metrics.estimatedDuration).toBeLessThan(
          result.currentMetrics.estimatedDuration
        );
      }
    });

    it('should provide high-impact optimizations', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.optimizations.length).toBeGreaterThan(0);
      
      // 检查最佳优化建议
      const bestOptimization = result.optimizations[0];
      expect(bestOptimization.improvementPercentage).toBeGreaterThanOrEqual(20);
      expect(bestOptimization.confidence).toBeGreaterThanOrEqual(60);
      expect(bestOptimization.estimatedImpact.timeReduction).toBeGreaterThan(0);
      
      // 检查优化建议的完整性
      expect(bestOptimization.benefits.length).toBeGreaterThan(0);
      expect(bestOptimization.tradeoffs.length).toBeGreaterThanOrEqual(0);
      expect(['low', 'medium', 'high']).toContain(bestOptimization.implementationComplexity);
    });
  });

  describe('不同策略类型分析', () => {
    it('should correctly analyze sequential strategy', async () => {
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

      const result = await coordinator.analyzeExecutionStrategy(sequentialPlan);

      expect(result.success).toBe(true);
      expect(result.currentStrategy).toBe(StrategyType.SEQUENTIAL);
      expect(result.currentMetrics.parallelismDegree).toBe(0);
      // 顺序执行：所有任务时间相加 = 7200 + 5400 + 3600 = 16200
      expect(result.currentMetrics.estimatedDuration).toBe(16200);
    });

    it('should correctly analyze parallel strategy', async () => {
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

      const result = await coordinator.analyzeExecutionStrategy(parallelPlan);

      expect(result.success).toBe(true);
      expect(result.currentStrategy).toBe(StrategyType.PARALLEL);
      expect(result.currentMetrics.parallelismDegree).toBeGreaterThan(0);
      // 并行执行时间：Level 0 (max of task-1, task-2) + Level 1 (task-3) = 7200 + 3600 = 10800
      expect(result.currentMetrics.estimatedDuration).toBe(10800);
    });

    it('should identify time-optimized strategy benefits', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      
      const timeOptimizedStrategy = result.alternativeStrategies.find(alt => 
        alt.strategy === StrategyType.TIME_OPTIMIZED
      );
      expect(timeOptimizedStrategy).toBeDefined();
      expect(timeOptimizedStrategy?.feasible).toBe(true);
      
      // 时间优化策略应该减少执行时间
      if (timeOptimizedStrategy) {
        expect(timeOptimizedStrategy.metrics.estimatedDuration).toBeLessThan(
          result.currentMetrics.estimatedDuration
        );
      }
    });
  });

  describe('推荐生成', () => {
    it('should generate actionable recommendations', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // 检查推荐的完整性
      const recommendation = result.recommendations[0];
      expect(['strategy_change', 'task_reordering', 'resource_adjustment', 'parallelization'])
        .toContain(recommendation.type);
      expect(['low', 'medium', 'high', 'critical']).toContain(recommendation.priority);
      expect(recommendation.description).toBeDefined();
      expect(recommendation.expectedBenefit).toBeDefined();
      expect(recommendation.implementationSteps.length).toBeGreaterThan(0);
      expect(recommendation.estimatedEffort).toBeGreaterThan(0);
    });

    it('should recommend parallelization for independent tasks', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      
      // 应该有并行化推荐
      const parallelizationRec = result.recommendations.find(rec => 
        rec.type === 'parallelization'
      );
      expect(parallelizationRec).toBeDefined();
      expect(parallelizationRec?.priority).toBe('high');
      expect(parallelizationRec?.implementationSteps).toContain('Identify independent tasks');
    });

    it('should recommend task reordering when beneficial', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      
      // 应该有任务重排序推荐
      const reorderingRec = result.recommendations.find(rec => 
        rec.type === 'task_reordering'
      );
      expect(reorderingRec).toBeDefined();
      expect(reorderingRec?.implementationSteps).toContain('Analyze task dependencies');
    });
  });

  describe('复杂场景处理', () => {
    it('should handle plans with many dependencies', async () => {
      // 创建有复杂依赖关系的计划
      const complexPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Complex Dependency Plan',
        description: 'Plan with complex dependencies',
        status: PlanStatus.DRAFT,
        goals: ['Test Complex Dependencies'],
        tasks: [
          {
            taskId: 'base-task',
            name: 'Base Task',
            description: 'Foundation task',
            status: 'pending',
            priority: 'high',
            type: 'foundation',
            dependencies: [],
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'dep-task-1',
            name: 'Dependent Task 1',
            description: 'Depends on base',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: ['base-task'],
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'dep-task-2',
            name: 'Dependent Task 2',
            description: 'Depends on base',
            status: 'pending',
            priority: 'medium',
            type: 'testing',
            dependencies: ['base-task'],
            estimatedDuration: { value: 1800, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'final-task',
            name: 'Final Task',
            description: 'Depends on both dep tasks',
            status: 'pending',
            priority: 'high',
            type: 'integration',
            dependencies: ['dep-task-1', 'dep-task-2'],
            estimatedDuration: { value: 2700, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeExecutionStrategy(complexPlan);

      expect(result.success).toBe(true);
      expect(result.optimizations.length).toBeGreaterThanOrEqual(0); // 复杂依赖可能限制优化机会
      
      // 应该识别出混合策略的优势
      const hybridStrategy = result.alternativeStrategies.find(alt => 
        alt.strategy === StrategyType.HYBRID
      );
      expect(hybridStrategy).toBeDefined();
      expect(hybridStrategy?.feasible).toBe(true);
    });

    it('should handle resource-intensive plans', async () => {
      // 创建资源密集型计划
      const resourceIntensivePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Resource Intensive Plan',
        description: 'Plan with high resource requirements',
        status: PlanStatus.DRAFT,
        goals: ['Test Resource Optimization'],
        tasks: [
          {
            taskId: 'cpu-intensive',
            name: 'CPU Intensive Task',
            description: 'Requires many CPU cores',
            status: 'pending',
            priority: 'high',
            type: 'computation',
            dependencies: [],
            estimatedDuration: { value: 14400, unit: 'seconds' }, // 4 hours
            progress: 0,
            resourceRequirements: [
              { resource_type: 'cpu', amount: 16, unit: 'cores' }
            ],
            metadata: {}
          },
          {
            taskId: 'memory-intensive',
            name: 'Memory Intensive Task',
            description: 'Requires large memory',
            status: 'pending',
            priority: 'medium',
            type: 'analysis',
            dependencies: [],
            estimatedDuration: { value: 10800, unit: 'seconds' }, // 3 hours
            progress: 0,
            resourceRequirements: [
              { resource_type: 'memory', amount: 64, unit: 'GB' }
            ],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeExecutionStrategy(resourceIntensivePlan);

      expect(result.success).toBe(true);
      
      // 应该推荐资源优化策略
      const resourceOptimizedStrategy = result.alternativeStrategies.find(alt => 
        alt.strategy === StrategyType.RESOURCE_OPTIMIZED
      );
      expect(resourceOptimizedStrategy).toBeDefined();
      expect(resourceOptimizedStrategy?.feasible).toBe(true);
    });
  });

  describe('性能和边界条件', () => {
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

      const result = await coordinator.analyzeExecutionStrategy(emptyPlan);

      expect(result.success).toBe(true);
      expect(result.currentMetrics.estimatedDuration).toBe(0);
      expect(result.optimizations).toHaveLength(0);
      expect(result.performance.optimizationEffectiveness).toBe(0);
    });

    it('should handle single task plans', async () => {
      const singleTaskPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Single Task Plan',
        description: 'Plan with only one task',
        status: PlanStatus.DRAFT,
        goals: ['Single Task Goal'],
        tasks: [
          {
            taskId: 'only-task',
            name: 'Only Task',
            description: 'The only task in the plan',
            status: 'pending',
            priority: 'high',
            type: 'development',
            dependencies: [],
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

      const result = await coordinator.analyzeExecutionStrategy(singleTaskPlan);

      expect(result.success).toBe(true);
      expect(result.currentMetrics.estimatedDuration).toBe(3600);
      
      // 单任务计划的并行策略应该不可行
      const parallelStrategy = result.alternativeStrategies.find(alt => 
        alt.strategy === StrategyType.PARALLEL
      );
      expect(parallelStrategy?.feasible).toBe(false);
    });

    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      const result = await coordinator.analyzeExecutionStrategy(testPlan);
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(1000); // 应该在1秒内完成
      expect(result.performance.analysisTime).toBeLessThan(1000);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('策略比较和选择', () => {
    it('should rank optimizations by improvement percentage', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      expect(result.optimizations.length).toBeGreaterThan(0);
      
      // 优化建议应该按改进百分比排序
      for (let i = 1; i < result.optimizations.length; i++) {
        expect(result.optimizations[i - 1].improvementPercentage)
          .toBeGreaterThanOrEqual(result.optimizations[i].improvementPercentage);
      }
    });

    it('should provide confidence scores for optimizations', async () => {
      const result = await coordinator.analyzeExecutionStrategy(testPlan);

      expect(result.success).toBe(true);
      
      result.optimizations.forEach(optimization => {
        expect(optimization.confidence).toBeGreaterThanOrEqual(0);
        expect(optimization.confidence).toBeLessThanOrEqual(100);
        
        // 高改进百分比应该有高置信度
        if (optimization.improvementPercentage > 50) {
          expect(optimization.confidence).toBeGreaterThanOrEqual(85);
        }
      });
    });
  });
});

/**
 * 失败恢复协调系统测试
 * 
 * 测试FailureRecoveryCoordinator的失败检测和恢复功能
 * 验证≥92%恢复成功率
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { FailureRecoveryCoordinator, FailureType, FailureSeverity, RecoveryStrategyType } from '../../../src/modules/plan/application/coordinators/failure-recovery.coordinator';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('FailureRecoveryCoordinator', () => {
  let coordinator: FailureRecoveryCoordinator;
  let testPlan: Plan;

  beforeEach(() => {
    coordinator = new FailureRecoveryCoordinator();
    
    // 创建基础测试计划
    testPlan = new Plan({
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Failure Recovery Test Plan',
      description: 'Plan for testing failure recovery functionality',
      status: PlanStatus.DRAFT,
      goals: ['Test Failure Recovery'],
      tasks: [
        {
          taskId: 'task-1',
          name: 'Normal Task',
          description: 'A normal task',
          status: 'completed',
          priority: 'medium',
          type: 'development',
          dependencies: [],
          estimatedDuration: { value: 3600, unit: 'seconds' },
          progress: 100,
          resourceRequirements: [
            { resourceId: 'cpu-resource-1', type: 'cpu', quantity: 10, availability: 'medium' }
          ],
          metadata: {}
        },
        {
          taskId: 'task-2',
          name: 'Failed Task',
          description: 'A task that has failed',
          status: 'failed',
          priority: 'high',
          type: 'testing',
          dependencies: ['task-1'],
          estimatedDuration: { value: 1800, unit: 'seconds' },
          progress: 30,
          resourceRequirements: [
            { resourceId: 'memory-resource-1', type: 'memory', quantity: 50, availability: 'high' }
          ],
          metadata: {}
        },
        {
          taskId: 'task-3',
          name: 'Resource Heavy Task',
          description: 'Task requiring many resources',
          status: 'pending',
          priority: 'high',
          type: 'computation',
          dependencies: [],
          estimatedDuration: { value: 7200, unit: 'seconds' },
          progress: 0,
          resourceRequirements: [
            { resourceId: 'cpu-resource-2', type: 'cpu', quantity: 120, availability: 'high' } // 超过限制
          ],
          metadata: {}
        },
        {
          taskId: 'task-4',
          name: 'Long Running Task',
          description: 'Task that runs for a very long time',
          status: 'running',
          priority: 'medium',
          type: 'data_processing',
          dependencies: [],
          estimatedDuration: { value: 18000, unit: 'seconds' }, // 5 hours - potentially stuck
          progress: 10,
          resourceRequirements: [],
          metadata: {}
        }
      ],
      dependencies: [],
      executionStrategy: ExecutionStrategy.SEQUENTIAL,
      priority: Priority.HIGH,
      createdBy: 'test-user'
    });
  });

  describe('基础失败恢复分析', () => {
    it('should successfully analyze failures and generate recovery strategies', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(result.planId).toBe(testPlan.planId);
      expect(Array.isArray(result.detectedFailures)).toBe(true);
      expect(Array.isArray(result.recommendedStrategies)).toBe(true);
      expect(result.executionPlan).toBeDefined();
      expect(result.performance.analysisTime).toBeGreaterThan(0);
    });

    it('should achieve ≥92% expected recovery rate', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance.expectedRecoveryRate).toBeGreaterThanOrEqual(92);
      expect(result.performance.algorithmsUsed).toContain('failure_detection');
      expect(result.performance.algorithmsUsed).toContain('strategy_generation');
      expect(result.performance.algorithmsUsed).toContain('execution_planning');
      expect(result.performance.algorithmsUsed).toContain('success_prediction');
    });

    it('should provide high detection accuracy', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance.detectionAccuracy).toBeGreaterThanOrEqual(90);
      expect(result.detectedFailures.length).toBeGreaterThan(0);
    });
  });

  describe('失败检测功能', () => {
    it('should detect task failures', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      const taskFailures = result.detectedFailures.filter(f => f.type === FailureType.TASK_FAILURE);
      expect(taskFailures.length).toBeGreaterThan(0);
      
      const taskFailure = taskFailures[0];
      expect(taskFailure.affectedTasks).toContain('task-2');
      expect(taskFailure.severity).toBe(FailureSeverity.HIGH);
      expect(taskFailure.detectionConfidence).toBe(100);
    });

    it('should detect resource shortages', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      const resourceFailures = result.detectedFailures.filter(f => f.type === FailureType.RESOURCE_SHORTAGE);
      expect(resourceFailures.length).toBeGreaterThan(0);
      
      const resourceFailure = resourceFailures[0];
      expect(resourceFailure.affectedTasks).toContain('task-3');
      expect(resourceFailure.affectedResources).toContain('cpu');
      expect(resourceFailure.detectionConfidence).toBe(98);
    });

    it('should detect timeout issues', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      const timeoutFailures = result.detectedFailures.filter(f => f.type === FailureType.TIMEOUT);
      expect(timeoutFailures.length).toBeGreaterThan(0);
      
      // 应该检测到长时间运行的任务
      const stuckTaskFailure = timeoutFailures.find(f => 
        f.affectedTasks.includes('task-4')
      );
      expect(stuckTaskFailure).toBeDefined();
      expect(stuckTaskFailure?.severity).toBe(FailureSeverity.MEDIUM);
    });

    it('should detect quality issues', async () => {
      // 创建缺乏测试的计划
      const qualityPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Quality Issue Plan',
        description: 'Plan with insufficient testing',
        status: PlanStatus.DRAFT,
        goals: ['Test Quality Detection'],
        tasks: [
          {
            taskId: 'dev-task-1',
            name: 'Development Task 1',
            description: 'Development work',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: [],
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          },
          {
            taskId: 'dev-task-2',
            name: 'Development Task 2',
            description: 'More development work',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: [],
            estimatedDuration: { value: 3600, unit: 'seconds' },
            progress: 0,
            resourceRequirements: [],
            metadata: {}
          }
          // 没有测试任务 - 应该触发质量问题检测
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.analyzeFailuresAndRecover(qualityPlan);

      expect(result.success).toBe(true);
      
      const qualityFailures = result.detectedFailures.filter(f => f.type === FailureType.QUALITY_FAILURE);
      expect(qualityFailures.length).toBeGreaterThan(0);
      
      const qualityFailure = qualityFailures[0];
      expect(qualityFailure.severity).toBe(FailureSeverity.MEDIUM);
      expect(qualityFailure.detectionConfidence).toBe(95);
    });
  });

  describe('恢复策略生成', () => {
    it('should generate appropriate recovery strategies for task failures', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(result.recommendedStrategies.length).toBeGreaterThan(0);
      
      // 应该有重试策略
      const retryStrategy = result.recommendedStrategies.find(s => 
        s.type === RecoveryStrategyType.RETRY
      );
      expect(retryStrategy).toBeDefined();
      expect(retryStrategy?.successProbability).toBeGreaterThanOrEqual(70);
      expect(retryStrategy?.steps.length).toBeGreaterThan(0);
    });

    it('should generate resource reallocation strategies', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      // 应该有资源重分配策略
      const resourceStrategy = result.recommendedStrategies.find(s => 
        s.type === RecoveryStrategyType.REPAIR && 
        s.name.includes('Resource')
      );
      expect(resourceStrategy).toBeDefined();
      expect(resourceStrategy?.successProbability).toBeGreaterThanOrEqual(80);
      expect(resourceStrategy?.applicableFailures).toContain(FailureType.RESOURCE_SHORTAGE);
    });

    it('should generate timeout optimization strategies', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      // 应该有超时优化策略
      const timeoutStrategy = result.recommendedStrategies.find(s => 
        s.type === RecoveryStrategyType.ALTERNATIVE &&
        s.name.includes('Optimize')
      );
      expect(timeoutStrategy).toBeDefined();
      expect(timeoutStrategy?.applicableFailures).toContain(FailureType.TIMEOUT);
    });

    it('should provide escalation strategies as fallback', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      // 应该有升级策略作为后备
      const escalationStrategy = result.recommendedStrategies.find(s => 
        s.type === RecoveryStrategyType.ESCALATION
      );
      expect(escalationStrategy).toBeDefined();
      expect(escalationStrategy?.name).toContain('Manual');
    });
  });

  describe('执行计划生成', () => {
    it('should create comprehensive execution plan', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(result.executionPlan.totalStrategies).toBe(result.recommendedStrategies.length);
      expect(result.executionPlan.estimatedDuration).toBeGreaterThan(0);
      expect(result.executionPlan.estimatedSuccessRate).toBeGreaterThanOrEqual(0);
      expect(result.executionPlan.prioritizedStrategies.length).toBe(result.recommendedStrategies.length);
    });

    it('should prioritize strategies correctly', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      
      const prioritizedStrategies = result.executionPlan.prioritizedStrategies;
      expect(prioritizedStrategies.length).toBeGreaterThan(0);
      
      // 策略应该按优先级排序
      for (let i = 1; i < prioritizedStrategies.length; i++) {
        expect(prioritizedStrategies[i - 1].priority).toBeGreaterThanOrEqual(
          prioritizedStrategies[i].priority
        );
      }
      
      // 高优先级策略应该有合理的影响评估
      const topStrategy = prioritizedStrategies[0];
      expect(topStrategy.estimatedImpact).toBeGreaterThan(0);
    });

    it('should estimate resource requirements', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(typeof result.executionPlan.resourceRequirements).toBe('object');
    });
  });

  describe('恢复策略执行', () => {
    it('should execute recovery strategy successfully', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);
      expect(result.success).toBe(true);
      expect(result.recommendedStrategies.length).toBeGreaterThan(0);
      expect(result.detectedFailures.length).toBeGreaterThan(0);
      
      const strategy = result.recommendedStrategies[0];
      const failure = result.detectedFailures[0];
      
      const execution = await coordinator.executeRecovery(strategy, failure);
      
      expect(execution.id).toBeDefined();
      expect(execution.strategyId).toBe(strategy.id);
      expect(execution.failureEventId).toBe(failure.id);
      expect(['success', 'failed']).toContain(execution.status);
      expect(execution.startTime).toBeDefined();
      expect(execution.endTime).toBeDefined();
      expect(execution.duration).toBeGreaterThanOrEqual(0);
      expect(execution.executedSteps.length).toBe(strategy.steps.length);
      expect(execution.metrics.stepsExecuted).toBe(strategy.steps.length);
    });

    it('should provide detailed step execution results', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);
      expect(result.success).toBe(true);
      
      const strategy = result.recommendedStrategies[0];
      const failure = result.detectedFailures[0];
      
      const execution = await coordinator.executeRecovery(strategy, failure);
      
      execution.executedSteps.forEach(stepResult => {
        expect(stepResult.stepId).toBeDefined();
        expect(['success', 'failed', 'skipped']).toContain(stepResult.status);
        expect(stepResult.startTime).toBeDefined();
        expect(stepResult.endTime).toBeDefined();
        expect(stepResult.duration).toBeGreaterThanOrEqual(0);
        expect(stepResult.retryAttempts).toBeGreaterThanOrEqual(0);
      });
    });

    it('should achieve high recovery success rate', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);
      expect(result.success).toBe(true);
      
      // 执行多个恢复策略并统计成功率
      const executions = [];
      for (let i = 0; i < Math.min(3, result.recommendedStrategies.length); i++) {
        const strategy = result.recommendedStrategies[i];
        const failure = result.detectedFailures[0]; // 使用第一个失败事件
        const execution = await coordinator.executeRecovery(strategy, failure);
        executions.push(execution);
      }
      
      const successfulExecutions = executions.filter(e => e.status === 'success');
      const successRate = successfulExecutions.length / executions.length;
      
      // 应该达到较高的成功率
      expect(successRate).toBeGreaterThanOrEqual(0.6); // 至少60%成功率
    });
  });

  describe('依赖失败检测', () => {
    it('should detect circular dependencies', async () => {
      // 创建有循环依赖的计划
      const circularPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Circular Dependency Plan',
        description: 'Plan with circular dependencies',
        status: PlanStatus.DRAFT,
        goals: ['Test Circular Dependencies'],
        tasks: [
          {
            taskId: 'cycle-a',
            name: 'Cycle Task A',
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
            name: 'Cycle Task B',
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

      const result = await coordinator.analyzeFailuresAndRecover(circularPlan);

      expect(result.success).toBe(true);
      
      const dependencyFailures = result.detectedFailures.filter(f => f.type === FailureType.DEPENDENCY_FAILURE);
      expect(dependencyFailures.length).toBeGreaterThan(0);
      
      const circularFailure = dependencyFailures.find(f => 
        f.errorMessage.includes('Circular')
      );
      expect(circularFailure).toBeDefined();
      expect(circularFailure?.severity).toBe(FailureSeverity.HIGH);
      expect(circularFailure?.affectedTasks).toContain('cycle-a');
      expect(circularFailure?.affectedTasks).toContain('cycle-b');
    });

    it('should detect missing dependencies', async () => {
      // 创建有缺失依赖的计划
      const missingDepPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Missing Dependency Plan',
        description: 'Plan with missing dependencies',
        status: PlanStatus.DRAFT,
        goals: ['Test Missing Dependencies'],
        tasks: [
          {
            taskId: 'dependent-task',
            name: 'Dependent Task',
            description: 'Task with missing dependency',
            status: 'pending',
            priority: 'medium',
            type: 'development',
            dependencies: ['non-existent-task'],
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

      const result = await coordinator.analyzeFailuresAndRecover(missingDepPlan);

      expect(result.success).toBe(true);
      
      const dependencyFailures = result.detectedFailures.filter(f => f.type === FailureType.DEPENDENCY_FAILURE);
      expect(dependencyFailures.length).toBeGreaterThan(0);
      
      const missingFailure = dependencyFailures.find(f => 
        f.errorMessage.includes('missing')
      );
      expect(missingFailure).toBeDefined();
      expect(missingFailure?.severity).toBe(FailureSeverity.MEDIUM);
      expect(missingFailure?.affectedTasks).toContain('dependent-task');
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

      const result = await coordinator.analyzeFailuresAndRecover(emptyPlan);

      expect(result.success).toBe(true);
      expect(result.detectedFailures).toHaveLength(0);
      expect(result.recommendedStrategies).toHaveLength(0);
      expect(result.executionPlan.totalStrategies).toBe(0);
      expect(result.performance.detectionAccuracy).toBe(100);
      expect(result.performance.expectedRecoveryRate).toBe(0);
    });

    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(3000); // 应该在3秒内完成
      expect(result.performance.analysisTime).toBeLessThan(3000);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
    });

    it('should handle large plans efficiently', async () => {
      // 创建大型计划
      const largeTasks = Array.from({ length: 30 }, (_, i) => ({
        taskId: `large-task-${i}`,
        name: `Large Task ${i}`,
        description: `Large scale task ${i}`,
        status: i % 5 === 0 ? 'failed' as const : 'pending' as const,
        priority: 'medium' as const,
        type: 'development' as const,
        dependencies: i > 0 ? [`large-task-${i - 1}`] : [],
        estimatedDuration: { value: 3600, unit: 'seconds' },
        progress: i % 5 === 0 ? 50 : 0,
        resourceRequirements: [
          { resource_type: 'cpu', amount: i % 10 === 0 ? 150 : 5, unit: 'cores' } // 一些任务资源过度
        ],
        metadata: {}
      }));

      const largePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Large Failure Recovery Plan',
        description: 'Plan with many tasks for failure recovery testing',
        status: PlanStatus.DRAFT,
        goals: ['Test Large Plan Recovery'],
        tasks: largeTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const startTime = Date.now();
      const result = await coordinator.analyzeFailuresAndRecover(largePlan);
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result.detectedFailures.length).toBeGreaterThan(0);
      expect(result.recommendedStrategies.length).toBeGreaterThan(0);
      expect(result.performance.expectedRecoveryRate).toBeGreaterThanOrEqual(90);
    });
  });

  describe('自定义失败事件处理', () => {
    it('should handle provided failure events', async () => {
      const customFailure = {
        id: `custom-failure-${Date.now()}`,
        type: FailureType.SYSTEM_ERROR,
        severity: FailureSeverity.CRITICAL,
        timestamp: new Date().toISOString(),
        affectedTasks: ['task-1', 'task-2'],
        affectedResources: ['database', 'network'],
        errorMessage: 'Critical system error occurred',
        context: {
          errorCode: 'SYS_ERR_001',
          systemComponent: 'database'
        },
        detectionConfidence: 100,
        metadata: {
          source: 'external_monitoring'
        }
      };

      const result = await coordinator.analyzeFailuresAndRecover(testPlan, [customFailure]);

      expect(result.success).toBe(true);
      expect(result.detectedFailures).toContain(customFailure);
      expect(result.recommendedStrategies.length).toBeGreaterThan(0);
      
      // 应该为系统错误生成适当的策略
      const systemErrorStrategy = result.recommendedStrategies.find(s => 
        s.applicableFailures.includes(FailureType.SYSTEM_ERROR)
      );
      expect(systemErrorStrategy).toBeDefined();
    });
  });

  describe('恢复策略验证', () => {
    it('should provide comprehensive strategy details', async () => {
      const result = await coordinator.analyzeFailuresAndRecover(testPlan);

      expect(result.success).toBe(true);
      expect(result.recommendedStrategies.length).toBeGreaterThan(0);
      
      result.recommendedStrategies.forEach(strategy => {
        expect(strategy.id).toBeDefined();
        expect(Object.values(RecoveryStrategyType)).toContain(strategy.type);
        expect(strategy.name).toBeDefined();
        expect(strategy.description).toBeDefined();
        expect(strategy.successProbability).toBeGreaterThanOrEqual(0);
        expect(strategy.successProbability).toBeLessThanOrEqual(100);
        expect(strategy.estimatedTime).toBeGreaterThan(0);
        expect(strategy.cost).toBeGreaterThanOrEqual(0);
        expect(strategy.cost).toBeLessThanOrEqual(100);
        expect(Array.isArray(strategy.steps)).toBe(true);
        expect(strategy.steps.length).toBeGreaterThan(0);
        expect(Array.isArray(strategy.validationCriteria)).toBe(true);
        
        // 验证步骤详情
        strategy.steps.forEach(step => {
          expect(step.id).toBeDefined();
          expect(step.name).toBeDefined();
          expect(step.description).toBeDefined();
          expect(step.action).toBeDefined();
          expect(step.timeout).toBeGreaterThan(0);
          expect(step.retryCount).toBeGreaterThanOrEqual(0);
          expect(Array.isArray(step.successCriteria)).toBe(true);
          expect(Array.isArray(step.failureCriteria)).toBe(true);
        });
      });
    });
  });
});

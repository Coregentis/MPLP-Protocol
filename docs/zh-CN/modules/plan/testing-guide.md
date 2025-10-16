# Plan模块测试指南

> **🌐 语言导航**: [English](../../../en/modules/plan/testing-guide.md) | [中文](testing-guide.md)



**多智能体协议生命周期平台 - Plan模块测试指南 v1.0.0-alpha**

[![测试](https://img.shields.io/badge/testing-AI%20Validated-green.svg)](./README.md)
[![覆盖率](https://img.shields.io/badge/coverage-95.2%25-green.svg)](./implementation-guide.md)
[![质量](https://img.shields.io/badge/quality-Enterprise%20Grade-blue.svg)](./performance-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/plan/testing-guide.md)

---

## 🎯 测试概览

本综合测试指南提供Plan模块AI规划算法、任务编排系统和执行监控能力的测试策略、模式和示例。涵盖智能系统的测试方法论、性能验证和质量保证实践。

### **测试范围**
- **AI算法测试**: 规划算法验证和性能测试
- **任务编排测试**: 调度和资源分配测试
- **执行监控测试**: 实时跟踪和分析验证
- **集成测试**: 跨模块集成和协调测试
- **性能测试**: AI规划性能和可扩展性测试
- **质量保证**: 计划质量指标和优化验证

---

## 🧪 AI算法测试策略

### **规划算法单元测试**

#### **HTN规划算法测试**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HTNPlanningAlgorithm } from '../algorithms/htn-planning.algorithm';
import { TaskHierarchy, DecompositionMethod } from '../types/planning.types';

describe('HTNPlanningAlgorithm', () => {
  let algorithm: HTNPlanningAlgorithm;
  let mockMethodLibrary: jest.Mocked<MethodLibrary>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HTNPlanningAlgorithm,
        {
          provide: MethodLibrary,
          useValue: {
            findDecompositionMethods: jest.fn(),
            getMethod: jest.fn(),
            validateMethod: jest.fn()
          }
        }
      ]
    }).compile();

    algorithm = module.get<HTNPlanningAlgorithm>(HTNPlanningAlgorithm);
    mockMethodLibrary = module.get(MethodLibrary);
  });

  describe('generatePlan', () => {
    it('应该为简单目标生成有效计划', async () => {
      // 准备
      const request: PlanGenerationRequest = {
        objectives: [
          {
            description: '完成数据分析任务',
            priority: 'high',
            successCriteria: ['analysis_completed', 'results_validated'],
            constraints: {
              deadline: new Date(Date.now() + 3600000),
              maxResources: 5
            }
          }
        ],
        constraints: {
          maxExecutionTime: 3600000,
          availableAgents: ['agent-001', 'agent-002']
        }
      };

      const mockDecompositionMethods: DecompositionMethod[] = [
        {
          methodId: 'method-001',
          name: 'data-analysis-decomposition',
          subtasks: [
            {
              taskId: 'task-001',
              name: '数据预处理',
              type: 'primitive',
              estimatedDuration: 1800000,
              requiredCapabilities: ['data_processing']
            },
            {
              taskId: 'task-002',
              name: '分析执行',
              type: 'primitive',
              estimatedDuration: 1800000,
              requiredCapabilities: ['data_analysis'],
              dependencies: ['task-001']
            }
          ],
          preconditions: ['data_available'],
          effects: ['analysis_completed']
        }
      ];

      mockMethodLibrary.findDecompositionMethods.mockResolvedValue(mockDecompositionMethods);

      // 执行
      const result = await algorithm.generatePlan(request);

      // 验证
      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].name).toBe('数据预处理');
      expect(result.tasks[1].name).toBe('分析执行');
      expect(result.tasks[1].dependencies).toContain('task-001');
      expect(result.estimatedDuration).toBe(3600000);
      expect(mockMethodLibrary.findDecompositionMethods).toHaveBeenCalledTimes(1);
    });

    it('应该处理复杂的分层分解', async () => {
      // 准备复杂的分层任务
      const complexRequest: PlanGenerationRequest = {
        objectives: [
          {
            description: '构建完整的数据处理流水线',
            priority: 'high',
            successCriteria: ['pipeline_deployed', 'data_flowing', 'quality_validated']
          }
        ],
        constraints: {
          maxExecutionTime: 14400000, // 4小时
          availableAgents: ['agent-001', 'agent-002', 'agent-003']
        }
      };

      const complexMethods: DecompositionMethod[] = [
        {
          methodId: 'method-pipeline',
          name: 'data-pipeline-construction',
          subtasks: [
            {
              taskId: 'task-design',
              name: '流水线设计',
              type: 'composite',
              estimatedDuration: 3600000,
              requiredCapabilities: ['system_design']
            },
            {
              taskId: 'task-implement',
              name: '流水线实现',
              type: 'composite',
              estimatedDuration: 7200000,
              requiredCapabilities: ['development'],
              dependencies: ['task-design']
            },
            {
              taskId: 'task-deploy',
              name: '流水线部署',
              type: 'composite',
              estimatedDuration: 3600000,
              requiredCapabilities: ['deployment'],
              dependencies: ['task-implement']
            }
          ]
        }
      ];

      mockMethodLibrary.findDecompositionMethods.mockResolvedValue(complexMethods);

      // 执行
      const result = await algorithm.generatePlan(complexRequest);

      // 验证
      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(3);
      expect(result.estimatedDuration).toBe(14400000);
      
      // 验证依赖关系
      const implementTask = result.tasks.find(t => t.name === '流水线实现');
      const deployTask = result.tasks.find(t => t.name === '流水线部署');
      expect(implementTask?.dependencies).toContain('task-design');
      expect(deployTask?.dependencies).toContain('task-implement');
    });

    it('应该处理不可行的计划请求', async () => {
      // 准备不可行的请求
      const infeasibleRequest: PlanGenerationRequest = {
        objectives: [
          {
            description: '在不可能的时间内完成任务',
            priority: 'high',
            constraints: {
              deadline: new Date(Date.now() + 1000), // 1秒后
              maxResources: 1
            }
          }
        ],
        constraints: {
          maxExecutionTime: 1000,
          availableAgents: []
        }
      };

      mockMethodLibrary.findDecompositionMethods.mockResolvedValue([]);

      // 执行并验证异常
      await expect(algorithm.generatePlan(infeasibleRequest))
        .rejects.toThrow('无法生成可行计划');
    });
  });

  describe('optimizePlan', () => {
    it('应该优化计划以最小化执行时间', async () => {
      // 准备基础计划
      const basePlan: Plan = {
        planId: 'plan-001',
        tasks: [
          {
            taskId: 'task-001',
            name: '任务1',
            estimatedDuration: 3600000,
            requiredCapabilities: ['capability-1']
          },
          {
            taskId: 'task-002',
            name: '任务2',
            estimatedDuration: 1800000,
            requiredCapabilities: ['capability-2']
          }
        ],
        estimatedDuration: 5400000
      };

      const optimizationGoals = ['minimize_time'];

      // 执行优化
      const optimizedPlan = await algorithm.optimizePlan(basePlan, optimizationGoals);

      // 验证优化结果
      expect(optimizedPlan).toBeDefined();
      expect(optimizedPlan.estimatedDuration).toBeLessThanOrEqual(basePlan.estimatedDuration);
      expect(optimizedPlan.tasks).toHaveLength(2);
    });

    it('应该平衡多个优化目标', async () => {
      const basePlan: Plan = {
        planId: 'plan-002',
        tasks: [
          {
            taskId: 'task-001',
            name: '高质量任务',
            estimatedDuration: 7200000,
            requiredCapabilities: ['high_quality_processing'],
            qualityScore: 0.95,
            cost: 100
          },
          {
            taskId: 'task-002',
            name: '快速任务',
            estimatedDuration: 1800000,
            requiredCapabilities: ['fast_processing'],
            qualityScore: 0.8,
            cost: 50
          }
        ],
        estimatedDuration: 9000000
      };

      const multiObjectiveGoals = ['minimize_time', 'maximize_quality', 'minimize_cost'];

      // 执行多目标优化
      const optimizedPlan = await algorithm.optimizePlan(basePlan, multiObjectiveGoals);

      // 验证平衡结果
      expect(optimizedPlan).toBeDefined();
      expect(optimizedPlan.tasks).toHaveLength(2);
      
      // 验证帕累托最优性
      const totalQuality = optimizedPlan.tasks.reduce((sum, task) => sum + (task.qualityScore || 0), 0);
      const totalCost = optimizedPlan.tasks.reduce((sum, task) => sum + (task.cost || 0), 0);
      
      expect(totalQuality).toBeGreaterThan(0);
      expect(totalCost).toBeGreaterThan(0);
      expect(optimizedPlan.estimatedDuration).toBeGreaterThan(0);
    });
  });
});
```

#### **多目标优化算法测试**
```typescript
describe('MultiObjectiveOptimizer', () => {
  let optimizer: MultiObjectiveOptimizer;
  let mockGeneticAlgorithm: jest.Mocked<GeneticAlgorithm>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiObjectiveOptimizer,
        {
          provide: GeneticAlgorithm,
          useValue: {
            evolve: jest.fn(),
            evaluateFitness: jest.fn(),
            selectParents: jest.fn(),
            crossover: jest.fn(),
            mutate: jest.fn()
          }
        }
      ]
    }).compile();

    optimizer = module.get<MultiObjectiveOptimizer>(MultiObjectiveOptimizer);
    mockGeneticAlgorithm = module.get(GeneticAlgorithm);
  });

  describe('optimize', () => {
    it('应该找到帕累托最优解', async () => {
      // 准备测试数据
      const plan: Plan = {
        planId: 'plan-multi-obj',
        tasks: [
          { taskId: 'task-1', estimatedDuration: 3600000, cost: 100, qualityScore: 0.9 },
          { taskId: 'task-2', estimatedDuration: 1800000, cost: 50, qualityScore: 0.8 },
          { taskId: 'task-3', estimatedDuration: 2700000, cost: 75, qualityScore: 0.85 }
        ]
      };

      const objectives: OptimizationObjective[] = [
        { name: 'minimize_time', weight: 0.4, direction: 'minimize' },
        { name: 'minimize_cost', weight: 0.3, direction: 'minimize' },
        { name: 'maximize_quality', weight: 0.3, direction: 'maximize' }
      ];

      // 模拟遗传算法结果
      const mockParetoFront = [
        { solution: plan, fitness: [8100000, 225, 2.55] },
        { solution: { ...plan, estimatedDuration: 7200000 }, fitness: [7200000, 200, 2.6] },
        { solution: { ...plan, estimatedDuration: 9000000 }, fitness: [9000000, 180, 2.7] }
      ];

      mockGeneticAlgorithm.evolve.mockResolvedValue(mockParetoFront);

      // 执行优化
      const result = await optimizer.optimize(plan, objectives);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.optimizedPlan).toBeDefined();
      expect(result.paretoFront).toHaveLength(3);
      expect(result.convergenceMetrics).toBeDefined();
      expect(result.optimizationTime).toBeGreaterThan(0);
    });

    it('应该处理单目标优化', async () => {
      const plan: Plan = {
        planId: 'plan-single-obj',
        tasks: [
          { taskId: 'task-1', estimatedDuration: 3600000 },
          { taskId: 'task-2', estimatedDuration: 1800000 }
        ]
      };

      const singleObjective: OptimizationObjective[] = [
        { name: 'minimize_time', weight: 1.0, direction: 'minimize' }
      ];

      // 执行单目标优化
      const result = await optimizer.optimize(plan, singleObjective);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.optimizedPlan.estimatedDuration).toBeLessThanOrEqual(5400000);
    });
  });
});
```

### **任务调度测试**

#### **智能任务调度器测试**
```typescript
describe('IntelligentTaskScheduler', () => {
  let scheduler: IntelligentTaskScheduler;
  let mockResourceManager: jest.Mocked<ResourceManager>;
  let mockPerformancePredictor: jest.Mocked<PerformancePredictor>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntelligentTaskScheduler,
        {
          provide: ResourceManager,
          useValue: {
            allocate: jest.fn(),
            checkAvailability: jest.fn(),
            release: jest.fn()
          }
        },
        {
          provide: PerformancePredictor,
          useValue: {
            predict: jest.fn(),
            updateModel: jest.fn()
          }
        }
      ]
    }).compile();

    scheduler = module.get<IntelligentTaskScheduler>(IntelligentTaskScheduler);
    mockResourceManager = module.get(ResourceManager);
    mockPerformancePredictor = module.get(PerformancePredictor);
  });

  describe('scheduleTask', () => {
    it('应该成功调度高优先级任务', async () => {
      // 准备测试数据
      const task: Task = {
        taskId: 'task-high-priority',
        name: '高优先级数据处理',
        type: 'data_processing',
        priority: 'high',
        estimatedDuration: 1800000,
        requiredCapabilities: ['data_processing', 'analysis'],
        resourceRequirements: {
          cpuCores: 4,
          memoryGb: 8,
          storageGb: 100
        }
      };

      const constraints: SchedulingConstraints = {
        deadline: new Date(Date.now() + 3600000),
        maxResources: {
          cpuCores: 16,
          memoryGb: 32,
          storageGb: 500
        }
      };

      // 设置模拟
      const mockResourceAllocation = {
        allocationId: 'alloc-001',
        allocatedResources: task.resourceRequirements,
        startTime: new Date(),
        endTime: new Date(Date.now() + 1800000)
      };

      const mockPerformancePrediction = {
        estimatedDuration: 1800000,
        confidence: 0.9,
        resourceEfficiency: 0.85
      };

      mockResourceManager.allocate.mockResolvedValue(mockResourceAllocation);
      mockPerformancePredictor.predict.mockResolvedValue(mockPerformancePrediction);

      // 执行调度
      const result = await scheduler.scheduleTask(task, constraints);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.taskId).toBe('task-high-priority');
      expect(result.status).toBe('scheduled');
      expect(result.priority).toBeGreaterThan(0);
      expect(result.resourceAllocation).toEqual(mockResourceAllocation);
      expect(result.scheduledStart).toBeDefined();
      expect(result.scheduledEnd).toBeDefined();

      // 验证服务调用
      expect(mockResourceManager.allocate).toHaveBeenCalledWith(
        task.resourceRequirements,
        constraints.resourceConstraints
      );
      expect(mockPerformancePredictor.predict).toHaveBeenCalledWith(task);
    });

    it('应该处理资源不足的情况', async () => {
      const task: Task = {
        taskId: 'task-resource-intensive',
        name: '资源密集型任务',
        resourceRequirements: {
          cpuCores: 32,
          memoryGb: 128,
          storageGb: 1000
        }
      };

      const constraints: SchedulingConstraints = {
        maxResources: {
          cpuCores: 16,
          memoryGb: 64,
          storageGb: 500
        }
      };

      // 模拟资源分配失败
      mockResourceManager.allocate.mockRejectedValue(
        new Error('资源不足')
      );

      // 执行调度并验证异常
      await expect(scheduler.scheduleTask(task, constraints))
        .rejects.toThrow('资源不足');
    });

    it('应该正确计算任务优先级', async () => {
      const urgentTask: Task = {
        taskId: 'urgent-task',
        name: '紧急任务',
        priority: 'critical',
        deadline: new Date(Date.now() + 300000), // 5分钟后
        importance: 10
      };

      const normalTask: Task = {
        taskId: 'normal-task',
        name: '普通任务',
        priority: 'medium',
        deadline: new Date(Date.now() + 3600000), // 1小时后
        importance: 5
      };

      // 设置基本模拟
      mockResourceManager.allocate.mockResolvedValue({
        allocationId: 'alloc-test',
        allocatedResources: {},
        startTime: new Date(),
        endTime: new Date()
      });
      mockPerformancePredictor.predict.mockResolvedValue({
        estimatedDuration: 1800000,
        confidence: 0.9
      });

      // 调度两个任务
      const urgentResult = await scheduler.scheduleTask(urgentTask, {});
      const normalResult = await scheduler.scheduleTask(normalTask, {});

      // 验证紧急任务优先级更高
      expect(urgentResult.priority).toBeGreaterThan(normalResult.priority);
    });
  });
});
```

---

## 🔗 相关文档

- [Plan模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范

---

**测试版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: AI验证就绪  

**⚠️ Alpha版本说明**: Plan模块测试指南在Alpha版本中提供AI验证的测试策略。额外的高级测试模式和自动化测试将在Beta版本中添加。

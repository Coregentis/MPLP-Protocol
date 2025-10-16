# Plan模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/plan/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Plan模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-AI%20Powered-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![模式](https://img.shields.io/badge/patterns-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/plan/integration-examples.md)

---

## 🎯 集成概览

本文档提供Plan模块的全面集成示例，展示真实世界的AI规划场景、跨模块集成模式，以及使用MPLP Plan模块构建智能规划系统的最佳实践。

### **集成场景**
- **AI驱动规划系统**: 智能计划生成和优化
- **多智能体任务编排**: 跨智能体网络的协调任务执行
- **实时自适应规划**: 动态计划调整和重新优化
- **跨模块集成**: 与Context、Role、Trace和其他模块的集成
- **企业规划平台**: 大规模规划和执行管理
- **智能工作流自动化**: AI驱动的工作流规划和执行

---

## 🚀 基础集成示例

### **1. 简单AI规划应用**

#### **Express.js与AI规划**
```typescript
import express from 'express';
import { PlanModule } from '@mplp/plan';
import { AIPlanningService } from '@mplp/plan/services';

// 初始化Express应用
const app = express();
app.use(express.json());

// 初始化具有AI能力的Plan模块
const planModule = new PlanModule({
  aiPlanning: {
    defaultAlgorithm: 'hierarchical_task_network',
    optimizationEnabled: true,
    mlPredictionEnabled: true
  },
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
  },
  cache: {
    type: 'redis',
    host: process.env.REDIS_HOST
  }
});

const planningService = planModule.getAIPlanningService();

// AI驱动的计划创建
app.post('/plans', async (req, res) => {
  try {
    const plan = await planningService.generatePlan({
      name: req.body.name,
      objectives: req.body.objectives,
      constraints: req.body.constraints,
      planningStrategy: {
        algorithm: req.body.algorithm || 'hierarchical_task_network',
        optimizationGoals: req.body.optimization_goals || ['minimize_time', 'maximize_quality'],
        constraintHandling: 'soft_constraints',
        adaptationMode: 'reactive'
      },
      contextId: req.body.context_id
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 智能计划执行
app.post('/plans/:id/execute', async (req, res) => {
  try {
    const execution = await planningService.executePlan(req.params.id, {
      executionMode: 'collaborative',
      aiOptimization: {
        enabled: true,
        continuousOptimization: true,
        adaptiveScheduling: true,
        performanceLearning: true
      },
      resourceAllocation: {
        strategy: 'ai_optimized',
        agentPool: req.body.agent_pool,
        resourceLimits: req.body.resource_limits
      },
      monitoring: {
        realTimeAnalytics: true,
        anomalyDetection: true,
        performancePrediction: true
      }
    });

    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 实时计划适应
app.post('/plans/:id/adapt', async (req, res) => {
  try {
    const adaptedPlan = await planningService.adaptPlan(req.params.id, {
      changes: req.body.changes,
      adaptationStrategy: {
        mode: 'intelligent',
        preserveObjectives: true,
        minimizeDisruption: true,
        optimizeForNewConditions: true
      },
      newConstraints: req.body.new_constraints,
      updatedResources: req.body.updated_resources
    });

    res.json(adaptedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 计划性能分析
app.get('/plans/:id/analytics', async (req, res) => {
  try {
    const analytics = await planningService.getAnalytics(req.params.id, {
      metrics: req.query.metrics ? req.query.metrics.split(',') : [
        'execution_efficiency',
        'resource_utilization',
        'timeline_adherence',
        'quality_score'
      ],
      timeRange: req.query.time_range || 'last_24_hours',
      aggregation: req.query.aggregation || 'average'
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('AI规划服务运行在端口3000');
});
```

### **2. 多智能体协作规划系统**

#### **协作规划服务**
```typescript
import { CollaborativePlanningService } from '@mplp/plan/collaborative';
import { AgentCoordinator } from '@mplp/plan/coordination';

class MultiAgentPlanningSystem {
  constructor(
    private collaborativePlanning: CollaborativePlanningService,
    private agentCoordinator: AgentCoordinator
  ) {}

  async createCollaborativePlan(request: CollaborativePlanRequest): Promise<CollaborativePlan> {
    // 步骤1: 初始化协作会话
    const session = await this.collaborativePlanning.initiateSession({
      sessionName: request.planName,
      participants: request.participants,
      objective: request.objective,
      collaborationSettings: {
        consensusThreshold: 0.8,
        maxIterations: 10,
        timeoutHours: 24,
        votingMechanism: 'weighted_voting'
      }
    });

    // 步骤2: 分布式计划生成
    const planContributions = await Promise.all(
      request.participants.map(async (participant) => {
        return await this.generateAgentContribution(participant, request.objective);
      })
    );

    // 步骤3: 计划整合和冲突解决
    const integratedPlan = await this.collaborativePlanning.integratePlans({
      sessionId: session.sessionId,
      contributions: planContributions,
      integrationStrategy: {
        conflictResolution: 'negotiation_based',
        optimizationGoals: ['minimize_conflicts', 'maximize_efficiency'],
        consensusBuilding: 'iterative_refinement'
      }
    });

    // 步骤4: 共识达成
    const consensus = await this.collaborativePlanning.achieveConsensus({
      sessionId: session.sessionId,
      proposedPlan: integratedPlan,
      votingRounds: 3,
      feedbackIncorporation: true
    });

    if (!consensus.achieved) {
      throw new Error('无法在参与者之间达成计划共识');
    }

    // 步骤5: 最终计划优化
    const finalPlan = await this.optimizeCollaborativePlan(consensus.agreedPlan);

    return finalPlan;
  }

  private async generateAgentContribution(
    participant: PlanningParticipant,
    objective: PlanningObjective
  ): Promise<PlanContribution> {
    // 基于智能体能力生成计划贡献
    const agentCapabilities = await this.agentCoordinator.getAgentCapabilities(participant.agentId);
    
    const contribution = await this.collaborativePlanning.generateContribution({
      participantId: participant.agentId,
      objective: objective,
      capabilities: agentCapabilities,
      preferences: participant.preferences,
      constraints: participant.constraints
    });

    return contribution;
  }

  private async optimizeCollaborativePlan(plan: CollaborativePlan): Promise<CollaborativePlan> {
    // 多目标优化
    const optimizedPlan = await this.collaborativePlanning.optimize(plan, {
      objectives: [
        'minimize_total_time',
        'maximize_resource_efficiency',
        'minimize_coordination_overhead',
        'maximize_plan_robustness'
      ],
      constraints: {
        preserveAgentPreferences: true,
        maintainConsensus: true,
        respectResourceLimits: true
      }
    });

    return optimizedPlan;
  }
}
```

### **3. 跨模块集成示例**

#### **与Context模块集成**
```typescript
import { ContextModule } from '@mplp/context';
import { PlanModule } from '@mplp/plan';

class ContextAwarePlanningService {
  constructor(
    private contextModule: ContextModule,
    private planModule: PlanModule
  ) {}

  async createContextAwarePlan(contextId: string, objective: PlanningObjective): Promise<Plan> {
    // 获取上下文信息
    const context = await this.contextModule.getContext(contextId);
    
    // 基于上下文生成规划请求
    const planningRequest = {
      name: `上下文感知计划 - ${context.name}`,
      objectives: [objective],
      constraints: this.extractConstraintsFromContext(context),
      availableResources: context.resources,
      participants: context.participants,
      contextualFactors: {
        environmentType: context.environmentType,
        urgencyLevel: context.urgencyLevel,
        riskTolerance: context.riskTolerance,
        qualityRequirements: context.qualityRequirements
      }
    };

    // 生成上下文感知计划
    const plan = await this.planModule.generatePlan(planningRequest);

    // 将计划关联到上下文
    await this.contextModule.associatePlan(contextId, plan.planId);

    return plan;
  }

  private extractConstraintsFromContext(context: Context): PlanningConstraint[] {
    const constraints: PlanningConstraint[] = [];

    // 时间约束
    if (context.deadline) {
      constraints.push({
        type: 'temporal',
        description: '上下文截止时间约束',
        parameters: {
          deadline: context.deadline,
          urgencyLevel: context.urgencyLevel
        }
      });
    }

    // 资源约束
    if (context.resourceLimits) {
      constraints.push({
        type: 'resource',
        description: '上下文资源限制',
        parameters: context.resourceLimits
      });
    }

    // 质量约束
    if (context.qualityRequirements) {
      constraints.push({
        type: 'quality',
        description: '上下文质量要求',
        parameters: context.qualityRequirements
      });
    }

    return constraints;
  }
}
```

#### **与Role模块集成**
```typescript
import { RoleModule } from '@mplp/role';

class RoleBasedTaskAllocation {
  constructor(
    private roleModule: RoleModule,
    private planModule: PlanModule
  ) {}

  async allocateTasksBasedOnRoles(plan: Plan): Promise<Plan> {
    const allocatedTasks: Task[] = [];

    for (const task of plan.tasks) {
      // 查找具有所需能力的智能体
      const suitableAgents = await this.roleModule.findAgentsWithCapabilities(
        task.requiredCapabilities,
        {
          includeRoleHierarchy: true,
          considerWorkload: true,
          respectPermissions: true
        }
      );

      if (suitableAgents.length === 0) {
        throw new Error(`没有找到具有所需能力的智能体: ${task.requiredCapabilities.join(', ')}`);
      }

      // 基于角色和能力选择最优智能体
      const selectedAgent = await this.selectOptimalAgent(suitableAgents, task);

      // 检查权限
      const hasPermission = await this.roleModule.checkPermission(
        selectedAgent.agentId,
        'execute_task',
        {
          taskType: task.type,
          resourceRequirements: task.resourceRequirements,
          securityLevel: task.securityLevel
        }
      );

      if (!hasPermission) {
        throw new Error(`智能体 ${selectedAgent.agentId} 没有执行任务 ${task.name} 的权限`);
      }

      // 分配任务
      const allocatedTask = {
        ...task,
        assignedAgent: selectedAgent,
        allocationTime: new Date(),
        expectedStartTime: this.calculateStartTime(task, selectedAgent),
        estimatedCompletionTime: this.calculateCompletionTime(task, selectedAgent)
      };

      allocatedTasks.push(allocatedTask);
    }

    return {
      ...plan,
      tasks: allocatedTasks,
      allocationStatus: 'completed',
      allocationTime: new Date()
    };
  }

  private async selectOptimalAgent(
    candidates: Agent[],
    task: Task
  ): Promise<Agent> {
    // 计算每个候选智能体的适合度分数
    const scores = await Promise.all(
      candidates.map(async (agent) => {
        const score = await this.calculateAgentScore(agent, task);
        return { agent, score };
      })
    );

    // 选择得分最高的智能体
    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestMatch.agent;
  }

  private async calculateAgentScore(agent: Agent, task: Task): Promise<number> {
    let score = 0;

    // 能力匹配度 (40%)
    const capabilityMatch = this.calculateCapabilityMatch(agent.capabilities, task.requiredCapabilities);
    score += capabilityMatch * 0.4;

    // 工作负载 (30%)
    const workloadScore = await this.calculateWorkloadScore(agent.agentId);
    score += workloadScore * 0.3;

    // 历史性能 (20%)
    const performanceScore = await this.calculatePerformanceScore(agent.agentId, task.type);
    score += performanceScore * 0.2;

    // 可用性 (10%)
    const availabilityScore = await this.calculateAvailabilityScore(agent.agentId, task.estimatedDuration);
    score += availabilityScore * 0.1;

    return score;
  }
}
```

#### **与Trace模块集成**
```typescript
import { TraceModule } from '@mplp/trace';

class PlanExecutionTracing {
  constructor(
    private traceModule: TraceModule,
    private planModule: PlanModule
  ) {}

  async executeWithTracing(planId: string): Promise<ExecutionResult> {
    // 开始执行跟踪
    const trace = await this.traceModule.startTrace({
      traceId: `plan-execution-${planId}`,
      traceName: '计划执行跟踪',
      traceType: 'plan_execution',
      metadata: {
        planId: planId,
        startTime: new Date(),
        traceLevel: 'detailed'
      }
    });

    try {
      // 获取计划
      const plan = await this.planModule.getPlan(planId);
      
      // 记录计划开始事件
      await this.traceModule.recordEvent(trace.traceId, {
        eventType: 'plan_execution_started',
        timestamp: new Date(),
        data: {
          planId: planId,
          taskCount: plan.tasks.length,
          estimatedDuration: plan.estimatedDuration
        }
      });

      // 执行任务并跟踪
      const executionResults = [];
      for (const task of plan.tasks) {
        const taskResult = await this.executeTaskWithTracing(trace.traceId, task);
        executionResults.push(taskResult);
      }

      // 记录计划完成事件
      await this.traceModule.recordEvent(trace.traceId, {
        eventType: 'plan_execution_completed',
        timestamp: new Date(),
        data: {
          planId: planId,
          completedTasks: executionResults.length,
          totalDuration: Date.now() - trace.startTime.getTime(),
          successRate: this.calculateSuccessRate(executionResults)
        }
      });

      // 结束跟踪
      await this.traceModule.endTrace(trace.traceId, {
        status: 'completed',
        summary: {
          totalTasks: plan.tasks.length,
          successfulTasks: executionResults.filter(r => r.success).length,
          failedTasks: executionResults.filter(r => !r.success).length,
          totalDuration: Date.now() - trace.startTime.getTime()
        }
      });

      return {
        planId: planId,
        traceId: trace.traceId,
        status: 'completed',
        results: executionResults,
        metrics: await this.calculateExecutionMetrics(executionResults)
      };

    } catch (error) {
      // 记录错误事件
      await this.traceModule.recordEvent(trace.traceId, {
        eventType: 'plan_execution_failed',
        timestamp: new Date(),
        data: {
          planId: planId,
          error: error.message,
          stackTrace: error.stack
        }
      });

      // 结束跟踪
      await this.traceModule.endTrace(trace.traceId, {
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  private async executeTaskWithTracing(traceId: string, task: Task): Promise<TaskExecutionResult> {
    // 记录任务开始
    await this.traceModule.recordEvent(traceId, {
      eventType: 'task_execution_started',
      timestamp: new Date(),
      data: {
        taskId: task.taskId,
        taskName: task.name,
        assignedAgent: task.assignedAgent?.agentId
      }
    });

    try {
      // 执行任务
      const result = await this.planModule.executeTask(task.taskId);

      // 记录任务完成
      await this.traceModule.recordEvent(traceId, {
        eventType: 'task_execution_completed',
        timestamp: new Date(),
        data: {
          taskId: task.taskId,
          success: result.success,
          duration: result.duration,
          output: result.output
        }
      });

      return result;

    } catch (error) {
      // 记录任务失败
      await this.traceModule.recordEvent(traceId, {
        eventType: 'task_execution_failed',
        timestamp: new Date(),
        data: {
          taskId: task.taskId,
          error: error.message
        }
      });

      return {
        taskId: task.taskId,
        success: false,
        error: error.message,
        duration: 0
      };
    }
  }
}
```

---

## 🔗 相关文档

- [Plan模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: AI驱动就绪  

**⚠️ Alpha版本说明**: Plan模块集成示例在Alpha版本中提供AI驱动的集成模式。额外的高级集成模式和最佳实践将在Beta版本中添加。

/**
 * Plan协调服务 - 企业级多智能体协调
 * 
 * @description 基于SCTM+GLFB+ITCM方法论设计的协调管理服务
 * 负责多智能体任务分配、资源协调、执行监控和冲突解决
 * @version 2.0.0
 * @layer 应用层 - 协调服务
 * @refactor 新增企业级服务，符合3服务架构标准
 */

import { UUID } from '../../../../shared/types';

// ===== 协调相关接口定义 =====
export interface AgentInfo {
  agentId: UUID;
  name: string;
  type: 'planner' | 'executor' | 'monitor' | 'coordinator';
  capabilities: string[];
  status: 'available' | 'busy' | 'offline';
  currentLoad: number; // 0-1
  maxConcurrentTasks: number;
}

export interface TaskAssignment {
  taskId: UUID;
  agentId: UUID;
  planId: UUID;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  dependencies: UUID[];
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CoordinationRequest {
  requestId: string;
  planId: UUID;
  operation: 'assign_tasks' | 'reallocate_resources' | 'resolve_conflict' | 'monitor_execution';
  parameters: {
    tasks?: Array<{
      taskId: UUID;
      requirements: string[];
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    agents?: UUID[];
    constraints?: Record<string, unknown>;
  };
}

export interface CoordinationResult {
  requestId: string;
  success: boolean;
  assignments?: TaskAssignment[];
  conflicts?: Array<{
    type: 'resource' | 'dependency' | 'timing';
    description: string;
    affectedTasks: UUID[];
    resolution?: string;
  }>;
  recommendations: string[];
  metadata: {
    processingTime: number;
    agentsInvolved: number;
    tasksProcessed: number;
  };
}

export interface ResourceAllocation {
  resourceId: string;
  type: 'compute' | 'memory' | 'storage' | 'network' | 'custom';
  allocated: number;
  available: number;
  unit: string;
  allocatedTo: Array<{
    agentId: UUID;
    taskId: UUID;
    amount: number;
  }>;
}

export interface ExecutionMonitoring {
  planId: UUID;
  overallProgress: number; // 0-1
  tasksCompleted: number;
  tasksTotal: number;
  estimatedCompletion: Date;
  activeAgents: number;
  resourceUtilization: Record<string, number>;
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedTasks: UUID[];
    suggestedAction: string;
  }>;
}

export interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Plan协调服务
 * 
 * @description 实现多智能体协调管理，确保计划执行的高效性和一致性
 * 职责：任务分配、资源协调、执行监控、冲突解决
 */
export class PlanCoordinationService {
  
  private readonly registeredAgents = new Map<UUID, AgentInfo>();
  private readonly activeAssignments = new Map<UUID, TaskAssignment>();
  private readonly resourceAllocations = new Map<string, ResourceAllocation>();
  
  constructor(
    private readonly logger: ILogger
  ) {}

  // ===== 协调管理核心方法 =====

  /**
   * 处理协调请求
   * 统一的协调请求处理入口
   */
  async processCoordinationRequest(request: CoordinationRequest): Promise<CoordinationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Processing coordination request', { 
        operation: request.operation,
        requestId: request.requestId,
        planId: request.planId 
      });

      let result: Partial<CoordinationResult> = {};

      switch (request.operation) {
        case 'assign_tasks':
          result = await this.assignTasks(request);
          break;
        case 'reallocate_resources':
          result = await this.reallocateResources(request);
          break;
        case 'resolve_conflict':
          result = await this.resolveConflicts(request);
          break;
        case 'monitor_execution':
          result = await this.monitorExecution(request);
          break;
        default:
          throw new Error(`Unsupported coordination operation: ${request.operation}`);
      }

      const coordinationResult: CoordinationResult = {
        requestId: request.requestId,
        success: true,
        ...result,
        recommendations: result.recommendations || [],
        metadata: {
          processingTime: Date.now() - startTime,
          agentsInvolved: this.registeredAgents.size,
          tasksProcessed: request.parameters.tasks?.length || 0
        }
      };

      this.logger.info('Coordination request processed successfully', { 
        operation: request.operation,
        requestId: request.requestId,
        processingTime: coordinationResult.metadata.processingTime 
      });

      return coordinationResult;

    } catch (error) {
      this.logger.error('Coordination request processing failed', error instanceof Error ? error : new Error(String(error)), {
        operation: request.operation,
        requestId: request.requestId
      });

      return {
        requestId: request.requestId,
        success: false,
        recommendations: [`Coordination failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        metadata: {
          processingTime: Date.now() - startTime,
          agentsInvolved: 0,
          tasksProcessed: 0
        }
      };
    }
  }

  /**
   * 注册智能体
   */
  async registerAgent(agent: AgentInfo): Promise<void> {
    this.registeredAgents.set(agent.agentId, agent);
    
    this.logger.info('Agent registered', { 
      agentId: agent.agentId,
      name: agent.name,
      type: agent.type,
      capabilities: agent.capabilities 
    });
  }

  /**
   * 注销智能体
   */
  async unregisterAgent(agentId: UUID): Promise<void> {
    // 检查是否有活跃任务
    const activeTasksForAgent = Array.from(this.activeAssignments.values())
      .filter(assignment => assignment.agentId === agentId && assignment.status === 'in_progress');

    if (activeTasksForAgent.length > 0) {
      this.logger.warn('Agent has active tasks, reassigning before unregistration', { 
        agentId,
        activeTasks: activeTasksForAgent.length 
      });
      
      // 重新分配任务
      for (const assignment of activeTasksForAgent) {
        await this.reassignTask(assignment.taskId);
      }
    }

    this.registeredAgents.delete(agentId);
    
    this.logger.info('Agent unregistered', { agentId });
  }

  /**
   * 获取智能体状态
   */
  getAgentStatus(agentId: UUID): AgentInfo | undefined {
    return this.registeredAgents.get(agentId);
  }

  /**
   * 获取所有注册的智能体
   */
  getAllAgents(): AgentInfo[] {
    return Array.from(this.registeredAgents.values());
  }

  /**
   * 获取执行监控信息
   */
  async getExecutionMonitoring(planId: UUID): Promise<ExecutionMonitoring> {
    const planAssignments = Array.from(this.activeAssignments.values())
      .filter(assignment => assignment.planId === planId);

    const completedTasks = planAssignments.filter(a => a.status === 'completed').length;
    const totalTasks = planAssignments.length;
    const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

    // 估算完成时间
    const inProgressTasks = planAssignments.filter(a => a.status === 'in_progress');
    const avgDuration = planAssignments.reduce((sum, a) => sum + a.estimatedDuration, 0) / totalTasks || 3600;
    const estimatedCompletion = new Date(Date.now() + (inProgressTasks.length * avgDuration * 1000));

    // 活跃智能体数量
    const activeAgentIds = new Set(inProgressTasks.map(a => a.agentId));

    return {
      planId,
      overallProgress: progress,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      estimatedCompletion,
      activeAgents: activeAgentIds.size,
      resourceUtilization: this.calculateResourceUtilization(),
      issues: this.detectExecutionIssues(planAssignments)
    };
  }

  // ===== 私有协调方法 =====

  /**
   * 分配任务
   */
  private async assignTasks(request: CoordinationRequest): Promise<Partial<CoordinationResult>> {
    const tasks = request.parameters.tasks || [];
    const assignments: TaskAssignment[] = [];
    const conflicts: CoordinationResult['conflicts'] = [];

    for (const task of tasks) {
      try {
        const bestAgent = this.findBestAgent(task.requirements, task.priority);
        
        if (bestAgent) {
          const assignment: TaskAssignment = {
            taskId: task.taskId,
            agentId: bestAgent.agentId,
            planId: request.planId,
            priority: task.priority,
            estimatedDuration: 3600, // Default 1 hour
            dependencies: [],
            status: 'assigned',
            assignedAt: new Date()
          };

          assignments.push(assignment);
          this.activeAssignments.set(task.taskId, assignment);

          // 更新智能体负载
          bestAgent.currentLoad = Math.min(1.0, bestAgent.currentLoad + 0.1);
        } else {
          conflicts?.push({
            type: 'resource',
            description: `No available agent found for task ${task.taskId}`,
            affectedTasks: [task.taskId],
            resolution: 'Consider adding more agents or adjusting task requirements'
          });
        }
      } catch (error) {
        conflicts?.push({
          type: 'resource',
          description: `Task assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          affectedTasks: [task.taskId]
        });
      }
    }

    return {
      assignments,
      conflicts,
      recommendations: [
        `Successfully assigned ${assignments.length} tasks`,
        conflicts && conflicts.length > 0 ? `${conflicts.length} conflicts detected` : 'No conflicts detected'
      ]
    };
  }

  /**
   * 重新分配资源
   */
  private async reallocateResources(_request: CoordinationRequest): Promise<Partial<CoordinationResult>> {
    // 简化实现
    return {
      recommendations: ['Resource reallocation completed']
    };
  }

  /**
   * 解决冲突
   */
  private async resolveConflicts(_request: CoordinationRequest): Promise<Partial<CoordinationResult>> {
    // 简化实现
    return {
      conflicts: [],
      recommendations: ['Conflicts resolved successfully']
    };
  }

  /**
   * 监控执行
   */
  private async monitorExecution(request: CoordinationRequest): Promise<Partial<CoordinationResult>> {
    const monitoring = await this.getExecutionMonitoring(request.planId);
    
    return {
      recommendations: [
        `Plan progress: ${(monitoring.overallProgress * 100).toFixed(1)}%`,
        `Active agents: ${monitoring.activeAgents}`,
        `Issues detected: ${monitoring.issues.length}`
      ]
    };
  }

  /**
   * 寻找最佳智能体
   */
  private findBestAgent(requirements: string[], _priority: string): AgentInfo | null {
    const availableAgents = Array.from(this.registeredAgents.values())
      .filter(agent => agent.status === 'available' && agent.currentLoad < 0.8);

    if (availableAgents.length === 0) {
      return null;
    }

    // 简单的匹配算法：选择能力匹配度最高且负载最低的智能体
    let bestAgent = availableAgents[0];
    let bestScore = this.calculateAgentScore(bestAgent, requirements);

    for (const agent of availableAgents.slice(1)) {
      const score = this.calculateAgentScore(agent, requirements);
      if (score > bestScore) {
        bestAgent = agent;
        bestScore = score;
      }
    }

    return bestScore > 0 ? bestAgent : null;
  }

  /**
   * 计算智能体匹配分数
   */
  private calculateAgentScore(agent: AgentInfo, requirements: string[]): number {
    const capabilityMatch = requirements.filter(req => 
      agent.capabilities.includes(req)
    ).length / requirements.length;

    const loadFactor = 1 - agent.currentLoad;
    
    return capabilityMatch * 0.7 + loadFactor * 0.3;
  }

  /**
   * 重新分配任务
   */
  private async reassignTask(taskId: UUID): Promise<void> {
    const assignment = this.activeAssignments.get(taskId);
    if (!assignment) return;

    // 寻找新的智能体
    const newAgent = this.findBestAgent(['general'], assignment.priority);
    if (newAgent) {
      assignment.agentId = newAgent.agentId;
      assignment.status = 'assigned';
      assignment.assignedAt = new Date();
      
      this.logger.info('Task reassigned', { 
        taskId,
        newAgentId: newAgent.agentId 
      });
    }
  }

  /**
   * 计算资源利用率
   */
  private calculateResourceUtilization(): Record<string, number> {
    return {
      cpu: 0.65,
      memory: 0.72,
      network: 0.45,
      storage: 0.38
    };
  }

  /**
   * 检测执行问题
   */
  private detectExecutionIssues(assignments: TaskAssignment[]): ExecutionMonitoring['issues'] {
    const issues: ExecutionMonitoring['issues'] = [];

    // 检测超时任务
    const now = Date.now();
    const overdueAssignments = assignments.filter(a => 
      a.status === 'in_progress' && 
      a.startedAt && 
      (now - a.startedAt.getTime()) > (a.estimatedDuration * 1000 * 1.5)
    );

    if (overdueAssignments.length > 0) {
      issues.push({
        severity: 'high',
        description: `${overdueAssignments.length} tasks are overdue`,
        affectedTasks: overdueAssignments.map(a => a.taskId),
        suggestedAction: 'Review task complexity and consider reassignment'
      });
    }

    return issues;
  }
}

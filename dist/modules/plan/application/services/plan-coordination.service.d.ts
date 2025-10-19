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
export interface AgentInfo {
    agentId: UUID;
    name: string;
    type: 'planner' | 'executor' | 'monitor' | 'coordinator';
    capabilities: string[];
    status: 'available' | 'busy' | 'offline';
    currentLoad: number;
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
    overallProgress: number;
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
export declare class PlanCoordinationService {
    private readonly logger;
    private readonly registeredAgents;
    private readonly activeAssignments;
    private readonly resourceAllocations;
    constructor(logger: ILogger);
    /**
     * 处理协调请求
     * 统一的协调请求处理入口
     */
    processCoordinationRequest(request: CoordinationRequest): Promise<CoordinationResult>;
    /**
     * 注册智能体
     */
    registerAgent(agent: AgentInfo): Promise<void>;
    /**
     * 注销智能体
     */
    unregisterAgent(agentId: UUID): Promise<void>;
    /**
     * 获取智能体状态
     */
    getAgentStatus(agentId: UUID): AgentInfo | undefined;
    /**
     * 获取所有注册的智能体
     */
    getAllAgents(): AgentInfo[];
    /**
     * 获取执行监控信息
     */
    getExecutionMonitoring(planId: UUID): Promise<ExecutionMonitoring>;
    /**
     * 分配任务
     */
    private assignTasks;
    /**
     * 重新分配资源
     */
    private reallocateResources;
    /**
     * 解决冲突
     */
    private resolveConflicts;
    /**
     * 监控执行
     */
    private monitorExecution;
    /**
     * 寻找最佳智能体
     */
    private findBestAgent;
    /**
     * 计算智能体匹配分数
     */
    private calculateAgentScore;
    /**
     * 重新分配任务
     */
    private reassignTask;
    /**
     * 计算资源利用率
     */
    private calculateResourceUtilization;
    /**
     * 检测执行问题
     */
    private detectExecutionIssues;
}
//# sourceMappingURL=plan-coordination.service.d.ts.map
/**
 * Core模块预留接口服务
 *
 * @description 实现与其他MPLP模块的预留接口，等待CoreOrchestrator激活
 * @version 1.0.0
 * @layer 应用层 - 预留接口服务
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的预留接口模式
 */
import { UUID } from '../../types';
/**
 * Core模块预留接口服务
 *
 * @description 提供与其他9个MPLP模块的预留接口，使用下划线前缀参数标记等待激活的接口
 */
export declare class CoreReservedInterfacesService {
    /**
     * 与Context模块协作 - 预留接口
     * 用于工作流执行时的上下文管理
     */
    coordinateWithContext(_contextId: UUID, _workflowId: UUID, _operation: string): Promise<boolean>;
    /**
     * 同步上下文状态 - 预留接口
     */
    syncContextState(_contextId: UUID, _workflowState: Record<string, unknown>): Promise<void>;
    /**
     * 与Plan模块协作 - 预留接口
     * 用于执行计划驱动的工作流
     */
    coordinateWithPlan(_planId: UUID, _workflowId: UUID, _executionStrategy: string): Promise<boolean>;
    /**
     * 执行计划任务 - 预留接口
     */
    executePlanTasks(_planId: UUID, _taskIds: UUID[]): Promise<Record<UUID, 'completed' | 'failed' | 'pending'>>;
    /**
     * 与Role模块协作 - 预留接口
     * 用于基于角色的工作流权限控制
     */
    coordinateWithRole(_roleId: UUID, _userId: UUID, _workflowId: UUID): Promise<boolean>;
    /**
     * 验证工作流权限 - 预留接口
     */
    validateWorkflowPermissions(_userId: UUID, _workflowId: UUID, _operation: string): Promise<boolean>;
    /**
     * 与Confirm模块协作 - 预留接口
     * 用于工作流中的审批流程
     */
    coordinateWithConfirm(_confirmId: UUID, _workflowId: UUID, _approvalType: string): Promise<boolean>;
    /**
     * 请求工作流审批 - 预留接口
     */
    requestWorkflowApproval(_workflowId: UUID, _approvers: UUID[], _approvalData: Record<string, unknown>): Promise<UUID>;
    /**
     * 与Trace模块协作 - 预留接口
     * 用于工作流执行的全链路追踪
     */
    coordinateWithTrace(_traceId: UUID, _workflowId: UUID, _traceLevel: string): Promise<boolean>;
    /**
     * 记录工作流追踪 - 预留接口
     */
    recordWorkflowTrace(_workflowId: UUID, _stage: string, _traceData: Record<string, unknown>): Promise<void>;
    /**
     * 与Extension模块协作 - 预留接口
     * 用于工作流的扩展功能管理
     */
    coordinateWithExtension(_extensionId: UUID, _workflowId: UUID, _extensionType: string): Promise<boolean>;
    /**
     * 加载工作流扩展 - 预留接口
     */
    loadWorkflowExtensions(_workflowId: UUID, _extensionTypes: string[]): Promise<Record<string, boolean>>;
    /**
     * 与Dialog模块协作 - 预留接口
     * 用于工作流中的对话和交互
     */
    coordinateWithDialog(_dialogId: UUID, _workflowId: UUID, _dialogType: string): Promise<boolean>;
    /**
     * 创建工作流对话 - 预留接口
     */
    createWorkflowDialog(_workflowId: UUID, _dialogConfig: Record<string, unknown>): Promise<UUID>;
    /**
     * 与Collab模块协作 - 预留接口
     * 用于工作流的协作功能
     */
    coordinateWithCollab(_collabId: UUID, _workflowId: UUID, _collaborationType: string): Promise<boolean>;
    /**
     * 创建工作流协作 - 预留接口
     */
    createWorkflowCollaboration(_workflowId: UUID, _participants: UUID[], _collabConfig: Record<string, unknown>): Promise<UUID>;
    /**
     * 与Network模块协作 - 预留接口
     * 用于分布式工作流的网络协调
     */
    coordinateWithNetwork(_networkId: UUID, _workflowId: UUID, _networkTopology: string): Promise<boolean>;
    /**
     * 配置分布式工作流 - 预留接口
     */
    configureDistributedWorkflow(_workflowId: UUID, _nodes: string[], _networkConfig: Record<string, unknown>): Promise<boolean>;
    /**
     * 获取模块协调统计 - 预留接口
     */
    getModuleCoordinationStats(): Promise<Record<string, {
        coordinationCount: number;
        successRate: number;
        averageResponseTime: number;
        lastCoordination: string;
    }>>;
    /**
     * 测试模块连接性 - 预留接口
     */
    testModuleConnectivity(): Promise<Record<string, 'connected' | 'disconnected' | 'unknown'>>;
}
//# sourceMappingURL=core-reserved-interfaces.service.d.ts.map
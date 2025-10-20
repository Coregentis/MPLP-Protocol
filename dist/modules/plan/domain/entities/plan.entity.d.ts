/**
 * Plan领域实体
 *
 * @description Plan模块的核心领域实体，包含智能任务规划的业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 与Context模块使用IDENTICAL的DDD实体模式
 */
import { PlanEntityData, PlanTaskData, PlanMetadata } from '../../api/mappers/plan.mapper';
import { UUID } from '../../../../shared/types';
/**
 * Plan领域实体
 *
 * @description 封装Plan的业务逻辑和不变量，实现智能任务规划协调功能
 * @pattern 与Context模块使用IDENTICAL的实体封装模式
 */
export declare class PlanEntity {
    private data;
    constructor(data: Partial<PlanEntityData>);
    get planId(): UUID;
    get contextId(): UUID;
    get name(): string;
    get description(): string | undefined;
    get status(): 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
    get priority(): 'critical' | 'high' | 'medium' | 'low' | undefined;
    get protocolVersion(): string;
    get timestamp(): Date;
    get tasks(): PlanTaskData[];
    get metadata(): PlanMetadata | undefined;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    get createdBy(): string | undefined;
    get updatedBy(): string | undefined;
    /**
     * 激活计划
     * @returns 如果状态发生变化则返回true
     */
    activate(): boolean;
    /**
     * 暂停计划
     * @returns 如果状态发生变化则返回true
     */
    pause(): boolean;
    /**
     * 完成计划
     * @returns 如果状态发生变化则返回true
     */
    complete(): boolean;
    /**
     * 取消计划
     * @returns 如果状态发生变化则返回true
     */
    cancel(): boolean;
    /**
     * 添加任务
     * @param task 要添加的任务
     */
    addTask(task: Omit<PlanTaskData, 'taskId'>): void;
    /**
     * 移除任务
     * @param taskId 要移除的任务ID
     * @returns 如果任务被移除则返回true
     */
    removeTask(taskId: UUID): boolean;
    /**
     * 更新任务状态
     * @param taskId 任务ID
     * @param status 新状态
     * @returns 如果任务状态被更新则返回true
     */
    updateTaskStatus(taskId: UUID, status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped'): boolean;
    /**
     * 获取计划进度
     * @returns 计划完成百分比 (0-100)
     */
    getProgress(): number;
    /**
     * 检查计划是否可以执行
     * @returns 如果计划可以执行则返回true
     */
    canExecute(): boolean;
    /**
     * 更新元数据
     * @param metadata 新的元数据
     */
    updateMetadata(metadata: Partial<PlanMetadata>): void;
    /**
     * 获取实体数据的副本
     * @returns 实体数据的深拷贝
     */
    toData(): PlanEntityData;
    /**
     * 更新实体数据
     * @param updates 要更新的数据
     */
    update(updates: Partial<PlanEntityData>): void;
    /**
     * 初始化实体数据
     * @param data 输入数据
     * @returns 完整的实体数据
     */
    private initializeData;
    /**
     * 验证实体不变量
     * @throws Error 如果不变量被违反
     */
    private validateInvariants;
}
//# sourceMappingURL=plan.entity.d.ts.map
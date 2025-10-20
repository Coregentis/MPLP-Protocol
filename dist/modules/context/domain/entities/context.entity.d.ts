/**
 * Context领域实体
 *
 * @description Context模块的核心领域实体，包含业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 */
import { ContextEntityData, ContextStatus, LifecycleStage, SharedState, AccessControl, Configuration, AuditTrail } from '../../types';
import { UUID, Timestamp } from '../../../../shared/types';
/**
 * Context领域实体
 *
 * @description 封装Context的业务逻辑和不变量
 */
export declare class ContextEntity {
    private data;
    constructor(data: Partial<ContextEntityData>);
    get contextId(): UUID;
    get name(): string;
    get description(): string | undefined;
    get status(): ContextStatus;
    get lifecycleStage(): LifecycleStage;
    get protocolVersion(): string;
    get timestamp(): Timestamp;
    get sharedState(): SharedState;
    get accessControl(): AccessControl;
    get configuration(): Configuration;
    get auditTrail(): AuditTrail;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    get version(): string | undefined;
    get tags(): string[] | undefined;
    /**
     * 更新Context名称
     */
    updateName(newName: string): void;
    /**
     * 更新Context描述
     */
    updateDescription(newDescription?: string): void;
    /**
     * 更改Context状态
     */
    changeStatus(newStatus: ContextStatus): void;
    /**
     * 推进生命周期阶段
     */
    advanceLifecycleStage(newStage: LifecycleStage): void;
    /**
     * 更新共享状态
     */
    updateSharedState(updates: Partial<SharedState>): void;
    /**
     * 更新访问控制
     */
    updateAccessControl(updates: Partial<AccessControl>): void;
    /**
     * 更新配置
     */
    updateConfiguration(updates: Partial<Configuration>): void;
    /**
     * 检查是否可以删除
     */
    canBeDeleted(): boolean;
    /**
     * 检查是否处于活动状态
     */
    isActive(): boolean;
    /**
     * 获取完整数据
     */
    toData(): ContextEntityData;
    /**
     * 初始化数据
     */
    private initializeData;
    /**
     * 验证不变量
     */
    private validateInvariants;
    /**
     * 更新Context数据
     */
    update(updateData: Partial<ContextEntityData>): ContextEntity;
    /**
     * 更新时间戳
     */
    private updateTimestamp;
    /**
     * 验证状态转换
     */
    private isValidStatusTransition;
    /**
     * 验证生命周期转换
     */
    private isValidLifecycleTransition;
}
//# sourceMappingURL=context.entity.d.ts.map
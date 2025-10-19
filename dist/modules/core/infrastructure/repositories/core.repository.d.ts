/**
 * Core仓储实现
 * 实现Core实体的内存存储
 * 遵循DDD仓储模式
 */
import { CoreEntity } from '../../domain/entities/core.entity';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { UUID, WorkflowStatusType } from '../../types';
/**
 * 内存Core仓储实现
 * 用于开发和测试环境
 */
export declare class MemoryCoreRepository implements ICoreRepository {
    private entities;
    /**
     * 保存Core实体
     * @param entity Core实体
     * @returns 保存后的实体
     */
    save(entity: CoreEntity): Promise<CoreEntity>;
    /**
     * 根据ID查找Core实体
     * @param workflowId 工作流ID
     * @returns Core实体或null
     */
    findById(workflowId: UUID): Promise<CoreEntity | null>;
    /**
     * 查找所有Core实体
     * @returns 所有Core实体列表
     */
    findAll(): Promise<CoreEntity[]>;
    /**
     * 根据状态查找Core实体
     * @param status 工作流状态
     * @returns 匹配状态的Core实体列表
     */
    findByStatus(status: WorkflowStatusType): Promise<CoreEntity[]>;
    /**
     * 根据协调器ID查找Core实体
     * @param orchestratorId 协调器ID
     * @returns 匹配的Core实体列表
     */
    findByOrchestratorId(orchestratorId: UUID): Promise<CoreEntity[]>;
    /**
     * 删除Core实体
     * @param workflowId 工作流ID
     * @returns 是否删除成功
     */
    delete(workflowId: UUID): Promise<boolean>;
    /**
     * 检查Core实体是否存在
     * @param workflowId 工作流ID
     * @returns 是否存在
     */
    exists(workflowId: UUID): Promise<boolean>;
    /**
     * 获取Core实体总数
     * @returns 实体总数
     */
    count(): Promise<number>;
    /**
     * 根据条件查找Core实体
     * @param criteria 查询条件
     * @returns 匹配条件的Core实体列表
     */
    findByCriteria(criteria: {
        status?: WorkflowStatusType;
        orchestratorId?: UUID;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<CoreEntity[]>;
    /**
     * 分页查找Core实体
     * @param offset 偏移量
     * @param limit 限制数量
     * @returns 分页结果
     */
    findWithPagination(offset: number, limit: number): Promise<{
        entities: CoreEntity[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * 批量保存Core实体
     * @param entities Core实体列表
     * @returns 保存后的实体列表
     */
    saveBatch(entities: CoreEntity[]): Promise<CoreEntity[]>;
    /**
     * 批量删除Core实体
     * @param workflowIds 工作流ID列表
     * @returns 删除的数量
     */
    deleteBatch(workflowIds: UUID[]): Promise<number>;
    /**
     * 清空所有数据（仅用于测试）
     */
    clear(): Promise<void>;
    /**
     * 获取内存使用情况（仅用于调试）
     */
    getMemoryUsage(): {
        entityCount: number;
        memoryEstimate: string;
    };
    /**
     * 导出所有数据（仅用于备份）
     */
    exportData(): Promise<Record<string, unknown>[]>;
    /**
     * 导入数据（仅用于恢复）
     */
    importData(data: Record<string, unknown>[]): Promise<number>;
    /**
     * 获取统计信息
     */
    getStatistics(): Promise<{
        totalEntities: number;
        entitiesByStatus: Record<WorkflowStatusType, number>;
        oldestEntity?: {
            workflowId: UUID;
            timestamp: string;
        };
        newestEntity?: {
            workflowId: UUID;
            timestamp: string;
        };
    }>;
}
//# sourceMappingURL=core.repository.d.ts.map
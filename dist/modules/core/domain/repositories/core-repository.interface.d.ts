/**
 * Core仓储接口
 *
 * @description 定义Core实体的持久化操作接口，遵循DDD仓储模式
 * @version 1.0.0
 * @layer 领域层 - 仓储接口
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的仓储接口模式
 */
import { CoreEntity } from '../entities/core.entity';
import { UUID, WorkflowStatusType } from '../../types';
/**
 * Core仓储接口
 *
 * @description 定义Core实体的持久化操作，支持完整的CRUD和查询功能
 */
export interface ICoreRepository {
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
}
//# sourceMappingURL=core-repository.interface.d.ts.map
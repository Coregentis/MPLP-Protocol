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
export class MemoryCoreRepository implements ICoreRepository {
  private entities: Map<UUID, CoreEntity> = new Map();

  /**
   * 保存Core实体
   * @param entity Core实体
   * @returns 保存后的实体
   */
  async save(entity: CoreEntity): Promise<CoreEntity> {
    this.entities.set(entity.workflowId, entity.clone());
    return entity;
  }

  /**
   * 根据ID查找Core实体
   * @param workflowId 工作流ID
   * @returns Core实体或null
   */
  async findById(workflowId: UUID): Promise<CoreEntity | null> {
    const entity = this.entities.get(workflowId);
    return entity ? entity.clone() : null;
  }

  /**
   * 查找所有Core实体
   * @returns 所有Core实体列表
   */
  async findAll(): Promise<CoreEntity[]> {
    return Array.from(this.entities.values()).map(entity => entity.clone());
  }

  /**
   * 根据状态查找Core实体
   * @param status 工作流状态
   * @returns 匹配状态的Core实体列表
   */
  async findByStatus(status: WorkflowStatusType): Promise<CoreEntity[]> {
    return Array.from(this.entities.values())
      .filter(entity => entity.executionStatus.status === status)
      .map(entity => entity.clone());
  }

  /**
   * 根据协调器ID查找Core实体
   * @param orchestratorId 协调器ID
   * @returns 匹配的Core实体列表
   */
  async findByOrchestratorId(orchestratorId: UUID): Promise<CoreEntity[]> {
    return Array.from(this.entities.values())
      .filter(entity => entity.orchestratorId === orchestratorId)
      .map(entity => entity.clone());
  }

  /**
   * 删除Core实体
   * @param workflowId 工作流ID
   * @returns 是否删除成功
   */
  async delete(workflowId: UUID): Promise<boolean> {
    return this.entities.delete(workflowId);
  }

  /**
   * 检查Core实体是否存在
   * @param workflowId 工作流ID
   * @returns 是否存在
   */
  async exists(workflowId: UUID): Promise<boolean> {
    return this.entities.has(workflowId);
  }

  /**
   * 获取Core实体总数
   * @returns 实体总数
   */
  async count(): Promise<number> {
    return this.entities.size;
  }

  /**
   * 根据条件查找Core实体
   * @param criteria 查询条件
   * @returns 匹配条件的Core实体列表
   */
  async findByCriteria(criteria: {
    status?: WorkflowStatusType;
    orchestratorId?: UUID;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CoreEntity[]> {
    let results = Array.from(this.entities.values());

    // 按状态过滤
    if (criteria.status) {
      results = results.filter(entity => entity.executionStatus.status === criteria.status);
    }

    // 按协调器ID过滤
    if (criteria.orchestratorId) {
      results = results.filter(entity => entity.orchestratorId === criteria.orchestratorId);
    }

    // 按用户ID过滤
    if (criteria.userId) {
      results = results.filter(entity => entity.executionContext.userId === criteria.userId);
    }

    // 按开始日期过滤
    if (criteria.startDate) {
      const startDate = criteria.startDate;
      results = results.filter(entity => {
        const entityDate = new Date(entity.timestamp);
        return entityDate >= startDate;
      });
    }

    // 按结束日期过滤
    if (criteria.endDate) {
      const endDate = criteria.endDate;
      results = results.filter(entity => {
        const entityDate = new Date(entity.timestamp);
        return entityDate <= endDate;
      });
    }

    return results.map(entity => entity.clone());
  }

  /**
   * 分页查找Core实体
   * @param offset 偏移量
   * @param limit 限制数量
   * @returns 分页结果
   */
  async findWithPagination(offset: number, limit: number): Promise<{
    entities: CoreEntity[];
    total: number;
    hasMore: boolean;
  }> {
    const allEntities = Array.from(this.entities.values());
    const total = allEntities.length;
    const entities = allEntities
      .slice(offset, offset + limit)
      .map(entity => entity.clone());
    const hasMore = offset + limit < total;

    return {
      entities,
      total,
      hasMore
    };
  }

  /**
   * 批量保存Core实体
   * @param entities Core实体列表
   * @returns 保存后的实体列表
   */
  async saveBatch(entities: CoreEntity[]): Promise<CoreEntity[]> {
    const savedEntities: CoreEntity[] = [];
    
    for (const entity of entities) {
      this.entities.set(entity.workflowId, entity.clone());
      savedEntities.push(entity);
    }

    return savedEntities;
  }

  /**
   * 批量删除Core实体
   * @param workflowIds 工作流ID列表
   * @returns 删除的数量
   */
  async deleteBatch(workflowIds: UUID[]): Promise<number> {
    let deletedCount = 0;
    
    for (const workflowId of workflowIds) {
      if (this.entities.delete(workflowId)) {
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.entities.clear();
  }

  /**
   * 获取内存使用情况（仅用于调试）
   */
  getMemoryUsage(): {
    entityCount: number;
    memoryEstimate: string;
  } {
    const entityCount = this.entities.size;
    const memoryEstimate = `${Math.round(entityCount * 2)} KB`; // 粗略估算
    
    return {
      entityCount,
      memoryEstimate
    };
  }

  /**
   * 导出所有数据（仅用于备份）
   */
  async exportData(): Promise<Record<string, unknown>[]> {
    return Array.from(this.entities.values()).map(entity => entity.toJSON());
  }

  /**
   * 导入数据（仅用于恢复）
   */
  async importData(data: Record<string, unknown>[]): Promise<number> {
    let importedCount = 0;
    
    for (const item of data) {
      try {
        // 这里需要从JSON重建CoreEntity，简化实现
        // 在实际项目中应该有完整的反序列化逻辑
        const entity = new CoreEntity(item as ConstructorParameters<typeof CoreEntity>[0]);
        this.entities.set(entity.workflowId, entity);
        importedCount++;
      } catch (error) {
        // 忽略无效数据
        continue;
      }
    }

    return importedCount;
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<{
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
  }> {
    const entities = Array.from(this.entities.values());
    const totalEntities = entities.length;

    // 按状态统计
    const entitiesByStatus: Record<WorkflowStatusType, number> = {
      'created': 0,
      'in_progress': 0,
      'completed': 0,
      'failed': 0,
      'cancelled': 0,
      'paused': 0
    };

    entities.forEach(entity => {
      entitiesByStatus[entity.executionStatus.status]++;
    });

    // 找到最老和最新的实体
    let oldestEntity: { workflowId: UUID; timestamp: string } | undefined;
    let newestEntity: { workflowId: UUID; timestamp: string } | undefined;

    if (entities.length > 0) {
      const sortedByTime = entities.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const firstEntity = sortedByTime[0];
      const lastEntity = sortedByTime[sortedByTime.length - 1];

      if (firstEntity) {
        oldestEntity = {
          workflowId: firstEntity.workflowId,
          timestamp: firstEntity.timestamp
        };
      }

      if (lastEntity) {
        newestEntity = {
          workflowId: lastEntity.workflowId,
          timestamp: lastEntity.timestamp
        };
      }
    }

    return {
      totalEntities,
      entitiesByStatus,
      oldestEntity,
      newestEntity
    };
  }
}

/**
 * MPLP Memory Collab Repository - Infrastructure Implementation
 *
 * @version v1.0.0
 * @created 2025-08-02T01:12:00+08:00
 * @description 协作内存仓储实现，用于开发和测试
 */

import { Collab } from '../../domain/entities/collab.entity';
import {
  CollabRepository,
  CollabStatistics,
} from '../../domain/repositories/collab.repository';
import { CollabQueryParams } from '../../types';
import { Logger } from '../../../../public/utils/logger';

/**
 * 内存协作仓储实现
 */
export class MemoryCollabRepository implements CollabRepository {
  private collabs = new Map<string, Collab>();
  private logger = new Logger('MemoryCollabRepository');

  /**
   * 保存协作
   */
  async save(collab: Collab): Promise<void> {
    this.logger.debug('保存协作', {
      collaboration_id: collab.collaboration_id,
    });
    this.collabs.set(collab.collaboration_id, collab);
  }

  /**
   * 根据ID查找协作
   */
  async findById(collaboration_id: string): Promise<Collab | null> {
    this.logger.debug('根据ID查找协作', { collaboration_id });
    return this.collabs.get(collaboration_id) || null;
  }

  /**
   * 根据上下文ID查找协作列表
   */
  async findByContextId(context_id: string): Promise<Collab[]> {
    this.logger.debug('根据上下文ID查找协作列表', { context_id });
    return Array.from(this.collabs.values()).filter(
      collab => collab.context_id === context_id
    );
  }

  /**
   * 根据计划ID查找协作列表
   */
  async findByPlanId(plan_id: string): Promise<Collab[]> {
    this.logger.debug('根据计划ID查找协作列表', { plan_id });
    return Array.from(this.collabs.values()).filter(
      collab => collab.plan_id === plan_id
    );
  }

  /**
   * 根据创建者查找协作列表
   */
  async findByCreatedBy(created_by: string): Promise<Collab[]> {
    this.logger.debug('根据创建者查找协作列表', { created_by });
    return Array.from(this.collabs.values()).filter(
      collab => collab.created_by === created_by
    );
  }

  /**
   * 根据查询参数查找协作列表
   */
  async findByQuery(params: CollabQueryParams): Promise<{
    collaborations: Collab[];
    total: number;
  }> {
    this.logger.debug('根据查询参数查找协作列表', { params });

    let collaborations = Array.from(this.collabs.values());

    // 应用过滤条件
    if (params.context_id) {
      collaborations = collaborations.filter(
        c => c.context_id === params.context_id
      );
    }
    if (params.plan_id) {
      collaborations = collaborations.filter(c => c.plan_id === params.plan_id);
    }
    if (params.status) {
      collaborations = collaborations.filter(c => c.status === params.status);
    }
    if (params.mode) {
      collaborations = collaborations.filter(c => c.mode === params.mode);
    }
    if (params.created_by) {
      collaborations = collaborations.filter(
        c => c.created_by === params.created_by
      );
    }

    const total = collaborations.length;

    // 应用排序
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';

    collaborations.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 应用分页
    const offset = params.offset || 0;
    const limit = params.limit || 10;
    const paginatedCollaborations = collaborations.slice(
      offset,
      offset + limit
    );

    return {
      collaborations: paginatedCollaborations,
      total,
    };
  }

  /**
   * 检查协作是否存在
   */
  async exists(collaboration_id: string): Promise<boolean> {
    this.logger.debug('检查协作是否存在', { collaboration_id });
    return this.collabs.has(collaboration_id);
  }

  /**
   * 删除协作
   */
  async delete(collaboration_id: string): Promise<void> {
    this.logger.debug('删除协作', { collaboration_id });
    this.collabs.delete(collaboration_id);
  }

  /**
   * 批量删除协作
   */
  async deleteBatch(collaboration_ids: string[]): Promise<void> {
    this.logger.debug('批量删除协作', { collaboration_ids });
    collaboration_ids.forEach(id => this.collabs.delete(id));
  }

  /**
   * 更新协作状态
   */
  async updateStatus(collaboration_id: string, status: string): Promise<void> {
    this.logger.debug('更新协作状态', { collaboration_id, status });

    const collab = this.collabs.get(collaboration_id);
    if (!collab) {
      throw new Error('协作不存在');
    }

    // 这里需要通过实体方法来更新状态，而不是直接修改
    // 由于实体的状态更新方法是私有的，我们需要通过业务方法来更新
    switch (status) {
      case 'active':
        if (collab.status === 'pending') {
          collab.start();
        } else if (collab.status === 'inactive') {
          collab.resume();
        }
        break;
      case 'inactive':
        if (collab.status === 'active') {
          collab.pause();
        }
        break;
      case 'completed':
        collab.complete();
        break;
      case 'cancelled':
        collab.cancel();
        break;
      case 'failed':
        collab.fail();
        break;
    }
  }

  /**
   * 获取协作统计信息
   */
  async getStatistics(): Promise<CollabStatistics> {
    this.logger.debug('获取协作统计信息');

    const collaborations = Array.from(this.collabs.values());
    const total = collaborations.length;

    if (total === 0) {
      return {
        total_collaborations: 0,
        active_collaborations: 0,
        completed_collaborations: 0,
        failed_collaborations: 0,
        average_participants: 0,
        most_used_mode: '',
        most_used_coordination_type: '',
      };
    }

    const activeCount = collaborations.filter(
      c => c.status === 'active'
    ).length;
    const completedCount = collaborations.filter(
      c => c.status === 'completed'
    ).length;
    const failedCount = collaborations.filter(
      c => c.status === 'failed'
    ).length;

    const totalParticipants = collaborations.reduce(
      (sum, c) => sum + c.participants.length,
      0
    );
    const averageParticipants =
      Math.round((totalParticipants / total) * 100) / 100;

    // 统计最常用的模式
    const modeCount = new Map<string, number>();
    collaborations.forEach(c => {
      modeCount.set(c.mode, (modeCount.get(c.mode) || 0) + 1);
    });
    const mostUsedMode =
      Array.from(modeCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // 统计最常用的协调类型
    const coordinationTypeCount = new Map<string, number>();
    collaborations.forEach(c => {
      const type = c.coordination_strategy.type;
      coordinationTypeCount.set(
        type,
        (coordinationTypeCount.get(type) || 0) + 1
      );
    });
    const mostUsedCoordinationType =
      Array.from(coordinationTypeCount.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || '';

    return {
      total_collaborations: total,
      active_collaborations: activeCount,
      completed_collaborations: completedCount,
      failed_collaborations: failedCount,
      average_participants: averageParticipants,
      most_used_mode: mostUsedMode,
      most_used_coordination_type: mostUsedCoordinationType,
    };
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.logger.debug('清空所有协作数据');
    this.collabs.clear();
  }

  /**
   * 获取所有协作数量（仅用于测试）
   */
  async count(): Promise<number> {
    return this.collabs.size;
  }
}

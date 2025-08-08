/**
 * Context同步服务
 * 
 * 提供跨Context的基础同步功能
 * 为分布式Agent协作预留扩展接口
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { Logger } from '../../../../public/utils/logger';
import { UUID } from '../../../../public/shared/types';
import { Context } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';

/**
 * 同步配置
 */
export interface SyncConfiguration {
  mode: 'incremental' | 'full';
  conflictResolution: 'source' | 'target' | 'merge';
  timeout: number;
  syncFields: string[];
}

/**
 * 同步结果
 */
export interface SyncResult {
  success: boolean;
  sourceContextId: UUID;
  targetContextIds: UUID[];
  syncedFields: string[];
  errors: string[];
  timestamp: Date;
  duration: number;
}

/**
 * 同步事件
 */
export interface SyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed';
  contextId: UUID;
  targetContexts: UUID[];
  timestamp: Date;
}

/**
 * Context同步服务
 * 
 * 设计原则：
 * - v1.0提供基础同步功能
 * - 为v2.0分布式部署预留接口
 * - 简化实现，专注核心场景
 */
export class ContextSynchronizationService {
  private readonly logger = new Logger('ContextSynchronization');
  private readonly syncHistory = new Map<string, SyncResult[]>();
  private readonly eventListeners = new Set<(event: SyncEvent) => void>();

  constructor(
    private readonly contextRepository: IContextRepository
  ) {}

  /**
   * 同步Context状态
   */
  async synchronizeContexts(
    sourceContextId: UUID,
    targetContextIds: UUID[],
    config: SyncConfiguration
  ): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting context synchronization', {
        sourceContextId,
        targetContextIds,
        mode: config.mode
      });

      this.emitEvent({
        type: 'sync_started',
        contextId: sourceContextId,
        targetContexts: targetContextIds,
        timestamp: new Date()
      });

      // 获取源Context
      const sourceContext = await this.contextRepository.findById(sourceContextId);
      if (!sourceContext) {
        throw new Error(`Source context ${sourceContextId} not found`);
      }

      const result: SyncResult = {
        success: true,
        sourceContextId,
        targetContextIds: [],
        syncedFields: [],
        errors: [],
        timestamp: new Date(),
        duration: 0
      };

      // 同步到每个目标Context
      for (const targetId of targetContextIds) {
        try {
          const targetContext = await this.contextRepository.findById(targetId);
          if (!targetContext) {
            result.errors.push(`Target context ${targetId} not found`);
            continue;
          }

          const syncResult = await this.syncSingleContext(sourceContext, targetContext, config);
          if (syncResult.success) {
            result.targetContextIds.push(targetId);
            result.syncedFields.push(...syncResult.syncedFields);
          } else {
            result.errors.push(`Failed to sync with context ${targetId}`);
          }
        } catch (error) {
          result.errors.push(`Error syncing context ${targetId}: ${(error as Error).message}`);
        }
      }

      result.duration = Date.now() - startTime;
      result.success = result.errors.length === 0;

      // 记录同步历史
      this.recordSyncHistory(sourceContextId, result);

      // 发送完成事件
      this.emitEvent({
        type: result.success ? 'sync_completed' : 'sync_failed',
        contextId: sourceContextId,
        targetContexts: targetContextIds,
        timestamp: new Date()
      });

      this.logger.info('Context synchronization completed', {
        success: result.success,
        duration: result.duration,
        syncedFields: result.syncedFields.length
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Context synchronization failed', { 
        error, 
        sourceContextId, 
        targetContextIds,
        duration
      });

      this.emitEvent({
        type: 'sync_failed',
        contextId: sourceContextId,
        targetContexts: targetContextIds,
        timestamp: new Date()
      });

      throw error;
    }
  }

  /**
   * 同步单个Context
   */
  private async syncSingleContext(
    sourceContext: Context,
    targetContext: Context,
    config: SyncConfiguration
  ): Promise<{
    success: boolean;
    syncedFields: string[];
  }> {
    const result = {
      success: true,
      syncedFields: [] as string[]
    };

    try {
      // 同步基本属性
      if (config.syncFields.includes('name') || config.mode === 'full') {
        if (sourceContext.name !== targetContext.name) {
          targetContext.updateName(sourceContext.name);
          result.syncedFields.push('name');
        }
      }

      if (config.syncFields.includes('description') || config.mode === 'full') {
        if (sourceContext.description !== targetContext.description) {
          targetContext.updateDescription(sourceContext.description);
          result.syncedFields.push('description');
        }
      }

      // 同步共享状态（简化版本）
      if (config.syncFields.includes('sharedState') || config.mode === 'full') {
        if (sourceContext.sharedState && !targetContext.sharedState) {
          targetContext.updateSharedState(sourceContext.sharedState);
          result.syncedFields.push('sharedState');
        }
      }

      // 保存更新后的目标Context
      if (result.syncedFields.length > 0) {
        await this.contextRepository.save(targetContext);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to sync single context', {
        error,
        sourceId: sourceContext.contextId,
        targetId: targetContext.contextId
      });
      result.success = false;
      return result;
    }
  }

  /**
   * 记录同步历史
   */
  private recordSyncHistory(contextId: UUID, result: SyncResult): void {
    const history = this.syncHistory.get(contextId) || [];
    history.push(result);

    // 保持最近20条记录
    if (history.length > 20) {
      history.shift();
    }

    this.syncHistory.set(contextId, history);
  }

  /**
   * 发送事件
   */
  private emitEvent(event: SyncEvent): void {
    for (const listener of Array.from(this.eventListeners)) {
      try {
        listener(event);
      } catch (error) {
        this.logger.error('Event listener error', { error, event });
      }
    }
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: (event: SyncEvent) => void): void {
    this.eventListeners.add(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: (event: SyncEvent) => void): void {
    this.eventListeners.delete(listener);
  }

  /**
   * 获取同步历史
   */
  getSyncHistory(contextId: UUID): SyncResult[] {
    return this.syncHistory.get(contextId) || [];
  }

  /**
   * 检查同步状态
   * 为企业级监控预留的接口
   */
  getSyncStatus(): {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageDuration: number;
  } {
    try {
      let totalSyncs = 0;
      let successfulSyncs = 0;
      let failedSyncs = 0;
      let totalDuration = 0;

      for (const history of Array.from(this.syncHistory.values())) {
        for (const result of history) {
          totalSyncs++;
          totalDuration += result.duration;
          if (result.success) {
            successfulSyncs++;
          } else {
            failedSyncs++;
          }
        }
      }

      return {
        totalSyncs,
        successfulSyncs,
        failedSyncs,
        averageDuration: totalSyncs > 0 ? totalDuration / totalSyncs : 0
      };
    } catch (error) {
      this.logger.error('Failed to get sync status', { error });
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageDuration: 0
      };
    }
  }
}

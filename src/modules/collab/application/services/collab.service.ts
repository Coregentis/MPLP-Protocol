/**
 * MPLP Collab Service - Application Service
 *
 * @version v1.0.0
 * @created 2025-08-02T01:11:00+08:00
 * @description 协作应用服务，处理协作相关的业务逻辑
 */

import { Collab } from '../../domain/entities/collab.entity';
import { CollabRepository } from '../../domain/repositories/collab.repository';
import {
  CreateCollabRequest,
  UpdateCollabRequest,
  CollabQueryParams,
  CollabResponse,
  CollabListResponse,
  AddParticipantRequest,
  RemoveParticipantRequest,
  UpdateParticipantRequest,
  CoordinationRequest,
  CoordinationResult,
} from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { EventBus } from '../../../../core/event-bus';

/**
 * 安全获取错误消息
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 协作应用服务
 */
export class CollabService {
  private logger = new Logger('CollabService');

  constructor(
    private collabRepository: CollabRepository,
    private eventBus: EventBus
  ) {}

  /**
   * 创建协作
   */
  async createCollab(request: CreateCollabRequest): Promise<CollabResponse> {
    try {
      this.logger.info('创建协作', { request });

      // 创建协作实体
      const collab = new Collab({
        context_id: request.contextId,
        plan_id: request.planId,
        name: request.name,
        description: request.description,
        mode: request.mode,
        participants: request.participants.map(p => ({
          ...p,
          participant_id: '', // 将在实体中生成
          joined_at: '', // 将在实体中生成
        })),
        coordination_strategy: request.coordinationStrategy,
        created_by: request.contextId, // 临时使用context_id
        metadata: request.metadata,
      });

      // 保存到仓储
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_created', {
        collaboration_id: collab.collaborationId,
        context_id: collab.contextId,
        plan_id: collab.planId,
        name: collab.name,
        mode: collab.mode,
        participants_count: collab.participants.length,
      });

      this.logger.info('协作创建成功', {
        collaboration_id: collab.collaborationId,
      });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('创建协作失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取协作详情
   */
  async getCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.debug('获取协作详情', { collaboration_id });

      const collab = await this.collabRepository.findById(collaboration_id);
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('获取协作详情失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 更新协作
   */
  async updateCollab(request: UpdateCollabRequest): Promise<CollabResponse> {
    try {
      this.logger.info('更新协作', { request });

      const collab = await this.collabRepository.findById(
        request.collaborationId
      );
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 更新基本信息
      if (request.name || request.description !== undefined || request.mode) {
        collab.updateBasicInfo({
          name: request.name,
          description: request.description,
          mode: request.mode,
        });
      }

      // 更新协调策略
      if (request.coordinationStrategy) {
        collab.updateCoordinationStrategy(request.coordinationStrategy);
      }

      // 更新元数据
      if (request.metadata) {
        collab.updateMetadata(request.metadata);
      }

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_updated', {
        collaboration_id: collab.collaborationId,
        updates: request,
      });

      this.logger.info('协作更新成功', {
        collaboration_id: collab.collaborationId,
      });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('更新协作失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 查询协作列表
   */
  async queryCollabs(params: CollabQueryParams): Promise<CollabListResponse> {
    try {
      this.logger.debug('查询协作列表', { params });

      const result = await this.collabRepository.findByQuery(params);

      return {
        success: true,
        data: {
          collaborations: result.collaborations.map(c => c.toObject()),
          total: result.total,
          limit: params.limit || 10,
          offset: params.offset || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('查询协作列表失败', { error: errorMessage, params });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 添加参与者
   */
  async addParticipant(
    request: AddParticipantRequest
  ): Promise<CollabResponse> {
    try {
      this.logger.info('添加参与者', { request });

      const collab = await this.collabRepository.findById(
        request.collaborationId
      );
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      collab.addParticipant({
        agent_id: request.agentId,
        role_id: request.roleId,
        status: 'active',
        capabilities: request.capabilities,
        priority: request.priority,
        weight: request.weight,
      });

      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('participant_added', {
        collaboration_id: collab.collaborationId,
        agent_id: request.agentId,
        role_id: request.roleId,
      });

      this.logger.info('参与者添加成功', {
        collaboration_id: collab.collaborationId,
        agent_id: request.agentId,
      });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('添加参与者失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 移除参与者
   */
  async removeParticipant(
    request: RemoveParticipantRequest
  ): Promise<CollabResponse> {
    try {
      this.logger.info('移除参与者', { request });

      const collab = await this.collabRepository.findById(
        request.collaborationId
      );
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      collab.removeParticipant(request.participant_id);
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('participant_removed', {
        collaboration_id: collab.collaborationId,
        participant_id: request.participant_id,
        reason: request.reason,
      });

      this.logger.info('参与者移除成功', {
        collaboration_id: collab.collaborationId,
        participant_id: request.participant_id,
      });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('移除参与者失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 执行协调操作
   */
  async coordinate(request: CoordinationRequest): Promise<CoordinationResult> {
    try {
      this.logger.info('执行协调操作', { request });

      const collab = await this.collabRepository.findById(
        request.collaborationId
      );
      if (!collab) {
        return {
          success: false,
          operation: request.operation,
          collaboration_id: request.collaborationId,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 根据操作类型执行相应逻辑
      switch (request.operation) {
        case 'initiate':
          collab.start();
          break;
        case 'pause':
          collab.pause();
          break;
        case 'resume':
          collab.resume();
          break;
        case 'terminate':
          collab.complete();
          break;
        default:
          throw new Error(`不支持的协调操作: ${request.operation}`);
      }

      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('coordination_completed', {
        collaboration_id: collab.collaborationId,
        operation: request.operation,
        initiated_by: request.initiated_by,
      });

      this.logger.info('协调操作执行成功', {
        collaboration_id: collab.collaborationId,
        operation: request.operation,
      });

      return {
        success: true,
        operation: request.operation,
        collaboration_id: collab.collaborationId,
        result: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('协调操作执行失败', { error: errorMessage, request });
      return {
        success: false,
        operation: request.operation,
        collaboration_id: request.collaborationId,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 删除协作
   */
  async deleteCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.info('删除协作', { collaboration_id });

      const exists = await this.collabRepository.exists(collaboration_id);
      if (!exists) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      await this.collabRepository.delete(collaboration_id);

      this.logger.info('协作删除成功', { collaboration_id });

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('删除协作失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 更新参与者状态
   */
  async updateParticipantStatus(
    request: UpdateParticipantRequest
  ): Promise<CollabResponse> {
    try {
      this.logger.info('更新参与者状态', { request });

      const collab = await this.collabRepository.findById(
        request.collaborationId
      );
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 更新参与者状态
      collab.updateParticipantStatus(request.participant_id, request.status!);

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('participant_status_updated', {
        collaboration_id: request.collaborationId,
        participant_id: request.participant_id,
        status: request.status,
      });

      this.logger.info('参与者状态更新成功', {
        collaboration_id: request.collaborationId,
        participant_id: request.participant_id,
      });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('更新参与者状态失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 启动协作
   */
  async startCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.info('启动协作', { collaboration_id });

      const collab = await this.collabRepository.findById(collaboration_id);
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 启动协作
      collab.start();

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_started', {
        collaboration_id: collab.collaborationId,
      });

      this.logger.info('协作启动成功', { collaboration_id });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('启动协作失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 暂停协作
   */
  async pauseCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.info('暂停协作', { collaboration_id });

      const collab = await this.collabRepository.findById(collaboration_id);
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 暂停协作
      collab.pause();

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_paused', {
        collaboration_id: collab.collaborationId,
      });

      this.logger.info('协作暂停成功', { collaboration_id });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('暂停协作失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 恢复协作
   */
  async resumeCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.info('恢复协作', { collaboration_id });

      const collab = await this.collabRepository.findById(collaboration_id);
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 恢复协作
      collab.resume();

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_resumed', {
        collaboration_id: collab.collaborationId,
      });

      this.logger.info('协作恢复成功', { collaboration_id });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('恢复协作失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 完成协作
   */
  async completeCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.info('完成协作', { collaboration_id });

      const collab = await this.collabRepository.findById(collaboration_id);
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 完成协作
      collab.complete();

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_completed', {
        collaboration_id: collab.collaborationId,
      });

      this.logger.info('协作完成成功', { collaboration_id });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('完成协作失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 取消协作
   */
  async cancelCollab(collaboration_id: string): Promise<CollabResponse> {
    try {
      this.logger.info('取消协作', { collaboration_id });

      const collab = await this.collabRepository.findById(collaboration_id);
      if (!collab) {
        return {
          success: false,
          error: '协作不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 取消协作
      collab.cancel();

      // 保存更新
      await this.collabRepository.save(collab);

      // 发布事件
      this.eventBus.publish('collaboration_cancelled', {
        collaboration_id: collab.collaborationId,
      });

      this.logger.info('协作取消成功', { collaboration_id });

      return {
        success: true,
        data: collab.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('取消协作失败', {
        error: errorMessage,
        collaboration_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

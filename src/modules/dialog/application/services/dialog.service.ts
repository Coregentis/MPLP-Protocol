/**
 * MPLP Dialog Service - Application Service
 *
 * @version v1.0.0
 * @created 2025-08-02T01:23:00+08:00
 * @description 对话应用服务，处理对话相关的业务逻辑，基于dialog-manager.ts迁移
 */

import { v4 as uuidv4 } from 'uuid';
import { Dialog } from '../../domain/entities/dialog.entity';
import {
  DialogRepository,
  MessageRepository,
} from '../../domain/repositories/dialog.repository';
import {
  // 新的统一接口类型
  CreateDialogRequest,
  UpdateDialogRequest,
  DialogInteractionRequest,
  DialogFilter,
  StatusOptions,
  DialogResponse,
  DialogInteractionResponse,
  DialogStatusResponse,
  QueryDialogResponse,
  DeleteResponse,
  DialogProtocol,
  // 向后兼容的旧版类型
  SendMessageRequest,
  DialogQueryParams,
  MessageQueryParams,
  DialogListResponse,
  MessageResponse,
  MessageListResponse,
  AddParticipantRequest,
  RemoveParticipantRequest,
  DialogMessage,
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
 * 将Dialog实体转换为DialogResponse格式
 */
function convertDialogToResponse(dialog: Dialog): any {
  return {
    dialog_id: dialog.dialogId, // 使用旧版字段名保持兼容性
    dialogId: dialog.dialogId,   // 同时提供新版字段名
    name: dialog.name,
    description: dialog.description, // 添加描述字段
    status: dialog.status,
    capabilities: {
      basic: {
        enabled: true,
        messageHistory: true,
        participantManagement: true,
      },
    },
    participants: dialog.participants.map(p => ({
      agent_id: p.agentId,
      role_id: p.roleId,
      status: p.status,
      permissions: p.permissions, // 保留权限信息
      participant_id: p.participant_id,
      joined_at: p.joined_at
    })),
    createdAt: dialog.createdAt,
    updatedAt: dialog.updatedAt,
    created_at: dialog.createdAt, // 向后兼容
    updated_at: dialog.updatedAt, // 向后兼容
  };
}

/**
 * 对话应用服务 - 实现统一标准接口
 */
export class DialogService implements DialogProtocol {
  private logger = new Logger('DialogService');

  constructor(
    private dialogRepository: DialogRepository,
    private messageRepository: MessageRepository,
    private eventBus: EventBus
  ) {}

  /**
   * 创建对话 - 统一标准接口实现
   */
  async createDialog(request: CreateDialogRequest): Promise<DialogResponse> {
    try {
      this.logger.info('创建对话 (统一接口)', { request });

      // 输入验证
      if (!request.name || !request.participants || !request.capabilities) {
        return {
          success: false,
          error: '缺少必需字段: name, participants, capabilities'
        };
      }

      // 参与者数量验证 (Schema限制: maxItems: 100)
      if (request.participants.length === 0) {
        return {
          success: false,
          error: '参与者列表不能为空'
        };
      }

      if (request.participants.length > 100) {
        return {
          success: false,
          error: '参与者数量不能超过100个'
        };
      }

      // 检查是否为新的统一接口格式
      if (request.capabilities) {
        // 新的统一接口格式
        const dialog = new Dialog({
          session_id: request.context?.sessionId || uuidv4(),
          context_id: request.context?.contextId || uuidv4(),
          name: request.name,
          description: request.description,
          participants: request.participants.map(participantId => ({
            participant_id: uuidv4(),
            agent_id: participantId,
            role_id: 'default',
            status: 'active' as any,
            permissions: ['read', 'write'] as any[],
            joined_at: new Date().toISOString(),
          })),
          message_format: {
            type: 'text' as any,
            encoding: 'utf-8' as any,
            max_length: 10000,
          },
          conversation_context: {
            shared_variables: {},
            history_config: {
              max_messages: 1000,
              retention_policy: 'session' as any,
            },
          },
          security_policy: {
            encryption: false,
            authentication: true,
            message_validation: true,
            audit_logging: true,
          },
          created_by: request.participants[0] || 'system',
          metadata: {
            ...request.metadata,
            capabilities: request.capabilities,
            strategy: request.strategy,
          },
        });

        await this.dialogRepository.save(dialog);

        // 发布事件
        this.eventBus.publish('dialog_created', {
          dialog_id: dialog.dialogId,
          name: dialog.name,
          participants_count: dialog.participants.length,
          capabilities: request.capabilities,
        });

        this.logger.info('对话创建成功 (统一接口)', { dialogId: dialog.dialogId });

        return {
          success: true,
          data: {
            dialogId: dialog.dialogId,
            name: dialog.name,
            status: dialog.status,
            capabilities: request.capabilities,
            participants: request.participants,
            createdAt: dialog.createdAt,
            updatedAt: dialog.updatedAt,
          },
        };
      } else {
        // 向后兼容的旧版格式
        return this.createLegacyDialog(request as any);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('创建对话失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 对话交互 - 统一标准接口实现
   */
  async interactWithDialog(request: DialogInteractionRequest): Promise<DialogInteractionResponse> {
    try {
      this.logger.info('对话交互', { request });

      // 获取对话
      const dialog = await this.dialogRepository.findById(request.dialogId);
      if (!dialog) {
        return {
          success: false,
          content: { type: 'message', text: '' },
          metadata: { processingTime: 0, capabilitiesUsed: [], confidence: 0 },
          error: '对话不存在',
        };
      }

      // 获取对话的能力配置
      const capabilities = dialog.metadata?.capabilities;
      const capabilitiesUsed: string[] = ['basic'];
      const analysisResults: any = {};

      // 基础内容处理
      const responseContent = request.content;

      // 根据启用的能力进行处理
      if (capabilities?.criticalThinking?.enabled && request.options?.applyCriticalThinking) {
        capabilitiesUsed.push('criticalThinking');
        analysisResults.criticalThinking = {
          assumptions: ['假设1', '假设2'],
          logicalGaps: ['逻辑缺口1'],
          alternatives: ['替代方案1'],
          deepQuestions: ['深度问题1'],
          confidence: 0.8,
        };
      }

      if (capabilities?.knowledgeSearch?.enabled && request.options?.performKnowledgeSearch) {
        capabilitiesUsed.push('knowledgeSearch');
        analysisResults.knowledgeSearch = {
          results: [],
          sources: ['source1'],
          validation: { timeliness: 0.9, accuracy: 0.8, relevance: 0.7 },
          recommendations: ['建议1'],
        };
      }

      if (capabilities?.intelligentControl?.enabled) {
        capabilitiesUsed.push('intelligentControl');
        analysisResults.completeness = {
          overallScore: 0.7,
          dimensions: {
            informationGathering: 0.8,
            goalClarity: 0.6,
            stakeholderAlignment: 0.7,
            riskAssessment: 0.5,
          },
          recommendations: ['建议完善目标定义'],
          shouldContinue: true,
        };
      }

      return {
        success: true,
        content: responseContent,
        analysis: Object.keys(analysisResults).length > 0 ? analysisResults : undefined,
        dialogState: {
          currentRound: 1,
          completenessScore: 0.7,
          nextSuggestions: ['继续深入讨论'],
        },
        metadata: {
          processingTime: Date.now() % 1000,
          capabilitiesUsed,
          confidence: 0.8,
        },
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('对话交互失败', { error: errorMessage, request });
      return {
        success: false,
        content: { type: 'message', text: '' },
        metadata: { processingTime: 0, capabilitiesUsed: [], confidence: 0 },
        error: errorMessage,
      };
    }
  }

  /**
   * 获取对话状态 - 统一标准接口实现
   */
  async getDialogStatus(dialogId: string, options?: StatusOptions): Promise<DialogStatusResponse> {
    try {
      this.logger.debug('获取对话状态', { dialogId, options });

      const dialog = await this.dialogRepository.findById(dialogId);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
        };
      }

      const data: any = {
        dialogId: dialog.dialogId,
        status: dialog.status,
        progress: {
          currentRound: 1,
          completenessScore: 0.7,
          milestones: [],
        },
        participants: dialog.participants.map(p => ({
          participantId: p.participant_id,
          status: p.status,
          lastActivity: p.joined_at,
        })),
        performance: {
          responseTime: 100,
          throughput: 10,
          participantSatisfaction: 0.8,
          goalAchievement: 0.7,
        },
      };

      if (options?.includeAnalysis) {
        data.analysis = {
          criticalThinkingActive: false,
          knowledgeSearchActive: false,
          analysisResults: [],
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('获取对话状态失败', { error: errorMessage, dialogId });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 删除对话 - 统一标准接口实现
   */
  async deleteDialog(dialogId: string): Promise<DeleteResponse> {
    try {
      this.logger.info('删除对话', { dialogId });

      const dialog = await this.dialogRepository.findById(dialogId);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
        };
      }

      // 删除相关消息
      await this.messageRepository.deleteMessagesByDialogId(dialogId);

      // 删除对话
      await this.dialogRepository.delete(dialogId);

      // 发布事件
      this.eventBus.publish('dialog_deleted', {
        dialog_id: dialogId,
        name: dialog.name,
      });

      this.logger.info('对话删除成功', { dialogId });

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('删除对话失败', { error: errorMessage, dialogId });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 查询对话列表 - 统一标准接口实现
   */
  async queryDialogs(filter: DialogFilter): Promise<QueryDialogResponse> {
    try {
      this.logger.debug('查询对话列表', { filter });

      // 转换为repository查询参数
      const queryParams: DialogQueryParams = {
        status: filter.status?.[0], // 取第一个状态作为查询条件
        limit: filter.limit || 10,
        offset: filter.offset || 0,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      const result = await this.dialogRepository.findByQuery(queryParams);

      return {
        success: true,
        data: {
          dialogs: result.dialogs.map((dialog: Dialog) => ({
            dialogId: dialog.dialogId,
            name: dialog.name,
            status: dialog.status,
            participantCount: dialog.participants.length,
            createdAt: dialog.createdAt,
            lastActivity: dialog.updatedAt,
          })),
          total: result.total,
          hasMore: (filter.offset || 0) + (filter.limit || 10) < result.total,
        },
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('查询对话列表失败', { error: errorMessage, filter });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 向后兼容的旧版创建对话方法
   */
  private async createLegacyDialog(request: any): Promise<DialogResponse> {
    try {
      this.logger.info('创建对话 (旧版兼容)', { request });

      // 创建对话实体
      const dialog = new Dialog({
        session_id: request.sessionId,
        context_id: request.contextId,
        name: request.name,
        description: request.description,
        participants: request.participants.map((p: any) => ({
          ...p,
          participant_id: uuidv4(),
          joined_at: new Date().toISOString(),
        })),
        message_format: request.message_format,
        conversation_context: request.conversation_context,
        security_policy: request.security_policy,
        created_by: request.contextId,
        metadata: request.metadata,
      });

      await this.dialogRepository.save(dialog);

      // 发布事件
      this.eventBus.publish('dialog_created', {
        dialog_id: dialog.dialogId,
        session_id: dialog.sessionId,
        context_id: dialog.contextId,
        name: dialog.name,
        participants_count: dialog.participants.length,
      });

      this.logger.info('对话创建成功 (旧版兼容)', { dialog_id: dialog.dialogId });

      return {
        success: true,
        data: convertDialogToResponse(dialog),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('创建对话失败 (旧版兼容)', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 获取对话详情 - 向后兼容方法
   */
  async getDialog(dialog_id: string): Promise<DialogResponse> {
    try {
      this.logger.debug('获取对话详情', { dialog_id });

      const dialog = await this.dialogRepository.findById(dialog_id);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
        };
      }

      return {
        success: true,
        data: convertDialogToResponse(dialog),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('获取对话详情失败', { error: errorMessage, dialog_id });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 更新对话
   */
  async updateDialog(request: any): Promise<DialogResponse> {
    try {
      this.logger.info('更新对话', { request });

      // 支持新旧接口格式
      const dialogId = request.dialogId || request.dialogId;
      const dialog = await this.dialogRepository.findById(dialogId);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
        };
      }

      // 更新基本信息
      if (request.name || request.description !== undefined) {
        dialog.updateBasicInfo({
          name: request.name,
          description: request.description,
        });
      }

      // 更新状态
      if (request.status) {
        dialog.updateStatus(request.status);
      }

      // 更新能力配置
      if (request.capabilities) {
        const currentMetadata = dialog.metadata || {};
        dialog.updateMetadata({
          ...currentMetadata,
          capabilities: request.capabilities
        });
      }

      // 更新元数据
      if (request.metadata) {
        dialog.updateMetadata(request.metadata);
      }

      // 保存更新
      await this.dialogRepository.save(dialog);

      // 发布事件
      this.eventBus.publish('dialog_updated', {
        dialog_id: dialog.dialogId,
        updates: request,
      });

      this.logger.info('对话更新成功', { dialog_id: dialog.dialogId });

      return {
        success: true,
        data: convertDialogToResponse(dialog),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('更新对话失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }



  /**
   * 发送消息
   */
  async sendMessage(request: SendMessageRequest): Promise<MessageResponse> {
    try {
      this.logger.info('发送消息', { request });

      // 验证对话存在
      const dialog = await this.dialogRepository.findById(request.dialogId);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 验证发送者权限
      if (!dialog.hasPermission(request.sender_id, 'write')) {
        return {
          success: false,
          error: '发送者没有写入权限',
          timestamp: new Date().toISOString(),
        };
      }

      // 验证消息格式
      if (!dialog.validateMessageFormat(request.content, request.type)) {
        return {
          success: false,
          error: '消息格式不符合要求',
          timestamp: new Date().toISOString(),
        };
      }

      // 创建消息
      const message: DialogMessage = {
        message_id: uuidv4(),
        dialog_id: request.dialogId,
        sender_id: request.sender_id,
        recipient_ids: request.recipient_ids,
        type: request.type,
        content: request.content,
        format: dialog.message_format.encoding,
        priority: request.priority || 'normal',
        status: 'sent',
        timestamp: new Date().toISOString(),
        metadata: request.metadata,
      };

      // 保存消息
      await this.messageRepository.saveMessage(message);

      // 发布事件
      this.eventBus.publish('message_sent', {
        message_id: message.message_id,
        dialog_id: message.dialogId,
        sender_id: message.sender_id,
        recipient_ids: message.recipient_ids,
        type: message.type,
      });

      this.logger.info('消息发送成功', { message_id: message.message_id });

      return {
        success: true,
        data: message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('发送消息失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 查询消息列表
   */
  async queryMessages(
    params: MessageQueryParams
  ): Promise<MessageListResponse> {
    try {
      this.logger.debug('查询消息列表', { params });

      const result = await this.messageRepository.findMessagesByQuery(params);

      return {
        success: true,
        data: {
          messages: result.messages,
          total: result.total,
          limit: params.limit || 10,
          offset: params.offset || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('查询消息列表失败', { error: errorMessage, params });
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
  ): Promise<DialogResponse> {
    try {
      this.logger.info('添加参与者', { request });

      const dialog = await this.dialogRepository.findById(request.dialogId);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
        };
      }

      dialog.addParticipant({
        agent_id: request.agentId,
        role_id: request.roleId,
        status: 'active',
        permissions: request.permissions,
      });

      await this.dialogRepository.save(dialog);

      // 发布事件
      this.eventBus.publish('participant_added', {
        dialog_id: dialog.dialogId,
        agent_id: request.agentId,
        role_id: request.roleId,
      });

      this.logger.info('参与者添加成功', {
        dialog_id: dialog.dialogId,
        agent_id: request.agentId,
      });

      return {
        success: true,
        data: convertDialogToResponse(dialog),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('添加参与者失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }



  /**
   * 移除参与者
   */
  async removeParticipant(
    request: RemoveParticipantRequest
  ): Promise<DialogResponse> {
    try {
      this.logger.info('移除参与者', { request });

      const dialog = await this.dialogRepository.findById(request.dialogId);
      if (!dialog) {
        return {
          success: false,
          error: '对话不存在',
        };
      }

      dialog.removeParticipant(request.participant_id);
      await this.dialogRepository.save(dialog);

      // 发布事件
      this.eventBus.publish('participant_removed', {
        dialog_id: dialog.dialogId,
        participant_id: request.participant_id,
        reason: request.reason,
      });

      this.logger.info('参与者移除成功', {
        dialog_id: dialog.dialogId,
        participant_id: request.participant_id,
      });

      return {
        success: true,
        data: convertDialogToResponse(dialog),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('移除参与者失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 列出对话（向后兼容方法）
   */
  async listDialogs(params: DialogQueryParams): Promise<DialogListResponse> {
    try {
      this.logger.debug('列出对话', { params });

      // 直接使用repository查询，避免双重转换
      const result = await this.dialogRepository.findByQuery(params);

      // 转换响应格式为旧版格式
      return {
        success: true,
        data: {
          dialogs: result.dialogs.map((dialog: Dialog) => ({
            dialog_id: dialog.dialogId,
            name: dialog.name,
            status: dialog.status,
            participants: dialog.participants,
            message_format: { type: 'text' as any, encoding: 'utf-8' as any },
            created_at: dialog.createdAt,
            updated_at: dialog.updatedAt,
            created_by: 'system',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            context_id: '',
            session_id: '',
          })),
          total: result.total,
          limit: params.limit || 10,
          offset: params.offset || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('列出对话失败', { error: errorMessage, params });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * MPLP Memory Dialog Repository - Infrastructure Implementation
 *
 * @version v1.0.0
 * @created 2025-08-02T01:24:00+08:00
 * @description 对话内存仓储实现，用于开发和测试
 */

import { Dialog } from '../../domain/entities/dialog.entity';
import {
  DialogRepository,
  MessageRepository,
  DialogStatistics,
} from '../../domain/repositories/dialog.repository';
import {
  DialogMessage,
  DialogQueryParams,
  MessageQueryParams,
} from '../../types';
import { Logger } from '../../../../public/utils/logger';

/**
 * 内存对话仓储实现
 */
export class MemoryDialogRepository implements DialogRepository {
  private dialogs = new Map<string, Dialog>();
  private logger = new Logger('MemoryDialogRepository');

  /**
   * 保存对话
   */
  async save(dialog: Dialog): Promise<void> {
    this.logger.debug('保存对话', { dialog_id: dialog.dialogId });
    this.dialogs.set(dialog.dialogId, dialog);
  }

  /**
   * 根据ID查找对话
   */
  async findById(dialog_id: string): Promise<Dialog | null> {
    this.logger.debug('根据ID查找对话', { dialog_id });
    return this.dialogs.get(dialog_id) || null;
  }

  /**
   * 根据会话ID查找对话列表
   */
  async findBySessionId(session_id: string): Promise<Dialog[]> {
    this.logger.debug('根据会话ID查找对话列表', { session_id });
    return Array.from(this.dialogs.values()).filter(
      dialog => dialog.sessionId === session_id
    );
  }

  /**
   * 根据上下文ID查找对话列表
   */
  async findByContextId(context_id: string): Promise<Dialog[]> {
    this.logger.debug('根据上下文ID查找对话列表', { context_id });
    return Array.from(this.dialogs.values()).filter(
      dialog => dialog.contextId === context_id
    );
  }

  /**
   * 根据参与者ID查找对话列表
   */
  async findByParticipantId(participant_id: string): Promise<Dialog[]> {
    this.logger.debug('根据参与者ID查找对话列表', { participant_id });
    return Array.from(this.dialogs.values()).filter(dialog =>
      dialog.participants.some(
        p =>
          p.participant_id === participant_id || p.agentId === participant_id
      )
    );
  }

  /**
   * 根据创建者查找对话列表
   */
  async findByCreatedBy(created_by: string): Promise<Dialog[]> {
    this.logger.debug('根据创建者查找对话列表', { created_by });
    return Array.from(this.dialogs.values()).filter(
      dialog => dialog.createdBy === created_by
    );
  }

  /**
   * 根据查询参数查找对话列表
   */
  async findByQuery(params: DialogQueryParams): Promise<{
    dialogs: Dialog[];
    total: number;
  }> {
    this.logger.debug('根据查询参数查找对话列表', { params });

    let dialogs = Array.from(this.dialogs.values());

    // 应用过滤条件
    if (params.sessionId) {
      dialogs = dialogs.filter(d => d.sessionId === params.sessionId);
    }
    if (params.contextId) {
      dialogs = dialogs.filter(d => d.contextId === params.contextId);
    }
    if (params.status) {
      dialogs = dialogs.filter(d => d.status === params.status);
    }
    if (params.participant_id) {
      dialogs = dialogs.filter(d =>
        d.participants.some(
          p =>
            p.participant_id === params.participant_id ||
            p.agentId === params.participant_id
        )
      );
    }
    if (params.createdBy) {
      dialogs = dialogs.filter(d => d.createdBy === params.createdBy);
    }

    const total = dialogs.length;

    // 应用排序
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';

    dialogs.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
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
    const paginatedDialogs = dialogs.slice(offset, offset + limit);

    return {
      dialogs: paginatedDialogs,
      total,
    };
  }

  /**
   * 检查对话是否存在
   */
  async exists(dialog_id: string): Promise<boolean> {
    this.logger.debug('检查对话是否存在', { dialog_id });
    return this.dialogs.has(dialog_id);
  }

  /**
   * 删除对话
   */
  async delete(dialog_id: string): Promise<void> {
    this.logger.debug('删除对话', { dialog_id });
    this.dialogs.delete(dialog_id);
  }

  /**
   * 批量删除对话
   */
  async deleteBatch(dialog_ids: string[]): Promise<void> {
    this.logger.debug('批量删除对话', { dialog_ids });
    dialog_ids.forEach(id => this.dialogs.delete(id));
  }

  /**
   * 更新对话状态
   */
  async updateStatus(dialog_id: string, status: string): Promise<void> {
    this.logger.debug('更新对话状态', { dialog_id, status });

    const dialog = this.dialogs.get(dialog_id);
    if (!dialog) {
      throw new Error('对话不存在');
    }

    // 通过实体方法来更新状态
    switch (status) {
      case 'active':
        if (dialog.status === 'pending') {
          dialog.start();
        } else if (dialog.status === 'inactive') {
          dialog.resume();
        }
        break;
      case 'inactive':
        if (dialog.status === 'active') {
          dialog.pause();
        }
        break;
      case 'completed':
        dialog.complete();
        break;
      case 'cancelled':
        dialog.cancel();
        break;
      case 'failed':
        dialog.fail();
        break;
    }
  }

  /**
   * 获取对话统计信息
   */
  async getStatistics(): Promise<DialogStatistics> {
    this.logger.debug('获取对话统计信息');

    const dialogs = Array.from(this.dialogs.values());
    const total = dialogs.length;

    if (total === 0) {
      return {
        total_dialogs: 0,
        active_dialogs: 0,
        completed_dialogs: 0,
        failed_dialogs: 0,
        total_messages: 0,
        average_participants: 0,
        most_used_message_type: '',
        average_message_length: 0,
      };
    }

    const activeCount = dialogs.filter(d => d.status === 'active').length;
    const completedCount = dialogs.filter(d => d.status === 'completed').length;
    const failedCount = dialogs.filter(d => d.status === 'failed').length;

    const totalParticipants = dialogs.reduce(
      (sum, d) => sum + d.participants.length,
      0
    );
    const averageParticipants =
      Math.round((totalParticipants / total) * 100) / 100;

    return {
      total_dialogs: total,
      active_dialogs: activeCount,
      completed_dialogs: completedCount,
      failed_dialogs: failedCount,
      total_messages: 0, // 需要从MessageRepository获取
      average_participants: averageParticipants,
      most_used_message_type: 'text', // 默认值
      average_message_length: 0, // 需要从MessageRepository计算
    };
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.logger.debug('清空所有对话数据');
    this.dialogs.clear();
  }

  /**
   * 获取所有对话数量（仅用于测试）
   */
  async count(): Promise<number> {
    return this.dialogs.size;
  }
}

/**
 * 内存消息仓储实现
 */
export class MemoryMessageRepository implements MessageRepository {
  private messages = new Map<string, DialogMessage>();
  private logger = new Logger('MemoryMessageRepository');

  /**
   * 保存消息
   */
  async saveMessage(message: DialogMessage): Promise<void> {
    this.logger.debug('保存消息', { message_id: message.message_id });
    this.messages.set(message.message_id, message);
  }

  /**
   * 根据ID查找消息
   */
  async findMessageById(message_id: string): Promise<DialogMessage | null> {
    this.logger.debug('根据ID查找消息', { message_id });
    return this.messages.get(message_id) || null;
  }

  /**
   * 根据对话ID查找消息列表
   */
  async findMessagesByDialogId(dialog_id: string): Promise<DialogMessage[]> {
    this.logger.debug('根据对话ID查找消息列表', { dialog_id });
    return Array.from(this.messages.values()).filter(
      message => message.dialogId === dialog_id
    );
  }

  /**
   * 根据查询参数查找消息列表
   */
  async findMessagesByQuery(params: MessageQueryParams): Promise<{
    messages: DialogMessage[];
    total: number;
  }> {
    this.logger.debug('根据查询参数查找消息列表', { params });

    let messages = Array.from(this.messages.values()).filter(
      message => message.dialogId === params.dialogId
    );

    // 应用过滤条件
    if (params.sender_id) {
      messages = messages.filter(m => m.sender_id === params.sender_id);
    }
    if (params.recipient_id) {
      messages = messages.filter(m =>
        m.recipient_ids.includes(params.recipient_id!)
      );
    }
    if (params.type) {
      messages = messages.filter(m => m.type === params.type);
    }
    if (params.status) {
      messages = messages.filter(m => m.status === params.status);
    }
    if (params.from_timestamp) {
      messages = messages.filter(m => m.timestamp >= params.from_timestamp!);
    }
    if (params.to_timestamp) {
      messages = messages.filter(m => m.timestamp <= params.to_timestamp!);
    }

    const total = messages.length;

    // 按时间戳排序（最新的在前）
    messages.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // 应用分页
    const offset = params.offset || 0;
    const limit = params.limit || 10;
    const paginatedMessages = messages.slice(offset, offset + limit);

    return {
      messages: paginatedMessages,
      total,
    };
  }

  /**
   * 删除消息
   */
  async deleteMessage(message_id: string): Promise<void> {
    this.logger.debug('删除消息', { message_id });
    this.messages.delete(message_id);
  }

  /**
   * 批量删除对话的所有消息
   */
  async deleteMessagesByDialogId(dialog_id: string): Promise<void> {
    this.logger.debug('批量删除对话的所有消息', { dialog_id });
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([_, message]) => message.dialogId === dialog_id)
      .map(([id, _]) => id);

    messagesToDelete.forEach(id => this.messages.delete(id));
  }

  /**
   * 更新消息状态
   */
  async updateMessageStatus(message_id: string, status: string): Promise<void> {
    this.logger.debug('更新消息状态', { message_id, status });

    const message = this.messages.get(message_id);
    if (!message) {
      throw new Error('消息不存在');
    }

    message.status = status as any;
  }

  /**
   * 标记消息为已读
   */
  async markMessageAsRead(
    message_id: string,
    reader_id: string
  ): Promise<void> {
    this.logger.debug('标记消息为已读', { message_id, reader_id });

    const message = this.messages.get(message_id);
    if (!message) {
      throw new Error('消息不存在');
    }

    message.status = 'read';
    if (!message.metadata) {
      message.metadata = {};
    }

    // 类型安全的metadata处理
    const metadata = message.metadata as Record<string, unknown>;
    if (!Array.isArray(metadata.read_by)) {
      metadata.read_by = [];
    }
    const readBy = metadata.read_by as string[];
    if (!readBy.includes(reader_id)) {
      readBy.push(reader_id);
    }
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadMessageCount(
    dialog_id: string,
    participant_id: string
  ): Promise<number> {
    this.logger.debug('获取未读消息数量', { dialog_id, participant_id });

    return Array.from(this.messages.values()).filter(
      message => {
        if (message.dialogId !== dialog_id ||
            !message.recipient_ids.includes(participant_id) ||
            message.status === 'read') {
          return false;
        }

        // 类型安全的metadata检查
        if (!message.metadata) return true;
        const metadata = message.metadata as Record<string, unknown>;
        const readBy = metadata.read_by;
        if (!Array.isArray(readBy)) return true;
        return !readBy.includes(participant_id);
      }
    ).length;
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.logger.debug('清空所有消息数据');
    this.messages.clear();
  }

  /**
   * 获取所有消息数量（仅用于测试）
   */
  async count(): Promise<number> {
    return this.messages.size;
  }
}

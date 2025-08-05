/**
 * MPLP Dialog Repository Interface - Domain Repository
 *
 * @version v1.0.0
 * @created 2025-08-02T01:22:00+08:00
 * @description 对话仓储接口，定义数据访问抽象
 */

import { Dialog } from '../entities/dialog.entity';
import {
  DialogMessage,
  DialogQueryParams,
  MessageQueryParams,
} from '../../types';

/**
 * 对话仓储接口
 */
export interface DialogRepository {
  /**
   * 保存对话
   */
  save(dialog: Dialog): Promise<void>;

  /**
   * 根据ID查找对话
   */
  findById(dialog_id: string): Promise<Dialog | null>;

  /**
   * 根据会话ID查找对话列表
   */
  findBySessionId(session_id: string): Promise<Dialog[]>;

  /**
   * 根据上下文ID查找对话列表
   */
  findByContextId(context_id: string): Promise<Dialog[]>;

  /**
   * 根据参与者ID查找对话列表
   */
  findByParticipantId(participant_id: string): Promise<Dialog[]>;

  /**
   * 根据创建者查找对话列表
   */
  findByCreatedBy(created_by: string): Promise<Dialog[]>;

  /**
   * 根据查询参数查找对话列表
   */
  findByQuery(params: DialogQueryParams): Promise<{
    dialogs: Dialog[];
    total: number;
  }>;

  /**
   * 检查对话是否存在
   */
  exists(dialog_id: string): Promise<boolean>;

  /**
   * 删除对话
   */
  delete(dialog_id: string): Promise<void>;

  /**
   * 批量删除对话
   */
  deleteBatch(dialog_ids: string[]): Promise<void>;

  /**
   * 更新对话状态
   */
  updateStatus(dialog_id: string, status: string): Promise<void>;

  /**
   * 获取对话统计信息
   */
  getStatistics(): Promise<DialogStatistics>;
}

/**
 * 消息仓储接口
 */
export interface MessageRepository {
  /**
   * 保存消息
   */
  saveMessage(message: DialogMessage): Promise<void>;

  /**
   * 根据ID查找消息
   */
  findMessageById(message_id: string): Promise<DialogMessage | null>;

  /**
   * 根据对话ID查找消息列表
   */
  findMessagesByDialogId(dialog_id: string): Promise<DialogMessage[]>;

  /**
   * 根据查询参数查找消息列表
   */
  findMessagesByQuery(params: MessageQueryParams): Promise<{
    messages: DialogMessage[];
    total: number;
  }>;

  /**
   * 删除消息
   */
  deleteMessage(message_id: string): Promise<void>;

  /**
   * 批量删除对话的所有消息
   */
  deleteMessagesByDialogId(dialog_id: string): Promise<void>;

  /**
   * 更新消息状态
   */
  updateMessageStatus(message_id: string, status: string): Promise<void>;

  /**
   * 标记消息为已读
   */
  markMessageAsRead(message_id: string, reader_id: string): Promise<void>;

  /**
   * 获取未读消息数量
   */
  getUnreadMessageCount(
    dialog_id: string,
    participant_id: string
  ): Promise<number>;
}

/**
 * 对话统计信息
 */
export interface DialogStatistics {
  total_dialogs: number;
  active_dialogs: number;
  completed_dialogs: number;
  failed_dialogs: number;
  total_messages: number;
  average_participants: number;
  most_used_message_type: string;
  average_message_length: number;
}

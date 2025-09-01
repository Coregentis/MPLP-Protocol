/**
 * Dialog Repository Interface
 * @description Dialog模块仓库接口 - 领域层数据访问抽象
 * @version 1.0.0
 */

import { DialogEntity } from '../entities/dialog.entity';
import { type UUID } from '../../types';

/**
 * Dialog仓库接口
 * 定义Dialog实体的数据访问操作
 */
export interface DialogRepository {
  /**
   * 保存对话实体
   * @param dialog 对话实体
   * @returns 保存后的对话实体
   */
  save(dialog: DialogEntity): Promise<DialogEntity>;

  /**
   * 根据ID查找对话
   * @param id 对话ID
   * @returns 对话实体或null
   */
  findById(id: UUID): Promise<DialogEntity | null>;

  /**
   * 根据名称查找对话
   * @param name 对话名称
   * @returns 对话实体数组
   */
  findByName(name: string): Promise<DialogEntity[]>;

  /**
   * 根据参与者查找对话
   * @param participantId 参与者ID
   * @returns 对话实体数组
   */
  findByParticipant(participantId: string): Promise<DialogEntity[]>;

  /**
   * 获取所有对话
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 对话实体数组
   */
  findAll(limit?: number, offset?: number): Promise<DialogEntity[]>;

  /**
   * 更新对话实体
   * @param id 对话ID
   * @param dialog 更新的对话实体
   * @returns 更新后的对话实体
   */
  update(id: UUID, dialog: DialogEntity): Promise<DialogEntity>;

  /**
   * 删除对话
   * @param id 对话ID
   */
  delete(id: UUID): Promise<void>;

  /**
   * 检查对话是否存在
   * @param id 对话ID
   * @returns 是否存在
   */
  exists(id: UUID): Promise<boolean>;

  /**
   * 获取对话总数
   * @returns 对话总数
   */
  count(): Promise<number>;

  /**
   * 根据条件搜索对话
   * @param criteria 搜索条件
   * @returns 对话实体数组
   */
  search(criteria: DialogSearchCriteria): Promise<DialogEntity[]>;

  /**
   * 获取活跃对话
   * @returns 活跃对话实体数组
   */
  findActiveDialogs(): Promise<DialogEntity[]>;

  /**
   * 根据能力类型查找对话
   * @param capabilityType 能力类型
   * @returns 对话实体数组
   */
  findByCapability(capabilityType: string): Promise<DialogEntity[]>;
}

/**
 * 对话搜索条件接口
 */
export interface DialogSearchCriteria {
  /**
   * 对话名称（模糊匹配）
   */
  name?: string;

  /**
   * 参与者ID列表
   */
  participantIds?: string[];

  /**
   * 对话类型
   */
  dialogType?: string;

  /**
   * 创建时间范围
   */
  createdAfter?: Date;
  createdBefore?: Date;

  /**
   * 是否启用智能控制
   */
  hasIntelligentControl?: boolean;

  /**
   * 是否启用批判性思维
   */
  hasCriticalThinking?: boolean;

  /**
   * 是否启用知识搜索
   */
  hasKnowledgeSearch?: boolean;

  /**
   * 是否启用多模态
   */
  hasMultimodal?: boolean;

  /**
   * 健康状态
   */
  healthStatus?: string;

  /**
   * 分页参数
   */
  limit?: number;
  offset?: number;

  /**
   * 排序参数
   */
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

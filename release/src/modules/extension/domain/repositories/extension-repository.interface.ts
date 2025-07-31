/**
 * Extension仓库接口
 * 
 * 定义扩展数据访问的领域接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Extension } from '../entities/extension.entity';
import { ExtensionType, ExtensionStatus } from '../../types';

/**
 * 扩展查询过滤器
 */
export interface ExtensionFilter {
  context_id?: UUID;
  type?: ExtensionType;
  status?: ExtensionStatus;
  name_pattern?: string;
  version?: string;
  is_active?: boolean;
  has_api_extensions?: boolean;
  has_extension_points?: boolean;
  created_after?: string;
  created_before?: string;
}

/**
 * 分页参数
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Extension仓库接口
 */
export interface IExtensionRepository {
  /**
   * 保存扩展
   */
  save(extension: Extension): Promise<void>;

  /**
   * 根据ID查找扩展
   */
  findById(extensionId: UUID): Promise<Extension | null>;

  /**
   * 根据名称查找扩展
   */
  findByName(name: string, contextId?: UUID): Promise<Extension | null>;

  /**
   * 根据上下文ID查找扩展列表
   */
  findByContextId(contextId: UUID): Promise<Extension[]>;

  /**
   * 根据过滤器查找扩展列表
   */
  findByFilter(filter: ExtensionFilter, pagination?: PaginationOptions): Promise<PaginatedResult<Extension>>;

  /**
   * 查找活跃扩展
   */
  findActiveExtensions(contextId?: UUID): Promise<Extension[]>;

  /**
   * 根据类型查找扩展
   */
  findByType(type: ExtensionType, contextId?: UUID): Promise<Extension[]>;

  /**
   * 查找具有特定扩展点的扩展
   */
  findByExtensionPoint(pointName: string): Promise<Extension[]>;

  /**
   * 查找具有API扩展的扩展
   */
  findWithApiExtensions(contextId?: UUID): Promise<Extension[]>;

  /**
   * 更新扩展
   */
  update(extension: Extension): Promise<void>;

  /**
   * 删除扩展
   */
  delete(extensionId: UUID): Promise<void>;

  /**
   * 批量更新状态
   */
  batchUpdateStatus(extensionIds: UUID[], status: ExtensionStatus): Promise<void>;

  /**
   * 检查扩展是否存在
   */
  exists(extensionId: UUID): Promise<boolean>;

  /**
   * 检查扩展名称是否唯一
   */
  isNameUnique(name: string, contextId: UUID, excludeExtensionId?: UUID): Promise<boolean>;

  /**
   * 获取扩展统计信息
   */
  getStatistics(contextId?: UUID): Promise<{
    total: number;
    by_type: Record<ExtensionType, number>;
    by_status: Record<ExtensionStatus, number>;
    active_count: number;
  }>;

  /**
   * 查找依赖特定扩展的扩展
   */
  findDependents(extensionId: UUID): Promise<Extension[]>;

  /**
   * 检查扩展依赖
   */
  checkDependencies(extension: Extension): Promise<{
    satisfied: boolean;
    missing: string[];
    conflicts: string[];
  }>;
}

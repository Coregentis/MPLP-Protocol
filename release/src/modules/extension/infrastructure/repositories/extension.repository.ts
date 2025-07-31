/**
 * Extension仓库实现
 * 
 * 基础设施层的数据访问实现
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Extension } from '../../domain/entities/extension.entity';
import { 
  IExtensionRepository, 
  ExtensionFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/repositories/extension-repository.interface';
import { ExtensionType, ExtensionStatus } from '../../types';

/**
 * Extension仓库实现
 * 
 * 注意：这是一个内存实现，生产环境中应该使用真实的数据库实现
 */
export class ExtensionRepository implements IExtensionRepository {
  private extensions: Map<UUID, Extension> = new Map();

  /**
   * 保存扩展
   */
  async save(extension: Extension): Promise<void> {
    this.extensions.set(extension.extension_id, extension);
  }

  /**
   * 根据ID查找扩展
   */
  async findById(extensionId: UUID): Promise<Extension | null> {
    return this.extensions.get(extensionId) || null;
  }

  /**
   * 根据名称查找扩展
   */
  async findByName(name: string, contextId?: UUID): Promise<Extension | null> {
    for (const extension of this.extensions.values()) {
      if (extension.name === name && (!contextId || extension.context_id === contextId)) {
        return extension;
      }
    }
    return null;
  }

  /**
   * 根据上下文ID查找扩展列表
   */
  async findByContextId(contextId: UUID): Promise<Extension[]> {
    return Array.from(this.extensions.values())
      .filter(extension => extension.context_id === contextId);
  }

  /**
   * 根据过滤器查找扩展列表
   */
  async findByFilter(
    filter: ExtensionFilter, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Extension>> {
    let results = Array.from(this.extensions.values());

    // 应用过滤器
    if (filter.context_id) {
      results = results.filter(ext => ext.context_id === filter.context_id);
    }

    if (filter.type) {
      results = results.filter(ext => ext.type === filter.type);
    }

    if (filter.status) {
      results = results.filter(ext => ext.status === filter.status);
    }

    if (filter.name_pattern) {
      const pattern = new RegExp(filter.name_pattern, 'i');
      results = results.filter(ext => 
        pattern.test(ext.name) || 
        (ext.display_name && pattern.test(ext.display_name))
      );
    }

    if (filter.version) {
      results = results.filter(ext => ext.version === filter.version);
    }

    if (filter.is_active !== undefined) {
      results = results.filter(ext => ext.isActive() === filter.is_active);
    }

    if (filter.has_api_extensions !== undefined) {
      results = results.filter(ext => 
        (ext.api_extensions.length > 0) === filter.has_api_extensions
      );
    }

    if (filter.has_extension_points !== undefined) {
      results = results.filter(ext => 
        (ext.extension_points.length > 0) === filter.has_extension_points
      );
    }

    if (filter.created_after) {
      results = results.filter(ext => ext.created_at >= filter.created_after!);
    }

    if (filter.created_before) {
      results = results.filter(ext => ext.created_at <= filter.created_before!);
    }

    // 排序
    if (pagination?.sort_by) {
      results.sort((a, b) => {
        const aValue = this.getPropertyValue(a, pagination.sort_by!);
        const bValue = this.getPropertyValue(b, pagination.sort_by!);
        
        if (pagination.sort_order === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    // 分页
    const total = results.length;
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;
    
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      items: paginatedResults,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    };
  }

  /**
   * 查找活跃扩展
   */
  async findActiveExtensions(contextId?: UUID): Promise<Extension[]> {
    let results = Array.from(this.extensions.values())
      .filter(extension => extension.isActive());

    if (contextId) {
      results = results.filter(extension => extension.context_id === contextId);
    }

    return results;
  }

  /**
   * 根据类型查找扩展
   */
  async findByType(type: ExtensionType, contextId?: UUID): Promise<Extension[]> {
    let results = Array.from(this.extensions.values())
      .filter(extension => extension.type === type);

    if (contextId) {
      results = results.filter(extension => extension.context_id === contextId);
    }

    return results;
  }

  /**
   * 查找具有特定扩展点的扩展
   */
  async findByExtensionPoint(pointName: string): Promise<Extension[]> {
    return Array.from(this.extensions.values())
      .filter(extension => 
        extension.extension_points.some(ep => ep.name === pointName)
      );
  }

  /**
   * 查找具有API扩展的扩展
   */
  async findWithApiExtensions(contextId?: UUID): Promise<Extension[]> {
    let results = Array.from(this.extensions.values())
      .filter(extension => extension.api_extensions.length > 0);

    if (contextId) {
      results = results.filter(extension => extension.context_id === contextId);
    }

    return results;
  }

  /**
   * 更新扩展
   */
  async update(extension: Extension): Promise<void> {
    this.extensions.set(extension.extension_id, extension);
  }

  /**
   * 删除扩展
   */
  async delete(extensionId: UUID): Promise<void> {
    this.extensions.delete(extensionId);
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(extensionIds: UUID[], status: ExtensionStatus): Promise<void> {
    for (const extensionId of extensionIds) {
      const extension = this.extensions.get(extensionId);
      if (extension) {
        extension.updateStatus(status);
        this.extensions.set(extensionId, extension);
      }
    }
  }

  /**
   * 检查扩展是否存在
   */
  async exists(extensionId: UUID): Promise<boolean> {
    return this.extensions.has(extensionId);
  }

  /**
   * 检查扩展名称是否唯一
   */
  async isNameUnique(name: string, contextId: UUID, excludeExtensionId?: UUID): Promise<boolean> {
    for (const extension of this.extensions.values()) {
      if (extension.name === name && 
          extension.context_id === contextId && 
          extension.extension_id !== excludeExtensionId) {
        return false;
      }
    }
    return true;
  }

  /**
   * 获取扩展统计信息
   */
  async getStatistics(contextId?: UUID): Promise<{
    total: number;
    by_type: Record<ExtensionType, number>;
    by_status: Record<ExtensionStatus, number>;
    active_count: number;
  }> {
    let extensions = Array.from(this.extensions.values());
    
    if (contextId) {
      extensions = extensions.filter(ext => ext.context_id === contextId);
    }

    const total = extensions.length;
    const active_count = extensions.filter(ext => ext.isActive()).length;
    
    const by_type = extensions.reduce((acc, ext) => {
      acc[ext.type] = (acc[ext.type] || 0) + 1;
      return acc;
    }, {} as Record<ExtensionType, number>);

    const by_status = extensions.reduce((acc, ext) => {
      acc[ext.status] = (acc[ext.status] || 0) + 1;
      return acc;
    }, {} as Record<ExtensionStatus, number>);

    return {
      total,
      by_type,
      by_status,
      active_count
    };
  }

  /**
   * 查找依赖特定扩展的扩展
   */
  async findDependents(extensionId: UUID): Promise<Extension[]> {
    return Array.from(this.extensions.values())
      .filter(extension => 
        extension.compatibility?.dependencies?.some(dep => dep.extension_id === extensionId)
      );
  }

  /**
   * 检查扩展依赖
   */
  async checkDependencies(extension: Extension): Promise<{
    satisfied: boolean;
    missing: string[];
    conflicts: string[];
  }> {
    const missing: string[] = [];
    const conflicts: string[] = [];

    if (extension.compatibility?.dependencies) {
      for (const dependency of extension.compatibility.dependencies) {
        const dependentExt = await this.findById(dependency.extension_id);
        if (!dependentExt) {
          missing.push(dependency.name);
        } else if (!dependentExt.isActive()) {
          missing.push(`${dependency.name} (未激活)`);
        }
      }
    }

    if (extension.compatibility?.conflicts) {
      for (const conflict of extension.compatibility.conflicts) {
        const conflictExt = await this.findById(conflict.extension_id);
        if (conflictExt && conflictExt.isActive()) {
          conflicts.push(conflict.name);
        }
      }
    }

    return {
      satisfied: missing.length === 0 && conflicts.length === 0,
      missing,
      conflicts
    };
  }

  /**
   * 获取属性值用于排序
   */
  private getPropertyValue(extension: Extension, property: string): string {
    switch (property) {
      case 'name':
        return extension.name;
      case 'created_at':
        return extension.created_at;
      case 'updated_at':
        return extension.updated_at;
      case 'type':
        return extension.type;
      case 'status':
        return extension.status;
      case 'version':
        return extension.version;
      default:
        return extension.created_at;
    }
  }
}

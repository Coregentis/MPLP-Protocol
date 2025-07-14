/**
 * Extension仓储实现
 * 
 * 提供扩展数据的存储和检索功能
 * 
 * @version 1.0.0
 * @created 2025-07-15T11:00:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ExtensionProtocol, 
  ExtensionSearchCriteria,
  ExtensionType,
  ExtensionStatus
} from './types';
import { logger } from '../../utils/logger';
import { IExtensionRepository } from '../../interfaces/extension-repository.interface';

/**
 * Extension仓储实现
 * 
 * 当前实现使用内存存储，可替换为数据库实现
 */
export class ExtensionRepository implements IExtensionRepository {
  private extensions = new Map<string, ExtensionProtocol>();
  
  /**
   * 保存扩展
   * @param extension 扩展协议对象
   */
  public async saveExtension(extension: ExtensionProtocol): Promise<ExtensionProtocol> {
    try {
      // 确保扩展ID存在
      if (!extension.extension_id) {
        extension.extension_id = uuidv4();
      }
      
      // 保存或更新扩展
      this.extensions.set(extension.extension_id, { ...extension });
      
      logger.debug('扩展已保存', { 
        extension_id: extension.extension_id,
        name: extension.name
      });
      
      return extension;
    } catch (error) {
      logger.error('保存扩展失败', { 
        extension_id: extension.extension_id,
        name: extension.name,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
  
  /**
   * 根据ID获取扩展
   * @param extensionId 扩展ID
   */
  public async getExtensionById(extensionId: string): Promise<ExtensionProtocol | null> {
    const extension = this.extensions.get(extensionId);
    return extension ? { ...extension } : null;
  }
  
  /**
   * 根据名称获取扩展
   * @param name 扩展名称
   */
  public async getExtensionByName(name: string): Promise<ExtensionProtocol | null> {
    for (const extension of this.extensions.values()) {
      if (extension.name === name) {
        return { ...extension };
      }
    }
    return null;
  }
  
  /**
   * 搜索扩展
   * @param criteria 搜索条件
   */
  public async searchExtensions(criteria: ExtensionSearchCriteria): Promise<ExtensionProtocol[]> {
    const results: ExtensionProtocol[] = [];
    
    // 如果没有条件，返回所有扩展
    if (!criteria || Object.keys(criteria).length === 0) {
      return Array.from(this.extensions.values()).map(ext => ({ ...ext }));
    }
    
    // 遍历所有扩展
    for (const extension of this.extensions.values()) {
      // 按ID过滤
      if (criteria.extension_ids && criteria.extension_ids.length > 0) {
        if (!criteria.extension_ids.includes(extension.extension_id)) {
          continue;
        }
      }
      
      // 按上下文ID过滤
      if (criteria.context_ids && criteria.context_ids.length > 0) {
        if (!criteria.context_ids.includes(extension.context_id)) {
          continue;
        }
      }
      
      // 按名称过滤
      if (criteria.names && criteria.names.length > 0) {
        if (!criteria.names.includes(extension.name)) {
          continue;
        }
      }
      
      // 按类型过滤
      if (criteria.types && criteria.types.length > 0) {
        if (!criteria.types.includes(extension.type)) {
          continue;
        }
      }
      
      // 按状态过滤
      if (criteria.statuses && criteria.statuses.length > 0) {
        if (!criteria.statuses.includes(extension.status)) {
          continue;
        }
      }
      
      // 按类别过滤
      if (criteria.categories && criteria.categories.length > 0 && extension.metadata?.categories) {
        const hasCategory = criteria.categories.some(category => 
          extension.metadata?.categories?.includes(category)
        );
        if (!hasCategory) {
          continue;
        }
      }
      
      // 按作者过滤
      if (criteria.authors && criteria.authors.length > 0) {
        if (!extension.metadata?.author || !criteria.authors.includes(extension.metadata.author)) {
          continue;
        }
      }
      
      // 按关键词过滤
      if (criteria.keywords && criteria.keywords.length > 0 && extension.metadata?.keywords) {
        const hasKeyword = criteria.keywords.some(keyword => 
          extension.metadata?.keywords?.includes(keyword)
        );
        if (!hasKeyword) {
          continue;
        }
      }
      
      // 按安装时间过滤
      if (extension.lifecycle) {
        if (criteria.installed_after && new Date(extension.lifecycle.install_date) < new Date(criteria.installed_after)) {
          continue;
        }
        
        if (criteria.installed_before && new Date(extension.lifecycle.install_date) > new Date(criteria.installed_before)) {
          continue;
        }
      }
      
      // 通过所有过滤条件，添加到结果中
      results.push({ ...extension });
    }
    
    return results;
  }
  
  /**
   * 删除扩展
   * @param extensionId 扩展ID
   */
  public async deleteExtension(extensionId: string): Promise<boolean> {
    try {
      const deleted = this.extensions.delete(extensionId);
      
      if (deleted) {
        logger.debug('扩展已删除', { extension_id: extensionId });
      } else {
        logger.warn('扩展不存在，无法删除', { extension_id: extensionId });
      }
      
      return deleted;
    } catch (error) {
      logger.error('删除扩展失败', { 
        extension_id: extensionId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * 获取所有扩展
   */
  public async getAllExtensions(): Promise<ExtensionProtocol[]> {
    return Array.from(this.extensions.values()).map(ext => ({ ...ext }));
  }
  
  /**
   * 获取扩展数量
   * @param criteria 可选的筛选条件
   */
  public async getExtensionsCount(criteria?: Partial<ExtensionSearchCriteria>): Promise<number> {
    if (!criteria || Object.keys(criteria).length === 0) {
      return this.extensions.size;
    }
    
    const extensions = await this.searchExtensions(criteria as ExtensionSearchCriteria);
    return extensions.length;
  }
} 
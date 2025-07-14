/**
 * Extension Repository Interface
 * 
 * 提供扩展数据的存储和检索功能的厂商中立接口
 * 
 * @version 1.0.0
 * @created 2025-07-15T10:00:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 */

import { ExtensionProtocol, ExtensionSearchCriteria } from '../modules/extension/types';

/**
 * Extension仓储接口
 * 
 * 厂商中立的扩展数据存储接口，支持任何数据库实现
 */
export interface IExtensionRepository {
  /**
   * 保存扩展
   * @param extension 扩展协议对象
   */
  saveExtension(extension: ExtensionProtocol): Promise<ExtensionProtocol>;
  
  /**
   * 根据ID获取扩展
   * @param extensionId 扩展ID
   */
  getExtensionById(extensionId: string): Promise<ExtensionProtocol | null>;
  
  /**
   * 根据名称获取扩展
   * @param name 扩展名称
   */
  getExtensionByName(name: string): Promise<ExtensionProtocol | null>;
  
  /**
   * 搜索扩展
   * @param criteria 搜索条件
   */
  searchExtensions(criteria: ExtensionSearchCriteria): Promise<ExtensionProtocol[]>;
  
  /**
   * 删除扩展
   * @param extensionId 扩展ID
   */
  deleteExtension(extensionId: string): Promise<boolean>;
  
  /**
   * 获取所有扩展
   */
  getAllExtensions(): Promise<ExtensionProtocol[]>;
  
  /**
   * 获取扩展数量
   * @param criteria 可选的筛选条件
   */
  getExtensionsCount(criteria?: Partial<ExtensionSearchCriteria>): Promise<number>;
} 
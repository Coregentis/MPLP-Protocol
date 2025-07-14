/**
 * Extension Service Interface
 * 
 * 提供扩展服务功能的厂商中立接口
 * 
 * @version 1.0.0
 * @created 2025-07-15T10:15:00+08:00
 * @compliance .cursor/rules/schema-driven-development.mdc
 */

import {
  ExtensionProtocol,
  InstallExtensionRequest,
  UpdateExtensionRequest,
  UpdateConfigurationRequest,
  ExtensionActivationRequest,
  ExtensionSearchCriteria,
  ExtensionInstallResult,
  ExtensionStatistics,
  ExtensionExecutionContext,
  ExtensionExecutionResult,
  ExtensionHealthStatus
} from '../modules/extension/types';

/**
 * Extension服务接口
 * 
 * 厂商中立的扩展服务接口，定义扩展管理和执行的核心功能
 */
export interface IExtensionService {
  /**
   * 安装扩展
   * @param request 安装请求
   */
  installExtension(request: InstallExtensionRequest): Promise<ExtensionInstallResult>;
  
  /**
   * 更新扩展
   * @param request 更新请求
   */
  updateExtension(request: UpdateExtensionRequest): Promise<ExtensionProtocol>;
  
  /**
   * 更新扩展配置
   * @param request 配置更新请求
   */
  updateConfiguration(request: UpdateConfigurationRequest): Promise<ExtensionProtocol>;
  
  /**
   * 激活或停用扩展
   * @param request 激活请求
   */
  activateExtension(request: ExtensionActivationRequest): Promise<void>;
  
  /**
   * 卸载扩展
   * @param extensionId 扩展ID
   */
  uninstallExtension(extensionId: string): Promise<boolean>;
  
  /**
   * 获取扩展
   * @param extensionId 扩展ID
   */
  getExtension(extensionId: string): Promise<ExtensionProtocol | null>;
  
  /**
   * 搜索扩展
   * @param criteria 搜索条件
   */
  searchExtensions(criteria: ExtensionSearchCriteria): Promise<ExtensionProtocol[]>;
  
  /**
   * 执行扩展点
   * @param pointName 扩展点名称
   * @param targetModule 目标模块
   * @param eventData 事件数据
   * @param context 执行上下文
   */
  executeExtensionPoint(
    pointName: string,
    targetModule: string,
    eventData: Record<string, unknown>,
    context?: Partial<ExtensionExecutionContext>
  ): Promise<ExtensionExecutionResult[]>;
  
  /**
   * 获取扩展统计信息
   */
  getStatistics(): Promise<ExtensionStatistics>;
  
  /**
   * 执行扩展健康检查
   * @param extensionId 扩展ID
   * @param fullCheck 是否执行完整检查
   */
  checkExtensionHealth(extensionId: string, fullCheck?: boolean): Promise<ExtensionHealthStatus>;
} 
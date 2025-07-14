/**
 * 扩展适配器接口 - 厂商中立设计
 * 
 * 定义了MPLP与外部扩展系统集成的标准接口。
 * 所有扩展适配器实现必须遵循此接口。
 * 
 * @version v1.0.0
 * @created 2025-07-15T10:00:00+08:00
 * @compliance extension-protocol.json Schema v1.0.1 - 100%合规
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则
 */

import { ExtensionProtocol, ExtensionSearchCriteria, ExtensionType, ExtensionStatus } from '../modules/extension/types';

/**
 * 扩展健康状态接口
 */
export interface ExtensionHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  last_check_timestamp: string;
  details?: Record<string, unknown>;
  error_message?: string;
}

/**
 * 扩展安装结果接口
 */
export interface InstallResult {
  success: boolean;
  extension_id?: string;
  message?: string;
  error_code?: string;
  details?: Record<string, unknown>;
}

/**
 * 扩展操作结果接口
 */
export interface ExtensionOperationResult {
  success: boolean;
  message?: string;
  error_code?: string;
  details?: Record<string, unknown>;
}

/**
 * 扩展性能指标接口
 */
export interface ExtensionPerformanceMetrics {
  avg_response_time_ms: number;
  peak_memory_usage_mb: number;
  active_instances: number;
  error_rate: number;
  uptime_seconds: number;
  request_count: number;
  timestamp: string;
}

/**
 * 扩展适配器接口 - 厂商中立
 */
export interface IExtensionAdapter {
  /**
   * 获取适配器信息
   * @returns 包含适配器类型和版本的对象
   */
  getAdapterInfo(): { type: string; version: string };
  
  /**
   * 安装扩展
   * @param packageUrl 扩展包URL或路径
   * @param options 安装选项
   * @returns 安装结果
   */
  installExtension(packageUrl: string, options?: Record<string, unknown>): Promise<InstallResult>;
  
  /**
   * 卸载扩展
   * @param extensionId 扩展ID
   * @returns 操作结果
   */
  uninstallExtension(extensionId: string): Promise<ExtensionOperationResult>;
  
  /**
   * 启用扩展
   * @param extensionId 扩展ID
   * @returns 操作结果
   */
  enableExtension(extensionId: string): Promise<ExtensionOperationResult>;
  
  /**
   * 禁用扩展
   * @param extensionId 扩展ID
   * @returns 操作结果
   */
  disableExtension(extensionId: string): Promise<ExtensionOperationResult>;
  
  /**
   * 更新扩展
   * @param extensionId 扩展ID
   * @param packageUrl 更新包URL或路径
   * @param options 更新选项
   * @returns 操作结果
   */
  updateExtension(extensionId: string, packageUrl: string, options?: Record<string, unknown>): Promise<ExtensionOperationResult>;
  
  /**
   * 获取扩展详情
   * @param extensionId 扩展ID
   * @returns 扩展协议对象或null
   */
  getExtension(extensionId: string): Promise<ExtensionProtocol | null>;
  
  /**
   * 查找扩展
   * @param criteria 扩展搜索条件
   * @returns 扩展协议对象数组
   */
  findExtensions(criteria: ExtensionSearchCriteria): Promise<ExtensionProtocol[]>;
  
  /**
   * 配置扩展
   * @param extensionId 扩展ID
   * @param config 配置对象
   * @returns 操作结果
   */
  configureExtension(extensionId: string, config: Record<string, unknown>): Promise<ExtensionOperationResult>;
  
  /**
   * 检查扩展健康状态
   * @param extensionId 扩展ID
   * @returns 健康状态信息
   */
  checkExtensionHealth(extensionId: string): Promise<ExtensionHealth>;
  
  /**
   * 获取扩展性能指标
   * @param extensionId 扩展ID
   * @returns 性能指标
   */
  getExtensionMetrics(extensionId: string): Promise<ExtensionPerformanceMetrics>;
  
  /**
   * 验证扩展兼容性
   * @param extensionId 扩展ID
   * @returns 兼容性检查结果
   */
  validateCompatibility(extensionId: string): Promise<{
    compatible: boolean;
    issues?: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
  }>;
  
  /**
   * 执行扩展操作
   * @param extensionId 扩展ID
   * @param operation 操作名称
   * @param params 操作参数
   * @returns 操作结果
   */
  executeExtensionOperation(extensionId: string, operation: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  
  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  checkHealth(): Promise<ExtensionHealth>;
} 
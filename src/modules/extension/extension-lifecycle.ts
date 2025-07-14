import { ExtensionLifecycle } from './types';

/**
 * 扩展生命周期接口增强
 * 添加健康检查相关字段
 */
export interface EnhancedExtensionLifecycle extends ExtensionLifecycle {
  /**
   * 最后健康检查时间
   */
  last_health_check?: string;
} 
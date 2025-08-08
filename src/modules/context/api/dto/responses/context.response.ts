/**
 * Context响应DTO
 * 
 * 定义Context的响应数据结构
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../../public/shared/types';

/**
 * Context响应DTO
 */
export class ContextResponse {
  /**
   * Context ID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  context_id!: UUID;
  
  /**
   * Context名称
   * @example "项目上下文"
   */
  name!: string;
  
  /**
   * Context描述
   * @example "这是一个项目上下文描述"
   */
  description!: string | null;
  
  /**
   * 生命周期阶段
   * @example "initialization"
   */
  lifecycle_stage!: 'planning' | 'executing' | 'monitoring' | 'completed';

  /**
   * 状态
   * @example "active"
   */
  status!: 'active' | 'inactive' | 'suspended' | 'deleted';
  
  /**
   * 创建时间
   * @example "2025-09-16T10:30:00Z"
   */
  created_at!: string;
  
  /**
   * 更新时间
   * @example "2025-09-16T10:30:00Z"
   */
  updated_at!: string;
  
  /**
   * 会话数量
   * @example 2
   */
  session_count?: number;
  
  /**
   * 共享状态数量
   * @example 5
   */
  shared_state_count?: number;
  
  /**
   * 配置信息（Schema格式 - snake_case）
   */
  configuration?: {
    /**
     * 超时设置
     */
    timeout_settings?: {
      default_timeout: number;
      max_timeout: number;
      cleanup_timeout?: number;
    };

    /**
     * 通知设置
     */
    notification_settings?: {
      enabled: boolean;
      channels?: Array<'email' | 'webhook' | 'sms' | 'push'>;
      events?: Array<'created' | 'updated' | 'completed' | 'failed' | 'timeout'>;
    };

    /**
     * 持久化设置
     */
    persistence?: {
      enabled: boolean;
      storage_backend: 'memory' | 'database' | 'file' | 'redis';
      retention_policy?: {
        duration: string;
        max_versions?: number;
      };
    };
  };
  
  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
} 
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
  lifecycle_stage!: 'initialization' | 'active' | 'maintenance' | 'completion';

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
   * 配置信息
   */
  configuration?: {
    /**
     * 是否允许共享
     * @example true
     */
    allow_sharing: boolean;
    
    /**
     * 最大会话数
     * @example 10
     */
    max_sessions: number;
    
    /**
     * 过期策略
     * @example "never"
     */
    expiration_policy: string;
    
    /**
     * 自动暂停时间（毫秒）
     * @example 3600000
     */
    auto_suspend_after_inactivity: number | null;
    
    /**
     * 是否允许匿名访问
     * @example false
     */
    allow_anonymous_access: boolean;
    
    /**
     * 特性列表
     * @example ["feature1", "feature2"]
     */
    features: string[];
  };
  
  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
} 
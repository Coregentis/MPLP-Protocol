/**
 * CreateContext请求DTO
 * 
 * 定义创建Context的请求数据结构
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

/**
 * 创建Context请求DTO
 */
export class CreateContextRequest {
  /**
   * Context名称
   * @example "项目上下文"
   */
  name!: string;
  
  /**
   * Context描述
   * @example "这是一个项目上下文描述"
   */
  description?: string;
  
  /**
   * 生命周期阶段
   * @example "planning"
   */
  lifecycle_stage?: 'planning' | 'executing' | 'monitoring' | 'completed';
  
  /**
   * 状态
   * @example "active"
   */
  status?: 'active' | 'inactive' | 'suspended';
  
  /**
   * 配置信息
   */
  configuration?: {
    /**
     * 是否允许共享
     * @example true
     */
    allow_sharing?: boolean;
    
    /**
     * 最大会话数
     * @example 10
     */
    max_sessions?: number;
    
    /**
     * 过期策略
     * @example "never"
     */
    expiration_policy?: string;
    
    /**
     * 自动暂停时间（毫秒）
     * @example 3600000
     */
    auto_suspend_after_inactivity?: number | null;
    
    /**
     * 是否允许匿名访问
     * @example false
     */
    allow_anonymous_access?: boolean;
    
    /**
     * 特性列表
     * @example ["feature1", "feature2"]
     */
    features?: string[];
  };
  
  /**
   * 元数据
   */
  metadata?: Record<string, unknown>;
} 
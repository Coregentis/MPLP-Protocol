/**
 * CreateContext请求DTO
 *
 * API层数据传输对象，使用camelCase命名约定
 * 对应Schema字段但遵循JavaScript/TypeScript标准
 *
 * @version 1.0.0
 * @created 2025-08-06
 */

import { ContextLifecycleStage, ContextStatus, ContextConfiguration } from '../../../types';

/**
 * 创建Context请求DTO
 * Application层使用camelCase，与Schema的snake_case进行映射
 */
export class CreateContextRequest {
  /**
   * Context名称
   * 对应Schema: name
   * @example "项目上下文"
   */
  name!: string;

  /**
   * Context描述
   * 对应Schema: description
   * @example "这是一个项目上下文描述"
   */
  description?: string;

  /**
   * 生命周期阶段
   * 对应Schema: lifecycle_stage
   * Application层使用camelCase
   */
  lifecycleStage?: ContextLifecycleStage;

  /**
   * 状态
   * 对应Schema: status
   * Application层使用camelCase
   */
  status?: ContextStatus;

  /**
   * 配置信息
   * 对应Schema: configuration
   * Application层使用camelCase
   */
  configuration?: ContextConfiguration;

  /**
   * 元数据
   * 对应Schema: metadata
   */
  metadata?: Record<string, unknown>;
}
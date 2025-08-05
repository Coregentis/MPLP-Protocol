/**
 * Context工厂
 * 
 * 负责创建Context领域对象
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { v4 as uuidv4 } from 'uuid';
import { Context } from '../entities/context.entity';
import { ContextConfiguration } from '../value-objects/context-configuration';
import { ContextLifecycleStage } from '../../../shared/types';
import { EntityStatus, UUID } from '../../../shared/types';

/**
 * Context创建参数
 */
export interface CreateContextParams {
  name: string;
  description?: string | null;
  lifecycleStage?: ContextLifecycleStage;
  status?: EntityStatus;
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Context工厂
 */
export class ContextFactory {
  /**
   * 创建新的Context
   */
  createContext(params: CreateContextParams): Context {
    const contextId = uuidv4();
    const now = new Date();
    
    // 使用默认值或提供的参数
    const name = params.name;
    const description = params.description ?? null;
    const lifecycleStage = params.lifecycleStage ?? ContextLifecycleStage.INITIALIZATION;
    const status = params.status ?? EntityStatus.ACTIVE;
    
    // 创建配置对象
    let configuration: Record<string, unknown> = {};
    if (params.configuration) {
      configuration = params.configuration;
    }
    
    // 创建元数据对象
    let metadata: Record<string, unknown> = {
      createdBy: 'system',
      version: '1.0.0'
    };
    if (params.metadata) {
      metadata = {
        ...metadata,
        ...params.metadata
      };
    }
    
    // 创建Context实例
    return new Context(
      contextId,
      name,
      description,
      lifecycleStage,
      status,
      now,
      now,
      [], // 空会话ID列表
      [], // 空共享状态ID列表
      configuration,
      metadata
    );
  }
  
  /**
   * 从持久化数据重建Context
   */
  reconstitute(
    contextId: UUID,
    name: string,
    description: string | null,
    lifecycleStage: ContextLifecycleStage,
    status: EntityStatus,
    createdAt: Date,
    updatedAt: Date,
    sessionIds: UUID[],
    sharedStateIds: UUID[],
    configuration: Record<string, unknown>,
    metadata: Record<string, unknown>
  ): Context {
    return new Context(
      contextId,
      name,
      description,
      lifecycleStage,
      status,
      createdAt,
      updatedAt,
      sessionIds,
      sharedStateIds,
      configuration,
      metadata
    );
  }
  
  /**
   * 创建Context的副本
   */
  cloneContext(context: Context, overrides: Partial<CreateContextParams> = {}): Context {
    return new Context(
      uuidv4(), // 新ID
      overrides.name ?? context.name,
      overrides.description ?? context.description,
      overrides.lifecycleStage ?? context.lifecycleStage,
      overrides.status ?? context.status,
      new Date(), // 新创建时间
      new Date(), // 新更新时间
      [], // 空会话ID列表（不复制关联）
      [], // 空共享状态ID列表（不复制关联）
      overrides.configuration ?? JSON.parse(JSON.stringify(context.configuration)),
      {
        ...JSON.parse(JSON.stringify(context.metadata)),
        clonedFrom: context.contextId,
        clonedAt: new Date().toISOString(),
        ...(overrides.metadata ?? {})
      }
    );
  }
} 
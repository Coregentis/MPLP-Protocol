/**
 * Context控制器
 * 
 * 处理Context相关的HTTP请求
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// 使用Express的扩展类型
import { Request as ExpressRequest, Response } from 'express';
import { CreateContextHandler } from '../../application/commands/create-context.handler';
import { GetContextByIdHandler } from '../../application/queries/get-context-by-id.handler';
import { CreateContextRequest } from '../dto/requests/create-context.request';
import { ContextResponse } from '../dto/responses/context.response';
import { ContextLifecycleStage } from '../../../../public/shared/types/context-types';
import { EntityStatus, UUID } from '../../../../public/shared/types';
import { Logger } from '../../../../public/utils/logger';
import { ContextOperationResult } from '../../../../public/shared/types';

// 扩展Request类型，包含我们需要的属性
interface Request extends ExpressRequest {
  body: any;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
}

/**
 * Context控制器
 */
export class ContextController {
  private readonly logger = new Logger('ContextController');
  
  /**
   * 构造函数
   */
  constructor(
    private readonly createContextHandler: CreateContextHandler,
    private readonly getContextByIdHandler: GetContextByIdHandler
  ) {}
  
  /**
   * 创建Context
   */
  async createContext(req: Request, res: Response): Promise<void> {
    this.logger.debug('Received createContext request');
    
    try {
      const request = req.body as CreateContextRequest;
      
      // 转换请求DTO到命令
      const result = await this.createContextHandler.execute({
        name: request.name,
        description: request.description,
        lifecycleStage: request.lifecycle_stage as ContextLifecycleStage,
        status: request.status as EntityStatus,
        configuration: this.mapConfiguration(request.configuration),
        metadata: request.metadata
      });
      
      if (!result.success) {
        this.logger.warn('Context creation failed', { errors: result.error });
        res.status(400).json({
          success: false,
          error: result.error
        });
        return;
      }
      
      const context = result.data!;
      
      // 转换领域对象到响应DTO
      const response: ContextResponse = {
        context_id: context.contextId,
        name: context.name,
        description: context.description,
        lifecycle_stage: context.lifecycleStage,
        status: context.status,
        created_at: context.createdAt.toISOString(),
        updated_at: context.updatedAt.toISOString(),
        session_count: context.sessionIds.length,
        shared_state_count: context.sharedStateIds.length,
        configuration: this.mapConfigurationToResponse(context.configuration),
        metadata: context.metadata
      };
      
      res.status(201).json({
        success: true,
        data: response
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error in createContext', { error: errorMessage });
      res.status(500).json({
        success: false,
        error: `Internal server error: ${errorMessage}`
      });
    }
  }
  
  /**
   * 获取Context
   */
  async getContext(req: Request, res: Response): Promise<void> {
    const contextId = req.params.contextId as UUID;
    this.logger.debug('Received getContext request', { contextId });
    
    try {
      const context = await this.getContextByIdHandler.execute({
        contextId,
        includeRelations: req.query.includeRelations === 'true'
      });
      
      if (!context) {
        res.status(404).json({
          success: false,
          error: 'Context not found'
        });
        return;
      }
      
      // 转换领域对象到响应DTO
      const response: ContextResponse = {
        context_id: context.contextId,
        name: context.name,
        description: context.description,
        lifecycle_stage: context.lifecycleStage,
        status: context.status,
        created_at: context.createdAt.toISOString(),
        updated_at: context.updatedAt.toISOString(),
        session_count: context.sessionIds.length,
        shared_state_count: context.sharedStateIds.length,
        configuration: this.mapConfigurationToResponse(context.configuration),
        metadata: context.metadata
      };
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error in getContext', { error: errorMessage, contextId });
      res.status(500).json({
        success: false,
        error: `Internal server error: ${errorMessage}`
      });
    }
  }
  
  /**
   * 将请求配置映射到领域配置
   */
  private mapConfiguration(config?: CreateContextRequest['configuration']): Record<string, unknown> | undefined {
    if (!config) {
      return undefined;
    }
    
    return {
      allowSharing: config.allow_sharing,
      maxSessions: config.max_sessions,
      expirationPolicy: config.expiration_policy,
      autoSuspendAfterInactivity: config.auto_suspend_after_inactivity,
      allowAnonymousAccess: config.allow_anonymous_access,
      features: config.features
    };
  }
  
  /**
   * 将领域配置映射到响应配置
   */
  private mapConfigurationToResponse(config?: Record<string, unknown>): ContextResponse['configuration'] | undefined {
    if (!config) {
      return undefined;
    }
    
    return {
      allow_sharing: config.allowSharing as boolean || false,
      max_sessions: config.maxSessions as number || 10,
      expiration_policy: config.expirationPolicy as string || 'never',
      auto_suspend_after_inactivity: config.autoSuspendAfterInactivity as number | null || null,
      allow_anonymous_access: config.allowAnonymousAccess as boolean || false,
      features: config.features as string[] || []
    };
  }
} 
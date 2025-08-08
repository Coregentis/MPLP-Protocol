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
import { ContextLifecycleStage, ContextStatus } from '../../types';
import { EntityStatus, UUID } from '../../../../public/shared/types';
import { Logger } from '../../../../public/utils/logger';
import { UpdateSharedStateRequest } from '../dto/requests/update-shared-state.request';
import { UpdateAccessControlRequest } from '../dto/requests/update-access-control.request';
import { SharedState } from '../../domain/value-objects/shared-state';
import { AccessControl, Action } from '../../domain/value-objects/access-control';
import { ContextManagementService } from '../../application/services/context-management.service';
import { Context } from '../../domain/entities/context.entity';

// 扩展Request类型，包含我们需要的属性
interface Request extends ExpressRequest {
  body: CreateContextRequest | UpdateSharedStateRequest | UpdateAccessControlRequest | Record<string, unknown>;
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
    private readonly getContextByIdHandler: GetContextByIdHandler,
    private readonly contextManagementService: ContextManagementService
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
        lifecycleStage: request.lifecycleStage as ContextLifecycleStage,
        status: this.mapContextStatusToEntityStatus(request.status),
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
   * 将ContextStatus映射到EntityStatus
   */
  private mapContextStatusToEntityStatus(status?: ContextStatus): EntityStatus {
    if (!status) {
      return EntityStatus.ACTIVE; // 默认状态
    }

    // 映射Schema定义的ContextStatus到内部EntityStatus
    switch (status) {
      case ContextStatus.ACTIVE:
        return EntityStatus.ACTIVE;
      case ContextStatus.SUSPENDED:
        return EntityStatus.SUSPENDED;
      case ContextStatus.COMPLETED:
        return EntityStatus.INACTIVE; // 已完成映射为非活跃
      case ContextStatus.TERMINATED:
        return EntityStatus.DELETED; // 已终止映射为已删除
      default:
        return EntityStatus.ACTIVE;
    }
  }

  /**
   * 将请求配置映射到领域配置
   */
  private mapConfiguration(config?: CreateContextRequest['configuration']): Record<string, unknown> | undefined {
    if (!config) {
      return undefined;
    }

    // 直接返回ContextConfiguration，因为它已经是正确的格式
    return {
      timeoutSettings: config.timeoutSettings,
      notificationSettings: config.notificationSettings,
      persistence: config.persistence
    };
  }
  
  /**
   * 将领域配置映射到响应配置
   */
  private mapConfigurationToResponse(config?: Record<string, unknown>): ContextResponse['configuration'] | undefined {
    if (!config) {
      return undefined;
    }

    // 将Application层配置映射到Schema层响应格式
    const timeoutSettings = config.timeoutSettings as { defaultTimeout: number; maxTimeout: number; cleanupTimeout?: number } | undefined;
    const notificationSettings = config.notificationSettings as { enabled: boolean; channels?: string[]; events?: string[] } | undefined;
    const persistence = config.persistence as { enabled: boolean; storageBackend: string; retentionPolicy?: { duration: string; maxVersions?: number } } | undefined;

    return {
      timeout_settings: timeoutSettings ? {
        default_timeout: timeoutSettings.defaultTimeout,
        max_timeout: timeoutSettings.maxTimeout,
        cleanup_timeout: timeoutSettings.cleanupTimeout
      } : undefined,
      notification_settings: notificationSettings ? {
        enabled: notificationSettings.enabled,
        channels: notificationSettings.channels as Array<'email' | 'webhook' | 'sms' | 'push'> | undefined,
        events: notificationSettings.events as Array<'created' | 'updated' | 'completed' | 'failed' | 'timeout'> | undefined
      } : undefined,
      persistence: persistence ? {
        enabled: persistence.enabled,
        storage_backend: persistence.storageBackend as 'memory' | 'database' | 'file' | 'redis',
        retention_policy: persistence.retentionPolicy ? {
          duration: persistence.retentionPolicy.duration,
          max_versions: persistence.retentionPolicy.maxVersions
        } : undefined
      } : undefined
    };
  }

  /**
   * 更新Context的共享状态
   */
  async updateSharedState(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.params.contextId;
      const sharedStateData = req.body;

      this.logger.info('Updating context shared state', { contextId });

      // 将Schema格式转换为领域对象
      const sharedState = this.mapSchemaToSharedState(sharedStateData as UpdateSharedStateRequest);

      // 调用应用服务
      const result = await this.contextManagementService.updateSharedState(
        contextId,
        sharedState
      );

      if (result.success && result.data) {
        const response = this.mapContextToResponse(result.data);
        res.status(200).json({
          success: true,
          data: response
        });
      } else {
        res.status(400).json({
          success: false,
          errors: result.error
        });
      }
    } catch (error) {
      this.logger.error('Failed to update shared state', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * 更新Context的访问控制
   */
  async updateAccessControl(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.params.contextId;
      const accessControlData = req.body;

      this.logger.info('Updating context access control', { contextId });

      // 将Schema格式转换为领域对象
      const accessControl = this.mapSchemaToAccessControl(accessControlData as UpdateAccessControlRequest);

      // 调用应用服务
      const result = await this.contextManagementService.updateAccessControl(
        contextId,
        accessControl
      );

      if (result.success && result.data) {
        const response = this.mapContextToResponse(result.data);
        res.status(200).json({
          success: true,
          data: response
        });
      } else {
        res.status(400).json({
          success: false,
          errors: result.error
        });
      }
    } catch (error) {
      this.logger.error('Failed to update access control', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * 设置共享变量
   */
  async setSharedVariable(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.params.contextId;
      const { key, value } = req.body as { key: string; value: unknown };

      this.logger.info('Setting shared variable', { contextId, key });

      // 调用应用服务
      const result = await this.contextManagementService.setSharedVariable(
        contextId,
        key,
        value
      );

      if (result.success && result.data) {
        const response = this.mapContextToResponse(result.data);
        res.status(200).json({
          success: true,
          data: response
        });
      } else {
        res.status(400).json({
          success: false,
          errors: result.error
        });
      }
    } catch (error) {
      this.logger.error('Failed to set shared variable', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * 获取共享变量
   */
  async getSharedVariable(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.params.contextId;
      const key = req.params.key;

      this.logger.info('Getting shared variable', { contextId, key });

      // 调用应用服务
      const result = await this.contextManagementService.getSharedVariable(
        contextId,
        key
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            key,
            value: result.data,
            type: typeof result.data
          }
        });
      } else {
        res.status(400).json({
          success: false,
          errors: result.error
        });
      }
    } catch (error) {
      this.logger.error('Failed to get shared variable', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * 检查访问权限
   */
  async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.params.contextId;
      const { principal, resource, action } = req.body as { principal: string; resource: string; action: string };

      this.logger.info('Checking permission', { contextId, principal, resource, action });

      // 调用应用服务
      const result = await this.contextManagementService.checkPermission(
        contextId,
        principal,
        resource,
        action as Action
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            principal,
            resource,
            action,
            has_permission: result.data,
            checked_at: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          errors: result.error
        });
      }
    } catch (error) {
      this.logger.error('Failed to check permission', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * 将Schema格式的共享状态转换为领域对象
   */
  private mapSchemaToSharedState(schemaData: UpdateSharedStateRequest): SharedState {
    return SharedState.fromSchemaFormat(schemaData as Record<string, unknown>);
  }

  /**
   * 将Schema格式的访问控制转换为领域对象
   */
  private mapSchemaToAccessControl(schemaData: UpdateAccessControlRequest): AccessControl {
    return AccessControl.fromSchemaFormat(schemaData as Record<string, unknown>);
  }

  /**
   * 将Context实体转换为响应格式
   */
  private mapContextToResponse(context: Context): ContextResponse {
    return {
      context_id: context.contextId,
      name: context.name,
      description: context.description,
      status: context.status as 'active' | 'inactive' | 'suspended' | 'deleted',
      lifecycle_stage: context.lifecycleStage as 'planning' | 'executing' | 'monitoring' | 'completed',
      session_count: context.sessionIds.length,
      shared_state_count: context.sharedStateIds.length,
      configuration: context.configuration,
      metadata: context.metadata,
      created_at: context.createdAt.toISOString(),
      updated_at: context.updatedAt.toISOString()
    };
  }
}
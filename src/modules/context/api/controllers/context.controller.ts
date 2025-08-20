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
import { AccessControl } from '../../domain/value-objects/access-control';
import { ContextManagementService } from '../../application/services/context-management.service';
import { Context } from '../../domain/entities/context.entity';
import { ContextMapper } from '../mappers/context.mapper';

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
      
      // 使用ContextMapper进行正确的转换
      const contextData = context.toData();
      const response = ContextMapper.toSchema(contextData) as ContextResponse;
      
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
      
      // 使用ContextMapper进行正确的camelCase到snake_case转换
      const contextData = context.toData();
      const response = ContextMapper.toSchema(contextData) as ContextResponse;
      
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
   * 更新Context的共享状态
   */
  async updateSharedState(req: Request, res: Response): Promise<void> {
    try {
      const contextId = req.params.contextId;
      const sharedStateData = req.body;

      this.logger.info('Updating context shared state', { contextId });

      // 将Schema格式转换为领域对象
      const _sharedState = this.mapSchemaToSharedState(sharedStateData as UpdateSharedStateRequest);

      // TODO: 实现updateSharedState方法
      // const result = await this.contextManagementService.updateSharedState(
      //   contextId,
      //   _sharedState
      // );

      // 临时响应
      res.status(501).json({
        success: false,
        error: 'updateSharedState method not implemented yet'
      });
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
      const _accessControl = this.mapSchemaToAccessControl(accessControlData as UpdateAccessControlRequest);

      // TODO: 实现updateAccessControl方法
      // const result = await this.contextManagementService.updateAccessControl(
      //   contextId,
      //   _accessControl
      // );

      // 临时响应
      res.status(501).json({
        success: false,
        error: 'updateAccessControl method not implemented yet'
      });
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
      const { key, value: _value } = req.body as { key: string; value: unknown };

      this.logger.info('Setting shared variable', { contextId, key });

      // TODO: 实现setSharedVariable方法
      // const result = await this.contextManagementService.setSharedVariable(
      //   contextId,
      //   key,
      //   value
      // );

      // 临时响应
      res.status(501).json({
        success: false,
        error: 'setSharedVariable method not implemented yet'
      });
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

      // TODO: 实现getSharedVariable方法
      // const result = await this.contextManagementService.getSharedVariable(
      //   contextId,
      //   key
      // );

      // 临时响应
      res.status(501).json({
        success: false,
        error: 'getSharedVariable method not implemented yet'
      });
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

      // TODO: 实现checkPermission方法
      // const result = await this.contextManagementService.checkPermission(
      //   contextId,
      //   principal,
      //   resource,
      //   action as Action
      // );

      // 临时响应
      res.status(501).json({
        success: false,
        error: 'checkPermission method not implemented yet'
      });
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
   * 使用ContextMapper进行正确的转换
   */
  private mapContextToResponse(context: Context): ContextResponse {
    const contextData = context.toData();
    return ContextMapper.toSchema(contextData) as ContextResponse;
  }
}
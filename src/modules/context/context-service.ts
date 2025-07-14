/**
 * MPLP Context服务层
 * 
 * Context模块核心业务逻辑实现
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { 
  ContextProtocol,
  CreateContextRequest,
  UpdateContextRequest,
  BatchContextRequest,
  BatchContextResponse,
  ContextResponse,
  ContextFilter,
  ContextOperationResult,
  ContextStatus,
  ContextLifecycleStage,
  SharedState,
  AccessControl,
  ContextConfiguration,
  ResourceManagement,
  ContextDependency,
  ContextGoal,
  UUID,
  Timestamp,
  Version,
  ContextError,
  ValidationError,
  AccessDeniedError,
  ResourceAllocationError,
  DependencyResolutionError,
  ConfigurationError,
  InternalError
} from './types';

// ===== 常量定义 =====
const PROTOCOL_VERSION: Version = '1.0.1';
const DEFAULT_TIMEOUT_SECONDS = 300;
const MAX_TIMEOUT_SECONDS = 3600;
const DEFAULT_CLEANUP_TIMEOUT_SECONDS = 60;

// ===== 接口定义 =====

/**
 * Context仓库接口
 */
export interface IContextRepository {
  save(context: ContextProtocol): Promise<void>;
  findById(contextId: UUID): Promise<ContextProtocol | null>;
  findByFilter(filter: ContextFilter): Promise<ContextProtocol[]>;
  update(contextId: UUID, updates: Partial<ContextProtocol>): Promise<void>;
  delete(contextId: UUID): Promise<void>;
  exists(contextId: UUID): Promise<boolean>;
  count(filter?: ContextFilter): Promise<number>;
  getContextHistory(contextId: UUID, options: {
    limit: number;
    offset: number;
    startTime?: string;
    endTime?: string;
    pathFilter?: string;
  }): Promise<Array<{
    timestamp: string;
    path: string;
    value: unknown;
    previous_value: unknown;
    user_id?: string;
  }>>;
}

/**
 * Context验证器接口
 */
export interface IContextValidator {
  validateCreate(request: CreateContextRequest): Promise<{ valid: boolean; errors?: string[] }>;
  validateUpdate(request: UpdateContextRequest): Promise<{ valid: boolean; errors?: string[] }>;
  validateSchema(context: ContextProtocol): Promise<{ valid: boolean; errors?: string[] }>;
  validateBatch(request: BatchContextRequest): Promise<{ valid: boolean; errors?: string[] }>;
}

/**
 * Context事件数据
 */
export interface ContextEventData {
  context_id: UUID;
  timestamp: Timestamp;
  user_id?: string;
  action: string;
  metadata?: Record<string, unknown>;
}

// ===== 服务实现 =====

/**
 * Context服务主类
 * 
 * 实现完整的Context生命周期管理，严格符合Schema规范
 * 提供创建、更新、查询、删除等核心功能
 */
export class ContextService extends EventEmitter {
  private readonly repository: IContextRepository;
  private readonly validator: IContextValidator;

  constructor(
    repository: IContextRepository,
    validator: IContextValidator
  ) {
    super();
    this.repository = repository;
    this.validator = validator;
  }

  // ===== 核心CRUD操作 =====

  /**
   * 创建新的Context
   * 
   * @param request 创建请求 - Schema: CreateContextRequest
   * @param ownerId 拥有者用户ID
   * @param ownerRole 拥有者角色
   * @returns Context协议对象
   */
  public async createContext(
    request: CreateContextRequest,
    ownerId: string,
    ownerRole: string
  ): Promise<ContextOperationResult<ContextProtocol>> {
    const startTime = performance.now();
    
    try {
      // 1. 验证输入参数
      const validationResult = await this.validator.validateCreate(request);
      if (!validationResult.valid) {
        throw new ValidationError(
          `Input validation failed: ${validationResult.errors?.join(', ')}`,
          { request, errors: validationResult.errors }
        );
      }

      // 2. 生成Context ID和时间戳
      const contextId = uuidv4();
      const timestamp = new Date().toISOString();

      // 3. 构建默认共享状态 (Schema要求)
      const defaultSharedState: SharedState = {
        variables: request.shared_state?.variables || {},
        resources: this.buildDefaultResourceManagement(request.shared_state?.resources),
        dependencies: request.shared_state?.dependencies || [],
        goals: request.shared_state?.goals || []
      };

      // 4. 构建默认访问控制 (Schema要求)
      const defaultAccessControl: AccessControl = {
        owner: {
          user_id: ownerId,
          role: ownerRole
        },
        permissions: request.access_control?.permissions || [
          {
            principal: ownerId,
            principal_type: 'user',
            resource: '*',
            actions: ['read', 'write', 'execute', 'delete', 'admin']
          }
        ],
        policies: request.access_control?.policies || []
      };

      // 5. 构建默认配置 (Schema要求)
      const defaultConfiguration: ContextConfiguration = {
        timeout_settings: {
          default_timeout: request.configuration?.timeout_settings?.default_timeout || DEFAULT_TIMEOUT_SECONDS,
          max_timeout: request.configuration?.timeout_settings?.max_timeout || MAX_TIMEOUT_SECONDS,
          cleanup_timeout: request.configuration?.timeout_settings?.cleanup_timeout || DEFAULT_CLEANUP_TIMEOUT_SECONDS
        },
        persistence: {
          enabled: request.configuration?.persistence?.enabled ?? true,
          storage_backend: request.configuration?.persistence?.storage_backend || 'database',
          retention_policy: request.configuration?.persistence?.retention_policy
        },
        notification_settings: request.configuration?.notification_settings
      };

      // 6. 创建Context协议对象 (完全符合Schema)
      const context: ContextProtocol = {
        protocol_version: PROTOCOL_VERSION,
        timestamp,
        context_id: contextId,
        name: request.name,
        description: request.description,
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: defaultSharedState,
        access_control: defaultAccessControl,
        configuration: defaultConfiguration
      };

      // 7. Schema最终验证
      const schemaValidation = await this.validator.validateSchema(context);
      if (!schemaValidation.valid) {
        throw new ValidationError(
          `Schema validation failed: ${schemaValidation.errors?.join(', ')}`,
          { context, errors: schemaValidation.errors }
        );
      }

      // 8. 保存到仓库
      await this.repository.save(context);

      // 9. 发射事件
      this.emitContextEvent('context.created', {
        context_id: contextId,
        timestamp,
        user_id: ownerId,
        action: 'create',
        metadata: { name: request.name, lifecycle_stage: 'planning' }
      });

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        data: context,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 获取Context
   * 
   * @param contextId Context ID
   * @returns Context协议对象或null
   */
  public async getContext(contextId: UUID): Promise<ContextOperationResult<ContextProtocol | null>> {
    const startTime = performance.now();
    
    try {
      const context = await this.repository.findById(contextId);
      
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        data: context,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 更新Context
   * 
   * @param request 更新请求 - Schema: UpdateContextRequest
   * @returns 更新后的Context协议对象
   */
  public async updateContext(request: UpdateContextRequest): Promise<ContextOperationResult<ContextProtocol>> {
    const startTime = performance.now();
    
    try {
      // 1. 验证输入参数
      const validationResult = await this.validator.validateUpdate(request);
      if (!validationResult.valid) {
        throw new ValidationError(
          `Update validation failed: ${validationResult.errors?.join(', ')}`,
          { request, errors: validationResult.errors }
        );
      }

      // 2. 检查Context是否存在
      const existingContext = await this.repository.findById(request.context_id);
      if (!existingContext) {
        throw new ContextError(`Context not found: ${request.context_id}`, 'CONTEXT_NOT_FOUND');
      }

      // 3. 构建更新数据
      const updates: Partial<ContextProtocol> = {
        timestamp: new Date().toISOString()
      };

      if (request.name !== undefined) updates.name = request.name;
      if (request.description !== undefined) updates.description = request.description;
      if (request.status !== undefined) updates.status = request.status;
      if (request.lifecycle_stage !== undefined) updates.lifecycle_stage = request.lifecycle_stage;
      
      if (request.shared_state !== undefined) {
        updates.shared_state = this.mergeSharedState(existingContext.shared_state, request.shared_state);
      }
      
      if (request.access_control !== undefined) {
        updates.access_control = this.mergeAccessControl(existingContext.access_control, request.access_control);
      }
      
      if (request.configuration !== undefined) {
        updates.configuration = this.mergeConfiguration(existingContext.configuration, request.configuration);
      }

      // 4. 应用更新
      await this.repository.update(request.context_id, updates);

      // 5. 获取更新后的Context
      const updatedContext = await this.repository.findById(request.context_id);
      if (!updatedContext) {
        throw new InternalError('Failed to retrieve updated context');
      }

      // 6. Schema验证
      const schemaValidation = await this.validator.validateSchema(updatedContext);
      if (!schemaValidation.valid) {
        throw new ValidationError(
          `Updated context failed schema validation: ${schemaValidation.errors?.join(', ')}`,
          { context: updatedContext, errors: schemaValidation.errors }
        );
      }

      // 7. 发射事件
      this.emitContextEvent('context.updated', {
        context_id: request.context_id,
        timestamp: updates.timestamp!,
        action: 'update',
        metadata: { updated_fields: Object.keys(updates) }
      });

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        data: updatedContext,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 删除Context
   * 
   * @param contextId Context ID
   * @returns 删除操作结果
   */
  public async deleteContext(contextId: UUID): Promise<ContextOperationResult<void>> {
    const startTime = performance.now();
    
    try {
      // 1. 检查Context是否存在
      const exists = await this.repository.exists(contextId);
      if (!exists) {
        throw new ContextError(`Context not found: ${contextId}`, 'CONTEXT_NOT_FOUND');
      }

      // 2. 执行删除
      await this.repository.delete(contextId);

      // 3. 发射事件
      this.emitContextEvent('context.deleted', {
        context_id: contextId,
        timestamp: new Date().toISOString(),
        action: 'delete'
      });

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 查询Contexts
   * 
   * @param filter 查询过滤器 - Schema: ContextFilter
   * @returns Context协议对象列表
   */
  public async queryContexts(filter: ContextFilter): Promise<ContextOperationResult<ContextProtocol[]>> {
    const startTime = performance.now();
    
    try {
      const contexts = await this.repository.findByFilter(filter);
      
      const executionTime = performance.now() - startTime;

      return {
        success: true,
        data: contexts,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 批量处理Contexts
   * 
   * @param request 批量请求 - Schema: BatchContextRequest
   * @returns 批量处理结果
   */
  public async batchProcessContexts(request: BatchContextRequest): Promise<ContextOperationResult<BatchContextResponse>> {
    const startTime = performance.now();
    
    try {
      // 1. 验证批量请求
      const validationResult = await this.validator.validateBatch(request);
      if (!validationResult.valid) {
        throw new ValidationError(
          `Batch validation failed: ${validationResult.errors?.join(', ')}`,
          { request, errors: validationResult.errors }
        );
      }

      // 2. 处理所有操作
      const results: ContextOperationResult[] = [];
      
      for (const operation of request.operations) {
        try {
          let result: ContextOperationResult;
          
          switch (operation.type) {
            case 'create':
              // 需要额外的owner信息，这里使用默认值
              result = await this.createContext(
                operation.data as CreateContextRequest,
                'system', // 默认系统用户
                'admin'   // 默认管理员角色
              );
              break;
              
            case 'update':
              result = await this.updateContext(operation.data as UpdateContextRequest);
              break;
              
            case 'delete':
              const deleteData = operation.data as { context_id: UUID };
              result = await this.deleteContext(deleteData.context_id);
              break;
              
            default:
              result = {
                success: false,
                error: new ValidationError(`Unknown operation type: ${operation.type}`)
              };
          }
          
          results.push(result);
          
        } catch (error) {
          results.push(this.buildErrorResult(error, 0));
        }
      }

      // 3. 构建响应
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      const response: BatchContextResponse = {
        results,
        summary: {
          total: results.length,
          successful,
          failed
        }
      };

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        data: response,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  /**
   * 获取上下文变更历史
   * 
   * @param contextId 上下文ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param pathFilter 路径过滤器
   * @returns 操作结果，包含变更历史
   */
  public async getContextHistory(
    contextId: UUID,
    limit: number = 100,
    offset: number = 0,
    startTime?: string,
    endTime?: string,
    pathFilter?: string
  ): Promise<ContextOperationResult<Array<{
    timestamp: string;
    path: string;
    value: unknown;
    previous_value: unknown;
    user_id?: string;
  }>>> {
    const startExecutionTime = Date.now();

    try {
      // 验证上下文存在
      const contextExists = await this.repository.exists(contextId);
      if (!contextExists) {
        return {
          success: false,
          error: new ContextError('Context not found', 'CONTEXT_NOT_FOUND', { contextId }),
          execution_time_ms: Date.now() - startExecutionTime
        };
      }

      // 从存储库获取历史记录
      // 注意：这里使用通用接口，保持厂商中立
      const historyResult = await this.repository.getContextHistory(
        contextId,
        {
          limit,
          offset,
          startTime,
          endTime,
          pathFilter
        }
      );

      return {
        success: true,
        data: historyResult,
        execution_time_ms: Date.now() - startExecutionTime
      };
    } catch (error) {
      // Assuming logger is available globally or imported elsewhere
      // logger.error('Failed to get context history', {
      //   context_id: contextId,
      //   error
      // });

      return {
        success: false,
        error: this.mapErrorToContextError(error), // Assuming mapErrorToContextError is defined elsewhere
        execution_time_ms: Date.now() - startExecutionTime
      };
    }
  }

  // ===== 状态管理方法 =====

  /**
   * 更新Context状态
   * 
   * @param contextId Context ID
   * @param status 新状态 - Schema: ContextStatus
   * @returns 操作结果
   */
  public async updateStatus(contextId: UUID, status: ContextStatus): Promise<ContextOperationResult<void>> {
    return this.updateContext({
      context_id: contextId,
      status
    }).then(result => ({
      success: result.success,
      error: result.error,
      execution_time_ms: result.execution_time_ms
    }));
  }

  /**
   * 更新生命周期阶段
   * 
   * @param contextId Context ID
   * @param stage 新阶段 - Schema: ContextLifecycleStage
   * @returns 操作结果
   */
  public async updateLifecycleStage(contextId: UUID, stage: ContextLifecycleStage): Promise<ContextOperationResult<void>> {
    return this.updateContext({
      context_id: contextId,
      lifecycle_stage: stage
    }).then(result => ({
      success: result.success,
      error: result.error,
      execution_time_ms: result.execution_time_ms
    }));
  }

  /**
   * 设置共享状态变量
   * 
   * @param contextId Context ID
   * @param key 状态变量键名
   * @param value 状态变量值
   * @param metadata 元数据
   * @returns 操作结果
   */
  public async setSharedState(
    contextId: UUID, 
    key: string, 
    value: unknown,
    metadata: Record<string, unknown> = {}
  ): Promise<ContextOperationResult<void>> {
    const startTime = performance.now();
    
    try {
      // 1. 检查Context是否存在
      const existingContext = await this.repository.findById(contextId);
      if (!existingContext) {
        throw new ContextError(`Context not found: ${contextId}`, 'CONTEXT_NOT_FOUND');
      }

      // 2. 更新共享状态
      const newSharedState = { ...existingContext.shared_state };
      
      // 确保variables存在
      if (!newSharedState.variables) {
        newSharedState.variables = {};
      }
      
      // 设置变量值
      newSharedState.variables[key] = value;
      
      // 3. 更新Context
      await this.repository.update(contextId, { 
        shared_state: newSharedState,
        timestamp: new Date().toISOString() 
      });

      // 4. 发射事件
      this.emit('shared_state_changed', {
        event_type: 'shared_state_changed',
        context_id: contextId,
        timestamp: new Date().toISOString(),
        data: {
          key,
          value,
          metadata
        },
        source: metadata.source_module || 'context_service'
      });

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        execution_time_ms: executionTime
      };

    } catch (error) {
      return this.buildErrorResult(error, performance.now() - startTime);
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 构建默认资源管理 (Schema要求)
   */
  private buildDefaultResourceManagement(requested?: Partial<ResourceManagement>): ResourceManagement {
    return {
      allocated: requested?.allocated || {},
      requirements: requested?.requirements || {}
    };
  }

  /**
   * 合并共享状态
   */
  private mergeSharedState(existing: SharedState, updates: Partial<SharedState>): SharedState {
    return {
      variables: { ...existing.variables, ...updates.variables },
      resources: updates.resources ? {
        allocated: { ...existing.resources.allocated, ...updates.resources.allocated },
        requirements: { ...existing.resources.requirements, ...updates.resources.requirements }
      } : existing.resources,
      dependencies: updates.dependencies || existing.dependencies,
      goals: updates.goals || existing.goals
    };
  }

  /**
   * 合并访问控制
   */
  private mergeAccessControl(existing: AccessControl, updates: Partial<AccessControl>): AccessControl {
    return {
      owner: updates.owner || existing.owner,
      permissions: updates.permissions || existing.permissions,
      policies: updates.policies || existing.policies
    };
  }

  /**
   * 合并配置
   */
  private mergeConfiguration(existing: ContextConfiguration, updates: Partial<ContextConfiguration>): ContextConfiguration {
    return {
      timeout_settings: updates.timeout_settings ? {
        ...existing.timeout_settings,
        ...updates.timeout_settings
      } : existing.timeout_settings,
      notification_settings: updates.notification_settings || existing.notification_settings,
      persistence: updates.persistence ? {
        ...existing.persistence,
        ...updates.persistence
      } : existing.persistence
    };
  }

  /**
   * 发射Context事件
   */
  private emitContextEvent(eventName: string, data: ContextEventData): void {
    this.emit(eventName, data);
    this.emit('context.event', { event: eventName, ...data });
  }

  /**
   * 构建错误结果
   */
  private buildErrorResult<T>(error: unknown, executionTime: number): ContextOperationResult<T> {
    let contextError: ContextError;
    
    if (error instanceof ContextError) {
      contextError = error;
    } else if (error instanceof Error) {
      contextError = new InternalError(error.message, { originalError: error });
    } else {
      contextError = new InternalError('Unknown error occurred', { error });
    }

    return {
      success: false,
      error: contextError,
      execution_time_ms: executionTime
    };
  }

  /**
   * 将外部错误映射到ContextError
   */
  private mapErrorToContextError(error: unknown): ContextError {
    if (error instanceof ContextError) {
      return error;
    }
    if (error instanceof Error) {
      return new InternalError(error.message, { originalError: error });
    }
    return new InternalError('Unknown error occurred', { error });
  }
} 
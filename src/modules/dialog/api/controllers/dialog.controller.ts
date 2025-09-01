/**
 * Dialog API Controller
 * @description Dialog模块API控制器 - HTTP接口层
 * @version 1.0.0
 */

import { DialogManagementService } from '../../application/services/dialog-management.service';
import { DialogMapper } from '../mappers/dialog.mapper';
import { DialogEntity } from '../../domain/entities/dialog.entity';
import { type UUID, type DialogOperation } from '../../types';

// 临时类型定义 (等待DTO文件修复)
interface CreateDialogDto {
  name: string;
  description?: string;
  participants: string[];
  capabilities?: unknown;
  strategy?: unknown;
  context?: unknown;
  configuration?: unknown;
  metadata?: Record<string, unknown>;
}

interface UpdateDialogDto {
  name?: string;
  description?: string;
  participants?: string[];
  capabilities?: unknown;
  strategy?: unknown;
  context?: unknown;
  configuration?: unknown;
  metadata?: Record<string, unknown>;
}

interface DialogResponseDto {
  success: boolean;
  status?: number;
  data?: unknown;
  error?: string;
  message?: string;
}

/**
 * Dialog API控制器类
 * 处理Dialog模块的HTTP请求
 */
export class DialogController {
  constructor(private readonly dialogManagementService: DialogManagementService) {}

  /**
   * 创建新对话
   * POST /api/v1/dialogs
   */
  async createDialog(request: CreateDialogRequest): Promise<DialogResponseDto> {
    try {
      // 验证请求数据
      const createDto = this._validateCreateRequest(request);

      // 转换为Schema格式
      const dialogSchema = this._mapCreateDtoToSchema(createDto);

      // 调用应用服务
      const dialogEntity = await this.dialogManagementService.createDialog(dialogSchema);

      // 转换为响应DTO
      const responseDto = this._mapEntityToResponseDto(dialogEntity);

      return {
        success: true,
        status: 201,
        data: responseDto,
        message: 'Dialog created successfully'
      };
    } catch (error) {
      return this._handleError('createDialog', error);
    }
  }

  /**
   * 获取对话详情
   * GET /api/v1/dialogs/:id
   */
  async getDialog(request: GetDialogRequest): Promise<DialogResponseDto> {
    try {
      // 验证请求参数（支持params.id格式）
      const id = (request as unknown as { params?: { id?: string } }).params?.id || (request as { id?: string }).id;
      if (!id) {
        throw new Error('Dialog ID is required');
      }
      const dialogId = this._validateDialogId(id);

      // 调用应用服务
      const dialogEntity = await this.dialogManagementService.getDialogById(dialogId);

      if (!dialogEntity) {
        return {
          success: false,
          status: 404,
          error: 'Dialog not found',
          message: `Dialog with ID ${dialogId} does not exist`
        };
      }

      // 转换为响应DTO
      const responseDto = this._mapEntityToResponseDto(dialogEntity);

      return {
        success: true,
        status: 200,
        data: responseDto,
        message: 'Dialog retrieved successfully'
      };
    } catch (error) {
      return this._handleError('getDialog', error);
    }
  }

  /**
   * 更新对话
   * PUT /api/v1/dialogs/:id
   */
  async updateDialog(request: UpdateDialogRequest): Promise<DialogResponseDto> {
    try {
      // 验证请求数据（支持params.id格式）
      const id = (request as unknown as { params?: { id?: string } }).params?.id || (request as { id?: string }).id;
      if (!id) {
        throw new Error('Dialog ID is required');
      }
      const dialogId = this._validateDialogId(id);

      // 支持从body中获取更新数据
      const updateData = (request as unknown as { body?: unknown }).body || request;
      const updateDto = this._validateUpdateRequest(updateData as UpdateDialogRequest);

      // 转换为Schema格式
      const updateSchema = this._mapUpdateDtoToSchema(updateDto);

      // 调用应用服务
      const dialogEntity = await this.dialogManagementService.updateDialog(dialogId, updateSchema);

      // 转换为响应DTO
      const responseDto = this._mapEntityToResponseDto(dialogEntity);

      return {
        success: true,
        status: 200,
        data: responseDto,
        message: 'Dialog updated successfully'
      };
    } catch (error) {
      return this._handleError('updateDialog', error);
    }
  }

  /**
   * 列出对话
   * GET /api/v1/dialogs
   */
  async listDialogs(request: ListDialogsRequest): Promise<DialogResponseDto> {
    try {
      // 获取查询参数
      const limit = request.limit || 10;
      const offset = request.offset || 0;

      // 调用应用服务
      const result = await this.dialogManagementService.listDialogs({ limit, offset });

      return {
        success: true,
        status: 200,
        data: {
          dialogs: result.dialogs.map(dialog => this._mapEntityToResponseDto(dialog)),
          total: result.total,
          limit,
          offset
        },
        message: 'Dialogs retrieved successfully'
      };
    } catch (error) {
      return this._handleError('listDialogs', error);
    }
  }

  /**
   * 删除对话
   * DELETE /api/v1/dialogs/:id
   */
  async deleteDialog(request: DeleteDialogRequest): Promise<DialogResponseDto> {
    try {
      // 验证请求参数（支持params.id格式）
      const id = (request as unknown as { params?: { id?: string } }).params?.id || (request as { id?: string }).id;
      if (!id) {
        throw new Error('Dialog ID is required');
      }
      const dialogId = this._validateDialogId(id);

      // 调用应用服务
      await this.dialogManagementService.deleteDialog(dialogId);

      return {
        success: true,
        status: 200,
        message: 'Dialog deleted successfully'
      };
    } catch (error) {
      return this._handleError('deleteDialog', error);
    }
  }

  /**
   * 开始对话
   * POST /api/v1/dialogs/:id/start
   */
  async startDialog(request: { params: { id: string } }): Promise<DialogResponseDto> {
    try {
      const dialogId = request.params.id;
      if (!dialogId) {
        throw new Error('Dialog ID is required');
      }

      // 获取现有对话并更新状态
      const dialog = await this.dialogManagementService.getDialogById(dialogId);
      if (!dialog) {
        throw new Error('Dialog not found');
      }

      // 更新对话操作状态
      const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
        dialog_operation: 'start'
      });

      return {
        success: true,
        status: 200,
        data: this._mapEntityToResponseDto(updatedDialog),
        message: 'Dialog started successfully'
      };
    } catch (error) {
      return this._handleError('startDialog', error);
    }
  }

  /**
   * 暂停对话
   * POST /api/v1/dialogs/:id/pause
   */
  async pauseDialog(request: { params: { id: string } }): Promise<DialogResponseDto> {
    try {
      const dialogId = request.params.id;
      if (!dialogId) {
        throw new Error('Dialog ID is required');
      }

      // 更新对话操作状态
      const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
        dialog_operation: 'pause'
      });

      return {
        success: true,
        status: 200,
        data: this._mapEntityToResponseDto(updatedDialog),
        message: 'Dialog paused successfully'
      };
    } catch (error) {
      return this._handleError('pauseDialog', error);
    }
  }

  /**
   * 恢复对话
   * POST /api/v1/dialogs/:id/resume
   */
  async resumeDialog(request: { params: { id: string } }): Promise<DialogResponseDto> {
    try {
      const dialogId = request.params.id;
      if (!dialogId) {
        throw new Error('Dialog ID is required');
      }

      // 更新对话操作状态
      const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
        dialog_operation: 'resume'
      });

      return {
        success: true,
        status: 200,
        data: this._mapEntityToResponseDto(updatedDialog),
        message: 'Dialog resumed successfully'
      };
    } catch (error) {
      return this._handleError('resumeDialog', error);
    }
  }

  /**
   * 结束对话
   * POST /api/v1/dialogs/:id/end
   */
  async endDialog(request: { params: { id: string } }): Promise<DialogResponseDto> {
    try {
      const dialogId = request.params.id;
      if (!dialogId) {
        throw new Error('Dialog ID is required');
      }

      // 更新对话操作状态
      const updatedDialog = await this.dialogManagementService.updateDialog(dialogId, {
        dialog_operation: 'end'
      });

      return {
        success: true,
        status: 200,
        data: this._mapEntityToResponseDto(updatedDialog),
        message: 'Dialog ended successfully'
      };
    } catch (error) {
      return this._handleError('endDialog', error);
    }
  }

  /**
   * 搜索对话
   * GET /api/v1/dialogs/search
   */
  async searchDialogs(request: { query?: string; fields?: string[]; limit?: number }): Promise<DialogResponseDto> {
    try {
      const searchQuery = {
        query: request.query || '',
        fields: request.fields || ['name', 'description'],
        limit: request.limit || 10
      };

      const result = await this.dialogManagementService.searchDialogs(searchQuery);

      return {
        success: true,
        status: 200,
        data: {
          dialogs: result.dialogs.map(dialog => this._mapEntityToResponseDto(dialog)),
          total: result.dialogs.length
        },
        message: 'Search completed successfully'
      };
    } catch (error) {
      return this._handleError('searchDialogs', error);
    }
  }

  /**
   * 添加参与者
   * POST /api/v1/dialogs/:id/participants
   */
  async addParticipant(request: { params: { id: string }; body: { participantId: string } }): Promise<DialogResponseDto> {
    try {
      const dialogId = request.params.id;
      const participantId = request.body.participantId;

      if (!dialogId) {
        throw new Error('Dialog ID is required');
      }
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const updatedDialog = await this.dialogManagementService.addParticipant(dialogId, participantId);

      return {
        success: true,
        status: 200,
        data: this._mapEntityToResponseDto(updatedDialog),
        message: 'Participant added successfully'
      };
    } catch (error) {
      return this._handleError('addParticipant', error);
    }
  }

  /**
   * 移除参与者
   * DELETE /api/v1/dialogs/:id/participants/:participantId
   */
  async removeParticipant(request: { params: { id: string; participantId: string } }): Promise<DialogResponseDto> {
    try {
      const dialogId = request.params.id;
      const participantId = request.params.participantId;

      if (!dialogId) {
        throw new Error('Dialog ID is required');
      }
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const updatedDialog = await this.dialogManagementService.removeParticipant(dialogId, participantId);

      return {
        success: true,
        status: 200,
        data: this._mapEntityToResponseDto(updatedDialog),
        message: 'Participant removed successfully'
      };
    } catch (error) {
      return this._handleError('removeParticipant', error);
    }
  }

  /**
   * 获取统计信息
   * GET /api/v1/dialogs/statistics
   */
  async getStatistics(): Promise<DialogResponseDto> {
    try {
      const statistics = await this.dialogManagementService.getDialogStatistics();

      return {
        success: true,
        status: 200,
        data: statistics,
        message: 'Statistics retrieved successfully'
      };
    } catch (error) {
      return this._handleError('getStatistics', error);
    }
  }

  /**
   * 执行对话操作
   * POST /api/v1/dialogs/:id/operations
   */
  async executeDialogOperation(request: ExecuteOperationRequest): Promise<DialogResponseDto> {
    try {
      // 验证请求数据
      const dialogId = this._validateDialogId(request.id);
      const operation = this._validateOperation(request.operation);

      // 调用应用服务
      await this.dialogManagementService.executeDialogOperation(dialogId, operation);

      return {
        success: true,
        message: `Dialog operation '${operation}' executed successfully`
      };
    } catch (error) {
      return this._handleError('executeDialogOperation', error);
    }
  }

  // ===== 私有辅助方法 =====

  private _validateCreateRequest(request: CreateDialogRequest): CreateDialogDto {
    // 支持从body中获取数据（用于测试）
    const requestBody = (request as unknown as { body?: unknown }).body;

    // 检查请求体是否存在（null或undefined）
    if (requestBody === null || requestBody === undefined) {
      const error = new Error('Request body is required') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    const data = requestBody || request;

    if (!(data as { name?: string }).name) {
      const error = new Error('Dialog name is required') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }
    if (!(data as { participants?: unknown[] }).participants || (data as { participants: unknown[] }).participants.length === 0) {
      const error = new Error('At least one participant is required') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }
    return data as CreateDialogDto;
  }

  private _validateUpdateRequest(request: UpdateDialogRequest): UpdateDialogDto {
    // 基本验证逻辑 - 更新请求可以是部分数据
    if (request.name !== undefined && (!request.name || request.name.trim().length === 0)) {
      throw new Error('Dialog name cannot be empty');
    }
    if (request.participants !== undefined && (!request.participants || request.participants.length === 0)) {
      throw new Error('At least one participant is required');
    }
    return request as UpdateDialogDto;
  }

  private _validateDialogId(id: string): UUID {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid dialog ID is required');
    }
    return id as UUID;
  }

  private _validateOperation(operation: string): DialogOperation {
    const validOperations: DialogOperation[] = ['start', 'continue', 'pause', 'resume', 'end'];
    if (!validOperations.includes(operation as DialogOperation)) {
      throw new Error(`Invalid operation: ${operation}. Valid operations: ${validOperations.join(', ')}`);
    }
    return operation as DialogOperation;
  }

  private _mapCreateDtoToSchema(dto: CreateDialogDto): Record<string, unknown> {
    return {
      dialog_id: (dto as CreateDialogDto & { dialogId?: string; dialog_id?: string }).dialogId || (dto as CreateDialogDto & { dialogId?: string; dialog_id?: string }).dialog_id, // 支持camelCase和snake_case
      name: dto.name,
      description: dto.description,
      participants: dto.participants,
      capabilities: dto.capabilities,
      strategy: dto.strategy,
      context: dto.context,
      configuration: dto.configuration,
      metadata: dto.metadata
    };
  }

  private _mapUpdateDtoToSchema(dto: UpdateDialogDto): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (dto.name !== undefined) result.name = dto.name;
    if (dto.description !== undefined) result.description = dto.description;
    if (dto.participants !== undefined) result.participants = dto.participants;
    if (dto.capabilities !== undefined) result.capabilities = dto.capabilities;
    if (dto.strategy !== undefined) result.strategy = dto.strategy;
    if (dto.context !== undefined) result.context = dto.context;
    if (dto.configuration !== undefined) result.configuration = dto.configuration;
    if (dto.metadata !== undefined) result.metadata = dto.metadata;

    return result;
  }

  private _mapEntityToResponseDto(entity: DialogEntity): Record<string, unknown> {
    // 转换实体为响应DTO，使用snake_case字段名
    const schema = DialogMapper.toSchema(entity);
    return {
      dialog_id: schema.dialog_id,
      name: schema.name,
      description: schema.description,
      participants: schema.participants,
      capabilities: schema.capabilities,
      strategy: schema.strategy,
      context: schema.context,
      configuration: schema.configuration,
      metadata: schema.metadata,
      audit_trail: schema.audit_trail,
      monitoring_integration: schema.monitoring_integration,
      performance_metrics: schema.performance_metrics,
      version_history: schema.version_history,
      search_metadata: schema.search_metadata,
      dialog_operation: schema.dialog_operation,
      dialog_details: schema.dialog_details,
      event_integration: schema.event_integration,
      protocol_version: schema.protocol_version,
      timestamp: schema.timestamp
    };
  }

  private _handleError(method: string, error: unknown): DialogResponseDto {
    // TODO: 使用统一的日志系统替代console.error
    // console.error(`DialogController.${method} error:`, error);

    // 检查是否有自定义状态码
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;

    return {
      success: false,
      status: statusCode,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: `Failed to ${method.replace(/([A-Z])/g, ' $1').toLowerCase()}`
    };
  }
}

// ===== 请求接口定义 =====

export interface CreateDialogRequest {
  name: string;
  description?: string;
  participants: string[];
  capabilities?: unknown;
  strategy?: unknown;
  context?: unknown;
  configuration?: unknown;
  metadata?: Record<string, unknown>;
}

export interface GetDialogRequest {
  id: string;
}

export interface UpdateDialogRequest {
  id: string;
  name?: string;
  description?: string;
  participants?: string[];
  capabilities?: unknown;
  strategy?: unknown;
  context?: unknown;
  configuration?: unknown;
  metadata?: Record<string, unknown>;
}

export interface DeleteDialogRequest {
  id: string;
}

export interface ListDialogsRequest {
  limit?: number;
  offset?: number;
}

export interface ExecuteOperationRequest {
  id: string;
  operation: string;
}

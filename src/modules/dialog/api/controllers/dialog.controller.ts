/**
 * MPLP Dialog Controller - API Controller
 *
 * @version v1.0.0
 * @created 2025-08-02T01:25:00+08:00
 * @description 对话API控制器，处理HTTP请求和响应
 */

import { Request as ExpressRequest, Response } from 'express';
import { DialogService } from '../../application/services/dialog.service';
import {
  CreateDialogRequest,
  UpdateDialogRequest,
  DialogInteractionRequest,
  DialogFilter,
  StatusOptions,
  DialogResponse,
  DialogInteractionResponse,
  DialogStatusResponse,
  QueryDialogResponse,
  DeleteResponse,
  // 向后兼容的旧版类型
  LegacyCreateDialogRequest,
  SendMessageRequest,
  DialogQueryParams,
  MessageQueryParams,
  AddParticipantRequest,
} from '../../types';
import { Logger } from '../../../../public/utils/logger';

// 扩展Request类型，包含我们需要的属性
interface Request extends ExpressRequest {
  body: any;
  params: Record<string, string>;
  query: Record<string, string | undefined>;
}

/**
 * 安全获取错误消息
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 对话API控制器
 */
export class DialogController {
  private logger = new Logger('DialogController');

  constructor(private dialogService: DialogService) {}

  /**
   * 创建对话 - 统一标准接口
   * POST /api/v1/dialogs
   */
  async createDialog(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('API: 创建对话 (统一接口)', { body: req.body });

      const request: CreateDialogRequest = req.body;

      // 验证统一接口的必需参数
      if (!request.name || !request.participants || !request.capabilities) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: name, participants, capabilities',
        });
        return;
      }

      if (request.participants.length < 1) {
        res.status(400).json({
          success: false,
          error: '对话至少需要1个参与者',
        });
        return;
      }

      // 验证capabilities.basic必须启用
      if (!request.capabilities.basic || !request.capabilities.basic.enabled) {
        res.status(400).json({
          success: false,
          error: 'capabilities.basic必须启用',
        });
        return;
      }

      const result = await this.dialogService.createDialog(request);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 创建对话失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
      });
    }
  }

  /**
   * 对话交互 - 统一标准接口
   * POST /api/v1/dialogs/:id/interact
   */
  async interactWithDialog(req: Request, res: Response): Promise<void> {
    try {
      const dialogId = req.params.id;
      this.logger.info('API: 对话交互 (统一接口)', { dialogId, body: req.body });

      if (!dialogId) {
        res.status(400).json({
          success: false,
          error: '缺少对话ID',
        });
        return;
      }

      const request: DialogInteractionRequest = {
        dialogId,
        ...req.body,
      };

      // 验证必需参数
      if (!request.content || !request.content.type) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: content.type',
        });
        return;
      }

      const result = await this.dialogService.interactWithDialog(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 对话交互失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
      });
    }
  }

  /**
   * 获取对话详情 - 向后兼容方法
   * GET /api/v1/dialog/:id
   */
  async getDialog(req: Request, res: Response): Promise<void> {
    try {
      const dialog_id = req.params.id;
      this.logger.info('API: 获取对话详情', { dialog_id });

      if (!dialog_id) {
        res.status(400).json({
          success: false,
          error: '缺少对话ID',
        });
        return;
      }

      const result = await this.dialogService.getDialog(dialog_id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 获取对话详情失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
      });
    }
  }

  /**
   * 获取对话状态 - 统一标准接口
   * GET /api/v1/dialogs/:id/status
   */
  async getDialogStatus(req: Request, res: Response): Promise<void> {
    try {
      const dialogId = req.params.id;
      const options: StatusOptions = {
        includeAnalysis: req.query.includeAnalysis === 'true',
        includePerformance: req.query.includePerformance === 'true',
        includeParticipants: req.query.includeParticipants === 'true',
      };

      this.logger.debug('API: 获取对话状态 (统一接口)', { dialogId, options });

      if (!dialogId) {
        res.status(400).json({
          success: false,
          error: '缺少对话ID',
        });
        return;
      }

      const result = await this.dialogService.getDialogStatus(dialogId, options);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 获取对话状态失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
      });
    }
  }

  /**
   * 删除对话 - 统一标准接口
   * DELETE /api/v1/dialogs/:id
   */
  async deleteDialog(req: Request, res: Response): Promise<void> {
    try {
      const dialogId = req.params.id;
      this.logger.info('API: 删除对话 (统一接口)', { dialogId });

      if (!dialogId) {
        res.status(400).json({
          success: false,
          error: '缺少对话ID',
        });
        return;
      }

      const result = await this.dialogService.deleteDialog(dialogId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 删除对话失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
      });
    }
  }

  /**
   * 查询对话列表 - 统一标准接口
   * GET /api/v1/dialogs
   */
  async queryDialogs(req: Request, res: Response): Promise<void> {
    try {
      const filter: DialogFilter = {
        status: req.query.status ? (req.query.status as string).split(',') as any[] : undefined,
        participants: req.query.participants ? (req.query.participants as string).split(',') : undefined,
        capabilities: req.query.capabilities ? (req.query.capabilities as string).split(',') : undefined,
        dateRange: req.query.startDate && req.query.endDate ? {
          start: req.query.startDate as string,
          end: req.query.endDate as string,
        } : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      this.logger.debug('API: 查询对话列表 (统一接口)', { filter });

      const result = await this.dialogService.queryDialogs(filter);

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('API: 查询对话列表失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
      });
    }
  }

  /**
   * 更新对话
   * PUT /api/v1/dialog/:id
   */
  async updateDialog(req: Request, res: Response): Promise<void> {
    try {
      const dialog_id = req.params.id;
      const updates = req.body;

      this.logger.info('API: 更新对话', { dialog_id, updates });

      const request: UpdateDialogRequest = {
        dialog_id,
        ...updates,
      };

      const result = await this.dialogService.updateDialog(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 更新对话失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }





  /**
   * 发送消息
   * POST /api/v1/dialog/:id/messages
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const dialog_id = req.params.id;
      const messageData = req.body;

      this.logger.info('API: 发送消息', { dialog_id, messageData });

      const request: SendMessageRequest = {
        dialog_id,
        ...messageData,
      };

      // 验证必需参数
      if (
        !request.sender_id ||
        !request.recipient_ids ||
        !request.type ||
        !request.content
      ) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: sender_id, recipient_ids, type, content',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.dialogService.sendMessage(request);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 发送消息失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 查询消息列表
   * GET /api/v1/dialog/:id/messages
   */
  async queryMessages(req: Request, res: Response): Promise<void> {
    try {
      const dialog_id = req.params.id;

      const params: MessageQueryParams = {
        dialog_id,
        sender_id: req.query.sender_id as string,
        recipient_id: req.query.recipient_id as string,
        type: req.query.type as any,
        status: req.query.status as any,
        from_timestamp: req.query.from_timestamp as string,
        to_timestamp: req.query.to_timestamp as string,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        offset: req.query.offset
          ? parseInt(req.query.offset as string)
          : undefined,
      };

      this.logger.debug('API: 查询消息列表', { params });

      const result = await this.dialogService.queryMessages(params);
      res.status(200).json(result);
    } catch (error) {
      this.logger.error('API: 查询消息列表失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 添加参与者
   * POST /api/v1/dialog/:id/participants
   */
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const dialog_id = req.params.id;
      const participantData = req.body;

      this.logger.info('API: 添加参与者', { dialog_id, participantData });

      const request: AddParticipantRequest = {
        dialog_id,
        ...participantData,
      };

      // 验证必需参数
      if (!request.agent_id || !request.role_id || !request.permissions) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: agent_id, role_id, permissions',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.dialogService.addParticipant(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 添加参与者失败', {
        error: getErrorMessage(error),
      });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

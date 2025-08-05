/**
 * MPLP Collab Controller - API Controller
 *
 * @version v1.0.0
 * @created 2025-08-02T01:13:00+08:00
 * @description 协作API控制器，处理HTTP请求和响应
 */

import { Request as ExpressRequest, Response } from 'express';
import { CollabService } from '../../application/services/collab.service';
import {
  CreateCollabRequest,
  UpdateCollabRequest,
  CollabQueryParams,
  AddParticipantRequest,
  RemoveParticipantRequest,
  CoordinationRequest,
} from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { validateCollabProtocol as _validateCollabProtocol } from '../../../../schemas';

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
 * 协作API控制器
 */
export class CollabController {
  private logger = new Logger('CollabController');

  constructor(private collabService: CollabService) {}

  /**
   * 创建协作
   * POST /api/v1/collab
   */
  async createCollab(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('API: 创建协作', { body: req.body });

      const request: CreateCollabRequest = req.body;

      // 使用Schema验证请求数据
      const validationResult = _validateCollabProtocol(request);
      if (!validationResult.valid) {
        res.status(400).json({
          success: false,
          error: `Schema验证失败: ${validationResult.errors?.join(', ') || '未知验证错误'}`,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 业务逻辑验证
      if (!request.participants || request.participants.length < 2) {
        res.status(400).json({
          success: false,
          error: '协作至少需要2个参与者',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.collabService.createCollab(request);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 创建协作失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 获取协作详情
   * GET /api/v1/collab/:id
   */
  async getCollab(req: Request, res: Response): Promise<void> {
    try {
      const collaboration_id = req.params.id;
      this.logger.debug('API: 获取协作详情', { collaboration_id });

      if (!collaboration_id) {
        res.status(400).json({
          success: false,
          error: '缺少协作ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.collabService.getCollab(collaboration_id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 获取协作详情失败', {
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
   * 更新协作
   * PUT /api/v1/collab/:id
   */
  async updateCollab(req: Request, res: Response): Promise<void> {
    try {
      const collaboration_id = req.params.id;
      const updates = req.body;

      this.logger.info('API: 更新协作', { collaboration_id, updates });

      const request: UpdateCollabRequest = {
        collaboration_id,
        ...updates,
      };

      const result = await this.collabService.updateCollab(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 更新协作失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 查询协作列表
   * GET /api/v1/collab
   */
  async queryCollabs(req: Request, res: Response): Promise<void> {
    try {
      const params: CollabQueryParams = {
        context_id: req.query.context_id as string,
        plan_id: req.query.plan_id as string,
        status: req.query.status as any,
        mode: req.query.mode as any,
        created_by: req.query.created_by as string,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        offset: req.query.offset
          ? parseInt(req.query.offset as string)
          : undefined,
        sort_by: req.query.sort_by as any,
        sort_order: req.query.sort_order as any,
      };

      this.logger.debug('API: 查询协作列表', { params });

      const result = await this.collabService.queryCollabs(params);
      res.status(200).json(result);
    } catch (error) {
      this.logger.error('API: 查询协作列表失败', {
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
   * 删除协作
   * DELETE /api/v1/collab/:id
   */
  async deleteCollab(req: Request, res: Response): Promise<void> {
    try {
      const collaboration_id = req.params.id;
      this.logger.info('API: 删除协作', { collaboration_id });

      const result = await this.collabService.deleteCollab(collaboration_id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 删除协作失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 添加参与者
   * POST /api/v1/collab/:id/participants
   */
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const collaboration_id = req.params.id;
      const participantData = req.body;

      this.logger.info('API: 添加参与者', {
        collaboration_id,
        participantData,
      });

      const request: AddParticipantRequest = {
        collaboration_id,
        ...participantData,
      };

      // 验证必需参数
      if (!request.agent_id || !request.role_id) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: agent_id, role_id',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.collabService.addParticipant(request);

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

  /**
   * 移除参与者
   * DELETE /api/v1/collab/:id/participants/:participantId
   */
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const collaboration_id = req.params.id;
      const participant_id = req.params.participantId;
      const { reason } = req.body;

      this.logger.info('API: 移除参与者', {
        collaboration_id,
        participant_id,
        reason,
      });

      const request: RemoveParticipantRequest = {
        collaboration_id,
        participant_id,
        reason,
      };

      const result = await this.collabService.removeParticipant(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 移除参与者失败', {
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
   * 执行协调操作
   * POST /api/v1/collab/:id/coordinate
   */
  async coordinate(req: Request, res: Response): Promise<void> {
    try {
      const collaboration_id = req.params.id;
      const { operation, parameters, initiated_by } = req.body;

      this.logger.info('API: 执行协调操作', {
        collaboration_id,
        operation,
        parameters,
      });

      const request: CoordinationRequest = {
        collaboration_id,
        operation,
        parameters,
        initiated_by,
      };

      // 验证必需参数
      if (!operation || !initiated_by) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: operation, initiated_by',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.collabService.coordinate(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 执行协调操作失败', {
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

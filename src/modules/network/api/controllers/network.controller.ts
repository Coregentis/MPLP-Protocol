/**
 * MPLP Network Controller - API Controller
 *
 * @version v1.0.0
 * @created 2025-08-02T01:35:00+08:00
 * @description 网络API控制器，处理HTTP请求和响应
 */

import { Request as ExpressRequest, Response } from 'express';
import { NetworkService } from '../../application/services/network.service';
import {
  CreateNetworkRequest,
  UpdateNetworkRequest,
  NetworkQueryParams,
  NodeDiscoveryRequest,
  NodeRegistrationRequest,
  RoutingRequest,
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
 * 网络API控制器
 */
export class NetworkController {
  private logger = new Logger('NetworkController');

  constructor(private networkService: NetworkService) {}

  /**
   * 创建网络
   * POST /api/v1/network
   */
  async createNetwork(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('API: 创建网络', { body: req.body });

      const request: CreateNetworkRequest = req.body;

      // 验证请求数据
      if (
        !request.context_id ||
        !request.name ||
        !request.topology ||
        !request.discovery_mechanism ||
        !request.routing_strategy
      ) {
        res.status(400).json({
          success: false,
          error:
            '缺少必需参数: context_id, name, topology, discovery_mechanism, routing_strategy',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!request.nodes || request.nodes.length === 0) {
        res.status(400).json({
          success: false,
          error: '网络至少需要1个节点',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.networkService.createNetwork(request);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 创建网络失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 获取网络详情
   * GET /api/v1/network/:id
   */
  async getNetwork(req: Request, res: Response): Promise<void> {
    try {
      const network_id = req.params.id;
      this.logger.debug('API: 获取网络详情', { network_id });

      if (!network_id) {
        res.status(400).json({
          success: false,
          error: '缺少网络ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.networkService.getNetwork(network_id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 获取网络详情失败', {
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
   * 更新网络
   * PUT /api/v1/network/:id
   */
  async updateNetwork(req: Request, res: Response): Promise<void> {
    try {
      const network_id = req.params.id;
      const updates = req.body;

      this.logger.info('API: 更新网络', { network_id, updates });

      const request: UpdateNetworkRequest = {
        network_id,
        ...updates,
      };

      const result = await this.networkService.updateNetwork(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 更新网络失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 查询网络列表
   * GET /api/v1/network
   */
  async queryNetworks(req: Request, res: Response): Promise<void> {
    try {
      const params: NetworkQueryParams = {
        context_id: req.query.context_id as string,
        status: req.query.status as any,
        topology: req.query.topology as any,
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

      this.logger.debug('API: 查询网络列表', { params });

      const result = await this.networkService.queryNetworks(params);
      res.status(200).json(result);
    } catch (error) {
      this.logger.error('API: 查询网络列表失败', {
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
   * 删除网络
   * DELETE /api/v1/network/:id
   */
  async deleteNetwork(req: Request, res: Response): Promise<void> {
    try {
      const network_id = req.params.id;
      this.logger.info('API: 删除网络', { network_id });

      const result = await this.networkService.deleteNetwork(network_id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      this.logger.error('API: 删除网络失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 发现节点
   * POST /api/v1/network/discover
   */
  async discoverNodes(req: Request, res: Response): Promise<void> {
    try {
      const request: NodeDiscoveryRequest = req.body;

      this.logger.info('API: 发现节点', { request });

      const result = await this.networkService.discoverNodes(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 发现节点失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 注册节点
   * POST /api/v1/network/:id/nodes
   */
  async registerNode(req: Request, res: Response): Promise<void> {
    try {
      const network_id = req.params.id;
      const nodeData = req.body;

      this.logger.info('API: 注册节点', { network_id, nodeData });

      const request: NodeRegistrationRequest = {
        network_id,
        ...nodeData,
      };

      // 验证必需参数
      if (!request.agent_id || !request.node_type || !request.capabilities) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: agent_id, node_type, capabilities',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.networkService.registerNode(request);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 注册节点失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 计算路由
   * POST /api/v1/network/:id/route
   */
  async calculateRoute(req: Request, res: Response): Promise<void> {
    try {
      const network_id = req.params.id;
      const routeData = req.body;

      this.logger.info('API: 计算路由', { network_id, routeData });

      const request: RoutingRequest = {
        network_id,
        ...routeData,
      };

      // 验证必需参数
      if (!request.source_node_id || !request.target_node_id) {
        res.status(400).json({
          success: false,
          error: '缺少必需参数: source_node_id, target_node_id',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.networkService.calculateRoute(request);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      this.logger.error('API: 计算路由失败', { error: getErrorMessage(error) });
      res.status(500).json({
        success: false,
        error: '内部服务器错误',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

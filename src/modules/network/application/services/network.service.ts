/**
 * MPLP Network Service - Application Service
 *
 * @version v1.0.0
 * @created 2025-08-02T01:33:00+08:00
 * @description 网络应用服务，处理网络相关的业务逻辑，基于network-manager.ts迁移
 */

import { v4 as uuidv4 } from 'uuid';
import { Network } from '../../domain/entities/network.entity';
import {
  NetworkRepository,
  NodeDiscoveryRepository,
  RoutingRepository,
} from '../../domain/repositories/network.repository';
import {
  CreateNetworkRequest,
  UpdateNetworkRequest,
  NetworkQueryParams,
  NodeDiscoveryRequest,
  NodeRegistrationRequest,
  RoutingRequest,
  NetworkResponse,
  NetworkListResponse,
  NodeDiscoveryResponse,
  RoutingResponse,
  NetworkNode,
} from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { IEventBus } from '../../../../core/event-bus';

/**
 * 安全获取错误消息
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 网络应用服务
 */
export class NetworkService {
  private logger = new Logger('NetworkService');

  constructor(
    private networkRepository: NetworkRepository,
    private nodeDiscoveryRepository: NodeDiscoveryRepository,
    private routingRepository: RoutingRepository,
    private eventBus: IEventBus
  ) {}

  /**
   * 创建网络
   */
  async createNetwork(request: CreateNetworkRequest): Promise<NetworkResponse> {
    try {
      this.logger.info('创建网络', { request });

      // 验证节点数量
      if (!request.nodes || request.nodes.length === 0) {
        return {
          success: false,
          error: '网络至少需要1个节点才能启动',
          timestamp: new Date().toISOString(),
        };
      }

      // 创建网络实体
      const network = new Network({
        context_id: request.context_id,
        name: request.name,
        description: request.description,
        topology: request.topology,
        nodes: request.nodes.map(n => ({
          ...n,
          node_id: uuidv4(),
        })),
        discovery_mechanism: request.discovery_mechanism,
        routing_strategy: request.routing_strategy,
        created_by: request.context_id, // 临时使用context_id
        metadata: request.metadata,
      });

      // 保存到仓储
      await this.networkRepository.save(network);

      // 注册所有节点
      for (const node of network.nodes) {
        await this.nodeDiscoveryRepository.registerNode(
          network.network_id,
          node
        );
      }

      // 发布事件
      this.eventBus.publish('network_created', {
        network_id: network.network_id,
        context_id: network.context_id,
        name: network.name,
        topology: network.topology,
        nodes_count: network.nodes.length,
      });

      this.logger.info('网络创建成功', { network_id: network.network_id });

      return {
        success: true,
        data: network.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('创建网络失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取网络详情
   */
  async getNetwork(network_id: string): Promise<NetworkResponse> {
    try {
      this.logger.debug('获取网络详情', { network_id });

      const network = await this.networkRepository.findById(network_id);
      if (!network) {
        return {
          success: false,
          error: '网络不存在',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: network.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('获取网络详情失败', {
        error: errorMessage,
        network_id,
      });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 更新网络
   */
  async updateNetwork(request: UpdateNetworkRequest): Promise<NetworkResponse> {
    try {
      this.logger.info('更新网络', { request });

      const network = await this.networkRepository.findById(request.network_id);
      if (!network) {
        return {
          success: false,
          error: '网络不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 更新基本信息
      if (
        request.name ||
        request.description !== undefined ||
        request.topology
      ) {
        network.updateBasicInfo({
          name: request.name,
          description: request.description,
          topology: request.topology,
        });
      }

      // 更新发现机制
      if (request.discovery_mechanism) {
        network.updateDiscoveryMechanism(request.discovery_mechanism);
      }

      // 更新路由策略
      if (request.routing_strategy) {
        network.updateRoutingStrategy(request.routing_strategy);
      }

      // 更新元数据
      if (request.metadata) {
        network.updateMetadata(request.metadata);
      }

      // 更新状态 - 修复：添加缺失的状态更新逻辑
      if (request.status) {
        network.updateStatus(request.status);
      }

      // 保存更新
      await this.networkRepository.save(network);

      // 发布事件
      this.eventBus.publish('network_updated', {
        network_id: network.network_id,
        updates: request,
      });

      this.logger.info('网络更新成功', { network_id: network.network_id });

      return {
        success: true,
        data: network.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('更新网络失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 查询网络列表
   */
  async queryNetworks(
    params: NetworkQueryParams
  ): Promise<NetworkListResponse> {
    try {
      this.logger.debug('查询网络列表', { params });

      const result = await this.networkRepository.findByQuery(params);

      return {
        success: true,
        data: {
          networks: result.networks.map(n => n.toObject()),
          total: result.total,
          limit: params.limit || 10,
          offset: params.offset || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('查询网络列表失败', { error: errorMessage, params });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 发现节点
   */
  async discoverNodes(
    request: NodeDiscoveryRequest
  ): Promise<NodeDiscoveryResponse> {
    try {
      this.logger.info('发现节点', { request });

      const nodes = await this.nodeDiscoveryRepository.discoverNodes(request);

      // 发布事件
      this.eventBus.publish('nodes_discovered', {
        network_id: request.network_id,
        node_count: nodes.length,
        filters: request,
      });

      this.logger.info('节点发现成功', {
        network_id: request.network_id,
        node_count: nodes.length,
      });

      return {
        success: true,
        data: nodes,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('发现节点失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 注册节点
   */
  async registerNode(
    request: NodeRegistrationRequest
  ): Promise<NetworkResponse> {
    try {
      this.logger.info('注册节点', { request });

      const network = await this.networkRepository.findById(request.network_id);
      if (!network) {
        return {
          success: false,
          error: '网络不存在',
          timestamp: new Date().toISOString(),
        };
      }

      const node: NetworkNode = {
        node_id: uuidv4(),
        agent_id: request.agent_id,
        node_type: request.node_type,
        status: 'online',
        capabilities: request.capabilities,
        address: request.address,
        metadata: request.metadata,
      };

      network.addNode(node);
      await this.networkRepository.save(network);
      await this.nodeDiscoveryRepository.registerNode(request.network_id, node);

      // 发布事件
      this.eventBus.publish('node_registered', {
        network_id: request.network_id,
        node_id: node.node_id,
        agent_id: request.agent_id,
        node_type: request.node_type,
      });

      this.logger.info('节点注册成功', {
        network_id: request.network_id,
        node_id: node.node_id,
      });

      return {
        success: true,
        data: network.toObject(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('注册节点失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 计算路由
   */
  async calculateRoute(request: RoutingRequest): Promise<RoutingResponse> {
    try {
      this.logger.info('计算路由', { request });

      // 检查缓存
      const cachedResult = await this.routingRepository.getCachedRoute(request);
      if (cachedResult) {
        this.logger.debug('使用缓存的路由结果', { request });
        return {
          success: true,
          data: cachedResult,
          timestamp: new Date().toISOString(),
        };
      }

      // 计算新路由
      const result = await this.routingRepository.calculateRoute(request);

      // 缓存结果
      await this.routingRepository.cacheRoute(request, result);

      // 发布事件
      this.eventBus.publish('route_calculated', {
        network_id: request.network_id,
        source_node_id: request.source_node_id,
        target_node_id: request.target_node_id,
        path_length: result.path.length,
        estimated_latency: result.estimated_latency,
      });

      this.logger.info('路由计算成功', {
        network_id: request.network_id,
        path_length: result.path.length,
      });

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('计算路由失败', { error: errorMessage, request });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 删除网络
   */
  async deleteNetwork(network_id: string): Promise<NetworkResponse> {
    try {
      this.logger.info('删除网络', { network_id });

      const network = await this.networkRepository.findById(network_id);
      if (!network) {
        return {
          success: false,
          error: '网络不存在',
          timestamp: new Date().toISOString(),
        };
      }

      // 清除路由缓存
      await this.routingRepository.clearRouteCache(network_id);

      // 删除网络
      await this.networkRepository.delete(network_id);

      // 发布事件
      this.eventBus.publish('network_deleted', {
        network_id,
      });

      this.logger.info('网络删除成功', { network_id });

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      this.logger.error('删除网络失败', { error: errorMessage, network_id });
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 列出网络（queryNetworks的别名）
   */
  async listNetworks(params: NetworkQueryParams): Promise<NetworkListResponse> {
    return this.queryNetworks(params);
  }
}

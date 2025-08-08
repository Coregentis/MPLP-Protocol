/**
 * MPLP Network Module Configuration
 *
 * @version v1.0.0
 * @created 2025-08-02T01:37:00+08:00
 * @description 网络模块配置，定义模块的依赖注入和初始化
 */

import * as express from 'express';
import { NetworkService } from './application/services/network.service';
import {
  MemoryNetworkRepository,
  MemoryNodeDiscoveryRepository,
  MemoryRoutingRepository,
} from './infrastructure/repositories/memory-network.repository';
import { NetworkController } from './api/controllers/network.controller';
import {
  NetworkRepository,
  NodeDiscoveryRepository,
  RoutingRepository,
} from './domain/repositories/network.repository';
import { NetworkModuleConfig } from './types';
import { EventBus } from '../../core/event-bus';
import { Logger } from '../../public/utils/logger';

/**
 * 网络模块类
 */
export class NetworkModule {
  private logger = new Logger('NetworkModule');
  private networkRepository!: NetworkRepository;
  private nodeDiscoveryRepository!: NodeDiscoveryRepository;
  private routingRepository!: RoutingRepository;
  private networkService!: NetworkService;
  private networkController!: NetworkController;
  private router!: unknown;

  constructor(private config: NetworkModuleConfig, private eventBus: EventBus) {
    this.initializeModule();
  }

  /**
   * 初始化模块
   */
  private initializeModule(): void {
    this.logger.info('初始化网络模块', { config: this.config });

    // 初始化仓储层
    this.networkRepository = new MemoryNetworkRepository();
    this.nodeDiscoveryRepository = new MemoryNodeDiscoveryRepository();
    this.routingRepository = new MemoryRoutingRepository();

    // 初始化应用服务层
    this.networkService = new NetworkService(
      this.networkRepository,
      this.nodeDiscoveryRepository,
      this.routingRepository,
      this.eventBus
    );

    // 初始化API控制器层
    this.networkController = new NetworkController(this.networkService);

    // 初始化路由
    this.initializeRoutes();

    this.logger.info('网络模块初始化完成');
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    this.router = (express as unknown).Router();

    // 网络CRUD路由
    this.router.post(
      '/',
      this.networkController.createNetwork.bind(this.networkController)
    );
    this.router.get(
      '/',
      this.networkController.queryNetworks.bind(this.networkController)
    );
    this.router.get(
      '/:id',
      this.networkController.getNetwork.bind(this.networkController)
    );
    this.router.put(
      '/:id',
      this.networkController.updateNetwork.bind(this.networkController)
    );
    this.router.delete(
      '/:id',
      this.networkController.deleteNetwork.bind(this.networkController)
    );

    // 节点发现和管理路由
    this.router.post(
      '/discover',
      this.networkController.discoverNodes.bind(this.networkController)
    );
    this.router.post(
      '/:id/nodes',
      this.networkController.registerNode.bind(this.networkController)
    );

    // 路由计算路由
    this.router.post(
      '/:id/route',
      this.networkController.calculateRoute.bind(this.networkController)
    );

    this.logger.debug('网络模块路由初始化完成');
  }

  /**
   * 获取模块路由
   */
  getRouter(): unknown {
    return this.router;
  }

  /**
   * 获取网络服务
   */
  getNetworkService(): NetworkService {
    return this.networkService;
  }

  /**
   * 获取网络仓储
   */
  getNetworkRepository(): NetworkRepository {
    return this.networkRepository;
  }

  /**
   * 获取节点发现仓储
   */
  getNodeDiscoveryRepository(): NodeDiscoveryRepository {
    return this.nodeDiscoveryRepository;
  }

  /**
   * 获取路由仓储
   */
  getRoutingRepository(): RoutingRepository {
    return this.routingRepository;
  }

  /**
   * 获取模块信息
   */
  getModuleInfo() {
    return {
      name: 'network',
      version: '1.0.0',
      description: '网络模块 - Agent网络拓扑和路由管理',
      routes: [
        'POST /network',
        'GET /network',
        'GET /network/:id',
        'PUT /network/:id',
        'DELETE /network/:id',
        'POST /network/discover',
        'POST /network/:id/nodes',
        'POST /network/:id/route',
      ],
      config: this.config,
    };
  }

  /**
   * 模块健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: unknown;
  }> {
    try {
      // 检查仓储连接
      const repositoryStatus = await this.checkRepositoryHealth();

      // 检查服务状态
      const serviceStatus = await this.checkServiceHealth();

      const isHealthy = repositoryStatus.healthy && serviceStatus.healthy;

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          repository: repositoryStatus,
          service: serviceStatus,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('网络模块健康检查失败', { error: errorMessage });
      return {
        status: 'unhealthy',
        details: {
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * 检查仓储健康状态
   */
  private async checkRepositoryHealth(): Promise<{
    healthy: boolean;
    details: unknown;
  }> {
    try {
      // 对于内存仓储，检查是否可以正常访问
      const stats = await this.networkRepository.getStatistics();
      return {
        healthy: true,
        details: {
          type: 'memory',
          statistics: stats,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * 检查服务健康状态
   */
  private async checkServiceHealth(): Promise<{
    healthy: boolean;
    details: unknown;
  }> {
    try {
      // 检查服务是否正常初始化
      const isInitialized = this.networkService !== null;
      return {
        healthy: isInitialized,
        details: {
          initialized: isInitialized,
          config: this.config,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * 关闭模块
   */
  async shutdown(): Promise<void> {
    this.logger.info('关闭网络模块');

    try {
      // 清理资源
      if (this.networkRepository instanceof MemoryNetworkRepository) {
        await (this.networkRepository as unknown).clear?.();
      }
      if (
        this.nodeDiscoveryRepository instanceof MemoryNodeDiscoveryRepository
      ) {
        await (this.nodeDiscoveryRepository as unknown).clear?.();
      }
      if (this.routingRepository instanceof MemoryRoutingRepository) {
        await (this.routingRepository as unknown).clear?.();
      }

      this.logger.info('网络模块关闭完成');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('网络模块关闭失败', { error: errorMessage });
      throw error;
    }
  }
}

/**
 * 创建网络模块实例
 */
export function createNetworkModule(
  config: NetworkModuleConfig,
  eventBus: EventBus
): NetworkModule {
  return new NetworkModule(config, eventBus);
}

/**
 * 默认网络模块配置
 */
export const defaultNetworkConfig: NetworkModuleConfig = {
  max_nodes: 1000,
  max_networks: 100,
  discovery_timeout: 10000,
  routing_timeout: 5000,
  enable_monitoring: true,
  enable_caching: true,
  cache_ttl: 3600,
  health_check_interval: 30000,
};

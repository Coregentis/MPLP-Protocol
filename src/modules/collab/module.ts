/**
 * MPLP Collab Module Configuration
 *
 * @version v1.0.0
 * @created 2025-08-02T01:15:00+08:00
 * @description 协作模块配置，定义模块的依赖注入和初始化
 */

import express from 'express';
import { CollabService } from './application/services/collab.service';
import { MemoryCollabRepository } from './infrastructure/repositories/memory-collab.repository';
import { CollabController } from './api/controllers/collab.controller';
import { CollabRepository } from './domain/repositories/collab.repository';
import { CollabModuleConfig } from './types';
import { EventBus } from '../../core/event-bus';
import { Logger } from '../../public/utils/logger';

/**
 * 协作模块类
 */
export class CollabModule {
  private logger = new Logger('CollabModule');
  private collabRepository!: CollabRepository;
  private collabService!: CollabService;
  private collabController!: CollabController;
  private router!: unknown; // Express Router instance

  constructor(private config: CollabModuleConfig, private eventBus: EventBus) {
    this.initializeModule();
  }

  /**
   * 初始化模块
   */
  private initializeModule(): void {
    this.logger.info('初始化协作模块', { config: this.config });

    // 初始化仓储层
    this.collabRepository = new MemoryCollabRepository();

    // 初始化应用服务层
    this.collabService = new CollabService(
      this.collabRepository,
      this.eventBus
    );

    // 初始化API控制器层
    this.collabController = new CollabController(this.collabService);

    // 初始化路由
    this.initializeRoutes();

    this.logger.info('协作模块初始化完成');
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    this.router = (express as { Router: () => unknown }).Router();

    const router = this.router as {
      post: (path: string, handler: Function) => void;
      get: (path: string, handler: Function) => void;
      put: (path: string, handler: Function) => void;
      delete: (path: string, handler: Function) => void;
    };

    // 协作CRUD路由
    router.post(
      '/',
      this.collabController.createCollab.bind(this.collabController)
    );
    router.get(
      '/',
      this.collabController.queryCollabs.bind(this.collabController)
    );
    router.get(
      '/:id',
      this.collabController.getCollab.bind(this.collabController)
    );
    router.put(
      '/:id',
      this.collabController.updateCollab.bind(this.collabController)
    );
    router.delete(
      '/:id',
      this.collabController.deleteCollab.bind(this.collabController)
    );

    // 参与者管理路由
    router.post(
      '/:id/participants',
      this.collabController.addParticipant.bind(this.collabController)
    );
    router.delete(
      '/:id/participants/:participantId',
      this.collabController.removeParticipant.bind(this.collabController)
    );

    // 协调操作路由
    router.post(
      '/:id/coordinate',
      this.collabController.coordinate.bind(this.collabController)
    );

    this.logger.debug('协作模块路由初始化完成');
  }

  /**
   * 获取模块路由
   */
  getRouter(): unknown {
    return this.router;
  }

  /**
   * 获取协作服务
   */
  getCollabService(): CollabService {
    return this.collabService;
  }

  /**
   * 获取协作仓储
   */
  getCollabRepository(): CollabRepository {
    return this.collabRepository;
  }

  /**
   * 获取模块信息
   */
  getModuleInfo() {
    return {
      name: 'collab',
      version: '1.0.0',
      description: '协作模块 - 多Agent协作调度和协调',
      routes: [
        'POST /collab',
        'GET /collab',
        'GET /collab/:id',
        'PUT /collab/:id',
        'DELETE /collab/:id',
        'POST /collab/:id/participants',
        'DELETE /collab/:id/participants/:participantId',
        'POST /collab/:id/coordinate',
      ],
      config: this.config,
    };
  }

  /**
   * 模块健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: Record<string, unknown>;
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
      this.logger.error('协作模块健康检查失败', { error: errorMessage });
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
    details: Record<string, unknown>;
  }> {
    try {
      // 对于内存仓储，检查是否可以正常访问
      const stats = await this.collabRepository.getStatistics();
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
    details: Record<string, unknown>;
  }> {
    try {
      // 检查服务是否正常初始化
      const isInitialized = this.collabService !== null;
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
    this.logger.info('关闭协作模块');

    try {
      // 清理资源
      if (this.collabRepository instanceof MemoryCollabRepository) {
        await (this.collabRepository as { clear?: () => Promise<void> }).clear?.();
      }

      this.logger.info('协作模块关闭完成');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('协作模块关闭失败', { error: errorMessage });
      throw error;
    }
  }
}

/**
 * 创建协作模块实例
 */
export function createCollabModule(
  config: CollabModuleConfig,
  eventBus: EventBus
): CollabModule {
  return new CollabModule(config, eventBus);
}

/**
 * 默认协作模块配置
 */
export const defaultCollabConfig: CollabModuleConfig = {
  max_participants: 100,
  default_coordination_timeout: 30000,
  enable_conflict_detection: true,
  enable_performance_monitoring: true,
  cache_ttl: 3600,
  event_retention_days: 30,
};

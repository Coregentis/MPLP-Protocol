/**
 * MPLP Dialog Module Configuration
 *
 * @version v1.0.0
 * @created 2025-08-02T01:27:00+08:00
 * @description 对话模块配置，定义模块的依赖注入和初始化
 */

import express from 'express';
import { DialogService } from './application/services/dialog.service';
import {
  MemoryDialogRepository,
  MemoryMessageRepository,
} from './infrastructure/repositories/memory-dialog.repository';
import { DialogController } from './api/controllers/dialog.controller';
import {
  DialogRepository,
  MessageRepository,
} from './domain/repositories/dialog.repository';
import { DialogModuleConfig } from './types';
import { EventBus } from '../../core/event-bus';
import { Logger } from '../../public/utils/logger';

/**
 * 对话模块类
 */
export class DialogModule {
  private logger = new Logger('DialogModule');
  private dialogRepository!: DialogRepository;
  private messageRepository!: MessageRepository;
  private dialogService!: DialogService;
  private dialogController!: DialogController;
  private router!: unknown; // Express Router instance

  constructor(private config: DialogModuleConfig, private eventBus: EventBus) {
    this.initializeModule();
  }

  /**
   * 初始化模块
   */
  private initializeModule(): void {
    this.logger.info('初始化对话模块', { config: this.config });

    // 初始化仓储层
    this.dialogRepository = new MemoryDialogRepository();
    this.messageRepository = new MemoryMessageRepository();

    // 初始化应用服务层
    this.dialogService = new DialogService(
      this.dialogRepository,
      this.messageRepository,
      this.eventBus
    );

    // 初始化API控制器层
    this.dialogController = new DialogController(this.dialogService);

    // 初始化路由
    this.initializeRoutes();

    this.logger.info('对话模块初始化完成');
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

    // 对话CRUD路由
    router.post(
      '/',
      this.dialogController.createDialog.bind(this.dialogController)
    );
    router.get(
      '/',
      this.dialogController.queryDialogs.bind(this.dialogController)
    );
    router.get(
      '/:id',
      this.dialogController.getDialog.bind(this.dialogController)
    );
    router.put(
      '/:id',
      this.dialogController.updateDialog.bind(this.dialogController)
    );
    router.delete(
      '/:id',
      this.dialogController.deleteDialog.bind(this.dialogController)
    );

    // 消息管理路由
    router.post(
      '/:id/messages',
      this.dialogController.sendMessage.bind(this.dialogController)
    );
    router.get(
      '/:id/messages',
      this.dialogController.queryMessages.bind(this.dialogController)
    );

    // 参与者管理路由
    router.post(
      '/:id/participants',
      this.dialogController.addParticipant.bind(this.dialogController)
    );

    this.logger.debug('对话模块路由初始化完成');
  }

  /**
   * 获取模块路由
   */
  getRouter(): unknown {
    return this.router;
  }

  /**
   * 获取对话服务
   */
  getDialogService(): DialogService {
    return this.dialogService;
  }

  /**
   * 获取对话仓储
   */
  getDialogRepository(): DialogRepository {
    return this.dialogRepository;
  }

  /**
   * 获取消息仓储
   */
  getMessageRepository(): MessageRepository {
    return this.messageRepository;
  }

  /**
   * 获取模块信息
   */
  getModuleInfo() {
    return {
      name: 'dialog',
      version: '1.0.0',
      description: '对话模块 - Agent间通信对话管理',
      routes: [
        'POST /dialog',
        'GET /dialog',
        'GET /dialog/:id',
        'PUT /dialog/:id',
        'DELETE /dialog/:id',
        'POST /dialog/:id/messages',
        'GET /dialog/:id/messages',
        'POST /dialog/:id/participants',
      ],
      config: this.config,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: Record<string, unknown>;
  }> {
    try {
      const repositoryHealth = {
        healthy: true,
        details: {
          type: 'memory',
          statistics: {
            dialogs: 0,
            messages: 0
          }
        }
      };

      const serviceHealth = {
        healthy: true,
        details: {
          initialized: true,
          config: this.config
        }
      };

      return {
        status: 'healthy',
        details: {
          repository: repositoryHealth,
          service: serviceHealth,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * 模块关闭
   */
  async shutdown(): Promise<void> {
    try {
      if (this.dialogRepository && typeof (this.dialogRepository as unknown as { clear: () => Promise<void> }).clear === 'function') {
        await (this.dialogRepository as unknown as { clear: () => Promise<void> }).clear();
      }
      this.logger.info('Dialog module shutdown completed');
    } catch (error) {
      this.logger.error('Dialog module shutdown failed', { error });
      throw error;
    }
  }
}

/**
 * 默认Dialog模块配置
 */
export const defaultDialogConfig: DialogModuleConfig = {
  max_participants: 100,
  max_message_length: 10240,
  message_retention_days: 30,
  enable_encryption: false,
  enable_audit_logging: true,
  cache_ttl: 3600,
  connection_timeout: 30000
};

/**
 * 创建Dialog模块实例
 */
export function createDialogModule(
  config: DialogModuleConfig,
  eventBus: EventBus
): DialogModule {
  return new DialogModule(config, eventBus);
}
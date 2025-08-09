/**
 * Confirm管理服务
 * 
 * 应用层服务，协调领域对象和基础设施层
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { Confirm } from '../../domain/entities/confirm.entity';
import { IConfirmRepository, ConfirmFilter, PaginationOptions, PaginatedResult } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmFactory, CreateConfirmRequest } from '../../domain/factories/confirm.factory';
import { ConfirmValidationService } from '../../domain/services/confirm-validation.service';
import { ConfirmEventManager, ConfirmEventType } from '../../domain/services/confirm-event-manager.service';
import { NotificationService, NotificationConfig, NotificationChannel } from '../../domain/services/notification.service';
import { EventPushService } from '../../domain/services/event-push.service';
import {
  ConfirmStatus,
  ConfirmDecision,
  ConfirmationType,
  Priority
} from '../../types';

/**
 * 确认统计信息接口
 */
export interface ConfirmStatistics {
  total: number;
  by_status: Record<ConfirmStatus, number>;
  by_type: Record<ConfirmationType, number>;
  by_priority: Record<Priority, number>;
}

/**
 * 操作结果
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Confirm管理服务
 */
export class ConfirmManagementService {
  private eventManager?: ConfirmEventManager;

  constructor(
    private readonly confirmRepository: IConfirmRepository,
    private readonly validationService: ConfirmValidationService
  ) {}

  /**
   * 设置事件管理器
   */
  setEventManager(eventManager: ConfirmEventManager): void {
    this.eventManager = eventManager;
  }

  /**
   * 初始化通知和事件系统
   */
  initializeEventSystem(): ConfirmEventManager {
    // 创建默认通知配置
    const notificationConfig: NotificationConfig = {
      enableRealtime: true,
      enableEmail: true,
      enableSMS: false,
      enablePush: true,
      enableWebhook: false,
      defaultChannels: [NotificationChannel.WEBSOCKET, NotificationChannel.EMAIL],
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      templates: {
        confirmation_created: {
          subject: '新的确认请求已创建',
          content: '您有一个新的确认请求需要处理'
        },
        approval_request: {
          subject: '需要您的审批',
          content: '请查看并处理审批请求'
        },
        approval_submitted: {
          subject: '审批已提交',
          content: '您的审批已成功提交'
        },
        confirmation_approved: {
          subject: '确认已批准',
          content: '确认请求已获得批准'
        },
        confirmation_rejected: {
          subject: '确认已拒绝',
          content: '确认请求已被拒绝'
        },
        confirmation_cancelled: {
          subject: '确认已取消',
          content: '确认请求已被取消'
        },
        confirmation_expired: {
          subject: '确认已过期',
          content: '确认请求已过期'
        },
        escalation_triggered: {
          subject: '确认已升级',
          content: '确认请求已升级处理'
        },
        reminder_sent: {
          subject: '提醒通知',
          content: '这是一个提醒通知'
        }
      }
    };

    // 创建服务实例
    const notificationService = new NotificationService(notificationConfig);
    const eventPushService = new EventPushService();
    const eventManager = new ConfirmEventManager(notificationService, eventPushService);

    this.eventManager = eventManager;
    return eventManager;
  }

  /**
   * 创建确认
   */
  async createConfirm(request: CreateConfirmRequest): Promise<OperationResult<Confirm>> {
    try {
      // 验证请求
      const validation = this.validationService.validateCreateRequest(
        request.contextId,
        request.confirmationType,
        request.priority,
        request.subject,
        request.requester,
        request.approvalWorkflow
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; ')
        };
      }

      // 创建确认实体
      const confirm = ConfirmFactory.create(request);

      // 设置事件管理器
      if (this.eventManager) {
        confirm.setEventManager(this.eventManager);
      }

      // 保存到仓库
      await this.confirmRepository.save(confirm);

      // 触发确认创建事件
      if (this.eventManager) {
        await this.eventManager.emitEvent(ConfirmEventType.CONFIRMATION_CREATED, {
          eventType: ConfirmEventType.CONFIRMATION_CREATED,
          confirmId: confirm.confirmId,
          contextId: confirm.contextId,
          planId: confirm.planId,
          userId: confirm.requester.userId,
          status: confirm.status,
          metadata: confirm.metadata as Record<string, unknown> | undefined
        });
      }

      return {
        success: true,
        data: confirm,
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建确认失败'
      };
    }
  }

  /**
   * 获取确认详情
   */
  async getConfirmById(confirmId: UUID): Promise<OperationResult<Confirm>> {
    try {
      const confirm = await this.confirmRepository.findById(confirmId);
      
      if (!confirm) {
        return {
          success: false,
          error: '确认不存在'
        };
      }

      return {
        success: true,
        data: confirm
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取确认失败'
      };
    }
  }

  /**
   * 更新确认状态
   */
  async updateConfirmStatus(
    confirmId: UUID, 
    newStatus: ConfirmStatus,
    decision?: ConfirmDecision
  ): Promise<OperationResult<Confirm>> {
    try {
      const confirm = await this.confirmRepository.findById(confirmId);
      
      if (!confirm) {
        return {
          success: false,
          error: '确认不存在'
        };
      }

      // 验证状态转换
      const validation = this.validationService.validateStatusTransition(confirm.status, newStatus);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; ')
        };
      }

      // 更新状态
      confirm.updateStatus(newStatus);

      // 如果提供了决策，设置决策
      if (decision) {
        confirm.setDecision(decision);
      }

      // 保存更新
      await this.confirmRepository.update(confirm);

      return {
        success: true,
        data: confirm,
        warnings: validation.warnings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新确认状态失败'
      };
    }
  }

  /**
   * 取消确认
   */
  async cancelConfirm(confirmId: UUID): Promise<OperationResult<Confirm>> {
    try {
      const confirm = await this.confirmRepository.findById(confirmId);
      
      if (!confirm) {
        return {
          success: false,
          error: '确认不存在'
        };
      }

      if (!confirm.canCancel()) {
        return {
          success: false,
          error: `无法取消状态为 ${confirm.status} 的确认`
        };
      }

      confirm.cancel();
      await this.confirmRepository.update(confirm);

      return {
        success: true,
        data: confirm
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '取消确认失败'
      };
    }
  }

  /**
   * 查询确认列表
   */
  async queryConfirms(
    filter: ConfirmFilter,
    pagination?: PaginationOptions
  ): Promise<OperationResult<PaginatedResult<Confirm>>> {
    try {
      const result = await this.confirmRepository.findByFilter(filter, pagination);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询确认列表失败'
      };
    }
  }

  /**
   * 获取待处理确认
   */
  async getPendingConfirms(userId?: string): Promise<OperationResult<Confirm[]>> {
    try {
      const confirms = await this.confirmRepository.findPending(userId);
      
      return {
        success: true,
        data: confirms
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取待处理确认失败'
      };
    }
  }

  /**
   * 处理过期确认
   */
  async processExpiredConfirms(): Promise<OperationResult<number>> {
    try {
      const expiredConfirms = await this.confirmRepository.findExpired();
      let processedCount = 0;

      for (const confirm of expiredConfirms) {
        if (confirm.status === ConfirmStatus.PENDING || confirm.status === ConfirmStatus.IN_REVIEW) {
          confirm.updateStatus(ConfirmStatus.EXPIRED);
          await this.confirmRepository.update(confirm);
          processedCount++;
        }
      }

      return {
        success: true,
        data: processedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '处理过期确认失败'
      };
    }
  }

  /**
   * 获取确认统计信息
   */
  async getConfirmStatistics(contextId?: UUID): Promise<OperationResult<ConfirmStatistics>> {
    try {
      const statistics = await this.confirmRepository.getStatistics(contextId);
      
      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取确认统计信息失败'
      };
    }
  }

  /**
   * 批量更新确认状态
   */
  async batchUpdateStatus(
    confirmIds: UUID[], 
    status: ConfirmStatus
  ): Promise<OperationResult<number>> {
    try {
      await this.confirmRepository.batchUpdateStatus(confirmIds, status);
      
      return {
        success: true,
        data: confirmIds.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量更新确认状态失败'
      };
    }
  }
}

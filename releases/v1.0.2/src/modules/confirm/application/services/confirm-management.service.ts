/**
 * Confirm管理服务
 * 
 * 应用层服务，协调领域对象和基础设施层
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Confirm } from '../../domain/entities/confirm.entity';
import { IConfirmRepository, ConfirmFilter, PaginationOptions, PaginatedResult } from '../../domain/repositories/confirm-repository.interface';
import { ConfirmFactory, CreateConfirmRequest } from '../../domain/factories/confirm.factory';
import { ConfirmValidationService } from '../../domain/services/confirm-validation.service';
import { 
  ConfirmStatus, 
  ConfirmDecision,
  ConfirmProtocol 
} from '../../shared/types';

/**
 * 操作结果
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Confirm管理服务
 */
export class ConfirmManagementService {
  constructor(
    private readonly confirmRepository: IConfirmRepository,
    private readonly confirmFactory: ConfirmFactory,
    private readonly validationService: ConfirmValidationService
  ) {}

  /**
   * 创建确认
   */
  async createConfirm(request: CreateConfirmRequest): Promise<OperationResult<Confirm>> {
    try {
      // 验证请求
      const validation = this.validationService.validateCreateRequest(
        request.context_id,
        request.confirmation_type,
        request.priority,
        request.subject,
        request.requester,
        request.approval_workflow
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; ')
        };
      }

      // 创建确认实体
      const confirm = ConfirmFactory.create(request);

      // 保存到仓库
      await this.confirmRepository.save(confirm);

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
        if (confirm.status === 'pending' || confirm.status === 'in_review') {
          confirm.updateStatus('expired');
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
  async getConfirmStatistics(contextId?: UUID): Promise<OperationResult<any>> {
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

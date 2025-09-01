/**
 * Confirm控制器
 * 
 * @description Confirm模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */

import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { 
  CreateConfirmRequest, 
  UpdateConfirmRequest, 
  ConfirmQueryFilter,
  ConfirmEntityData,
  UUID 
} from '../../types';
import { PaginationParams, PaginatedResult } from '../../domain/repositories/confirm-repository.interface';

/**
 * API响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Confirm控制器
 * 
 * @description 提供Confirm模块的REST API接口
 */
export class ConfirmController {
  
  constructor(private readonly confirmService: ConfirmManagementService) {}

  /**
   * 创建确认
   * POST /confirms
   */
  async createConfirm(request: CreateConfirmRequest): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.createConfirm(request);
      
      return {
        success: true,
        data: confirm,
        message: 'Confirmation created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 审批确认
   * POST /confirms/:confirmId/approve
   */
  async approveConfirm(confirmId: UUID, approverId: UUID, comments?: string): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.approveConfirm(confirmId, approverId, comments);
      
      return {
        success: true,
        data: confirm,
        message: 'Confirmation approved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 拒绝确认
   * POST /confirms/:confirmId/reject
   */
  async rejectConfirm(confirmId: UUID, approverId: UUID, reason: string): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.rejectConfirm(confirmId, approverId, reason);
      
      return {
        success: true,
        data: confirm,
        message: 'Confirmation rejected successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 委派确认
   * POST /confirms/:confirmId/delegate
   */
  async delegateConfirm(confirmId: UUID, fromApproverId: UUID, toApproverId: UUID, reason?: string): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.delegateConfirm(confirmId, fromApproverId, toApproverId, reason);
      
      return {
        success: true,
        data: confirm,
        message: 'Confirmation delegated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 升级确认
   * POST /confirms/:confirmId/escalate
   */
  async escalateConfirm(confirmId: UUID, reason: string): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.escalateConfirm(confirmId, reason);
      
      return {
        success: true,
        data: confirm,
        message: 'Confirmation escalated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 更新确认
   * PUT /confirms/:confirmId
   */
  async updateConfirm(confirmId: UUID, updates: UpdateConfirmRequest): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.updateConfirm(confirmId, updates);
      
      return {
        success: true,
        data: confirm,
        message: 'Confirmation updated successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 删除确认
   * DELETE /confirms/:confirmId
   */
  async deleteConfirm(confirmId: UUID): Promise<ApiResponse<void>> {
    try {
      await this.confirmService.deleteConfirm(confirmId);
      
      return {
        success: true,
        message: 'Confirmation deleted successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取确认
   * GET /confirms/:confirmId
   */
  async getConfirm(confirmId: UUID): Promise<ApiResponse<ConfirmEntityData>> {
    try {
      const confirm = await this.confirmService.getConfirm(confirmId);
      
      return {
        success: true,
        data: confirm,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 列出确认
   * GET /confirms
   */
  async listConfirms(pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmEntityData>>> {
    try {
      const confirms = await this.confirmService.listConfirms(pagination);
      
      return {
        success: true,
        data: confirms,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 查询确认
   * POST /confirms/query
   */
  async queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmEntityData>>> {
    try {
      const confirms = await this.confirmService.queryConfirms(filter, pagination);
      
      return {
        success: true,
        data: confirms,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取统计信息
   * GET /confirms/statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }>> {
    try {
      const statistics = await this.confirmService.getStatistics();
      
      return {
        success: true,
        data: statistics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 健康检查
   * GET /confirms/health
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      return {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        },
        message: 'Confirm controller is healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

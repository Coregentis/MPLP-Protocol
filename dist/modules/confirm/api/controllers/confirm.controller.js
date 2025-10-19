"use strict";
/**
 * Confirm控制器
 *
 * @description Confirm模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmController = void 0;
/**
 * Confirm控制器
 *
 * @description 提供Confirm模块的REST API接口
 */
class ConfirmController {
    constructor(confirmService) {
        this.confirmService = confirmService;
    }
    /**
     * 创建确认
     * POST /confirms
     */
    async createConfirm(request) {
        try {
            const confirm = await this.confirmService.createConfirm(request);
            return {
                success: true,
                data: confirm,
                message: 'Confirmation created successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async approveConfirm(confirmId, approverId, comments) {
        try {
            const confirm = await this.confirmService.approveConfirm(confirmId, approverId, comments);
            return {
                success: true,
                data: confirm,
                message: 'Confirmation approved successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async rejectConfirm(confirmId, approverId, reason) {
        try {
            const confirm = await this.confirmService.rejectConfirm(confirmId, approverId, reason);
            return {
                success: true,
                data: confirm,
                message: 'Confirmation rejected successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async delegateConfirm(confirmId, fromApproverId, toApproverId, reason) {
        try {
            const confirm = await this.confirmService.delegateConfirm(confirmId, fromApproverId, toApproverId, reason);
            return {
                success: true,
                data: confirm,
                message: 'Confirmation delegated successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async escalateConfirm(confirmId, reason) {
        try {
            const confirm = await this.confirmService.escalateConfirm(confirmId, reason);
            return {
                success: true,
                data: confirm,
                message: 'Confirmation escalated successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async updateConfirm(confirmId, updates) {
        try {
            const confirm = await this.confirmService.updateConfirm(confirmId, updates);
            return {
                success: true,
                data: confirm,
                message: 'Confirmation updated successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async deleteConfirm(confirmId) {
        try {
            await this.confirmService.deleteConfirm(confirmId);
            return {
                success: true,
                message: 'Confirmation deleted successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async getConfirm(confirmId) {
        try {
            const confirm = await this.confirmService.getConfirm(confirmId);
            return {
                success: true,
                data: confirm,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async listConfirms(pagination) {
        try {
            const confirms = await this.confirmService.listConfirms(pagination);
            return {
                success: true,
                data: confirms,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async queryConfirms(filter, pagination) {
        try {
            const confirms = await this.confirmService.queryConfirms(filter, pagination);
            return {
                success: true,
                data: confirms,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async getStatistics() {
        try {
            const statistics = await this.confirmService.getStatistics();
            return {
                success: true,
                data: statistics,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async healthCheck() {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
}
exports.ConfirmController = ConfirmController;
//# sourceMappingURL=confirm.controller.js.map
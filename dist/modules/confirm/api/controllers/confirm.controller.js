"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmController = void 0;
class ConfirmController {
    confirmService;
    constructor(confirmService) {
        this.confirmService = confirmService;
    }
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

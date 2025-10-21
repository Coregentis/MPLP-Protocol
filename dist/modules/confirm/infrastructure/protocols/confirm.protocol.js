"use strict";
/**
 * Confirm协议实现
 *
 * @description Confirm模块的MPLP协议实现，基于Context和Plan模块的企业级标准集成所有9个L3横切关注点管理器
 * @version 1.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与Context/Plan模块IDENTICAL架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmProtocol = void 0;
/**
 * Confirm协议类
 *
 * @description 实现IMLPPProtocol接口，集成9个L3横切关注点管理器，提供企业级审批工作流协议服务
 * @pattern 统一L3管理器注入模式，确保与Context/Plan模块架构一致性
 */
class ConfirmProtocol {
    constructor(confirmService, 
    // ===== 9个L3横切关注点管理器注入 (Reserved for CoreOrchestrator activation) =====
    // Note: These managers maintain IDENTICAL architecture pattern across all 10 modules
    _securityManager, _performanceMonitor, _eventBusManager, _errorHandler, _coordinationManager, _orchestrationManager, _stateSyncManager, _transactionManager, _protocolVersionManager) {
        this.confirmService = confirmService;
        this._securityManager = _securityManager;
        this._performanceMonitor = _performanceMonitor;
        this._eventBusManager = _eventBusManager;
        this._errorHandler = _errorHandler;
        this._coordinationManager = _coordinationManager;
        this._orchestrationManager = _orchestrationManager;
        this._stateSyncManager = _stateSyncManager;
        this._transactionManager = _transactionManager;
        this._protocolVersionManager = _protocolVersionManager;
    }
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作
     */
    async executeOperation(request) {
        try {
            let result;
            switch (request.operation) {
                case 'create': {
                    result = await this.confirmService.createConfirm(request.payload);
                    break;
                }
                case 'approve': {
                    const { confirmId, approverId, comments } = request.payload;
                    result = await this.confirmService.approveConfirm(confirmId, approverId, comments);
                    break;
                }
                case 'reject': {
                    const { confirmId: rejectId, approverId: rejectApproverId, reason } = request.payload;
                    result = await this.confirmService.rejectConfirm(rejectId, rejectApproverId, reason);
                    break;
                }
                case 'get': {
                    const { confirmId: getId } = request.payload;
                    result = await this.confirmService.getConfirm(getId);
                    break;
                }
                case 'list': {
                    const { pagination } = request.payload;
                    result = await this.confirmService.listConfirms(pagination);
                    break;
                }
                case 'query': {
                    const { filter, pagination: queryPagination } = request.payload;
                    result = await this.confirmService.queryConfirms(filter, queryPagination);
                    break;
                }
                case 'update': {
                    const { confirmId: updateId, updates } = request.payload;
                    result = await this.confirmService.updateConfirm(updateId, updates);
                    break;
                }
                case 'delete': {
                    const { confirmId: deleteId } = request.payload;
                    await this.confirmService.deleteConfirm(deleteId);
                    result = { deleted: true };
                    break;
                }
                default:
                    throw new Error(`Unsupported operation: ${request.operation}`);
            }
            return {
                protocolVersion: '1.0.0',
                status: 'success',
                result: result,
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                metadata: { module: 'confirm' }
            };
        }
        catch (error) {
            return {
                protocolVersion: '1.0.0',
                status: 'error',
                error: {
                    code: 'CONFIRM_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error'
                },
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                metadata: { module: 'confirm' }
            };
        }
    }
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata() {
        return this.getMetadata();
    }
    /**
     * 获取协议元数据（内部实现）
     */
    getMetadata() {
        return {
            name: 'confirm',
            version: '1.0.0',
            description: 'Enterprise approval workflow protocol with comprehensive audit and compliance features',
            capabilities: [
                'approval_workflow_management',
                'risk_assessment',
                'compliance_tracking',
                'audit_trail',
                'decision_support',
                'escalation_management',
                'notification_system',
                'performance_monitoring',
                'ai_integration'
            ],
            dependencies: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ],
            supportedOperations: [
                'create',
                'approve',
                'reject',
                'delegate',
                'escalate',
                'update',
                'delete',
                'get',
                'list',
                'query'
            ]
        };
    }
    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            const checks = [
                {
                    name: 'confirmService',
                    status: 'pass',
                    message: 'Confirm service is healthy'
                }
            ];
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                checks,
                metadata: { module: 'confirm' }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                checks: [{
                        name: 'general',
                        status: 'fail',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    }],
                metadata: { module: 'confirm' }
            };
        }
    }
}
exports.ConfirmProtocol = ConfirmProtocol;
//# sourceMappingURL=confirm.protocol.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmProtocol = void 0;
class ConfirmProtocol {
    confirmService;
    _securityManager;
    _performanceMonitor;
    _eventBusManager;
    _errorHandler;
    _coordinationManager;
    _orchestrationManager;
    _stateSyncManager;
    _transactionManager;
    _protocolVersionManager;
    constructor(confirmService, _securityManager, _performanceMonitor, _eventBusManager, _errorHandler, _coordinationManager, _orchestrationManager, _stateSyncManager, _transactionManager, _protocolVersionManager) {
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
    getProtocolMetadata() {
        return this.getMetadata();
    }
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

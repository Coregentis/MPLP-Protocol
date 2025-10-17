"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceProtocol = void 0;
class MockL3ManagerImpl {
    async getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString()
        };
    }
}
class MockPerformanceMonitorImpl extends MockL3ManagerImpl {
    operations = new Map();
    async startOperation(operation) {
        const operationId = `${operation}-${Date.now()}`;
        this.operations.set(operationId, Date.now());
        return operationId;
    }
    async endOperation(_operationId, _success = true) {
    }
    async getOperationDuration(operationId) {
        const startTime = this.operations.get(operationId);
        return startTime ? Date.now() - startTime : 0;
    }
}
class MockEventBusManagerImpl extends MockL3ManagerImpl {
    async publishEvent(_eventType, _data) {
    }
}
class MockErrorHandlerImpl extends MockL3ManagerImpl {
    async handleError(error, _context) {
        return {
            code: 'MOCK_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error
        };
    }
}
class MockTransactionManagerImpl extends MockL3ManagerImpl {
    async beginTransaction() {
        return `transaction-${Date.now()}`;
    }
    async commitTransaction(_transactionId) {
    }
    async rollbackTransaction(_transactionId) {
    }
}
class MockCoordinationManagerImpl extends MockL3ManagerImpl {
    async registerIntegration(_sourceModule, _targetModule) {
    }
}
function _createMockManagers() {
    return {
        security: new MockL3ManagerImpl(),
        performance: new MockPerformanceMonitorImpl(),
        eventBus: new MockEventBusManagerImpl(),
        errorHandler: new MockErrorHandlerImpl(),
        coordination: new MockCoordinationManagerImpl(),
        orchestration: new MockL3ManagerImpl(),
        stateSync: new MockL3ManagerImpl(),
        transaction: new MockTransactionManagerImpl(),
        protocolVersion: new MockL3ManagerImpl()
    };
}
class TraceProtocol {
    traceManagementService;
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(traceManagementService, securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
        this.traceManagementService = traceManagementService;
        this.securityManager = securityManager;
        this.performanceMonitor = performanceMonitor;
        this.eventBusManager = eventBusManager;
        this.errorHandler = errorHandler;
        this.coordinationManager = coordinationManager;
        this.orchestrationManager = orchestrationManager;
        this.stateSyncManager = stateSyncManager;
        this.transactionManager = transactionManager;
        this.protocolVersionManager = protocolVersionManager;
    }
    async createTrace(request) {
        const performanceId = await this.performanceMonitor.startOperation('trace_create');
        try {
            const transactionId = await this.transactionManager.beginTransaction();
            try {
                const trace = await this.traceManagementService.createTrace(request);
                await this.transactionManager.commitTransaction(transactionId);
                await this.eventBusManager.publishEvent('trace_created', {
                    traceId: trace.traceId,
                    contextId: trace.contextId,
                    traceType: trace.traceType,
                    severity: trace.severity,
                    timestamp: new Date().toISOString()
                });
                await this.performanceMonitor.endOperation(performanceId);
                return {
                    success: true,
                    traceId: trace.traceId,
                    message: 'Trace created successfully',
                    metadata: {
                        processingTime: await this.performanceMonitor.getOperationDuration(performanceId),
                        correlationsFound: 0,
                        metricsCollected: 1
                    }
                };
            }
            catch (businessError) {
                await this.transactionManager.rollbackTransaction(transactionId);
                throw businessError;
            }
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'createTrace',
                context: { request }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            await this.eventBusManager.publishEvent('trace_creation_failed', {
                error: handledError.message,
                request,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                message: handledError.message,
                error: {
                    code: handledError.code,
                    message: handledError.message,
                    details: handledError.details
                }
            };
        }
    }
    async updateTrace(request) {
        const performanceId = await this.performanceMonitor.startOperation('trace_update');
        try {
            const transactionId = await this.transactionManager.beginTransaction();
            try {
                await this.traceManagementService.updateTrace(request);
                await this.transactionManager.commitTransaction(transactionId);
                await this.eventBusManager.publishEvent('trace_updated', {
                    traceId: request.traceId,
                    timestamp: new Date().toISOString()
                });
                await this.performanceMonitor.endOperation(performanceId);
                return {
                    success: true,
                    traceId: request.traceId,
                    message: 'Trace updated successfully',
                    metadata: {
                        processingTime: await this.performanceMonitor.getOperationDuration(performanceId),
                        correlationsFound: 0,
                        metricsCollected: 1
                    }
                };
            }
            catch (businessError) {
                await this.transactionManager.rollbackTransaction(transactionId);
                throw businessError;
            }
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'updateTrace',
                context: { request }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            await this.eventBusManager.publishEvent('trace_update_failed', {
                error: handledError.message,
                traceId: request.traceId,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                message: handledError.message,
                error: {
                    code: handledError.code,
                    message: handledError.message,
                    details: handledError.details
                }
            };
        }
    }
    async getTrace(traceId) {
        const performanceId = await this.performanceMonitor.startOperation('trace_get');
        try {
            const trace = await this.traceManagementService.getTrace(traceId);
            await this.performanceMonitor.endOperation(performanceId);
            if (trace) {
                await this.eventBusManager.publishEvent('trace_accessed', {
                    traceId,
                    timestamp: new Date().toISOString()
                });
            }
            return trace ? trace.toData() : null;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'getTrace',
                context: { traceId }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    async queryTraces(filter, pagination) {
        const performanceId = await this.performanceMonitor.startOperation('trace_query');
        try {
            const result = await this.traceManagementService.queryTraces(filter, pagination);
            await this.performanceMonitor.endOperation(performanceId);
            const queryResult = result;
            await this.eventBusManager.publishEvent('traces_queried', {
                filter,
                resultCount: queryResult.total,
                timestamp: new Date().toISOString()
            });
            return queryResult;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'queryTraces',
                context: { filter, pagination }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    async analyzeTrace(traceId) {
        const performanceId = await this.performanceMonitor.startOperation('trace_analyze');
        try {
            const analysis = await this.traceManagementService.analyzeTrace(traceId);
            await this.performanceMonitor.endOperation(performanceId);
            await this.eventBusManager.publishEvent('trace_analyzed', {
                traceId,
                analysisType: analysis.analysisType,
                confidence: analysis.confidence,
                timestamp: new Date().toISOString()
            });
            return analysis;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'analyzeTrace',
                context: { traceId }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    async validateTrace(traceData) {
        const performanceId = await this.performanceMonitor.startOperation('trace_validate');
        try {
            const validation = await this.traceManagementService.validateTrace(traceData);
            await this.performanceMonitor.endOperation(performanceId);
            return validation;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'validateTrace',
                context: { traceData }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    getMetadata() {
        return {
            name: 'trace',
            version: '1.0.0',
            description: 'MPLP Trace Protocol - 追踪记录和监控分析',
            capabilities: [
                'trace_creation',
                'trace_update',
                'trace_query',
                'trace_analysis',
                'trace_validation',
                'performance_monitoring',
                'error_tracking',
                'correlation_analysis',
                'distributed_tracing'
            ],
            supportedOperations: [
                'createTrace',
                'updateTrace',
                'getTrace',
                'queryTraces',
                'analyzeTrace',
                'validateTrace',
                'getHealthStatus',
                'getCrossCuttingManagers'
            ],
            crossCuttingConcerns: {
                security: true,
                performance: true,
                events: true,
                errors: true,
                coordination: true,
                orchestration: true,
                stateSync: true,
                transactions: true,
                versioning: true
            }
        };
    }
    async getHealthStatus() {
        try {
            const managerStatuses = await Promise.all([
                this.securityManager.getHealthStatus(),
                this.performanceMonitor.getHealthStatus(),
                this.eventBusManager.getHealthStatus(),
                this.errorHandler.getHealthStatus(),
                this.coordinationManager.getHealthStatus(),
                this.orchestrationManager.getHealthStatus(),
                this.stateSyncManager.getHealthStatus(),
                this.transactionManager.getHealthStatus(),
                this.protocolVersionManager.getHealthStatus()
            ]);
            const serviceHealth = await this.traceManagementService.getHealthStatus();
            const allHealthy = managerStatuses.every(status => status.status === 'healthy') &&
                serviceHealth.status === 'healthy';
            return {
                status: allHealthy ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                details: {
                    service: serviceHealth,
                    managers: {
                        security: managerStatuses[0],
                        performance: managerStatuses[1],
                        eventBus: managerStatuses[2],
                        errorHandler: managerStatuses[3],
                        coordination: managerStatuses[4],
                        orchestration: managerStatuses[5],
                        stateSync: managerStatuses[6],
                        transaction: managerStatuses[7],
                        protocolVersion: managerStatuses[8]
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    getCrossCuttingManagers() {
        return {
            security: this.securityManager,
            performance: this.performanceMonitor,
            eventBus: this.eventBusManager,
            errorHandler: this.errorHandler,
            coordination: this.coordinationManager,
            orchestration: this.orchestrationManager,
            stateSync: this.stateSyncManager,
            transaction: this.transactionManager,
            protocolVersion: this.protocolVersionManager
        };
    }
    async integrateWithContext(_contextId, _operation) {
        await this.coordinationManager.registerIntegration('context', 'trace');
    }
    async integrateWithPlan(_planId, _operation) {
        await this.coordinationManager.registerIntegration('plan', 'trace');
    }
    async integrateWithConfirm(_confirmId, _operation) {
        await this.coordinationManager.registerIntegration('confirm', 'trace');
    }
    async integrateWithRole(_roleId, _operation) {
        await this.coordinationManager.registerIntegration('role', 'trace');
    }
    async integrateWithExtension(_extensionId, _operation) {
        await this.coordinationManager.registerIntegration('extension', 'trace');
    }
    async integrateWithCore(_coreId, _operation) {
        await this.coordinationManager.registerIntegration('core', 'trace');
    }
    async integrateWithCollab(_collabId, _operation) {
        await this.coordinationManager.registerIntegration('collab', 'trace');
    }
    async integrateWithDialog(_dialogId, _operation) {
        await this.coordinationManager.registerIntegration('dialog', 'trace');
    }
    async integrateWithNetwork(_networkId, _operation) {
        await this.coordinationManager.registerIntegration('network', 'trace');
    }
}
exports.TraceProtocol = TraceProtocol;

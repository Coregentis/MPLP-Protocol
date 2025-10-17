"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPProtocolBase = void 0;
class MLPPProtocolBase {
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
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
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        try {
            const managerChecks = await Promise.all([
                this.checkManagerHealth('security', this.securityManager),
                this.checkManagerHealth('performance', this.performanceMonitor),
                this.checkManagerHealth('eventBus', this.eventBusManager),
                this.checkManagerHealth('errorHandler', this.errorHandler),
                this.checkManagerHealth('coordination', this.coordinationManager),
                this.checkManagerHealth('orchestration', this.orchestrationManager),
                this.checkManagerHealth('stateSync', this.stateSyncManager),
                this.checkManagerHealth('transaction', this.transactionManager),
                this.checkManagerHealth('protocolVersion', this.protocolVersionManager)
            ]);
            checks.push(...managerChecks);
            const moduleChecks = await this.performModuleHealthChecks();
            checks.push(...moduleChecks);
            const hasFailures = checks.some(check => check.status === 'fail');
            const hasWarnings = checks.some(check => check.status === 'warn');
            const status = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';
            return {
                status,
                timestamp,
                checks,
                metadata: {
                    protocolVersion: '1.0.0',
                    moduleName: this.getProtocolMetadata().name
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp,
                checks: [{
                        name: 'health_check_execution',
                        status: 'fail',
                        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    }
    async checkManagerHealth(name, manager) {
        const startTime = Date.now();
        try {
            const isHealthy = manager.healthCheck ? await manager.healthCheck() : true;
            const duration = Date.now() - startTime;
            return {
                name: `${name}_manager`,
                status: isHealthy ? 'pass' : 'fail',
                message: isHealthy ? `${name} manager is healthy` : `${name} manager is unhealthy`,
                duration
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                name: `${name}_manager`,
                status: 'fail',
                message: `${name} manager check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                duration
            };
        }
    }
    async performModuleHealthChecks() {
        return [];
    }
    createResponse(request, status, result, error) {
        return {
            protocolVersion: request.protocolVersion,
            timestamp: new Date().toISOString(),
            requestId: request.requestId,
            status,
            result,
            error,
            metadata: {
                processingTime: Date.now(),
                moduleName: this.getProtocolMetadata().name
            }
        };
    }
    createErrorResponse(request, code, message, details) {
        return this.createResponse(request, 'error', undefined, {
            code,
            message,
            details
        });
    }
}
exports.MLPPProtocolBase = MLPPProtocolBase;

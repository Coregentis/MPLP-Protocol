"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextProtocol = void 0;
class ContextProtocol {
    contextManagementService;
    contextAnalyticsService;
    contextSecurityService;
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(contextManagementService, contextAnalyticsService, contextSecurityService, securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
        this.contextManagementService = contextManagementService;
        this.contextAnalyticsService = contextAnalyticsService;
        this.contextSecurityService = contextSecurityService;
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
    async executeOperation(request) {
        const startTime = Date.now();
        try {
            if (!request.operation) {
                throw new Error('Operation is required');
            }
            if (request.protocolVersion && !['1.0.0', '2.0.0'].includes(request.protocolVersion)) {
                throw new Error(`Unsupported protocol version: ${request.protocolVersion}`);
            }
            const result = await this.routeToServices(request);
            const response = {
                protocolVersion: this.protocolVersionManager.getCurrentVersion(),
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                status: 'success',
                result: result,
                metadata: {
                    operationDuration: Date.now() - startTime,
                    servicesInvolved: this.getServicesInvolved(request.operation)
                }
            };
            return response;
        }
        catch (error) {
            return this.createErrorResponse(error, request.requestId);
        }
    }
    getProtocolMetadata() {
        return this.getMetadata();
    }
    getMetadata() {
        return {
            name: 'context',
            version: '2.0.0',
            description: 'Context management protocol with 3 core services - 上下文管理协议',
            capabilities: [
                'context_management',
                'lifecycle_management',
                'state_synchronization',
                'analytics_and_insights',
                'security_and_compliance',
                'performance_monitoring',
                'batch_operations',
                'version_control',
                'search_and_indexing',
                'threat_detection'
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
                'update',
                'delete',
                'get',
                'list',
                'query'
            ]
        };
    }
    async execute(request) {
        let operationId = null;
        let transactionId = null;
        try {
            operationId = this.performanceMonitor.startTrace(`context_${request.operation}`, { requestId: request.requestId });
            transactionId = await this.transactionManager.beginTransaction();
            const result = await this.executeBusinessLogic(request);
            if (transactionId) {
                await this.transactionManager.commitTransaction(transactionId);
            }
            await this.eventBusManager.publish({
                id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: `context_${request.operation}_completed`,
                source: 'context_protocol',
                payload: result.data || {},
                timestamp: new Date().toISOString()
            });
            if (operationId) {
                await this.performanceMonitor.endTrace(operationId, 'completed');
            }
            return result;
        }
        catch (error) {
            await this.handleError(error, request, operationId, transactionId);
            throw error;
        }
    }
    async executeBusinessLogic(request) {
        const { operation, payload } = request;
        switch (operation) {
            case 'create': {
                if (!payload.contextData) {
                    throw new Error('Context data is required for create operation');
                }
                const createdContext = await this.contextManagementService.createContext(payload.contextData);
                return {
                    success: true,
                    data: { context: createdContext.toData() },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'update': {
                if (!payload.contextId || !payload.contextData) {
                    throw new Error('Context ID and data are required for update operation');
                }
                const updatedContext = await this.contextManagementService.updateContext(payload.contextId, payload.contextData);
                return {
                    success: true,
                    data: { context: updatedContext.toData() },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'delete': {
                if (!payload.contextId) {
                    throw new Error('Context ID is required for delete operation');
                }
                await this.contextManagementService.deleteContext(payload.contextId);
                return {
                    success: true,
                    data: {},
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'get': {
                if (!payload.contextId) {
                    throw new Error('Context ID is required for get operation');
                }
                const context = await this.contextManagementService.getContextById(payload.contextId);
                if (!context) {
                    throw new Error(`Context with ID '${payload.contextId}' not found`);
                }
                return {
                    success: true,
                    data: { context: context.toData() },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'list': {
                const listResult = await this.contextManagementService.queryContexts(payload.query || {}, { page: payload.pagination?.page || 1, limit: payload.pagination?.limit || 10 });
                return {
                    success: true,
                    data: {
                        contexts: listResult.data.map((ctx) => ctx.toData()),
                        total: listResult.total,
                        metadata: {
                            page: listResult.page,
                            limit: listResult.limit,
                            totalPages: listResult.totalPages
                        }
                    },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'query': {
                const queryResult = await this.contextManagementService.queryContexts(payload.query || {}, { page: payload.pagination?.page || 1, limit: payload.pagination?.limit || 10 });
                return {
                    success: true,
                    data: {
                        contexts: queryResult.data.map((ctx) => ctx.toData()),
                        total: queryResult.total,
                        metadata: {
                            page: queryResult.page,
                            limit: queryResult.limit,
                            totalPages: queryResult.totalPages,
                            query: payload.query
                        }
                    },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }
    async handleError(error, request, operationId, transactionId) {
        await this.errorHandler.logError('error', error instanceof Error ? error.message : 'Unknown error', 'context_protocol', error instanceof Error ? error : new Error(String(error)));
        if (transactionId) {
            await this.transactionManager.abortTransaction(transactionId);
        }
        if (operationId) {
            await this.performanceMonitor.endTrace(operationId, 'failed');
        }
        await this.eventBusManager.publish({
            id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            type: `context_${request.operation}_failed`,
            source: 'context_protocol',
            payload: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date().toISOString()
        });
    }
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        try {
            const contextServiceCheck = await this.checkContextService();
            checks.push({
                name: 'contextService',
                status: contextServiceCheck.status === 'healthy' ? 'pass' : 'fail',
                message: contextServiceCheck.status === 'healthy' ? 'Context service is healthy' : 'Context service is unhealthy'
            });
            const managerChecks = [
                { name: 'securityManager', check: await this.securityManager.healthCheck() },
                { name: 'performanceMonitor', check: await this.performanceMonitor.healthCheck() },
                { name: 'eventBusManager', check: await this.eventBusManager.healthCheck() },
                { name: 'errorHandler', check: await this.errorHandler.healthCheck() },
                { name: 'coordinationManager', check: await this.coordinationManager.healthCheck() },
                { name: 'orchestrationManager', check: await this.orchestrationManager.healthCheck() },
                { name: 'stateSyncManager', check: await this.stateSyncManager.healthCheck() },
                { name: 'transactionManager', check: await this.transactionManager.healthCheck() },
                { name: 'protocolVersionManager', check: await this.protocolVersionManager.healthCheck() }
            ];
            for (const { name, check } of managerChecks) {
                checks.push({
                    name,
                    status: check === true ? 'pass' : 'fail',
                    message: check === true ? `${name} is healthy` : `${name} is unhealthy`
                });
            }
            const allHealthy = checks.every(check => check.status === 'pass');
            return {
                status: allHealthy ? 'healthy' : 'unhealthy',
                timestamp,
                checks
            };
        }
        catch (error) {
            checks.push({
                name: 'healthCheck',
                status: 'fail',
                message: error instanceof Error ? error.message : 'Unknown error during health check'
            });
            return {
                status: 'unhealthy',
                timestamp,
                checks
            };
        }
    }
    async routeToServices(request) {
        switch (request.operation) {
            case 'create_context': {
                const context = await this.contextManagementService.createContext(request.payload);
                return { context: context.toData() };
            }
            case 'get_context': {
                const context = await this.contextManagementService.getContext(request.payload.contextId);
                return { context: context?.toData() || null };
            }
            case 'update_context': {
                const context = await this.contextManagementService.updateContext(request.payload.contextId, request.payload.data);
                return { context: context.toData() };
            }
            case 'delete_context': {
                await this.contextManagementService.deleteContext(request.payload.contextId);
                return { success: true };
            }
            case 'list_contexts': {
                const result = await this.contextManagementService.queryContexts(request.payload.filter);
                return { contexts: result.data.map(ctx => ctx.toData()), total: result.total };
            }
            case 'transition_lifecycle': {
                const context = await this.contextManagementService.transitionLifecycleStage(request.payload.contextId, request.payload.newStage);
                return { context: context.toData() };
            }
            case 'analyze_context': {
                const analysis = await this.contextAnalyticsService.analyzeContext(request.payload.contextId);
                return analysis;
            }
            case 'search_contexts': {
                const results = await this.contextAnalyticsService.searchContexts(request.payload.query);
                return results;
            }
            case 'generate_report': {
                const report = await this.contextAnalyticsService.generateReport(request.payload.contextId, request.payload.reportType);
                return report;
            }
            case 'validate_access': {
                const result = await this.contextSecurityService.validateAccess(request.payload.contextId, request.payload.userId, request.payload.operation);
                return { valid: result };
            }
            case 'security_audit': {
                const audit = await this.contextSecurityService.performSecurityAudit(request.payload.contextId);
                return audit;
            }
            default:
                throw new Error(`Unsupported operation: ${request.operation}`);
        }
    }
    getServicesInvolved(operation) {
        const managementOps = ['create_context', 'get_context', 'update_context', 'delete_context', 'list_contexts', 'transition_lifecycle'];
        const analyticsOps = ['analyze_context', 'search_contexts', 'generate_report'];
        const securityOps = ['validate_access', 'security_audit'];
        const services = [];
        if (managementOps.includes(operation))
            services.push('ContextManagementService');
        if (analyticsOps.includes(operation))
            services.push('ContextAnalyticsService');
        if (securityOps.includes(operation))
            services.push('ContextSecurityService');
        return services;
    }
    createErrorResponse(error, requestId) {
        return {
            protocolVersion: this.protocolVersionManager.getCurrentVersion(),
            timestamp: new Date().toISOString(),
            requestId,
            status: 'error',
            error: {
                code: 'OPERATION_FAILED',
                message: error.message,
                details: { stack: error.stack }
            }
        };
    }
    async checkContextService() {
        try {
            const [mgmtHealth, analyticsHealth, securityHealth] = await Promise.allSettled([
                this.contextManagementService.healthCheck(),
                this.checkAnalyticsHealth(),
                this.checkSecurityHealth()
            ]);
            const healthResults = {
                management: mgmtHealth.status === 'fulfilled' && mgmtHealth.value,
                analytics: analyticsHealth.status === 'fulfilled' && analyticsHealth.value,
                security: securityHealth.status === 'fulfilled' && securityHealth.value
            };
            const allHealthy = Object.values(healthResults).every(Boolean);
            return {
                status: allHealthy ? 'healthy' : 'unhealthy',
                details: {
                    services: healthResults,
                    totalServices: 3,
                    healthyServices: Object.values(healthResults).filter(Boolean).length
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
    async checkAnalyticsHealth() {
        return true;
    }
    async checkSecurityHealth() {
        return true;
    }
}
exports.ContextProtocol = ContextProtocol;

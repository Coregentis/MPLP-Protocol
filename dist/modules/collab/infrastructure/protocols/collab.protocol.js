"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabProtocol = void 0;
class CollabProtocol {
    collabManagementService;
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(collabManagementService, securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
        this.collabManagementService = collabManagementService;
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
        let operationId = null;
        try {
            this.validateRequest(request);
            const collabRequest = {
                requestId: request.requestId || `collab-req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: request.timestamp || new Date().toISOString(),
                operation: request.operation,
                payload: request.payload,
                metadata: {
                    ...request.metadata,
                    protocolName: 'collab',
                    protocolVersion: '1.0.0'
                }
            };
            operationId = this.performanceMonitor.startTrace(`collab_protocol_${collabRequest.operation}`, {
                requestId: collabRequest.requestId,
                operation: collabRequest.operation,
                payloadSize: JSON.stringify(collabRequest.payload).length
            });
            const collabResponse = await this.execute(collabRequest);
            this.validateResponse(collabResponse);
            const standardResponse = {
                protocolVersion: '1.0.0',
                status: collabResponse.success ? 'success' : 'error',
                result: collabResponse.data,
                error: collabResponse.error,
                timestamp: collabResponse.timestamp,
                requestId: collabResponse.requestId,
                metadata: {
                    ...collabResponse.data?.metadata,
                    executionTimeMs: Date.now() - startTime,
                    protocolName: 'collab',
                    operationId
                }
            };
            if (operationId) {
                await this.performanceMonitor.endTrace(operationId, 'completed');
            }
            return standardResponse;
        }
        catch (error) {
            if (operationId) {
                await this.performanceMonitor.endTrace(operationId, 'failed');
            }
            await this.errorHandler.logError('error', error instanceof Error ? error.message : 'Unknown protocol error', 'collab_protocol', error instanceof Error ? error : new Error(String(error)));
            return {
                protocolVersion: '1.0.0',
                status: 'error',
                error: {
                    code: 'PROTOCOL_EXECUTION_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown protocol error',
                    details: {
                        operation: request.operation,
                        requestId: request.requestId,
                        executionTimeMs: Date.now() - startTime
                    }
                },
                timestamp: new Date().toISOString(),
                requestId: request.requestId || 'unknown',
                metadata: {
                    protocolName: 'collab',
                    operationId
                }
            };
        }
    }
    getProtocolMetadata() {
        return this.getMetadata();
    }
    getMetadata() {
        return {
            name: 'collab',
            version: '1.0.0',
            description: 'Multi-Agent Collaboration management protocol with enterprise-grade features',
            capabilities: [
                'collaboration_creation',
                'collaboration_management',
                'participant_management',
                'coordination_strategy',
                'lifecycle_management',
                'performance_monitoring',
                'event_publishing'
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
                'start',
                'stop',
                'add_participant',
                'remove_participant'
            ]
        };
    }
    async execute(request) {
        let operationId = null;
        let transactionId = null;
        try {
            operationId = this.performanceMonitor.startTrace(`collab_${request.operation}`, { requestId: request.requestId });
            transactionId = await this.transactionManager.beginTransaction();
            const result = await this.executeBusinessLogic(request);
            if (transactionId) {
                await this.transactionManager.commitTransaction(transactionId);
            }
            await this.eventBusManager.publish({
                id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: `collab_${request.operation}_completed`,
                source: 'collab_protocol',
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
                if (!payload.collaborationData) {
                    throw new Error('Collaboration data is required for create operation');
                }
                const createdCollab = await this.collabManagementService.createCollaboration(payload.collaborationData);
                return {
                    success: true,
                    data: { collaboration: this.entityToData(createdCollab) },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'update': {
                if (!payload.collaborationId || !payload.collaborationData) {
                    throw new Error('Collaboration ID and data are required for update operation');
                }
                const updatedCollab = await this.collabManagementService.updateCollaboration(payload.collaborationId, payload.collaborationData);
                return {
                    success: true,
                    data: { collaboration: this.entityToData(updatedCollab) },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'delete': {
                if (!payload.collaborationId) {
                    throw new Error('Collaboration ID is required for delete operation');
                }
                await this.collabManagementService.deleteCollaboration(payload.collaborationId);
                return {
                    success: true,
                    data: {},
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'get': {
                if (!payload.collaborationId) {
                    throw new Error('Collaboration ID is required for get operation');
                }
                const collaboration = await this.collabManagementService.getCollaboration(payload.collaborationId);
                if (!collaboration) {
                    throw new Error(`Collaboration with ID '${payload.collaborationId}' not found`);
                }
                return {
                    success: true,
                    data: { collaboration: this.entityToData(collaboration) },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'list': {
                const listResult = await this.collabManagementService.listCollaborations(payload.query || { page: 1, limit: 10 });
                return {
                    success: true,
                    data: {
                        collaborations: listResult.items.map(collab => this.entityToData(collab)),
                        total: listResult.pagination.total,
                        metadata: {
                            page: listResult.pagination.page,
                            limit: listResult.pagination.limit,
                            totalPages: listResult.pagination.totalPages
                        }
                    },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'batch_create': {
                if (!payload.collaborationsData || !Array.isArray(payload.collaborationsData)) {
                    throw new Error('Collaborations data array is required for batch create operation');
                }
                const successful = [];
                const failed = [];
                for (let i = 0; i < payload.collaborationsData.length; i++) {
                    try {
                        const collaborationData = payload.collaborationsData[i];
                        const createdCollab = await this.collabManagementService.createCollaboration(collaborationData);
                        successful.push(this.entityToData(createdCollab));
                    }
                    catch (error) {
                        failed.push({
                            index: i,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            data: payload.collaborationsData[i]
                        });
                    }
                }
                return {
                    success: failed.length === 0,
                    data: {
                        batchResults: { successful, failed }
                    },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'search': {
                if (!payload.searchQuery?.query) {
                    throw new Error('Search query is required for search operation');
                }
                const searchStartTime = Date.now();
                const allCollaborations = await this.collabManagementService.listCollaborations({ page: 1, limit: 1000 });
                const searchTerm = payload.searchQuery.query.toLowerCase();
                const matchedCollaborations = allCollaborations.items.filter(collab => collab.name.toLowerCase().includes(searchTerm) ||
                    (collab.description && collab.description.toLowerCase().includes(searchTerm)) ||
                    collab.mode.toLowerCase().includes(searchTerm));
                const page = payload.searchQuery.page || 1;
                const limit = payload.searchQuery.limit || 10;
                const offset = (page - 1) * limit;
                const paginatedResults = matchedCollaborations.slice(offset, offset + limit);
                return {
                    success: true,
                    data: {
                        searchResults: {
                            items: paginatedResults.map(collab => this.entityToData(collab)),
                            totalMatches: matchedCollaborations.length,
                            executionTimeMs: Date.now() - searchStartTime
                        }
                    },
                    timestamp: new Date().toISOString(),
                    requestId: request.requestId
                };
            }
            case 'health_check': {
                const healthStatus = await this.healthCheck();
                return {
                    success: healthStatus.status === 'healthy',
                    data: {
                        healthStatus: {
                            status: healthStatus.status,
                            checks: healthStatus.checks.map(check => ({
                                name: check.name,
                                status: check.status,
                                message: check.message || 'No message provided'
                            }))
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
    entityToData(entity) {
        return {
            collaborationId: entity.id,
            protocolVersion: entity.protocolVersion,
            timestamp: entity.timestamp,
            contextId: entity.contextId,
            planId: entity.planId,
            name: entity.name,
            description: entity.description,
            mode: entity.mode,
            status: entity.status,
            participants: entity.participants,
            coordinationStrategy: entity.coordinationStrategy,
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy
        };
    }
    async handleError(error, request, operationId, transactionId) {
        await this.errorHandler.logError('error', error instanceof Error ? error.message : 'Unknown error', 'collab_protocol', error instanceof Error ? error : new Error(String(error)));
        if (transactionId) {
            await this.transactionManager.abortTransaction(transactionId);
        }
        if (operationId) {
            await this.performanceMonitor.endTrace(operationId, 'failed');
        }
        await this.eventBusManager.publish({
            id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            type: `collab_${request.operation}_failed`,
            source: 'collab_protocol',
            payload: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date().toISOString()
        });
    }
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        try {
            const collabServiceCheck = await this.checkCollabService();
            checks.push({
                name: 'collabService',
                status: collabServiceCheck.status === 'healthy' ? 'pass' : 'fail',
                message: collabServiceCheck.status === 'healthy' ? 'Collab service is healthy' : 'Collab service is unhealthy'
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
    async checkCollabService() {
        try {
            const testResult = await this.collabManagementService.listCollaborations({ page: 1, limit: 1 });
            return {
                status: 'healthy',
                details: {
                    totalCollaborations: testResult.pagination.total,
                    serviceAvailable: true
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
    validateRequest(request) {
        if (!request) {
            throw new Error('Request is required');
        }
        if (!request.operation) {
            throw new Error('Operation is required');
        }
        const supportedOperations = [
            'create', 'update', 'delete', 'get', 'list',
            'start', 'stop', 'add_participant', 'remove_participant',
            'batch_create', 'batch_update', 'search', 'health_check'
        ];
        if (!supportedOperations.includes(request.operation)) {
            throw new Error(`Unsupported operation: ${request.operation}`);
        }
        if (request.operation === 'create' && !request.payload?.collaborationData) {
            throw new Error('Collaboration data is required for create operation');
        }
        if (['update', 'delete', 'get', 'start', 'stop'].includes(request.operation) && !request.payload?.collaborationId) {
            throw new Error('Collaboration ID is required for this operation');
        }
        if (request.operation === 'batch_create' && (!request.payload?.collaborationsData || !Array.isArray(request.payload.collaborationsData))) {
            throw new Error('Collaborations data array is required for batch create operation');
        }
        if (request.operation === 'search') {
            const searchQuery = request.payload?.searchQuery;
            if (!searchQuery?.query) {
                throw new Error('Search query is required for search operation');
            }
        }
    }
    validateResponse(response) {
        if (!response) {
            throw new Error('Response is required');
        }
        if (typeof response.success !== 'boolean') {
            throw new Error('Response success field must be boolean');
        }
        if (!response.timestamp) {
            throw new Error('Response timestamp is required');
        }
        if (!response.requestId) {
            throw new Error('Response requestId is required');
        }
        if (response.success && response.data) {
            if (response.data.collaboration && !response.data.collaboration.collaborationId) {
                throw new Error('Collaboration data must include collaborationId');
            }
            if (response.data.collaborations && !Array.isArray(response.data.collaborations)) {
                throw new Error('Collaborations data must be an array');
            }
        }
        if (!response.success && response.error) {
            if (!response.error.code || !response.error.message) {
                throw new Error('Error response must include code and message');
            }
        }
    }
}
exports.CollabProtocol = CollabProtocol;

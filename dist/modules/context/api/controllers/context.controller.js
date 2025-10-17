"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextController = void 0;
class ContextController {
    contextManagementService;
    constructor(contextManagementService) {
        this.contextManagementService = contextManagementService;
    }
    async createContext(dto) {
        try {
            this.validateCreateDto(dto);
            const context = await this.contextManagementService.createContext(dto);
            return {
                success: true,
                contextId: context.contextId,
                message: 'Context created successfully',
                metadata: {
                    name: context.name,
                    status: context.status,
                    lifecycleStage: context.lifecycleStage
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTEXT_CREATION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { dto }
                }
            };
        }
    }
    async getContextById(contextId) {
        try {
            if (!this.isValidUUID(contextId)) {
                throw new Error('Invalid context ID format');
            }
            const context = await this.contextManagementService.getContextById(contextId);
            if (!context) {
                return null;
            }
            return this.entityToResponseDto(context);
        }
        catch (error) {
            throw new Error(`Failed to get context: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getContextByName(name) {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Context name is required');
            }
            const context = await this.contextManagementService.getContextByName(name.trim());
            if (!context) {
                return null;
            }
            return this.entityToResponseDto(context);
        }
        catch (error) {
            throw new Error(`Failed to get context by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateContext(contextId, dto) {
        try {
            if (!this.isValidUUID(contextId)) {
                throw new Error('Invalid context ID format');
            }
            this.validateUpdateDto(dto);
            const context = await this.contextManagementService.updateContext(contextId, dto);
            return {
                success: true,
                contextId: context.contextId,
                message: 'Context updated successfully',
                metadata: {
                    name: context.name,
                    status: context.status,
                    lifecycleStage: context.lifecycleStage,
                    timestamp: context.timestamp
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTEXT_UPDATE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { contextId, dto }
                }
            };
        }
    }
    async deleteContext(contextId) {
        try {
            if (!this.isValidUUID(contextId)) {
                throw new Error('Invalid context ID format');
            }
            await this.contextManagementService.deleteContext(contextId);
            return {
                success: true,
                contextId,
                message: 'Context deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    code: 'CONTEXT_DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    details: { contextId }
                }
            };
        }
    }
    async queryContexts(query, pagination) {
        try {
            if (query) {
                this.validateQueryDto(query);
            }
            if (pagination) {
                this.validatePaginationParams(pagination);
            }
            const result = await this.contextManagementService.queryContexts(query, pagination);
            return {
                data: result.data.map(context => this.entityToResponseDto(context)),
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            };
        }
        catch (error) {
            throw new Error(`Failed to query contexts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchContexts(namePattern, pagination) {
        try {
            if (!namePattern || namePattern.trim().length === 0) {
                throw new Error('Search pattern is required');
            }
            if (pagination) {
                this.validatePaginationParams(pagination);
            }
            const result = await this.contextManagementService.searchContexts(namePattern.trim(), pagination);
            return {
                data: result.data.map(context => this.entityToResponseDto(context)),
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            };
        }
        catch (error) {
            throw new Error(`Failed to search contexts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getContextStatistics() {
        try {
            return await this.contextManagementService.getContextStatistics();
        }
        catch (error) {
            throw new Error(`Failed to get context statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async healthCheck() {
        try {
            const isHealthy = await this.contextManagementService.healthCheck();
            return {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString()
            };
        }
    }
    entityToResponseDto(context) {
        const data = context.toData();
        return {
            contextId: data.contextId,
            name: data.name,
            description: data.description,
            status: data.status,
            lifecycleStage: data.lifecycleStage,
            protocolVersion: data.protocolVersion,
            timestamp: data.timestamp,
            sharedState: data.sharedState,
            accessControl: data.accessControl,
            configuration: data.configuration,
            auditTrail: data.auditTrail,
            monitoringIntegration: data.monitoringIntegration,
            performanceMetrics: data.performanceMetrics,
            versionHistory: data.versionHistory,
            searchMetadata: data.searchMetadata,
            cachingPolicy: data.cachingPolicy,
            syncConfiguration: data.syncConfiguration,
            errorHandling: data.errorHandling,
            integrationEndpoints: data.integrationEndpoints,
            eventIntegration: data.eventIntegration
        };
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    validateCreateDto(dto) {
        if (!dto.name || dto.name.trim().length === 0) {
            throw new Error('Context name is required');
        }
        if (dto.name.length > 255) {
            throw new Error('Context name cannot exceed 255 characters');
        }
        if (dto.description && dto.description.length > 1000) {
            throw new Error('Context description cannot exceed 1000 characters');
        }
    }
    validateUpdateDto(dto) {
        if (dto.name !== undefined) {
            if (!dto.name || dto.name.trim().length === 0) {
                throw new Error('Context name cannot be empty');
            }
            if (dto.name.length > 255) {
                throw new Error('Context name cannot exceed 255 characters');
            }
        }
        if (dto.description !== undefined && dto.description && dto.description.length > 1000) {
            throw new Error('Context description cannot exceed 1000 characters');
        }
    }
    validateQueryDto(dto) {
        if (dto.namePattern && dto.namePattern.trim().length === 0) {
            throw new Error('Name pattern cannot be empty');
        }
    }
    validatePaginationParams(pagination) {
        if (pagination.page < 1) {
            throw new Error('Page number must be greater than 0');
        }
        if (pagination.limit < 1 || pagination.limit > 1000) {
            throw new Error('Limit must be between 1 and 1000');
        }
    }
}
exports.ContextController = ContextController;

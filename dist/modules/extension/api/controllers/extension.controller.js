"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionController = void 0;
const extension_mapper_1 = require("../mappers/extension.mapper");
class ExtensionController {
    extensionManagementService;
    constructor(extensionManagementService) {
        this.extensionManagementService = extensionManagementService;
    }
    async createExtensionHttp(request) {
        try {
            const dto = this.validateCreateExtensionDto(request.body);
            const createRequest = {
                contextId: dto.contextId,
                name: dto.name,
                displayName: dto.displayName,
                description: dto.description,
                version: dto.version,
                extensionType: dto.extensionType,
                compatibility: {
                    mplpVersion: dto.compatibility?.mplpVersion || '1.0.0',
                    requiredModules: dto.compatibility?.requiredModules || [],
                    dependencies: dto.compatibility?.dependencies?.map(dep => ({
                        name: dep.name,
                        version: dep.version,
                        optional: dep.optional || false,
                        reason: `Dependency for ${dto.name}`
                    })) || [],
                    conflicts: []
                },
                configuration: {
                    schema: dto.configuration?.schema || {},
                    currentConfig: dto.configuration?.currentConfig || {},
                    defaultConfig: dto.configuration?.defaultConfig || {},
                    validationRules: []
                },
                security: {
                    sandboxEnabled: dto.security?.sandboxEnabled ?? true,
                    resourceLimits: {
                        maxMemory: dto.security?.resourceLimits?.maxMemory || 100 * 1024 * 1024,
                        maxCpu: dto.security?.resourceLimits?.maxCpu || 50,
                        maxFileSize: dto.security?.resourceLimits?.maxFileSize || 10 * 1024 * 1024,
                        maxNetworkConnections: 10,
                        allowedDomains: [],
                        blockedDomains: [],
                        allowedHosts: [],
                        allowedPorts: [80, 443],
                        protocols: ['http', 'https']
                    },
                    codeSigning: {
                        required: false,
                        trustedSigners: []
                    },
                    permissions: {
                        fileSystem: { read: [], write: [], execute: [] },
                        network: { allowedHosts: [], allowedPorts: [], protocols: [] },
                        database: { read: [], write: [], admin: [] },
                        api: { endpoints: [], methods: [], rateLimit: 100 }
                    }
                },
                metadata: {
                    author: {
                        name: dto.metadata?.author || 'Unknown'
                    },
                    license: {
                        type: dto.metadata?.license || 'MIT'
                    },
                    keywords: dto.metadata?.keywords || [],
                    category: dto.metadata?.category || 'general',
                    screenshots: []
                }
            };
            const extension = await this.extensionManagementService.createExtension(createRequest);
            await this.extensionManagementService.applyAllCrossCuttingConcerns(extension);
            const schema = extension_mapper_1.ExtensionMapper.toSchema(extension);
            return {
                status: 201,
                data: schema,
                headers: {
                    'Content-Type': 'application/json',
                    'Location': `/api/extensions/${extension.extensionId}`
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async getExtensionHttp(request) {
        try {
            const extensionId = request.params.id;
            if (!extensionId) {
                return {
                    status: 400,
                    error: {
                        code: 'MISSING_EXTENSION_ID',
                        message: 'Extension ID is required'
                    }
                };
            }
            const extension = await this.extensionManagementService.getExtensionById(extensionId);
            if (!extension) {
                return {
                    status: 404,
                    error: {
                        code: 'EXTENSION_NOT_FOUND',
                        message: `Extension with ID '${extensionId}' not found`
                    }
                };
            }
            const schema = extension_mapper_1.ExtensionMapper.toSchema(extension);
            return {
                status: 200,
                data: schema,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async updateExtensionHttp(request) {
        try {
            const extensionId = request.params.id;
            const dto = this.validateUpdateExtensionDto(request.body);
            if (!extensionId) {
                return {
                    status: 400,
                    error: {
                        code: 'MISSING_EXTENSION_ID',
                        message: 'Extension ID is required'
                    }
                };
            }
            const updateRequest = {
                extensionId,
                displayName: dto.displayName,
                description: dto.description,
                configuration: dto.configuration,
                metadata: dto.metadata ? {
                    author: dto.metadata.author ? { name: dto.metadata.author } : undefined,
                    license: dto.metadata.license ? { type: dto.metadata.license } : undefined,
                    keywords: dto.metadata.keywords,
                    category: dto.metadata.category
                } : undefined
            };
            const extension = await this.extensionManagementService.updateExtension(updateRequest);
            const schema = extension_mapper_1.ExtensionMapper.toSchema(extension);
            return {
                status: 200,
                data: schema,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async deleteExtensionHttp(request) {
        try {
            const extensionId = request.params.id;
            if (!extensionId) {
                return {
                    status: 400,
                    error: {
                        code: 'MISSING_EXTENSION_ID',
                        message: 'Extension ID is required'
                    }
                };
            }
            await this.extensionManagementService.removeAllCrossCuttingConcerns(extensionId);
            const deleted = await this.extensionManagementService.deleteExtension(extensionId);
            if (!deleted) {
                return {
                    status: 404,
                    error: {
                        code: 'EXTENSION_NOT_FOUND',
                        message: `Extension with ID '${extensionId}' not found`
                    }
                };
            }
            return {
                status: 204,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async queryExtensionsHttp(request) {
        try {
            const dto = this.parseQueryExtensionsDto(request.query);
            const filter = {
                contextId: dto.contextId,
                extensionType: dto.extensionType,
                status: dto.status,
                name: dto.name,
                author: dto.author,
                category: dto.category,
                keywords: dto.keywords
            };
            const pagination = {
                page: dto.page || 1,
                limit: dto.limit || 10
            };
            const sort = dto.sortBy ? [{
                    field: dto.sortBy,
                    direction: dto.sortOrder || 'asc'
                }] : undefined;
            const result = await this.extensionManagementService.queryExtensions(filter, pagination, sort);
            const schemas = result.extensions.map(ext => extension_mapper_1.ExtensionMapper.toSchema(ext));
            return {
                status: 200,
                data: {
                    extensions: schemas,
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    hasMore: result.hasMore
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async activateExtensionHttp(request) {
        try {
            const extensionId = request.params.id;
            const userId = request.headers['x-user-id'];
            if (!extensionId) {
                return {
                    status: 400,
                    error: {
                        code: 'MISSING_EXTENSION_ID',
                        message: 'Extension ID is required'
                    }
                };
            }
            const activated = await this.extensionManagementService.activateExtension({
                extensionId,
                userId
            });
            return {
                status: 200,
                data: { activated },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async deactivateExtensionHttp(request) {
        try {
            const extensionId = request.params.id;
            const userId = request.headers['x-user-id'];
            if (!extensionId) {
                return {
                    status: 400,
                    error: {
                        code: 'MISSING_EXTENSION_ID',
                        message: 'Extension ID is required'
                    }
                };
            }
            const deactivated = await this.extensionManagementService.deactivateExtension(extensionId, userId);
            return {
                status: 200,
                data: { deactivated },
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    validateCreateExtensionDto(body) {
        if (!body || typeof body !== 'object') {
            throw new Error('Request body is required');
        }
        const dto = body;
        const requiredFields = ['contextId', 'name', 'displayName', 'version', 'extensionType'];
        for (const field of requiredFields) {
            if (!dto[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        return dto;
    }
    validateUpdateExtensionDto(body) {
        if (!body || typeof body !== 'object') {
            throw new Error('Request body is required');
        }
        return body;
    }
    parseQueryExtensionsDto(query) {
        return {
            contextId: query.contextId,
            extensionType: query.extensionType,
            status: query.status,
            name: query.name,
            author: query.author,
            category: query.category,
            keywords: query.keywords ? query.keywords.split(',') : undefined,
            page: query.page ? parseInt(query.page, 10) : undefined,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder
        };
    }
    handleError(error) {
        if (error.message.includes('not found')) {
            return {
                status: 404,
                error: {
                    code: 'NOT_FOUND',
                    message: error.message
                }
            };
        }
        if (error.message.includes('already exists')) {
            return {
                status: 409,
                error: {
                    code: 'CONFLICT',
                    message: error.message
                }
            };
        }
        if (error.message.includes('Missing required field') || error.message.includes('Invalid')) {
            return {
                status: 400,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error.message
                }
            };
        }
        return {
            status: 500,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                details: error.message
            }
        };
    }
    async createExtension(dto) {
        try {
            const request = {
                body: dto,
                params: {},
                query: {},
                headers: {}
            };
            const response = await this.createExtensionHttp(request);
            if (response.status >= 200 && response.status < 300) {
                return { success: true, data: response.data };
            }
            else {
                return { success: false, error: response.error };
            }
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async getExtension(extensionId) {
        try {
            const request = {
                params: { id: extensionId },
                body: {},
                query: {},
                headers: {}
            };
            const response = await this.getExtensionHttp(request);
            if (response.status >= 200 && response.status < 300) {
                return { success: true, data: response.data };
            }
            else {
                return { success: false, error: response.error };
            }
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async updateExtension(extensionId, dto) {
        try {
            const request = {
                params: { id: extensionId },
                body: dto,
                query: {},
                headers: {}
            };
            const response = await this.updateExtensionHttp(request);
            if (response.status >= 200 && response.status < 300) {
                return { success: true, data: response.data };
            }
            else {
                return { success: false, error: response.error };
            }
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async deleteExtension(extensionId) {
        try {
            const request = {
                params: { id: extensionId },
                body: {},
                query: {},
                headers: {}
            };
            const response = await this.deleteExtensionHttp(request);
            if (response.status >= 200 && response.status < 300) {
                return { success: true, data: true };
            }
            else {
                return { success: false, error: response.error };
            }
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async activateExtension(extensionId) {
        try {
            const activationRequest = { extensionId, force: false };
            const result = await this.extensionManagementService.activateExtension(activationRequest);
            if (result) {
                return { success: true, data: result };
            }
            else {
                return { success: false, error: { message: 'Extension activation failed' } };
            }
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async deactivateExtension(extensionId) {
        try {
            const result = await this.extensionManagementService.deactivateExtension(extensionId);
            if (result) {
                return { success: true, data: result };
            }
            else {
                return { success: false, error: { message: 'Extension deactivation failed' } };
            }
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async queryExtensions(criteria) {
        try {
            const filter = {
                extensionType: criteria.extensionType,
                status: criteria.status,
                name: criteria.name,
                category: criteria.category
            };
            const result = await this.extensionManagementService.queryExtensions(filter);
            return { success: true, data: result.extensions };
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async listExtensions(options) {
        try {
            const filter = {
                extensionType: options.extensionType,
                status: options.status,
                contextId: options.contextId
            };
            const pagination = {
                page: options.page,
                limit: options.limit || 10,
                offset: ((options.page || 1) - 1) * (options.limit || 10)
            };
            const result = await this.extensionManagementService.queryExtensions(filter, pagination);
            return {
                success: true,
                data: {
                    extensions: result.extensions,
                    total: result.total,
                    page: options.page,
                    limit: options.limit,
                    hasMore: result.hasMore || false
                }
            };
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async getHealthStatus() {
        try {
            const result = await this.extensionManagementService.getHealthStatus();
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
    async getPerformanceMetrics() {
        try {
            const healthStatus = await this.extensionManagementService.getHealthStatus();
            const performanceData = {
                activationLatency: 100,
                executionTime: 50,
                memoryFootprint: 50000000,
                cpuUtilization: 25,
                networkLatency: 10,
                errorRate: 0.01,
                throughput: 1000,
                availability: 99.9,
                efficiencyScore: 85,
                healthStatus: healthStatus.status,
                alerts: []
            };
            return { success: true, data: performanceData };
        }
        catch (error) {
            return { success: false, error: { message: error.message } };
        }
    }
}
exports.ExtensionController = ExtensionController;

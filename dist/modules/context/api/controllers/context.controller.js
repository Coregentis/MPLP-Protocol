"use strict";
/**
 * Context控制器
 *
 * @description Context模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextController = void 0;
/**
 * Context API控制器
 *
 * @description 提供Context的RESTful API接口
 */
class ContextController {
    constructor(contextManagementService) {
        this.contextManagementService = contextManagementService;
    }
    // ===== RESTful API方法 =====
    /**
     * 创建新Context
     * POST /contexts
     */
    async createContext(dto) {
        try {
            // 验证DTO
            this.validateCreateDto(dto);
            // 调用应用服务
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
    /**
     * 根据ID获取Context
     * GET /contexts/:id
     */
    async getContextById(contextId) {
        try {
            // 验证UUID格式
            if (!this.isValidUUID(contextId)) {
                throw new Error('Invalid context ID format');
            }
            // 获取Context实体
            const context = await this.contextManagementService.getContextById(contextId);
            if (!context) {
                return null;
            }
            // 转换为响应DTO
            return this.entityToResponseDto(context);
        }
        catch (error) {
            throw new Error(`Failed to get context: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 根据名称获取Context
     * GET /contexts/by-name/:name
     */
    async getContextByName(name) {
        try {
            // 验证名称
            if (!name || name.trim().length === 0) {
                throw new Error('Context name is required');
            }
            // 获取Context实体
            const context = await this.contextManagementService.getContextByName(name.trim());
            if (!context) {
                return null;
            }
            // 转换为响应DTO
            return this.entityToResponseDto(context);
        }
        catch (error) {
            throw new Error(`Failed to get context by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 更新Context
     * PUT /contexts/:id
     */
    async updateContext(contextId, dto) {
        try {
            // 验证UUID格式
            if (!this.isValidUUID(contextId)) {
                throw new Error('Invalid context ID format');
            }
            // 验证DTO
            this.validateUpdateDto(dto);
            // 调用应用服务
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
    /**
     * 删除Context
     * DELETE /contexts/:id
     */
    async deleteContext(contextId) {
        try {
            // 验证UUID格式
            if (!this.isValidUUID(contextId)) {
                throw new Error('Invalid context ID format');
            }
            // 调用应用服务
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
    /**
     * 查询Context列表
     * GET /contexts
     */
    async queryContexts(query, pagination) {
        try {
            // 验证查询参数
            if (query) {
                this.validateQueryDto(query);
            }
            // 验证分页参数
            if (pagination) {
                this.validatePaginationParams(pagination);
            }
            // 调用应用服务
            const result = await this.contextManagementService.queryContexts(query, pagination);
            // 转换为响应DTO
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
    /**
     * 搜索Context
     * GET /contexts/search
     */
    async searchContexts(namePattern, pagination) {
        try {
            // 验证搜索模式
            if (!namePattern || namePattern.trim().length === 0) {
                throw new Error('Search pattern is required');
            }
            // 验证分页参数
            if (pagination) {
                this.validatePaginationParams(pagination);
            }
            // 调用应用服务
            const result = await this.contextManagementService.searchContexts(namePattern.trim(), pagination);
            // 转换为响应DTO
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
    /**
     * 获取Context统计信息
     * GET /contexts/statistics
     */
    async getContextStatistics() {
        try {
            return await this.contextManagementService.getContextStatistics();
        }
        catch (error) {
            throw new Error(`Failed to get context statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 健康检查
     * GET /contexts/health
     */
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
    // ===== 私有辅助方法 =====
    /**
     * 实体转换为响应DTO
     */
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
    /**
     * 验证UUID格式
     */
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    /**
     * 验证创建DTO
     */
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
    /**
     * 验证更新DTO
     */
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
    /**
     * 验证查询DTO
     */
    validateQueryDto(dto) {
        if (dto.namePattern && dto.namePattern.trim().length === 0) {
            throw new Error('Name pattern cannot be empty');
        }
    }
    /**
     * 验证分页参数
     */
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
//# sourceMappingURL=context.controller.js.map
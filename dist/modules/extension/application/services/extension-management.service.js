"use strict";
/**
 * Extension管理服务
 *
 * @description Extension模块的核心应用服务，负责业务流程编排和用例实现
 * @version 1.0.0
 * @layer Application层 - 应用服务
 * @pattern 应用服务 + 用例编排 + 横切关注点集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionManagementService = void 0;
const extension_entity_1 = require("../../domain/entities/extension.entity");
/**
 * Extension管理服务类
 * 负责扩展的完整生命周期管理、业务流程编排和横切关注点集成
 */
class ExtensionManagementService {
    constructor(extensionRepository) {
        this.extensionRepository = extensionRepository;
    }
    // ============================================================================
    // 横切关注点集成方法 (整合自CrossCuttingConcernsService)
    // ============================================================================
    /**
     * 为扩展应用所有横切关注点
     * @param extension - 扩展数据
     */
    async applyAllCrossCuttingConcerns(extension) {
        const extensionId = extension.extensionId;
        try {
            // 1. 协调关注点：与相关模块建立协调关系
            if (extension.contextId) {
                await this.coordinateWithModule(extensionId, 'context', extension.contextId);
            }
            // 2. 性能关注点：开始性能跟踪
            await this.trackExtensionPerformance(extensionId, {
                timestamp: new Date().toISOString(),
                operation: 'initialization',
                metrics: extension.performanceMetrics
            });
            // 3. 安全关注点：验证安全配置
            await this.validateExtensionSecurity(extensionId, extension.security);
            // 4. 协议版本关注点：验证协议版本
            await this.validateExtensionProtocolVersion(extensionId, extension.protocolVersion);
            // 5. 事件总线关注点：发布扩展创建事件
            await this.publishExtensionEvent(extensionId, {
                eventType: 'extension.created',
                extensionId,
                contextId: extension.contextId,
                extensionType: extension.extensionType,
                timestamp: new Date().toISOString()
            });
            // 6. 状态同步关注点：同步初始状态
            await this.syncExtensionState(extensionId, {
                status: extension.status,
                version: extension.version,
                timestamp: extension.timestamp
            });
            // 记录成功应用横切关注点
            // console.log(`[Extension ${extensionId}] All cross-cutting concerns applied successfully`);
        }
        catch (error) {
            // 7. 错误处理关注点：处理应用过程中的错误
            await this.handleExtensionError(extensionId, error);
            throw error;
        }
    }
    /**
     * 移除扩展的所有横切关注点
     * @param extensionId - 扩展ID
     */
    async removeAllCrossCuttingConcerns(extensionId) {
        try {
            // 1. 发布扩展删除事件
            await this.publishExtensionEvent(extensionId, {
                eventType: 'extension.deleted',
                extensionId,
                timestamp: new Date().toISOString()
            });
            // 2. 清理性能跟踪
            await this.trackExtensionPerformance(extensionId, {
                timestamp: new Date().toISOString(),
                operation: 'cleanup',
                final: true
            });
            // 记录成功移除横切关注点
            // console.log(`[Extension ${extensionId}] All cross-cutting concerns removed successfully`);
        }
        catch (error) {
            await this.handleExtensionError(extensionId, error);
            throw error;
        }
    }
    // ============================================================================
    // 横切关注点私有方法 (预留接口模式)
    // ============================================================================
    /**
     * 协调扩展与其他MPLP模块 (预留接口)
     */
    async coordinateWithModule(_extensionId, _targetModule, _targetId) {
        // TODO: 等待CoreOrchestrator激活协调管理器
        // console.log(`[Extension] Coordination with ${targetModule} will be activated by CoreOrchestrator`);
    }
    /**
     * 跟踪扩展性能 (预留接口)
     */
    async trackExtensionPerformance(_extensionId, _metrics) {
        // TODO: 等待CoreOrchestrator激活性能管理器
        // console.log(`[Extension ${extensionId}] Performance tracking will be activated by CoreOrchestrator`);
    }
    /**
     * 验证扩展安全配置 (预留接口)
     */
    async validateExtensionSecurity(_extensionId, _securityConfig) {
        // TODO: 等待CoreOrchestrator激活安全管理器
        // console.log(`[Extension ${extensionId}] Security validation will be activated by CoreOrchestrator`);
        return true; // 临时返回true
    }
    /**
     * 验证扩展协议版本 (预留接口)
     */
    async validateExtensionProtocolVersion(_extensionId, _version) {
        // TODO: 等待CoreOrchestrator激活协议版本管理器
        // console.log(`[Extension ${extensionId}] Protocol version validation will be activated by CoreOrchestrator`);
        return true; // 临时返回true
    }
    /**
     * 发布扩展事件 (预留接口)
     */
    async publishExtensionEvent(_extensionId, _event) {
        // TODO: 等待CoreOrchestrator激活事件总线管理器
        // console.log(`[Extension ${extensionId}] Event publishing will be activated by CoreOrchestrator`);
    }
    /**
     * 同步扩展状态 (预留接口)
     */
    async syncExtensionState(_extensionId, _state) {
        // TODO: 等待CoreOrchestrator激活状态同步管理器
        // console.log(`[Extension ${extensionId}] State synchronization will be activated by CoreOrchestrator`);
    }
    /**
     * 处理扩展错误 (预留接口)
     */
    async handleExtensionError(_extensionId, _error) {
        // TODO: 等待CoreOrchestrator激活错误处理管理器
        // console.error(`[Extension ${extensionId}] Error handling will be activated by CoreOrchestrator:`, error.message);
    }
    // ============================================================================
    // 核心业务操作
    // ============================================================================
    /**
     * 创建扩展
     * @param request - 创建扩展请求
     * @returns Promise<ExtensionEntityData> - 创建的扩展数据
     */
    async createExtension(request) {
        // 验证扩展名称唯一性
        const nameExists = await this.extensionRepository.nameExists(request.name);
        if (nameExists) {
            throw new Error(`Extension with name '${request.name}' already exists`);
        }
        // 生成扩展ID
        const extensionId = this.generateExtensionId();
        // 创建扩展实体数据
        const extensionData = {
            protocolVersion: '1.0.0',
            timestamp: new Date().toISOString(),
            extensionId,
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            version: request.version,
            extensionType: request.extensionType,
            status: 'installed',
            compatibility: request.compatibility,
            configuration: request.configuration,
            extensionPoints: request.extensionPoints || [],
            apiExtensions: request.apiExtensions || [],
            eventSubscriptions: request.eventSubscriptions || [],
            lifecycle: this.createInitialLifecycle(),
            security: request.security,
            metadata: request.metadata,
            auditTrail: this.createInitialAuditTrail(),
            performanceMetrics: this.createInitialPerformanceMetrics(),
            monitoringIntegration: this.createInitialMonitoringIntegration(),
            versionHistory: this.createInitialVersionHistory(request.version),
            searchMetadata: this.createInitialSearchMetadata(request),
            eventIntegration: this.createInitialEventIntegration()
        };
        // 创建扩展实体进行业务验证
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        // 持久化扩展
        const createdExtension = await this.extensionRepository.create(extensionEntity.toData());
        // TODO: 发布扩展创建事件
        // await this.eventBus.publish('extension.created', { extensionId, contextId: request.contextId });
        return createdExtension;
    }
    /**
     * 获取扩展
     * @param extensionId - 扩展ID
     * @returns Promise<ExtensionEntityData | null> - 扩展数据或null
     */
    async getExtensionById(extensionId) {
        return await this.extensionRepository.findById(extensionId);
    }
    /**
     * 更新扩展
     * @param request - 更新扩展请求
     * @returns Promise<ExtensionEntityData> - 更新后的扩展数据
     */
    async updateExtension(request) {
        // 获取现有扩展
        const existingExtension = await this.extensionRepository.findById(request.extensionId);
        if (!existingExtension) {
            throw new Error(`Extension with ID '${request.extensionId}' not found`);
        }
        // 创建扩展实体
        const extensionEntity = new extension_entity_1.ExtensionEntity(existingExtension);
        // 应用更新
        const updatedData = { ...existingExtension };
        if (request.displayName !== undefined) {
            updatedData.displayName = request.displayName;
        }
        if (request.description !== undefined) {
            updatedData.description = request.description;
        }
        if (request.configuration) {
            extensionEntity.updateConfiguration(request.configuration);
            updatedData.configuration = extensionEntity.toData().configuration;
        }
        if (request.extensionPoints) {
            // TODO: 实现扩展点更新逻辑
        }
        // 持久化更新
        const updatedExtension = await this.extensionRepository.update(request.extensionId, updatedData);
        // TODO: 发布扩展更新事件
        // await this.eventBus.publish('extension.updated', { extensionId: request.extensionId });
        return updatedExtension;
    }
    /**
     * 删除扩展
     * @param extensionId - 扩展ID
     * @returns Promise<boolean> - 是否删除成功
     */
    async deleteExtension(extensionId) {
        // 检查扩展是否存在
        const extension = await this.extensionRepository.findById(extensionId);
        if (!extension) {
            return false; // 扩展不存在，返回false而不是抛出错误
        }
        // 检查扩展是否可以删除（不能删除活动状态的扩展）
        if (extension.status === 'active') {
            throw new Error('Cannot delete active extension. Please deactivate first.');
        }
        // 删除扩展
        const deleted = await this.extensionRepository.delete(extensionId);
        if (deleted) {
            // TODO: 发布扩展删除事件
            // await this.eventBus.publish('extension.deleted', { extensionId });
        }
        return deleted;
    }
    // ============================================================================
    // 扩展生命周期管理
    // ============================================================================
    /**
     * 激活扩展
     * @param request - 激活请求
     * @returns Promise<boolean> - 是否激活成功
     */
    async activateExtension(request) {
        // 获取扩展
        const extensionData = await this.extensionRepository.findById(request.extensionId);
        if (!extensionData) {
            throw new Error(`Extension with ID '${request.extensionId}' not found`);
        }
        // 创建扩展实体
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        // 激活扩展
        const activated = extensionEntity.activate(request.userId);
        if (activated) {
            // 持久化状态变更
            await this.extensionRepository.update(request.extensionId, extensionEntity.toData());
            // TODO: 发布扩展激活事件
            // await this.eventBus.publish('extension.activated', { extensionId: request.extensionId });
        }
        return activated;
    }
    /**
     * 停用扩展
     * @param extensionId - 扩展ID
     * @param userId - 操作用户ID
     * @returns Promise<boolean> - 是否停用成功
     */
    async deactivateExtension(extensionId, userId) {
        // 获取扩展
        const extensionData = await this.extensionRepository.findById(extensionId);
        if (!extensionData) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        // 创建扩展实体
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        // 停用扩展
        const deactivated = extensionEntity.deactivate(userId);
        if (deactivated) {
            // 持久化状态变更
            await this.extensionRepository.update(extensionId, extensionEntity.toData());
            // TODO: 发布扩展停用事件
            // await this.eventBus.publish('extension.deactivated', { extensionId });
        }
        return deactivated;
    }
    /**
     * 更新扩展版本
     * @param extensionId - 扩展ID
     * @param newVersion - 新版本号
     * @param changelog - 变更日志
     * @param userId - 操作用户ID
     * @returns Promise<ExtensionEntityData> - 更新后的扩展数据
     */
    async updateExtensionVersion(extensionId, newVersion, changelog, userId) {
        // 获取扩展
        const extensionData = await this.extensionRepository.findById(extensionId);
        if (!extensionData) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        // 创建扩展实体
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        // 更新版本
        extensionEntity.updateVersion(newVersion, changelog, userId);
        // 持久化更新
        const updatedExtension = await this.extensionRepository.update(extensionId, extensionEntity.toData());
        // TODO: 发布版本更新事件
        // await this.eventBus.publish('extension.version_updated', { extensionId, newVersion });
        return updatedExtension;
    }
    // ============================================================================
    // 查询操作
    // ============================================================================
    /**
     * 查询扩展
     * @param filter - 查询过滤器
     * @param pagination - 分页参数
     * @param sort - 排序参数
     * @returns Promise<ExtensionQueryResult> - 查询结果
     */
    async queryExtensions(filter, pagination, sort) {
        return await this.extensionRepository.findByFilter(filter, pagination, sort);
    }
    /**
     * 根据上下文ID获取扩展
     * @param contextId - 上下文ID
     * @returns Promise<ExtensionEntityData[]> - 扩展数组
     */
    async getExtensionsByContextId(contextId) {
        return await this.extensionRepository.findByContextId(contextId);
    }
    /**
     * 根据类型获取扩展
     * @param extensionType - 扩展类型
     * @param status - 可选的状态过滤
     * @returns Promise<ExtensionEntityData[]> - 扩展数组
     */
    async getExtensionsByType(extensionType, status) {
        return await this.extensionRepository.findByType(extensionType, status);
    }
    /**
     * 获取活动扩展
     * @param contextId - 可选的上下文ID过滤
     * @returns Promise<ExtensionEntityData[]> - 活动扩展数组
     */
    async getActiveExtensions(contextId) {
        return await this.extensionRepository.findActiveExtensions(contextId);
    }
    /**
     * 搜索扩展
     * @param searchTerm - 搜索词
     * @param searchFields - 搜索字段
     * @param pagination - 分页参数
     * @returns Promise<ExtensionQueryResult> - 搜索结果
     */
    async searchExtensions(searchTerm, searchFields, pagination) {
        return await this.extensionRepository.search(searchTerm, searchFields, pagination);
    }
    // ============================================================================
    // 统计和监控操作
    // ============================================================================
    /**
     * 获取扩展数量
     * @param filter - 可选的过滤条件
     * @returns Promise<number> - 扩展数量
     */
    async getExtensionCount(filter) {
        return await this.extensionRepository.count(filter);
    }
    /**
     * 检查扩展是否存在
     * @param extensionId - 扩展ID
     * @returns Promise<boolean> - 是否存在
     */
    async extensionExists(extensionId) {
        return await this.extensionRepository.exists(extensionId);
    }
    /**
     * 获取扩展统计信息
     * @param filter - 可选的过滤条件
     * @returns Promise<ExtensionStatistics> - 统计信息
     */
    async getExtensionStatistics(filter) {
        return await this.extensionRepository.getStatistics(filter);
    }
    /**
     * 更新扩展性能指标
     * @param extensionId - 扩展ID
     * @param metrics - 性能指标
     * @returns Promise<void>
     */
    async updatePerformanceMetrics(extensionId, metrics) {
        await this.extensionRepository.updatePerformanceMetrics(extensionId, metrics);
    }
    // ============================================================================
    // 批量操作
    // ============================================================================
    /**
     * 批量创建扩展
     * @param requests - 创建请求数组
     * @returns Promise<BatchOperationResult> - 批量操作结果
     */
    async createExtensionBatch(requests) {
        const extensions = [];
        for (const request of requests) {
            try {
                // 验证和准备扩展数据
                const extensionData = await this.prepareExtensionData(request);
                extensions.push(extensionData);
            }
            catch (error) {
                // 记录错误但继续处理其他扩展
                // Failed to prepare extension data, continuing with other extensions
            }
        }
        return await this.extensionRepository.createBatch(extensions);
    }
    /**
     * 批量删除扩展
     * @param extensionIds - 扩展ID数组
     * @returns Promise<BatchOperationResult> - 批量操作结果
     */
    async deleteExtensionBatch(extensionIds) {
        return await this.extensionRepository.deleteBatch(extensionIds);
    }
    /**
     * 批量更新扩展状态
     * @param extensionIds - 扩展ID数组
     * @param status - 新状态
     * @returns Promise<BatchOperationResult> - 批量操作结果
     */
    async updateExtensionStatusBatch(extensionIds, status) {
        return await this.extensionRepository.updateStatusBatch(extensionIds, status);
    }
    // ============================================================================
    // 健康检查和监控
    // ============================================================================
    /**
     * 获取服务健康状态
     * @returns Promise<HealthStatus> - 健康状态
     */
    async getHealthStatus() {
        try {
            const stats = await this.extensionRepository.getStatistics();
            const recentExtensions = await this.extensionRepository.findRecentlyUpdatedExtensions(5);
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                details: {
                    service: 'ExtensionManagementService',
                    version: '1.0.0',
                    repository: {
                        status: 'operational',
                        extensionCount: stats.totalExtensions,
                        activeExtensions: stats.activeExtensions,
                        lastOperation: recentExtensions.length > 0 ? recentExtensions[0].timestamp : 'none'
                    },
                    performance: {
                        averageResponseTime: stats.averagePerformanceMetrics.responseTime,
                        totalExtensions: stats.totalExtensions,
                        errorRate: stats.averagePerformanceMetrics.errorRate
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    service: 'ExtensionManagementService',
                    version: '1.0.0',
                    repository: {
                        status: 'error',
                        extensionCount: 0,
                        activeExtensions: 0,
                        lastOperation: 'error'
                    },
                    performance: {
                        averageResponseTime: 0,
                        totalExtensions: 0,
                        errorRate: 1.0
                    }
                }
            };
        }
    }
    // ============================================================================
    // 私有辅助方法
    // ============================================================================
    /**
     * 生成扩展ID
     */
    generateExtensionId() {
        return `ext-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * 准备扩展数据
     */
    async prepareExtensionData(request) {
        const extensionId = this.generateExtensionId();
        return {
            protocolVersion: '1.0.0',
            timestamp: new Date().toISOString(),
            extensionId,
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            version: request.version,
            extensionType: request.extensionType,
            status: 'installed',
            compatibility: request.compatibility,
            configuration: request.configuration,
            extensionPoints: request.extensionPoints || [],
            apiExtensions: request.apiExtensions || [],
            eventSubscriptions: request.eventSubscriptions || [],
            lifecycle: this.createInitialLifecycle(),
            security: request.security,
            metadata: request.metadata,
            auditTrail: this.createInitialAuditTrail(),
            performanceMetrics: this.createInitialPerformanceMetrics(),
            monitoringIntegration: this.createInitialMonitoringIntegration(),
            versionHistory: this.createInitialVersionHistory(request.version),
            searchMetadata: this.createInitialSearchMetadata(request),
            eventIntegration: this.createInitialEventIntegration()
        };
    }
    // 创建初始化数据的辅助方法
    createInitialLifecycle() {
        return {
            installDate: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            activationCount: 0,
            errorCount: 0,
            performanceMetrics: {
                averageResponseTime: 0,
                throughput: 0,
                errorRate: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                lastMeasurement: new Date().toISOString()
            },
            healthCheck: {
                enabled: true,
                interval: 60000,
                timeout: 5000,
                expectedStatus: 200,
                healthyThreshold: 3,
                unhealthyThreshold: 3
            }
        };
    }
    createInitialAuditTrail() {
        return {
            events: [],
            complianceSettings: {
                retentionPeriod: 365,
                encryptionEnabled: true,
                accessLogging: true,
                dataClassification: 'internal'
            }
        };
    }
    createInitialPerformanceMetrics() {
        return {
            activationLatency: 0,
            executionTime: 0,
            memoryFootprint: 0,
            cpuUtilization: 0,
            networkLatency: 0,
            errorRate: 0,
            throughput: 0,
            availability: 1.0,
            efficiencyScore: 1.0,
            healthStatus: 'healthy',
            alerts: []
        };
    }
    createInitialMonitoringIntegration() {
        return {
            providers: [],
            endpoints: [],
            dashboards: [],
            alerting: {
                enabled: false,
                channels: [],
                rules: []
            }
        };
    }
    createInitialVersionHistory(version) {
        return {
            versions: [{
                    version,
                    releaseDate: new Date().toISOString(),
                    changelog: 'Initial version',
                    breaking: false,
                    deprecated: []
                }],
            autoVersioning: {
                enabled: false,
                strategy: 'semantic',
                prerelease: false,
                buildMetadata: false
            }
        };
    }
    createInitialSearchMetadata(_request) {
        return {
            indexedFields: ['name', 'displayName', 'description', 'keywords'],
            searchStrategies: [{
                    name: 'default',
                    type: 'fuzzy',
                    weight: 1.0,
                    fields: ['name', 'displayName', 'description']
                }],
            facets: [{
                    field: 'extensionType',
                    type: 'terms',
                    size: 10
                }]
        };
    }
    createInitialEventIntegration() {
        return {
            eventBus: {
                provider: 'custom',
                connectionString: '',
                topics: []
            },
            eventRouting: {
                rules: [],
                errorHandling: {
                    strategy: 'retry',
                    maxRetries: 3,
                    backoffStrategy: 'exponential'
                }
            },
            eventTransformation: {
                enabled: false,
                transformers: []
            }
        };
    }
    /**
     * 列出扩展
     * @param options - 查询选项
     * @returns Promise<{extensions: ExtensionEntityData[], totalCount: number, hasMore: boolean}> - 扩展列表
     */
    async listExtensions(options = {}) {
        try {
            // 获取所有扩展
            let extensions = await this.extensionRepository.findAll();
            // 应用过滤条件
            if (options.contextId) {
                extensions = extensions.filter((ext) => ext.contextId === options.contextId);
            }
            if (options.extensionType) {
                extensions = extensions.filter((ext) => ext.extensionType === options.extensionType);
            }
            if (options.status) {
                extensions = extensions.filter((ext) => ext.status === options.status);
            }
            const totalCount = extensions.length;
            // 应用分页
            const page = options.page || 1;
            const limit = options.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedExtensions = extensions.slice(startIndex, endIndex);
            return {
                extensions: paginatedExtensions,
                totalCount,
                hasMore: endIndex < totalCount
            };
        }
        catch (error) {
            throw new Error(`Failed to list extensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ExtensionManagementService = ExtensionManagementService;
//# sourceMappingURL=extension-management.service.js.map
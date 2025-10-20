"use strict";
/**
 * Extension模块适配器
 *
 * @description Extension模块的基础设施适配器，提供模块间通信和协调功能
 * @version 1.0.0
 * @layer Infrastructure层 - 适配器
 * @pattern 适配器模式 + 依赖注入 + 协议适配
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionModuleAdapter = void 0;
/**
 * Extension模块适配器实现
 */
class ExtensionModuleAdapter {
    constructor(extensionManagementService) {
        this.extensionManagementService = extensionManagementService;
    }
    /**
     * 创建扩展
     */
    async createExtension(request) {
        // 转换适配器层请求到服务层请求
        const serviceRequest = {
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            version: request.version,
            extensionType: request.extensionType,
            compatibility: request.compatibility || {
                mplpVersion: '1.0.0',
                requiredModules: [],
                dependencies: [],
                conflicts: []
            },
            configuration: request.configuration || {
                schema: {},
                currentConfig: {},
                defaultConfig: {},
                validationRules: []
            },
            security: request.security || {
                sandboxEnabled: true,
                resourceLimits: {
                    maxMemory: 512,
                    maxCpu: 50,
                    maxFileSize: 100,
                    maxNetworkConnections: 10,
                    allowedDomains: [],
                    blockedDomains: [],
                    allowedHosts: [],
                    allowedPorts: [],
                    protocols: ['https']
                },
                codeSigning: {
                    required: false,
                    trustedSigners: [],
                    verificationEndpoint: undefined
                },
                permissions: {
                    fileSystem: { read: [], write: [], execute: [] },
                    network: { allowedHosts: [], allowedPorts: [], protocols: [] },
                    database: { read: [], write: [], admin: [] },
                    api: { endpoints: [], methods: [], rateLimit: 100 }
                }
            },
            metadata: request.metadata || {
                author: { name: 'Unknown' },
                license: { type: 'MIT' },
                keywords: [],
                category: 'general',
                screenshots: []
            }
        };
        return await this.extensionManagementService.createExtension(serviceRequest);
    }
    /**
     * 获取扩展
     */
    async getExtension(extensionId) {
        return await this.extensionManagementService.getExtensionById(extensionId);
    }
    /**
     * 更新扩展
     */
    async updateExtension(extensionId, updates) {
        // 转换适配器层更新到服务层更新
        const serviceRequest = {
            extensionId,
            displayName: updates.displayName,
            description: updates.description,
            configuration: updates.configuration,
            metadata: updates.metadata
        };
        return await this.extensionManagementService.updateExtension(serviceRequest);
    }
    /**
     * 删除扩展
     */
    async deleteExtension(extensionId) {
        return await this.extensionManagementService.deleteExtension(extensionId);
    }
    /**
     * 激活扩展
     */
    async activateExtension(extensionId) {
        const activationRequest = {
            extensionId,
            force: false
        };
        const result = await this.extensionManagementService.activateExtension(activationRequest);
        return result !== null;
    }
    /**
     * 停用扩展
     */
    async deactivateExtension(extensionId) {
        const result = await this.extensionManagementService.deactivateExtension(extensionId);
        return result !== null;
    }
    /**
     * 列出扩展
     */
    async listExtensions(options) {
        // 使用分页参数调用服务
        const result = await this.extensionManagementService.queryExtensions({
            extensionType: options.extensionType,
            status: options.status,
            contextId: options.contextId
        }, {
            page: options.page,
            limit: options.limit || 10,
            offset: ((options.page || 1) - 1) * (options.limit || 10)
        });
        return {
            extensions: result.extensions,
            totalCount: result.total,
            hasMore: result.hasMore || false,
            nextPage: result.hasMore ? (options.page || 1) + 1 : undefined
        };
    }
    /**
     * 查询扩展
     */
    async queryExtensions(criteria) {
        const result = await this.extensionManagementService.queryExtensions({
            extensionType: criteria.extensionType,
            status: criteria.status,
            name: criteria.name,
            category: criteria.category
        });
        return result.extensions;
    }
    /**
     * 获取活跃扩展
     */
    async getActiveExtensions(contextId) {
        return await this.extensionManagementService.getActiveExtensions(contextId);
    }
    /**
     * 根据类型获取扩展
     */
    async getExtensionsByType(extensionType) {
        const result = await this.extensionManagementService.queryExtensions({
            extensionType
        });
        return result.extensions;
    }
    /**
     * 获取健康状态
     */
    async getHealthStatus() {
        const healthStatus = await this.extensionManagementService.getHealthStatus();
        return {
            status: healthStatus.status,
            timestamp: healthStatus.timestamp,
            checks: healthStatus.details?.repository ? [{
                    name: 'repository',
                    status: 'pass',
                    message: `Repository status: ${healthStatus.details.repository.status}`,
                    duration: 0
                }] : [],
            metrics: {
                totalExtensions: healthStatus.details?.repository?.extensionCount || 0,
                activeExtensions: healthStatus.details?.repository?.activeExtensions || 0,
                errorCount: 0,
                averageResponseTime: healthStatus.details?.performance?.averageResponseTime || 0
            }
        };
    }
    /**
     * 获取性能指标
     */
    async getPerformanceMetrics() {
        // TODO: 实现性能指标收集
        return {
            activationLatency: 100,
            memoryUsage: 50000000,
            cpuUsage: 25,
            networkRequests: 10,
            errorRate: 0,
            throughput: 1000,
            responseTime: 50,
            healthStatus: 'healthy',
            alerts: []
        };
    }
}
exports.ExtensionModuleAdapter = ExtensionModuleAdapter;
//# sourceMappingURL=extension-module.adapter.js.map
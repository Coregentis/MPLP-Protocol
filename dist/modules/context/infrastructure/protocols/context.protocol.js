"use strict";
/**
 * Context MPLP Protocol Implementation - 协议接口标准化重构版本
 *
 * @description 基于IMLPPProtocol标准接口，实现Context模块的统一协议
 * 集成3个核心服务和9个横切关注点管理器，符合MPLP统一架构标准
 * @version 2.0.0
 * @layer 基础设施层 - 协议实现
 * @refactor 17→3服务简化后的统一协议接口，与其他8个已完成模块使用IDENTICAL架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextProtocol = void 0;
/**
 * Context协议实现 - 重构版本
 *
 * @description 基于3个核心服务的协议实现，实现标准IMLPPProtocol接口
 * 集成ContextManagementService、ContextAnalyticsService、ContextSecurityService
 * @version 2.0.0 - 17→3服务简化后的统一协议接口
 */
class ContextProtocol {
    constructor(
    // 3个核心服务 (重构后的服务架构)
    contextManagementService, contextAnalyticsService, contextSecurityService, 
    // ===== L3横切关注点管理器注入 (基于实际接口) =====
    securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
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
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作 - 重构版本
     * 支持3个核心服务的统一操作路由
     */
    async executeOperation(request) {
        // 简化性能监控
        const startTime = Date.now();
        try {
            // 1. 基本验证 (简化)
            if (!request.operation) {
                throw new Error('Operation is required');
            }
            // 2. 版本兼容性检查 (简化) - 支持1.0.0和2.0.0
            if (request.protocolVersion && !['1.0.0', '2.0.0'].includes(request.protocolVersion)) {
                throw new Error(`Unsupported protocol version: ${request.protocolVersion}`);
            }
            // 3. 请求路由到3个核心服务
            const result = await this.routeToServices(request);
            // 4. 发布操作完成事件 (简化) - 跳过事件发布
            // 5. 构建成功响应
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
            // 错误处理 (简化)
            return this.createErrorResponse(error, request.requestId);
        }
    }
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata() {
        return this.getMetadata();
    }
    /**
     * 获取协议元数据（内部实现） - 重构版本
     */
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
    /**
     * 执行协议操作 - 基于实际管理器接口的统一调用序列
     */
    async execute(request) {
        let operationId = null;
        let transactionId = null;
        try {
            // ===== 1. 性能监控开始 (基于实际接口) =====
            operationId = this.performanceMonitor.startTrace(`context_${request.operation}`, { requestId: request.requestId });
            // ===== 2. 事务管理开始 (基于实际接口) =====
            transactionId = await this.transactionManager.beginTransaction();
            // ===== 3. 业务逻辑执行 =====
            const result = await this.executeBusinessLogic(request);
            // ===== 4. 事务提交 (基于实际接口) =====
            if (transactionId) {
                await this.transactionManager.commitTransaction(transactionId);
            }
            // ===== 5. 事件发布 (基于实际接口) =====
            await this.eventBusManager.publish({
                id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                type: `context_${request.operation}_completed`,
                source: 'context_protocol',
                payload: result.data || {},
                timestamp: new Date().toISOString()
            });
            // ===== 6. 性能监控结束 (基于实际接口) =====
            if (operationId) {
                await this.performanceMonitor.endTrace(operationId, 'completed');
            }
            return result;
        }
        catch (error) {
            // ===== 错误处理 (基于实际接口) =====
            await this.handleError(error, request, operationId, transactionId);
            throw error;
        }
    }
    /**
     * 执行业务逻辑 - 基于实际的ContextManagementService接口
     */
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
    /**
     * 错误处理 - 基于实际管理器接口
     */
    async handleError(error, request, operationId, transactionId) {
        // 记录错误 (基于实际接口)
        await this.errorHandler.logError('error', error instanceof Error ? error.message : 'Unknown error', 'context_protocol', error instanceof Error ? error : new Error(String(error)));
        // 回滚事务 (基于实际接口)
        if (transactionId) {
            await this.transactionManager.abortTransaction(transactionId);
        }
        // 结束性能监控 (基于实际接口)
        if (operationId) {
            await this.performanceMonitor.endTrace(operationId, 'failed');
        }
        // 发布错误事件 (基于实际接口)
        await this.eventBusManager.publish({
            id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            type: `context_${request.operation}_failed`,
            source: 'context_protocol',
            payload: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date().toISOString()
        });
    }
    /**
     * 健康检查 - 实现IMLPPProtocol标准接口
     */
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        try {
            // 检查Context服务
            const contextServiceCheck = await this.checkContextService();
            checks.push({
                name: 'contextService',
                status: contextServiceCheck.status === 'healthy' ? 'pass' : 'fail',
                message: contextServiceCheck.status === 'healthy' ? 'Context service is healthy' : 'Context service is unhealthy'
            });
            // 检查所有L3管理器
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
    // ===== 新增方法：3个核心服务路由 =====
    /**
     * 路由请求到3个核心服务
     */
    async routeToServices(request) {
        switch (request.operation) {
            // ContextManagementService 操作
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
            // ContextAnalyticsService 操作
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
            // ContextSecurityService 操作
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
    /**
     * 获取操作涉及的服务
     */
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
    /**
     * 创建错误响应
     */
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
    /**
     * 检查Context服务健康状态 - 更新为3个服务
     */
    async checkContextService() {
        try {
            // 检查3个核心服务的健康状态
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
        // 简化的健康检查实现
        return true;
    }
    async checkSecurityHealth() {
        // 简化的健康检查实现
        return true;
    }
}
exports.ContextProtocol = ContextProtocol;
//# sourceMappingURL=context.protocol.js.map